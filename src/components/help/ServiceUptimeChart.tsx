import { BarChart, Bar, Cell, ResponsiveContainer, Tooltip, YAxis } from 'recharts'
import type { TooltipProps } from 'recharts'
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent'

type ServiceStatus = 'operational' | 'degraded' | 'outage'

interface Props {
  history: ServiceStatus[]
  status: ServiceStatus
}

const STATUS_COLOR: Record<ServiceStatus, string> = { operational: '#1a5c3a', degraded: '#f59e0b', outage: '#ef4444' }
const STATUS_LABEL: Record<ServiceStatus, string> = { operational: 'Operational', degraded: 'Degraded', outage: 'Outage' }
const MIN_BARS = 14

function CustomTooltip({ active, payload }: TooltipProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload as { rawStatus: ServiceStatus; label: string }
  return (
    <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-lg shadow-lg px-2.5 py-1.5">
      <p className="text-[0.65rem] font-semibold text-gray-700 dark:text-gray-200">{STATUS_LABEL[point.rawStatus as ServiceStatus]}</p>
      <p className="text-[0.6rem] text-gray-400 dark:text-gray-500">{point.label}</p>
    </div>
  )
}

export default function ServiceUptimeChart({ history, status }: Props) {
  // A single reported status just repeats as a flat baseline so there's still
  // a readable bar strip instead of one lonely bar in the middle of the chart.
  const padded = history.length >= MIN_BARS
    ? history
    : Array.from({ length: MIN_BARS }, (_, i) => history[i - (MIN_BARS - history.length)] ?? history[0] ?? status)

  const data = padded.map((h, i) => ({
    label: i === padded.length - 1 ? 'Now' : `${padded.length - i} checks ago`,
    value: 100,
    rawStatus: h,
  }))

  return (
    <div className="h-9">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barGap={3}>
          <YAxis domain={[0, 100]} hide />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Bar dataKey="value" radius={[2, 2, 2, 2]} isAnimationActive={false}>
            {data.map((d, i) => (
              <Cell key={i} fill={STATUS_COLOR[d.rawStatus as ServiceStatus]} fillOpacity={i === data.length - 1 ? 1 : 0.55} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
