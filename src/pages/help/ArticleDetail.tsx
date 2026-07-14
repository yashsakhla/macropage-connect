import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronRight, Clock, MessageSquare, Headphones } from 'lucide-react'
import { useArticle } from '@/hooks/useHelp'
import ArticleFeedback from '@/components/help/ArticleFeedback'
import RelatedArticles from '@/components/help/RelatedArticles'
import SupportTicketForm from '@/components/help/SupportTicketForm'
import type { HelpArticle } from '@/types'
import { cn, fromNow, getCategoryColor, getCategoryLabel, estimateReadTime } from '@/lib/utils'
import { renderMarkdown } from '@/lib/markdown'

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { data: article } = useArticle(slug ?? '')
  const [activeSection, setActiveSection] = useState('')
  const [ticketOpen, setTicketOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const { html, toc } = useMemo(
    () => article ? renderMarkdown(article.content) : { html: '', toc: [] },
    [article]
  )
  const related: HelpArticle[] = []

  // Track active ToC item via IntersectionObserver
  useEffect(() => {
    if (!contentRef.current) return
    const headings = contentRef.current.querySelectorAll('h2, h3')
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { rootMargin: '-80px 0px -60% 0px' }
    )
    headings.forEach(h => observer.observe(h))
    return () => observer.disconnect()
  }, [article])

  if (!article) return null

  return (
    <div className="min-h-screen bg-[#f7f8f6]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link to="/help" className="hover:text-[#1a5c3a]">Help</Link>
          <ChevronRight size={12} />
          <button
            onClick={() => navigate(`/help?category=${article.category}`)}
            className="hover:text-[#1a5c3a]"
          >
            {getCategoryLabel(article.category)}
          </button>
          <ChevronRight size={12} />
          <span className="text-gray-700 truncate max-w-xs">{article.title}</span>
        </nav>

        <div className="lg:grid lg:grid-cols-[1fr_280px] gap-10">
          {/* Left — Article */}
          <div>
            {/* Header */}
            <span
              className="text-[0.625rem] font-medium rounded-full px-2.5 py-1"
              style={{ backgroundColor: getCategoryColor(article.category).bg, color: getCategoryColor(article.category).text }}
            >
              {getCategoryLabel(article.category)}
            </span>

            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mt-3 leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center gap-4 mt-4 flex-wrap">
              <span className="text-xs text-gray-400">
                Updated {fromNow(article.updatedAt)}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock size={11} /> {estimateReadTime(article.content)} min read
              </span>
            </div>

            <div className="mt-5 h-px bg-[#e8ebe8]" />

            {/* Article body */}
            <div
              ref={contentRef}
              className="mt-6 article-content"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            {/* Feedback */}
            <ArticleFeedback
              articleId={article._id}
              articleSlug={article.slug}
              onNeedHelp={() => setTicketOpen(true)}
            />
          </div>

          {/* Right — Sidebar */}
          <div>
            {/* Table of contents */}
            {toc.length > 0 && (
              <div className="bg-white border border-[#e8ebe8] rounded-2xl p-5 sticky top-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  In this article
                </p>
                <nav className="space-y-0.5">
                  {toc.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className={cn(
                        'block w-full text-left py-1.5 text-xs border-l-2 transition-colors',
                        item.level === 3 ? 'pl-6 text-gray-500' : 'pl-3 text-gray-600',
                        activeSection === item.id
                          ? 'border-[#1a5c3a] text-[#1a5c3a] font-medium'
                          : 'border-transparent hover:text-[#1a5c3a]'
                      )}
                    >
                      {item.text}
                    </button>
                  ))}
                </nav>
              </div>
            )}

            {/* Related articles */}
            <RelatedArticles articles={related} />

            {/* Get help box */}
            <div className="bg-[#e8f5ee] border border-[#c8e6d4] rounded-2xl p-5 mt-4">
              <div className="bg-white rounded-xl p-2 w-8 h-8 mb-3 flex items-center justify-center">
                <Headphones size={16} className="text-[#1a5c3a]" />
              </div>
              <p className="text-sm font-semibold text-gray-900">Still need help?</p>
              <p className="text-xs text-gray-500 mt-1">Our support team is ready to help</p>
              <button
                onClick={() => {/* open chat */}}
                className="btn-primary w-full h-9 mt-4 flex items-center justify-center gap-2 text-sm"
              >
                <MessageSquare size={14} /> Chat with us
              </button>
              <button
                onClick={() => setTicketOpen(true)}
                className="btn-outline w-full h-9 mt-2 text-sm"
              >
                Submit a ticket
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Article content styles */}
      <style>{`
        .article-content h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin-top: 2rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e8ebe8;
        }
        .article-content h3 {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #111827;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .article-content p {
          font-size: 0.875rem;
          color: #374151;
          line-height: 1.75rem;
          margin-bottom: 1rem;
        }
        .article-content ul, .article-content ol {
          margin-left: 1.25rem;
          margin-bottom: 1rem;
        }
        .article-content ul { list-style: none; }
        .article-content ul li {
          font-size: 0.875rem;
          color: #374151;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
        }
        .article-content ul li::before {
          content: '';
          width: 6px;
          height: 6px;
          background: #1a5c3a;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 0.625rem;
        }
        .article-content ol { list-style: none; counter-reset: li; }
        .article-content ol li {
          font-size: 0.875rem;
          color: #374151;
          margin-bottom: 0.5rem;
          display: flex;
          gap: 0.75rem;
          counter-increment: li;
        }
        .article-content ol li::before {
          content: counter(li);
          background: #e8f5ee;
          color: #1a5c3a;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .article-content a { color: #1a5c3a; text-decoration: underline; }
        .article-content a:hover { color: #2d7a4f; }
        .article-content code {
          background: #f7f8f6;
          color: #1a5c3a;
          font-size: 0.75rem;
          border-radius: 4px;
          padding: 2px 6px;
          font-family: monospace;
          border: 1px solid #e8ebe8;
        }
        .article-content pre {
          background: #1a3d2b;
          border-radius: 1rem;
          padding: 1.25rem;
          margin-bottom: 1rem;
          overflow-x: auto;
        }
        .article-content pre code {
          background: none;
          color: rgba(255,255,255,0.9);
          border: none;
          padding: 0;
          font-size: 0.75rem;
          line-height: 1.6;
          white-space: pre;
        }
        .article-content blockquote {
          border-left: 4px solid #1a5c3a;
          padding: 0.75rem 1rem;
          margin: 1rem 0;
          font-size: 0.875rem;
          color: #4b5563;
          font-style: italic;
          background: rgba(232,245,238,0.5);
          border-radius: 0 0.75rem 0.75rem 0;
        }
        .article-content table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1rem;
          font-size: 0.8125rem;
        }
        .article-content th, .article-content td {
          border: 1px solid #e8ebe8;
          padding: 0.5rem 0.75rem;
          text-align: left;
        }
        .article-content th {
          background: #f7f8f6;
          font-weight: 600;
          color: #111827;
        }
        .article-content .info-box {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 0.75rem;
          padding: 1rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          color: #1e40af;
        }
        .article-content .warning-box {
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 0.75rem;
          padding: 1rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          color: #92400e;
        }
        .article-content .success-box {
          background: #e8f5ee;
          border: 1px solid #c8e6d4;
          border-radius: 0.75rem;
          padding: 1rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          color: #1a5c3a;
        }
      `}</style>

      {/* Ticket drawer */}
      {ticketOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setTicketOpen(false)} />
          <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col overflow-hidden">
            <SupportTicketForm onClose={() => setTicketOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
