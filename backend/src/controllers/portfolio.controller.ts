import { Response } from 'express';
import { eq, and } from 'drizzle-orm';
import { db } from '../config/database';
import { portfolioSummary } from '../db/schema';
import { AuthRequest, PortfolioCreateDTO, PortfolioUpdateDTO } from '../types';
import { ApiError } from '../middleware/errorHandler';

/**
 * @swagger
 * /portfolios:
 *   get:
 *     summary: Get all portfolio summaries for authenticated user
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of portfolio summaries
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function getAllPortfolios(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;

    const portfolios = await db
      .select()
      .from(portfolioSummary)
      .where(eq(portfolioSummary.user_id, userId));

    res.status(200).json({
      success: true,
      data: portfolios,
      count: portfolios.length
    });
  } catch (error) {
    throw error;
  }
}

/**
 * @swagger
 * /portfolios/{id}:
 *   get:
 *     summary: Get portfolio summary by ID
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Portfolio summary ID
 *     responses:
 *       200:
 *         description: Portfolio summary details
 *       404:
 *         description: Portfolio not found
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
export async function getPortfolioById(req: AuthRequest, res: Response) {
  try {
    const summaryId = parseInt(req.params.id);
    const userId = req.user!.userId;

    if (isNaN(summaryId)) {
      throw new ApiError(400, 'Invalid portfolio ID');
    }

    const portfolio = await db
      .select()
      .from(portfolioSummary)
      .where(eq(portfolioSummary.summary_id, summaryId))
      .limit(1);

    if (portfolio.length === 0) {
      throw new ApiError(404, 'Portfolio not found');
    }

    // Check ownership
    if (portfolio[0].user_id !== userId) {
      throw new ApiError(403, 'Access denied to this portfolio');
    }

    res.status(200).json({
      success: true,
      data: portfolio[0]
    });
  } catch (error) {
    throw error;
  }
}

/**
 * @swagger
 * /portfolios:
 *   post:
 *     summary: Create a new portfolio summary
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - asset_type
 *               - total_investment
 *               - current_value
 *             properties:
 *               asset_type:
 *                 type: string
 *                 enum: [securities, fixed_deposits, recurring_deposits, gold, real_estate, other_assets]
 *               total_investment:
 *                 type: number
 *               current_value:
 *                 type: number
 *               unrealized_pnl:
 *                 type: number
 *               realized_pnl:
 *                 type: number
 *               total_pnl:
 *                 type: number
 *               percentage_of_portfolio:
 *                 type: number
 *     responses:
 *       201:
 *         description: Portfolio created successfully
 *       400:
 *         description: Validation error or duplicate entry
 *       500:
 *         description: Server error
 */
export async function createPortfolio(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const portfolioData: PortfolioCreateDTO = req.body;

    // Check if portfolio already exists for this user and asset type
    const existing = await db
      .select()
      .from(portfolioSummary)
      .where(
        and(
          eq(portfolioSummary.user_id, userId),
          eq(portfolioSummary.asset_type, portfolioData.asset_type)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new ApiError(
        400,
        `Portfolio for asset type '${portfolioData.asset_type}' already exists. Use update endpoint instead.`
      );
    }

    // Create portfolio
    const newPortfolio = await db
      .insert(portfolioSummary)
      .values({
        user_id: userId,
        asset_type: portfolioData.asset_type,
        total_investment: portfolioData.total_investment.toString(),
        current_value: portfolioData.current_value.toString(),
        unrealized_pnl: (portfolioData.unrealized_pnl || 0).toString(),
        realized_pnl: (portfolioData.realized_pnl || 0).toString(),
        total_pnl: (portfolioData.total_pnl || 0).toString(),
        percentage_of_portfolio: (portfolioData.percentage_of_portfolio || 0).toString()
      })
      .returning();

    res.status(201).json({
      success: true,
      data: newPortfolio[0],
      message: 'Portfolio created successfully'
    });
  } catch (error) {
    throw error;
  }
}

/**
 * @swagger
 * /portfolios/{id}:
 *   put:
 *     summary: Update portfolio summary
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Portfolio summary ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               asset_type:
 *                 type: string
 *                 enum: [securities, fixed_deposits, recurring_deposits, gold, real_estate, other_assets]
 *               total_investment:
 *                 type: number
 *               current_value:
 *                 type: number
 *               unrealized_pnl:
 *                 type: number
 *               realized_pnl:
 *                 type: number
 *               total_pnl:
 *                 type: number
 *               percentage_of_portfolio:
 *                 type: number
 *     responses:
 *       200:
 *         description: Portfolio updated successfully
 *       404:
 *         description: Portfolio not found
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
export async function updatePortfolio(req: AuthRequest, res: Response) {
  try {
    const summaryId = parseInt(req.params.id);
    const userId = req.user!.userId;
    const updateData: PortfolioUpdateDTO = req.body;

    if (isNaN(summaryId)) {
      throw new ApiError(400, 'Invalid portfolio ID');
    }

    // Check if portfolio exists and belongs to user
    const existing = await db
      .select()
      .from(portfolioSummary)
      .where(eq(portfolioSummary.summary_id, summaryId))
      .limit(1);

    if (existing.length === 0) {
      throw new ApiError(404, 'Portfolio not found');
    }

    if (existing[0].user_id !== userId) {
      throw new ApiError(403, 'Access denied to this portfolio');
    }

    // Build update object
    const updateValues: any = {
      last_updated: new Date()
    };

    if (updateData.asset_type !== undefined) {
      updateValues.asset_type = updateData.asset_type;
    }
    if (updateData.total_investment !== undefined) {
      updateValues.total_investment = updateData.total_investment.toString();
    }
    if (updateData.current_value !== undefined) {
      updateValues.current_value = updateData.current_value.toString();
    }
    if (updateData.unrealized_pnl !== undefined) {
      updateValues.unrealized_pnl = updateData.unrealized_pnl.toString();
    }
    if (updateData.realized_pnl !== undefined) {
      updateValues.realized_pnl = updateData.realized_pnl.toString();
    }
    if (updateData.total_pnl !== undefined) {
      updateValues.total_pnl = updateData.total_pnl.toString();
    }
    if (updateData.percentage_of_portfolio !== undefined) {
      updateValues.percentage_of_portfolio = updateData.percentage_of_portfolio.toString();
    }

    // Update portfolio
    const updated = await db
      .update(portfolioSummary)
      .set(updateValues)
      .where(eq(portfolioSummary.summary_id, summaryId))
      .returning();

    res.status(200).json({
      success: true,
      data: updated[0],
      message: 'Portfolio updated successfully'
    });
  } catch (error) {
    throw error;
  }
}

/**
 * @swagger
 * /portfolios/{id}:
 *   delete:
 *     summary: Delete portfolio summary
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Portfolio summary ID
 *     responses:
 *       200:
 *         description: Portfolio deleted successfully
 *       404:
 *         description: Portfolio not found
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
export async function deletePortfolio(req: AuthRequest, res: Response) {
  try {
    const summaryId = parseInt(req.params.id);
    const userId = req.user!.userId;

    if (isNaN(summaryId)) {
      throw new ApiError(400, 'Invalid portfolio ID');
    }

    // Check if portfolio exists and belongs to user
    const existing = await db
      .select()
      .from(portfolioSummary)
      .where(eq(portfolioSummary.summary_id, summaryId))
      .limit(1);

    if (existing.length === 0) {
      throw new ApiError(404, 'Portfolio not found');
    }

    if (existing[0].user_id !== userId) {
      throw new ApiError(403, 'Access denied to this portfolio');
    }

    // Delete portfolio
    await db
      .delete(portfolioSummary)
      .where(eq(portfolioSummary.summary_id, summaryId));

    res.status(200).json({
      success: true,
      message: 'Portfolio deleted successfully'
    });
  } catch (error) {
    throw error;
  }
}
