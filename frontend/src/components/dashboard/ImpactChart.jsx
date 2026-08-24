import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'

export default function ImpactChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-forest/15 rounded-2xl p-8 text-center shadow-xs">
        <p className="text-sm text-ink/60">No impact data available yet.</p>
        <p className="text-xs text-ink/40 mt-1">Add products to visualize projected carbon and landfill metrics.</p>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-forest/20 p-3 rounded-xl shadow-md text-xs space-y-1">
          <p className="font-semibold text-forest-dark">{label}</p>
          <p className="text-forest">
            CO₂ Saved: <strong>{payload[0]?.value} kg</strong>
          </p>
          {payload[1] && (
            <p className="text-amber-dark">
              Landfill Diverted: <strong>{payload[1]?.value} kg</strong>
            </p>
          )}
          {payload[0]?.payload?.action && (
            <p className="text-ink/60 pt-1 border-t border-forest/10">
              Top Action: <em>{payload[0]?.payload?.action}</em>
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white border border-forest/15 rounded-2xl p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 mb-6">
        <div>
          <h2 className="font-bold text-forest-dark text-base">
            Projected Environmental Impact by Product
          </h2>
          <p className="text-xs text-ink/60 mt-0.5">
            Carbon reduction and landfill diversion for the top recommended action per item
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 bg-sage rounded-md text-ink/60 font-medium self-start sm:self-auto">
          Units: Kilograms (kg)
        </span>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
            <CartesianGrid stroke="#2F523318" vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: '#1F241F' }}
              tickLine={false}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis tick={{ fontSize: 12, fill: '#1F241F' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              formatter={(value) => (value === 'co2' ? 'CO₂ Saved (kg)' : 'Landfill Diverted (kg)')}
            />
            <Bar dataKey="co2" fill="#2F5233" radius={[4, 4, 0, 0]} name="co2" />
            <Bar dataKey="landfill" fill="#C08A3E" radius={[4, 4, 0, 0]} name="landfill" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
