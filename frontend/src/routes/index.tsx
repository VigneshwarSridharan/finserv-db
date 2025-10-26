import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuthStore } from '../store/authStore';
import { Box, Spinner } from '@chakra-ui/react';

// Lazy load pages
const LoginPage = lazy(() => import('../features/auth/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/RegisterPage'));
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'));
const SecuritiesPage = lazy(() => import('../features/securities/SecuritiesPage'));
const BrokersPage = lazy(() => import('../features/securities/BrokersPage'));
const HoldingsPage = lazy(() => import('../features/securities/HoldingsPage'));
const TransactionsPage = lazy(() => import('../features/securities/TransactionsPage'));
const BankingPage = lazy(() => import('../features/banking/BankingPage'));
const BankAccountsPage = lazy(() => import('../features/banking/BankAccountsPage'));
const FixedDepositsPage = lazy(() => import('../features/banking/FixedDepositsPage'));
const RecurringDepositsPage = lazy(() => import('../features/banking/RecurringDepositsPage'));
const AssetsPage = lazy(() => import('../features/assets/AssetsPage'));
const AssetsListPage = lazy(() => import('../features/assets/AssetsListPage'));
const CategoriesPage = lazy(() => import('../features/assets/CategoriesPage'));
const PortfolioPage = lazy(() => import('../features/portfolio/PortfolioPage'));
const GoalsPage = lazy(() => import('../features/portfolio/GoalsPage'));
const AlertsPage = lazy(() => import('../features/portfolio/AlertsPage'));
const WatchlistPage = lazy(() => import('../features/portfolio/WatchlistPage'));
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
          <Route path="securities/brokers" element={<BrokersPage />} />
          <Route path="securities/holdings" element={<HoldingsPage />} />
          <Route path="securities/transactions" element={<TransactionsPage />} />
          <Route path="banking" element={<BankingPage />} />
          <Route path="banking/accounts" element={<BankAccountsPage />} />
          <Route path="banking/fixed-deposits" element={<FixedDepositsPage />} />
          <Route path="banking/recurring-deposits" element={<RecurringDepositsPage />} />
          <Route path="assets" element={<AssetsPage />} />
          <Route path="assets/list" element={<AssetsListPage />} />
          <Route path="assets/categories" element={<CategoriesPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="portfolio/goals" element={<GoalsPage />} />
          <Route path="portfolio/alerts" element={<AlertsPage />} />
          <Route path="portfolio/watchlist" element={<WatchlistPage />} />
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


