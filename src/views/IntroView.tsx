import { useState } from "react"
import type { Metadata } from "../engine/scoring"

type IntroViewProps = {
  onStart: (metadata: Omit<Metadata, 'timestamp'>) => void
}

export default function IntroView({ onStart }: IntroViewProps) {
  const [metadata, setMetadata] = useState<Omit<Metadata, 'timestamp'>>({
    role: "",
    department: "",
    context: ""
  })

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto" }}>
      <h1>AI Capability Self-Assessment</h1>

      <div className="card">
        <p>
          This self-assessment helps you reflect on your current AI capability
          across six domains, based on the CloudPedagogy AI Capability Framework.
        </p>

        <ul style={{ paddingLeft: "var(--spacing-lg)", marginBottom: "var(--spacing-lg)" }}>
          <li style={{ marginBottom: "var(--spacing-sm)", color: "var(--color-text-secondary)" }}>Assesses capability across six domains</li>
          <li style={{ marginBottom: "var(--spacing-sm)", color: "var(--color-text-secondary)" }}>Highlights strengths, gaps, and risks</li>
          <li style={{ marginBottom: "var(--spacing-sm)", color: "var(--color-text-secondary)" }}>Provides prioritised next steps</li>
          <li style={{ marginBottom: "var(--spacing-sm)", color: "var(--color-text-secondary)" }}>Designed for education, research, and public service</li>
        </ul>

        <div style={{ borderTop: "1px solid var(--color-border-default)", marginTop: "var(--spacing-lg)", paddingTop: "var(--spacing-lg)" }}>
          <h3 style={{ marginBottom: "var(--spacing-md)" }}>Assessment Metadata (Optional)</h3>
          
          <div style={{ display: "grid", gap: "var(--spacing-md)" }}>
            <div>
              <label style={{ display: "block", fontSize: "var(--font-size-meta)", fontWeight: 600 }}>Your Role</label>
              <input 
                type="text" 
                value={metadata.role} 
                onChange={(e) => setMetadata({ ...metadata, role: e.target.value })}
                placeholder="e.g. Senior Researcher"
                style={{ width: "100%", marginTop: "4px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "var(--font-size-meta)", fontWeight: 600 }}>Department / Team</label>
              <input 
                type="text" 
                value={metadata.department} 
                onChange={(e) => setMetadata({ ...metadata, department: e.target.value })}
                placeholder="e.g. Faculty of Life Sciences"
                style={{ width: "100%", marginTop: "4px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "var(--font-size-meta)", fontWeight: 600 }}>Assessment Context</label>
              <input 
                type="text" 
                value={metadata.context} 
                onChange={(e) => setMetadata({ ...metadata, context: e.target.value })}
                placeholder="e.g. Q4 Capability Review"
                style={{ width: "100%", marginTop: "4px" }}
              />
            </div>
          </div>
        </div>

        <p style={{ fontSize: "var(--font-size-meta)", fontStyle: "italic", color: "var(--color-text-secondary)", marginTop: "var(--spacing-lg)" }}>
          This is not an audit or benchmark. It is a reflective diagnostic designed
          to support responsible, human-centred use of AI.
        </p>
      </div>

      <div style={{ marginTop: "var(--spacing-lg)" }}>
        <button onClick={() => onStart(metadata)}>Start assessment</button>
      </div>
    </div>
  )
}

