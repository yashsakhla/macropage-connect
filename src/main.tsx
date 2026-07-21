import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { GoogleOAuthProvider } from '@react-oauth/google'
import toast, { Toaster } from 'react-hot-toast'
import App from './App'
import { getErrorToastMessage } from '@/lib/axios'
import './index.css'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
  // Single place that decides whether a failed request shows a toast — fires
  // once per query/mutation that finally settles as an error (not once per
  // retry attempt), which is what used to cause two toasts for one failure.
  queryCache: new QueryCache({
    onError: (error) => {
      const msg = getErrorToastMessage(error)
      if (msg) toast.error(msg)
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      // A mutation with its own onError already shows a more specific toast —
      // don't layer a second, generic one on top of it.
      if (mutation.options.onError) return
      const msg = getErrorToastMessage(error)
      if (msg) toast.error(msg)
    },
  }),
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontSize: '14px',
              borderRadius: '10px',
              border: '1px solid #e5e7eb',
            },
          }}
        />
        <ReactQueryDevtools initialIsOpen={false} />
      </GoogleOAuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
