import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as portfolioReportsController from '../controllers/portfolio-reports.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Portfolio reports endpoints
router.get('/', portfolioReportsController.listReports);
router.get('/:id', portfolioReportsController.getReportById);
router.post('/generate', portfolioReportsController.generateReport);
router.delete('/:id', portfolioReportsController.deleteReport);

export default router;

