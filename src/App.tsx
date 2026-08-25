import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import AuthLayout from '@/components/layout/AuthLayout'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import RouteErrorBoundary from '@/components/shared/RouteErrorBoundary'
import RequireCatalog from '@/components/catalog/RequireCatalog'

// Auth pages
const Login          = lazy(() => import('@/pages/auth/Login'))
const Register       = lazy(() => import('@/pages/auth/Register'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'))
const ResetPassword  = lazy(() => import('@/pages/auth/ResetPassword'))
const AuthCallback    = lazy(() => import('@/pages/auth/AuthCallback'))
const SelectAccount   = lazy(() => import('@/pages/auth/SelectAccount'))

// App pages
const Dashboard      = lazy(() => import('@/pages/dashboard/Dashboard'))
const Automation     = lazy(() => import('@/pages/automation/Automation'))
const FlowBuilder    = lazy(() => import('@/pages/automation/FlowBuilder'))
// AISettings.tsx holds the real AI Chatbot Configuration page. Routing is
// pointed at AIChatbotComingSoon instead until the feature is ready to ship.
const AIChatbotComingSoon = lazy(() => import('@/pages/automation/AIChatbotComingSoon'))
const Inbox          = lazy(() => import('@/pages/inbox/Inbox'))
const Campaigns      = lazy(() => import('@/pages/campaigns/Campaigns'))
const CampaignDetail = lazy(() => import('@/pages/campaigns/CampaignDetail'))
const Templates      = lazy(() => import('@/pages/campaigns/Templates'))
const Contacts       = lazy(() => import('@/pages/contacts/Contacts'))
const ContactDetail  = lazy(() => import('@/pages/contacts/ContactDetail'))
const Products       = lazy(() => import('@/pages/catalog/Products'))
const CatalogConnect  = lazy(() => import('@/pages/catalog/CatalogConnect'))
const OAuthCallback   = lazy(() => import('@/pages/catalog/OAuthCallback'))
const Orders         = lazy(() => import('@/pages/orders/Orders'))
const OrderDetail    = lazy(() => import('@/pages/orders/OrderDetail'))
const Team           = lazy(() => import('@/pages/team/Team'))
const MemberProfile  = lazy(() => import('@/pages/team/MemberProfile'))
const Settings       = lazy(() => import('@/pages/settings/Settings'))
const DeveloperDocs   = lazy(() => import('@/pages/developers/DeveloperDocs'))
const ApiReference    = lazy(() => import('@/pages/developers/ApiReference'))
const WhatsAppSetup   = lazy(() => import('@/pages/setup/WhatsAppSetup'))
const SetupComplete   = lazy(() => import('@/pages/setup/SetupComplete'))
const Help            = lazy(() => import('@/pages/help/Help'))
const ArticleDetail   = lazy(() => import('@/pages/help/ArticleDetail'))
const MyTickets       = lazy(() => import('@/pages/help/MyTickets'))
const TicketDetail    = lazy(() => import('@/pages/help/TicketDetail'))
const Plans           = lazy(() => import('@/pages/plans/Plans'))
const VerifyEmail     = lazy(() => import('@/pages/auth/VerifyEmail'))
const VerifyOtp       = lazy(() => import('@/pages/auth/VerifyOtp'))
const AcceptInvite    = lazy(() => import('@/pages/invite/AcceptInvite'))
const Changelog       = lazy(() => import('@/pages/changelog/Changelog'))

const router = createBrowserRouter([
  // Public auth routes
  {
    element: <AuthLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: '/login',           element: <Login /> },
      { path: '/register',        element: <Register /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/auth/callback',   element: <AuthCallback /> },
      { path: '/reset-password',  element: <ResetPassword /> },
    ],
  },
  // Account selection — reached after login, before entering the app;
  // needs auth (token) but not a selected tenant, so it lives outside
  // both AuthLayout's public routes and ProtectedRoute's tenant-scoped routes.
  {
    path: '/select-account',
    element: (
      <Suspense fallback={null}>
        <SelectAccount />
      </Suspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  // Facebook OAuth popup redirect target — opened only inside the small
  // popup window during catalog connect, never needs auth/tenant context
  {
    path: '/catalog/oauth-callback',
    element: (
      <Suspense fallback={null}>
        <OAuthCallback />
      </Suspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  // Protected app routes
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: '/',          element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard',    element: <Dashboard /> },
      { path: '/automation',   element: <Automation /> },
      {
        path: '/automation/ai',
        element: (
          <ProtectedRoute roles={['OWNER', 'ADMIN', 'MANAGER']}>
            <AIChatbotComingSoon />
          </ProtectedRoute>
        ),
      },
      { path: '/inbox',        element: <Inbox /> },
      { path: '/inbox/:conversationId', element: <Inbox /> },
      { path: '/campaigns', element: <Campaigns /> },
      { path: '/campaigns/:id', element: <CampaignDetail /> },
      { path: '/templates', element: <Templates /> },
      { path: '/contacts',     element: <Contacts /> },
      { path: '/contacts/:id', element: <ContactDetail /> },
      { path: '/catalog', element: <CatalogConnect /> },
      {
        path: '/catalog/products',
        element: (
          <RequireCatalog>
            <Products />
          </RequireCatalog>
        ),
      },
      { path: '/orders',       element: <Orders /> },
      { path: '/orders/:id',   element: <OrderDetail /> },
      { path: '/team',             element: <Team /> },
      { path: '/team/:memberId',   element: <MemberProfile /> },
      { path: '/setup/whatsapp', element: <WhatsAppSetup /> },
      { path: '/setup/complete', element: <SetupComplete /> },
      { path: '/settings', element: <Settings /> },
      { path: '/settings/:section', element: <Settings /> },
      { path: '/developers', element: <DeveloperDocs /> },
      { path: '/developers/api-reference', element: <ApiReference /> },
      { path: '/help', element: <Help /> },
      { path: '/help/articles/:slug', element: <ArticleDetail /> },
      { path: '/help/tickets', element: <MyTickets /> },
      { path: '/help/tickets/:ticketId', element: <TicketDetail /> },
      { path: '/changelog', element: <Changelog /> },
      { path: '/plans', element: <Plans /> },
    ],
  },
  // Flow builder — full screen, outside MainLayout
  {
    path: '/automation/flows/new',
    element: (
      <ProtectedRoute feature="flow_builder" roles={['OWNER', 'ADMIN', 'MANAGER']}>
        <Suspense fallback={null}>
          <FlowBuilder />
        </Suspense>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/automation/flows/:id',
    element: (
      <ProtectedRoute feature="flow_builder" roles={['OWNER', 'ADMIN', 'MANAGER']}>
        <Suspense fallback={null}>
          <FlowBuilder />
        </Suspense>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  // Email verification — public, no auth required (user may click link before logging in)
  {
    path: '/auth/verify-email/:token',
    element: (
      <Suspense fallback={null}>
        <VerifyEmail />
      </Suspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/verify-email',
    element: (
      <Suspense fallback={null}>
        <VerifyEmail />
      </Suspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  // OTP verification for accounts that registered but never completed the
  // signup OTP step — reached only via the emailVerified:false login redirect.
  {
    path: '/verify-otp',
    element: (
      <Suspense fallback={null}>
        <VerifyOtp />
      </Suspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  // Accept team invite — public, invitee has no account yet
  {
    path: '/invite/accept',
    element: (
      <Suspense fallback={null}>
        <AcceptInvite />
      </Suspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/accept-invite',
    element: (
      <Suspense fallback={null}>
        <AcceptInvite />
      </Suspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  // Catch-all
  { path: '*', element: <Navigate to="/" replace /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
