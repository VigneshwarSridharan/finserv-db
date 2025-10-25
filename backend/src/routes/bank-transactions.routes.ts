import { Router } from 'express';
import {
  getBankTransactions,
  getBankTransactionById,
  createBankTransaction,
  bulkImportBankTransactions
} from '../controllers/bank-transactions.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /transactions/bank
 * @desc    Get all bank transactions for authenticated user
 * @access  Private
 */
router.get('/', getBankTransactions);

/**
 * @route   GET /transactions/bank/:id
 * @desc    Get transaction by ID
 * @access  Private
 */
router.get('/:id', getBankTransactionById);

/**
 * @route   POST /transactions/bank
 * @desc    Create bank transaction
 * @access  Private
 */
router.post('/', createBankTransaction);

/**
 * @route   POST /transactions/bank/bulk
 * @desc    Bulk import bank transactions
 * @access  Private
 */
router.post('/bulk', bulkImportBankTransactions);

export default router;

