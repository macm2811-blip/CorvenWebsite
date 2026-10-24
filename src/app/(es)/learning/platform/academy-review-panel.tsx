"use client";
import { useState } from "react";
import type { LmsStudent } from "@/lib/lms/types";
import { useAcademyFeatures } from "./student-features";
import {
  privateAttachmentAction,
  reviewPaymentAction,
  reviewAssignmentAction,
  reviewAttemptAction,
} from "./academy-features-actions";
import styles from "./student-workspace.module.css";

export function AcademyReviewPanel({
  organizationId,
  students,
  mode = "all",
}: {
  organizationId: string;
  students: LmsStudent[];
  mode?: "all" | "payments";
}) {
  const { data, error, reload } = useAcademyFeatures(organizationId),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [attachment, setAttachment] = useState("");
  const name = (id: string) =>
    students.find((s) => s.id === id)?.name ?? "Student";
  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setNotice("");
    try {
      await fn();
      await reload();
      setNotice("Saved.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Unable to save.");
    } finally {
      setBusy(false);
    }
  }
  async function show(id: string, kind: "payment" | "assignment") {
    await run(async () =>
      setAttachment(await privateAttachmentAction(organizationId, id, kind)),
    );
  }
  return (
    <section className={styles.panel}>
      <h2>
        {mode === "payments" ? "Payment approvals" : "Academy review desk"}
      </h2>
      {(notice || error) && <p role="status">{notice || error}</p>}
      {attachment && (
        <p>
          <a href={attachment} target="_blank" rel="noopener noreferrer">
            Open private attachment ↗
          </a>
        </p>
      )}
      <h3>Payment receipts</h3>
      {data?.reports.filter((r) => r.status === "pending").length ? (
        data.reports
          .filter((r) => r.status === "pending")
          .map((r) => (
            <article key={r.id}>
              <strong>
                {name(r.student_id)} · {r.amount} {data?.currency}
              </strong>
              <p>Requested payment date: {r.requested_due_date}</p>
              <button onClick={() => void show(r.id, "payment")}>
                View receipt
              </button>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = new FormData(e.currentTarget);
                  void run(() =>
                    reviewPaymentAction(
                      organizationId,
                      r.id,
                      true,
                      String(form.get("start")),
                      String(form.get("end")),
                      String(form.get("note")),
                    ),
                  );
                }}
              >
                <label>
                  Coverage starts
                  <input
                    type="date"
                    name="start"
                    defaultValue={r.requested_due_date}
                    required
                  />
                </label>
                <label>
                  Paid through
                  <input type="date" name="end" required />
                </label>
                <label>
                  Review note
                  <input name="note" maxLength={2000} />
                </label>
                <button disabled={busy}>Approve verified payment</button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    const note = window.prompt("Reason for rejection");
                    if (note)
                      void run(() =>
                        reviewPaymentAction(
                          organizationId,
                          r.id,
                          false,
                          "",
                          "",
                          note,
                        ),
                      );
                  }}
                >
                  Reject receipt
                </button>
              </form>
            </article>
          ))
      ) : (
        <p>No payment receipts awaiting approval.</p>
      )}
      {mode === "all" && (
        <>
          <h3>Open-response assessments</h3>
          {data?.reviews.length ? (
            data.reviews.map((a) => (
              <article key={a.id}>
                <strong>{name(a.student_id)}</strong>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const values = new FormData(e.currentTarget),
                      marks: Record<string, number> = {};
                    a.question_snapshot
                      .filter((q) => q.type === "essay")
                      .forEach((q) => {
                        marks[q.id] = Number(values.get(q.id));
                      });
                    void run(() =>
                      reviewAttemptAction(
                        organizationId,
                        a.id,
                        marks,
                        String(values.get("feedback")),
                      ),
                    );
                  }}
                >
                  {a.question_snapshot
                    .filter((q) => q.type === "essay")
                    .map((q) => (
                      <div key={q.id}>
                        <h4>{q.prompt}</h4>
                        <blockquote>{String(a.answers[q.id] ?? "")}</blockquote>
                        <label>
                          Points (0 to 1)
                          <input
                            type="number"
                            min={0}
                            max={1}
                            step="0.05"
                            required
                            name={q.id}
                          />
                        </label>
                      </div>
                    ))}
                  <label>
                    Feedback
                    <textarea name="feedback" maxLength={5000} />
                  </label>
                  <button disabled={busy}>Finalize assessment grade</button>
                </form>
              </article>
            ))
          ) : (
            <p>No assessments awaiting grading.</p>
          )}
          <h3>Homework submissions</h3>
          {data?.submissions.length ? (
            data.submissions.map((s) => (
              <article key={s.id}>
                <strong>
                  {name(s.student_id)} · {s.status}
                </strong>
                <p>{s.body}</p>
                {s.attachment_path && (
                  <button onClick={() => void show(s.id, "assignment")}>
                    View attachment
                  </button>
                )}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const values = new FormData(e.currentTarget);
                    void run(() =>
                      reviewAssignmentAction(
                        organizationId,
                        s.id,
                        Number(values.get("grade")),
                        String(values.get("feedback")),
                      ),
                    );
                  }}
                >
                  <label>
                    Grade (%)
                    <input
                      name="grade"
                      type="number"
                      min={0}
                      max={100}
                      step="0.1"
                      required
                      defaultValue={s.grade ?? ""}
                    />
                  </label>
                  <label>
                    Feedback
                    <textarea
                      name="feedback"
                      maxLength={5000}
                      defaultValue={s.feedback}
                    />
                  </label>
                  <button disabled={busy}>Save homework review</button>
                </form>
              </article>
            ))
          ) : (
            <p>No homework submitted yet.</p>
          )}
          <h3>Friend referrals</h3>
          {data?.referrals.length ? (
            data.referrals.map((r) => (
              <article key={r.id}>
                <strong>{r.name}</strong>
                <p>
                  {r.email} · {r.phone}
                </p>
                <p>
                  Referred by {name(r.referrer_id)} ·{" "}
                  {r.matched_student_id ? "Registered" : "Not registered"}
                </p>
              </article>
            ))
          ) : (
            <p>No referrals yet.</p>
          )}
          <p>
            {data?.emailReady
              ? "Referral email delivery is configured."
              : "Referrals are saved. Automatic email delivery requires the academy sender configuration."}
          </p>
        </>
      )}
    </section>
  );
}
