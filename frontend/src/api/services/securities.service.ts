import { api } from '../client';
import type { ApiResponse, SearchParams, PaginationParams } from '../../types/api.types';
import type {
  Broker,
  CreateBrokerRequest,
  Security,
  CreateSecurityRequest,
  SecurityPrice,
  CreatePriceRequest,
  BrokerAccount,
  CreateBrokerAccountRequest,
  SecurityHolding,
  SecurityTransaction,
  CreateTransactionRequest,
} from '../../types/domain.types';

// Brokers
export const brokerService = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<Broker[]>> => {
    return api.get<Broker[]>('/brokers', { params });
  },

  getById: async (id: number | string): Promise<ApiResponse<Broker>> => {
    return api.get<Broker>(`/brokers/${id}`);
  },

  create: async (data: CreateBrokerRequest): Promise<ApiResponse<Broker>> => {
    return api.post<Broker>('/brokers', data);
  },

  update: async (id: number | string, data: Partial<CreateBrokerRequest>): Promise<ApiResponse<Broker>> => {
    return api.put<Broker>(`/brokers/${id}`, data);
  },

  delete: async (id: number | string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/brokers/${id}`);
  },
};

// Securities
export const securitiesService = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<Security[]>> => {
    return api.get<Security[]>('/securities', { params });
  },

  search: async (params: SearchParams): Promise<ApiResponse<Security[]>> => {
    return api.get<Security[]>('/securities/search', { params });
  },

  getById: async (id: number | string): Promise<ApiResponse<Security>> => {
    return api.get<Security>(`/securities/${id}`);
  },

  create: async (data: CreateSecurityRequest): Promise<ApiResponse<Security>> => {
    return api.post<Security>('/securities', data);
  },

  update: async (id: number | string, data: Partial<CreateSecurityRequest>): Promise<ApiResponse<Security>> => {
    return api.put<Security>(`/securities/${id}`, data);
  },

  delete: async (id: number | string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/securities/${id}`);
  },

  // Prices
  getPrices: async (securityId: number | string, params?: PaginationParams): Promise<ApiResponse<SecurityPrice[]>> => {
    return api.get<SecurityPrice[]>(`/securities/${securityId}/prices`, { params });
  },

  addPrice: async (securityId: number | string, data: Omit<CreatePriceRequest, 'security_id'>): Promise<ApiResponse<SecurityPrice>> => {
    return api.post<SecurityPrice>(`/securities/${securityId}/prices`, data);
  },

  bulkAddPrices: async (prices: CreatePriceRequest[]): Promise<ApiResponse<any>> => {
    return api.post<any>('/securities/prices/bulk', { prices });
  },
};

// Broker Accounts
export const brokerAccountService = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<BrokerAccount[]>> => {
    return api.get<BrokerAccount[]>('/accounts/brokers', { params });
  },

  getById: async (id: number | string): Promise<ApiResponse<BrokerAccount>> => {
    return api.get<BrokerAccount>(`/accounts/brokers/${id}`);
  },

  create: async (data: CreateBrokerAccountRequest): Promise<ApiResponse<BrokerAccount>> => {
    return api.post<BrokerAccount>('/accounts/brokers', data);
  },

  update: async (id: number | string, data: Partial<CreateBrokerAccountRequest>): Promise<ApiResponse<BrokerAccount>> => {
    return api.put<BrokerAccount>(`/accounts/brokers/${id}`, data);
  },

  delete: async (id: number | string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/accounts/brokers/${id}`);
  },
};

// Holdings
export const holdingsService = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<SecurityHolding[]>> => {
    return api.get<SecurityHolding[]>('/holdings/securities', { params });
  },

  getSummary: async (): Promise<ApiResponse<any>> => {
    return api.get<any>('/holdings/securities/summary');
  },

  getById: async (id: number | string): Promise<ApiResponse<SecurityHolding>> => {
    return api.get<SecurityHolding>(`/holdings/securities/${id}`);
  },
};

// Transactions
export const transactionsService = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<SecurityTransaction[]>> => {
    return api.get<SecurityTransaction[]>('/transactions/securities', { params });
  },

  getById: async (id: number | string): Promise<ApiResponse<SecurityTransaction>> => {
    return api.get<SecurityTransaction>(`/transactions/securities/${id}`);
  },

  create: async (data: CreateTransactionRequest): Promise<ApiResponse<SecurityTransaction>> => {
    return api.post<SecurityTransaction>('/transactions/securities', data);
  },

  bulkCreate: async (transactions: CreateTransactionRequest[]): Promise<ApiResponse<any>> => {
    return api.post<any>('/transactions/securities/bulk', { transactions });
  },

  update: async (id: number | string, data: Partial<CreateTransactionRequest>): Promise<ApiResponse<SecurityTransaction>> => {
    return api.put<SecurityTransaction>(`/transactions/securities/${id}`, data);
  },

  delete: async (id: number | string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/transactions/securities/${id}`);
  },
};


