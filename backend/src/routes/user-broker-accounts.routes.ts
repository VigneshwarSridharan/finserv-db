import { Router } from 'express';
import {
  getUserBrokerAccounts,
  getBrokerAccountById,
  createBrokerAccount,
  updateBrokerAccount,
  deleteBrokerAccount
} from '../controllers/user-broker-accounts.controller';
import { authenticate } from '../middleware/auth';
import { validate, createUserBrokerAccountSchema, updateUserBrokerAccountSchema } from '../middleware/validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /accounts/brokers
 * @desc    Get all broker accounts for authenticated user
 * @access  Private
 */
router.get('/', getUserBrokerAccounts);

/**
 * @route   GET /accounts/brokers/:id
 * @desc    Get broker account by ID
 * @access  Private
 */
router.get('/:id', getBrokerAccountById);

/**
 * @route   POST /accounts/brokers
 * @desc    Create broker account
 * @access  Private
 */
router.post('/', validate(createUserBrokerAccountSchema), createBrokerAccount);

/**
 * @route   PUT /accounts/brokers/:id
 * @desc    Update broker account
 * @access  Private
 */
router.put('/:id', validate(updateUserBrokerAccountSchema), updateBrokerAccount);

/**
 * @route   DELETE /accounts/brokers/:id
 * @desc    Delete broker account
 * @access  Private
 */
router.delete('/:id', deleteBrokerAccount);

export default router;

