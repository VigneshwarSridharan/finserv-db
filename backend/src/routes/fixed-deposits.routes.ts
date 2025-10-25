import { Router } from 'express';
import {
  getFixedDeposits,
  getFixedDepositById,
  createFixedDeposit,
  updateFixedDeposit,
  closeFixedDeposit,
  getInterestPayments
} from '../controllers/fixed-deposits.controller';
import { authenticate } from '../middleware/auth';
import { validate, createFixedDepositSchema, updateFixedDepositSchema } from '../middleware/validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /deposits/fixed
 * @desc    Get all fixed deposits for authenticated user (with view data)
 * @access  Private
 */
router.get('/', getFixedDeposits);

/**
 * @route   GET /deposits/fixed/:id
 * @desc    Get FD by ID with interest payments
 * @access  Private
 */
router.get('/:id', getFixedDepositById);

/**
 * @route   POST /deposits/fixed
 * @desc    Create fixed deposit
 * @access  Private
 */
router.post('/', validate(createFixedDepositSchema), createFixedDeposit);

/**
 * @route   PUT /deposits/fixed/:id
 * @desc    Update fixed deposit
 * @access  Private
 */
router.put('/:id', validate(updateFixedDepositSchema), updateFixedDeposit);

/**
 * @route   DELETE /deposits/fixed/:id
 * @desc    Close/Delete fixed deposit (premature withdrawal)
 * @access  Private
 */
router.delete('/:id', closeFixedDeposit);

/**
 * @route   GET /deposits/fixed/:id/interest-payments
 * @desc    Get interest payment history for an FD
 * @access  Private
 */
router.get('/:id/interest-payments', getInterestPayments);

export default router;

