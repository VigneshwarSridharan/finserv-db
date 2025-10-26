import { api } from '../client';
import type { ApiResponse, PaginationParams } from '../../types/api.types';
import type {
  Asset,
  CreateAssetRequest,
  AssetCategory,
  CreateAssetCategoryRequest,
} from '../../types/domain.types';

// Asset Categories
export const assetCategoryService = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<AssetCategory[]>> => {
    return api.get<AssetCategory[]>('/assets/categories', { params });
  },

  getById: async (id: number | string): Promise<ApiResponse<AssetCategory>> => {
    return api.get<AssetCategory>(`/assets/categories/${id}`);
  },

  create: async (data: CreateAssetCategoryRequest): Promise<ApiResponse<AssetCategory>> => {
    return api.post<AssetCategory>('/assets/categories', data);
  },

  update: async (id: number | string, data: Partial<CreateAssetCategoryRequest>): Promise<ApiResponse<AssetCategory>> => {
    return api.put<AssetCategory>(`/assets/categories/${id}`, data);
  },

  delete: async (id: number | string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/assets/categories/${id}`);
  },
};

// Assets
export const assetService = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<Asset[]>> => {
    return api.get<Asset[]>('/assets', { params });
  },

  getById: async (id: number | string): Promise<ApiResponse<Asset>> => {
    return api.get<Asset>(`/assets/${id}`);
  },

  create: async (data: CreateAssetRequest): Promise<ApiResponse<Asset>> => {
    return api.post<Asset>('/assets', data);
  },

  update: async (id: number | string, data: Partial<CreateAssetRequest>): Promise<ApiResponse<Asset>> => {
    return api.put<Asset>(`/assets/${id}`, data);
  },

  delete: async (id: number | string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/assets/${id}`);
  },

  // Real Estate
  getRealEstateDetails: async (assetId: number | string): Promise<ApiResponse<any>> => {
    return api.get<any>(`/assets/${assetId}/real-estate`);
  },

  updateRealEstateDetails: async (assetId: number | string, data: any): Promise<ApiResponse<any>> => {
    return api.put<any>(`/assets/${assetId}/real-estate`, data);
  },

  // Gold
  getGoldDetails: async (assetId: number | string): Promise<ApiResponse<any>> => {
    return api.get<any>(`/assets/${assetId}/gold`);
  },

  updateGoldDetails: async (assetId: number | string, data: any): Promise<ApiResponse<any>> => {
    return api.put<any>(`/assets/${assetId}/gold`, data);
  },

  // Valuations
  getValuations: async (assetId: number | string, params?: PaginationParams): Promise<ApiResponse<any[]>> => {
    return api.get<any[]>(`/assets/${assetId}/valuations`, { params });
  },

  addValuation: async (assetId: number | string, data: any): Promise<ApiResponse<any>> => {
    return api.post<any>(`/assets/${assetId}/valuations`, data);
  },
};

// Asset Transactions
export const assetTransactionService = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<any[]>> => {
    return api.get<any[]>('/transactions/assets', { params });
  },

  getById: async (id: number | string): Promise<ApiResponse<any>> => {
    return api.get<any>(`/transactions/assets/${id}`);
  },

  create: async (data: any): Promise<ApiResponse<any>> => {
    return api.post<any>('/transactions/assets', data);
  },

  update: async (id: number | string, data: any): Promise<ApiResponse<any>> => {
    return api.put<any>(`/transactions/assets/${id}`, data);
  },

  delete: async (id: number | string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/transactions/assets/${id}`);
  },
};


