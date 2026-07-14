import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { HelpArticle } from '@/types'

interface Props {
  articles: HelpArticle[]
}

export default function RelatedArticles({ articles }: Props) {
  const navigate = useNavigate()

  if (!articles.length) return null

  return (
    <div className="bg-white border border-[#e8ebe8] rounded-2xl p-5 mt-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Related articles</p>
      <div>
        {articles.map(a => (
          <div
            key={a._id}
            onClick={() => navigate(`/help/articles/${a.slug}`)}
            className="flex items-start gap-2.5 py-2.5 border-b border-[#f5f5f5] last:border-0 cursor-pointer group"
          >
            <ArrowRight
              size={12}
              className="text-gray-300 group-hover:text-[#1a5c3a] flex-shrink-0 mt-0.5 transition-colors"
            />
            <span className="text-xs text-gray-700 leading-snug group-hover:text-[#1a5c3a] transition-colors">
              {a.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
