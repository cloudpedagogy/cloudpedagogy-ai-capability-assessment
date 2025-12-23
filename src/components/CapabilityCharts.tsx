import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts"

type Props = {
  scores: Record<string, number>
  labels: Record<string, string>
}

export default function CapabilityCharts({ scores, labels }: Props) {
  const data = Object.entries(scores).map(([key, value]) => ({
    key,
    label: labels[key] ?? key,
    value
  }))

  return (
    <>
      <h3>Visual profile</h3>

      <div style={{ width: "100%", height: 320, marginBottom: "1.5rem" }}>
        <ResponsiveContainer>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="label" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar dataKey="value" fillOpacity={0.25} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis type="category" dataKey="label" width={160} />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}
