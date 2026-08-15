import { useState } from 'react'
import { useProducts, useDeleteProduct } from '@/hooks/useCatalog'
import ProductFormModal from '@/components/catalog/ProductFormModal'
import {
  Plus, Package, Search, Edit2, Trash2,
  AlertCircle, CheckCircle2, Clock, XCircle, ImageIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePermissions } from '@/lib/permissionsConstants'

const SYNC_STATUS_CONFIG: Record<string, { label: string; icon: any; className: string }> = {
  synced: { label: 'Synced', icon: CheckCircle2, className: 'bg-[#e8f5ee] text-[#1a5c3a]' },
  pending: { label: 'Syncing...', icon: Clock, className: 'bg-amber-50 text-amber-600' },
  failed: { label: 'Sync failed', icon: XCircle, className: 'bg-red-50 text-red-500' },
  not_synced: { label: 'Not synced', icon: Clock, className: 'bg-gray-100 text-gray-400' },
}

export default function ProductsPage() {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const { canManageCatalog } = usePermissions()

  const { data: products, isLoading, isError, refetch } = useProducts()
  const { mutate: deleteProduct } = useDeleteProduct()

  const filtered = (products ?? []).filter(
    (p: any) =>
      !search.trim() ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage products in your WhatsApp catalog
          </p>
        </div>
        {canManageCatalog && (
          <button
            onClick={() => { setEditing(null); setShowForm(true) }}
            className="h-10 px-4 bg-[#1a5c3a] text-white rounded-xl text-sm font-semibold flex items-center gap-1.5"
          >
            <Plus size={15} /> Add product
          </button>
        )}
      </div>

      <div className="relative mb-5 max-w-xs">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#e8ebe8] text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20"
        />
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-4">
          <AlertCircle size={15} className="text-red-400" />
          <p className="text-sm text-red-600 flex-1">Could not load products</p>
          <button onClick={() => refetch()} className="text-xs text-red-600 font-medium">
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="text-center py-20 bg-white border border-[#e8ebe8] rounded-3xl">
          <Package size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-700">
            {search ? 'No products match your search' : 'No products yet'}
          </p>
          {!search && canManageCatalog && (
            <>
              <p className="text-xs text-gray-400 mt-1 mb-4">
                Add your first product to start selling through WhatsApp
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="h-9 px-4 bg-[#1a5c3a] text-white rounded-xl text-sm font-semibold"
              >
                + Add your first product
              </button>
            </>
          )}
        </div>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product: any) => {
            const statusCfg = SYNC_STATUS_CONFIG[product.syncStatus] ?? SYNC_STATUS_CONFIG.not_synced
            const StatusIcon = statusCfg.icon

            return (
              <div
                key={product._id}
                className="bg-white border border-[#e8ebe8] rounded-2xl overflow-hidden hover:border-[#c8e6d4] hover:shadow-sm transition-all"
              >
                <div className="h-40 bg-[#f7f8f6] flex items-center justify-center relative">
                  {product.imageUrls?.[0] ? (
                    <img
                      src={product.imageUrls[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon size={28} className="text-gray-200" />
                  )}
                  {product.availability === 'out_of_stock' && (
                    <span className="absolute top-2 left-2 text-2xs font-bold bg-red-500 text-white rounded-full px-2 py-0.5">
                      Out of stock
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-sm font-semibold text-gray-900 flex-1 line-clamp-1">
                      {product.name}
                    </p>
                    <span
                      className={cn(
                        'flex items-center gap-1 text-2xs font-medium px-2 py-0.5 rounded-full flex-shrink-0',
                        statusCfg.className
                      )}
                    >
                      <StatusIcon size={9} />
                      {statusCfg.label}
                    </span>
                  </div>

                  {product.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                      {product.description}
                    </p>
                  )}

                  <p className="text-base font-bold text-[#1a5c3a] mb-3">
                    ₹{(product.price / 100).toLocaleString('en-IN')}
                  </p>

                  {product.syncStatus === 'failed' && product.syncError && (
                    <p className="text-2xs text-red-500 mb-2 line-clamp-1">{product.syncError}</p>
                  )}

                  {canManageCatalog && (
                    <div className="flex items-center gap-2 pt-2 border-t border-[#f0f0f0]">
                      <button
                        onClick={() => { setEditing(product); setShowForm(true) }}
                        className="flex-1 h-8 rounded-lg bg-[#f7f8f6] text-xs font-medium text-gray-600 hover:bg-[#e8ebe8] flex items-center justify-center gap-1.5"
                      >
                        <Edit2 size={11} /> Edit
                      </button>

                      {confirmDelete === product._id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => { deleteProduct(product._id); setConfirmDelete(null) }}
                            className="text-2xs font-bold text-red-500"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="text-2xs text-gray-400"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(product._id)}
                          className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 flex-shrink-0"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <ProductFormModal
          product={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}
    </div>
  )
}
