import { Router } from 'express';
import {
  getSecurityHoldings,
  getHoldingById,
  getHoldingsSummary,
  updateHoldingCurrentPrice,
  deleteHolding
} from '../controllers/security-holdings.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /holdings/securities
 * @desc    Get all security holdings for authenticated user
 * @access  Private
 */
router.get('/', getSecurityHoldings);

/**
 * @route   GET /holdings/securities/summary
 * @desc    Get holdings summary aggregated by sector/type
 * @access  Private
 */
router.get('/summary', getHoldingsSummary);

/**
 * @route   GET /holdings/securities/:id
 * @desc    Get holding by ID with details
 * @access  Private
 */
router.get('/:id', getHoldingById);

/**
 * @route   PUT /holdings/securities/:id/current-price
 * @desc    Update current price for a holding
 * @access  Private
 */
router.put('/:id/current-price', updateHoldingCurrentPrice);

/**
 * @route   DELETE /holdings/securities/:id
 * @desc    Delete holding
 * @access  Private
 */
router.delete('/:id', deleteHolding);

export default router;

