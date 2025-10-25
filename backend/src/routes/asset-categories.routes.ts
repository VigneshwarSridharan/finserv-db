import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as assetCategoriesController from '../controllers/asset-categories.controller';

const router = Router();

// Asset Categories
router.get('/', assetCategoriesController.listAssetCategories);
router.get('/:id', assetCategoriesController.getAssetCategoryById);
router.post('/', authenticate, assetCategoriesController.createAssetCategory);
router.put('/:id', authenticate, assetCategoriesController.updateAssetCategory);
router.delete('/:id', authenticate, assetCategoriesController.deleteAssetCategory);

// Subcategories
router.get('/:categoryId/subcategories', assetCategoriesController.listSubcategories);
router.post('/:categoryId/subcategories', authenticate, assetCategoriesController.createSubcategory);
router.put('/:categoryId/subcategories/:subcategoryId', authenticate, assetCategoriesController.updateSubcategory);
router.delete('/:categoryId/subcategories/:subcategoryId', authenticate, assetCategoriesController.deleteSubcategory);

export default router;

