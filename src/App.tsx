import { GoogleOAuthProvider } from '@react-oauth/google'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { ApiError } from './api/errors'
import { RequireAuth } from './auth/session'
import { LoginPage } from './pages/LoginPage'
import { LogVisitPanel } from './pages/LogVisitPanel'
import { ProfilePanel } from './pages/ProfilePanel'
import { RecommendationsPanel } from './pages/RecommendationsPanel'
import { VisitsPanel } from './pages/VisitsPanel'
import { GlobeHome, Shell } from './Shell'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 2,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <RequireAuth>
                <Shell />
              </RequireAuth>
            }
          >
            <Route index element={<GlobeHome />} />
            <Route path="recommendations" element={<RecommendationsPanel />} />
            <Route path="log" element={<LogVisitPanel />} />
            <Route path="visits" element={<VisitsPanel />} />
            <Route path="profile" element={<ProfilePanel />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  )
}
