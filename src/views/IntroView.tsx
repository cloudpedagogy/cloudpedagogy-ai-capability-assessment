type IntroViewProps = {
  onStart: () => void
}

export default function IntroView({ onStart }: IntroViewProps) {
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

        <p style={{ fontSize: "var(--font-size-meta)", fontStyle: "italic", color: "var(--color-text-secondary)" }}>
          This is not an audit or benchmark. It is a reflective diagnostic designed
          to support responsible, human-centred use of AI.
        </p>
      </div>

      <div style={{ marginTop: "var(--spacing-lg)" }}>
        <button onClick={onStart}>Start assessment</button>
      </div>
    </div>
  )
}
