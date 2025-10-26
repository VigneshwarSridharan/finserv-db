import { api } from '../client';
import type { ApiResponse } from '../../types/api.types';
import type { Portfolio, CreatePortfolioRequest, UpdatePortfolioRequest } from '../../types/domain.types';

export const portfolioService = {
  getAll: async (): Promise<ApiResponse<Portfolio[]>> => {
    return api.get<Portfolio[]>('/portfolios');
  },

  getById: async (id: number | string): Promise<ApiResponse<Portfolio>> => {
    return api.get<Portfolio>(`/portfolios/${id}`);
  },

  create: async (data: CreatePortfolioRequest): Promise<ApiResponse<Portfolio>> => {
    return api.post<Portfolio>('/portfolios', data);
  },

  update: async (id: number | string, data: UpdatePortfolioRequest): Promise<ApiResponse<Portfolio>> => {
    return api.put<Portfolio>(`/portfolios/${id}`, data);
  },

  delete: async (id: number | string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/portfolios/${id}`);
  },
};

export default portfolioService;


