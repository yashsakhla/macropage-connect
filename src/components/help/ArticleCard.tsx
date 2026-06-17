import { Clock, ThumbsUp, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { HelpArticle } from '@/types'

interface Props {
  article: HelpArticle
}

export default function ArticleCard({ article }: Props) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/help/articles/${article.slug}`)}
      className="bg-white border border-[#e8ebe8] rounded-2xl p-5 hover:border-[#c8e6d4] cursor-pointer transition-all group"
    >
      {/* Top row */}
      <div className="flex items-center">
        <span
          className="text-[0.625rem] font-medium rounded-full px-2.5 py-1"
          style={{ backgroundColor: article.categoryColor + '20', color: article.categoryColor }}
        >
          {article.category}
        </span>
        <span className="text-[0.625rem] text-gray-400 ml-auto flex items-center gap-1">
          <Clock size={11} />
          {article.readTimeMinutes} min read
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-gray-900 mt-3 leading-snug line-clamp-2 group-hover:text-[#1a5c3a] transition-colors">
        {article.title}
      </h3>

      {/* Excerpt */}
      <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
        {article.excerpt}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#f5f5f5]">
        <span className="text-[0.625rem] text-gray-400 flex items-center gap-1">
          <ThumbsUp size={12} className="text-gray-400" />
          {article.helpfulPercent}% found helpful
        </span>
        <span className="text-xs text-[#1a5c3a] font-medium flex items-center gap-1">
          Read article
          <ArrowRight size={12} />
        </span>
      </div>
    </div>
  )
}
