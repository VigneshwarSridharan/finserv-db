import { Request, Response, NextFunction } from 'express';

/**
 * Type definition for async route handlers
 */
type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

/**
 * Wrapper for async route handlers to catch promise rejections
 * and forward them to Express error middleware
 * 
 * @param fn - Async route handler function
 * @returns Wrapped handler that catches errors
 * 
 * @example
 * // Without asyncHandler (old way)
 * export async function getUsers(req, res) {
 *   try {
 *     const users = await db.select().from(users);
 *     res.json(users);
 *   } catch (error) {
 *     throw error;
 *   }
 * }
 * 
 * // With asyncHandler (new way)
 * export const getUsers = asyncHandler(async (req, res) => {
 *   const users = await db.select().from(users);
 *   res.json(users);
 * });
 */
export function asyncHandler(fn: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

