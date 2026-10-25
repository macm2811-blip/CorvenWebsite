"use client";
import { displayLabel } from "@/lib/lms/display-label";

import Image from "next/image";
import { CourseCover } from "@/components/course-cover";
import { LevelFolders } from "@/components/level-folders";
import { CoursePlayer } from "./course-player";
import { StudentPayments, LearningPaths, ReferFriend } from "./student-features";
import { useEffect, useState, type FormEvent } from "react";
import type { LmsCourse, LmsInitialData } from "@/lib/lms/types";
import { CourseVideo } from "@/components/course-video";
import { createTicketAction } from "./actions";
import {
  studentDashboardAction,
  studentCourseAction,
  readNotificationsAction,
} from "./student-actions";
import styles from "./student-workspace.module.css";

type Dashboard = Awaited<ReturnType<typeof studentDashboardAction>>;
type CourseData = Awaited<ReturnType<typeof studentCourseAction>>;
type View = "home" | "courses" | "sessions" | "billing" | "help" | "paths";
const date = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Costa_Rica",
  }).format(new Date(value));

export function StudentWorkspace({
  initialData,
  view,
  setView,
}: {
  initialData: LmsInitialData;
  view: View;
  setView: (view: View) => void;
}) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [course, setCourse] = useState<CourseData | null>(null);
  const [startLessonId,setStartLessonId]=useState<string|undefined>();
  const [activeLevel,setActiveLevel]=useState<string|null>(null);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const org = initialData.organizationId;
  useEffect(() => {
    let active = true;
    studentDashboardAction(org)
      .then((data) => {
        if (active) setDashboard(data);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [org]);
  function updateCourse(data: CourseData) { setCourse(data); setDashboard(current => current ? {...current, enrollments: current.enrollments.map(e => e.course_id === data.course.id ? {...e, progress:data.percentage} : e)} : current); }
  async function openCourse(item: LmsCourse) {
    setBusy(true);
    setError("");
    try {
      const data = await studentCourseAction(org, String(item.id));
      updateCourse(data);

    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to open the course.");
    } finally {
      setBusy(false);
    }
  }
  async function ticket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const result = await createTicketAction({
        organizationId: org,
        title: String(data.get("title")),
        description: String(data.get("description")),
        priority: "Media",
      });
      if (!result.ok) throw new Error(result.message);
      setDashboard(await studentDashboardAction(org));
      form.reset();
      setNotice("Your request was sent to the academy.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to send.");
    } finally {
      setBusy(false);
    }
  }
  const enrolled = new Set(dashboard?.enrollments.map((e) => e.course_id));
  const courses = initialData.courses.filter(
    (c) =>
      c.published &&
      enrolled.has(String(c.id)) &&
      `${c.title} ${c.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  const nextCourse = initialData.courses.find(c => c.published && enrolled.has(String(c.id)) && (dashboard?.enrollments.find(e=>e.course_id===c.id)?.progress ?? 0) > 0 && (dashboard?.enrollments.find(e=>e.course_id===c.id)?.progress ?? 0) < 100);
  const unread = dashboard?.notifications.filter((n) => !n.read_at).length ?? 0;
  return (
    <div className={styles.workspace}>
      <header className={styles.heading}>
        <div>
          <small>LEVEL UP ACADEMY{initialData.viewerStudentCode?` · ${initialData.viewerStudentCode}`:""}</small>
          <h1>
            {course
              ? course.course.title
              : view === "home"
                ? `Hello, ${initialData.viewerName.split(" ")[0]}.`
                : {
                    courses: "My courses",
                    sessions: "Live classes",
                    billing: "My payments",
                    help: "Help and support",
                    paths:"My learning path",
                  }[view]}
          </h1>
        </div>
        <button
          onClick={async () => {
            setShowNotifications(!showNotifications);
            if (!showNotifications) {
              try {
                await readNotificationsAction(org);
                setDashboard(await studentDashboardAction(org));
              } catch (e) {
                setError(
                  e instanceof Error
                    ? e.message
                    : "Unable to update notifications.",
                );
              }
            }
          }}
        >
          Notifications {unread > 0 ? `(${unread})` : ""}
        </button>
      </header>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className={styles.notice}>
          {notice}
        </p>
      )}
      {showNotifications && (
        <section className={styles.panel}>
          <h2>Notifications</h2>
          {dashboard?.notifications.length ? (
            dashboard.notifications.map((n) => (
              <article key={n.id}>
                <h3>{n.title}</h3>
                <p>{n.body}</p>
                <small>{date(n.created_at)}</small>
              </article>
            ))
          ) : (
            <p>You have no notifications.</p>
          )}
        </section>
      )}
      {!course&&view==="paths"&&<LearningPaths initialData={initialData} courses={courses} onOpen={openCourse}/>}

      {!dashboard && !error && (
        <p role="status">Loading your learning space…</p>
      )}
      {course ? (<CoursePlayer key={course.course.id} organizationId={org} data={course} startLessonId={startLessonId} onUpdate={updateCourse} onNextUnit={(()=>{const units=initialData.courses.filter(c=>c.published&&c.level.split(" · ")[0]===initialData.courses.find(c=>c.id===course.course.id)?.level.split(" · ")[0]);const next=units[units.findIndex(c=>c.id===course.course.id)+1];return next?()=>openCourse(next):undefined;})()} onClose={()=>{setCourse(null);setStartLessonId(undefined);}}/>) : (<>
          {(view === "home" || view === "courses") && (
            <>
              <div className={styles.welcome}>
                {view === "home" && (
                  <Image
                    src="/brand/level-up/mascot-wave-transparent.png"
                    width={1254}
                    height={1254}
                    alt=""
                  />
                )}
                <div>
                  <h2>
                    {view === "home"
                      ? "Your next step starts here"
                      : "Your English journey"}
                  </h2>
                  <p>
                    Choose your level, find your course, and pick up where you left off.
                  </p>
                  {view === "home" && nextCourse && <button className={styles.continueCta} disabled={busy} onClick={()=>void openCourse(nextCourse)}>Continue learning · {nextCourse.title}</button>}
                  <input
                    aria-label="Search my courses"
                    placeholder="Search for a course…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>
              {query.trim() && !courses.length && dashboard && <p role="status">No courses match your search. Try another name.</p>}
              {!activeLevel && !query.trim()?<LevelFolders levels={Array.from(new Set(courses.map(c=>c.level.split(" · ")[0]))).sort()} courses={courses} onOpen={setActiveLevel}/>:<><button onClick={()=>{setActiveLevel(null);setQuery("");}}>← All levels</button><h2>{query.trim() ? "Search results" : `${activeLevel} · Courses`}</h2><div className={styles.cards}>
                {courses.filter(c=>query.trim() || c.level.split(" · ")[0]===activeLevel).map((c) => {
                  const progress =
                    dashboard?.enrollments.find((e) => e.course_id === c.id)
                      ?.progress ?? 0;
                  return (
                    <article className={styles.courseCard} key={c.id}>
                      <CourseCover url={c.coverUrl} color={c.color} level={c.level.split(" · ")[0]} />
                      <div className={styles.courseCardBody}>
                      <h2>{c.title}</h2>
                      <p>{c.description}</p>
                      <div className={styles.courseMeta}><span>{c.lessons} lessons</span><strong>{progress}% complete</strong></div>
                      <progress aria-label={`Progress for ${c.title}`} max={100} value={progress} />
                      <button
                        disabled={busy}
                        onClick={() => void openCourse(c)}
                      >
                        {progress >= 100 ? "Review course" : progress > 0 ? "Continue learning" : "Start course"}
                      </button>
                      </div>
                    </article>
                  );
                })}
              </div>
              </>}
              {dashboard && !courses.length && (
                <section className={styles.panel}>
                  <h2>No courses available</h2>
                  <p>
                    Your academy needs to enroll you in a published course for it to
                    appear here.
                  </p>
                  <button onClick={() => setView("help")}>
                    Contact your academy
                  </button>
                </section>
              )}
            </>
          )}
          {view === "home" && <ReferFriend organizationId={org}/>}
          {(view === "sessions" || view === "home") && (
            <section className={styles.panel}>
              <h2>
                {view === "home"
                  ? "Upcoming classes"
                  : "Your classes and recordings"}
              </h2>
              {dashboard?.sessions.length ? (
                dashboard.sessions.map((s) => (
                  <article className={styles.session} key={s.id}>
                    <div>
                      <h3>{s.title}</h3>
                      <p>
                        {date(s.starts_at)} · {s.duration_minutes} minutes
                      </p>
                    </div>
                    <div>
                      {s.meeting_url &&
                        ["scheduled", "live"].includes(s.status) && (
                          <button onClick={()=>{window.open(s.meeting_url!,"_blank","noopener,noreferrer");const unit=initialData.courses.find(c=>c.id===s.course_id);if(unit){setStartLessonId(s.lesson_id??undefined);void openCourse(unit);}}}>Join class ↗</button>
                        )}
                      {s.recording_youtube_url && (
                        <CourseVideo
                          url={s.recording_youtube_url}
                          title={s.title}
                        />
                      )}
                    </div>
                  </article>
                ))
              ) : (
                  <div className={styles.emptyState}><span aria-hidden="true">◷</span><strong>No classes scheduled yet</strong><p>Schedules and links published by your academy will appear here.</p></div>
              )}
            </section>
          )}
          {view === "billing" && dashboard && <StudentPayments initialData={initialData} dashboard={dashboard} onRefresh={async()=>setDashboard(await studentDashboardAction(org))}/>}
          {view === "help" && (
            <>
              <section className={styles.panel}>
                <h2>Send a request to your academy</h2>
                <form onSubmit={ticket}>
                  <label>
                    Subject
                    <input
                      name="title"
                      required
                      minLength={2}
                      maxLength={180}
                    />
                  </label>
                  <label>
                    Describe your question
                    <textarea
                      name="description"
                      required
                      minLength={5}
                      maxLength={5000}
                    />
                  </label>
                  <button disabled={busy} type="submit">
                    {busy ? "Sending…" : "Send request"}
                  </button>
                </form>
              </section>
              <section className={styles.panel}>
                <h2>My requests</h2>
                {dashboard?.tickets.length ? (
                  dashboard.tickets.map((t) => (
                    <article key={t.id}>
                      <h3>{t.title}</h3>
                      <p>{t.description}</p>
                      <small>
                        {displayLabel(t.status)} · {date(t.created_at)}
                      </small>
                      {[...t.ticket_messages]
                        .sort((a, b) =>
                          a.created_at.localeCompare(b.created_at),
                        )
                        .map((m) => (
                          <blockquote key={m.id}>
                            {m.body}
                            <small>{date(m.created_at)}</small>
                          </blockquote>
                        ))}
                    </article>
                  ))
                ) : (
                  <p>You have not sent any requests.</p>
                )}
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}
