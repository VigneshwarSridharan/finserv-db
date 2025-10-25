import { Router } from 'express';
import {
  getUserBankAccounts,
  getBankAccountById,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount
} from '../controllers/bank-accounts.controller';
import { authenticate } from '../middleware/auth';
import { validate, createUserBankAccountSchema, updateUserBankAccountSchema } from '../middleware/validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /accounts/banks
 * @desc    Get all bank accounts for authenticated user
 * @access  Private
 */
router.get('/', getUserBankAccounts);

/**
 * @route   GET /accounts/banks/:id
 * @desc    Get bank account by ID
 * @access  Private
 */
router.get('/:id', getBankAccountById);

/**
 * @route   POST /accounts/banks
 * @desc    Create bank account
 * @access  Private
 */
router.post('/', validate(createUserBankAccountSchema), createBankAccount);

/**
 * @route   PUT /accounts/banks/:id
 * @desc    Update bank account
 * @access  Private
 */
router.put('/:id', validate(updateUserBankAccountSchema), updateBankAccount);

/**
 * @route   DELETE /accounts/banks/:id
 * @desc    Delete bank account
 * @access  Private
 */
router.delete('/:id', deleteBankAccount);

export default router;

