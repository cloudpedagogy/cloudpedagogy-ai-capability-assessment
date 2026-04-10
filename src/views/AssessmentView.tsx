import { useState } from "react"
import { QUESTIONS } from "../data/questions"

type AssessmentViewProps = {
  onComplete: (responses: Record<string, number>) => void
}

const OPTIONS = [
  "Not in place",
  "Informal or ad hoc",
  "Defined and used",
  "Embedded and reviewed"
]

export default function AssessmentView({ onComplete }: AssessmentViewProps) {
  const [index, setIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, number>>({})

  const question = QUESTIONS[index]

  function handleSelect(value: number) {
    setResponses(prev => ({
      ...prev,
      [question.id]: value
    }))
  }

  function next() {
    if (index < QUESTIONS.length - 1) {
      setIndex(index + 1)
    } else {
      onComplete(responses)
    }
  }

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto" }}>
      <p className="metadata" style={{ marginBottom: "var(--spacing-sm)" }}>
        Question {index + 1} of {QUESTIONS.length}
      </p>

      <div className="card">
        <h2>{question.text}</h2>

        <ul style={{ listStyle: "none", padding: 0, margin: "var(--spacing-lg) 0" }}>
          {OPTIONS.map((label, value) => (
            <li key={value} style={{ marginBottom: "var(--spacing-md)" }}>
              <label style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "var(--spacing-md)", 
                cursor: "pointer",
                padding: "var(--spacing-md)",
                border: "1px solid var(--color-border-default)",
                borderRadius: "var(--radius-6)",
                transition: "background-color 0.2s ease"
              }}>
                <input
                  type="radio"
                  name={question.id}
                  checked={responses[question.id] === value}
                  onChange={() => handleSelect(value)}
                  style={{ accentColor: "var(--color-text-primary)" }}
                />
                <span style={{ fontSize: "1rem", color: "var(--color-text-primary)" }}>{label}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--spacing-lg)" }}>
        <button
          onClick={next}
          disabled={responses[question.id] === undefined}
        >
          {index === QUESTIONS.length - 1 ? "Finish assessment" : "Next"}
        </button>
      </div>
    </div>
  )
}
