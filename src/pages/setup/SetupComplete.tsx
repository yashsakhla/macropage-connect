import { Link } from 'react-router-dom'
import { CheckCircle, ArrowRight } from 'lucide-react'

export default function SetupComplete() {
  return (
    <div className="min-h-screen bg-[var(--page-bg)] dark:bg-[#071025] w-full py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white dark:bg-[#071022] border border-[var(--card-border)] dark:border-white/5 rounded-2xl shadow-sm p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left: primary success message and actions */}
            <div className="lg:col-span-2">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-[#e8f5ee] dark:bg-[#06251a] rounded-full flex items-center justify-center">
                  <CheckCircle size={52} className="text-[#1a5c3a]" />
                </div>
                <div>
                  <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">You're all set</h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-2xl">Your WhatsApp Business account is connected. You can now send messages, manage conversations, and build campaigns — all from Macropage Connect.</p>

                  <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
                    <Link to="/dashboard" className="btn-primary h-12 px-6 inline-flex items-center gap-3">Go to Dashboard <ArrowRight size={16} /></Link>
                    <Link to="/campaigns/new" className="btn-outline h-12 px-6 inline-flex items-center gap-3">Create campaign</Link>
                    <Link to="/contacts" className="btn-ghost h-12 px-6 inline-flex items-center gap-3">Import contacts</Link>
                  </div>

                  <div className="mt-6 border-l-4 border-[#e8ebe8] dark:border-white/5 pl-4">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Recommended next steps</h4>
                    <ul className="list-disc pl-5 mt-2 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <li>Create your first campaign to engage customers.</li>
                      <li>Upload contacts or connect your CRM for segmentation.</li>
                      <li>Set up automated replies and quick replies.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: summary / profile card */}
            <div>
              <div className="bg-white/50 dark:bg-transparent border border-[var(--card-border)] dark:border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#e8f5ee] dark:bg-[#06251a] flex items-center justify-center font-bold text-lg text-[#1a5c3a]">B</div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">Business name</div>
                    <div className="text-2xs text-gray-500 dark:text-gray-400">Category</div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <div className="flex items-center justify-between"><span className="opacity-80">WABA ID</span><span className="font-medium">123456789</span></div>
                  <div className="flex items-center justify-between"><span className="opacity-80">Phone</span><span className="font-medium">+91 98765 43210</span></div>
                  <div className="flex items-center justify-between"><span className="opacity-80">Status</span><span className="font-medium text-[#1a5c3a]">Connected</span></div>
                </div>

                <div className="mt-4 border-t border-[var(--card-border)] pt-4">
                  <div className="text-2xs text-gray-500 dark:text-gray-400">Quick stats</div>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 dark:bg-white/3 rounded-lg text-center">
                      <div className="text-sm text-gray-500">Sent</div>
                      <div className="font-semibold">0</div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-white/3 rounded-lg text-center">
                      <div className="text-sm text-gray-500">Delivery</div>
                      <div className="font-semibold">—</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Link to="/inbox" className="w-full inline-flex justify-center items-center gap-2 btn-outline h-10">View inbox</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
