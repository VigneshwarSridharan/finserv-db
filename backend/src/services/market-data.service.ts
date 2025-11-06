import axios, { AxiosError } from 'axios';
import { eq, and } from 'drizzle-orm';
import { db } from '../config/database';
import { securityPrices, securities } from '../db/schemas/brokers-securities.schema';
import logger from '../utils/logger';

export interface MarketData {
  ltp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change?: number;
  changePercent?: number;
}

export class MarketDataService {
  private readonly nseBaseUrl = 'https://www.nseindia.com';
  private readonly requestDelay = 500; // 500ms delay between requests to avoid rate limiting

  /**
   * Fetch LTP and OHLC data from NSE for a given symbol
   */
  async fetchNSELTP(symbol: string): Promise<MarketData> {
    try {
      const url = `${this.nseBaseUrl}/api/quote-equity?symbol=${encodeURIComponent(symbol.toUpperCase())}`;
      
      logger.info('Fetching NSE data', { symbol, url });

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': `${this.nseBaseUrl}/`,
          'Origin': this.nseBaseUrl,
        },
        timeout: 10000,
      });

      const data = response.data;

      // NSE API response structure may vary, handle different formats
      const priceInfo = data.priceInfo || {};
      
      // Extract prices from various possible locations in the response
      const lastPrice = priceInfo.lastPrice || priceInfo.lastTradedPrice || priceInfo.intraDay?.lastPrice || 0;
      const open = priceInfo.open || priceInfo.intraDay?.open || 0;
      const high = priceInfo.intraDayHighLow?.max || priceInfo.high || priceInfo.intraDay?.high || 0;
      const low = priceInfo.intraDayHighLow?.min || priceInfo.low || priceInfo.intraDay?.low || 0;
      const previousClose = priceInfo.previousClose || priceInfo.close || 0;
      const volume = priceInfo.totalTradedVolume || priceInfo.volume || 0;
      
      // Calculate change and change percentage
      const change = lastPrice - previousClose;
      const changePercent = previousClose > 0 ? ((change / previousClose) * 100) : 0;

      if (!lastPrice || lastPrice === 0) {
        throw new Error(`Invalid price data received for symbol ${symbol}`);
      }

      logger.info('Successfully fetched NSE data', { symbol, lastPrice });

      return {
        ltp: lastPrice,
        open: open || lastPrice,
        high: high || lastPrice,
        low: low || lastPrice,
        close: previousClose || lastPrice,
        volume: volume || 0,
        change: change || 0,
        changePercent: changePercent || 0,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response?.status === 404) {
        throw new Error(`Symbol ${symbol} not found on NSE`);
      }
      
      if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
        throw new Error(`Request timeout while fetching data for ${symbol}`);
      }

      logger.error('Error fetching NSE data', {
        symbol,
        error: axiosError.message,
        status: axiosError.response?.status,
      });

      throw new Error(`Failed to fetch market data for ${symbol}: ${axiosError.message}`);
    }
  }

  /**
   * Fetch LTP and OHLC data from NSE for a bond/debenture symbol
   */
  async fetchNSEBond(symbol: string): Promise<MarketData> {
    try {
      const url = `${this.nseBaseUrl}/api/quote-debenture?symbol=${encodeURIComponent(symbol.toUpperCase())}`;
      
      logger.info('Fetching NSE bond data', { symbol, url });

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': `${this.nseBaseUrl}/`,
          'Origin': this.nseBaseUrl,
        },
        timeout: 10000,
      });

      const data = response.data;

      // NSE bond API response structure - handle similar to equity but may have variations
      const priceInfo = data.priceInfo || {};
      
      // Extract prices from various possible locations in the response
      const lastPrice = priceInfo.lastPrice || priceInfo.lastTradedPrice || priceInfo.intraDay?.lastPrice || 0;
      const open = priceInfo.open || priceInfo.intraDay?.open || 0;
      const high = priceInfo.intraDayHighLow?.max || priceInfo.high || priceInfo.intraDay?.high || 0;
      const low = priceInfo.intraDayHighLow?.min || priceInfo.low || priceInfo.intraDay?.low || 0;
      const previousClose = priceInfo.previousClose || priceInfo.close || 0;
      const volume = priceInfo.totalTradedVolume || priceInfo.volume || 0;
      
      // Calculate change and change percentage
      const change = lastPrice - previousClose;
      const changePercent = previousClose > 0 ? ((change / previousClose) * 100) : 0;

      if (!lastPrice || lastPrice === 0) {
        throw new Error(`Invalid price data received for bond symbol ${symbol}`);
      }

      logger.info('Successfully fetched NSE bond data', { symbol, lastPrice });

      return {
        ltp: lastPrice,
        open: open || lastPrice,
        high: high || lastPrice,
        low: low || lastPrice,
        close: previousClose || lastPrice,
        volume: volume || 0,
        change: change || 0,
        changePercent: changePercent || 0,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response?.status === 404) {
        throw new Error(`Bond symbol ${symbol} not found on NSE`);
      }
      
      if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
        throw new Error(`Request timeout while fetching bond data for ${symbol}`);
      }

      logger.error('Error fetching NSE bond data', {
        symbol,
        error: axiosError.message,
        status: axiosError.response?.status,
      });

      throw new Error(`Failed to fetch bond market data for ${symbol}: ${axiosError.message}`);
    }
  }

  /**
   * Fetch LTP from BSE (fallback option)
   * Note: BSE API endpoints may differ and may require different authentication
   */
  async fetchBSELTP(symbol: string): Promise<MarketData> {
    try {
      // BSE API endpoint - this is a placeholder as BSE's API structure may differ
      const url = `https://api.bseindia.com/BseIndiaAPI/api/getStockPrice/${symbol}`;
      
      logger.info('Fetching BSE data', { symbol, url });

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        timeout: 10000,
      });

      // Parse BSE response (structure may vary)
      const data = response.data;
      
      // This is a placeholder - actual implementation depends on BSE API response structure
      const lastPrice = data.lastPrice || data.currentPrice || 0;
      const open = data.open || lastPrice;
      const high = data.high || lastPrice;
      const low = data.low || lastPrice;
      const close = data.previousClose || lastPrice;
      const volume = data.volume || 0;

      if (!lastPrice || lastPrice === 0) {
        throw new Error(`Invalid price data received for symbol ${symbol}`);
      }

      return {
        ltp: lastPrice,
        open,
        high,
        low,
        close,
        volume,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      logger.error('Error fetching BSE data', {
        symbol,
        error: axiosError.message,
      });
      throw new Error(`Failed to fetch BSE data for ${symbol}: ${axiosError.message}`);
    }
  }

  /**
   * Update latest price for a security in the database
   */
  async updateSecurityLTP(securityId: number): Promise<void> {
    try {
      // Get security details
      const security = await db
        .select()
        .from(securities)
        .where(eq(securities.security_id, securityId))
        .limit(1);

      if (security.length === 0) {
        throw new Error(`Security with ID ${securityId} not found`);
      }

      const sec = security[0];
      
      // Only fetch for NSE securities (BSE can be added later)
      if (sec.exchange !== 'NSE') {
        throw new Error(`Currently only NSE securities are supported. Found exchange: ${sec.exchange}`);
      }

      // Fetch latest price based on security type
      let marketData: MarketData;
      if (sec.security_type === 'bond') {
        marketData = await this.fetchNSEBond(sec.symbol);
      } else {
        // Default to equity for stocks and other types
        marketData = await this.fetchNSELTP(sec.symbol);
      }
      const today = new Date().toISOString().split('T')[0];

      // Check if price already exists for today
      const existing = await db
        .select()
        .from(securityPrices)
        .where(
          and(
            eq(securityPrices.security_id, securityId),
            eq(securityPrices.price_date, today)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Update existing record
        await db
          .update(securityPrices)
          .set({
            close_price: marketData.ltp.toString(),
            open_price: marketData.open.toString(),
            high_price: marketData.high.toString(),
            low_price: marketData.low.toString(),
            volume: marketData.volume
          })
          .where(eq(securityPrices.price_id, existing[0].price_id));

        logger.info('Updated security price', {
          securityId,
          symbol: sec.symbol,
          ltp: marketData.ltp,
        });
      } else {
        // Insert new record
        await db.insert(securityPrices).values({
          security_id: securityId,
          price_date: today,
          open_price: marketData.open.toString(),
          high_price: marketData.high.toString(),
          low_price: marketData.low.toString(),
          close_price: marketData.ltp.toString(),
          volume: marketData.volume
        });

        logger.info('Inserted new security price', {
          securityId,
          symbol: sec.symbol,
          ltp: marketData.ltp,
        });
      }
    } catch (error: any) {
      logger.error('Error updating security LTP', {
        securityId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Batch update LTP for multiple securities
   */
  async batchUpdateLTP(securityIds: number[]): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const securityId of securityIds) {
      try {
        await this.updateSecurityLTP(securityId);
        success++;
        
        // Add delay to avoid rate limiting
        if (securityIds.indexOf(securityId) < securityIds.length - 1) {
          await new Promise(resolve => setTimeout(resolve, this.requestDelay));
        }
      } catch (error: any) {
        failed++;
        errors.push(`Security ID ${securityId}: ${error.message}`);
        logger.error('Failed to update security LTP in batch', {
          securityId,
          error: error.message,
        });
      }
    }

    return { success, failed, errors };
  }
}


