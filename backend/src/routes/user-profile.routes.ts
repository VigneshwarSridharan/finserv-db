import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as userProfileController from '../controllers/user-profile.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// User profile endpoints
router.get('/', userProfileController.getUserProfile);
router.put('/', userProfileController.updateUserProfile);

// User preferences
router.get('/preferences', userProfileController.getUserPreferences);
router.put('/preferences', userProfileController.updateUserPreferences);

export default router;

