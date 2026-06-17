import { useState } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Plus } from 'lucide-react'
import { useAIAnalytics } from '@/hooks/useAIBot'
import PageLoader from '@/components/shared/PageLoader'

type DateRange = '7d' | '30d' | '90d'

export default function AIAnalytics() {
  const [range, setRange] = useState<DateRange>('7d')
  const { data, isLoading } = useAIAnalytics()

  if (isLoading) return <PageLoader />
  if (!data) return null

  const stats = [
    { label: 'AI conversations today', value: data.conversationsToday, color: 'text-purple-600' },
    { label: 'Avg confidence', value: `${data.avgConfidence}%`, color: 'text-blue-600' },
    { label: 'Handoff rate', value: `${data.handoffRate}%`, color: 'text-amber-600' },
    { label: 'Resolved without handoff', value: `${data.resolutionRate}%`, color: 'text-green-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-800">AI Performance</p>
        <div className="flex gap-1 bg-[#f7f8f6] rounded-xl p-1">
          {(['7d', '30d', '90d'] as DateRange[]).map((r) => (
            <button key={r} onClick={() => setRange(r)} className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${range === r ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>{r}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <p className="text-sm font-semibold text-gray-800 mb-4">AI vs Human conversations</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data.dailyData}>
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e8ebe8', fontSize: 11 }} />
            <Area type="monotone" dataKey="ai" stroke="#a855f7" fill="#f3e8ff" strokeWidth={2} name="AI handled" />
            <Area type="monotone" dataKey="human" stroke="#1a5c3a" fill="#e8f5ee" strokeWidth={2} name="Human" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <p className="text-sm font-semibold text-gray-800 mb-4">Confidence distribution</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data.confidenceDistribution}>
              <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e8ebe8', fontSize: 11 }} />
              <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} name="Conversations" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <p className="text-sm font-semibold text-gray-800 mb-4">Top topics handled</p>
          <div className="space-y-2.5">
            {data.topTopics.map((t: { topic: string; count: number }, i: number) => {
              const maxCount = Math.max(...data.topTopics.map((x: { count: number }) => x.count))
              const pct = (t.count / maxCount) * 100
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{t.topic}</span>
                    <span className="font-medium">{t.count}</span>
                  </div>
                  <div className="w-full bg-[#f7f8f6] rounded-full h-1.5">
                    <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <p className="text-sm font-semibold text-gray-800 mb-4">Questions AI couldn't answer well</p>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Times asked</th>
                <th>Confidence</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.unansweredQuestions.map((q: { question: string; timesAsked: number; confidence: number }, i: number) => (
                <tr key={i}>
                  <td className="text-xs text-gray-700">{q.question}</td>
                  <td className="text-xs text-gray-600">{q.timesAsked}x</td>
                  <td>
                    <span className="badge badge-red text-2xs">{q.confidence}%</span>
                  </td>
                  <td>
                    <button className="btn-outline h-7 text-2xs px-2 flex items-center gap-1">
                      <Plus size={10} /> Add to KB
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
