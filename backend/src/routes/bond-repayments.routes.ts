import { Router } from 'express';
import {
  getAllBondRepayments,
  getBondRepaymentById,
  getRepaymentsByHolding,
  getRepaymentsBySecurity,
  createBondRepayment,
  generateRepaymentSchedule,
  updateBondRepayment,
  deleteBondRepayment
} from '../controllers/bond-repayments.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /bond-repayments
 * @desc    Get all bond repayments with filters
 * @access  Private (requires authentication)
 */
router.get('/', authenticate, getAllBondRepayments);

/**
 * @route   GET /bond-repayments/holding/:holdingId
 * @desc    Get all repayments for a specific holding
 * @access  Private (requires authentication)
 */
router.get('/holding/:holdingId', authenticate, getRepaymentsByHolding);

/**
 * @route   GET /bond-repayments/security/:securityId
 * @desc    Get all repayments for a specific security
 * @access  Private (requires authentication)
 */
router.get('/security/:securityId', authenticate, getRepaymentsBySecurity);

/**
 * @route   GET /bond-repayments/:repaymentId
 * @desc    Get bond repayment by ID
 * @access  Private (requires authentication)
 */
router.get('/:repaymentId', authenticate, getBondRepaymentById);

/**
 * @route   POST /bond-repayments
 * @desc    Create bond repayment record
 * @access  Private (requires authentication)
 */
router.post('/', authenticate, createBondRepayment);

/**
 * @route   POST /bond-repayments/generate-schedule
 * @desc    Generate repayment schedule from bond details
 * @access  Private (requires authentication)
 */
router.post('/generate-schedule', authenticate, generateRepaymentSchedule);

/**
 * @route   PUT /bond-repayments/:repaymentId
 * @desc    Update bond repayment
 * @access  Private (requires authentication)
 */
router.put('/:repaymentId', authenticate, updateBondRepayment);

/**
 * @route   DELETE /bond-repayments/:repaymentId
 * @desc    Delete bond repayment
 * @access  Private (requires authentication)
 */
router.delete('/:repaymentId', authenticate, deleteBondRepayment);

export default router;

