import { useMutation } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { UploadResponse } from '@/types'

// Per-file limits enforced by the backend — surfaced here so every upload UI
// in the app can show the right limit for what it's actually uploading.
export const UPLOAD_LIMITS = {
  image: { maxBytes: 5 * 1024 * 1024, label: 'Max 5MB' },
  document: { maxBytes: 20 * 1024 * 1024, label: 'Max 20MB' },
  audio: { maxBytes: 16 * 1024 * 1024, label: 'Max 16MB' },
} as const

function uploadFile(
  endpoint: string,
  file: File,
  onUploadProgress?: (percent: number) => void
): Promise<UploadResponse> {
  const form = new FormData()
  form.append('file', file)
  return api
    .post(endpoint, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onUploadProgress
        ? (e) => { if (e.total) onUploadProgress(Math.round((e.loaded / e.total) * 100)) }
        : undefined,
    })
    .then((r) => {
      // Response shape isn't consistent across endpoints — some nest under
      // `data.data`, some return the payload directly at the top level.
      const body = r.data?.data ?? r.data ?? {}
      const url = body.url ?? body.fileUrl ?? body.location ?? body.secure_url
      const key = body.key ?? body.fileKey ?? body.path ?? url
      if (!url) throw new Error('Upload response did not include a file URL')
      return { url, key }
    })
}

export const uploadImage = (file: File, onUploadProgress?: (percent: number) => void) =>
  uploadFile('/upload/image', file, onUploadProgress)
export const uploadDocument = (file: File, onUploadProgress?: (percent: number) => void) =>
  uploadFile('/upload/document', file, onUploadProgress)
export const uploadAudio = (file: File, onUploadProgress?: (percent: number) => void) =>
  uploadFile('/upload/audio', file, onUploadProgress)

export function useUploadImage() {
  return useMutation({ mutationFn: (file: File) => uploadImage(file) })
}

export function useUploadDocument() {
  return useMutation({ mutationFn: (file: File) => uploadDocument(file) })
}

export function useUploadAudio() {
  return useMutation({ mutationFn: (file: File) => uploadAudio(file) })
}

export function useDeleteFile() {
  return useMutation({
    mutationFn: (key: string) =>
      api.delete(`/upload/${encodeURIComponent(key)}`).then((r) => r.data),
  })
}
