import { Download } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Invoice } from '@/types'

const STATUS_STYLE: Record<Invoice['status'], string> = {
  paid: 'badge-green',
  failed: 'badge-red',
  pending: 'badge-yellow',
}

interface Props { invoices: Invoice[] }

export default function InvoiceTable({ invoices }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Invoice #</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Download</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td className="text-sm text-gray-700 dark:text-gray-300">{format(new Date(inv.createdAt), 'dd MMM yyyy')}</td>
              <td><span className="font-mono text-xs text-gray-500 dark:text-gray-400">{inv.number}</span></td>
              <td className="text-sm font-medium">₹{inv.amount.toLocaleString('en-IN')}</td>
              <td><span className={cn('badge text-2xs capitalize', STATUS_STYLE[inv.status])}>{inv.status}</span></td>
              <td>
                {inv.downloadUrl ? (
                  <a
                    href={inv.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost w-8 h-8 flex items-center justify-center rounded-lg"
                    title="Download PDF"
                  >
                    <Download size={14} className="text-gray-400 dark:text-gray-500" />
                  </a>
                ) : (
                  <span className="w-8 h-8 flex items-center justify-center opacity-30" title="No invoice available">
                    <Download size={14} className="text-gray-400 dark:text-gray-500" />
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
