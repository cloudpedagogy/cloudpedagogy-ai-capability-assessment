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
    <div style={{ maxWidth: "var(--max-width)", margin: "0 auto" }}>
      <h1>Your Results</h1>

      <p className="metadata" style={{ marginBottom: "var(--spacing-lg)" }}>
        Generated using the CloudPedagogy AI Capability Framework · {new Date().toLocaleDateString()}
      </p>

      <div className="card">
        <p>
          This summary is based on your responses across six AI capability domains.
          It highlights your current capability profile and priority areas for development.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))", gap: "var(--spacing-lg)" }}>
        {/* ---- Capability profile table ---- */}
        <section className="card">
          <h3>Capability profile</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "var(--spacing-md)" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--color-text-primary)" }}>
                <th style={{ textAlign: "left", padding: "var(--spacing-sm) 0", fontSize: "var(--font-size-meta)", fontWeight: 700 }}>Domain</th>
                <th style={{ textAlign: "left", padding: "var(--spacing-sm) 0", fontSize: "var(--font-size-meta)", fontWeight: 700 }}>Score</th>
                <th style={{ textAlign: "left", padding: "var(--spacing-sm) 0", fontSize: "var(--font-size-meta)", fontWeight: 700 }}>Band</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(scores).map(([domain, score]) => (
                <tr key={domain} style={{ borderBottom: "1px solid var(--color-border-default)" }}>
                  <td style={{ padding: "12px 0", fontSize: "var(--font-size-meta)", color: "var(--color-text-primary)" }}>
                    {DOMAIN_LABELS[domain] ?? domain}
                  </td>
                  <td style={{ padding: "12px 0", fontSize: "var(--font-size-meta)", color: "var(--color-text-primary)", fontWeight: 500 }}>
                    {score}/100
                  </td>
                  <td style={{ padding: "12px 0", fontSize: "var(--font-size-meta)", color: "var(--color-text-secondary)" }}>
                    {bandLabel(score)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: "var(--spacing-lg)", paddingTop: "var(--spacing-md)", borderTop: "1px solid var(--color-border-default)" }}>
            <p className="metadata" style={{ margin: 0 }}>
              Domains at or above “Established” (≥67): <strong>{derived.domains_at_or_above_mid_count}</strong>
            </p>
          </div>
        </section>

        {/* ---- Visual charts ---- */}
        <section className="card">
          <CapabilityCharts
            scores={scores}
            labels={DOMAIN_LABELS}
          />
        </section>
      </div>

      {/* ---- Recommendations ---- */}
      {recommendations && (
        <div style={{ marginTop: "var(--spacing-lg)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))", gap: "var(--spacing-lg)" }}>
          <section className="card">
            <h3>Strategic Summary</h3>
            <div style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-meta)" }}>
              {recommendations.summaryPrimary && (
                <p style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>{recommendations.summaryPrimary}</p>
              )}

              {recommendations.summarySecondary.map((s, i) => (
                <p key={i}>{s}</p>
              ))}
            </div>

            {recommendations.actions.length > 0 && (
              <div style={{ marginTop: "var(--spacing-lg)" }}>
                <h3 style={{ fontSize: "1rem" }}>Priority actions</h3>
                <ul style={{ paddingLeft: "var(--spacing-lg)", color: "var(--color-text-secondary)", fontSize: "var(--font-size-meta)" }}>
                  {recommendations.actions.map((a, i) => (
                    <li key={i} style={{ marginBottom: "var(--spacing-sm)" }}>{a}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {recommendations.risks.length > 0 && (
            <section className="card" style={{ borderColor: "var(--color-text-primary)", borderLeftWidth: "4px" }}>
              <h3 style={{ color: "var(--color-text-primary)" }}>Key risks & considerations</h3>
              <ul style={{ paddingLeft: "var(--spacing-lg)", color: "var(--color-text-secondary)", fontSize: "var(--font-size-meta)", marginTop: "var(--spacing-md)" }}>
                {recommendations.risks.map((r, i) => (
                  <li key={i} style={{ marginBottom: "var(--spacing-sm)" }}>{r}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      <div style={{ marginTop: "var(--spacing-lg)", display: "flex", gap: "var(--spacing-md)" }}>
        <button className="secondary" onClick={() => window.print()}>
          Export as PDF
        </button>
        <button onClick={onRestart}>
          Restart assessment
        </button>
      </div>
    </div>
  )
}
