export default function SummaryCards({ productCount, avgCondition, totalCo2, totalLandfill }) {
  const cards = [
    {
      label: 'Products Tracked',
      value: productCount,
      icon: '📦',
      helper: 'Active items in inventory',
    },
    {
      label: 'Avg. Condition Score',
      value: avgCondition ? `${avgCondition} / 10` : '—',
      icon: '✨',
      helper: 'Overall portfolio health',
    },
    {
      label: 'Available CO₂ Savings',
      value: `${totalCo2} kg`,
      icon: '🌱',
      helper: 'Via top circular actions',
    },
    {
      label: 'Landfill Diverted',
      value: `${totalLandfill || 0} kg`,
      icon: '♻️',
      helper: 'Waste kept from dumps',
    },
  ]

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white border border-forest/15 rounded-2xl p-5 shadow-xs hover:border-forest/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-ink/50 uppercase tracking-wider">{c.label}</p>
            <span className="text-xl">{c.icon}</span>
          </div>
          <p className="text-2xl font-bold text-forest-dark mt-2 tracking-tight">{c.value}</p>
          <p className="text-xs text-ink/45 mt-1">{c.helper}</p>
        </div>
      ))}
    </div>
  )
}
