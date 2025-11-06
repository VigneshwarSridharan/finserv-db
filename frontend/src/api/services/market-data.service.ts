import { api } from '../client';
import type { ApiResponse } from '../../types/api.types';

export interface MarketData {
  ltp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change?: number;
  changePercent?: number;
}

export interface BatchUpdateResult {
  success: number;
  failed: number;
  errors: string[];
}

export const marketDataService = {
  /**
   * Fetch LTP for a symbol without saving to database
   * @param symbol - Security symbol
   * @param type - Optional: 'equity' (default) or 'bond'
   */
  fetchLTP: async (symbol: string, type: 'equity' | 'bond' = 'equity'): Promise<ApiResponse<MarketData>> => {
    const url = `/market-data/ltp/${encodeURIComponent(symbol)}`;
    if (type === 'bond') {
      return api.get<MarketData>(`${url}?type=bond`);
    }
    return api.get<MarketData>(url);
  },

  /**
   * Fetch LTP for a bond symbol without saving to database
   */
  fetchBondLTP: async (symbol: string): Promise<ApiResponse<MarketData>> => {
    return api.get<MarketData>(`/market-data/bond/${encodeURIComponent(symbol)}`);
  },

  /**
   * Update LTP for a security in the database
   */
  updateSecurityLTP: async (securityId: number | string): Promise<ApiResponse<{ securityId: number }>> => {
    return api.post<{ securityId: number }>(`/market-data/update/${securityId}`);
  },

  /**
   * Batch update LTP for multiple securities
   */
  batchUpdateLTP: async (securityIds: number[]): Promise<ApiResponse<BatchUpdateResult>> => {
    return api.post<BatchUpdateResult>('/market-data/batch-update', { securityIds });
  },
};


