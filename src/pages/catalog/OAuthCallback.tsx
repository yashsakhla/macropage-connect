// The parent window's poller (facebook-catalog-oauth.ts) detects the URL
// change and closes this popup almost immediately, so no real UI is needed.
export default function OAuthCallback() {
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-sm text-gray-400">Connecting...</p>
    </div>
  )
}
