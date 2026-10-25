"use client";
import { useState } from "react";
import styles from "./student-plan-select.module.css";
import { STUDENT_PLANS } from "@/lib/lms/student-plans";

export function StudentPlanSelect({value,onChange,label="Plan",required=false,disabled=false,hideLabel=false}:{value:string;onChange:(value:string)=>void;label?:string;required?:boolean;disabled?:boolean;hideLabel?:boolean}) {
  const [custom,setCustom]=useState(Boolean(value && !STUDENT_PLANS.some(p=>p===value)));
  return <div className={`${styles.field} ${hideLabel?styles.compact:""}`}><label><span className={hideLabel?styles.srOnly:undefined}>{label}</span><select aria-label={label} disabled={disabled} required={required} value={custom?"custom":value} onChange={e=>{setCustom(e.target.value==="custom");onChange(e.target.value==="custom"?"":e.target.value);}}><option value="">Choose a plan</option>{STUDENT_PLANS.map(plan=><option key={plan}>{plan}</option>)}<option value="custom">Custom</option></select></label>{custom && <label>Custom plan<input aria-label={`Custom ${label.toLowerCase()}`} disabled={disabled} required maxLength={120} value={value} onChange={e=>onChange(e.target.value)} placeholder="e.g. 3 classes / week"/></label>}</div>;
}

export function StudentPlanEditor({value,onSave,name}:{value:string;name:string;onSave:(value:string)=>void|boolean|Promise<void|boolean>}) {
 const [draft,setDraft]=useState(value),[busy,setBusy]=useState(false),[error,setError]=useState("");
 return <div style={{display:"grid",gap:7,minWidth:180}}><StudentPlanSelect hideLabel label={`Plan for ${name}`} value={draft} onChange={setDraft} disabled={busy}/>{draft!==value&&<button type="button" disabled={busy||!draft.trim()} onClick={async()=>{setBusy(true);setError("");try{if(await onSave(draft.trim())===false)setError("Unable to save this plan.");}catch{setError("Unable to save this plan.");}finally{setBusy(false);}}}>{busy?"Saving…":"Save plan"}</button>}{error&&<small role="alert">{error}</small>}</div>;
}
