import { api } from '../client';
import type { ApiResponse, PaginationParams } from '../../types/api.types';
import type {
  BondDetail,
  CreateBondDetailRequest,
  UpdateBondDetailRequest,
} from '../../types/domain.types';

export const bondsService = {
  getAll: async (params?: PaginationParams & {
    issuer?: string;
    bond_type?: string;
    credit_rating?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<BondDetail[]>> => {
    return api.get<BondDetail[]>('/bonds', { params });
  },

  getById: async (securityId: number | string): Promise<ApiResponse<BondDetail>> => {
    return api.get<BondDetail>(`/bonds/${securityId}`);
  },

  create: async (data: CreateBondDetailRequest): Promise<ApiResponse<BondDetail>> => {
    return api.post<BondDetail>('/bonds', data);
  },

  update: async (securityId: number | string, data: UpdateBondDetailRequest): Promise<ApiResponse<BondDetail>> => {
    return api.put<BondDetail>(`/bonds/${securityId}`, data);
  },

  delete: async (securityId: number | string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/bonds/${securityId}`);
  },

  getByIssuer: async (issuer: string, params?: PaginationParams): Promise<ApiResponse<BondDetail[]>> => {
    return api.get<BondDetail[]>(`/bonds/issuer/${encodeURIComponent(issuer)}`, { params });
  },

  getByMaturity: async (from: string, to: string, params?: PaginationParams): Promise<ApiResponse<BondDetail[]>> => {
    return api.get<BondDetail[]>('/bonds/maturity', { 
      params: { from, to, ...params } 
    });
  },
};

