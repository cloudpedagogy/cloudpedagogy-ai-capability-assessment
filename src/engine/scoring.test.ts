import { describe, it, expect } from "vitest"
import { scoreAssessment, bandLabel, type Response, type Metadata } from "./scoring"
import { QUESTIONS } from "../data/questions"

describe("scoring engine", () => {
  it("computes 0 scores across all domains when all questions are answered 0", () => {
    const responses: Record<string, Response> = {}
    for (const q of QUESTIONS) {
      responses[q.id] = { value: 0, confidence: "medium" }
    }

    const metadata: Omit<Metadata, "timestamp"> = {
      role: "Lead Educator",
      department: "Education",
      context: "Self-Review"
    }

    const result = scoreAssessment(responses, metadata)

    expect(result.scores.awareness).toBe(0)
    expect(result.scores.co_agency).toBe(0)
    expect(result.scores.practice).toBe(0)
    expect(result.scores.ethics).toBe(0)
    expect(result.scores.governance).toBe(0)
    expect(result.scores.reflection).toBe(0)
    expect(result.derived.domains_at_or_above_mid_count).toBe(0)
    expect(result.metadata.role).toBe("Lead Educator")
    expect(result.metadata.department).toBe("Education")
    expect(result.metadata.context).toBe("Self-Review")
    expect(result.metadata.timestamp).toBeDefined()
  })

  it("computes 100 scores across all domains when all questions are answered 3 (max)", () => {
    const responses: Record<string, Response> = {}
    for (const q of QUESTIONS) {
      responses[q.id] = { value: 3, confidence: "high" }
    }

    const result = scoreAssessment(responses, {})

    expect(result.scores.awareness).toBe(100)
    expect(result.scores.co_agency).toBe(100)
    expect(result.scores.practice).toBe(100)
    expect(result.scores.ethics).toBe(100)
    expect(result.scores.governance).toBe(100)
    expect(result.scores.reflection).toBe(100)
    expect(result.derived.domains_at_or_above_mid_count).toBe(6)
  })

  it("handles missing responses safely by treating unselected questions as 0", () => {
    const responses: Record<string, Response> = {}
    // only answer awareness_1 with 3
    responses["awareness_1"] = { value: 3, confidence: "low" }

    const result = scoreAssessment(responses, {})
    // awareness domain has 4 questions: sum = 3, max = 12, pct = (3 / 12) * 100 = 25%
    expect(result.scores.awareness).toBe(25)
    expect(result.scores.co_agency).toBe(0)
    expect(result.derived.domains_at_or_above_mid_count).toBe(0)
  })

  describe("bandLabel", () => {
    it("returns Emerging for scores <= 33", () => {
      expect(bandLabel(0)).toBe("Emerging")
      expect(bandLabel(33)).toBe("Emerging")
    })

    it("returns Developing for scores between 34 and 66", () => {
      expect(bandLabel(34)).toBe("Developing")
      expect(bandLabel(50)).toBe("Developing")
      expect(bandLabel(66)).toBe("Developing")
    })

    it("returns Established for scores >= 67", () => {
      expect(bandLabel(67)).toBe("Established")
      expect(bandLabel(100)).toBe("Established")
    })
  })
})

