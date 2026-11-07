import { describe, it, expect, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import App from "./App"
import { QUESTIONS } from "./data/questions"

describe("App full workflow integration", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("completes the end-to-end user journey from Intro to Assessment to Results to Restart", () => {
    render(<App />)

    // 1. Initial stage: IntroView
    expect(screen.getByRole("heading", { level: 1, name: "AI Capability Self-Assessment" })).toBeInTheDocument()
    expect(screen.getByText("Assessment Metadata (Optional)")).toBeInTheDocument()

    const roleInput = screen.getByPlaceholderText("e.g. Senior Researcher")
    const deptInput = screen.getByPlaceholderText("e.g. Faculty of Life Sciences")
    const ctxInput = screen.getByPlaceholderText("e.g. Q4 Capability Review")

    fireEvent.change(roleInput, { target: { value: "Lead Technologist" } })
    fireEvent.change(deptInput, { target: { value: "Digital Services" } })
    fireEvent.change(ctxInput, { target: { value: "Annual Audit" } })

    const startBtn = screen.getByRole("button", { name: "Start assessment" })
    fireEvent.click(startBtn)

    // 2. Assessment stage
    expect(screen.getByText(`Question 1 of ${QUESTIONS.length}`)).toBeInTheDocument()

    // Answer all questions
    for (let i = 0; i < QUESTIONS.length; i++) {
      const option = screen.getByLabelText("Embedded and reviewed")
      fireEvent.click(option)

      if (i === QUESTIONS.length - 1) {
        const finishBtn = screen.getByRole("button", { name: "Finish assessment" })
        fireEvent.click(finishBtn)
      } else {
        const nextBtn = screen.getByRole("button", { name: "Next" })
        fireEvent.click(nextBtn)
      }
    }

    // 3. Results stage
    expect(screen.getByRole("heading", { level: 1, name: "Your Results" })).toBeInTheDocument()
    expect(screen.getByText("Lead Technologist")).toBeInTheDocument()
    expect(screen.getByText("Digital Services")).toBeInTheDocument()
    expect(screen.getByText("Annual Audit")).toBeInTheDocument()

    // All domains answered max -> 100/100
    const scoreElements = screen.getAllByText("100/100")
    expect(scoreElements.length).toBe(6)

    // Check localStorage saved the snapshot
    const stored = localStorage.getItem("cp_capability_history")
    expect(stored).not.toBeNull()

    // 4. Restart workflow
    const restartBtn = screen.getByRole("button", { name: "Restart assessment" })
    fireEvent.click(restartBtn)

    // Back to Intro stage
    expect(screen.getByRole("heading", { level: 1, name: "AI Capability Self-Assessment" })).toBeInTheDocument()
  })
})

