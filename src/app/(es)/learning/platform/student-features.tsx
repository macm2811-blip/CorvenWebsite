"use client";
import { useEffect, useState, type FormEvent } from "react";
import type { LmsInitialData, LmsCourse } from "@/lib/lms/types";
import {
  academyFeaturesAction,
  reportPaymentAction,
  submitAssignmentAction,
  referFriendAction,
  certificateAction,
  learningCatalogAction,
} from "./academy-features-actions";
import type { studentDashboardAction } from "./student-actions";
import { studentCourseAction } from "./student-actions";
import styles from "./student-workspace.module.css";
import { billingMonths } from "@/lib/lms/billing";

export function useAcademyFeatures(org: string) {
  const [data, setData] = useState<Awaited<
      ReturnType<typeof academyFeaturesAction>
    > | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    academyFeaturesAction(org)
      .then((d) => {
        if (live) setData(d);
      })
      .catch((e) => {
        if (live) setError(e.message);
      });
    return () => {
      live = false;
    };
  }, [org]);
  async function reload() {
    setData(await academyFeaturesAction(org));
  }
  return { data, error, reload };
}
const message = (e: unknown) =>
  e instanceof Error ? e.message : "Unable to complete this request.";
const labelDate = (value: string) =>
  new Date(value.slice(0, 10) + "T12:00:00Z").toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
export function StudentPayments({
  initialData,
  dashboard,
  onRefresh,
}: {
  initialData: LmsInitialData;
  dashboard: Awaited<ReturnType<typeof studentDashboardAction>>;
  onRefresh: () => Promise<void>;
}) {
  const { data, error, reload } = useAcademyFeatures(
    initialData.organizationId,
  );
  const [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [show, setShow] = useState(false);
  const months = billingMonths(
    data?.membership.billing_due_date ?? initialData.viewerDueDate,
    dashboard.payments,
  );
  const paid = dashboard.payments.filter((p) =>
    ["paid", "waived"].includes(p.status),
  );
  const lastCoverage = paid
    .map((p) => p.coverage_end ?? "")
    .filter(Boolean)
    .sort()
    .at(-1);
  async function report(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setNotice("");
    const form = e.currentTarget;
    try {
      await reportPaymentAction(initialData.organizationId, new FormData(form));
      await reload();
      await onRefresh();
      form.reset();
      setShow(false);
      setNotice(
        "Receipt submitted. Your academy will verify the payment before updating coverage.",
      );
    } catch (e) {
      setNotice(message(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <section className={styles.panel}>
        <h2>My payments</h2>
        <p>
          {lastCoverage ? `Paid through ${labelDate(lastCoverage)} · ` : ""}Next
          payment due:{" "}
          {data?.membership.billing_due_date
            ? labelDate(data.membership.billing_due_date)
            : "Contact your academy"}
        </p>
        <div className={styles.monthGrid}>
          {months.map((month) => (
            <article
              key={month.start}
              className={month.paid ? styles.monthPaid : styles.monthPending}
            >
              <strong>{month.label}</strong>
              <small>{month.year}</small>
              <small>
                {labelDate(month.start)} – {labelDate(month.end)}
              </small>
              <span>{month.paid ? "✓ Paid" : "Not recorded"}</span>
            </article>
          ))}
        </div>
        <button onClick={() => setShow(!show)}>
          {show ? "Cancel" : "Report a payment"}
        </button>
        {show && (
          <form onSubmit={report}>
            <p>Account: {initialData.viewerName}</p>
            <label>
              Amount
              <input
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                required
              />
            </label>
            <label>
              Payment due date
              <input
                name="dueDate"
                type="date"
                defaultValue={
                  data?.membership.billing_due_date ?? initialData.viewerDueDate
                }
                required
              />
            </label>
            <label>
              Receipt · PNG, JPG, WEBP or PDF · up to 3 MB
              <input
                name="receipt"
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                required
              />
            </label>
            <button disabled={busy}>
              {busy ? "Uploading…" : "Submit for review"}
            </button>
          </form>
        )}
        {(notice || error) && <p role="status">{notice || error}</p>}
      </section>
      <section className={styles.panel}>
        <h2>Reported payments</h2>
        {data?.reports.length ? (
          data.reports.map((r) => (
            <article key={r.id}>
              <strong>
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: data?.currency ?? "CRC",
                }).format(r.amount)}
              </strong>
              <p>
                {r.status} · {labelDate(r.requested_due_date)}
                {r.review_note ? ` · ${r.review_note}` : ""}
              </p>
            </article>
          ))
        ) : (
          <p>No receipts submitted yet.</p>
        )}
      </section>
      <section className={styles.panel}>
        <h2>Payment history</h2>
        {dashboard.payments.length ? (
          dashboard.payments.map((p) => (
            <article key={p.id}>
              <strong>
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: p.currency,
                }).format(p.amount)}
              </strong>
              <p>
                {p.status} · {labelDate(p.due_date)}
                {p.coverage_end
                  ? ` · Covered through ${labelDate(p.coverage_end)}`
                  : ""}
              </p>
            </article>
          ))
        ) : (
          <p>No payments recorded yet.</p>
        )}
      </section>
    </>
  );
}

export function AssignmentResponse({
  organizationId,
  courseId,
  lessonId,
}: {
  organizationId: string;
  courseId: string;
  lessonId: string;
}) {
  const { data, error, reload } = useAcademyFeatures(organizationId);
  const [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  const current = data?.submissions.find((s) => s.lesson_id === lessonId);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      await submitAssignmentAction(
        organizationId,
        courseId,
        lessonId,
        new FormData(e.currentTarget),
      );
      await reload();
      setNotice("Assignment submitted. You can now continue.");
    } catch (e) {
      setNotice(message(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <h3>Your homework</h3>
      {current && (
        <p>
          {current.status}
          {current.grade !== null ? ` · ${current.grade}%` : ""}
          {current.feedback ? ` · ${current.feedback}` : ""}
        </p>
      )}
      <form key={current?.id ?? "new"} onSubmit={submit}>
        <label>
          Your response
          <textarea
            name="body"
            required
            maxLength={12000}
            defaultValue={current?.body ?? ""}
          />
        </label>
        <label>
          Attachment (optional, up to 3 MB)
          <input
            type="file"
            name="attachment"
            accept="image/png,image/jpeg,image/webp,application/pdf"
          />
        </label>
        <button disabled={busy}>
          {busy
            ? "Submitting…"
            : current
              ? "Resubmit homework"
              : "Submit homework"}
        </button>
      </form>
      {(notice || error) && <p role="status">{notice || error}</p>}
    </section>
  );
}

export function ReferFriend({ organizationId }: { organizationId: string }) {
  const [open, setOpen] = useState(false),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    try {
      await referFriendAction(organizationId, new FormData(form));
      form.reset();
      setNotice("Referral saved. Your academy can follow up with your friend.");
      setOpen(false);
    } catch (e) {
      setNotice(message(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className={styles.panel}>
      <h2>Learning is better together</h2>
      <button onClick={() => setOpen(!open)} aria-expanded={open}>
        Refer a friend
      </button>
      {open && (
        <form onSubmit={submit}>
          <label>
            Name
            <input name="name" required minLength={2} maxLength={150} />
          </label>
          <label>
            Phone
            <input name="phone" type="tel" maxLength={40} />
          </label>
          <label>
            Email
            <input name="email" type="email" required />
          </label>
          <small>
            Share contact details only with your friend&apos;s permission.
          </small>
          <button disabled={busy}>Save referral</button>
        </form>
      )}
      {notice && <p role="status">{notice}</p>}
    </section>
  );
}

export function LearningPaths({
  initialData,
  courses,
  onOpen,
}: {
  initialData: LmsInitialData;
  courses: LmsCourse[];
  onOpen: (course: LmsCourse) => Promise<void>;
}) {
  const [details, setDetails] = useState<
      Awaited<ReturnType<typeof studentCourseAction>>[]
    >([]),
    [catalog, setCatalog] = useState<
      Awaited<ReturnType<typeof learningCatalogAction>>
    >([]),
    [notice, setNotice] = useState("");
  useEffect(() => {
    let live = true;
    learningCatalogAction(initialData.organizationId)
      .then((c) => {
        if (live) setCatalog(c);
      })
      .catch((e) => {
        if (live) setNotice(message(e));
      });
    return () => {
      live = false;
    };
  }, [initialData.organizationId]);
  const courseIds = courses.map((c) => String(c.id)).join(",");
  useEffect(() => {
    let live = true;
    Promise.all(
      courseIds
        .split(",")
        .filter(Boolean)
        .map((id) => studentCourseAction(initialData.organizationId, id)),
    )
      .then((result) => {
        if (live) setDetails(result);
      })
      .catch((e) => {
        if (live) setNotice(message(e));
      });
    return () => {
      live = false;
    };
  }, [initialData.organizationId, courseIds]);
  async function certificate(c: LmsCourse) {
    try {
      const result = await certificateAction(
        initialData.organizationId,
        String(c.id),
      );
      const { downloadCertificate } = await import("@/lib/lms/pdf-export");
      await downloadCertificate(result);
    } catch (e) {
      setNotice(message(e));
    }
  }
  const levels = Array.from(new Set(catalog.map((c) => c.level))).sort();
  return (
    <section className={styles.panel}>
      <h2>My learning path</h2>
      <p>Follow your units, assessment results and certificates.</p>
      <div className={styles.path}>
        {levels.map((level) => (
          <section key={level}>
            <h3>{level}</h3>
            {catalog
              .filter((c) => c.level === level)
              .map((c) => {
                const enrolled = courses.find((u) => u.id === c.id);
                const d = details.find((d) => d.course.id === c.id),
                  complete = d?.percentage === 100;
                const grades =
                  d?.quizzes.map((q) => {
                    const scores = d.attempts
                      .filter(
                        (a) =>
                          a.quiz_id === q.id && a.review_state === "graded",
                      )
                      .map((a) => Number(a.score));
                    return scores.length ? Math.max(...scores) : null;
                  }) ?? [];
                return (
                  <article
                    key={c.id}
                    className={
                      complete ? styles.completedStep : styles.currentStep
                    }
                  >
                    <strong>
                      {complete ? "✓ " : "→ "}
                      {c.title}
                    </strong>
                    <p>
                      {d?.percentage ?? 0}% completed
                      {grades.length && grades.every((g) => g !== null)
                        ? ` · Assessment average ${(grades.reduce((a, b) => Number(a) + Number(b), 0) as number) / grades.length}%`
                        : ""}
                    </p>
                    <button
                      disabled={!enrolled}
                      onClick={() => {
                        if (enrolled) void onOpen(enrolled);
                      }}
                    >
                      {enrolled ? "Open unit" : "Not enrolled"}
                    </button>
                    {complete && (
                      <>
                        <TheoryDownload
                          organizationId={initialData.organizationId}
                          courseId={String(c.id)}
                          name={initialData.viewerName}
                        />
                      </>
                    )}
                  </article>
                );
              })}
            {catalog.filter((c) => c.level === level).length > 0 &&
              catalog
                .filter((c) => c.level === level)
                .every((c) =>
                  details.some(
                    (d) => d.course.id === c.id && d.percentage === 100,
                  ),
                ) && (
                <button
                  onClick={() => {
                    const unit = courses.find(
                      (c) => c.level.split(" · ")[0] === level,
                    );
                    if (unit) void certificate(unit);
                  }}
                >
                  Download {level} certificate
                </button>
              )}
          </section>
        ))}
      </div>
      {notice && <p role="status">{notice}</p>}
    </section>
  );
}

function TheoryDownload({
  organizationId,
  courseId,
  name,
}: {
  organizationId: string;
  courseId: string;
  name: string;
}) {
  const [notice, setNotice] = useState("");
  async function download() {
    try {
      const data = await studentCourseAction(organizationId, courseId);
      if (data.percentage !== 100) throw new Error("Complete the unit first.");
      const { downloadTheory } = await import("@/lib/lms/pdf-export");
      await downloadTheory(data, name);
    } catch (e) {
      setNotice(message(e));
    }
  }
  return (
    <>
      <button onClick={() => void download()}>Download theory PDF</button>
      {notice && <p role="status">{notice}</p>}
    </>
  );
}
