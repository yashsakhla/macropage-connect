import { useMemo, useRef, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { Download, Copy, Check, QrCode, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { DashboardHealthData } from '@/types'
import brandLogo from '@assets/macropage-connect-black-icon.svg'
import brandLogoWhite from '@assets/macropage-connect-white-icon.svg'

const STORAGE_KEY = 'mp_dashboard_qr_open'
const EXPORT_QR_SIZE = 340

function toE164Digits(phone: string): string {
  return phone.replace(/[^\d]/g, '')
}

function readStoredOpen(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === null ? true : stored === '1'
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export default function WhatsAppQRCard({ health }: { health?: DashboardHealthData }) {
  const navigate = useNavigate()
  const canvasWrapRef = useRef<HTMLDivElement>(null)
  const exportWrapRef = useRef<HTMLDivElement>(null)
  const [prefillText, setPrefillText] = useState('Hi! I found you via QR code.')
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [open, setOpen] = useState(readStoredOpen)

  const digits = health?.connected && health.phoneNumber ? toE164Digits(health.phoneNumber) : ''

  const waLink = useMemo(() => {
    if (!digits) return ''
    const base = `https://wa.me/${digits}`
    return prefillText.trim() ? `${base}?text=${encodeURIComponent(prefillText.trim())}` : base
  }, [digits, prefillText])

  const toggleOpen = () => {
    setOpen(prev => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
      return next
    })
  }

  const handleDownload = async () => {
    const qrCanvas = exportWrapRef.current?.querySelector('canvas')
    if (!qrCanvas || downloading) return
    setDownloading(true)

    try {
      const W = 480
      const H = 720
      const headerH = 130
      const canvas = document.createElement('canvas')
      canvas.width = W
      canvas.height = H
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Card background
      roundedRect(ctx, 0, 0, W, H, 28)
      ctx.fillStyle = '#ffffff'
      ctx.fill()

      // Header band
      const gradient = ctx.createLinearGradient(0, 0, W, headerH)
      gradient.addColorStop(0, '#1a5c3a')
      gradient.addColorStop(1, '#123724')
      ctx.save()
      roundedRect(ctx, 0, 0, W, H, 28)
      ctx.clip()
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, W, headerH)
      ctx.restore()

      // Header logo + title
      const [whiteLogo] = await Promise.all([loadImage(brandLogoWhite)])
      const logoH = 30
      const logoW = logoH * (whiteLogo.width / whiteLogo.height)
      ctx.drawImage(whiteLogo, W / 2 - logoW / 2, 22, logoW, logoH)

      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.font = '600 20px Inter, Arial, sans-serif'
      ctx.fillText('Scan to Chat on WhatsApp', W / 2, 90)

      const displayName = health?.displayName?.trim()
      if (displayName) {
        ctx.font = '400 13px Inter, Arial, sans-serif'
        ctx.fillStyle = 'rgba(255,255,255,0.85)'
        ctx.fillText(displayName, W / 2, 112)
      }

      // QR panel
      const qrPanelSize = EXPORT_QR_SIZE + 40
      const qrPanelX = (W - qrPanelSize) / 2
      const qrPanelY = headerH + 34
      roundedRect(ctx, qrPanelX, qrPanelY, qrPanelSize, qrPanelSize, 20)
      ctx.fillStyle = '#ffffff'
      ctx.fill()
      ctx.lineWidth = 1
      ctx.strokeStyle = '#e8ebe8'
      ctx.stroke()

      ctx.drawImage(qrCanvas, qrPanelX + 20, qrPanelY + 20, EXPORT_QR_SIZE, EXPORT_QR_SIZE)

      // Phone number
      const numberY = qrPanelY + qrPanelSize + 40
      ctx.fillStyle = '#123724'
      ctx.font = '600 19px Inter, Arial, sans-serif'
      ctx.fillText(health?.phoneNumber ?? '', W / 2, numberY)

      ctx.fillStyle = '#6b7280'
      ctx.font = '400 12px Inter, Arial, sans-serif'
      ctx.fillText('Scan with your phone camera to start a chat', W / 2, numberY + 22)

      // Footer divider + branding
      const footerY = H - 70
      ctx.strokeStyle = '#eef1ee'
      ctx.beginPath()
      ctx.moveTo(48, footerY)
      ctx.lineTo(W - 48, footerY)
      ctx.stroke()

      const [blackLogo] = await Promise.all([loadImage(brandLogo)])
      const footLogoH = 16
      const footLogoW = footLogoH * (blackLogo.width / blackLogo.height)
      ctx.font = '400 12px Inter, Arial, sans-serif'
      const footerText = 'Powered by Macropage Connect'
      const textWidth = ctx.measureText(footerText).width
      const groupWidth = footLogoW + 6 + textWidth
      const groupX = W / 2 - groupWidth / 2
      ctx.drawImage(blackLogo, groupX, footerY + 16 - footLogoH / 2, footLogoW, footLogoH)
      ctx.fillStyle = '#9ca3af'
      ctx.textAlign = 'left'
      ctx.fillText(footerText, groupX + footLogoW + 6, footerY + 20)

      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = url
      link.download = `whatsapp-qr-${digits}.png`
      link.click()
    } finally {
      setDownloading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(waLink)
      setCopied(true)
      toast.success('Link copied')
      setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error('Could not copy link')
    }
  }

  const header = (
    <button
      onClick={toggleOpen}
      className="flex items-center justify-between w-full"
    >
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center shrink-0">
          <QrCode size={15} className="text-[#1a5c3a]" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">WhatsApp QR code</h3>
      </div>
      {open ? (
        <ChevronUp size={16} className="text-gray-400" />
      ) : (
        <ChevronDown size={16} className="text-gray-400" />
      )}
    </button>
  )

  if (!open) {
    return (
      <div className="card p-4">
        {header}
      </div>
    )
  }

  if (!digits) {
    return (
      <div className="card p-5">
        <div className="mb-4">{header}</div>
        <div className="flex flex-col items-center text-center">
          <p className="text-xs text-gray-500 max-w-[220px]">
            Connect WhatsApp to generate your customer-facing QR code.
          </p>
          <button
            className="btn btn-primary text-sm mt-4"
            style={{ background: '#1a5c3a', borderColor: '#1a5c3a' }}
            onClick={() => navigate('/settings/whatsapp')}
          >
            Connect WhatsApp
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-5">
      <div className="mb-4">{header}</div>

      <div className="flex flex-col items-center">
        <div
          ref={canvasWrapRef}
          className="p-3 rounded-2xl bg-white border border-[#e8ebe8] shadow-sm"
        >
          <QRCodeCanvas
            value={waLink}
            size={148}
            level="H"
            fgColor="#123724"
            bgColor="#ffffff"
            imageSettings={{
              src: brandLogo,
              height: 32,
              width: 34,
              excavate: true,
            }}
          />
        </div>
        <div className="flex items-center gap-1.5 mt-2.5 text-2xs text-gray-500">
          <MessageCircle size={12} className="text-[#1a5c3a]" />
          <span>{health?.phoneNumber}</span>
        </div>

        {/* Off-screen high-res QR used only for the exported PNG */}
        <div ref={exportWrapRef} className="absolute -left-[9999px] -top-[9999px]" aria-hidden="true">
          <QRCodeCanvas
            value={waLink}
            size={EXPORT_QR_SIZE}
            level="H"
            fgColor="#123724"
            bgColor="#ffffff"
            imageSettings={{
              src: brandLogo,
              height: 68,
              width: 72,
              excavate: true,
            }}
          />
        </div>

        <input
          className="input text-sm mt-4 w-full"
          value={prefillText}
          maxLength={120}
          onChange={(e) => setPrefillText(e.target.value)}
          placeholder="Pre-filled message"
        />

        <div className="flex items-center gap-2 mt-3 w-full">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="btn btn-primary flex-1 justify-center text-sm disabled:opacity-60"
            style={{ background: '#1a5c3a', borderColor: '#1a5c3a' }}
          >
            <Download size={14} /> {downloading ? 'Preparing…' : 'PNG'}
          </button>
          <button
            onClick={handleCopy}
            className={cn('btn btn-outline flex-1 justify-center text-sm')}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}
