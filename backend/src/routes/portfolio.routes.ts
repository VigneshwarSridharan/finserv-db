import { Router } from 'express';
import {
  getAllPortfolios,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio
} from '../controllers/portfolio.controller';
import { authenticate } from '../middleware/auth';
import { validate, createPortfolioSchema, updatePortfolioSchema } from '../middleware/validator';

const router = Router();

// All portfolio routes require authentication
router.use(authenticate);

/**
 * @route   GET /portfolios
 * @desc    Get all portfolio summaries for authenticated user
 * @access  Private
 */
router.get('/', getAllPortfolios);

/**
 * @route   GET /portfolios/:id
 * @desc    Get portfolio summary by ID
 * @access  Private
 */
router.get('/:id', getPortfolioById);

/**
 * @route   POST /portfolios
 * @desc    Create new portfolio summary
 * @access  Private
 */
router.post('/', validate(createPortfolioSchema), createPortfolio);

/**
 * @route   PUT /portfolios/:id
 * @desc    Update portfolio summary
 * @access  Private
 */
router.put('/:id', validate(updatePortfolioSchema), updatePortfolio);

/**
 * @route   DELETE /portfolios/:id
 * @desc    Delete portfolio summary
 * @access  Private
 */
router.delete('/:id', deletePortfolio);

export default router;
