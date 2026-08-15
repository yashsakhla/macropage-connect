import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrders } from '@/hooks/useOrders'
import { ShoppingCart, AlertCircle, ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-blue-50 text-blue-600' },
  confirmed: { label: 'Confirmed', className: 'bg-purple-50 text-purple-600' },
  payment_pending: { label: 'Payment pending', className: 'bg-amber-50 text-amber-600' },
  paid: { label: 'Paid', className: 'bg-[#e8f5ee] text-[#1a5c3a]' },
  fulfilled: { label: 'Fulfilled', className: 'bg-gray-100 text-gray-500' },
  cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-500' },
}

const FILTER_TABS: { key: string | undefined; label: string }[] = [
  { key: undefined, label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'payment_pending', label: 'Payment pending' },
  { key: 'paid', label: 'Paid' },
  { key: 'fulfilled', label: 'Fulfilled' },
]

export default function OrdersPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)

  const { data: orders, isLoading, isError, refetch } = useOrders(statusFilter)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Orders placed through your WhatsApp catalog
        </p>
      </div>

      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setStatusFilter(tab.key)}
            className={cn(
              'h-8 px-3.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors',
              statusFilter === tab.key
                ? 'bg-[#1a5c3a] text-white'
                : 'bg-[#f7f8f6] text-gray-500 hover:text-gray-800'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-4">
          <AlertCircle size={15} className="text-red-400" />
          <p className="text-sm text-red-600 flex-1">Could not load orders</p>
          <button onClick={() => refetch()} className="text-xs text-red-600 font-medium">
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && (!orders || orders.length === 0) && (
        <div className="text-center py-20 bg-white border border-[#e8ebe8] rounded-3xl">
          <ShoppingCart size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-700">No orders yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Orders will appear here once customers shop through your WhatsApp catalog
          </p>
        </div>
      )}

      {!isLoading && !isError && orders?.length > 0 && (
        <div className="space-y-2.5">
          {orders.map((order: any) => {
            const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.new

            return (
              <button
                key={order._id}
                onClick={() => navigate(`/orders/${order._id}`)}
                className="w-full flex items-center gap-4 bg-white border border-[#e8ebe8] rounded-2xl px-5 py-4 text-left hover:border-[#c8e6d4] hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 bg-[#e8f5ee] rounded-xl flex items-center justify-center flex-shrink-0">
                  <ShoppingCart size={17} className="text-[#1a5c3a]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900">
                      {order.contactId?.name ?? 'Customer'}
                    </p>
                    <span
                      className={cn(
                        'text-2xs font-medium px-2 py-0.5 rounded-full',
                        statusCfg.className
                      )}
                    >
                      {statusCfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {order.items?.length} item(s) ·{' '}
                    {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gray-900">
                    ₹{(order.totalAmount / 100).toLocaleString('en-IN')}
                  </p>
                </div>

                <ChevronRight size={15} className="text-gray-300 flex-shrink-0" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
