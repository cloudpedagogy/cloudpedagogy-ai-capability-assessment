import { describe, it, expect } from "vitest"
import { generateRecommendations } from "./recommend"
import type { AssessmentResult } from "./scoring"

function createMockResult(scores: Record<string, number>): AssessmentResult {
  return {
    scores: {
      awareness: scores.awareness ?? 50,
      co_agency: scores.co_agency ?? 50,
      practice: scores.practice ?? 50,
      ethics: scores.ethics ?? 50,
      governance: scores.governance ?? 50,
      reflection: scores.reflection ?? 50
    },
    derived: {
      domains_at_or_above_mid_count: Object.values(scores).filter(s => s >= 67).length
    },
    responses: {},
    metadata: {
      timestamp: "2026-04-10T10:00:00.000Z",
      role: "Faculty Member",
      department: "Humanities"
    }
  }
}

describe("recommendation engine", () => {
  it("matches mixed maturity rule when some domains are below 34 and others above 67", () => {
    const result = createMockResult({
      awareness: 25,
      co_agency: 75,
      practice: 50,
      ethics: 30,
      governance: 70,
      reflection: 50
    })

    const recs = generateRecommendations(result)
    expect(recs.summaryPrimary).toContain("uneven AI capability development")
    expect(recs.actions.length).toBeGreaterThan(0)
    expect(recs.risks.length).toBeGreaterThan(0)
  })

  it("limits priority actions to at most 3 sorted by priority descending", () => {
    const result = createMockResult({
      awareness: 10,
      co_agency: 20,
      practice: 15,
      ethics: 10,
      governance: 10,
      reflection: 10
    })

    const recs = generateRecommendations(result)
    expect(recs.actions.length).toBeLessThanOrEqual(3)
  })

  it("identifies foundation gaps when domains are below 34", () => {
    const result = createMockResult({
      awareness: 20,
      co_agency: 25,
      practice: 20,
      ethics: 20,
      governance: 20,
      reflection: 20
    })

    const recs = generateRecommendations(result)
    expect(recs.actions).toContain("Establish shared foundations for AI understanding, ethics, and governance before expanding use cases.")
  })

  it("handles broadly established developing profile when no domain is below 34 but some are below 67", () => {
    const result = createMockResult({
      awareness: 50,
      co_agency: 55,
      practice: 60,
      ethics: 50,
      governance: 55,
      reflection: 50
    })

    const recs = generateRecommendations(result)
    expect(recs.summaryPrimary).toContain("broadly established AI capability")
  })
})

