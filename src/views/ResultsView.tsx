import { useEffect, useRef, useState } from "react"
import type { AssessmentResult, AssessmentSnapshot } from "../engine/scoring"
import { bandLabel } from "../engine/scoring"
import CapabilityCharts from "../components/CapabilityCharts"

const STORAGE_KEY = "cp_capability_history"
const RECOVERY_KEY = "cp_capability_history_corrupted"

function isValidSnapshot(item: unknown): item is AssessmentSnapshot {
  if (!item || typeof item !== "object") return false
  const s = item as Partial<AssessmentSnapshot>
  return typeof s.scores === "object" && s.scores !== null
}

function preserveCorruptedPayload(raw: string): boolean {
  try {
    const uniqueKey = `${RECOVERY_KEY}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    localStorage.setItem(uniqueKey, raw)
    return true
  } catch {
    // Quota or permission failure: backup failed
    return false
  }
}

function loadHistory(): {
  history: AssessmentSnapshot[]
  corruptedPayload: string | null
} {
  let historyJson: string | null = null
  try {
    historyJson = localStorage.getItem(STORAGE_KEY)
  } catch {
    return { history: [], corruptedPayload: null }
  }

  if (!historyJson) {
    return { history: [], corruptedPayload: null }
  }

  try {
    const parsed = JSON.parse(historyJson)
    if (!Array.isArray(parsed)) {
      return { history: [], corruptedPayload: historyJson }
    }
    const validSnapshots = parsed.filter(isValidSnapshot)
    if (validSnapshots.length !== parsed.length) {
      return { history: validSnapshots, corruptedPayload: historyJson }
    }
    return { history: validSnapshots, corruptedPayload: null }
  } catch {
    return { history: [], corruptedPayload: historyJson }
  }
}

function saveSnapshot(
  result: ResultsViewProps["result"],
  currentHistory: AssessmentSnapshot[],
  corruptedPayload: string | null
) {
  if (corruptedPayload !== null) {
    const backedUp = preserveCorruptedPayload(corruptedPayload)
    if (!backedUp) {
      // If a corrupted payload could not be backed up, do not overwrite STORAGE_KEY
      return
    }
  }

  // Prevent duplicate snapshots:
  // If the latest snapshot in history is identical (same timestamp, metadata and scores),
  // this is a component remount of the same assessment; do not duplicate it.
  if (currentHistory.length > 0) {
    const latest = currentHistory[0]
    if (
      latest.metadata?.timestamp === result.metadata?.timestamp &&
      latest.metadata?.role === result.metadata?.role &&
      latest.metadata?.department === result.metadata?.department &&
      latest.metadata?.context === result.metadata?.context &&
      JSON.stringify(latest.scores) === JSON.stringify(result.scores)
    ) {
      return
    }
  }

  const id =
    (result as Partial<AssessmentSnapshot>).id ||
    (typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2))

  const newSnapshot: AssessmentSnapshot = {
    ...result,
    id
  }
  const newHistory = [newSnapshot, ...currentHistory].slice(0, 10)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
  } catch {
    // Storage access or quota error; avoid crashing the view
  }
}

type ResultsViewProps = {
  result: AssessmentResult & {
    recommendations?: {
      summaryPrimary: string | null
      summarySecondary: string[]
      actions: string[]
      risks: string[]
    }
    metadata: {
      timestamp: string
      role?: string
      department?: string
      context?: string
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
  const { scores, derived, recommendations, metadata } = result
  const [previous] = useState<AssessmentSnapshot | null>(() => {
    const { history } = loadHistory()
    return history.length > 0 ? history[0] : null
  })
  const [capabilityNotes, setCapabilityNotes] = useState(result.capabilityNotes || "")
  const [governanceNotes, setGovernanceNotes] = useState(result.governanceNotes || "")
  const [isNotesExpanded, setIsNotesExpanded] = useState(false)
  const savedResultRef = useRef<ResultsViewProps["result"] | null>(null)

  useEffect(() => {
    if (savedResultRef.current === result) return
    savedResultRef.current = result

    const { history, corruptedPayload } = loadHistory()
    saveSnapshot(result, history, corruptedPayload)
  }, [result])

  function downloadJSON() {
    const data = JSON.stringify({ ...result, capabilityNotes, governanceNotes }, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ai-capability-snapshot-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function downloadMarkdown() {
    let md = `# AI Capability Snapshot\n\n`
    md += `**Date**: ${new Date(metadata.timestamp).toLocaleString()}\n`
    md += `**Role**: ${metadata.role || "Not specified"}\n`
    md += `**Department**: ${metadata.department || "Not specified"}\n`
    md += `**Context**: ${metadata.context || "Not specified"}\n\n`
    
    md += `## Capability Scores\n\n`
    Object.entries(scores).forEach(([domain, score]) => {
      md += `- **${DOMAIN_LABELS[domain]}**: ${score}/100 (${bandLabel(score)})\n`
    })
    
    if (recommendations) {
      md += `\n## Strategic Summary\n\n`
      md += `${recommendations.summaryPrimary}\n\n`
      recommendations.summarySecondary.forEach(s => md += `${s}\n\n`)
      
      md += `## Priority Actions\n\n`
      recommendations.actions.forEach(a => md += `- ${a}\n`)
    }

    if (capabilityNotes || governanceNotes) {
      md += `\n## Capability & Governance Notes\n\n`
      if (capabilityNotes) {
        md += `### Capability Notes\n${capabilityNotes}\n\n`
      }
      if (governanceNotes) {
        md += `### Governance Notes\n${governanceNotes}\n\n`
      }
    }
    
    md += `\n---\n*Generated by CloudPedagogy AI Capability Assessment*`

    const blob = new Blob([md], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ai-capability-snapshot-${new Date().toISOString().split('T')[0]}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ maxWidth: "var(--max-width)", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "var(--spacing-lg)" }}>
        <div>
          <h1>Your Results</h1>
          <p className="metadata">
            Generated using the CloudPedagogy AI Capability Framework · {new Date(metadata.timestamp).toLocaleDateString()}
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--spacing-sm)" }} className="no-print">
          <button className="secondary" onClick={downloadJSON} style={{ fontSize: "var(--font-size-meta)", padding: "var(--spacing-sm) var(--spacing-md)" }}>
            Download JSON
          </button>
          <button className="secondary" onClick={downloadMarkdown} style={{ fontSize: "var(--font-size-meta)", padding: "var(--spacing-sm) var(--spacing-md)" }}>
            Download MD
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-lg)" }}>
        <div className="card">
          <h3 style={{ fontSize: "var(--font-size-meta)", textTransform: "uppercase", color: "var(--color-text-secondary)", letterSpacing: "0.05em", marginBottom: "var(--spacing-md)" }}>Assessment Context</h3>
          <div style={{ display: "grid", gap: "var(--spacing-sm)" }}>
            <div>
              <span className="metadata">Role:</span>
              <div style={{ fontWeight: 600 }}>{metadata.role || "Not specified"}</div>
            </div>
            <div>
              <span className="metadata">Dept:</span>
              <div style={{ fontWeight: 600 }}>{metadata.department || "Not specified"}</div>
            </div>
            <div>
              <span className="metadata">Goal:</span>
              <div style={{ fontWeight: 600 }}>{metadata.context || "Not specified"}</div>
            </div>
          </div>
        </div>
        <div className="card">
          <p>
            This summary is based on your responses across six AI capability domains.
            It highlights your current capability profile and priority areas for development.
            {previous && (
              <span style={{ display: "block", marginTop: "var(--spacing-sm)", color: "var(--color-text-secondary)", fontSize: "var(--font-size-meta)" }}>
                * Comparison shown against your previous assessment{previous.metadata?.timestamp && !isNaN(new Date(previous.metadata.timestamp).getTime()) ? ` from ${new Date(previous.metadata.timestamp).toLocaleDateString()}` : ""}.
              </span>
            )}
          </p>
        </div>
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
                <th style={{ textAlign: "left", padding: "var(--spacing-sm) 0", fontSize: "var(--font-size-meta)", fontWeight: 700 }}>Trend</th>
                <th style={{ textAlign: "left", padding: "var(--spacing-sm) 0", fontSize: "var(--font-size-meta)", fontWeight: 700 }}>Band</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(scores).map(([domain, score]) => {
                const prevScore = previous?.scores[domain as keyof typeof scores]
                const delta = prevScore !== undefined ? score - prevScore : null
                
                return (
                  <tr key={domain} style={{ borderBottom: "1px solid var(--color-border-default)" }}>
                    <td style={{ padding: "12px 0", fontSize: "var(--font-size-meta)", color: "var(--color-text-primary)" }}>
                      {DOMAIN_LABELS[domain] ?? domain}
                    </td>
                    <td style={{ padding: "12px 0", fontSize: "var(--font-size-meta)", color: "var(--color-text-primary)", fontWeight: 500 }}>
                      {score}/100
                    </td>
                    <td style={{ padding: "12px 0", fontSize: "var(--font-size-meta)", color: delta === null ? "var(--color-text-muted)" : delta > 0 ? "#059669" : delta < 0 ? "#dc2626" : "var(--color-text-secondary)" }}>
                      {delta === null ? "—" : `${delta > 0 ? "+" : ""}${delta}`}
                    </td>
                    <td style={{ padding: "12px 0", fontSize: "var(--font-size-meta)", color: "var(--color-text-secondary)" }}>
                      {bandLabel(score)}
                    </td>
                  </tr>
                )
              })}
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

      {/* ---- Capability & Governance Notes (Optional) ---- */}
      <section className="card no-print" style={{ marginTop: "var(--spacing-lg)", padding: "var(--spacing-md)" }}>
        <button 
          onClick={() => setIsNotesExpanded(!isNotesExpanded)}
          style={{ 
            width: "100%", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            textAlign: "left",
            color: "var(--color-text-primary)"
          }}
        >
          <h3 style={{ margin: 0, fontSize: "1rem" }}>Capability & Governance Notes (Optional)</h3>
          <span style={{ fontSize: "1.2rem" }}>{isNotesExpanded ? "−" : "+"}</span>
        </button>

        {isNotesExpanded && (
          <div style={{ marginTop: "var(--spacing-md)", display: "grid", gap: "var(--spacing-lg)" }}>
            {/* Lightweight capability and governance layer */}
            {/* Optional, non-blocking, and does not alter core workflow */}
            <div>
              <label htmlFor="capability-notes" style={{ display: "block", fontSize: "var(--font-size-meta)", fontWeight: 600, marginBottom: "4px", color: "var(--color-text-secondary)" }}>
                Capability Notes
              </label>
              <textarea
                id="capability-notes"
                value={capabilityNotes}
                onChange={(e) => setCapabilityNotes(e.target.value)}
                placeholder="What capability this supports, suggested AI use patterns, or reflection prompts..."
                style={{ 
                  width: "100%", 
                  minHeight: "80px", 
                  padding: "var(--spacing-sm)", 
                  fontSize: "var(--font-size-meta)",
                  border: "1px solid var(--color-border-default)",
                  borderRadius: "4px",
                  backgroundColor: "var(--bg-white)",
                  color: "var(--color-text-primary)",
                  fontFamily: "inherit"
                }}
              />
            </div>

            <div>
              <label htmlFor="governance-notes" style={{ display: "block", fontSize: "var(--font-size-meta)", fontWeight: 600, marginBottom: "4px", color: "var(--color-text-secondary)" }}>
                Governance Notes
              </label>
              <textarea
                id="governance-notes"
                value={governanceNotes}
                onChange={(e) => setGovernanceNotes(e.target.value)}
                placeholder="AI involvement, assumptions, risks/concerns, or human review notes..."
                style={{ 
                  width: "100%", 
                  minHeight: "80px", 
                  padding: "var(--spacing-sm)", 
                  fontSize: "var(--font-size-meta)",
                  border: "1px solid var(--color-border-default)",
                  borderRadius: "4px",
                  backgroundColor: "var(--bg-white)",
                  color: "var(--color-text-primary)",
                  fontFamily: "inherit"
                }}
              />
            </div>
          </div>
        )}
      </section>

      <div style={{ marginTop: "var(--spacing-lg)", display: "flex", gap: "var(--spacing-md)" }} className="no-print">
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
