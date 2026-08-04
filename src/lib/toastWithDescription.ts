import toast from 'react-hot-toast'

/** Show a toast with a bold title and a muted description line below it. */
export function toastWithDescription(
  type: 'success' | 'error' | 'blank',
  title: string,
  description?: string
) {
  const message = description ? `${title}\n${description}` : title
  if (type === 'blank') return toast(message)
  return toast[type](message)
}
