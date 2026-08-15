import { useParams, useNavigate } from 'react-router-dom'
import { useOrder, useUpdateOrderStatus } from '@/hooks/useOrders'
import { ArrowLeft, MapPin, CreditCard, ExternalLink, Loader2, MessageSquare, Copy } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-blue-50 text-blue-600' },
  confirmed: { label: 'Confirmed', className: 'bg-purple-50 text-purple-600' },
  payment_pending: { label: 'Payment pending', className: 'bg-amber-50 text-amber-600' },
  paid: { label: 'Paid', className: 'bg-[#e8f5ee] text-[#1a5c3a]' },
  fulfilled: { label: 'Fulfilled', className: 'bg-gray-100 text-gray-500' },
  cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-500' },
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: order, isLoading } = useOrder(id ?? null)
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus()

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 flex justify-center">
        <Loader2 size={22} className="animate-spin text-gray-300" />
      </div>
    )
  }

  if (!order) return null

  const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.new

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 mb-5"
      >
        <ArrowLeft size={13} /> Back to orders
      </button>

      {/* Header */}
      <div className="bg-white border border-[#e8ebe8] rounded-3xl px-6 py-5 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-gray-400">Order</p>
            <p className="text-sm font-bold text-gray-900 font-mono">#{order._id.slice(-8)}</p>
          </div>
          <span className={cn('text-xs font-semibold px-3 py-1.5 rounded-full', statusCfg.className)}>
            {statusCfg.label}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#f0f0f0]">
          <p className="text-sm text-gray-600 flex-1">
            {order.contactId?.name} · {order.contactId?.phone}
          </p>
          <button
            onClick={() => navigate(`/inbox?conversationId=${order.conversationId}`)}
            className="flex items-center gap-1.5 text-xs text-[#1a5c3a] font-semibold hover:underline"
          >
            <MessageSquare size={12} /> View conversation
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white border border-[#e8ebe8] rounded-3xl overflow-hidden mb-4">
        <div className="px-6 py-4 border-b border-[#f0f0f0]">
          <p className="text-sm font-bold text-gray-900">Items</p>
        </div>
        <div className="divide-y divide-[#f7f8f6]">
          {order.items?.map((item: any, i: number) => (
            <div key={i} className="flex items-center gap-4 px-6 py-3.5">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                ₹{((item.price * item.quantity) / 100).toLocaleString('en-IN')}
              </p>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 bg-[#f7f8f6] flex items-center justify-between">
          <p className="text-sm font-bold text-gray-900">Total</p>
          <p className="text-base font-black text-[#1a5c3a]">
            ₹{(order.totalAmount / 100).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Delivery address */}
      <div className="bg-white border border-[#e8ebe8] rounded-3xl px-6 py-5 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin size={14} className="text-gray-400" />
          <p className="text-sm font-bold text-gray-900">Delivery address</p>
        </div>
        {order.deliveryAddress ? (
          <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
        ) : (
          <p className="text-xs text-gray-400 italic">
            Waiting for customer to share delivery address...
          </p>
        )}
      </div>

      {/* Payment */}
      {order.razorpayPaymentLink && (
        <div className="bg-white border border-[#e8ebe8] rounded-3xl px-6 py-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={14} className="text-gray-400" />
            <p className="text-sm font-bold text-gray-900">Payment link</p>
          </div>
          <div className="flex items-center gap-2 bg-[#f7f8f6] rounded-xl px-4 py-2.5">
            <p className="text-xs text-gray-500 flex-1 truncate">{order.razorpayPaymentLink}</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(order.razorpayPaymentLink)
                toast.success('Copied!')
              }}
              className="text-gray-400 hover:text-[#1a5c3a]"
            >
              <Copy size={13} />
            </button>
            <a
              href={order.razorpayPaymentLink}
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-[#1a5c3a]"
            >
              <ExternalLink size={13} />
            </a>
          </div>
          {order.paidAt && (
            <p className="text-2xs text-[#1a5c3a] mt-2">
              Paid on {format(new Date(order.paidAt), 'dd MMM yyyy, HH:mm')}
            </p>
          )}
        </div>
      )}

      {/* Manual status update */}
      <div className="bg-white border border-[#e8ebe8] rounded-3xl px-6 py-5">
        <p className="text-sm font-bold text-gray-900 mb-3">Update status</p>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => updateStatus({ id: order._id, status: key })}
              disabled={isPending || order.status === key}
              className={cn(
                'h-8 px-3 rounded-lg text-xs font-medium transition-colors disabled:opacity-40',
                order.status === key ? cfg.className : 'bg-[#f7f8f6] text-gray-500 hover:bg-[#e8ebe8]'
              )}
            >
              {cfg.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
