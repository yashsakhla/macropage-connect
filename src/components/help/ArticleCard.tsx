import {
  Clock, ArrowRight, CreditCard, Settings, Inbox, UserCircle, HelpCircle,
  Zap, Megaphone, Users, Users2, Rocket, MessageCircle, FileText, Sparkles,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { HelpArticle } from '@/types'
import { fromNow, getCategoryColor, getCategoryLabel, estimateReadTime, markdownExcerpt } from '@/lib/utils'

interface Props {
  article: HelpArticle
}

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  account: <UserCircle size={20} />,
  automation: <Zap size={20} />,
  billing: <CreditCard size={20} />,
  campaigns: <Megaphone size={20} />,
  contacts: <Users size={20} />,
  general: <HelpCircle size={20} />,
  'getting-started': <Rocket size={20} />,
  inbox: <Inbox size={20} />,
  settings: <Settings size={20} />,
  team: <Users2 size={20} />,
  templates: <FileText size={20} />,
  whatsapp: <MessageCircle size={20} />,
}

// Mix a hex color toward black so a two-stop gradient can be built from the
// single brand hex each category already has in getCategoryColor().
function darken(hex: string, amount: number): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `rgb(${Math.round(r * (1 - amount))}, ${Math.round(g * (1 - amount))}, ${Math.round(b * (1 - amount))})`
}

const DOT_PATTERN =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14'%3E%3Ccircle cx='1.5' cy='1.5' r='1.5' fill='%23ffffff' fill-opacity='0.35'/%3E%3C/svg%3E"

export default function ArticleCard({ article }: Props) {
  const navigate = useNavigate()
  const category = article.category.toLowerCase()
  const color = getCategoryColor(article.category)
  const icon = CATEGORY_ICON[category] ?? <Sparkles size={20} />

  return (
    <div
      onClick={() => navigate(`/help/articles/${article.slug}`)}
      className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl overflow-hidden hover:border-[#c8e6d4] hover:shadow-lg transition-all group"
    >
      {/* Banner — gradient built from the category's own color, no stock imagery */}
      <div
        className="relative h-20 flex items-center px-5 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${color.text} 0%, ${darken(color.text, 0.35)} 100%)` }}
      >
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{ backgroundImage: `url("${DOT_PATTERN}")`, backgroundRepeat: 'repeat' }}
        />
        <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -right-2 bottom-0 w-10 h-10 rounded-full bg-white/10 pointer-events-none" />

        <div className="relative w-11 h-11 rounded-2xl bg-white/20 shadow-lg backdrop-blur-sm flex items-center justify-center text-white">
          {icon}
        </div>
      </div>

      <div className="p-5">
        {/* Top row */}
        <div className="flex items-center">
          <span
            className="text-[0.625rem] font-medium rounded-full px-2.5 py-1"
            style={{ backgroundColor: color.bg, color: color.text }}
          >
            {getCategoryLabel(article.category)}
          </span>
          <span className="text-[0.625rem] text-gray-400 dark:text-gray-500 ml-auto flex items-center gap-1">
            <Clock size={11} />
            {estimateReadTime(article.content)} min read
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-3 leading-snug line-clamp-2 group-hover:text-[#1a5c3a] transition-colors">
          {article.title}
        </h3>

        {/* Excerpt */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">
          {markdownExcerpt(article.content)}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#f5f5f5]">
          <span className="text-[0.625rem] text-gray-400 dark:text-gray-500">
            Updated {fromNow(article.updatedAt)}
          </span>
          <span className="text-xs text-[#1a5c3a] font-medium flex items-center gap-1 cursor-pointer group-hover:gap-2 group-hover:underline transition-all">
            Read article
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </div>
  )
}
