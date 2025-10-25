import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as assetTransactionsController from '../controllers/asset-transactions.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Asset transaction endpoints
router.get('/', assetTransactionsController.listAssetTransactions);
router.get('/:id', assetTransactionsController.getAssetTransactionById);
router.post('/', assetTransactionsController.createAssetTransaction);
router.post('/bulk', assetTransactionsController.bulkImportAssetTransactions);
router.put('/:id', assetTransactionsController.updateAssetTransaction);
router.delete('/:id', assetTransactionsController.deleteAssetTransaction);

// Asset-specific transaction summary
router.get('/asset/:assetId/summary', assetTransactionsController.getAssetTransactionSummary);

export default router;

