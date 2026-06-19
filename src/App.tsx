import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import AuthLayout from '@/components/layout/AuthLayout'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import RequireRole from '@/components/auth/RequireRole'

// Auth pages
const Login          = lazy(() => import('@/pages/auth/Login'))
const Register       = lazy(() => import('@/pages/auth/Register'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'))
const ResetPassword  = lazy(() => import('@/pages/auth/ResetPassword'))
const AuthCallback    = lazy(() => import('@/pages/auth/AuthCallback'))

// App pages
const Dashboard      = lazy(() => import('@/pages/dashboard/Dashboard'))
const Automation     = lazy(() => import('@/pages/automation/Automation'))
const FlowBuilder    = lazy(() => import('@/pages/automation/FlowBuilder'))
const AISettings     = lazy(() => import('@/pages/automation/AISettings'))
const Inbox          = lazy(() => import('@/pages/inbox/Inbox'))
const Campaigns      = lazy(() => import('@/pages/campaigns/Campaigns'))
const CampaignDetail = lazy(() => import('@/pages/campaigns/CampaignDetail'))
const Templates      = lazy(() => import('@/pages/campaigns/Templates'))
const Contacts       = lazy(() => import('@/pages/contacts/Contacts'))
const ContactDetail  = lazy(() => import('@/pages/contacts/ContactDetail'))
const Team           = lazy(() => import('@/pages/team/Team'))
const MemberProfile  = lazy(() => import('@/pages/team/MemberProfile'))
const Settings       = lazy(() => import('@/pages/settings/Settings'))
const WhatsAppSetup   = lazy(() => import('@/pages/setup/WhatsAppSetup'))
const SetupComplete   = lazy(() => import('@/pages/setup/SetupComplete'))
const Help            = lazy(() => import('@/pages/help/Help'))
const ArticleDetail   = lazy(() => import('@/pages/help/ArticleDetail'))
const Plans           = lazy(() => import('@/pages/plans/Plans'))
const VerifyEmail     = lazy(() => import('@/pages/auth/VerifyEmail'))
const AcceptInvite    = lazy(() => import('@/pages/invite/AcceptInvite'))

const router = createBrowserRouter([
  // Public auth routes
  {
    element: <AuthLayout />,
    children: [
      { path: '/login',           element: <Login /> },
      { path: '/register',        element: <Register /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/auth/callback',   element: <AuthCallback /> },
      { path: '/reset-password',  element: <ResetPassword /> },
    ],
  },
  // Protected app routes
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/',          element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard',    element: <Dashboard /> },
      { path: '/automation',   element: <Automation /> },
      {
        path: '/automation/ai',
        element: (
          <ProtectedRoute
            feature="ai_chatbot"
            roles={['OWNER', 'ADMIN', 'MANAGER']}
          >
            <AISettings />
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
      { path: '/team',             element: <Team /> },
      { path: '/team/:memberId',   element: <MemberProfile /> },
      { path: '/setup/whatsapp', element: <WhatsAppSetup /> },
      { path: '/setup/complete', element: <SetupComplete /> },
      { path: '/settings', element: <Settings /> },
      {
        path: '/settings/billing',
        element: (
          <RequireRole allowedRoles={['OWNER']}>
            <Settings />
          </RequireRole>
        ),
      },
      { path: '/settings/:section', element: <Settings /> },
      { path: '/help', element: <Help /> },
      { path: '/help/articles/:slug', element: <ArticleDetail /> },
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
  },
  // Email verification — public, no auth required (user may click link before logging in)
  {
    path: '/auth/verify-email/:token',
    element: (
      <Suspense fallback={null}>
        <VerifyEmail />
      </Suspense>
    ),
  },
  {
    path: '/verify-email',
    element: (
      <Suspense fallback={null}>
        <VerifyEmail />
      </Suspense>
    ),
  },
  // Accept team invite — public, invitee has no account yet
  {
    path: '/invite/accept',
    element: (
      <Suspense fallback={null}>
        <AcceptInvite />
      </Suspense>
    ),
  },
  {
    path: '/accept-invite',
    element: (
      <Suspense fallback={null}>
        <AcceptInvite />
      </Suspense>
    ),
  },
  // Catch-all
  { path: '*', element: <Navigate to="/" replace /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
