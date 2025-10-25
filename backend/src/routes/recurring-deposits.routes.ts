import { Router } from 'express';
import {
  getRecurringDeposits,
  getRecurringDepositById,
  createRecurringDeposit,
  updateRecurringDeposit,
  closeRecurringDeposit,
  getInstallments,
  payInstallment
} from '../controllers/recurring-deposits.controller';
import { authenticate } from '../middleware/auth';
import { validate, createRecurringDepositSchema, updateRecurringDepositSchema } from '../middleware/validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /deposits/recurring
 * @desc    Get all recurring deposits for authenticated user (with view data)
 * @access  Private
 */
router.get('/', getRecurringDeposits);

/**
 * @route   GET /deposits/recurring/:id
 * @desc    Get RD by ID with installments
 * @access  Private
 */
router.get('/:id', getRecurringDepositById);

/**
 * @route   POST /deposits/recurring
 * @desc    Create recurring deposit
 * @access  Private
 */
router.post('/', validate(createRecurringDepositSchema), createRecurringDeposit);

/**
 * @route   PUT /deposits/recurring/:id
 * @desc    Update recurring deposit
 * @access  Private
 */
router.put('/:id', validate(updateRecurringDepositSchema), updateRecurringDeposit);

/**
 * @route   DELETE /deposits/recurring/:id
 * @desc    Close/Delete recurring deposit
 * @access  Private
 */
router.delete('/:id', closeRecurringDeposit);

/**
 * @route   GET /deposits/recurring/:id/installments
 * @desc    Get installment history for an RD
 * @access  Private
 */
router.get('/:id/installments', getInstallments);

/**
 * @route   POST /deposits/recurring/:id/installments/:installmentId/pay
 * @desc    Record installment payment
 * @access  Private
 */
router.post('/:id/installments/:installmentId/pay', payInstallment);

export default router;

