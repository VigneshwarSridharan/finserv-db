import { Response } from 'express';
import { PaginationMeta } from './query-helpers';

/**
 * Standard API response structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: string[];
}

/**
 * Paginated API response structure
 */
export interface PaginatedApiResponse<T = any> extends ApiResponse<T> {
  pagination?: PaginationMeta;
}

/**
 * Send success response
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  } as ApiResponse<T>);
}

/**
 * Send created response (201)
 */
export function sendCreated<T>(
  res: Response,
  data: T,
  message: string = 'Resource created successfully'
): Response {
  return sendSuccess(res, data, message, 201);
}

/**
 * Send paginated response
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
  message?: string
): Response {
  return res.status(200).json({
    success: true,
    data,
    pagination,
    message
  } as PaginatedApiResponse<T[]>);
}

/**
 * Send no content response (204)
 */
export function sendNoContent(res: Response): Response {
  return res.status(204).send();
}

/**
 * Send error response
 */
export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  errors?: string[]
): Response {
  return res.status(statusCode).json({
    success: false,
    error: message,
    errors
  } as ApiResponse);
}

/**
 * Send bad request response (400)
 */
export function sendBadRequest(
  res: Response,
  message: string = 'Bad request',
  errors?: string[]
): Response {
  return sendError(res, message, 400, errors);
}

/**
 * Send unauthorized response (401)
 */
export function sendUnauthorized(
  res: Response,
  message: string = 'Unauthorized'
): Response {
  return sendError(res, message, 401);
}

/**
 * Send forbidden response (403)
 */
export function sendForbidden(
  res: Response,
  message: string = 'Forbidden'
): Response {
  return sendError(res, message, 403);
}

/**
 * Send not found response (404)
 */
export function sendNotFound(
  res: Response,
  message: string = 'Resource not found'
): Response {
  return sendError(res, message, 404);
}

/**
 * Send conflict response (409)
 */
export function sendConflict(
  res: Response,
  message: string = 'Resource already exists'
): Response {
  return sendError(res, message, 409);
}

/**
 * Send validation error response (422)
 */
export function sendValidationError(
  res: Response,
  errors: string[]
): Response {
  return res.status(422).json({
    success: false,
    error: 'Validation failed',
    errors
  } as ApiResponse);
}

/**
 * Send internal server error response (500)
 */
export function sendServerError(
  res: Response,
  message: string = 'Internal server error'
): Response {
  return sendError(res, message, 500);
}

/**
 * Format list response with count
 */
export function sendList<T>(
  res: Response,
  data: T[],
  message?: string
): Response {
  return res.status(200).json({
    success: true,
    data,
    count: data.length,
    message
  });
}

