import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as assetValuationsController from '../controllers/asset-valuations.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Asset valuation endpoints
router.get('/:assetId/valuations', assetValuationsController.getAssetValuations);
router.get('/:assetId/valuations/latest', assetValuationsController.getLatestValuation);
router.post('/:assetId/valuations', assetValuationsController.addValuation);
router.put('/:assetId/valuations/:valuationId', assetValuationsController.updateValuation);
router.delete('/:assetId/valuations/:valuationId', assetValuationsController.deleteValuation);

export default router;

