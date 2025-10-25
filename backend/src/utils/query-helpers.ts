import { SQL, sql, and, or, asc, desc, eq, gte, lte, like, ilike } from 'drizzle-orm';
import { PgColumn } from 'drizzle-orm/pg-core';

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Sorting parameters
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filter operator types
 */
export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in';

/**
 * Parse pagination parameters with defaults
 */
export function parsePagination(params: PaginationParams): { offset: number; limit: number; page: number } {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const offset = (page - 1) * limit;

  return { offset, limit, page };
}

/**
 * Calculate pagination metadata
 */
export function getPaginationMeta(
  page: number,
  limit: number,
  totalItems: number
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / limit);

  return {
    currentPage: page,
    pageSize: limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  };
}

/**
 * Build sort clause from parameters
 */
export function buildSortClause(
  sortParams: SortParams,
  allowedFields: Record<string, PgColumn>,
  defaultField?: PgColumn
): SQL | undefined {
  const { sortBy, sortOrder = 'asc' } = sortParams;

  if (sortBy && allowedFields[sortBy]) {
    return sortOrder === 'desc' ? desc(allowedFields[sortBy]) : asc(allowedFields[sortBy]);
  }

  if (defaultField) {
    return desc(defaultField);
  }

  return undefined;
}

/**
 * Build filter conditions from query parameters
 */
export function buildFilterCondition(
  field: PgColumn,
  value: any,
  operator: FilterOperator = 'eq'
): SQL | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  switch (operator) {
    case 'eq':
      return eq(field, value);
    case 'gte':
      return gte(field, value);
    case 'lte':
      return lte(field, value);
    case 'like':
      return like(field, `%${value}%`);
    case 'ilike':
      return ilike(field, `%${value}%`);
    default:
      return eq(field, value);
  }
}

/**
 * Combine multiple filter conditions with AND
 */
export function combineFilters(filters: (SQL | undefined)[]): SQL | undefined {
  const validFilters = filters.filter((f): f is SQL => f !== undefined);
  
  if (validFilters.length === 0) {
    return undefined;
  }
  
  if (validFilters.length === 1) {
    return validFilters[0];
  }
  
  return and(...validFilters);
}

/**
 * Build date range filter
 */
export function buildDateRangeFilter(
  dateField: PgColumn,
  startDate?: string,
  endDate?: string
): SQL | undefined {
  const filters: SQL[] = [];

  if (startDate) {
    filters.push(gte(dateField, startDate));
  }

  if (endDate) {
    filters.push(lte(dateField, endDate));
  }

  return filters.length > 0 ? and(...filters) : undefined;
}

/**
 * Paginated response type
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    pagination
  };
}

