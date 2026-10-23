"use client";
import { displayLabel } from "@/lib/lms/display-label";

import { useEffect, useState, type FormEvent } from "react";
import type { LmsCourse, LmsStudent } from "@/lib/lms/types";
import {
  academyOperationsAction,
  saveSessionAction,
  enrollExistingStudentAction,
  recordPaymentAction,
  academyTicketsAction,
} from "./student-actions";
import { replyTicketAction } from "./actions";
import styles from "./student-workspace.module.css";

type Operations = Awaited<ReturnType<typeof academyOperationsAction>>;
export function AcademyWorkspace({
  organizationId,
  view,
  students,
  courses,
}: {
  organizationId: string;
  view: "overview" | "income" | "sessions";
  students: LmsStudent[];
  courses: LmsCourse[];
}) {
  const [data, setData] = useState<Operations | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    academyOperationsAction(organizationId)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [organizationId]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setBusy(true);
    setError("");
    try {
      if (view === "sessions")
        await saveSessionAction({
          organizationId,
          title: String(values.get("title")),
          startsAt: String(values.get("startsAt")),
          duration: Number(values.get("duration")),
          meetingUrl: String(values.get("meetingUrl")),
          courseId: String(values.get("courseId")),
        });
      else
        await recordPaymentAction({
          organizationId,
          studentId: String(values.get("studentId")),
          amount: Number(values.get("amount")),
          dueDate: String(values.get("dueDate")),
          reference: String(values.get("reference")),
          status: String(values.get("status")),
        });
      setData(await academyOperationsAction(organizationId));
      form.reset();
      setMessage("Record saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save.");
    } finally {
      setBusy(false);
    }
  }
  const money = (value: number, currency = "CRC") =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
      value,
    );
  function exportPayments() {
    if (!data) return;
    const rows = [
      ["Student", "Amount", "Currency", "Due date", "Status", "Reference"],
      ...data.payments.map((p) => [
        students.find((s) => s.id === p.student_id)?.name ?? "Student",
        p.amount,
        p.currency,
        p.due_date,
        p.status,
        p.reference ?? "",
      ]),
    ];
    const csv = rows
      .map((row) =>
        row
          .map(
            (value) =>
              '"' +
              String(value)
                .replace(/^[=+@-]/, "'")
                .replaceAll('"', '""') +
              '"',
          )
          .join(","),
      )
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "pagos-level-up.csv";
    link.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className={styles.workspace}>
      <h1>
        {view === "overview"
          ? "Academy overview"
          : view === "sessions"
            ? "Live classes"
            : "Payments and income"}
      </h1>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {message && (
        <p role="status" className={styles.notice}>
          {message}
        </p>
      )}
      {!data && !error && <p>Loading records…</p>}
      {view === "overview" && (
        <div className={styles.cards}>
          <section className={styles.panel}>
            <h2>{students.filter((s) => s.active).length}</h2>
            <p>Active students</p>
          </section>
          <section className={styles.panel}>
            <h2>{courses.filter((c) => c.published).length}</h2>
            <p>Published courses</p>
          </section>
          <section className={styles.panel}>
            <h2>
              {data?.payments.filter((p) => p.status === "paid").length ?? 0}
            </h2>
            <p>Recorded payments</p>
          </section>
        </div>
      )}
      {view === "sessions" && (
        <section className={styles.panel}>
          <h2>Schedule a class</h2>
          <form onSubmit={submit}>
            <label>
              Title
              <input name="title" required minLength={2} maxLength={180} />
            </label>
            <label>
              Course
              <select name="courseId">
                <option value="">Entire academy</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Date and time (local device time)
              <input name="startsAt" type="datetime-local" required />
            </label>
            <label>
              Duration in minutes
              <input
                name="duration"
                type="number"
                min={5}
                max={480}
                defaultValue={60}
                required
              />
            </label>
            <label>
              Teams, Zoom or Meet link
              <input
                name="meetingUrl"
                type="url"
                required
                placeholder="https://..."
              />
            </label>
            <button disabled={busy}>Save class</button>
          </form>
        </section>
      )}
      {view !== "income" && (
        <section className={styles.panel}>
          <h2>Scheduled classes</h2>
          {data?.sessions.length ? (
            data.sessions.map((s) => (
              <article key={s.id}>
                <h3>{s.title}</h3>
                <p>
                  {new Date(s.starts_at).toLocaleString("en-US", {
                    timeZone: "America/Costa_Rica",
                  })}{" "}
                  · {s.duration_minutes} minutes · {s.status}
                </p>
                {s.meeting_url && (
                  <a
                    href={s.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open link ↗
                  </a>
                )}
                {view === "sessions" && s.status !== "cancelled" && (
                  <button
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        await saveSessionAction({
                          organizationId,
                          id: s.id,
                          title: s.title,
                          startsAt: s.starts_at,
                          duration: s.duration_minutes,
                          meetingUrl: s.meeting_url ?? "",
                          courseId: s.course_id ?? "",
                          status: "cancelled",
                        });
                        setData(await academyOperationsAction(organizationId));
                      } catch (e) {
                        setError(
                          e instanceof Error
                            ? e.message
                            : "Unable to cancel.",
                        );
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    Cancel class
                  </button>
                )}
              </article>
            ))
          ) : (
            <p>No classes recorded.</p>
          )}
        </section>
      )}
      {view === "income" && (
        <>
          <section className={styles.panel}>
            <h2>Record a payment or charge</h2>
            <form onSubmit={submit}>
              <label>
                Student
                <select name="studentId" required>
                  <option value="">Select</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Amount
                <input
                  type="number"
                  name="amount"
                  min={0}
                  step="0.01"
                  required
                />
              </label>
              <label>
                Due date
                <input type="date" name="dueDate" required />
              </label>
              <label>
                Status
                <select name="status">
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                  <option value="waived">Waived</option>
                </select>
              </label>
              <label>
                Reference
                <input name="reference" maxLength={200} />
              </label>
              <button disabled={busy || !students.length}>
                Save record
              </button>
            </form>
          </section>
          <section className={styles.panel}>
            <h2>Payment records</h2>
            <button onClick={exportPayments} disabled={!data?.payments.length}>
              Export CSV
            </button>
            <div className={styles.tableScroll}>
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Amount</th>
                    <th>Due date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.payments.map((p) => (
                    <tr key={p.id}>
                      <td>
                        {students.find((s) => s.id === p.student_id)?.name ??
                          "Student"}
                      </td>
                      <td>{money(p.amount, p.currency)}</td>
                      <td>{p.due_date}</td>
                      <td>{displayLabel(p.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!data?.payments.length && <p>No payments recorded.</p>}
          </section>
        </>
      )}
    </div>
  );
}

export function EnrollmentForm({
  organizationId,
  students,
  courses,
}: {
  organizationId: string;
  students: LmsStudent[];
  courses: LmsCourse[];
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <section className={styles.panel}>
      <h2>Enroll an existing student</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          setBusy(true);
          try {
            await enrollExistingStudentAction({
              organizationId,
              studentId: String(data.get("student")),
              courseId: String(data.get("course")),
            });
            setMessage(
              "Enrollment saved. The course will appear for the student once published.",
            );
          } catch (error) {
            setMessage(
              error instanceof Error ? error.message : "No se pudo matricular.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Student
          <select name="student" required>
            <option value="">Select</option>
            {students.map((s) => (
              <option value={s.id} key={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Course
          <select name="course" required>
            <option value="">Select</option>
            {courses.map((c) => (
              <option value={c.id} key={c.id}>
                {c.title}
                {c.published ? "" : " (borrador)"}
              </option>
            ))}
          </select>
        </label>
        <button disabled={busy}>Save enrollment</button>
        {message && <p role="status">{message}</p>}
      </form>
    </section>
  );
}

export function AcademySupport({ organizationId }: { organizationId: string }) {
  const [tickets, setTickets] = useState<
    Awaited<ReturnType<typeof academyTicketsAction>>
  >([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    academyTicketsAction(organizationId)
      .then((data) => {
        if (active) setTickets(data);
      })
      .catch((e) => {
        if (active) setMessage(e.message);
      });
    return () => {
      active = false;
    };
  }, [organizationId]);
  return (
    <div className={styles.workspace}>
      <h1>Support requests</h1>
      {message && <p role="status">{message}</p>}
      {tickets.map((t) => (
        <section className={styles.panel} key={t.id}>
          <h2>{t.title}</h2>
          <p>{t.description}</p>
          <small>{displayLabel(t.status)}</small>
          {[...t.ticket_messages]
            .sort((a, b) => a.created_at.localeCompare(b.created_at))
            .map((m) => (
              <blockquote key={m.id}>{m.body}</blockquote>
            ))}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const data = new FormData(form);
              setBusy(true);
              try {
                const result = await replyTicketAction({
                  organizationId,
                  ticketId: t.id,
                  body: String(data.get("body")),
                  status: "answered",
                });
                if (!result.ok) throw new Error(result.message);
                setTickets(await academyTicketsAction(organizationId));
                form.reset();
                setMessage("Reply sent.");
              } catch (error) {
                setMessage(
                  error instanceof Error
                    ? error.message
                    : "Unable to reply.",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            <label>
              Reply
              <textarea name="body" required minLength={2} maxLength={5000} />
            </label>
            <button disabled={busy}>Send reply</button>
          </form>
        </section>
      ))}
      {!tickets.length && <p>No requests recorded.</p>}
    </div>
  );
}
