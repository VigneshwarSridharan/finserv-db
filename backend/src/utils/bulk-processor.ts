import { ZodSchema, ZodError } from 'zod';

/**
 * Bulk operation result for a single item
 */
export interface BulkItemResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  index: number;
}

/**
 * Bulk operation summary
 */
export interface BulkOperationResult<T> {
  success: boolean;
  totalItems: number;
  successCount: number;
  failureCount: number;
  results: BulkItemResult<T>[];
  errors?: string[];
}

/**
 * Bulk validation options
 */
export interface BulkValidationOptions {
  stopOnFirstError?: boolean;
  maxItems?: number;
}

/**
 * Validate bulk items against schema
 */
export function validateBulkItems<T>(
  items: any[],
  schema: ZodSchema<T>,
  options: BulkValidationOptions = {}
): { valid: boolean; validatedItems: T[]; errors: string[] } {
  const { stopOnFirstError = false, maxItems = 1000 } = options;
  const errors: string[] = [];
  const validatedItems: T[] = [];

  if (items.length === 0) {
    errors.push('No items provided for bulk operation');
    return { valid: false, validatedItems, errors };
  }

  if (items.length > maxItems) {
    errors.push(`Too many items. Maximum allowed: ${maxItems}, provided: ${items.length}`);
    return { valid: false, validatedItems, errors };
  }

  for (let i = 0; i < items.length; i++) {
    try {
      const validated = schema.parse(items[i]);
      validatedItems.push(validated);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = `Item ${i + 1}: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
        errors.push(errorMessage);
        
        if (stopOnFirstError) {
          break;
        }
      } else {
        errors.push(`Item ${i + 1}: Unexpected validation error`);
        if (stopOnFirstError) {
          break;
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    validatedItems,
    errors
  };
}

/**
 * Process bulk operation with individual item tracking
 */
export async function processBulkOperation<TInput, TOutput>(
  items: TInput[],
  processor: (item: TInput, index: number) => Promise<TOutput>,
  options: { continueOnError?: boolean } = {}
): Promise<BulkOperationResult<TOutput>> {
  const results: BulkItemResult<TOutput>[] = [];
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < items.length; i++) {
    try {
      const data = await processor(items[i], i);
      results.push({
        success: true,
        data,
        index: i
      });
      successCount++;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.push({
        success: false,
        error: errorMessage,
        index: i
      });
      failureCount++;

      if (!options.continueOnError) {
        break;
      }
    }
  }

  return {
    success: failureCount === 0,
    totalItems: items.length,
    successCount,
    failureCount,
    results,
    errors: results.filter(r => !r.success).map(r => r.error!)
  };
}

/**
 * Parse CSV data into array of objects
 */
export function parseCSV(csvData: string, delimiter: string = ','): any[] {
  const lines = csvData.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('CSV must contain header row and at least one data row');
  }

  const headers = lines[0].split(delimiter).map(h => h.trim());
  const items: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map(v => v.trim());
    
    if (values.length !== headers.length) {
      throw new Error(`Line ${i + 1}: Column count mismatch. Expected ${headers.length}, got ${values.length}`);
    }

    const item: any = {};
    headers.forEach((header, index) => {
      item[header] = values[index];
    });
    items.push(item);
  }

  return items;
}

/**
 * Batch array into chunks
 */
export function batchItems<T>(items: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  
  return batches;
}

/**
 * Process items in batches
 */
export async function processBatches<TInput, TOutput>(
  items: TInput[],
  batchSize: number,
  batchProcessor: (batch: TInput[]) => Promise<TOutput[]>
): Promise<TOutput[]> {
  const batches = batchItems(items, batchSize);
  const results: TOutput[] = [];

  for (const batch of batches) {
    const batchResults = await batchProcessor(batch);
    results.push(...batchResults);
  }

  return results;
}

