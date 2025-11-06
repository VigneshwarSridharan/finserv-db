import { Router } from 'express';
import {
  fetchLTP,
  fetchBondLTP,
  updateSecurityLTP,
  batchUpdateLTP
} from '../controllers/market-data.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /market-data/ltp/:symbol
 * @desc    Fetch LTP for a symbol (without saving to database)
 * @query   type - Optional: 'equity' (default) or 'bond'
 * @access  Private (requires authentication)
 */
router.get('/ltp/:symbol', authenticate, fetchLTP);

/**
 * @route   GET /market-data/bond/:symbol
 * @desc    Fetch LTP for a bond symbol (without saving to database)
 * @access  Private (requires authentication)
 */
router.get('/bond/:symbol', authenticate, fetchBondLTP);

/**
 * @route   POST /market-data/update/:securityId
 * @desc    Fetch and update LTP for a security in the database
 * @access  Private (requires authentication)
 */
router.post('/update/:securityId', authenticate, updateSecurityLTP);

/**
 * @route   POST /market-data/batch-update
 * @desc    Batch update LTP for multiple securities
 * @access  Private (requires authentication)
 */
router.post('/batch-update', authenticate, batchUpdateLTP);

export default router;


