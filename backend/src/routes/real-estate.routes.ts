import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as realEstateController from '../controllers/real-estate.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Real estate details for assets
router.get('/:assetId/real-estate', realEstateController.getRealEstateDetails);
router.post('/:assetId/real-estate', realEstateController.addRealEstateDetails);
router.put('/:assetId/real-estate', realEstateController.updateRealEstateDetails);
router.delete('/:assetId/real-estate', realEstateController.deleteRealEstateDetails);

export default router;

