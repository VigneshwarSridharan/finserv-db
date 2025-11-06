import { Router } from 'express';
import {
  getAllBonds,
  getBondDetails,
  createBondDetails,
  updateBondDetails,
  deleteBondDetails,
  getBondsByIssuer,
  getBondsByMaturity
} from '../controllers/bonds.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /bonds
 * @desc    Get all bonds with security info joined
 * @access  Public
 */
router.get('/', getAllBonds);

/**
 * @route   GET /bonds/issuer/:issuer
 * @desc    Get bonds filtered by issuer
 * @access  Public
 */
router.get('/issuer/:issuer', getBondsByIssuer);

/**
 * @route   GET /bonds/maturity
 * @desc    Get bonds filtered by maturity date range (query params: from, to)
 * @access  Public
 */
router.get('/maturity', getBondsByMaturity);

/**
 * @route   GET /bonds/:securityId
 * @desc    Get bond details by security_id
 * @access  Public
 */
router.get('/:securityId', getBondDetails);

/**
 * @route   POST /bonds
 * @desc    Create bond details
 * @access  Private (requires authentication)
 */
router.post('/', authenticate, createBondDetails);

/**
 * @route   PUT /bonds/:securityId
 * @desc    Update bond details
 * @access  Private (requires authentication)
 */
router.put('/:securityId', authenticate, updateBondDetails);

/**
 * @route   DELETE /bonds/:securityId
 * @desc    Delete bond details
 * @access  Private (requires authentication)
 */
router.delete('/:securityId', authenticate, deleteBondDetails);

export default router;

