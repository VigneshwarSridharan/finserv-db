import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as portfolioGoalsController from '../controllers/portfolio-goals.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Portfolio goals endpoints
router.get('/', portfolioGoalsController.listPortfolioGoals);
router.get('/summary', portfolioGoalsController.getGoalsSummary);
router.get('/:id', portfolioGoalsController.getPortfolioGoalById);
router.post('/', portfolioGoalsController.createPortfolioGoal);
router.put('/:id', portfolioGoalsController.updatePortfolioGoal);
router.delete('/:id', portfolioGoalsController.deletePortfolioGoal);
router.post('/:id/achieve', portfolioGoalsController.achieveGoal);

export default router;

