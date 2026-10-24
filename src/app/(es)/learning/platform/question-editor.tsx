"use client";
import type { LmsQuestion } from "@/lib/lms/types";

export const newQuestion = (): LmsQuestion => ({
  prompt: "",
  questionType: "single_choice",
  options: ["", "", "", ""],
  correctAnswer: "",
});
export function QuestionEditor({
  questions,
  onChange,
}: {
  questions: LmsQuestion[];
  onChange: (questions: LmsQuestion[]) => void;
}) {
  const update = (index: number, changes: Partial<LmsQuestion>) =>
    onChange(questions.map((q, i) => (i === index ? { ...q, ...changes } : q)));
  return (
    <section aria-label="Assessment questions">
      {questions.map((q, index) => (
        <fieldset
          key={q.id ?? index}
          style={{
            margin: "16px 0",
            padding: 14,
            border: "1px solid #ddd",
            borderRadius: 10,
          }}
        >
          <legend>Question {index + 1}</legend>
          <label>
            Type
            <select
              value={q.questionType}
              onChange={(e) =>
                update(index, {
                  questionType: e.target.value as LmsQuestion["questionType"],
                  correctAnswer: e.target.value === "multiple_choice" ? [] : "",
                })
              }
            >
              <option value="single_choice">Single choice</option>
              <option value="multiple_choice">Multiple answers</option>
              <option value="short_answer">Fill in the blank</option>
              <option value="essay">Open response · instructor review</option>
            </select>
          </label>
          <label>
            Question
            <textarea
              required
              minLength={3}
              maxLength={2000}
              value={q.prompt}
              onChange={(e) => update(index, { prompt: e.target.value })}
            />
          </label>
          {["single_choice", "multiple_choice"].includes(q.questionType) && (
            <>
              <small>
                Select the correct answer
                {q.questionType === "multiple_choice" ? "s" : ""}.
              </small>
              {q.options.map((option, oi) => (
                <div
                  key={oi}
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    margin: "8px 0",
                  }}
                >
                  <input
                    aria-label={`Correct option ${oi + 1} for question ${index + 1}`}
                    type={
                      q.questionType === "multiple_choice"
                        ? "checkbox"
                        : "radio"
                    }
                    name={`correct-${index}`}
                    checked={
                      Array.isArray(q.correctAnswer)
                        ? q.correctAnswer.includes(option) && Boolean(option)
                        : q.correctAnswer === option && Boolean(option)
                    }
                    onChange={(e) =>
                      update(index, {
                        correctAnswer:
                          q.questionType === "multiple_choice"
                            ? e.target.checked
                              ? [
                                  ...(Array.isArray(q.correctAnswer)
                                    ? q.correctAnswer
                                    : []),
                                  option,
                                ]
                              : (Array.isArray(q.correctAnswer)
                                  ? q.correctAnswer
                                  : []
                                ).filter((a) => a !== option)
                            : option,
                      })
                    }
                  />
                  <input
                    aria-label={`Option ${oi + 1} for question ${index + 1}`}
                    required={oi < 2}
                    value={option}
                    onChange={(e) => {
                      const options = [...q.options];
                      options[oi] = e.target.value;
                      const correctAnswer = Array.isArray(q.correctAnswer)
                        ? q.correctAnswer.map((a) =>
                            a === option ? e.target.value : a,
                          )
                        : q.correctAnswer === option
                          ? e.target.value
                          : q.correctAnswer;
                      update(index, { options, correctAnswer });
                    }}
                  />
                  {q.options.length > 2 && (
                    <button
                      type="button"
                      aria-label={`Remove option ${oi + 1}`}
                      onClick={() =>
                        update(index, {
                          options: q.options.filter((_, i) => i !== oi),
                          correctAnswer: Array.isArray(q.correctAnswer)
                            ? q.correctAnswer.filter((a) => a !== option)
                            : q.correctAnswer === option
                              ? ""
                              : q.correctAnswer,
                        })
                      }
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {q.options.length < 20 && (
                <button
                  type="button"
                  onClick={() => update(index, { options: [...q.options, ""] })}
                >
                  + Answer option
                </button>
              )}
            </>
          )}
          {q.questionType === "short_answer" && (
            <label>
              Expected answer
              <input
                required
                value={String(q.correctAnswer)}
                onChange={(e) =>
                  update(index, { correctAnswer: e.target.value })
                }
              />
              <small>Case-insensitive exact match after trimming spaces.</small>
            </label>
          )}
          {q.questionType === "essay" && (
            <p>
              This answer will be graded by an instructor before a final score
              is issued.
            </p>
          )}
          {questions.length > 1 && (
            <button
              type="button"
              onClick={() => onChange(questions.filter((_, i) => i !== index))}
            >
              Remove question
            </button>
          )}
        </fieldset>
      ))}
      {questions.length < 100 && (
        <button
          type="button"
          onClick={() => onChange([...questions, newQuestion()])}
        >
          + Add question
        </button>
      )}
    </section>
  );
}
