import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as assetsController from '../controllers/assets.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Asset management
router.get('/', assetsController.listAssets);
router.get('/summary', assetsController.getAssetsSummary);
router.get('/:id', assetsController.getAssetById);
router.post('/', assetsController.createAsset);
router.put('/:id', assetsController.updateAsset);
router.delete('/:id', assetsController.deleteAsset);

export default router;

