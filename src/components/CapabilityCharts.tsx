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
      <h3 style={{ marginBottom: "var(--spacing-md)" }}>Visual profile</h3>

      <div style={{ width: "100%", height: 320, marginBottom: "2rem" }}>
        <ResponsiveContainer>
          <RadarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <PolarGrid stroke="var(--color-border-default)" />
            <PolarAngleAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 12 }} axisLine={false} />
            <Radar 
              dataKey="value" 
              stroke="var(--color-text-primary)" 
              fill="var(--color-text-primary)" 
              fillOpacity={0.1} 
              dot={{ r: 4, fill: "var(--color-text-primary)" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border-default)" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="label" width={140} tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "var(--bg-white)", 
                border: "1px solid var(--color-border-default)",
                borderRadius: "var(--radius-6)",
                fontSize: "var(--font-size-meta)"
              }} 
            />
            <Bar dataKey="value" fill="var(--color-text-primary)" radius={[0, 4, 4, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}
