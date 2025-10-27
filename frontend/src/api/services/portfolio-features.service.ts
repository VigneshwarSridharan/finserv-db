import { api } from '../client';
import type { ApiResponse, PaginationParams } from '../../types/api.types';
import type {
  PortfolioGoal,
  CreateGoalRequest,
  AssetAllocation,
  CreateAllocationRequest,
  PortfolioAlert,
  CreateAlertRequest,
  WatchlistItem,
  CreateWatchlistRequest,
  PortfolioOverview,
} from '../../types/domain.types';

// Portfolio Overview
export const portfolioOverviewService = {
  getOverview: async (): Promise<ApiResponse<PortfolioOverview>> => {
    return api.get<PortfolioOverview>('/portfolio/overview');
  },

  getDashboard: async (): Promise<ApiResponse<any>> => {
    return api.get<any>('/portfolio/overview/dashboard');
  },
};

// Portfolio Goals
export const portfolioGoalsService = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<PortfolioGoal[]>> => {
    return api.get<PortfolioGoal[]>('/portfolio/goals', { params });
  },

  getById: async (id: number | string): Promise<ApiResponse<PortfolioGoal>> => {
    return api.get<PortfolioGoal>(`/portfolio/goals/${id}`);
  },

  create: async (data: CreateGoalRequest): Promise<ApiResponse<PortfolioGoal>> => {
    return api.post<PortfolioGoal>('/portfolio/goals', data);
  },

  update: async (id: number | string, data: Partial<CreateGoalRequest>): Promise<ApiResponse<PortfolioGoal>> => {
    return api.put<PortfolioGoal>(`/portfolio/goals/${id}`, data);
  },

  delete: async (id: number | string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/portfolio/goals/${id}`);
  },
};

// Asset Allocation
export const assetAllocationService = {
  getAll: async (): Promise<ApiResponse<AssetAllocation[]>> => {
    return api.get<AssetAllocation[]>('/portfolio/allocation');
  },

  getById: async (id: number | string): Promise<ApiResponse<AssetAllocation>> => {
    return api.get<AssetAllocation>(`/portfolio/allocation/${id}`);
  },

  create: async (data: CreateAllocationRequest): Promise<ApiResponse<AssetAllocation>> => {
    return api.post<AssetAllocation>('/portfolio/allocation', data);
  },

  update: async (id: number | string, data: Partial<CreateAllocationRequest>): Promise<ApiResponse<AssetAllocation>> => {
    return api.put<AssetAllocation>(`/portfolio/allocation/${id}`, data);
  },

  delete: async (id: number | string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/portfolio/allocation/${id}`);
  },
};

// Portfolio Alerts
export const portfolioAlertService = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<PortfolioAlert[]>> => {
    return api.get<PortfolioAlert[]>('/portfolio/alerts', { params });
  },

  getById: async (id: number | string): Promise<ApiResponse<PortfolioAlert>> => {
    return api.get<PortfolioAlert>(`/portfolio/alerts/${id}`);
  },

  create: async (data: CreateAlertRequest): Promise<ApiResponse<PortfolioAlert>> => {
    return api.post<PortfolioAlert>('/portfolio/alerts', data);
  },

  update: async (id: number | string, data: Partial<CreateAlertRequest>): Promise<ApiResponse<PortfolioAlert>> => {
    return api.put<PortfolioAlert>(`/portfolio/alerts/${id}`, data);
  },

  delete: async (id: number | string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/portfolio/alerts/${id}`);
  },
};

// Watchlist
export const watchlistService = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<WatchlistItem[]>> => {
    return api.get<WatchlistItem[]>('/portfolio/watchlist', { params });
  },

  getById: async (id: number | string): Promise<ApiResponse<WatchlistItem>> => {
    return api.get<WatchlistItem>(`/portfolio/watchlist/${id}`);
  },

  add: async (data: CreateWatchlistRequest): Promise<ApiResponse<WatchlistItem>> => {
    return api.post<WatchlistItem>('/portfolio/watchlist', data);
  },

  remove: async (id: number | string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/portfolio/watchlist/${id}`);
  },

  update: async (id: number | string, data: Partial<CreateWatchlistRequest>): Promise<ApiResponse<WatchlistItem>> => {
    return api.put<WatchlistItem>(`/portfolio/watchlist/${id}`, data);
  },
};

// Portfolio Performance
export const portfolioPerformanceService = {
  getPerformance: async (params?: any): Promise<ApiResponse<any>> => {
    return api.get<any>('/portfolio/performance', { params });
  },
};

// Portfolio Reports
export const portfolioReportService = {
  getReports: async (params?: any): Promise<ApiResponse<any>> => {
    return api.get<any>('/portfolio/reports', { params });
  },

  generateReport: async (data: any): Promise<ApiResponse<any>> => {
    return api.post<any>('/portfolio/reports', data);
  },
};


