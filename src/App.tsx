import { useState } from "react"

import IntroView from "./views/IntroView"
import AssessmentView from "./views/AssessmentView"
import ResultsView from "./views/ResultsView"

import { scoreAssessment, type AssessmentResult } from "./engine/scoring"
import { generateRecommendations } from "./engine/recommend"

type AppStage = "intro" | "assessment" | "results"

type FullResult = AssessmentResult & {
  recommendations: ReturnType<typeof generateRecommendations>
}

export default function App() {
  const [stage, setStage] = useState<AppStage>("intro")
  const [result, setResult] = useState<FullResult | null>(null)

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ 
        padding: "var(--spacing-md) var(--spacing-lg)", 
        borderBottom: "1px solid var(--color-border-default)",
        backgroundColor: "var(--bg-white)"
      }}>
        <div style={{ maxWidth: "var(--max-width)", margin: "0 auto", display: "flex", flexDirection: "column", gap: "4px" }}>
          <a href="https://www.cloudpedagogy.com/" style={{ 
            fontSize: "var(--font-size-meta)", 
            textDecoration: "none", 
            color: "var(--color-text-secondary)",
            fontWeight: 500
          }}>
            CloudPedagogy
          </a>
          <div style={{ fontSize: "1rem", fontWeight: 700 }}>
            AI Capability Assessment
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {stage === "intro" && (
          <IntroView
            onStart={() => {
              setResult(null)
              setStage("assessment")
            }}
          />
        )}

        {stage === "assessment" && (
          <AssessmentView
            onComplete={(responses) => {
              const scored = scoreAssessment(responses)
              const recommendations = generateRecommendations(scored)

              setResult({
                ...scored,
                recommendations
              })

              setStage("results")
            }}
          />
        )}

        {stage === "results" && result && (
          <ResultsView
            result={result}
            onRestart={() => {
              setResult(null)
              setStage("intro")
            }}
          />
        )}

        {stage === "results" && !result && (
          <p>Results are not available. Please restart the assessment.</p>
        )}
      </main>

      <footer style={{ 
        padding: "var(--spacing-lg)", 
        borderTop: "1px solid var(--color-border-default)",
        textAlign: "center",
        backgroundColor: "var(--bg-white)"
      }}>
        <p className="metadata" style={{ margin: 0 }}>
          CloudPedagogy · Governance-ready AI and curriculum systems
        </p>
      </footer>
    </div>
  )
}
