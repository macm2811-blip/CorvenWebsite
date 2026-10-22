"use client";

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
      setMessage("Registro guardado.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setBusy(false);
    }
  }
  const money = (value: number, currency = "CRC") =>
    new Intl.NumberFormat("es-CR", { style: "currency", currency }).format(
      value,
    );
  function exportPayments() {
    if (!data) return;
    const rows = [
      ["Estudiante", "Monto", "Moneda", "Vencimiento", "Estado", "Referencia"],
      ...data.payments.map((p) => [
        students.find((s) => s.id === p.student_id)?.name ?? "Estudiante",
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
          ? "Resumen de la academia"
          : view === "sessions"
            ? "Clases en vivo"
            : "Pagos e ingresos"}
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
      {!data && !error && <p>Cargando registros…</p>}
      {view === "overview" && (
        <div className={styles.cards}>
          <section className={styles.panel}>
            <h2>{students.filter((s) => s.active).length}</h2>
            <p>Estudiantes activos</p>
          </section>
          <section className={styles.panel}>
            <h2>{courses.filter((c) => c.published).length}</h2>
            <p>Cursos publicados</p>
          </section>
          <section className={styles.panel}>
            <h2>
              {data?.payments.filter((p) => p.status === "paid").length ?? 0}
            </h2>
            <p>Pagos registrados</p>
          </section>
        </div>
      )}
      {view === "sessions" && (
        <section className={styles.panel}>
          <h2>Programar clase</h2>
          <form onSubmit={submit}>
            <label>
              Título
              <input name="title" required minLength={2} maxLength={180} />
            </label>
            <label>
              Curso
              <select name="courseId">
                <option value="">Toda la academia</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Fecha y hora (hora de este dispositivo)
              <input name="startsAt" type="datetime-local" required />
            </label>
            <label>
              Duración en minutos
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
              Enlace de Teams, Zoom o Meet
              <input
                name="meetingUrl"
                type="url"
                required
                placeholder="https://..."
              />
            </label>
            <button disabled={busy}>Guardar clase</button>
          </form>
        </section>
      )}
      {view !== "income" && (
        <section className={styles.panel}>
          <h2>Clases programadas</h2>
          {data?.sessions.length ? (
            data.sessions.map((s) => (
              <article key={s.id}>
                <h3>{s.title}</h3>
                <p>
                  {new Date(s.starts_at).toLocaleString("es-CR", {
                    timeZone: "America/Costa_Rica",
                  })}{" "}
                  · {s.duration_minutes} minutos · {s.status}
                </p>
                {s.meeting_url && (
                  <a
                    href={s.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Abrir enlace ↗
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
                            : "No se pudo cancelar.",
                        );
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    Cancelar clase
                  </button>
                )}
              </article>
            ))
          ) : (
            <p>No hay clases registradas.</p>
          )}
        </section>
      )}
      {view === "income" && (
        <>
          <section className={styles.panel}>
            <h2>Registrar pago o cobro</h2>
            <form onSubmit={submit}>
              <label>
                Estudiante
                <select name="studentId" required>
                  <option value="">Seleccionar</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Monto
                <input
                  type="number"
                  name="amount"
                  min={0}
                  step="0.01"
                  required
                />
              </label>
              <label>
                Vencimiento
                <input type="date" name="dueDate" required />
              </label>
              <label>
                Estado
                <select name="status">
                  <option value="paid">Pagado</option>
                  <option value="pending">Pendiente</option>
                  <option value="overdue">Vencido</option>
                  <option value="waived">Exonerado</option>
                </select>
              </label>
              <label>
                Referencia
                <input name="reference" maxLength={200} />
              </label>
              <button disabled={busy || !students.length}>
                Guardar registro
              </button>
            </form>
          </section>
          <section className={styles.panel}>
            <h2>Historial real de pagos</h2>
            <button onClick={exportPayments} disabled={!data?.payments.length}>
              Exportar CSV
            </button>
            <div className={styles.tableScroll}>
              <table>
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>Monto</th>
                    <th>Vencimiento</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.payments.map((p) => (
                    <tr key={p.id}>
                      <td>
                        {students.find((s) => s.id === p.student_id)?.name ??
                          "Estudiante"}
                      </td>
                      <td>{money(p.amount, p.currency)}</td>
                      <td>{p.due_date}</td>
                      <td>{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!data?.payments.length && <p>No hay pagos registrados.</p>}
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
      <h2>Matricular estudiante existente</h2>
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
              "Matrícula guardada. El curso aparecerá al estudiante cuando esté publicado.",
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
          Estudiante
          <select name="student" required>
            <option value="">Seleccionar</option>
            {students.map((s) => (
              <option value={s.id} key={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Curso
          <select name="course" required>
            <option value="">Seleccionar</option>
            {courses.map((c) => (
              <option value={c.id} key={c.id}>
                {c.title}
                {c.published ? "" : " (borrador)"}
              </option>
            ))}
          </select>
        </label>
        <button disabled={busy}>Guardar matrícula</button>
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
      <h1>Solicitudes de soporte</h1>
      {message && <p role="status">{message}</p>}
      {tickets.map((t) => (
        <section className={styles.panel} key={t.id}>
          <h2>{t.title}</h2>
          <p>{t.description}</p>
          <small>{t.status}</small>
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
                setMessage("Respuesta enviada.");
              } catch (error) {
                setMessage(
                  error instanceof Error
                    ? error.message
                    : "No se pudo responder.",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            <label>
              Respuesta
              <textarea name="body" required minLength={2} maxLength={5000} />
            </label>
            <button disabled={busy}>Enviar respuesta</button>
          </form>
        </section>
      ))}
      {!tickets.length && <p>No hay solicitudes registradas.</p>}
    </div>
  );
}
