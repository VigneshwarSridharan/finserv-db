import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as portfolioAlertsController from '../controllers/portfolio-alerts.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Portfolio alerts endpoints
router.get('/', portfolioAlertsController.listPortfolioAlerts);
router.get('/triggered', portfolioAlertsController.getTriggeredAlerts);
router.get('/:id', portfolioAlertsController.getPortfolioAlertById);
router.post('/', portfolioAlertsController.createPortfolioAlert);
router.put('/:id', portfolioAlertsController.updatePortfolioAlert);
router.delete('/:id', portfolioAlertsController.deletePortfolioAlert);
router.post('/:id/acknowledge', portfolioAlertsController.acknowledgeAlert);

export default router;

