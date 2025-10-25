import { Router } from 'express';
import {
  getAllBrokers,
  getBrokerById,
  createBroker,
  updateBroker,
  deleteBroker
} from '../controllers/brokers.controller';
import { authenticate } from '../middleware/auth';
import { validate, createBrokerSchema, updateBrokerSchema } from '../middleware/validator';

const router = Router();

/**
 * @route   GET /brokers
 * @desc    Get all brokers with filtering and pagination
 * @access  Public
 */
router.get('/', getAllBrokers);

/**
 * @route   GET /brokers/:id
 * @desc    Get broker by ID
 * @access  Public
 */
router.get('/:id', getBrokerById);

/**
 * @route   POST /brokers
 * @desc    Create new broker
 * @access  Private (requires authentication)
 */
router.post('/', authenticate, validate(createBrokerSchema), createBroker);

/**
 * @route   PUT /brokers/:id
 * @desc    Update broker
 * @access  Private (requires authentication)
 */
router.put('/:id', authenticate, validate(updateBrokerSchema), updateBroker);

/**
 * @route   DELETE /brokers/:id
 * @desc    Delete broker
 * @access  Private (requires authentication)
 */
router.delete('/:id', authenticate, deleteBroker);

export default router;

