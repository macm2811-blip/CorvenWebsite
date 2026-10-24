"use client";
import {useState} from "react";
import Image from "next/image";
import type {LmsStudent} from "@/lib/lms/types";
import {LearningViewer} from "@/components/learning-viewer";
import {CoursePlayer} from "./course-player";
import {studentCourseAction} from "./student-actions";
import {studentPreviewAction,createSampleStudentsAction} from "./student-preview-actions";
import {CEFR_LEVELS} from "@/lib/lms/learning-path";
import styles from "./student-workspace.module.css";

export function AdminStudentPreview({organizationId,students}:{organizationId:string;students:LmsStudent[]}) {
 const [studentId,setStudentId]=useState(""),[data,setData]=useState<Awaited<ReturnType<typeof studentPreviewAction>>|null>(null),[course,setCourse]=useState<Awaited<ReturnType<typeof studentCourseAction>>|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(""),[view,setView]=useState("home");
 const selected=students.find(s=>s.id===studentId);
 async function open(){setBusy(true);setError("");try{setData(await studentPreviewAction(organizationId,studentId));setView("home");}catch(e){setError(e instanceof Error?e.message:"Unable to preview.");}finally{setBusy(false);}}
 return <section className={styles.panel} style={{marginBottom:20}}>
   <h2>Explore student experiences</h2><p>Preview a student as an administrator. Previewing never changes their progress, grades or payments.</p>
   <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"end"}}><label>Student<select value={studentId} onChange={e=>setStudentId(e.target.value)}><option value="">Choose a student</option>{students.map(s=><option key={s.id} value={String(s.id)}>{s.name}{s.isSample?" · Sample":""} · {s.progress}%</option>)}</select></label><button disabled={!studentId||busy} onClick={()=>void open()}>View student experience</button><button disabled={busy} onClick={async()=>{setBusy(true);setError("");try{await createSampleStudentsAction(organizationId);window.location.reload();}catch(e){setError(e instanceof Error?e.message:"Unable to prepare samples.");setBusy(false);}}}>{busy?"Preparing…":"Add 3 sample students"}</button></div>
   <small>Samples use fictitious identities, have no login passwords and send no invitations. Their payment statuses are examples; no payment transactions are created.</small>
   {error&&<p role="alert">{error}</p>}
   {data&&selected&&!course&&<LearningViewer title={`Student preview · ${selected.name}`} onClose={()=>setData(null)}><div className={styles.workspace}>
    <p className={styles.previewNotice}>Administrator preview · read only {data.membership.is_sample?"· Sample data":""}</p>
    <div className={styles.heading}><div><small>{data.membership.plan_name||"ENGLISH LEARNING PLAN"}</small><h1>Hello, {selected.name.split(" ")[0]}.</h1></div><Image src="/brand/level-up/mark-transparent.png" alt="Level Up" width={60} height={50} /></div>
    <nav className={styles.previewTabs} aria-label="Student preview navigation">{["home","courses","path","payments"].map(v=><button key={v} aria-pressed={view===v} onClick={()=>setView(v)}>{({home:"Home",courses:"My courses",path:"My learning path",payments:"Payments"})[v]}</button>)}</nav>
    {view==="payments"?<section className={styles.panel}><h2>My payments</h2><p>Status: <strong>{data.membership.payment_status}</strong></p><p>Next due: {data.membership.billing_due_date||"Contact your academy"}</p><p>Group: {data.membership.group_name||"Not assigned"}</p>{data.membership.is_sample&&<p>This is a sample billing status. No funds or financial entries are involved.</p>}</section>:<>
    {view==="path"&&<><h2>My learning path · A1 → C1</h2><div className={styles.timelineScroll}><div className={styles.timeline}>{CEFR_LEVELS.map((level,i)=><div key={level} style={{flex:1,textAlign:"center",position:"relative"}}><span className={styles.milestoneDot} style={{margin:"0 auto 12px"}}>{i+1}</span><strong>{level}</strong><p>{(i+1)*20}% milestone</p></div>)}</div></div></>}
    <h2>{view==="home"?"Continue learning":"My courses"}</h2><div className={styles.cards}>{data.courses.map(c=><article className={styles.panel} key={c.course_id}><small>{c.courses.level}</small><h3>{c.courses.title}</h3><p>{c.progress}% completed</p><progress value={c.progress} max={100}/><button disabled={busy} onClick={async()=>{setBusy(true);setError("");try{setCourse(await studentCourseAction(organizationId,c.course_id,studentId));}catch(e){setError(e instanceof Error?e.message:"Unable to open unit.");}finally{setBusy(false);}}}>Continue lesson →</button></article>)}</div></>}
    {error&&<p role="alert">{error}</p>}
   </div></LearningViewer>}
   {course&&<CoursePlayer key={course.course.id} organizationId={organizationId} data={course} preview onClose={()=>setCourse(null)} onUpdate={setCourse}/>}
 </section>;
}
