import {
  PlayCircle, MessageSquare, Megaphone, FileText, Users,
  Zap, CreditCard, Code2, AlertCircle, Users2, Sparkles,
} from 'lucide-react'
import { useHelpCategories } from '@/hooks/useHelp'
import { hexToTranslucent } from '@/lib/utils'
import ArticleCard from './ArticleCard'
import type { HelpArticle, HelpCategory } from '@/types'

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
  docs: HelpArticle[]
  docsLoading: boolean
  activeCategory: HelpCategory | null
  onCategoryClick?: (cat: HelpCategory) => void
  onClearCategory: () => void
}

export default function CategoryGrid({ docs, docsLoading, activeCategory, onCategoryClick, onClearCategory }: Props) {
  const { data: categories = [] as HelpCategory[] } = useHelpCategories()

  return (
    <div className="max-w-6xl mx-auto px-6 mb-10">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Browse documentation</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat: HelpCategory) => (
          <button
            key={cat.id}
            onClick={() => onCategoryClick?.(cat)}
            className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-4 hover:border-[#c8e6d4] hover:shadow-sm cursor-pointer transition-all text-left"
          >
            <div
              className="w-9 h-9 rounded-xl mb-3 flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: hexToTranslucent(cat.color, 0.15), color: cat.color }}
            >
              {ICON_MAP[cat.icon] ?? <FileText size={18} />}
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{cat.name}</p>
          </button>
        ))}
      </div>

      {/* Articles — all, or filtered by the clicked category tile above */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {activeCategory ? `${activeCategory.name} articles` : 'All articles'}
          </h3>
          {activeCategory && (
            <button
              onClick={onClearCategory}
              className="text-xs text-[#1a5c3a] dark:text-emerald-400 font-medium hover:underline"
            >
              ← Show all
            </button>
          )}
        </div>

        {docsLoading ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">Loading articles…</div>
        ) : docs.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">No articles in this category yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {docs.map(article => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
