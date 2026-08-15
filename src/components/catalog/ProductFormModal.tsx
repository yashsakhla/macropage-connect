import { useState } from 'react'
import { useCreateProduct, useUpdateProduct } from '@/hooks/useCatalog'
import { useUploadImage } from '@/hooks/useUpload'
import { X, Loader2, Upload, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  product?: any
  onClose: () => void
}

export default function ProductFormModal({ product, onClose }: Props) {
  const isEditing = !!product

  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product ? (product.price / 100).toString() : '')
  const [sku, setSku] = useState(product?.sku ?? '')
  const [category, setCategory] = useState(product?.category ?? '')
  const [images, setImages] = useState<string[]>(product?.imageUrls ?? [])

  const { mutate: create, isPending: creating } = useCreateProduct()
  const { mutate: update, isPending: updating } = useUpdateProduct()
  const { mutate: uploadImage, isPending: uploading } = useUploadImage()

  const isPending = creating || updating

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    uploadImage(file, {
      onSuccess: (res) => {
        if (!res?.url) {
          toast.error('Image upload failed')
          return
        }
        setImages((prev) => [...prev, res.url])
      },
      onError: () => toast.error('Image upload failed'),
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !price) return

    const data = {
      name: name.trim(),
      description: description.trim() || undefined,
      price: Math.round(parseFloat(price) * 100), // ₹ → paise
      sku: sku.trim() || undefined,
      category: category.trim() || undefined,
      imageUrls: images,
    }

    if (isEditing) {
      update({ id: product._id, data }, { onSuccess: onClose })
    } else {
      create(data, { onSuccess: onClose })
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e8ebe8] sticky top-0 bg-white z-10">
          <h2 className="text-base font-bold text-gray-900">
            {isEditing ? 'Edit product' : 'Add product'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#f7f8f6] hover:bg-[#e8ebe8] flex items-center justify-center"
          >
            <X size={15} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Images */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product images
            </label>
            <div className="flex gap-2 flex-wrap">
              {images.map((url, i) => (
                <div
                  key={i}
                  className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#e8ebe8]"
                >
                  <img src={url} className="w-full h-full object-cover" alt="" />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
                  >
                    <Trash2 size={10} className="text-white" />
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-[#e8ebe8] flex items-center justify-center cursor-pointer hover:border-[#1a5c3a] transition-colors">
                {uploading ? (
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                ) : (
                  <Upload size={16} className="text-gray-300" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Product name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wireless Earbuds"
              required
              className="w-full h-11 px-4 rounded-xl border border-[#e8ebe8] text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="999"
                required
                className="w-full h-11 px-4 rounded-xl border border-[#e8ebe8] text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                SKU
                <span className="text-gray-400 font-normal text-xs ml-1">(optional)</span>
              </label>
              <input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="SKU-001"
                className="w-full h-11 px-4 rounded-xl border border-[#e8ebe8] text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Description
              <span className="text-gray-400 font-normal text-xs ml-1">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Short product description..."
              className="w-full px-4 py-3 rounded-xl border border-[#e8ebe8] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Category
              <span className="text-gray-400 font-normal text-xs ml-1">(optional)</span>
            </label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Electronics"
              className="w-full h-11 px-4 rounded-xl border border-[#e8ebe8] text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 border border-[#e8ebe8] rounded-2xl text-sm font-medium text-gray-500 hover:bg-[#f7f8f6]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || uploading}
              className="flex-1 h-11 bg-[#1a5c3a] hover:bg-[#2d7a4f] text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : isEditing ? (
                'Save changes'
              ) : (
                'Add product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
