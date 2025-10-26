import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Query keys factory
export const queryKeys = {
  // Auth
  auth: {
    user: ['auth', 'user'] as const,
  },
  
  // Portfolio
  portfolios: {
    all: ['portfolios'] as const,
    detail: (id: number | string) => ['portfolios', id] as const,
  },
  
  // Brokers
  brokers: {
    all: ['brokers'] as const,
    detail: (id: number | string) => ['brokers', id] as const,
  },
  
  // Securities
  securities: {
    all: ['securities'] as const,
    detail: (id: number | string) => ['securities', id] as const,
    search: (query: string) => ['securities', 'search', query] as const,
    prices: (securityId: number | string) => ['securities', securityId, 'prices'] as const,
  },
  
  // Broker Accounts
  brokerAccounts: {
    all: ['brokerAccounts'] as const,
    detail: (id: number | string) => ['brokerAccounts', id] as const,
  },
  
  // Holdings
  holdings: {
    all: ['holdings'] as const,
    summary: ['holdings', 'summary'] as const,
    detail: (id: number | string) => ['holdings', id] as const,
  },
  
  // Transactions
  transactions: {
    securities: ['transactions', 'securities'] as const,
    banks: ['transactions', 'banks'] as const,
    assets: ['transactions', 'assets'] as const,
  },
  
  // Banks
  banks: {
    all: ['banks'] as const,
    detail: (id: number | string) => ['banks', id] as const,
  },
  
  // Bank Accounts
  bankAccounts: {
    all: ['bankAccounts'] as const,
    detail: (id: number | string) => ['bankAccounts', id] as const,
  },
  
  // Fixed Deposits
  fixedDeposits: {
    all: ['fixedDeposits'] as const,
    detail: (id: number | string) => ['fixedDeposits', id] as const,
    interestPayments: (fdId: number | string) => ['fixedDeposits', fdId, 'interest'] as const,
  },
  
  // Recurring Deposits
  recurringDeposits: {
    all: ['recurringDeposits'] as const,
    detail: (id: number | string) => ['recurringDeposits', id] as const,
    installments: (rdId: number | string) => ['recurringDeposits', rdId, 'installments'] as const,
  },
  
  // Assets
  assets: {
    all: ['assets'] as const,
    detail: (id: number | string) => ['assets', id] as const,
    categories: ['assets', 'categories'] as const,
    realEstate: (assetId: number | string) => ['assets', assetId, 'realEstate'] as const,
    gold: (assetId: number | string) => ['assets', assetId, 'gold'] as const,
    valuations: (assetId: number | string) => ['assets', assetId, 'valuations'] as const,
  },
  
  // Portfolio Features
  portfolio: {
    overview: ['portfolio', 'overview'] as const,
    dashboard: ['portfolio', 'dashboard'] as const,
    goals: ['portfolio', 'goals'] as const,
    allocation: ['portfolio', 'allocation'] as const,
    alerts: ['portfolio', 'alerts'] as const,
    watchlist: ['portfolio', 'watchlist'] as const,
    performance: ['portfolio', 'performance'] as const,
    reports: ['portfolio', 'reports'] as const,
  },
  
  // User Profile
  profile: {
    me: ['profile', 'me'] as const,
    preferences: ['profile', 'preferences'] as const,
  },
};

export default queryClient;


