import type { AssessmentResult } from "../engine/scoring"
import { bandLabel } from "../engine/scoring"
import CapabilityCharts from "../components/CapabilityCharts"

type ResultsViewProps = {
  result: AssessmentResult & {
    recommendations?: {
      summaryPrimary: string | null
      summarySecondary: string[]
      actions: string[]
      risks: string[]
    }
  }
  onRestart: () => void
}

const DOMAIN_LABELS: Record<string, string> = {
  awareness: "Awareness",
  co_agency: "Human–AI Co-Agency",
  practice: "Applied Practice & Innovation",
  ethics: "Ethics, Equity & Impact",
  governance: "Decision-Making & Governance",
  reflection: "Reflection, Learning & Renewal"
}

export default function ResultsView({
  result,
  onRestart
}: ResultsViewProps) {
  const { scores, derived, recommendations } = result

  return (
    <>
      <h2>Your Results</h2>

      <p style={{ fontSize: "0.9rem", color: "#555" }}>
        Generated using the CloudPedagogy AI Capability Framework ·{" "}
        {new Date().toLocaleDateString()}
      </p>

      <p>
        This summary is based on your responses across six AI capability domains.
        It highlights your current capability profile and priority areas for
        development.
      </p>

      {/* ---- Capability profile table ---- */}
      <h3>Capability profile</h3>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "0.5rem 0" }}>
              Domain
            </th>
            <th style={{ textAlign: "left", padding: "0.5rem 0" }}>
              Score
            </th>
            <th style={{ textAlign: "left", padding: "0.5rem 0" }}>
              Band
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(scores).map(([domain, score]) => (
            <tr key={domain} style={{ borderTop: "1px solid #e5e7eb" }}>
              <td style={{ padding: "0.5rem 0" }}>
                {DOMAIN_LABELS[domain] ?? domain}
              </td>
              <td style={{ padding: "0.5rem 0" }}>
                {score}/100
              </td>
              <td style={{ padding: "0.5rem 0" }}>
                {bandLabel(score)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ---- Visual charts (radar + bars) ---- */}
      <CapabilityCharts
        scores={scores}
        labels={DOMAIN_LABELS}
      />

      {/* ---- Derived indicators ---- */}
      <h3>Derived indicator</h3>

      <p>
        Domains at or above “Established” (≥67):{" "}
        <strong>{derived.domains_at_or_above_mid_count}</strong>
      </p>

      {/* ---- Recommendations (if present) ---- */}
      {recommendations && (
        <>
          <h3>Summary</h3>

          {recommendations.summaryPrimary && (
            <p>{recommendations.summaryPrimary}</p>
          )}

          {recommendations.summarySecondary.map((s, i) => (
            <p key={i}>{s}</p>
          ))}

          {recommendations.actions.length > 0 && (
            <>
              <h3>Priority actions</h3>
              <ul>
                {recommendations.actions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </>
          )}

          {recommendations.risks.length > 0 && (
            <>
              <h3>Key risks</h3>
              <ul>
                {recommendations.risks.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      <div style={{ marginTop: "2rem" }}>
        <button onClick={onRestart}>
          Restart assessment
        </button>
      </div>
    </>
  )
}
