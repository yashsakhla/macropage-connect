let loaded = false

export function loadRazorpay(): Promise<void> {
  if (loaded || typeof window === 'undefined') return Promise.resolve()
  if (document.querySelector('script[src*="razorpay"]')) {
    loaded = true
    return Promise.resolve()
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => { loaded = true; resolve() }
    script.onerror = () => reject(new Error('Failed to load Razorpay'))
    document.body.appendChild(script)
  })
}
