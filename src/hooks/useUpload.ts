import { useMutation } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { UploadResponse } from '@/types'

function uploadFile(endpoint: string, file: File): Promise<UploadResponse> {
  const form = new FormData()
  form.append('file', file)
  return api
    .post(endpoint, form, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data.data)
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
