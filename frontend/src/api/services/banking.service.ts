import { api } from '../client';
import type { ApiResponse, PaginationParams } from '../../types/api.types';
import type {
  Bank,
  CreateBankRequest,
  BankAccount,
  CreateBankAccountRequest,
  FixedDeposit,
  CreateFixedDepositRequest,
  RecurringDeposit,
  CreateRecurringDepositRequest,
} from '../../types/domain.types';

// Banks
export const bankService = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<Bank[]>> => {
    return api.get<Bank[]>('/banks', { params });
  },

  getById: async (id: number | string): Promise<ApiResponse<Bank>> => {
    return api.get<Bank>(`/banks/${id}`);
  },

  create: async (data: CreateBankRequest): Promise<ApiResponse<Bank>> => {
    return api.post<Bank>('/banks', data);
  },

  update: async (id: number | string, data: Partial<CreateBankRequest>): Promise<ApiResponse<Bank>> => {
    return api.put<Bank>(`/banks/${id}`, data);
  },

  delete: async (id: number | string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/banks/${id}`);
  },
};

// Bank Accounts
export const bankAccountService = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<BankAccount[]>> => {
    return api.get<BankAccount[]>('/accounts/banks', { params });
  },

  getById: async (id: number | string): Promise<ApiResponse<BankAccount>> => {
    return api.get<BankAccount>(`/accounts/banks/${id}`);
  },

  create: async (data: CreateBankAccountRequest): Promise<ApiResponse<BankAccount>> => {
    return api.post<BankAccount>('/accounts/banks', data);
  },

  update: async (id: number | string, data: Partial<CreateBankAccountRequest>): Promise<ApiResponse<BankAccount>> => {
    return api.put<BankAccount>(`/accounts/banks/${id}`, data);
  },

  delete: async (id: number | string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/accounts/banks/${id}`);
  },
};

// Fixed Deposits
export const fixedDepositService = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<FixedDeposit[]>> => {
    return api.get<FixedDeposit[]>('/deposits/fixed', { params });
  },

  getById: async (id: number | string): Promise<ApiResponse<FixedDeposit>> => {
    return api.get<FixedDeposit>(`/deposits/fixed/${id}`);
  },

  create: async (data: CreateFixedDepositRequest): Promise<ApiResponse<FixedDeposit>> => {
    return api.post<FixedDeposit>('/deposits/fixed', data);
  },

  update: async (id: number | string, data: Partial<CreateFixedDepositRequest>): Promise<ApiResponse<FixedDeposit>> => {
    return api.put<FixedDeposit>(`/deposits/fixed/${id}`, data);
  },

  delete: async (id: number | string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/deposits/fixed/${id}`);
  },

  getInterestPayments: async (fdId: number | string): Promise<ApiResponse<any[]>> => {
    return api.get<any[]>(`/deposits/fixed/${fdId}/interest-payments`);
  },

  close: async (fdId: number | string): Promise<ApiResponse<FixedDeposit>> => {
    return api.put<FixedDeposit>(`/deposits/fixed/${fdId}/close`);
  },
};

// Recurring Deposits
export const recurringDepositService = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<RecurringDeposit[]>> => {
    return api.get<RecurringDeposit[]>('/deposits/recurring', { params });
  },

  getById: async (id: number | string): Promise<ApiResponse<RecurringDeposit>> => {
    return api.get<RecurringDeposit>(`/deposits/recurring/${id}`);
  },

  create: async (data: CreateRecurringDepositRequest): Promise<ApiResponse<RecurringDeposit>> => {
    return api.post<RecurringDeposit>('/deposits/recurring', data);
  },

  update: async (id: number | string, data: Partial<CreateRecurringDepositRequest>): Promise<ApiResponse<RecurringDeposit>> => {
    return api.put<RecurringDeposit>(`/deposits/recurring/${id}`, data);
  },

  delete: async (id: number | string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/deposits/recurring/${id}`);
  },

  getInstallments: async (rdId: number | string): Promise<ApiResponse<any[]>> => {
    return api.get<any[]>(`/deposits/recurring/${rdId}/installments`);
  },

  addInstallmentPayment: async (rdId: number | string, data: any): Promise<ApiResponse<any>> => {
    return api.post<any>(`/deposits/recurring/${rdId}/installments`, data);
  },

  close: async (rdId: number | string): Promise<ApiResponse<RecurringDeposit>> => {
    return api.put<RecurringDeposit>(`/deposits/recurring/${rdId}/close`);
  },
};

// Bank Transactions
export const bankTransactionService = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<any[]>> => {
    return api.get<any[]>('/transactions/bank', { params });
  },

  getById: async (id: number | string): Promise<ApiResponse<any>> => {
    return api.get<any>(`/transactions/bank/${id}`);
  },

  create: async (data: any): Promise<ApiResponse<any>> => {
    return api.post<any>('/transactions/bank', data);
  },

  update: async (id: number | string, data: any): Promise<ApiResponse<any>> => {
    return api.put<any>(`/transactions/bank/${id}`, data);
  },

  delete: async (id: number | string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/transactions/bank/${id}`);
  },
};


