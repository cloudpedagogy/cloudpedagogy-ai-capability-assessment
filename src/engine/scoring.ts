import { QUESTIONS, type Domain } from "../data/questions"

export type Scores = Record<Domain, number>

export type Derived = {
  domains_at_or_above_mid_count: number
}

export type AssessmentResult = {
  scores: Scores
  derived: Derived
}

const DOMAINS: Domain[] = [
  "awareness",
  "co_agency",
  "practice",
  "ethics",
  "governance",
  "reflection"
]

// Each question is answered 0–3 (4-point scale).
// We convert each domain to a 0–100 score:
//   domainScore = (sum(domainResponses) / (maxPerQuestion * numQuestionsInDomain)) * 100
// For v1: maxPerQuestion = 3, numQuestionsInDomain = 4
export function scoreAssessment(responses: Record<string, number>): AssessmentResult {
  const maxPerQuestion = 3

  const scores: Scores = {
    awareness: 0,
    co_agency: 0,
    practice: 0,
    ethics: 0,
    governance: 0,
    reflection: 0
  }

  // Sum responses by domain
  const domainSums: Record<Domain, number> = {
    awareness: 0,
    co_agency: 0,
    practice: 0,
    ethics: 0,
    governance: 0,
    reflection: 0
  }

  const domainCounts: Record<Domain, number> = {
    awareness: 0,
    co_agency: 0,
    practice: 0,
    ethics: 0,
    governance: 0,
    reflection: 0
  }

  for (const q of QUESTIONS) {
    const value = responses[q.id]

    // Defensive: if missing (shouldn’t happen due to UI), treat as 0
    const safeValue = typeof value === "number" ? value : 0

    domainSums[q.domain] += safeValue
    domainCounts[q.domain] += 1
  }

  // Compute % scores
  for (const d of DOMAINS) {
    const count = domainCounts[d] || 1
    const max = maxPerQuestion * count
    const pct = (domainSums[d] / max) * 100
    scores[d] = Math.round(pct)
  }

  // Derived: count domains at/above “mid” threshold (>= 67)
  const domains_at_or_above_mid_count = DOMAINS.filter((d) => scores[d] >= 67).length

  return {
    scores,
    derived: { domains_at_or_above_mid_count }
  }
}

export function bandLabel(score: number): "Emerging" | "Developing" | "Established" {
  if (score <= 33) return "Emerging"
  if (score <= 66) return "Developing"
  return "Established"
}
