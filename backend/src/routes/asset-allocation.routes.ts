import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as assetAllocationController from '../controllers/asset-allocation.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Asset allocation endpoints
router.get('/', assetAllocationController.getAssetAllocation);
router.get('/rebalance-suggestions', assetAllocationController.getRebalanceSuggestions);
router.post('/', assetAllocationController.createAllocationTarget);
router.put('/:id', assetAllocationController.updateAllocationTarget);
router.delete('/:id', assetAllocationController.deleteAllocationTarget);

export default router;

