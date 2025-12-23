import type { AssessmentResult } from "./scoring"
import ruleset from "./ruleset.v1.json"

type Rule = typeof ruleset.rules[number]

export type Recommendation = {
  summaryPrimary: string | null
  summarySecondary: string[]
  actions: string[]
  risks: string[]
}

export function generateRecommendations(
  result: AssessmentResult
): Recommendation {
  const summariesPrimary: string[] = []
  const summariesSecondary: string[] = []
  const actions: { priority: number; text: string }[] = []
  const risks: string[] = []

  for (const rule of ruleset.rules) {
    if (matches(rule, result)) {
      if (rule.summary?.primary) {
        summariesPrimary.push(rule.summary.primary)
      }

      if (rule.summary?.secondary) {
        summariesSecondary.push(rule.summary.secondary)
      }

      if (rule.actions) {
        for (const a of rule.actions) {
          actions.push({ priority: a.priority, text: a.text })
        }
      }

      if (rule.risks) {
        risks.push(...rule.risks)
      }
    }
  }

  const primary =
    summariesPrimary.length > 0 ? summariesPrimary[0] : null

  const orderedActions = actions
    .sort((a, b) => b.priority - a.priority)
    .map(a => a.text)
    .slice(0, 3)

  return {
    summaryPrimary: primary,
    summarySecondary: summariesSecondary,
    actions: orderedActions,
    risks
  }
}

function matches(rule: Rule, result: AssessmentResult): boolean {
  const { scores } = result
  const {
    anyDomainBelow,
    anyDomainAbove,
    allDomainsAbove,
    noDomainBelow,
    ethicsAbove,
    practiceBelow,
    practiceAbove,
    governanceBelow
  } = rule.when

  if (anyDomainBelow !== undefined) {
    if (!Object.values(scores).some(s => s < anyDomainBelow)) {
      return false
    }
  }

  if (anyDomainAbove !== undefined) {
    if (!Object.values(scores).some(s => s >= anyDomainAbove)) {
      return false
    }
  }

  if (allDomainsAbove !== undefined) {
    if (!Object.values(scores).every(s => s >= allDomainsAbove)) {
      return false
    }
  }

  if (noDomainBelow !== undefined) {
    if (!Object.values(scores).every(s => s >= noDomainBelow)) {
      return false
    }
  }

  if (ethicsAbove !== undefined) {
    if (scores.ethics < ethicsAbove) return false
  }

  if (practiceBelow !== undefined) {
    if (scores.practice >= practiceBelow) return false
  }

  if (practiceAbove !== undefined) {
    if (scores.practice < practiceAbove) return false
  }

  if (governanceBelow !== undefined) {
    if (scores.governance >= governanceBelow) return false
  }

  return true
}
