import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as watchlistController from '../controllers/watchlist.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Watchlist endpoints
router.get('/', watchlistController.listWatchlist);
router.get('/:id', watchlistController.getWatchlistItemById);
router.post('/', watchlistController.addToWatchlist);
router.put('/:id', watchlistController.updateWatchlistItem);
router.delete('/:id', watchlistController.removeFromWatchlist);

export default router;

