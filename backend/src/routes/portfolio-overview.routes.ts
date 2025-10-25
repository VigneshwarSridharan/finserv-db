import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as portfolioOverviewController from '../controllers/portfolio-overview.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Portfolio overview endpoints
router.get('/', portfolioOverviewController.getPortfolioOverview);
router.get('/dashboard', portfolioOverviewController.getPortfolioDashboard);
router.get('/analytics/sector-allocation', portfolioOverviewController.getSectorAllocation);
router.get('/analytics/asset-type-distribution', portfolioOverviewController.getAssetTypeDistribution);

export default router;

