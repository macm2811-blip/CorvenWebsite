"use client";
import {useState} from "react";
import type {LmsStudent,LmsCourse} from "@/lib/lms/types";
import type {academyOperationsAction} from "./student-actions";
import {useAcademyFeatures} from "./student-features";
import {AcademyReviewPanel} from "./academy-review-panel";
import {LearningViewer} from "@/components/learning-viewer";
import styles from "./academy-dashboard.module.css";

export function AcademyDashboard({organizationId,students,courses,operations,onNavigate,error}:{organizationId:string;students:LmsStudent[];courses:LmsCourse[];operations:Awaited<ReturnType<typeof academyOperationsAction>>|null;onNavigate:(view:"students"|"courses"|"sessions"|"income"|"support")=>void;error:string}) {
 const {data,error:reviewError}=useAcademyFeatures(organizationId);
 const [review,setReview]=useState<"assessments"|"homework"|"referrals"|null>(null);
 const [now]=useState(()=>Date.now());
 const sessions=operations?.sessions.filter(s=>s.status!=="cancelled"&&new Date(s.starts_at).getTime()>=now).sort((a,b)=>a.starts_at.localeCompare(b.starts_at));
 const tiles=[{label:"Active students",value:students.filter(s=>s.active).length,detail:"Manage students & plans",mark:"01",go:()=>onNavigate("students")},{label:"Published courses",value:courses.filter(c=>c.published).length,detail:"Create & assign courses",mark:"02",go:()=>onNavigate("courses")},{label:"Upcoming classes",value:sessions?.length??"…",detail:"Open your class schedule",mark:"03",go:()=>onNavigate("sessions")},{label:"Recorded payments",value:operations?.payments.filter(p=>p.status==="paid").length??"…",detail:"Review payments & income",mark:"04",go:()=>onNavigate("income")}];
 return <div className={styles.dashboard}><header><div><small>YOUR ACADEMY AT A GLANCE</small><h1>Academy overview</h1></div><button type="button" onClick={()=>onNavigate("students")}>Manage students</button></header>{(error||reviewError)&&<p role="alert">{error||reviewError}</p>}<div className={styles.metrics}>{tiles.map(t=><button key={t.label} type="button" onClick={t.go}><span className={styles.mark}>{t.mark}</span><strong>{t.value}</strong><h2>{t.label}</h2><span>{t.detail}</span></button>)}</div><h2 className={styles.sectionTitle}>Needs your attention</h2><div className={styles.actions}>
 <button type="button" onClick={()=>onNavigate("income")}><strong>{data?.reports.filter(r=>r.status==="pending").length??"…"}</strong><span>Payment receipts</span><small>Review approvals</small></button>
 <button type="button" onClick={()=>setReview("assessments")}><strong>{data?.reviews.length??"…"}</strong><span>Assessments</span><small>Grade open responses</small></button>
 <button type="button" onClick={()=>setReview("homework")}><strong>{data?.submissions.filter(s=>s.status!=="reviewed").length??"…"}</strong><span>Homework</span><small>Review submissions</small></button>
 <button type="button" onClick={()=>setReview("referrals")}><strong>{data?.referrals.length??"…"}</strong><span>Friend referrals</span><small>View & follow up</small></button></div>
 <section className={styles.schedule}><header><h2>Next classes</h2><button type="button" onClick={()=>onNavigate("sessions")}>Manage classes</button></header>{!operations?<p>Loading your schedule…</p>:sessions?.length?sessions.slice(0,3).map(s=><button className={styles.session} type="button" key={s.id} onClick={()=>onNavigate("sessions")}><span>{new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",timeZone:"America/Costa_Rica"}).format(new Date(s.starts_at))}</span><strong>{s.title}</strong><small>{new Intl.DateTimeFormat("en-US",{hour:"numeric",minute:"2-digit",timeZone:"America/Costa_Rica"}).format(new Date(s.starts_at))}</small></button>):<button className={styles.empty} type="button" onClick={()=>onNavigate("sessions")}>Schedule your first class</button>}</section>
 {review&&<LearningViewer title={({assessments:"Assessment review",homework:"Homework review",referrals:"Friend referrals"})[review]} onClose={()=>setReview(null)}><AcademyReviewPanel organizationId={organizationId} students={students} mode={review}/></LearningViewer>}
 </div>;
}
