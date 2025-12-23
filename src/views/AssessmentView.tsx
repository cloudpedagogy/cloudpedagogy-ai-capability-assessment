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
    <>
      <p>
        Question {index + 1} of {QUESTIONS.length}
      </p>

      <h2>{question.text}</h2>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {OPTIONS.map((label, value) => (
          <li key={value} style={{ marginBottom: "0.5rem" }}>
            <label>
              <input
                type="radio"
                name={question.id}
                checked={responses[question.id] === value}
                onChange={() => handleSelect(value)}
              />{" "}
              {label}
            </label>
          </li>
        ))}
      </ul>

      <button
        onClick={next}
        disabled={responses[question.id] === undefined}
      >
        {index === QUESTIONS.length - 1 ? "Finish assessment" : "Next"}
      </button>
    </>
  )
}
