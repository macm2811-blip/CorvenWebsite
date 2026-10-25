"use client";

import {useEffect,useRef,useState,type FormEvent} from "react";
import {CourseCover} from "@/components/course-cover";
import type {LmsCourse} from "@/lib/lms/types";
import {localDateTimeInput,sessionStartIso} from "@/lib/lms/live-class-time";
import {loadCourseStudioAction} from "./actions";
import {saveSessionWithCoverAction,type academySessionsAction} from "./student-actions";
import styles from "./student-workspace.module.css";

type Session=Awaited<ReturnType<typeof academySessionsAction>>[number];
export function LiveClassForm({organizationId,courses,session,onSaved,onCancel}:{organizationId:string;courses:LmsCourse[];session:Session|null;onSaved:()=>Promise<void>;onCancel:()=>void}){
  const [courseId,setCourseId]=useState(session?.course_id??"");
  const [pages,setPages]=useState<{id:string;title:string}[]>([]);
  const [pagesLoading,setPagesLoading]=useState(Boolean(session?.course_id));
  const [pageError,setPageError]=useState("");
  const [lessonId,setLessonId]=useState(session?.lesson_id??"");
  const [preview,setPreview]=useState<string>();
  const [removeCover,setRemoveCover]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const input=useRef<HTMLInputElement>(null);
  const panel=useRef<HTMLElement>(null);
  useEffect(()=>{if(session)panel.current?.scrollIntoView({behavior:"smooth",block:"start"});},[session]);
  useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview);},[preview]);
  useEffect(()=>{
    let active=true;
    if(!courseId)return;
    loadCourseStudioAction({organizationId,courseId}).then(result=>{
      if(!active)return;
      if(!result.ok||!result.data)throw new Error(result.message||"Unable to load course pages.");
      setPages(result.data.blocks.filter(b=>b.kind!=="quiz"&&b.kind!=="exam"));
    }).catch(e=>{if(active)setPageError(e instanceof Error?e.message:"Unable to load course pages.");}).finally(()=>{if(active)setPagesLoading(false);});
    return()=>{active=false;};
  },[organizationId,courseId]);
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();const form=event.currentTarget;const values=new FormData(form);
    setBusy(true);setError("");
    try{
      values.set("organizationId",organizationId);
      values.set("startsAt",sessionStartIso(String(values.get("startsAt")??"")));
      values.set("removeCover",String(removeCover));
      if(session)values.set("id",session.id);
      await saveSessionWithCoverAction(values);
      form.reset();setPreview(undefined);setRemoveCover(false);setCourseId("");setLessonId("");setPages([]);
      await onSaved();
    }catch(e){setError(e instanceof Error?e.message:"Unable to save class. Your changes are still here.");}
    finally{setBusy(false);}
  }
  return <section ref={panel} className={styles.panel} style={{scrollMarginTop:90}}>
    <h2>{session?"Edit live class":"Schedule a class"}</h2>
    <form onSubmit={submit} key={session?.id??"new"}>
      <fieldset className={styles.classFields} disabled={busy}>
        <div className={styles.coverField}>
          <label htmlFor="live-class-cover">Class cover</label>
          <input ref={input} id="live-class-cover" name="cover" type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{
            const file=e.target.files?.[0];setError("");
            if(file&&(file.size>2*1024*1024||!["image/png","image/jpeg","image/webp"].includes(file.type))){setError("Choose a PNG, JPG or WEBP image up to 2 MB.");e.target.value="";setPreview(undefined);return;}
            setPreview(file?URL.createObjectURL(file):undefined);if(file)setRemoveCover(false);
          }}/>
          <small>PNG, JPG or WEBP · up to 2 MB · recommended 1600 × 900. Changes are applied when you save.</small>
          <div className={styles.coverPreview}><CourseCover url={preview??(!removeCover?session?.cover_url??undefined:undefined)}/></div>
          {(preview||(!removeCover&&session?.cover_url))&&<button type="button" onClick={()=>{if(input.current)input.current.value="";setPreview(undefined);setRemoveCover(true);}}>Use Level Up cover</button>}
        </div>
        <label>Title<input name="title" required minLength={2} maxLength={180} defaultValue={session?.title??""}/></label>
        <label>Course<select name="courseId" value={courseId} onChange={e=>{setCourseId(e.target.value);setPages([]);setLessonId("");setPageError("");setPagesLoading(Boolean(e.target.value));}}><option value="">Entire academy</option>{courses.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
        <label>Start page (optional)<select name="lessonId" value={lessonId} onChange={e=>setLessonId(e.target.value)} disabled={pagesLoading||!!pageError}><option value="">Continue at the student’s next page</option>{pages.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label>
        {pagesLoading&&<small>Loading course pages…</small>}{pageError&&<p role="alert" className={styles.error}>{pageError}</p>}
        <label>Date and time (your device time zone)<input name="startsAt" type="datetime-local" required defaultValue={session?localDateTimeInput(session.starts_at):""}/></label>
        <label>Duration in minutes<input name="duration" type="number" min={5} max={480} required defaultValue={session?.duration_minutes??60}/></label>
        <label>Teams, Zoom or Meet link<input name="meetingUrl" type="url" required placeholder="https://..." defaultValue={session?.meeting_url??""}/></label>
      </fieldset>
      {error&&<p role="alert" className={styles.error}>{error}</p>}
      <div className={styles.classActions}><button type="submit" disabled={busy||pagesLoading||!!pageError}>{busy?"Saving…":session?"Save changes":"Save class"}</button>{session&&<button type="button" disabled={busy} onClick={onCancel}>Cancel editing</button>}</div>
    </form>
  </section>;
}
