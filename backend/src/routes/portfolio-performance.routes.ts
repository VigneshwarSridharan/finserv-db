import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as portfolioPerformanceController from '../controllers/portfolio-performance.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Portfolio performance endpoints
router.get('/', portfolioPerformanceController.getPortfolioPerformance);
router.get('/current', portfolioPerformanceController.getCurrentPerformance);
router.get('/stats', portfolioPerformanceController.getPerformanceStats);
router.post('/', portfolioPerformanceController.recordPerformance);

export default router;

