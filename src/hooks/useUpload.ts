import { useMutation } from '@tanstack/react-query'
import api from '@/lib/axios'

function uploadFile(endpoint: string, file: File) {
  const form = new FormData()
  form.append('file', file)
  return api
    .post(endpoint, form, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data.data)
}

export function useUploadImage() {
  return useMutation({
    mutationFn: (file: File) => uploadFile('/upload/image', file),
  })
}

export function useUploadDocument() {
  return useMutation({
    mutationFn: (file: File) => uploadFile('/upload/document', file),
  })
}

export function useUploadAudio() {
  return useMutation({
    mutationFn: (file: File) => uploadFile('/upload/audio', file),
  })
}

export function useDeleteFile() {
  return useMutation({
    mutationFn: (key: string) =>
      api.delete(`/upload/${encodeURIComponent(key)}`).then((r) => r.data),
  })
}
