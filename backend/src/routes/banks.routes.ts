import { Router } from 'express';
import {
  getAllBanks,
  getBankById,
  createBank,
  updateBank,
  deleteBank
} from '../controllers/banks.controller';
import { authenticate } from '../middleware/auth';
import { validate, createBankSchema, updateBankSchema } from '../middleware/validator';

const router = Router();

/**
 * @route   GET /banks
 * @desc    Get all banks with filtering and pagination
 * @access  Public
 */
router.get('/', getAllBanks);

/**
 * @route   GET /banks/:id
 * @desc    Get bank by ID
 * @access  Public
 */
router.get('/:id', getBankById);

/**
 * @route   POST /banks
 * @desc    Create new bank
 * @access  Private (requires authentication)
 */
router.post('/', authenticate, validate(createBankSchema), createBank);

/**
 * @route   PUT /banks/:id
 * @desc    Update bank
 * @access  Private (requires authentication)
 */
router.put('/:id', authenticate, validate(updateBankSchema), updateBank);

/**
 * @route   DELETE /banks/:id
 * @desc    Delete bank
 * @access  Private (requires authentication)
 */
router.delete('/:id', authenticate, deleteBank);

export default router;

