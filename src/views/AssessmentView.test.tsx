import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import AssessmentView from "./AssessmentView"
import { QUESTIONS } from "../data/questions"

describe("AssessmentView", () => {
  it("renders the initial question with options and disabled Next button", () => {
    const onComplete = vi.fn()
    render(<AssessmentView onComplete={onComplete} />)

    expect(screen.getByText(`Question 1 of ${QUESTIONS.length}`)).toBeInTheDocument()
    expect(screen.getByText(QUESTIONS[0].text)).toBeInTheDocument()
    expect(screen.getByText("Not in place")).toBeInTheDocument()
    expect(screen.getByText("Embedded and reviewed")).toBeInTheDocument()

    const nextBtn = screen.getByRole("button", { name: "Next" })
    expect(nextBtn).toBeDisabled()

    const prevBtn = screen.getByText("Previous")
    expect(prevBtn).toHaveStyle({ visibility: "hidden" })
  })

  it("enables Next button once a maturity level is selected and allows changing confidence", () => {
    const onComplete = vi.fn()
    render(<AssessmentView onComplete={onComplete} />)

    const nextBtn = screen.getByRole("button", { name: "Next" })
    expect(nextBtn).toBeDisabled()

    // Select option "Defined and used" (value 2)
    const option = screen.getByLabelText("Defined and used")
    fireEvent.click(option)
    expect(nextBtn).not.toBeDisabled()

    // Select confidence High
    const highConfidenceBtn = screen.getByRole("button", { name: "High" })
    fireEvent.click(highConfidenceBtn)

    // Navigate to next question
    fireEvent.click(nextBtn)
    expect(screen.getByText(`Question 2 of ${QUESTIONS.length}`)).toBeInTheDocument()
    expect(screen.getByText(QUESTIONS[1].text)).toBeInTheDocument()

    // Previous button should now be visible
    const prevBtn = screen.getByRole("button", { name: "Previous" })
    expect(prevBtn).toHaveStyle({ visibility: "visible" })

    // Clicking Previous returns to question 1
    fireEvent.click(prevBtn)
    expect(screen.getByText(`Question 1 of ${QUESTIONS.length}`)).toBeInTheDocument()
  })

  it("advances through questions to completion", () => {
    const onComplete = vi.fn()
    render(<AssessmentView onComplete={onComplete} />)

    // Answer each question
    for (let i = 0; i < QUESTIONS.length; i++) {
      expect(screen.getByText(`Question ${i + 1} of ${QUESTIONS.length}`)).toBeInTheDocument()
      const option = screen.getByLabelText("Defined and used")
      fireEvent.click(option)

      if (i === QUESTIONS.length - 1) {
        const finishBtn = screen.getByRole("button", { name: "Finish assessment" })
        fireEvent.click(finishBtn)
      } else {
        const nextBtn = screen.getByRole("button", { name: "Next" })
        fireEvent.click(nextBtn)
      }
    }

    expect(onComplete).toHaveBeenCalledTimes(1)
    const submittedResponses = onComplete.mock.calls[0][0]
    expect(Object.keys(submittedResponses).length).toBe(QUESTIONS.length)
    expect(submittedResponses[QUESTIONS[0].id].value).toBe(2)
  })
})
