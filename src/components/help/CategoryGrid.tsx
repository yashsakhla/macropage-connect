import {
  PlayCircle, MessageSquare, Megaphone, FileText, Users,
  Zap, CreditCard, Code2, AlertCircle, Users2, Sparkles,
} from 'lucide-react'
import { useHelpCategories } from '@/hooks/useHelp'
import { hexToTranslucent } from '@/lib/utils'
import type { HelpCategory } from '@/types'

const ICON_MAP: Record<string, React.ReactNode> = {
  PlayCircle: <PlayCircle size={20} />,
  MessageSquare: <MessageSquare size={20} />,
  Megaphone: <Megaphone size={20} />,
  FileText: <FileText size={20} />,
  Users: <Users size={20} />,
  Zap: <Zap size={20} />,
  CreditCard: <CreditCard size={20} />,
  Code2: <Code2 size={20} />,
  AlertCircle: <AlertCircle size={20} />,
  Users2: <Users2 size={20} />,
  Sparkles: <Sparkles size={20} />,
}

interface Props {
  onCategoryClick?: (cat: HelpCategory) => void
}

export default function CategoryGrid({ onCategoryClick }: Props) {
  const { data: categories = [] as HelpCategory[] } = useHelpCategories()

  return (
    <div className="max-w-5xl mx-auto px-6 mb-10">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Browse documentation</h2>

      <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat: HelpCategory) => (
          <button
            key={cat.id}
            onClick={() => onCategoryClick?.(cat)}
            className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5 hover:border-[#c8e6d4] hover:shadow-sm cursor-pointer transition-all group text-left"
          >
            <div
              className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: hexToTranslucent(cat.color, 0.15), color: cat.color }}
            >
              {ICON_MAP[cat.icon] ?? <FileText size={20} />}
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{cat.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{cat.articleCount} articles</p>
            <p className="text-xs text-[#1a5c3a] font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              View articles →
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
