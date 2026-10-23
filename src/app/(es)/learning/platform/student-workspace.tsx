"use client";
import { displayLabel } from "@/lib/lms/display-label";

import Image from "next/image";
import { LearningViewer } from "@/components/learning-viewer";
import { useEffect, useState, type FormEvent, type CSSProperties } from "react";
import type { LmsCourse, LmsInitialData } from "@/lib/lms/types";
import { CourseVideo } from "@/components/course-video";
import { createTicketAction } from "./actions";
import {
  studentDashboardAction,
  studentCourseAction,
  recordLearningAction,
  readNotificationsAction,
} from "./student-actions";
import styles from "./student-workspace.module.css";

type Dashboard = Awaited<ReturnType<typeof studentDashboardAction>>;
type CourseData = Awaited<ReturnType<typeof studentCourseAction>>;
type View = "home" | "courses" | "sessions" | "billing" | "help";
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
  const [selected, setSelected] = useState("");
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
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
  async function openCourse(item: LmsCourse) {
    setBusy(true);
    setError("");
    try {
      const data = await studentCourseAction(org, String(item.id));
      setCourse(data);
      setSelected(
        data.lessons.find(
          (l) =>
            !data.progress.some((p) => p.lesson_id === l.id && p.completed),
        )?.id ??
          data.lessons[0]?.id ??
          data.quizzes[0]?.id ??
          "",
      );
      setAnswers({});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to open the course.");
    } finally {
      setBusy(false);
    }
  }
  async function save(quizId?: string) {
    if (!course) return;
    setBusy(true);
    setError("");
    try {
      const result = await recordLearningAction({
        organizationId: org,
        courseId: course.course.id,
        lessonId: quizId ? undefined : selected,
        quizId,
        answers,
      });
      setNotice(
        quizId
          ? `Result: ${result.score}% · ${result.passed ? "Passed" : "Not passed"}`
          : "Lesson completed. Progress saved.",
      );
      setCourse(await studentCourseAction(org, course.course.id));
      setDashboard(await studentDashboardAction(org));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save.");
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
  const unread = dashboard?.notifications.filter((n) => !n.read_at).length ?? 0;
  const lesson = course?.lessons.find((l) => l.id === selected);
  const quiz = course?.quizzes.find((q) => q.id === selected);
  const complete = course?.progress.some(
    (p) => p.lesson_id === selected && p.completed,
  );
  const go = (id: string) => {
    setSelected(id);
    setAnswers({});
    setNotice("");
  };
  return (
    <div className={styles.workspace}>
      <header className={styles.heading}>
        <div>
          <small>LEVEL UP ACADEMY</small>
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
      {!dashboard && !error && (
        <p role="status">Loading your learning space…</p>
      )}
      {course ? (<LearningViewer contentClassName={styles.workspace} title={course.course.title} onClose={() => { setCourse(null); setSelected(""); }}>
          <button
            onClick={() => {
              setCourse(null);
              setSelected("");
            }}
          >
            ← Back to my courses
          </button>
          <p>Course progress: {course.percentage}%</p>
          <progress max={100} value={course.percentage} />
          <div className={styles.reader}>
            <aside className={styles.panel} aria-label="Course content">
              {course.modules.map((m) => (
                <section key={m.id}>
                  <h3>{m.title}</h3>
                  {course.lessons
                    .filter((l) => l.module_id === m.id)
                    .map((l) => (
                      <button
                        className={l.id === selected ? styles.active : ""}
                        key={l.id}
                        onClick={() => go(l.id)}
                      >
                        {course.progress.some(
                          (p) => p.lesson_id === l.id && p.completed,
                        )
                          ? "✓ "
                          : ""}
                        {l.title}
                      </button>
                    ))}
                </section>
              ))}
              {course.quizzes.length > 0 && <h3>Assessments</h3>}
              {course.quizzes.map((q) => (
                <button key={q.id} onClick={() => go(q.id)}>
                  {course.attempts.some((a) => a.quiz_id === q.id && a.passed)
                    ? "✓ "
                    : ""}
                  {q.title}
                </button>
              ))}
            </aside>
            <main className={styles.panel}>
              {lesson ? (
                <>
                  <h2>{lesson.title}</h2>
                  <LessonContent lesson={lesson} />
                  <button
                    disabled={busy || complete}
                    onClick={() => void save()}
                  >
                    {complete
                      ? "✓ Completed"
                      : busy
                        ? "Saving…"
                        : "Mark as complete"}
                  </button>
                  {course.lessons.findIndex((l) => l.id === selected) <
                    course.lessons.length - 1 && (
                    <button
                      onClick={() =>
                        go(
                          course.lessons[
                            course.lessons.findIndex((l) => l.id === selected) +
                              1
                          ].id,
                        )
                      }
                    >
                      Next lesson →
                    </button>
                  )}
                </>
              ) : quiz ? (
                <>
                  <h2>{quiz.title}</h2>
                  <p>{quiz.description}</p>
                  <p>
                    Passing score: {quiz.passing_score}% · Attempts used:{" "}
                    {
                      course.attempts.filter((a) => a.quiz_id === quiz.id)
                        .length
                    }
                    /{quiz.max_attempts}
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void save(quiz.id);
                    }}
                  >
                    {course.questions
                      .filter((q) => q.quiz_id === quiz.id)
                      .map((q) => (
                        <fieldset key={q.id}>
                          <legend>{q.prompt}</legend>
                          {q.question_type === "short_answer" ? (
                            <input
                              aria-label={q.prompt}
                              required
                              value={String(answers[q.id] ?? "")}
                              onChange={(e) =>
                                setAnswers({
                                  ...answers,
                                  [q.id]: e.target.value,
                                })
                              }
                            />
                          ) : (
                            Array.isArray(q.options) &&
                            q.options.map((raw, index) => {
                              const option = String(raw);
                              return (
                                <label className={styles.option} key={index}>
                                  <input
                                    type={
                                      q.question_type === "multiple_choice"
                                        ? "checkbox"
                                        : "radio"
                                    }
                                    name={q.id}
                                    required={
                                      q.question_type !== "multiple_choice"
                                    }
                                    checked={
                                      Array.isArray(answers[q.id])
                                        ? (answers[q.id] as string[]).includes(
                                            option,
                                          )
                                        : answers[q.id] === option
                                    }
                                    onChange={(e) =>
                                      setAnswers((current) => ({
                                        ...current,
                                        [q.id]:
                                          q.question_type === "multiple_choice"
                                            ? e.target.checked
                                              ? [
                                                  ...(Array.isArray(
                                                    current[q.id],
                                                  )
                                                    ? (current[
                                                        q.id
                                                      ] as string[])
                                                    : []),
                                                  option,
                                                ]
                                              : (
                                                  (current[q.id] as string[]) ??
                                                  []
                                                ).filter((v) => v !== option)
                                            : option,
                                      }))
                                    }
                                  />
                                  {option}
                                </label>
                              );
                            })
                          )}
                        </fieldset>
                      ))}
                    <button
                      disabled={
                        busy ||
                        course.attempts.filter((a) => a.quiz_id === quiz.id)
                          .length >= quiz.max_attempts ||
                        !course.questions.some((q) => q.quiz_id === quiz.id)
                      }
                      type="submit"
                    >
                      {busy ? "Sending…" : "Submit assessment"}
                    </button>
                  </form>
                  {course.attempts
                    .filter((a) => a.quiz_id === quiz.id)
                    .map((a) => (
                      <p key={a.id}>
                        {a.score}% · {a.passed ? "Passed" : "Not passed"}
                        {a.submitted_at ? ` · ${date(a.submitted_at)}` : ""}
                      </p>
                    ))}
                </>
              ) : (
                <p>This course has no published content yet.</p>
              )}
            </main>
          </div>
        </LearningViewer>) : (<>
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
                      : "Find your course"}
                  </h2>
                  <p>
                    Open a course to continue your lessons and
                    assessments.
                  </p>
                  <input
                    aria-label="Search my courses"
                    placeholder="Search for a course…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.cards}>
                {courses.map((c) => {
                  const progress =
                    dashboard?.enrollments.find((e) => e.course_id === c.id)
                      ?.progress ?? 0;
                  return (
                    <article className={styles.courseCard} key={c.id}>
                      <div className={styles.courseCover} style={{ background: `linear-gradient(130deg,${c.color},#30205e)` }}><span>{c.level.split(" · ")[0]}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1m0-15c3-2 6-2 9-1v15c-3-1-6-1-9 1V5Z"/></svg><small>LEVEL UP ACADEMY</small></div>
                      <div className={styles.courseCardBody}>
                      <h2>{c.title}</h2>
                      <p>{c.description}</p>
                      <div className={styles.courseMeta}><span>{c.lessons} lessons</span><strong>{progress}% complete</strong></div>
                      <progress aria-label={`Progress for ${c.title}`} max={100} value={progress} />
                      <button
                        disabled={busy}
                        onClick={() => void openCourse(c)}
                      >
                        {progress > 0 ? "Continue course" : "Open course"} <span aria-hidden="true">→</span>
                      </button>
                      </div>
                    </article>
                  );
                })}
              </div>
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
                          <a
                            href={s.meeting_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Join class ↗
                          </a>
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
          {view === "billing" && (
            <section className={styles.panel}>
              <h2>Payment history</h2>
              {dashboard?.payments.length ? (
                <div className={styles.tableScroll}>
                  <table>
                    <thead>
                      <tr>
                        <th>Due date</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.payments.map((p) => (
                        <tr key={p.id}>
                          <td>{p.due_date}</td>
                          <td>
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: p.currency,
                            }).format(p.amount)}
                          </td>
                          <td>
                            {
                              (
                                {
                                  paid: "Paid",
                                  pending: "Pending",
                                  overdue: "Overdue",
                                  waived: "Waived",
                                  cancelled: "Cancelled",
                                } as Record<string, string>
                              )[p.status]
                            }
                          </td>
                          <td>{p.reference || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>Your academy has not recorded any payments for your account yet.</p>
              )}
              <p>
                For payment questions, send a request to your academy.
              </p>
              <button onClick={() => setView("help")}>Ask about a payment</button>
            </section>
          )}
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

function LessonContent({ lesson }: { lesson: CourseData["lessons"][number] }) {
  const config = lesson.content_config as Record<string, unknown> | null;
  const url = lesson.youtube_url || lesson.resource_url || "";
  const families: Record<string,string> = { inter:"Inter,Arial,sans-serif",arial:"Arial,sans-serif",helvetica:"Helvetica,Arial,sans-serif",verdana:"Verdana,sans-serif",tahoma:"Tahoma,sans-serif",trebuchet:"'Trebuchet MS',sans-serif",georgia:"Georgia,serif",times:"'Times New Roman',serif",garamond:"Garamond,serif",palatino:"Palatino,serif",bookman:"Bookman,serif",courier:"'Courier New',monospace",monaco:"Monaco,monospace",roboto:"Roboto,Arial,sans-serif","open-sans":"'Open Sans',Arial,sans-serif",lato:"Lato,Arial,sans-serif",montserrat:"Montserrat,Arial,sans-serif",poppins:"Poppins,Arial,sans-serif",merriweather:"Merriweather,Georgia,serif",playfair:"'Playfair Display',Georgia,serif" };
  const size: Record<string,number>={xs:12,small:14,normal:16,large:20,xl:24,title:32,display:44};
  const radius:Record<string,number>={none:0,small:6,medium:12,large:20};
  const padding:Record<string,number>={none:0,compact:10,normal:18,roomy:28};
  const height:Record<string,number>={compact:1.25,normal:1.55,relaxed:1.75,spacious:2};
  return (
    <div
      style={{
        whiteSpace: "pre-wrap",
        lineHeight: height[String(config?.lineHeight)]??1.55,
        fontFamily:families[String(config?.fontFamily)],
        fontSize:size[String(config?.fontSize)]??16,
        fontWeight:config?.bold?700:400,
        fontStyle:config?.italic?"italic":"normal",
        textDecoration:[config?.underline?"underline":"",config?.strikethrough?"line-through":""].filter(Boolean).join(" ")||"none",
        textTransform:config?.uppercase?"uppercase":"none",
        textAlign:(["left","center","right","justify"].includes(String(config?.align))?config?.align:"left") as CSSProperties["textAlign"],
        color:
          typeof config?.textColor === "string" ? config.textColor : undefined,
        background:
          typeof config?.backgroundColor === "string"
            ? config.backgroundColor
            : undefined,
        padding: padding[String(config?.padding)]??18,
        borderRadius: radius[String(config?.radius)]??12,
        border:config?.borderStyle==="solid"||config?.borderStyle==="dashed"?`1px ${config.borderStyle} ${String(config.borderColor??"#d0d5dd")}`:undefined,
      }}
    >
      {lesson.content_type === "youtube" && (
        <CourseVideo url={url} title={lesson.title} />
      )}
      {lesson.content_type === "image" && url && (
        <Image
          src={url}
          alt={lesson.body || lesson.title}
          width={1000}
          height={600}
          unoptimized
          style={{ width: "100%", height: "auto" }}
        />
      )}
      {lesson.content_type === "audio" && url && (
        <audio src={url} controls preload="metadata" />
      )}
      {lesson.content_type === "document" && /^https:\/\//i.test(url) && (
        <a href={url} target="_blank" rel="noopener noreferrer">
          Open document ↗
        </a>
      )}
      <p>{(lesson.body||lesson.description||"").split(/(\[[^\]]+\]\(https:\/\/[^\s)]+\))/g).map((part: string,index: number)=>{const match=part.match(/^\[([^\]]+)\]\((https:\/\/[^\s)]+)\)$/);return match?<a key={index} href={match[2]} target="_blank" rel="noopener noreferrer">{match[1]}</a>:part;})}</p>
    </div>
  );
}
