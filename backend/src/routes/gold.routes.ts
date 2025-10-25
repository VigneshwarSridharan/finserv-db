import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as goldController from '../controllers/gold.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Gold details for assets
router.get('/:assetId/gold', goldController.getGoldDetails);
router.post('/:assetId/gold', goldController.addGoldDetails);
router.put('/:assetId/gold', goldController.updateGoldDetails);
router.delete('/:assetId/gold', goldController.deleteGoldDetails);

export default router;

