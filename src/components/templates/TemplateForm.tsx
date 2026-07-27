import { useState, useRef, useCallback } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { X, Plus, Trash2, Bold, Italic, Strikethrough, Code2, Tag, Globe, Megaphone, ShieldCheck, Wrench, Lock, Loader2, FileText, UploadCloud } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CreateTemplatePayload, TemplateCategory, TemplateStatus } from '@/types'
import TemplatePreview from './TemplatePreview'
import { useCreateTemplate, useUpdateTemplate, useSaveDraft, useUpdateDraft } from '@/hooks/useTemplates'
import { useUploadImage, useUploadDocument, useDeleteFile, UPLOAD_LIMITS } from '@/hooks/useUpload'
import { useRequireWhatsApp } from '@/hooks/useRequireWhatsApp'

const LANGUAGES = [
  { code: 'en_US', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil', flag: '🇮🇳' },
  { code: 'te', label: 'Telugu', flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi', flag: '🇮🇳' },
  { code: 'bn', label: 'Bengali', flag: '🇮🇳' },
  { code: 'gu', label: 'Gujarati', flag: '🇮🇳' },
  { code: 'kn', label: 'Kannada', flag: '🇮🇳' },
]

const schema = z.object({
  name: z.string().min(1).regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, underscores'),
  category: z.enum(['MARKETING', 'UTILITY', 'AUTHENTICATION']),
  language: z.string().min(1),
  hasHeader: z.boolean(),
  headerType: z.enum(['TEXT', 'IMAGE', 'DOCUMENT']).optional(),
  headerText: z.string().max(60).optional(),
  body: z.string().min(1).max(1024),
  hasFooter: z.boolean(),
  footerText: z.string().max(60).optional(),
  hasButtons: z.boolean(),
  buttonType: z.enum(['QUICK_REPLY', 'CTA']).optional(),
  quickReplies: z.array(z.object({ text: z.string().max(20) })).optional(),
  ctaButtons: z.array(z.object({
    type: z.enum(['URL', 'PHONE_NUMBER']),
    text: z.string().max(20),
    value: z.string(),
  })).optional(),
})

type FormValues = z.infer<typeof schema>

const VARIABLE_TYPE_OPTIONS = [
  { value: 'contactName', label: 'Contact name', sample: 'Rohit Sharma' },
  { value: 'contactPhone', label: 'Contact phone', sample: '+91 98765 43210' },
  { value: 'contactEmail', label: 'Contact email', sample: 'rohit@example.com' },
  { value: 'company', label: 'Company name', sample: 'Acme Corp' },
  { value: 'customField', label: 'Custom field', sample: '' },
  { value: 'custom', label: 'Custom text', sample: '' },
]

const CATEGORY_CONFIG: { value: TemplateCategory; label: string; desc: string; icon: React.ElementType; gradient: string }[] = [
  { value: 'MARKETING',      label: 'Marketing',      desc: 'Promotions, offers, announcements', icon: Megaphone, gradient: 'from-purple-500 to-pink-500' },
  { value: 'UTILITY',        label: 'Utility',        desc: 'Order updates, confirmations, alerts', icon: Wrench,   gradient: 'from-blue-500 to-cyan-500' },
  { value: 'AUTHENTICATION', label: 'Authentication', desc: 'OTP codes, security messages', icon: ShieldCheck, gradient: 'from-[#1a5c3a] to-teal-500' },
]

interface TemplateFormProps {
  onClose: () => void
  initialData?: Partial<CreateTemplatePayload>
  templateId?: string
  templateStatus?: TemplateStatus
}

export default function TemplateForm({ onClose, initialData, templateId, templateStatus }: TemplateFormProps) {
  // Once Meta has a template (approved) or is actively reviewing it (pending), it
  // can't be edited — only drafts and rejected templates (which need fixing before
  // resubmission) remain editable.
  const isLocked = !!templateId && templateStatus !== 'DRAFT' && templateStatus !== 'REJECTED'
  const createTemplate = useCreateTemplate()
  const updateTemplate = useUpdateTemplate()
  const { requireConnected } = useRequireWhatsApp()
  const saveDraft = useSaveDraft()
  const updateDraft = useUpdateDraft()
  const uploadImage = useUploadImage()
  const uploadDocument = useUploadDocument()
  const deleteFile = useDeleteFile()
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const headerFileRef = useRef<HTMLInputElement>(null)
  const [headerMedia, setHeaderMedia] = useState<{ url: string; key?: string; name: string } | undefined>(
    initialData?.header?.mediaUrl ? { url: initialData.header.mediaUrl, name: 'Uploaded file' } : undefined
  )

  const removeHeaderMedia = () => {
    if (headerMedia?.key) deleteFile.mutate(headerMedia.key)
    setHeaderMedia(undefined)
  }

  const { register, watch, setValue, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name ?? '',
      category: initialData?.category ?? 'MARKETING',
      language: initialData?.language ?? 'en_US',
      hasHeader: !!initialData?.header,
      headerType: (initialData?.header?.format as 'TEXT' | 'IMAGE' | 'DOCUMENT') ?? 'TEXT',
      headerText: initialData?.header?.text ?? '',
      body: initialData?.body ?? '',
      hasFooter: !!initialData?.footer,
      footerText: initialData?.footer ?? '',
      hasButtons: !!initialData?.buttons,
      buttonType: 'QUICK_REPLY',
      quickReplies: [{ text: '' }],
      ctaButtons: [{ type: 'URL', text: '', value: '' }],
    },
  })

  const { fields: qrFields, append: appendQR, remove: removeQR } = useFieldArray({ control, name: 'quickReplies' })
  const { fields: ctaFields, append: appendCTA, remove: removeCTA } = useFieldArray({ control, name: 'ctaButtons' })

  const [varCount, setVarCount] = useState(0)
  const [sampleVars, setSampleVars] = useState<Record<string, string>>(initialData?.sampleVariables ?? {})
  const [varTypes, setVarTypes] = useState<Record<string, string>>(initialData?.variableTypes ?? {})
  const [showVarErrors, setShowVarErrors] = useState(false)

  const handleVarTypeChange = (key: string, type: string) => {
    setVarTypes(prev => ({ ...prev, [key]: type }))
    const opt = VARIABLE_TYPE_OPTIONS.find(o => o.value === type)
    if (opt?.sample) setSampleVars(prev => ({ ...prev, [key]: opt.sample }))
  }

  const values = watch()

  const insertVariable = useCallback(() => {
    const el = bodyRef.current
    if (!el) return
    const next = varCount + 1
    const insertion = `{{${next}}}`
    const start = el.selectionStart ?? el.value.length
    const end = el.selectionEnd ?? el.value.length
    const newVal = el.value.slice(0, start) + insertion + el.value.slice(end)
    setValue('body', newVal)
    setVarCount(next)
    setTimeout(() => { el.focus(); el.setSelectionRange(start + insertion.length, start + insertion.length) }, 0)
  }, [varCount, setValue])

  const insertFormat = useCallback((wrap: string) => {
    const el = bodyRef.current
    if (!el) return
    const start = el.selectionStart ?? 0
    const end = el.selectionEnd ?? 0
    const selected = el.value.slice(start, end) || 'text'
    const newVal = el.value.slice(0, start) + wrap + selected + wrap + el.value.slice(end)
    setValue('body', newVal)
  }, [setValue])

  const headerUploading = uploadImage.isPending || uploadDocument.isPending

  const handleHeaderFile = (file: File) => {
    const kind = values.headerType === 'IMAGE' ? 'image' : 'document'
    const limit = UPLOAD_LIMITS[kind]
    if (file.size > limit.maxBytes) {
      toast.error(`${kind === 'image' ? 'Image' : 'Document'} is too large — ${limit.label}`)
      return
    }
    const upload = kind === 'image' ? uploadImage : uploadDocument
    upload.mutate(file, {
      onSuccess: ({ url, key }) => setHeaderMedia({ url, key, name: file.name }),
      onError: () => toast.error(`Failed to upload ${kind}`),
    })
  }

  const detectedVars = Array.from(new Set((values.body || '').match(/{{(\d+)}}/g) ?? []))
  const missingVarKeys = detectedVars
    .map(v => v.replace(/\{\{(\d+)\}\}/, '$1'))
    .filter(key => varTypes[key] && !(sampleVars[key] ?? '').trim())

  const previewTemplate = {
    header: values.hasHeader && values.headerType && (values.headerType === 'TEXT' ? { type: 'TEXT' as const, text: values.headerText } : { type: values.headerType as 'IMAGE' | 'DOCUMENT', mediaUrl: headerMedia?.url }) || undefined,
    body: values.body || 'Your message preview will appear here...',
    footer: values.hasFooter ? (values.footerText || undefined) : undefined,
    buttons: values.hasButtons
      ? values.buttonType === 'QUICK_REPLY'
        ? (values.quickReplies ?? []).filter(b => b.text).map(b => ({ type: 'QUICK_REPLY' as const, text: b.text }))
        : (values.ctaButtons ?? []).filter(b => b.text).map(b => ({ type: b.type, text: b.text, url: b.type === 'URL' ? b.value : undefined }))
      : undefined,
  }

  const buildPayload = (data: FormValues): CreateTemplatePayload => {
    const rawButtons = data.hasButtons
      ? data.buttonType === 'QUICK_REPLY'
        ? (data.quickReplies ?? []).filter(b => b.text).map(b => ({ type: 'QUICK_REPLY' as const, text: b.text }))
        : (data.ctaButtons ?? []).filter(b => b.text).map(b => ({
            type: b.type,
            text: b.text,
            url: b.type === 'URL' ? b.value : undefined,
            phone_number: b.type === 'PHONE_NUMBER' ? b.value : undefined,
          }))
      : null

    return {
      name: data.name,
      category: data.category,
      language: data.language,
      body: data.body,
      sampleVariables: sampleVars,
      variableTypes: Object.keys(varTypes).length > 0 ? varTypes : undefined,
      header: data.hasHeader && data.headerType
        ? data.headerType === 'TEXT'
          ? { format: 'TEXT', text: data.headerText }
          : { format: data.headerType, mediaUrl: headerMedia?.url }
        : undefined,
      footer: data.hasFooter ? data.footerText : undefined,
      buttons: rawButtons && rawButtons.length > 0 ? { buttons: rawButtons } : undefined,
    }
  }

  const onSubmit = (data: FormValues) => {
    if (isLocked) return
    if (!requireConnected()) return
    if (data.hasHeader && (data.headerType === 'IMAGE' || data.headerType === 'DOCUMENT') && !headerMedia) {
      toast.error(`Upload a header ${data.headerType.toLowerCase()} before submitting`)
      return
    }
    if (missingVarKeys.length > 0) {
      setShowVarErrors(true)
      toast.error('Enter a sample value for every selected variable')
      return
    }
    const payload = buildPayload(data)
    if (templateId) {
      updateTemplate.mutate({ id: templateId, data: payload }, { onSuccess: onClose })
    } else {
      createTemplate.mutate(payload, { onSuccess: onClose })
    }
  }

  const onSaveDraft = () => {
    if (isLocked) return
    const data = watch()
    const payload = buildPayload(data)
    if (templateId) {
      updateDraft.mutate({ id: templateId, data: payload }, { onSuccess: onClose })
    } else {
      saveDraft.mutate(payload, { onSuccess: onClose })
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white dark:bg-[#0b1220] rounded-2xl w-full max-w-4xl max-h-[calc(100vh-48px)] flex flex-col overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8ebe8] dark:border-white/10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isLocked ? 'View Template' : templateId ? 'Edit Template' : 'Create Template'}
          </h2>
          <button className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-[#f7f8f6] dark:hover:bg-white/5 transition-colors" onClick={onClose}><X size={18} /></button>
        </div>

        {isLocked && (
          <div className="flex items-center gap-2.5 px-6 py-3 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-medium">
            <Lock size={13} className="flex-shrink-0" />
            {templateStatus === 'APPROVED'
              ? 'This template has been approved by Meta and can no longer be edited.'
              : 'This template is pending Meta review and can\'t be edited until that finishes.'}
          </div>
        )}

        <form id="template-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-1 overflow-hidden">
          {/* LEFT — form */}
          <fieldset disabled={isLocked} className="flex-1 min-w-0 overflow-y-auto p-6 space-y-5 border-0">
            {/* basic info */}
            <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Template name *</label>
                <input
                  {...register('name')}
                  className="input mt-1.5"
                  placeholder="e.g. order_confirmation"
                />
                {errors.name && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.name.message}</p>}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Only lowercase letters, numbers, underscores. Cannot be changed after submission.</p>
              </div>

              {/* category */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category *</label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {CATEGORY_CONFIG.map(cat => {
                    const Icon = cat.icon
                    const selected = values.category === cat.value
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setValue('category', cat.value)}
                        className={cn(
                          'border-2 rounded-xl p-3 text-left transition-all',
                          selected ? 'border-[#1a5c3a] bg-[#fafffe] dark:bg-white/5' : 'border-[#e8ebe8] dark:border-white/10 hover:border-[#c8e6d4]'
                        )}
                      >
                        <div className={cn('w-7 h-7 rounded-lg bg-gradient-to-br flex items-center justify-center mb-2', cat.gradient)}>
                          <Icon size={14} className="text-white" />
                        </div>
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{cat.label}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{cat.desc}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* language */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1"><Globe size={14} /> Language</label>
                <select {...register('language')} className="input mt-1.5">
                  {LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>{l.flag} {l.label} ({l.code})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* content */}
            <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl p-5 space-y-4">
              {/* header toggle */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Header (optional)</label>
                  <button type="button" onClick={() => setValue('hasHeader', !values.hasHeader)}
                    className={cn('relative inline-flex h-5 w-9 rounded-full transition-colors', values.hasHeader ? 'bg-[#1a5c3a]' : 'bg-gray-200 dark:bg-white/10')}>
                    <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform', values.hasHeader ? 'translate-x-4' : 'translate-x-0.5')} />
                  </button>
                </div>
                {values.hasHeader && (
                  <div className="mt-3 space-y-3">
                    <div className="flex gap-2">
                      {(['TEXT', 'IMAGE', 'DOCUMENT'] as const).map(t => (
                        <button key={t} type="button" onClick={() => { setValue('headerType', t); setHeaderMedia(undefined) }}
                          className={cn('flex-1 border rounded-xl py-2 text-xs font-medium transition-all', values.headerType === t ? 'border-[#1a5c3a] bg-[#e8f5ee] dark:bg-emerald-950/30 text-[#1a5c3a]' : 'border-[#e8ebe8] dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-[#c8e6d4]')}>
                          {t}
                        </button>
                      ))}
                    </div>
                    {values.headerType === 'TEXT' && (
                      <div>
                        <input {...register('headerText')} className="input" placeholder="Header text (max 60 chars)" maxLength={60} />
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-right">{(values.headerText ?? '').length}/60</p>
                      </div>
                    )}
                    {(values.headerType === 'IMAGE' || values.headerType === 'DOCUMENT') && (
                      <div>
                        <input
                          ref={headerFileRef}
                          type="file"
                          accept={values.headerType === 'IMAGE' ? 'image/*' : 'application/pdf'}
                          className="hidden"
                          onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; if (f) handleHeaderFile(f) }}
                        />
                        {headerUploading ? (
                          <div className="border-2 border-dashed border-[#e8ebe8] dark:border-white/10 rounded-xl p-6 text-center text-sm text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2">
                            <Loader2 size={14} className="animate-spin" /> Uploading...
                          </div>
                        ) : headerMedia ? (
                          <div className="border border-[#e8ebe8] dark:border-white/10 rounded-xl p-3 flex items-center gap-3">
                            {values.headerType === 'IMAGE' ? (
                              <img src={headerMedia.url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-[#e8f5ee] dark:bg-emerald-950/30 flex items-center justify-center flex-shrink-0">
                                <FileText size={16} className="text-[#1a5c3a]" />
                              </div>
                            )}
                            <p className="text-xs text-gray-700 dark:text-gray-300 truncate flex-1">{headerMedia.name}</p>
                            <button type="button" onClick={removeHeaderMedia} className="text-gray-400 hover:text-red-500 flex-shrink-0">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => headerFileRef.current?.click()}
                            className="w-full border-2 border-dashed border-[#e8ebe8] dark:border-white/10 rounded-xl p-6 text-center text-sm text-gray-400 dark:text-gray-500 hover:border-[#1a5c3a] hover:text-[#1a5c3a] transition-colors flex flex-col items-center gap-1.5"
                          >
                            <UploadCloud size={20} />
                            Click to upload {values.headerType.toLowerCase()}
                            <span className="text-[10px] text-gray-400 dark:text-gray-500">
                              {values.headerType === 'IMAGE' ? UPLOAD_LIMITS.image.label : UPLOAD_LIMITS.document.label}
                            </span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* body */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Message body *</label>
                <div className="flex gap-1 mt-2 mb-2 flex-wrap">
                  {[['*', 'Bold', <Bold key="b" size={12} />], ['_', 'Italic', <Italic key="i" size={12} />], ['~', 'Strike', <Strikethrough key="s" size={12} />], ['```', 'Code', <Code2 key="c" size={12} />]].map(([wrap, label, icon]) => (
                    <button key={label as string} type="button" onClick={() => insertFormat(wrap as string)}
                      className="bg-[#f7f8f6] dark:bg-[#0f1724] text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-lg flex items-center gap-1 hover:bg-[#e8ebe8] dark:hover:bg-white/10 transition-colors">
                      {icon} {label}
                    </button>
                  ))}
                  <button type="button" onClick={insertVariable}
                    className="bg-[#e8f5ee] dark:bg-emerald-950/30 text-[#1a5c3a] text-xs px-3 py-1 rounded-lg flex items-center gap-1 font-medium hover:bg-[#d1eedd] transition-colors">
                    <Tag size={12} /> Add variable · {varCount} used
                  </button>
                </div>
                <textarea
                  {...register('body')}
                  ref={(el) => {
                    if (el) (bodyRef as React.MutableRefObject<HTMLTextAreaElement>).current = el
                    register('body').ref(el)
                  }}
                  className="input h-auto min-h-32 py-2 resize-none"
                  placeholder="Type your message here..."
                  rows={5}
                  maxLength={1024}
                />
                <div className="flex justify-between mt-1">
                  {errors.body && <p className="text-xs text-red-500 dark:text-red-400">{errors.body.message}</p>}
                  <p className={cn('text-[10px] text-right ml-auto', (values.body || '').length > 900 ? 'text-red-500 dark:text-red-400' : (values.body || '').length > 800 ? 'text-amber-500 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500')}>
                    {(values.body || '').length}/1024
                  </p>
                </div>

                {detectedVars.length > 0 && (
                  <div className="bg-[#f7f8f6] dark:bg-[#0f1724] rounded-xl p-3 mt-3 space-y-2">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Variable type &amp; sample value (shown to Meta during review)</p>
                    {detectedVars.map(v => {
                      const key = v.replace(/\{\{(\d+)\}\}/, '$1')
                      const isMissing = showVarErrors && varTypes[key] && !(sampleVars[key] ?? '').trim()
                      return (
                        <div key={v}>
                          <div className="flex items-center gap-2">
                            <span className="bg-[#e8f5ee] dark:bg-emerald-950/30 text-[#1a5c3a] text-xs font-mono rounded px-2 py-0.5 min-w-10 shrink-0">{v}</span>
                            <select
                              className="input h-7 text-xs w-36 shrink-0"
                              value={varTypes[key] ?? ''}
                              onChange={(e) => handleVarTypeChange(key, e.target.value)}
                            >
                              <option value="">Variable type…</option>
                              {VARIABLE_TYPE_OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                              ))}
                            </select>
                            <input
                              className={cn('input flex-1 h-7 text-xs', isMissing && 'border-red-500 dark:border-red-400')}
                              placeholder={`Sample value for ${v} *`}
                              value={sampleVars[key] ?? ''}
                              onChange={(e) => setSampleVars(prev => ({ ...prev, [key]: e.target.value }))}
                            />
                          </div>
                          {isMissing && <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 ml-12">Sample value is required</p>}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* footer toggle */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Footer (optional)</label>
                  <button type="button" onClick={() => setValue('hasFooter', !values.hasFooter)}
                    className={cn('relative inline-flex h-5 w-9 rounded-full transition-colors', values.hasFooter ? 'bg-[#1a5c3a]' : 'bg-gray-200 dark:bg-white/10')}>
                    <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform', values.hasFooter ? 'translate-x-4' : 'translate-x-0.5')} />
                  </button>
                </div>
                {values.hasFooter && (
                  <div className="mt-2">
                    <input {...register('footerText')} className="input" placeholder="Opt-out message or disclaimer" maxLength={60} />
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-right">{(values.footerText ?? '').length}/60</p>
                  </div>
                )}
              </div>

              {/* buttons toggle */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Buttons (optional)</label>
                  <button type="button" onClick={() => setValue('hasButtons', !values.hasButtons)}
                    className={cn('relative inline-flex h-5 w-9 rounded-full transition-colors', values.hasButtons ? 'bg-[#1a5c3a]' : 'bg-gray-200 dark:bg-white/10')}>
                    <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform', values.hasButtons ? 'translate-x-4' : 'translate-x-0.5')} />
                  </button>
                </div>
                {values.hasButtons && (
                  <div className="mt-3 space-y-3">
                    <div className="flex gap-2">
                      {[['QUICK_REPLY', 'Quick Replies'], ['CTA', 'Call to Action']].map(([val, label]) => (
                        <button key={val} type="button" onClick={() => setValue('buttonType', val as 'QUICK_REPLY' | 'CTA')}
                          className={cn('flex-1 border rounded-xl py-2 text-xs font-medium transition-all', values.buttonType === val ? 'border-[#1a5c3a] bg-[#e8f5ee] dark:bg-emerald-950/30 text-[#1a5c3a]' : 'border-[#e8ebe8] dark:border-white/10 text-gray-500 dark:text-gray-400')}>
                          {label}
                        </button>
                      ))}
                    </div>

                    {values.buttonType === 'QUICK_REPLY' && (
                      <div className="space-y-2">
                        {qrFields.map((field, i) => (
                          <div key={field.id} className="flex gap-2 items-center">
                            <input {...register(`quickReplies.${i}.text`)} className="input flex-1" placeholder="Button text (max 20 chars)" maxLength={20} />
                            <button type="button" onClick={() => removeQR(i)} className="w-8 h-8 flex items-center justify-center rounded-xl text-red-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"><Trash2 size={14} /></button>
                          </div>
                        ))}
                        {qrFields.length < 3 && (
                          <button type="button" onClick={() => appendQR({ text: '' })}
                            className="text-xs text-[#1a5c3a] flex items-center gap-1 hover:underline">
                            <Plus size={12} /> Add button
                          </button>
                        )}
                      </div>
                    )}

                    {values.buttonType === 'CTA' && (
                      <div className="space-y-2">
                        {ctaFields.map((field, i) => (
                          <div key={field.id} className="bg-[#f7f8f6] dark:bg-[#0f1724] rounded-xl p-3 space-y-2">
                            <div className="flex gap-2 items-center">
                              <select {...register(`ctaButtons.${i}.type`)} className="input w-36">
                                <option value="URL">Visit website</option>
                                <option value="PHONE_NUMBER">Call phone</option>
                              </select>
                              <input {...register(`ctaButtons.${i}.text`)} className="input flex-1" placeholder="Button text" maxLength={20} />
                              <button type="button" onClick={() => removeCTA(i)} className="w-8 h-8 flex items-center justify-center rounded-xl text-red-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"><Trash2 size={14} /></button>
                            </div>
                            <input {...register(`ctaButtons.${i}.value`)} className="input" placeholder={values.ctaButtons?.[i]?.type === 'URL' ? 'https://...' : '+91 XXXXXXXXXX'} />
                          </div>
                        ))}
                        {ctaFields.length < 2 && (
                          <button type="button" onClick={() => appendCTA({ type: 'URL', text: '', value: '' })}
                            className="text-xs text-[#1a5c3a] flex items-center gap-1 hover:underline">
                            <Plus size={12} /> Add button
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </fieldset>

          {/* RIGHT — preview */}
          <div className="w-72 border-l border-[#e8ebe8] dark:border-white/10 p-5 flex flex-col gap-4 overflow-y-auto bg-[#f7f8f6] dark:bg-[#0f1724]">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Live preview</p>
            <TemplatePreview template={previewTemplate} />

            <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-xl p-4 space-y-2">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Character limits</p>
              {values.hasHeader && values.headerType === 'TEXT' && (
                <div>
                  <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                    <span>Header</span><span>{(values.headerText ?? '').length}/60</span>
                  </div>
                  <div className="bg-gray-100 dark:bg-white/10 rounded-full h-1"><div className="bg-[#1a5c3a] h-1 rounded-full" style={{ width: `${((values.headerText ?? '').length / 60) * 100}%` }} /></div>
                </div>
              )}
              <div>
                <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                  <span>Body</span><span>{(values.body || '').length}/1024</span>
                </div>
                <div className="bg-gray-100 dark:bg-white/10 rounded-full h-1">
                  <div className={cn('h-1 rounded-full', (values.body || '').length > 900 ? 'bg-red-500' : (values.body || '').length > 800 ? 'bg-amber-500' : 'bg-[#1a5c3a]')}
                    style={{ width: `${Math.min(((values.body || '').length / 1024) * 100, 100)}%` }} />
                </div>
              </div>
              {values.hasFooter && (
                <div>
                  <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                    <span>Footer</span><span>{(values.footerText ?? '').length}/60</span>
                  </div>
                  <div className="bg-gray-100 dark:bg-white/10 rounded-full h-1"><div className="bg-[#1a5c3a] h-1 rounded-full" style={{ width: `${((values.footerText ?? '').length / 60) * 100}%` }} /></div>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#e8ebe8] dark:border-white/10">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {isLocked ? 'Duplicate this template if you need to make changes.' : 'Meta approval typically takes 24–48 hours'}
          </p>
          <div className="flex gap-2">
            {!isLocked && (
              <button
                type="button"
                className="btn-outline h-9 px-4"
                disabled={saveDraft.isPending || updateDraft.isPending}
                onClick={onSaveDraft}
              >
                {(saveDraft.isPending || updateDraft.isPending) ? 'Saving...' : 'Save as draft'}
              </button>
            )}
            {!isLocked && (
              <button
                type="submit"
                form="template-form"
                className="btn-primary h-9 px-5"
                disabled={createTemplate.isPending || updateTemplate.isPending}
              >
                {(createTemplate.isPending || updateTemplate.isPending) ? 'Submitting...' : 'Submit for review'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
