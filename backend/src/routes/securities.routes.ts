import { Router } from 'express';
import {
  getAllSecurities,
  searchSecurities,
  getSecurityById,
  createSecurity,
  updateSecurity,
  deleteSecurity
} from '../controllers/securities.controller';
import { authenticate } from '../middleware/auth';
import { validate, createSecuritySchema, updateSecuritySchema } from '../middleware/validator';

const router = Router();

/**
 * @route   GET /securities
 * @desc    Get all securities with filtering and pagination
 * @access  Public
 */
router.get('/', getAllSecurities);

/**
 * @route   GET /securities/search
 * @desc    Search securities by symbol or name
 * @access  Public
 */
router.get('/search', searchSecurities);

/**
 * @route   GET /securities/:id
 * @desc    Get security by ID with latest price
 * @access  Public
 */
router.get('/:id', getSecurityById);

/**
 * @route   POST /securities
 * @desc    Create new security
 * @access  Private (requires authentication)
 */
router.post('/', authenticate, validate(createSecuritySchema), createSecurity);

/**
 * @route   PUT /securities/:id
 * @desc    Update security
 * @access  Private (requires authentication)
 */
router.put('/:id', authenticate, validate(updateSecuritySchema), updateSecurity);

/**
 * @route   DELETE /securities/:id
 * @desc    Delete security
 * @access  Private (requires authentication)
 */
router.delete('/:id', authenticate, deleteSecurity);

export default router;

