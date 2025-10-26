import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuthStore } from '../store/authStore';
import { Box, Spinner } from '@chakra-ui/react';

// Lazy load pages
const LoginPage = lazy(() => import('../features/auth/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/RegisterPage'));
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'));
const SecuritiesPage = lazy(() => import('../features/securities/SecuritiesPage'));
const BankingPage = lazy(() => import('../features/banking/BankingPage'));
const AssetsPage = lazy(() => import('../features/assets/AssetsPage'));
const PortfolioPage = lazy(() => import('../features/portfolio/PortfolioPage'));
const ProfilePage = lazy(() => import('../features/profile/ProfilePage'));
const AppLayout = lazy(() => import('../components/layout/AppLayout'));

// Loading component
const LoadingFallback = () => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="center"
    minH="100vh"
  >
    <Spinner size="xl" color="brand.500" />
  </Box>
);

// Private Route wrapper
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route wrapper (redirect to dashboard if already authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="securities" element={<SecuritiesPage />} />
          <Route path="banking" element={<BankingPage />} />
          <Route path="assets" element={<AssetsPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<ProfilePage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;


