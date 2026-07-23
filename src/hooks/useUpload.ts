import { useMutation } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { UploadResponse } from '@/types'

function uploadFile(endpoint: string, file: File): Promise<UploadResponse> {
  const form = new FormData()
  form.append('file', file)
  return api
    .post(endpoint, form, { headers: { 'Content-Type': 'multipart/form-data' } })
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

export const uploadImage = (file: File) => uploadFile('/upload/image', file)
export const uploadDocument = (file: File) => uploadFile('/upload/document', file)
export const uploadAudio = (file: File) => uploadFile('/upload/audio', file)

export function useUploadImage() {
  return useMutation({ mutationFn: uploadImage })
}

export function useUploadDocument() {
  return useMutation({ mutationFn: uploadDocument })
}

export function useUploadAudio() {
  return useMutation({ mutationFn: uploadAudio })
}

export function useDeleteFile() {
  return useMutation({
    mutationFn: (key: string) =>
      api.delete(`/upload/${encodeURIComponent(key)}`).then((r) => r.data),
  })
}
