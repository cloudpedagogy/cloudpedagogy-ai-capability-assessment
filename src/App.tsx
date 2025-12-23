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
    <main style={{ padding: "2rem", maxWidth: 720, margin: "0 auto" }}>
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
  )
}
