import { Router } from 'express';
import {
  getSecurityTransactions,
  getTransactionById,
  createSecurityTransaction,
  bulkImportTransactions,
  updateSecurityTransaction,
  deleteSecurityTransaction
} from '../controllers/security-transactions.controller';
import { authenticate } from '../middleware/auth';
import { validate, createSecurityTransactionSchema, updateSecurityTransactionSchema } from '../middleware/validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /transactions/securities
 * @desc    Get all security transactions with filtering and pagination
 * @access  Private
 */
router.get('/', getSecurityTransactions);

/**
 * @route   GET /transactions/securities/:id
 * @desc    Get transaction by ID with view data
 * @access  Private
 */
router.get('/:id', getTransactionById);

/**
 * @route   POST /transactions/securities
 * @desc    Create single security transaction (auto-updates holdings)
 * @access  Private
 */
router.post('/', validate(createSecurityTransactionSchema), createSecurityTransaction);

/**
 * @route   POST /transactions/securities/bulk
 * @desc    Bulk import security transactions
 * @access  Private
 */
router.post('/bulk', bulkImportTransactions);

/**
 * @route   PUT /transactions/securities/:id
 * @desc    Update security transaction
 * @access  Private
 */
router.put('/:id', validate(updateSecurityTransactionSchema), updateSecurityTransaction);

/**
 * @route   DELETE /transactions/securities/:id
 * @desc    Delete security transaction (with holding recalculation note)
 * @access  Private
 */
router.delete('/:id', deleteSecurityTransaction);

export default router;

