import { api } from '../client';
import type { ApiResponse, PaginationParams } from '../../types/api.types';
import type {
  BondRepayment,
  CreateBondRepaymentRequest,
  UpdateBondRepaymentRequest,
  GenerateRepaymentScheduleRequest,
} from '../../types/domain.types';

export const bondRepaymentsService = {
  getAll: async (params?: PaginationParams & {
    holding_id?: number;
    security_id?: number;
    repayment_type?: 'coupon' | 'principal';
    payment_status?: 'scheduled' | 'paid' | 'overdue' | 'missed';
    from_date?: string;
    to_date?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<BondRepayment[]>> => {
    return api.get<BondRepayment[]>('/bond-repayments', { params });
  },

  getById: async (repaymentId: number | string): Promise<ApiResponse<BondRepayment>> => {
    return api.get<BondRepayment>(`/bond-repayments/${repaymentId}`);
  },

  getByHolding: async (holdingId: number | string): Promise<ApiResponse<BondRepayment[]>> => {
    return api.get<BondRepayment[]>(`/bond-repayments/holding/${holdingId}`);
  },

  getBySecurity: async (securityId: number | string): Promise<ApiResponse<BondRepayment[]>> => {
    return api.get<BondRepayment[]>(`/bond-repayments/security/${securityId}`);
  },

  create: async (data: CreateBondRepaymentRequest): Promise<ApiResponse<BondRepayment>> => {
    return api.post<BondRepayment>('/bond-repayments', data);
  },

  update: async (repaymentId: number | string, data: UpdateBondRepaymentRequest): Promise<ApiResponse<BondRepayment>> => {
    return api.put<BondRepayment>(`/bond-repayments/${repaymentId}`, data);
  },

  delete: async (repaymentId: number | string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/bond-repayments/${repaymentId}`);
  },

  generateSchedule: async (data: GenerateRepaymentScheduleRequest): Promise<ApiResponse<{ created_count: number }>> => {
    return api.post<{ created_count: number }>('/bond-repayments/generate-schedule', data);
  },
};

