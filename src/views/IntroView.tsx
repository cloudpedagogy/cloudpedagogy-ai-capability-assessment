type IntroViewProps = {
  onStart: () => void
}

export default function IntroView({ onStart }: IntroViewProps) {
  return (
    <>
      <h1>AI Capability Self-Assessment</h1>

      <p>
        This self-assessment helps you reflect on your current AI capability
        across six domains, based on the CloudPedagogy AI Capability Framework.
      </p>

      <ul>
        <li>Assesses capability across six domains</li>
        <li>Highlights strengths, gaps, and risks</li>
        <li>Provides prioritised next steps</li>
        <li>Designed for education, research, and public service</li>
      </ul>

      <p>
        This is not an audit or benchmark. It is a reflective diagnostic designed
        to support responsible, human-centred use of AI.
      </p>

      <button onClick={onStart}>Start assessment</button>
    </>
  )
}
