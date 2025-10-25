import { Router } from 'express';
import {
  getSecurityPrices,
  getLatestPrice,
  addSecurityPrice,
  bulkUploadPrices,
  updateSecurityPrice
} from '../controllers/security-prices.controller';
import { authenticate } from '../middleware/auth';
import { validate, createSecurityPriceSchema } from '../middleware/validator';

const router = Router();

/**
 * @route   GET /securities/:securityId/prices
 * @desc    Get price history for a security
 * @access  Public
 */
router.get('/:securityId/prices', getSecurityPrices);

/**
 * @route   GET /securities/:securityId/prices/latest
 * @desc    Get latest price for a security
 * @access  Public
 */
router.get('/:securityId/prices/latest', getLatestPrice);

/**
 * @route   POST /securities/:securityId/prices
 * @desc    Add single security price
 * @access  Private (requires authentication)
 */
router.post('/:securityId/prices', authenticate, validate(createSecurityPriceSchema), addSecurityPrice);

/**
 * @route   POST /securities/prices/bulk
 * @desc    Bulk upload security prices
 * @access  Private (requires authentication)
 */
router.post('/prices/bulk', authenticate, bulkUploadPrices);

/**
 * @route   PUT /securities/:securityId/prices/:priceId
 * @desc    Update security price
 * @access  Private (requires authentication)
 */
router.put('/:securityId/prices/:priceId', authenticate, updateSecurityPrice);

export default router;

