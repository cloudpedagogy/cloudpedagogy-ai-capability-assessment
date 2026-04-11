import { useState } from "react"
import { QUESTIONS } from "../data/questions"
import type { Response, Confidence } from "../engine/scoring"

type AssessmentViewProps = {
  onComplete: (responses: Record<string, Response>) => void
}

const OPTIONS = [
  "Not in place",
  "Informal or ad hoc",
  "Defined and used",
  "Embedded and reviewed"
]

const CONFIDENCE_LEVELS: Confidence[] = ["low", "medium", "high"]

export default function AssessmentView({ onComplete }: AssessmentViewProps) {
  const [index, setIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, Response>>({})

  const question = QUESTIONS[index]

  function handleSelect(value: number) {
    setResponses(prev => ({
      ...prev,
      [question.id]: {
        value,
        confidence: prev[question.id]?.confidence || "medium"
      }
    }))
  }

  function handleConfidence(confidence: Confidence) {
    setResponses(prev => ({
      ...prev,
      [question.id]: {
        value: prev[question.id]?.value ?? 0,
        confidence
      }
    }))
  }

  function next() {
    if (index < QUESTIONS.length - 1) {
      setIndex(index + 1)
    } else {
      onComplete(responses)
    }
  }

  const currentResponse = responses[question.id]

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto" }}>
      <p className="metadata" style={{ marginBottom: "var(--spacing-sm)" }}>
        Question {index + 1} of {QUESTIONS.length}
      </p>

      <div className="card">
        <h2 style={{ marginBottom: "var(--spacing-lg)" }}>{question.text}</h2>

        <div style={{ marginBottom: "var(--spacing-xl)" }}>
          <h4 style={{ fontSize: "var(--font-size-meta)", marginBottom: "var(--spacing-md)", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>1. Capability Maturity</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {OPTIONS.map((label, value) => (
              <li key={value} style={{ marginBottom: "var(--spacing-sm)" }}>
                <label style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "var(--spacing-md)", 
                  cursor: "pointer",
                  padding: "var(--spacing-sm) var(--spacing-md)",
                  border: "1px solid var(--color-border-default)",
                  borderRadius: "var(--radius-6)",
                  transition: "background-color 0.2s ease",
                  backgroundColor: currentResponse?.value === value ? "var(--color-bg-subtle)" : "transparent",
                  borderColor: currentResponse?.value === value ? "var(--color-text-primary)" : "var(--color-border-default)"
                }}>
                  <input
                    type="radio"
                    name={question.id}
                    checked={currentResponse?.value === value}
                    onChange={() => handleSelect(value)}
                    style={{ accentColor: "var(--color-text-primary)" }}
                  />
                  <span style={{ fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>{label}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: "var(--font-size-meta)", marginBottom: "var(--spacing-md)", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>2. Confidence in response</h4>
          <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
            {CONFIDENCE_LEVELS.map((level) => (
              <button
                key={level}
                className="secondary"
                onClick={() => handleConfidence(level)}
                style={{ 
                  flex: 1, 
                  fontSize: "var(--font-size-meta)", 
                  padding: "var(--spacing-sm)",
                  backgroundColor: currentResponse?.confidence === level ? "var(--color-text-primary)" : "transparent",
                  color: currentResponse?.confidence === level ? "white" : "var(--color-text-primary)",
                  borderColor: currentResponse?.confidence === level ? "var(--color-text-primary)" : "var(--color-border-default)"
                }}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "var(--spacing-lg)" }}>
        <button
          className="secondary"
          onClick={() => setIndex(Math.max(0, index - 1))}
          style={{ visibility: index === 0 ? "hidden" : "visible" }}
        >
          Previous
        </button>
        <button
          onClick={next}
          disabled={currentResponse === undefined}
        >
          {index === QUESTIONS.length - 1 ? "Finish assessment" : "Next"}
        </button>
      </div>
    </div>
  )
}
