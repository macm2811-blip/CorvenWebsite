"use client";
import { useEffect, useState } from "react";
import { LearningViewer } from "@/components/learning-viewer";
import { FitSlide } from "@/components/fit-slide";
import { studentCourseAction, recordLearningAction } from "./student-actions";
import { LessonContent } from "./lesson-content";
import { AssignmentResponse } from "./student-features";
import styles from "./course-player.module.css";

type Course = Awaited<ReturnType<typeof studentCourseAction>>;
export function CoursePlayer({
  data,
  organizationId,
  onClose,
  onUpdate,
  startLessonId,
  onNextUnit,
}: {
  data: Course;
  organizationId: string;
  onClose: () => void;
  onUpdate: (data: Course) => void;
  startLessonId?: string;
  onNextUnit?: () => Promise<void>;
}) {
  const pages = [
    ...data.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      position: l.position,
      kind: "lesson" as const,
    })),
    ...data.quizzes.map((q) => ({
      id: q.id,
      title: q.title,
      position: q.position,
      kind: "quiz" as const,
    })),
  ].sort((a, b) => a.position - b.position);
  const first = pages.findIndex(
    (p) =>
      p.id === startLessonId ||
      (!startLessonId &&
        (p.kind === "lesson"
          ? !data.progress.some((x) => x.lesson_id === p.id && x.completed)
          : !data.attempts.some((x) => x.quiz_id === p.id && x.passed))),
  );
  const [index, setIndex] = useState(Math.max(0, first)),
    [hideIndex, setHideIndex] = useState(false),
    [hideProgress, setHideProgress] = useState(false),
    [full, setFull] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({}),
    [questionIndex, setQuestionIndex] = useState(0);
  const page = pages[index],
    lesson = data.lessons.find((l) => l.id === page?.id),
    quiz = data.quizzes.find((q) => q.id === page?.id),
    questions = data.questions.filter((q) => q.quiz_id === quiz?.id),
    question = questions[questionIndex];
  const passed = Boolean(
    quiz && data.attempts.some((a) => a.quiz_id === quiz.id && a.passed),
  );
  useEffect(() => {
    const change = () => setFull(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", change);
    return () => document.removeEventListener("fullscreenchange", change);
  }, []);
  function go(next: number) {
    setIndex(next);
    setQuestionIndex(0);
    setAnswers({});
    setMessage("");
  }
  async function advance() {
    setBusy(true);
    setMessage("");
    try {
      if (lesson)
        await recordLearningAction({
          organizationId,
          courseId: data.course.id,
          lessonId: lesson.id,
        });
      if (quiz && !passed)
        throw new Error("Pass this assessment before continuing.");
      onUpdate(await studentCourseAction(organizationId, data.course.id));
      if (index < pages.length - 1) go(index + 1);
      else setMessage("Unit completed. Your progress has been saved.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to save progress.");
    } finally {
      setBusy(false);
    }
  }
  async function submit() {
    setBusy(true);
    setMessage("");
    try {
      const result = await recordLearningAction({
        organizationId,
        courseId: data.course.id,
        quizId: quiz!.id,
        answers,
      });
      onUpdate(await studentCourseAction(organizationId, data.course.id));
      setMessage(
        result.pendingReview
          ? "Submitted. Your instructor will review the open responses."
          : `${result.score}% · ${result.passed ? "Passed" : "Not passed"}`,
      );
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Unable to submit assessment.",
      );
    } finally {
      setBusy(false);
    }
  }
  const answered = (id: string) =>
    Array.isArray(answers[id])
      ? (answers[id] as string[]).length > 0
      : Boolean(String(answers[id] ?? "").trim());
  return (
    <LearningViewer title={data.course.title} onClose={onClose}>
      <div className={styles.player}>
        <div className={styles.tools}>
          <button onClick={() => setHideIndex(!hideIndex)}>
            {hideIndex ? "Show contents" : "Hide contents"}
          </button>
          <button onClick={() => setHideProgress(!hideProgress)}>
            {hideProgress ? "Show progress" : "Hide progress"}
          </button>
          <span>
            {index + 1} / {pages.length}
          </span>
        </div>
        {!hideProgress && !full && (
          <div className={styles.progress}>
            <small>Unit progress · {data.percentage}%</small>
            <progress max={100} value={data.percentage} />
          </div>
        )}
        <div
          className={`${styles.layout} ${hideIndex || full ? styles.wide : ""}`}
        >
          {!hideIndex && !full && (
            <aside aria-label="Unit contents">
              {pages.map((p, i) => (
                <button
                  className={i === index ? styles.selected : ""}
                  key={p.id}
                  onClick={() => go(i)}
                >
                  {data.progress.some(
                    (x) => x.lesson_id === p.id && x.completed,
                  ) || data.attempts.some((x) => x.quiz_id === p.id && x.passed)
                    ? "✓ "
                    : ""}
                  {p.title}
                </button>
              ))}
            </aside>
          )}
          <section className={styles.stage}>
            {lesson && (
              <>
                {lesson.content_config?.activityType === "assignment" ? (
                  <div className={styles.assignment}>
                    <h2>{lesson.title}</h2>
                    <LessonContent lesson={lesson} />
                    <AssignmentResponse
                      organizationId={organizationId}
                      courseId={data.course.id}
                      lessonId={lesson.id}
                    />
                  </div>
                ) : (
                  <FitSlide key={lesson.id}>
                    <h2>{lesson.title}</h2>
                    <LessonContent lesson={lesson} />
                  </FitSlide>
                )}
              </>
            )}
            {quiz && (
              <div className={styles.quiz}>
                <h2>{quiz.title}</h2>
                <p>{quiz.description}</p>
                <small>
                  Passing score {quiz.passing_score}% · Attempts{" "}
                  {data.attempts.filter((a) => a.quiz_id === quiz.id).length}/
                  {quiz.max_attempts}
                </small>
                {question && (
                  <fieldset>
                    <legend>
                      Question {questionIndex + 1} of {questions.length}
                    </legend>
                    <h3>{question.prompt}</h3>
                    {["short_answer", "essay"].includes(
                      question.question_type,
                    ) ? (
                      question.question_type === "essay" ? (
                        <textarea
                          aria-label="Your response"
                          value={String(answers[question.id] ?? "")}
                          onChange={(e) =>
                            setAnswers({
                              ...answers,
                              [question.id]: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <input
                          aria-label="Your answer"
                          value={String(answers[question.id] ?? "")}
                          onChange={(e) =>
                            setAnswers({
                              ...answers,
                              [question.id]: e.target.value,
                            })
                          }
                        />
                      )
                    ) : (
                      Array.isArray(question.options) &&
                      question.options.map((raw, oi) => {
                        const option = String(raw);
                        return (
                          <label key={oi}>
                            <input
                              type={
                                question.question_type === "multiple_choice"
                                  ? "checkbox"
                                  : "radio"
                              }
                              name={question.id}
                              checked={
                                Array.isArray(answers[question.id])
                                  ? (answers[question.id] as string[]).includes(
                                      option,
                                    )
                                  : answers[question.id] === option
                              }
                              onChange={(e) =>
                                setAnswers({
                                  ...answers,
                                  [question.id]:
                                    question.question_type === "multiple_choice"
                                      ? e.target.checked
                                        ? [
                                            ...(Array.isArray(
                                              answers[question.id],
                                            )
                                              ? (answers[
                                                  question.id
                                                ] as string[])
                                              : []),
                                            option,
                                          ]
                                        : (
                                            (answers[
                                              question.id
                                            ] as string[]) ?? []
                                          ).filter((a) => a !== option)
                                      : option,
                                })
                              }
                            />
                            {option}
                          </label>
                        );
                      })
                    )}
                  </fieldset>
                )}
                <div className={styles.navigation}>
                  <button
                    disabled={questionIndex === 0}
                    onClick={() => setQuestionIndex(questionIndex - 1)}
                  >
                    Previous question
                  </button>
                  {questionIndex < questions.length - 1 ? (
                    <button
                      disabled={!question || !answered(question.id)}
                      onClick={() => setQuestionIndex(questionIndex + 1)}
                    >
                      Next question
                    </button>
                  ) : (
                    <button
                      disabled={
                        busy ||
                        !questions.length ||
                        questions.some((q) => !answered(q.id)) ||
                        data.attempts.filter((a) => a.quiz_id === quiz.id)
                          .length >= quiz.max_attempts
                      }
                      onClick={() => void submit()}
                    >
                      Submit assessment
                    </button>
                  )}
                </div>
                {data.attempts
                  .filter((a) => a.quiz_id === quiz.id)
                  .map((a) => (
                    <p key={a.id}>
                      {a.review_state === "pending_review"
                        ? "Awaiting instructor review"
                        : `${a.score}% · ${a.passed ? "Passed" : "Not passed"}`}
                      {a.feedback ? ` · ${a.feedback}` : ""}
                    </p>
                  ))}
              </div>
            )}
            {!page && <p>This unit has no published content yet.</p>}
            {message && (
              <p role="status" className={styles.message}>
                {message}
              </p>
            )}
            <nav className={styles.navigation} aria-label="Page navigation">
              <button
                disabled={index === 0 || busy}
                onClick={() => go(index - 1)}
              >
                ← Back
              </button>
              <button
                disabled={busy || !page || Boolean(quiz && !passed)}
                onClick={() => {
                  if (index === pages.length - 1 && data.percentage === 100) {
                    if (onNextUnit) void onNextUnit();
                    else onClose();
                  } else void advance();
                }}
              >
                {busy
                  ? "Saving…"
                  : index === pages.length - 1
                    ? data.percentage === 100
                      ? onNextUnit
                        ? "Next lesson →"
                        : "Back to units"
                      : "Finish unit ✓"
                    : "Next →"}
              </button>
            </nav>
          </section>
        </div>
      </div>
    </LearningViewer>
  );
}
