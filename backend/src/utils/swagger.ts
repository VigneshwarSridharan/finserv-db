/**
 * Swagger/OpenAPI 3.0 Configuration
 * Complete Portfolio Management API Documentation
 * 
 * Implemented Endpoints: 100+
 * Domains: Auth, Securities, Banking, Assets, Portfolio, User Profile
 */
export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Portfolio Management API',
    version: '2.0.0',
    description: `
# Complete Portfolio Management REST API

A comprehensive RESTful API for managing investment portfolios including securities trading, banking, deposits, assets, and advanced portfolio analytics.

## Features
- 🔐 JWT Authentication
- 📊 Securities Trading Platform (30+ endpoints)
- 🏦 Banking & Deposits System (25+ endpoints)
- 🏠 Assets Management (Real Estate, Gold, etc.) (25+ endpoints)
- 💼 Portfolio Management & Analytics (35+ endpoints)
- 👤 User Profile & Preferences (4 endpoints)
- 📈 Real-time P&L Calculations
- 🚀 Bulk Operations (up to 1000 items)
- 🔍 Advanced Filtering, Sorting & Pagination
- ✅ Comprehensive Validation
- 📊 Advanced Analytics & Reports
- 🎯 Goals & Target Tracking
- 🔔 Alerts & Watchlist
- 📉 Performance Tracking

## Implemented Domains
1. **Authentication** - User registration and login
2. **Securities** - Brokers, securities, prices, holdings, transactions
3. **Banking** - Banks, accounts, fixed deposits, recurring deposits
4. **Assets** - Categories, assets (real estate, gold), valuations, transactions
5. **Portfolio** - Goals, allocation, alerts, watchlist, performance, reports, overview
6. **User Profile** - Profile management and preferences

## Quick Start
1. Register a user: POST /auth/register
2. Login: POST /auth/login (get JWT token)
3. Use token in Authorization header: Bearer <token>
4. Start managing your portfolio!
    `,
    contact: {
      name: 'API Support',
      email: 'support@portfolio.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Development server'
    },
    {
      url: 'http://localhost:3000',
      description: 'Alternative port'
    }
  ],
  tags: [
    {
      name: 'Auth',
      description: 'User authentication and registration'
    },
    {
      name: 'Portfolio Summary',
      description: 'Portfolio summary by asset type'
    },
    {
      name: 'Brokers',
      description: 'Broker management (securities trading)'
    },
    {
      name: 'Securities',
      description: 'Security master data and search'
    },
    {
      name: 'Security Prices',
      description: 'Security price history and bulk uploads'
    },
    {
      name: 'User Broker Accounts',
      description: 'User trading accounts'
    },
    {
      name: 'Security Holdings',
      description: 'Security holdings with P&L calculations'
    },
    {
      name: 'Security Transactions',
      description: 'Trading transactions with auto-update holdings'
    },
    {
      name: 'Banks',
      description: 'Bank management'
    },
    {
      name: 'Bank Accounts',
      description: 'User bank accounts'
    },
    {
      name: 'Fixed Deposits',
      description: 'Fixed deposit management with interest tracking'
    },
    {
      name: 'Recurring Deposits',
      description: 'Recurring deposit management with installments'
    },
    {
      name: 'Bank Transactions',
      description: 'Bank transaction history'
    },
    {
      name: 'Asset Categories',
      description: 'Asset categories and subcategories management'
    },
    {
      name: 'Assets',
      description: 'User assets management (real estate, gold, etc.)'
    },
    {
      name: 'Real Estate Details',
      description: 'Property-specific details for real estate assets'
    },
    {
      name: 'Gold Details',
      description: 'Gold-specific details for precious metal assets'
    },
    {
      name: 'Asset Valuations',
      description: 'Asset valuation history and tracking'
    },
    {
      name: 'Asset Transactions',
      description: 'Asset purchase, sale, and transfer transactions'
    },
    {
      name: 'Portfolio Goals',
      description: 'Financial goals and target tracking'
    },
    {
      name: 'Asset Allocation',
      description: 'Portfolio allocation targets and rebalancing'
    },
    {
      name: 'Portfolio Alerts',
      description: 'Price alerts and portfolio notifications'
    },
    {
      name: 'Watchlist',
      description: 'Securities watchlist with price tracking'
    },
    {
      name: 'Portfolio Performance',
      description: 'Portfolio performance tracking and statistics'
    },
    {
      name: 'Portfolio Reports',
      description: 'Portfolio report generation and management'
    },
    {
      name: 'Portfolio Overview',
      description: 'Comprehensive portfolio overview and analytics'
    },
    {
      name: 'User Profile',
      description: 'User profile and preferences management'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token obtained from /auth/login'
      }
    },
    schemas: {
      // ==================== COMMON SCHEMAS ====================
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string' },
          errors: { type: 'array', items: { type: 'string' } }
        }
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          currentPage: { type: 'integer', example: 1 },
          pageSize: { type: 'integer', example: 20 },
          totalItems: { type: 'integer', example: 100 },
          totalPages: { type: 'integer', example: 5 },
          hasNextPage: { type: 'boolean', example: true },
          hasPreviousPage: { type: 'boolean', example: false }
        }
      },

      // ==================== AUTH SCHEMAS ====================
      UserRegister: {
        type: 'object',
        required: ['username', 'email', 'password', 'first_name', 'last_name'],
        properties: {
          username: { type: 'string', minLength: 3, maxLength: 50, example: 'john_doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', minLength: 8, example: 'SecurePass123!' },
          first_name: { type: 'string', example: 'John' },
          last_name: { type: 'string', example: 'Doe' },
          phone: { type: 'string', example: '+1234567890' },
          date_of_birth: { type: 'string', format: 'date', example: '1990-01-15' }
        }
      },
      UserLogin: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', example: 'SecurePass123!' }
        }
      },

      // ==================== PORTFOLIO SCHEMAS ====================
      PortfolioSummaryCreate: {
        type: 'object',
        required: ['asset_type', 'total_investment', 'current_value'],
        properties: {
          asset_type: { 
            type: 'string', 
            enum: ['securities', 'fixed_deposits', 'recurring_deposits', 'gold', 'real_estate', 'other_assets'],
            example: 'securities'
          },
          total_investment: { type: 'number', format: 'decimal', example: 100000.00 },
          current_value: { type: 'number', format: 'decimal', example: 125000.00 },
          unrealized_pnl: { type: 'number', format: 'decimal', example: 25000.00 },
          realized_pnl: { type: 'number', format: 'decimal', example: 5000.00 }
        }
      },
      PortfolioSummaryUpdate: {
        type: 'object',
        properties: {
          total_investment: { type: 'number', format: 'decimal' },
          current_value: { type: 'number', format: 'decimal' },
          unrealized_pnl: { type: 'number', format: 'decimal' },
          realized_pnl: { type: 'number', format: 'decimal' }
        }
      },

      // ==================== BROKER SCHEMAS ====================
      BrokerCreate: {
        type: 'object',
        required: ['broker_name', 'broker_code', 'broker_type'],
        properties: {
          broker_name: { type: 'string', maxLength: 100, example: 'Zerodha' },
          broker_code: { type: 'string', maxLength: 20, example: 'ZERODHA' },
          broker_type: { 
            type: 'string', 
            enum: ['full_service', 'discount', 'online', 'bank'],
            example: 'discount'
          },
          website: { type: 'string', example: 'https://zerodha.com' },
          support_email: { type: 'string', format: 'email', example: 'support@zerodha.com' },
          support_phone: { type: 'string', example: '+91-80-40402020' },
          is_active: { type: 'boolean', default: true, example: true }
        }
      },
      BrokerUpdate: {
        type: 'object',
        properties: {
          broker_name: { type: 'string', maxLength: 100 },
          broker_type: { type: 'string', enum: ['full_service', 'discount', 'online', 'bank'] },
          website: { type: 'string' },
          support_email: { type: 'string', format: 'email' },
          support_phone: { type: 'string' },
          is_active: { type: 'boolean' }
        }
      },
      Broker: {
        type: 'object',
        properties: {
          broker_id: { type: 'integer', example: 1 },
          broker_name: { type: 'string', example: 'Zerodha' },
          broker_code: { type: 'string', example: 'ZERODHA' },
          broker_type: { type: 'string', example: 'discount' },
          website: { type: 'string', example: 'https://zerodha.com' },
          is_active: { type: 'boolean', example: true }
        }
      },

      // ==================== SECURITY SCHEMAS ====================
      SecurityCreate: {
        type: 'object',
        required: ['symbol', 'name', 'security_type'],
        properties: {
          symbol: { type: 'string', maxLength: 20, example: 'RELIANCE' },
          name: { type: 'string', maxLength: 200, example: 'Reliance Industries Ltd' },
          security_type: { 
            type: 'string', 
            enum: ['stock', 'bond', 'mutual_fund', 'etf', 'commodity', 'currency'],
            example: 'stock'
          },
          exchange: { type: 'string', maxLength: 20, example: 'NSE' },
          sector: { type: 'string', maxLength: 100, example: 'Energy' },
          industry: { type: 'string', maxLength: 100, example: 'Oil & Gas' },
          isin: { type: 'string', maxLength: 12, example: 'INE002A01018' },
          description: { type: 'string', example: 'Reliance Industries is an Indian conglomerate' }
        }
      },
      SecurityUpdate: {
        type: 'object',
        properties: {
          name: { type: 'string', maxLength: 200 },
          security_type: { type: 'string', enum: ['stock', 'bond', 'mutual_fund', 'etf', 'commodity', 'currency'] },
          exchange: { type: 'string', maxLength: 20 },
          sector: { type: 'string', maxLength: 100 },
          industry: { type: 'string', maxLength: 100 },
          description: { type: 'string' }
        }
      },
      Security: {
        type: 'object',
        properties: {
          security_id: { type: 'integer', example: 1 },
          symbol: { type: 'string', example: 'RELIANCE' },
          name: { type: 'string', example: 'Reliance Industries Ltd' },
          security_type: { type: 'string', example: 'stock' },
          exchange: { type: 'string', example: 'NSE' },
          sector: { type: 'string', example: 'Energy' },
          isin: { type: 'string', example: 'INE002A01018' }
        }
      },

      // ==================== SECURITY PRICE SCHEMAS ====================
      SecurityPriceCreate: {
        type: 'object',
        required: ['price_date', 'close_price'],
        properties: {
          price_date: { type: 'string', format: 'date', example: '2024-01-15' },
          open_price: { type: 'number', format: 'decimal', example: 2450.50 },
          high_price: { type: 'number', format: 'decimal', example: 2475.00 },
          low_price: { type: 'number', format: 'decimal', example: 2440.00 },
          close_price: { type: 'number', format: 'decimal', example: 2465.75 },
          volume: { type: 'integer', example: 1250000 }
        }
      },
      SecurityPriceBulk: {
        type: 'object',
        required: ['prices'],
        properties: {
          prices: {
            type: 'array',
            maxItems: 1000,
            items: {
              type: 'object',
              required: ['security_id', 'price_date', 'close_price'],
              properties: {
                security_id: { type: 'integer', example: 1 },
                price_date: { type: 'string', format: 'date', example: '2024-01-15' },
                open_price: { type: 'number', format: 'decimal', example: 2450.50 },
                high_price: { type: 'number', format: 'decimal', example: 2475.00 },
                low_price: { type: 'number', format: 'decimal', example: 2440.00 },
                close_price: { type: 'number', format: 'decimal', example: 2465.75 },
                volume: { type: 'integer', example: 1250000 }
              }
            }
          }
        }
      },

      // ==================== USER BROKER ACCOUNT SCHEMAS ====================
      UserBrokerAccountCreate: {
        type: 'object',
        required: ['broker_id', 'account_number', 'account_type'],
        properties: {
          broker_id: { type: 'integer', example: 1 },
          account_number: { type: 'string', maxLength: 50, example: 'ZD1234' },
          account_type: { type: 'string', enum: ['demat', 'trading', 'demat_trading'], example: 'demat_trading' },
          dp_id: { type: 'string', maxLength: 20, example: 'IN300000' },
          opened_date: { type: 'string', format: 'date', example: '2023-01-15' },
          is_active: { type: 'boolean', default: true, example: true }
        }
      },
      UserBrokerAccountUpdate: {
        type: 'object',
        properties: {
          account_type: { type: 'string', enum: ['demat', 'trading', 'demat_trading'] },
          is_active: { type: 'boolean' }
        }
      },

      // ==================== SECURITY TRANSACTION SCHEMAS ====================
      SecurityTransactionCreate: {
        type: 'object',
        required: ['account_id', 'security_id', 'transaction_type', 'transaction_date', 'quantity', 'price'],
        properties: {
          account_id: { type: 'integer', example: 1 },
          security_id: { type: 'integer', example: 1 },
          transaction_type: { type: 'string', enum: ['buy', 'sell', 'dividend', 'bonus', 'split', 'rights'], example: 'buy' },
          transaction_date: { type: 'string', format: 'date', example: '2024-01-15' },
          quantity: { type: 'number', format: 'decimal', example: 10 },
          price: { type: 'number', format: 'decimal', example: 2465.75 },
          brokerage: { type: 'number', format: 'decimal', example: 20.00 },
          taxes: { type: 'number', format: 'decimal', example: 50.00 },
          other_charges: { type: 'number', format: 'decimal', example: 10.00 },
          notes: { type: 'string', example: 'Long-term investment' }
        }
      },
      SecurityTransactionUpdate: {
        type: 'object',
        properties: {
          quantity: { type: 'number', format: 'decimal' },
          price: { type: 'number', format: 'decimal' },
          brokerage: { type: 'number', format: 'decimal' },
          taxes: { type: 'number', format: 'decimal' },
          other_charges: { type: 'number', format: 'decimal' },
          notes: { type: 'string' }
        }
      },
      SecurityTransactionBulk: {
        type: 'object',
        required: ['transactions'],
        properties: {
          transactions: {
            type: 'array',
            maxItems: 1000,
            items: { $ref: '#/components/schemas/SecurityTransactionCreate' }
          }
        }
      },

      // ==================== BANK SCHEMAS ====================
      BankCreate: {
        type: 'object',
        required: ['bank_name', 'bank_code', 'bank_type'],
        properties: {
          bank_name: { type: 'string', maxLength: 100, example: 'HDFC Bank' },
          bank_code: { type: 'string', maxLength: 20, example: 'HDFC' },
          bank_type: { 
            type: 'string', 
            enum: ['public', 'private', 'foreign', 'cooperative', 'small_finance', 'payment'],
            example: 'private'
          },
          ifsc_prefix: { type: 'string', maxLength: 4, example: 'HDFC' },
          website: { type: 'string', example: 'https://hdfcbank.com' },
          is_active: { type: 'boolean', default: true, example: true }
        }
      },
      BankUpdate: {
        type: 'object',
        properties: {
          bank_name: { type: 'string', maxLength: 100 },
          bank_type: { type: 'string', enum: ['public', 'private', 'foreign', 'cooperative', 'small_finance', 'payment'] },
          website: { type: 'string' },
          is_active: { type: 'boolean' }
        }
      },
      Bank: {
        type: 'object',
        properties: {
          bank_id: { type: 'integer', example: 1 },
          bank_name: { type: 'string', example: 'HDFC Bank' },
          bank_code: { type: 'string', example: 'HDFC' },
          bank_type: { type: 'string', example: 'private' },
          is_active: { type: 'boolean', example: true }
        }
      },

      // ==================== BANK ACCOUNT SCHEMAS ====================
      BankAccountCreate: {
        type: 'object',
        required: ['bank_id', 'account_number', 'account_type'],
        properties: {
          bank_id: { type: 'integer', example: 1 },
          account_number: { type: 'string', maxLength: 30, example: '50100123456789' },
          account_type: { type: 'string', enum: ['savings', 'current', 'salary'], example: 'savings' },
          ifsc_code: { type: 'string', maxLength: 11, example: 'HDFC0001234' },
          branch_name: { type: 'string', maxLength: 100, example: 'Mumbai Main Branch' },
          opened_date: { type: 'string', format: 'date', example: '2020-01-15' },
          current_balance: { type: 'number', format: 'decimal', example: 50000.00 },
          is_active: { type: 'boolean', default: true, example: true }
        }
      },
      BankAccountUpdate: {
        type: 'object',
        properties: {
          account_type: { type: 'string', enum: ['savings', 'current', 'salary'] },
          current_balance: { type: 'number', format: 'decimal' },
          is_active: { type: 'boolean' }
        }
      },

      // ==================== FIXED DEPOSIT SCHEMAS ====================
      FixedDepositCreate: {
        type: 'object',
        required: ['account_id', 'fd_number', 'principal_amount', 'interest_rate', 'start_date', 'maturity_date', 'tenure_months'],
        properties: {
          account_id: { type: 'integer', example: 1 },
          fd_number: { type: 'string', maxLength: 30, example: 'FD123456' },
          principal_amount: { type: 'number', format: 'decimal', example: 100000.00 },
          interest_rate: { type: 'number', format: 'decimal', example: 7.5 },
          start_date: { type: 'string', format: 'date', example: '2024-01-01' },
          maturity_date: { type: 'string', format: 'date', example: '2025-01-01' },
          tenure_months: { type: 'integer', example: 12 },
          interest_payout_frequency: { 
            type: 'string', 
            enum: ['monthly', 'quarterly', 'half_yearly', 'yearly', 'on_maturity'],
            example: 'quarterly'
          },
          is_auto_renewal: { type: 'boolean', default: false, example: false },
          nomination: { type: 'string', example: 'John Doe Sr.' }
        }
      },
      FixedDepositUpdate: {
        type: 'object',
        properties: {
          is_auto_renewal: { type: 'boolean' },
          nomination: { type: 'string' },
          status: { type: 'string', enum: ['active', 'matured', 'closed'] }
        }
      },

      // ==================== RECURRING DEPOSIT SCHEMAS ====================
      RecurringDepositCreate: {
        type: 'object',
        required: ['account_id', 'rd_number', 'installment_amount', 'interest_rate', 'start_date', 'maturity_date', 'tenure_months', 'installment_frequency'],
        properties: {
          account_id: { type: 'integer', example: 1 },
          rd_number: { type: 'string', maxLength: 30, example: 'RD123456' },
          installment_amount: { type: 'number', format: 'decimal', example: 5000.00 },
          interest_rate: { type: 'number', format: 'decimal', example: 7.0 },
          start_date: { type: 'string', format: 'date', example: '2024-01-01' },
          maturity_date: { type: 'string', format: 'date', example: '2025-01-01' },
          tenure_months: { type: 'integer', example: 12 },
          installment_frequency: { 
            type: 'string', 
            enum: ['monthly', 'quarterly'],
            example: 'monthly'
          },
          is_auto_debit: { type: 'boolean', default: true, example: true },
          nomination: { type: 'string', example: 'Jane Doe' }
        }
      },
      RecurringDepositUpdate: {
        type: 'object',
        properties: {
          is_auto_debit: { type: 'boolean' },
          nomination: { type: 'string' },
          status: { type: 'string', enum: ['active', 'matured', 'closed'] }
        }
      },

      // ==================== BANK TRANSACTION SCHEMAS ====================
      BankTransactionCreate: {
        type: 'object',
        required: ['account_id', 'transaction_type', 'transaction_date', 'amount'],
        properties: {
          account_id: { type: 'integer', example: 1 },
          transaction_type: { 
            type: 'string', 
            enum: ['deposit', 'withdrawal', 'transfer_in', 'transfer_out', 'interest_credit', 'charges', 'other'],
            example: 'deposit'
          },
          transaction_date: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
          amount: { type: 'number', format: 'decimal', example: 10000.00 },
          balance_after: { type: 'number', format: 'decimal', example: 60000.00 },
          reference_number: { type: 'string', maxLength: 50, example: 'TXN123456789' },
          description: { type: 'string', example: 'Salary credit' },
          category: { type: 'string', maxLength: 50, example: 'Income' }
        }
      },
      BankTransactionBulk: {
        type: 'object',
        required: ['transactions'],
        properties: {
          transactions: {
            type: 'array',
            maxItems: 1000,
            items: { $ref: '#/components/schemas/BankTransactionCreate' }
          }
        }
      },

      // ==================== SECURITY HOLDINGS SCHEMAS ====================
      SecurityHoldingUpdatePrice: {
        type: 'object',
        required: ['current_price'],
        properties: {
          current_price: { type: 'number', format: 'decimal', example: 2500.00 }
        }
      },

      // ==================== ASSET SCHEMAS ====================
      AssetCategoryCreate: {
        type: 'object',
        required: ['category_name', 'category_type'],
        properties: {
          category_name: { type: 'string', maxLength: 100, example: 'Gold' },
          category_type: { 
            type: 'string', 
            enum: ['precious_metal', 'real_estate', 'commodity', 'collectible', 'other'],
            example: 'precious_metal'
          },
          description: { type: 'string', example: 'Precious metals like gold, silver' },
          is_active: { type: 'boolean', default: true }
        }
      },
      AssetSubcategoryCreate: {
        type: 'object',
        required: ['subcategory_name'],
        properties: {
          subcategory_name: { type: 'string', maxLength: 100, example: 'Gold Jewelry' },
          description: { type: 'string', example: 'Gold jewelry and ornaments' },
          is_active: { type: 'boolean', default: true }
        }
      },
      AssetCreate: {
        type: 'object',
        required: ['category_id', 'asset_name', 'purchase_date', 'purchase_price', 'quantity', 'unit'],
        properties: {
          category_id: { type: 'integer', example: 1 },
          subcategory_id: { type: 'integer', example: 1 },
          asset_name: { type: 'string', maxLength: 255, example: '22K Gold Necklace' },
          description: { type: 'string', example: 'Traditional gold necklace' },
          purchase_date: { type: 'string', format: 'date', example: '2023-01-15' },
          purchase_price: { type: 'number', format: 'decimal', example: 125000.00 },
          current_value: { type: 'number', format: 'decimal', example: 135000.00 },
          quantity: { type: 'number', format: 'decimal', example: 25.5 },
          unit: { type: 'string', maxLength: 20, example: 'grams' },
          location: { type: 'string', maxLength: 255, example: 'Home Safe' },
          storage_location: { type: 'string', maxLength: 255 },
          insurance_policy_number: { type: 'string', maxLength: 100 },
          insurance_company: { type: 'string', maxLength: 100 },
          insurance_amount: { type: 'number', format: 'decimal' },
          insurance_expiry_date: { type: 'string', format: 'date' },
          is_active: { type: 'boolean', default: true }
        }
      },
      AssetUpdate: {
        type: 'object',
        properties: {
          asset_name: { type: 'string', maxLength: 255 },
          description: { type: 'string' },
          current_value: { type: 'number', format: 'decimal' },
          quantity: { type: 'number', format: 'decimal' },
          location: { type: 'string', maxLength: 255 },
          insurance_policy_number: { type: 'string', maxLength: 100 },
          insurance_amount: { type: 'number', format: 'decimal' },
          insurance_expiry_date: { type: 'string', format: 'date' },
          is_active: { type: 'boolean' }
        }
      },
      RealEstateDetailsCreate: {
        type: 'object',
        required: ['property_type', 'property_address', 'city', 'state'],
        properties: {
          property_type: { 
            type: 'string', 
            enum: ['residential', 'commercial', 'industrial', 'agricultural', 'land'],
            example: 'residential'
          },
          property_address: { type: 'string', example: '123 Main Street, Apartment 4B' },
          city: { type: 'string', maxLength: 100, example: 'Mumbai' },
          state: { type: 'string', maxLength: 100, example: 'Maharashtra' },
          pincode: { type: 'string', maxLength: 10, example: '400001' },
          area_sqft: { type: 'number', format: 'decimal', example: 1200.50 },
          built_up_area_sqft: { type: 'number', format: 'decimal', example: 1000.00 },
          year_built: { type: 'integer', example: 2015 },
          floors: { type: 'integer', example: 1 },
          bedrooms: { type: 'integer', example: 3 },
          bathrooms: { type: 'integer', example: 2 },
          parking_spaces: { type: 'integer', example: 1 },
          registration_number: { type: 'string', maxLength: 100 },
          registration_date: { type: 'string', format: 'date' },
          property_tax_number: { type: 'string', maxLength: 100 },
          maintenance_charges: { type: 'number', format: 'decimal' },
          rental_income: { type: 'number', format: 'decimal' },
          rental_yield: { type: 'number', format: 'decimal' },
          occupancy_status: { 
            type: 'string', 
            enum: ['self_occupied', 'rented', 'vacant', 'under_construction'],
            default: 'self_occupied'
          }
        }
      },
      GoldDetailsCreate: {
        type: 'object',
        required: ['gold_type', 'purity', 'weight_grams'],
        properties: {
          gold_type: { 
            type: 'string', 
            enum: ['jewelry', 'coins', 'bars', 'etf', 'mutual_fund'],
            example: 'jewelry'
          },
          purity: { 
            type: 'string', 
            enum: ['18K', '22K', '24K', '999', '995', '916'],
            example: '22K'
          },
          weight_grams: { type: 'number', format: 'decimal', example: 25.50 },
          making_charges: { type: 'number', format: 'decimal', example: 5000.00 },
          wastage_charges: { type: 'number', format: 'decimal', example: 1000.00 },
          hallmark_certificate: { type: 'string', maxLength: 100 },
          jeweler_name: { type: 'string', maxLength: 100 },
          purchase_bill_number: { type: 'string', maxLength: 100 },
          current_gold_rate_per_gram: { type: 'number', format: 'decimal', example: 5500.00 }
        }
      },
      AssetValuationCreate: {
        type: 'object',
        required: ['valuation_date', 'valuation_amount', 'valuation_method'],
        properties: {
          valuation_date: { type: 'string', format: 'date', example: '2024-01-15' },
          valuation_amount: { type: 'number', format: 'decimal', example: 135000.00 },
          valuation_method: { 
            type: 'string', 
            enum: ['market_price', 'appraisal', 'index_based', 'manual'],
            example: 'market_price'
          },
          valuation_source: { type: 'string', maxLength: 100, example: 'Local Jeweler' },
          notes: { type: 'string', example: 'Based on current market rates' }
        }
      },
      AssetTransactionCreate: {
        type: 'object',
        required: ['asset_id', 'transaction_type', 'transaction_date', 'quantity', 'price_per_unit', 'total_amount', 'net_amount'],
        properties: {
          asset_id: { type: 'integer', example: 1 },
          transaction_type: { 
            type: 'string', 
            enum: ['purchase', 'sale', 'transfer', 'gift', 'inheritance', 'valuation_update'],
            example: 'purchase'
          },
          transaction_date: { type: 'string', format: 'date', example: '2024-01-15' },
          quantity: { type: 'number', format: 'decimal', example: 10.50 },
          price_per_unit: { type: 'number', format: 'decimal', example: 5500.00 },
          total_amount: { type: 'number', format: 'decimal', example: 57750.00 },
          transaction_fees: { type: 'number', format: 'decimal', example: 500.00 },
          net_amount: { type: 'number', format: 'decimal', example: 58250.00 },
          counterparty: { type: 'string', maxLength: 255, example: 'Gold Jewelers Ltd' },
          transaction_reference: { type: 'string', maxLength: 100 },
          notes: { type: 'string' }
        }
      },
      AssetTransactionBulk: {
        type: 'object',
        required: ['transactions'],
        properties: {
          transactions: {
            type: 'array',
            maxItems: 1000,
            items: { $ref: '#/components/schemas/AssetTransactionCreate' }
          }
        }
      },

      // ==================== PORTFOLIO GOAL SCHEMAS ====================
      PortfolioGoalCreate: {
        type: 'object',
        required: ['goal_name', 'goal_type', 'target_amount', 'target_date'],
        properties: {
          goal_name: { type: 'string', maxLength: 255, example: 'Retirement Fund' },
          goal_type: { 
            type: 'string', 
            enum: ['retirement', 'education', 'house_purchase', 'marriage', 'vacation', 'emergency_fund', 'other'],
            example: 'retirement'
          },
          target_amount: { type: 'number', format: 'decimal', example: 10000000.00 },
          current_amount: { type: 'number', format: 'decimal', example: 1500000.00 },
          target_date: { type: 'string', format: 'date', example: '2045-12-31' },
          priority: { 
            type: 'string', 
            enum: ['low', 'medium', 'high'],
            default: 'medium'
          },
          notes: { type: 'string', example: 'Target retirement at age 60' }
        }
      },
      PortfolioGoalUpdate: {
        type: 'object',
        properties: {
          goal_name: { type: 'string', maxLength: 255 },
          target_amount: { type: 'number', format: 'decimal' },
          current_amount: { type: 'number', format: 'decimal' },
          target_date: { type: 'string', format: 'date' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          notes: { type: 'string' }
        }
      },
      PortfolioGoalResponse: {
        type: 'object',
        properties: {
          goal_id: { type: 'integer' },
          goal_name: { type: 'string' },
          goal_type: { type: 'string' },
          target_amount: { type: 'number' },
          current_amount: { type: 'number' },
          target_date: { type: 'string', format: 'date' },
          progress_percentage: { type: 'number', example: 15.00 },
          remaining_amount: { type: 'number' },
          is_achieved: { type: 'boolean' },
          achieved_date: { type: 'string', format: 'date' },
          priority: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' }
        }
      },

      // ==================== ASSET ALLOCATION SCHEMAS ====================
      AssetAllocationTargetCreate: {
        type: 'object',
        required: ['asset_type', 'target_percentage'],
        properties: {
          asset_type: { 
            type: 'string', 
            enum: ['equity', 'debt', 'gold', 'real_estate', 'cash', 'other'],
            example: 'equity'
          },
          target_percentage: { type: 'number', format: 'decimal', example: 60.00 },
          tolerance_band: { type: 'number', format: 'decimal', default: 5.00, example: 5.00 }
        }
      },
      AssetAllocationResponse: {
        type: 'object',
        properties: {
          allocation_id: { type: 'integer' },
          asset_type: { type: 'string' },
          target_percentage: { type: 'number' },
          current_percentage: { type: 'number' },
          current_value: { type: 'number' },
          variance_percentage: { type: 'number' },
          is_within_tolerance: { type: 'boolean' },
          rebalance_required: { type: 'boolean' }
        }
      },
      RebalanceSuggestion: {
        type: 'object',
        properties: {
          asset_type: { type: 'string' },
          current_value: { type: 'number' },
          current_percentage: { type: 'number' },
          target_percentage: { type: 'number' },
          target_value: { type: 'number' },
          variance_percentage: { type: 'number' },
          amount_to_adjust: { type: 'number' },
          action: { type: 'string', enum: ['buy', 'sell'] },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] }
        }
      },

      // ==================== PORTFOLIO ALERT SCHEMAS ====================
      PortfolioAlertCreate: {
        type: 'object',
        required: ['alert_type', 'alert_name', 'alert_condition'],
        properties: {
          alert_type: { 
            type: 'string', 
            enum: ['price_alert', 'allocation_alert', 'maturity_alert', 'goal_alert', 'performance_alert'],
            example: 'price_alert'
          },
          alert_name: { type: 'string', maxLength: 255, example: 'RELIANCE Price Alert' },
          alert_condition: { type: 'string', example: 'price > 2500' },
          alert_threshold: { type: 'number', format: 'decimal', example: 2500.00 },
          is_active: { type: 'boolean', default: true }
        }
      },
      PortfolioAlertResponse: {
        type: 'object',
        properties: {
          alert_id: { type: 'integer' },
          alert_type: { type: 'string' },
          alert_name: { type: 'string' },
          alert_condition: { type: 'string' },
          alert_threshold: { type: 'number' },
          is_active: { type: 'boolean' },
          is_triggered: { type: 'boolean' },
          triggered_at: { type: 'string', format: 'date-time' },
          created_at: { type: 'string', format: 'date-time' }
        }
      },

      // ==================== WATCHLIST SCHEMAS ====================
      WatchlistItemCreate: {
        type: 'object',
        required: ['security_id'],
        properties: {
          security_id: { type: 'integer', example: 1 },
          target_price: { type: 'number', format: 'decimal', example: 2800.00 },
          notes: { type: 'string', example: 'Buy target at 2800' }
        }
      },
      WatchlistItemResponse: {
        type: 'object',
        properties: {
          watchlist_id: { type: 'integer' },
          security_id: { type: 'integer' },
          security: {
            type: 'object',
            properties: {
              symbol: { type: 'string' },
              name: { type: 'string' },
              exchange: { type: 'string' }
            }
          },
          target_price: { type: 'number' },
          current_price: { type: 'number' },
          latest_price_date: { type: 'string', format: 'date' },
          target_achievement_percentage: { type: 'number' },
          target_status: { type: 'string', enum: ['pending', 'achieved'] },
          notes: { type: 'string' },
          added_date: { type: 'string', format: 'date' }
        }
      },

      // ==================== PORTFOLIO PERFORMANCE SCHEMAS ====================
      PortfolioPerformanceCreate: {
        type: 'object',
        required: ['performance_date', 'total_portfolio_value', 'total_investment', 'total_pnl', 'total_return_percentage'],
        properties: {
          performance_date: { type: 'string', format: 'date', example: '2024-01-15' },
          total_portfolio_value: { type: 'number', format: 'decimal', example: 1500000.00 },
          total_investment: { type: 'number', format: 'decimal', example: 1200000.00 },
          total_pnl: { type: 'number', format: 'decimal', example: 300000.00 },
          total_return_percentage: { type: 'number', format: 'decimal', example: 25.00 },
          day_change: { type: 'number', format: 'decimal', example: 5000.00 },
          day_change_percentage: { type: 'number', format: 'decimal', example: 0.33 },
          week_change: { type: 'number', format: 'decimal' },
          week_change_percentage: { type: 'number', format: 'decimal' },
          month_change: { type: 'number', format: 'decimal' },
          month_change_percentage: { type: 'number', format: 'decimal' },
          year_change: { type: 'number', format: 'decimal' },
          year_change_percentage: { type: 'number', format: 'decimal' }
        }
      },

      // ==================== PORTFOLIO REPORT SCHEMAS ====================
      PortfolioReportGenerate: {
        type: 'object',
        required: ['report_type', 'report_period_start', 'report_period_end'],
        properties: {
          report_type: { 
            type: 'string', 
            enum: ['monthly', 'quarterly', 'yearly', 'custom'],
            example: 'monthly'
          },
          report_period_start: { type: 'string', format: 'date', example: '2024-01-01' },
          report_period_end: { type: 'string', format: 'date', example: '2024-01-31' }
        }
      },
      PortfolioReportResponse: {
        type: 'object',
        properties: {
          report_id: { type: 'integer' },
          report_type: { type: 'string' },
          report_period_start: { type: 'string', format: 'date' },
          report_period_end: { type: 'string', format: 'date' },
          total_investment: { type: 'number' },
          total_value: { type: 'number' },
          total_pnl: { type: 'number' },
          total_return_percentage: { type: 'number' },
          best_performing_asset: { type: 'string' },
          worst_performing_asset: { type: 'string' },
          report_data: { type: 'object' },
          generated_at: { type: 'string', format: 'date-time' }
        }
      },

      // ==================== USER PROFILE SCHEMAS ====================
      UserProfileUpdate: {
        type: 'object',
        properties: {
          full_name: { type: 'string', maxLength: 200, example: 'John Doe' },
          date_of_birth: { type: 'string', format: 'date', example: '1990-01-15' },
          phone_number: { type: 'string', maxLength: 20, example: '+1234567890' },
          address: { type: 'string', example: '123 Main Street' },
          city: { type: 'string', maxLength: 100, example: 'Mumbai' },
          state: { type: 'string', maxLength: 100, example: 'Maharashtra' },
          country: { type: 'string', maxLength: 100, example: 'India' },
          pincode: { type: 'string', maxLength: 10, example: '400001' },
          pan_number: { type: 'string', maxLength: 10, example: 'ABCDE1234F' }
        }
      },
      UserProfileResponse: {
        type: 'object',
        properties: {
          user_id: { type: 'integer' },
          username: { type: 'string' },
          email: { type: 'string' },
          full_name: { type: 'string' },
          date_of_birth: { type: 'string', format: 'date' },
          phone_number: { type: 'string' },
          address: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          country: { type: 'string' },
          pincode: { type: 'string' },
          pan_number: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      UserPreferences: {
        type: 'object',
        properties: {
          theme: { type: 'string', enum: ['light', 'dark'], default: 'light' },
          currency: { type: 'string', default: 'INR', example: 'INR' },
          date_format: { type: 'string', default: 'DD/MM/YYYY', example: 'DD/MM/YYYY' },
          number_format: { type: 'string', default: 'en-IN', example: 'en-IN' },
          notifications: {
            type: 'object',
            properties: {
              email: { type: 'boolean', default: true },
              push: { type: 'boolean', default: true },
              price_alerts: { type: 'boolean', default: true },
              maturity_alerts: { type: 'boolean', default: true }
            }
          },
          dashboard: {
            type: 'object',
            properties: {
              default_view: { type: 'string', default: 'overview' },
              show_charts: { type: 'boolean', default: true },
              show_recent_transactions: { type: 'boolean', default: true }
            }
          }
        }
      },

      // ==================== COMMON RESPONSE SCHEMAS ====================
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
          message: { type: 'string' }
        }
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'array', items: { type: 'object' } },
          pagination: { $ref: '#/components/schemas/PaginationMeta' },
          message: { type: 'string' }
        }
      },
      BulkOperationResult: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          totalItems: { type: 'integer' },
          successCount: { type: 'integer' },
          failureCount: { type: 'integer' },
          results: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
                error: { type: 'string' },
                index: { type: 'integer' }
              }
            }
          },
          errors: { type: 'array', items: { type: 'string' } }
        }
      }
    }
  },
  paths: {
    // ==================== AUTH ENDPOINTS ====================
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register new user',
        description: 'Create a new user account with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserRegister' }
            }
          }
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        user: { type: 'object' },
                        token: { type: 'string' }
                      }
                    },
                    message: { type: 'string' }
                  }
                }
              }
            }
          },
          400: { description: 'Validation error' },
          409: { description: 'User already exists' }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        description: 'Authenticate user and receive JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserLogin' }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { type: 'object' },
                        token: { type: 'string', description: 'JWT token for authentication' }
                      }
                    }
                  }
                }
              }
            }
          },
          401: { description: 'Invalid credentials' }
        }
      }
    },

    // ==================== PORTFOLIO SUMMARY ENDPOINTS ====================
    '/portfolios': {
      get: {
        tags: ['Portfolio Summary'],
        summary: 'Get all portfolio summaries',
        description: 'Get portfolio summaries grouped by asset type for authenticated user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Portfolio summaries retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { type: 'object' } },
                    count: { type: 'integer' }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Portfolio Summary'],
        summary: 'Create portfolio summary',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PortfolioSummaryCreate' }
            }
          }
        },
        responses: {
          201: { description: 'Portfolio created' },
          409: { description: 'Portfolio already exists for this asset type' }
        }
      }
    },
    '/portfolios/{id}': {
      get: {
        tags: ['Portfolio Summary'],
        summary: 'Get portfolio by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Portfolio details' },
          404: { description: 'Portfolio not found' }
        }
      },
      put: {
        tags: ['Portfolio Summary'],
        summary: 'Update portfolio',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PortfolioSummaryUpdate' }
            }
          }
        },
        responses: {
          200: { description: 'Portfolio updated' }
        }
      },
      delete: {
        tags: ['Portfolio Summary'],
        summary: 'Delete portfolio',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Portfolio deleted' }
        }
      }
    },

    // ==================== BROKERS ENDPOINTS ====================
    '/brokers': {
      get: {
        tags: ['Brokers'],
        summary: 'List all brokers',
        description: 'Get list of brokers with filtering and pagination. Public endpoint.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
          { name: 'broker_type', in: 'query', schema: { type: 'string' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: {
            description: 'Brokers list with pagination',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Broker' } },
                    pagination: { $ref: '#/components/schemas/PaginationMeta' }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Brokers'],
        summary: 'Create broker',
        description: 'Create a new broker (admin only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BrokerCreate' }
            }
          }
        },
        responses: { 
          201: { description: 'Broker created successfully' },
          400: { description: 'Validation error' },
          409: { description: 'Broker code already exists' }
        }
      }
    },
    '/brokers/{id}': {
      get: {
        tags: ['Brokers'],
        summary: 'Get broker by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Broker details' } }
      },
      put: {
        tags: ['Brokers'],
        summary: 'Update broker',
        description: 'Update broker details',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BrokerUpdate' }
            }
          }
        },
        responses: { 
          200: { description: 'Broker updated successfully' },
          404: { description: 'Broker not found' }
        }
      },
      delete: {
        tags: ['Brokers'],
        summary: 'Delete broker',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Broker deleted' } }
      }
    },

    // ==================== SECURITIES ENDPOINTS ====================
    '/securities': {
      get: {
        tags: ['Securities'],
        summary: 'List securities',
        description: 'Get list of securities with filtering and pagination',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'security_type', in: 'query', schema: { type: 'string' } },
          { name: 'exchange', in: 'query', schema: { type: 'string' } },
          { name: 'sector', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Securities list with pagination' }
        }
      },
      post: {
        tags: ['Securities'],
        summary: 'Create security',
        description: 'Create a new security',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SecurityCreate' }
            }
          }
        },
        responses: { 
          201: { description: 'Security created successfully' },
          400: { description: 'Validation error' },
          409: { description: 'Security symbol already exists' }
        }
      }
    },
    '/securities/search': {
      get: {
        tags: ['Securities'],
        summary: 'Search securities',
        description: 'Search securities by symbol, name, or ISIN',
        parameters: [
          { name: 'q', in: 'query', required: true, schema: { type: 'string' }, description: 'Search query' }
        ],
        responses: { 200: { description: 'Search results' } }
      }
    },
    '/securities/{id}': {
      get: {
        tags: ['Securities'],
        summary: 'Get security by ID',
        description: 'Get security details with latest price',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Security details with latest price' } }
      },
      put: {
        tags: ['Securities'],
        summary: 'Update security',
        description: 'Update security details',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SecurityUpdate' }
            }
          }
        },
        responses: { 
          200: { description: 'Security updated successfully' },
          404: { description: 'Security not found' }
        }
      },
      delete: {
        tags: ['Securities'],
        summary: 'Delete security',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Security deleted' } }
      }
    },

    // ==================== SECURITY PRICES ENDPOINTS ====================
    '/securities/{securityId}/prices': {
      get: {
        tags: ['Security Prices'],
        summary: 'Get price history',
        description: 'Get historical prices for a security with date range filtering',
        parameters: [
          { name: 'securityId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Price history' } }
      },
      post: {
        tags: ['Security Prices'],
        summary: 'Add security price',
        description: 'Add a single price record for a security',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'securityId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SecurityPriceCreate' }
            }
          }
        },
        responses: { 
          201: { description: 'Price added successfully' },
          400: { description: 'Validation error' },
          404: { description: 'Security not found' },
          409: { description: 'Price already exists for this date' }
        }
      }
    },
    '/securities/{securityId}/prices/latest': {
      get: {
        tags: ['Security Prices'],
        summary: 'Get latest price',
        parameters: [
          { name: 'securityId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Latest price' } }
      }
    },
    '/securities/prices/bulk': {
      post: {
        tags: ['Security Prices'],
        summary: 'Bulk upload prices',
        description: 'Upload up to 1000 security prices in a single request',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SecurityPriceBulk' }
            }
          }
        },
        responses: {
          200: { description: 'All prices uploaded successfully' },
          207: { 
            description: 'Partial success - some items failed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        total: { type: 'integer' },
                        successful: { type: 'integer' },
                        failed: { type: 'integer' },
                        errors: { type: 'array' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },

    // ==================== USER BROKER ACCOUNTS ENDPOINTS ====================
    '/accounts/brokers': {
      get: {
        tags: ['User Broker Accounts'],
        summary: 'Get user broker accounts',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Broker accounts list' } }
      },
      post: {
        tags: ['User Broker Accounts'],
        summary: 'Create broker account',
        description: 'Create a new broker account for the authenticated user',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserBrokerAccountCreate' }
            }
          }
        },
        responses: { 
          201: { description: 'Broker account created successfully' },
          400: { description: 'Validation error' },
          404: { description: 'Broker not found' },
          409: { description: 'Account number already exists' }
        }
      }
    },
    '/accounts/brokers/{id}': {
      get: {
        tags: ['User Broker Accounts'],
        summary: 'Get account by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Account details' } }
      },
      put: {
        tags: ['User Broker Accounts'],
        summary: 'Update account',
        description: 'Update broker account details',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserBrokerAccountUpdate' }
            }
          }
        },
        responses: { 
          200: { description: 'Account updated successfully' },
          404: { description: 'Account not found' }
        }
      },
      delete: {
        tags: ['User Broker Accounts'],
        summary: 'Delete account',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Account deleted' } }
      }
    },

    // ==================== SECURITY HOLDINGS ENDPOINTS ====================
    '/holdings/securities': {
      get: {
        tags: ['Security Holdings'],
        summary: 'Get security holdings',
        description: 'Get holdings with calculated P&L and returns from database views',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Holdings list with P&L calculations' } }
      }
    },
    '/holdings/securities/summary': {
      get: {
        tags: ['Security Holdings'],
        summary: 'Get holdings summary',
        description: 'Get aggregated holdings summary by sector, type, or exchange',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'groupBy', in: 'query', schema: { type: 'string', enum: ['sector', 'security_type', 'exchange'], default: 'sector' } }
        ],
        responses: { 200: { description: 'Aggregated holdings summary' } }
      }
    },
    '/holdings/securities/{id}': {
      get: {
        tags: ['Security Holdings'],
        summary: 'Get holding details',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Holding details' } }
      },
      delete: {
        tags: ['Security Holdings'],
        summary: 'Delete holding',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Holding deleted' } }
      }
    },
    '/holdings/securities/{id}/current-price': {
      put: {
        tags: ['Security Holdings'],
        summary: 'Update current price',
        description: 'Update current price of a holding (auto-recalculates P&L)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SecurityHoldingUpdatePrice' }
            }
          }
        },
        responses: { 
          200: { description: 'Current price updated successfully' },
          404: { description: 'Holding not found' }
        }
      }
    },
    '/holdings/securities/{id}/transactions': {
      get: {
        tags: ['Security Holdings'],
        summary: 'Get transactions for a holding',
        description: 'Get all transactions associated with a specific security holding (by user, account, and security)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Holding ID' }
        ],
        responses: { 
          200: { 
            description: 'List of transactions for the holding',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          transaction_id: { type: 'integer' },
                          user_id: { type: 'integer' },
                          account_id: { type: 'integer' },
                          security_id: { type: 'integer' },
                          transaction_type: { type: 'string', enum: ['buy', 'sell', 'bonus', 'split', 'dividend'] },
                          transaction_date: { type: 'string', format: 'date' },
                          quantity: { type: 'string' },
                          price: { type: 'string' },
                          total_amount: { type: 'string' },
                          brokerage: { type: 'string' },
                          taxes: { type: 'string' },
                          other_charges: { type: 'string' },
                          net_amount: { type: 'string' },
                          notes: { type: 'string' },
                          created_at: { type: 'string', format: 'date-time' }
                        }
                      }
                    },
                    count: { type: 'integer' }
                  }
                }
              }
            }
          },
          400: { description: 'Invalid holding ID' },
          403: { description: 'Access denied to this holding' },
          404: { description: 'Holding not found' }
        }
      }
    },

    // ==================== SECURITY TRANSACTIONS ENDPOINTS ====================
    '/transactions/securities': {
      get: {
        tags: ['Security Transactions'],
        summary: 'Get security transactions',
        description: 'Get transactions with filtering by type, date, account, security',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'transaction_type', in: 'query', schema: { type: 'string' } },
          { name: 'account_id', in: 'query', schema: { type: 'integer' } },
          { name: 'security_id', in: 'query', schema: { type: 'integer' } },
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } }
        ],
        responses: { 200: { description: 'Transactions list' } }
      },
      post: {
        tags: ['Security Transactions'],
        summary: 'Create transaction',
        description: '⚡ Auto-updates holdings on buy/sell transactions',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SecurityTransactionCreate' }
            }
          }
        },
        responses: { 
          201: { description: 'Transaction created and holdings updated successfully' },
          400: { description: 'Validation error' },
          404: { description: 'Account or security not found' }
        }
      }
    },
    '/transactions/securities/bulk': {
      post: {
        tags: ['Security Transactions'],
        summary: 'Bulk import transactions',
        description: '⚡ Import up to 1000 transactions, auto-updates holdings',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SecurityTransactionBulk' }
            }
          }
        },
        responses: {
          200: { description: 'All transactions imported successfully' },
          207: { 
            description: 'Partial success - some transactions failed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        total: { type: 'integer' },
                        successful: { type: 'integer' },
                        failed: { type: 'integer' },
                        errors: { type: 'array' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/transactions/securities/{id}': {
      get: {
        tags: ['Security Transactions'],
        summary: 'Get transaction details',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Transaction details from view' } }
      },
      put: {
        tags: ['Security Transactions'],
        summary: 'Update transaction',
        description: 'Update transaction details',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SecurityTransactionUpdate' }
            }
          }
        },
        responses: { 
          200: { description: 'Transaction updated successfully' },
          404: { description: 'Transaction not found' }
        }
      },
      delete: {
        tags: ['Security Transactions'],
        summary: 'Delete transaction',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Transaction deleted' } }
      }
    },

    // ==================== BANKS ENDPOINTS ====================
    '/banks': {
      get: {
        tags: ['Banks'],
        summary: 'List all banks',
        description: 'Get list of banks with filtering and pagination. Public endpoint.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'bank_type', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Banks list' } }
      },
      post: {
        tags: ['Banks'],
        summary: 'Create bank',
        description: 'Create a new bank',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BankCreate' }
            }
          }
        },
        responses: { 
          201: { description: 'Bank created successfully' },
          400: { description: 'Validation error' },
          409: { description: 'Bank code already exists' }
        }
      }
    },
    '/banks/{id}': {
      get: {
        tags: ['Banks'],
        summary: 'Get bank by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Bank details' } }
      },
      put: {
        tags: ['Banks'],
        summary: 'Update bank',
        description: 'Update bank details',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BankUpdate' }
            }
          }
        },
        responses: { 
          200: { description: 'Bank updated successfully' },
          404: { description: 'Bank not found' }
        }
      },
      delete: {
        tags: ['Banks'],
        summary: 'Delete bank',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Bank deleted' } }
      }
    },

    // ==================== BANK ACCOUNTS ENDPOINTS ====================
    '/accounts/banks': {
      get: {
        tags: ['Bank Accounts'],
        summary: 'Get user bank accounts',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Bank accounts list' } }
      },
      post: {
        tags: ['Bank Accounts'],
        summary: 'Create bank account',
        description: 'Create a new bank account for the authenticated user',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BankAccountCreate' }
            }
          }
        },
        responses: { 
          201: { description: 'Bank account created successfully' },
          400: { description: 'Validation error' },
          404: { description: 'Bank not found' },
          409: { description: 'Account number already exists' }
        }
      }
    },
    '/accounts/banks/{id}': {
      get: {
        tags: ['Bank Accounts'],
        summary: 'Get account by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Account details' } }
      },
      put: {
        tags: ['Bank Accounts'],
        summary: 'Update account',
        description: 'Update bank account details',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BankAccountUpdate' }
            }
          }
        },
        responses: { 
          200: { description: 'Account updated successfully' },
          404: { description: 'Account not found' }
        }
      },
      delete: {
        tags: ['Bank Accounts'],
        summary: 'Delete account',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Account deleted' } }
      }
    },

    // ==================== FIXED DEPOSITS ENDPOINTS ====================
    '/deposits/fixed': {
      get: {
        tags: ['Fixed Deposits'],
        summary: 'Get fixed deposits',
        description: 'Get FDs with maturity status and days to maturity from views',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'status', in: 'query', schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Fixed deposits list' } }
      },
      post: {
        tags: ['Fixed Deposits'],
        summary: 'Create fixed deposit',
        description: 'Create a new fixed deposit',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FixedDepositCreate' }
            }
          }
        },
        responses: { 
          201: { description: 'Fixed deposit created successfully' },
          400: { description: 'Validation error' },
          404: { description: 'Bank account not found' },
          409: { description: 'FD number already exists' }
        }
      }
    },
    '/deposits/fixed/{id}': {
      get: {
        tags: ['Fixed Deposits'],
        summary: 'Get FD details',
        description: 'Get FD details with interest payment history',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'FD details with interest payments' } }
      },
      put: {
        tags: ['Fixed Deposits'],
        summary: 'Update FD',
        description: 'Update fixed deposit details',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FixedDepositUpdate' }
            }
          }
        },
        responses: { 
          200: { description: 'FD updated successfully' },
          404: { description: 'FD not found' }
        }
      },
      delete: {
        tags: ['Fixed Deposits'],
        summary: 'Close FD',
        description: 'Close FD (premature withdrawal)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'FD closed' } }
      }
    },
    '/deposits/fixed/{id}/interest-payments': {
      get: {
        tags: ['Fixed Deposits'],
        summary: 'Get interest payments',
        description: 'Get interest payment history for an FD',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Interest payments history' } }
      }
    },

    // ==================== RECURRING DEPOSITS ENDPOINTS ====================
    '/deposits/recurring': {
      get: {
        tags: ['Recurring Deposits'],
        summary: 'Get recurring deposits',
        description: 'Get RDs with installment status from views',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'status', in: 'query', schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Recurring deposits list' } }
      },
      post: {
        tags: ['Recurring Deposits'],
        summary: 'Create recurring deposit',
        description: 'Create a new recurring deposit',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RecurringDepositCreate' }
            }
          }
        },
        responses: { 
          201: { description: 'Recurring deposit created successfully' },
          400: { description: 'Validation error' },
          404: { description: 'Bank account not found' },
          409: { description: 'RD number already exists' }
        }
      }
    },
    '/deposits/recurring/{id}': {
      get: {
        tags: ['Recurring Deposits'],
        summary: 'Get RD details',
        description: 'Get RD details with installments',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'RD details with installments' } }
      },
      put: {
        tags: ['Recurring Deposits'],
        summary: 'Update RD',
        description: 'Update recurring deposit details',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RecurringDepositUpdate' }
            }
          }
        },
        responses: { 
          200: { description: 'RD updated successfully' },
          404: { description: 'RD not found' }
        }
      },
      delete: {
        tags: ['Recurring Deposits'],
        summary: 'Close RD',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'RD closed' } }
      }
    },
    '/deposits/recurring/{id}/installments': {
      get: {
        tags: ['Recurring Deposits'],
        summary: 'Get installments',
        description: 'Get installment history for an RD',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Installments history' } }
      }
    },
    '/deposits/recurring/{id}/installments/{installmentId}/pay': {
      post: {
        tags: ['Recurring Deposits'],
        summary: 'Pay installment',
        description: 'Record installment payment',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'installmentId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Payment recorded' } }
      }
    },

    // ==================== BANK TRANSACTIONS ENDPOINTS ====================
    '/transactions/bank': {
      get: {
        tags: ['Bank Transactions'],
        summary: 'Get bank transactions',
        description: 'Get bank transactions with filtering',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'transaction_type', in: 'query', schema: { type: 'string' } },
          { name: 'account_id', in: 'query', schema: { type: 'integer' } },
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } }
        ],
        responses: { 200: { description: 'Bank transactions list' } }
      },
      post: {
        tags: ['Bank Transactions'],
        summary: 'Create transaction',
        description: 'Create a new bank transaction',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BankTransactionCreate' }
            }
          }
        },
        responses: { 
          201: { description: 'Transaction created successfully' },
          400: { description: 'Validation error' },
          404: { description: 'Account not found' }
        }
      }
    },
    '/transactions/bank/bulk': {
      post: {
        tags: ['Bank Transactions'],
        summary: 'Bulk import transactions',
        description: 'Import up to 1000 bank transactions',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BankTransactionBulk' }
            }
          }
        },
        responses: {
          200: { description: 'All transactions imported successfully' },
          207: { 
            description: 'Partial success - some transactions failed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        total: { type: 'integer' },
                        successful: { type: 'integer' },
                        failed: { type: 'integer' },
                        errors: { type: 'array' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/transactions/bank/{id}': {
      get: {
        tags: ['Bank Transactions'],
        summary: 'Get transaction details',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Transaction details' } }
      }
    },

    // ==================== ASSET CATEGORIES ENDPOINTS ====================
    '/assets/categories': {
      get: {
        tags: ['Asset Categories'],
        summary: 'List asset categories',
        description: 'Get all asset categories with optional filtering',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'category_type', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } }
        ],
        responses: { 
          200: { 
            description: 'Asset categories list with pagination',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedResponse' }
              }
            }
          }
        }
      },
      post: {
        tags: ['Asset Categories'],
        summary: 'Create category',
        description: 'Create a new asset category',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AssetCategoryCreate' }
            }
          }
        },
        responses: { 
          201: { 
            description: 'Category created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' }
              }
            }
          },
          400: { description: 'Validation error' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/assets/categories/{id}': {
      get: {
        tags: ['Asset Categories'],
        summary: 'Get category details',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Category details with subcategories' } }
      },
      put: {
        tags: ['Asset Categories'],
        summary: 'Update category',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Category updated' } }
      },
      delete: {
        tags: ['Asset Categories'],
        summary: 'Delete category',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Category deleted' } }
      }
    },
    '/assets/categories/{categoryId}/subcategories': {
      get: {
        tags: ['Asset Categories'],
        summary: 'List subcategories',
        parameters: [
          { name: 'categoryId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 
          200: { 
            description: 'Subcategories list',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' }
              }
            }
          }
        }
      },
      post: {
        tags: ['Asset Categories'],
        summary: 'Create subcategory',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'categoryId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AssetSubcategoryCreate' }
            }
          }
        },
        responses: { 
          201: { 
            description: 'Subcategory created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' }
              }
            }
          }
        }
      }
    },

    // ==================== ASSETS ENDPOINTS ====================
    '/assets': {
      get: {
        tags: ['Assets'],
        summary: 'List user assets',
        description: 'Get user assets with returns calculation',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'category_id', in: 'query', schema: { type: 'integer' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } }
        ],
        responses: { 
          200: { 
            description: 'Assets list with returns',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedResponse' }
              }
            }
          }
        }
      },
      post: {
        tags: ['Assets'],
        summary: 'Create asset',
        description: 'Create a new user asset',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AssetCreate' }
            }
          }
        },
        responses: { 
          201: { 
            description: 'Asset created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' }
              }
            }
          },
          400: { description: 'Validation error' }
        }
      }
    },
    '/assets/summary': {
      get: {
        tags: ['Assets'],
        summary: 'Get assets summary',
        description: 'Get aggregated asset statistics',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Assets summary with category breakdown' } }
      }
    },
    '/assets/{id}': {
      get: {
        tags: ['Assets'],
        summary: 'Get asset details',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Asset details with specific details' } }
      },
      put: {
        tags: ['Assets'],
        summary: 'Update asset',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Asset updated' } }
      },
      delete: {
        tags: ['Assets'],
        summary: 'Delete asset',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Asset deleted' } }
      }
    },

    // ==================== REAL ESTATE DETAILS ENDPOINTS ====================
    '/assets/{assetId}/real-estate': {
      get: {
        tags: ['Real Estate Details'],
        summary: 'Get property details',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'assetId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 
          200: { 
            description: 'Property details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' }
              }
            }
          },
          404: { description: 'Property details not found' }
        }
      },
      post: {
        tags: ['Real Estate Details'],
        summary: 'Add property details',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'assetId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RealEstateDetailsCreate' }
            }
          }
        },
        responses: { 
          201: { 
            description: 'Property details added',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' }
              }
            }
          }
        }
      },
      put: {
        tags: ['Real Estate Details'],
        summary: 'Update property details',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'assetId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Property details updated' } }
      },
      delete: {
        tags: ['Real Estate Details'],
        summary: 'Delete property details',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'assetId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Property details deleted' } }
      }
    },

    // ==================== GOLD DETAILS ENDPOINTS ====================
    '/assets/{assetId}/gold': {
      get: {
        tags: ['Gold Details'],
        summary: 'Get gold details',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'assetId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 
          200: { 
            description: 'Gold details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' }
              }
            }
          }
        }
      },
      post: {
        tags: ['Gold Details'],
        summary: 'Add gold details',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'assetId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GoldDetailsCreate' }
            }
          }
        },
        responses: { 
          201: { 
            description: 'Gold details added',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' }
              }
            }
          }
        }
      },
      put: {
        tags: ['Gold Details'],
        summary: 'Update gold details',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'assetId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Gold details updated' } }
      },
      delete: {
        tags: ['Gold Details'],
        summary: 'Delete gold details',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'assetId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Gold details deleted' } }
      }
    },

    // ==================== ASSET VALUATIONS ENDPOINTS ====================
    '/assets/{assetId}/valuations': {
      get: {
        tags: ['Asset Valuations'],
        summary: 'Get valuation history',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'assetId', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } }
        ],
        responses: { 
          200: { 
            description: 'Valuation history',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedResponse' }
              }
            }
          }
        }
      },
      post: {
        tags: ['Asset Valuations'],
        summary: 'Add valuation',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'assetId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AssetValuationCreate' }
            }
          }
        },
        responses: { 
          201: { 
            description: 'Valuation added',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' }
              }
            }
          }
        }
      }
    },
    '/assets/{assetId}/valuations/latest': {
      get: {
        tags: ['Asset Valuations'],
        summary: 'Get latest valuation',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'assetId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Latest valuation' } }
      }
    },

    // ==================== ASSET TRANSACTIONS ENDPOINTS ====================
    '/transactions/assets': {
      get: {
        tags: ['Asset Transactions'],
        summary: 'List asset transactions',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'asset_id', in: 'query', schema: { type: 'integer' } },
          { name: 'transaction_type', in: 'query', schema: { type: 'string' } }
        ],
        responses: { 
          200: { 
            description: 'Asset transactions list',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedResponse' }
              }
            }
          }
        }
      },
      post: {
        tags: ['Asset Transactions'],
        summary: 'Create transaction',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AssetTransactionCreate' }
            }
          }
        },
        responses: { 
          201: { 
            description: 'Transaction created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' }
              }
            }
          }
        }
      }
    },
    '/transactions/assets/bulk': {
      post: {
        tags: ['Asset Transactions'],
        summary: 'Bulk import transactions',
        description: 'Import up to 1000 asset transactions',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AssetTransactionBulk' }
            }
          }
        },
        responses: { 
          200: { 
            description: 'Bulk import completed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BulkOperationResult' }
              }
            }
          }
        }
      }
    },

    // ==================== PORTFOLIO GOALS ENDPOINTS ====================
    '/portfolio/goals': {
      get: {
        tags: ['Portfolio Goals'],
        summary: 'List goals',
        description: 'Get portfolio goals with progress',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'goal_type', in: 'query', schema: { type: 'string' } },
          { name: 'is_achieved', in: 'query', schema: { type: 'boolean' } }
        ],
        responses: { 
          200: { 
            description: 'Goals list with progress',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedResponse' }
              }
            }
          }
        }
      },
      post: {
        tags: ['Portfolio Goals'],
        summary: 'Create goal',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PortfolioGoalCreate' }
            }
          }
        },
        responses: { 
          201: { 
            description: 'Goal created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/PortfolioGoalResponse' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/portfolio/goals/summary': {
      get: {
        tags: ['Portfolio Goals'],
        summary: 'Get goals summary',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Goals summary statistics' } }
      }
    },
    '/portfolio/goals/{id}': {
      get: {
        tags: ['Portfolio Goals'],
        summary: 'Get goal details',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Goal details' } }
      },
      put: {
        tags: ['Portfolio Goals'],
        summary: 'Update goal',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Goal updated' } }
      },
      delete: {
        tags: ['Portfolio Goals'],
        summary: 'Delete goal',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Goal deleted' } }
      }
    },
    '/portfolio/goals/{id}/achieve': {
      post: {
        tags: ['Portfolio Goals'],
        summary: 'Mark goal as achieved',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Goal marked as achieved' } }
      }
    },

    // ==================== ASSET ALLOCATION ENDPOINTS ====================
    '/portfolio/allocation': {
      get: {
        tags: ['Asset Allocation'],
        summary: 'Get allocation',
        description: 'Get allocation targets vs current',
        security: [{ bearerAuth: [] }],
        responses: { 
          200: { 
            description: 'Allocation comparison',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        total_portfolio_value: { type: 'number' },
                        allocations: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/AssetAllocationResponse' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Asset Allocation'],
        summary: 'Create allocation target',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AssetAllocationTargetCreate' }
            }
          }
        },
        responses: { 
          201: { 
            description: 'Target created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' }
              }
            }
          }
        }
      }
    },
    '/portfolio/allocation/rebalance-suggestions': {
      get: {
        tags: ['Asset Allocation'],
        summary: 'Get rebalancing suggestions',
        description: 'Get automated rebalancing suggestions',
        security: [{ bearerAuth: [] }],
        responses: { 
          200: { 
            description: 'Rebalancing suggestions',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        total_portfolio_value: { type: 'number' },
                        rebalance_required: { type: 'boolean' },
                        suggestions: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/RebalanceSuggestion' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/portfolio/allocation/{id}': {
      put: {
        tags: ['Asset Allocation'],
        summary: 'Update allocation target',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Target updated' } }
      },
      delete: {
        tags: ['Asset Allocation'],
        summary: 'Delete allocation target',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Target deleted' } }
      }
    },

    // ==================== PORTFOLIO ALERTS ENDPOINTS ====================
    '/portfolio/alerts': {
      get: {
        tags: ['Portfolio Alerts'],
        summary: 'List alerts',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'alert_type', in: 'query', schema: { type: 'string' } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } }
        ],
        responses: { 
          200: { 
            description: 'Alerts list',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedResponse' }
              }
            }
          }
        }
      },
      post: {
        tags: ['Portfolio Alerts'],
        summary: 'Create alert',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PortfolioAlertCreate' }
            }
          }
        },
        responses: { 
          201: { 
            description: 'Alert created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/PortfolioAlertResponse' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/portfolio/alerts/triggered': {
      get: {
        tags: ['Portfolio Alerts'],
        summary: 'Get triggered alerts',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Active triggered alerts' } }
      }
    },
    '/portfolio/alerts/{id}': {
      get: {
        tags: ['Portfolio Alerts'],
        summary: 'Get alert details',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Alert details' } }
      },
      put: {
        tags: ['Portfolio Alerts'],
        summary: 'Update alert',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Alert updated' } }
      },
      delete: {
        tags: ['Portfolio Alerts'],
        summary: 'Delete alert',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Alert deleted' } }
      }
    },
    '/portfolio/alerts/{id}/acknowledge': {
      post: {
        tags: ['Portfolio Alerts'],
        summary: 'Acknowledge alert',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Alert acknowledged' } }
      }
    },

    // ==================== WATCHLIST ENDPOINTS ====================
    '/portfolio/watchlist': {
      get: {
        tags: ['Watchlist'],
        summary: 'List watchlist',
        description: 'Get watchlist with current prices',
        security: [{ bearerAuth: [] }],
        responses: { 
          200: { 
            description: 'Watchlist with price tracking',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/WatchlistItemResponse' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Watchlist'],
        summary: 'Add to watchlist',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/WatchlistItemCreate' }
            }
          }
        },
        responses: { 
          201: { 
            description: 'Added to watchlist',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' }
              }
            }
          }
        }
      }
    },
    '/portfolio/watchlist/{id}': {
      get: {
        tags: ['Watchlist'],
        summary: 'Get watchlist item',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Watchlist item details' } }
      },
      put: {
        tags: ['Watchlist'],
        summary: 'Update watchlist item',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Item updated' } }
      },
      delete: {
        tags: ['Watchlist'],
        summary: 'Remove from watchlist',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Removed from watchlist' } }
      }
    },

    // ==================== PORTFOLIO PERFORMANCE ENDPOINTS ====================
    '/portfolio/performance': {
      get: {
        tags: ['Portfolio Performance'],
        summary: 'Get performance history',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'start_date', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'end_date', in: 'query', schema: { type: 'string', format: 'date' } }
        ],
        responses: { 
          200: { 
            description: 'Performance history',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedResponse' }
              }
            }
          }
        }
      },
      post: {
        tags: ['Portfolio Performance'],
        summary: 'Record performance snapshot',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PortfolioPerformanceCreate' }
            }
          }
        },
        responses: { 
          201: { 
            description: 'Performance recorded',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' }
              }
            }
          }
        }
      }
    },
    '/portfolio/performance/current': {
      get: {
        tags: ['Portfolio Performance'],
        summary: 'Get current performance',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Current performance metrics' } }
      }
    },
    '/portfolio/performance/stats': {
      get: {
        tags: ['Portfolio Performance'],
        summary: 'Get performance statistics',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Performance statistics' } }
      }
    },

    // ==================== PORTFOLIO REPORTS ENDPOINTS ====================
    '/portfolio/reports': {
      get: {
        tags: ['Portfolio Reports'],
        summary: 'List reports',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'report_type', in: 'query', schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Reports list' } }
      }
    },
    '/portfolio/reports/generate': {
      post: {
        tags: ['Portfolio Reports'],
        summary: 'Generate report',
        description: 'Generate portfolio report (monthly/quarterly/yearly)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PortfolioReportGenerate' }
            }
          }
        },
        responses: { 
          201: { 
            description: 'Report generated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/PortfolioReportResponse' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/portfolio/reports/{id}': {
      get: {
        tags: ['Portfolio Reports'],
        summary: 'Get report details',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Report details' } }
      },
      delete: {
        tags: ['Portfolio Reports'],
        summary: 'Delete report',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Report deleted' } }
      }
    },

    // ==================== PORTFOLIO OVERVIEW ENDPOINTS ====================
    '/portfolio/overview': {
      get: {
        tags: ['Portfolio Overview'],
        summary: 'Get portfolio overview',
        description: 'Comprehensive portfolio overview',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Portfolio overview' } }
      }
    },
    '/portfolio/overview/dashboard': {
      get: {
        tags: ['Portfolio Overview'],
        summary: 'Get dashboard summary',
        description: 'Dashboard with key metrics',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Dashboard summary' } }
      }
    },
    '/portfolio/overview/analytics/sector-allocation': {
      get: {
        tags: ['Portfolio Overview'],
        summary: 'Get sector allocation',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Sector-wise breakdown' } }
      }
    },
    '/portfolio/overview/analytics/asset-type-distribution': {
      get: {
        tags: ['Portfolio Overview'],
        summary: 'Get asset type distribution',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Asset type distribution' } }
      }
    },

    // ==================== USER PROFILE ENDPOINTS ====================
    '/profile': {
      get: {
        tags: ['User Profile'],
        summary: 'Get user profile',
        security: [{ bearerAuth: [] }],
        responses: { 
          200: { 
            description: 'User profile',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/UserProfileResponse' }
                  }
                }
              }
            }
          }
        }
      },
      put: {
        tags: ['User Profile'],
        summary: 'Update profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserProfileUpdate' }
            }
          }
        },
        responses: { 
          200: { 
            description: 'Profile updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/UserProfileResponse' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/profile/preferences': {
      get: {
        tags: ['User Profile'],
        summary: 'Get preferences',
        security: [{ bearerAuth: [] }],
        responses: { 
          200: { 
            description: 'User preferences',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/UserPreferences' }
                  }
                }
              }
            }
          }
        }
      },
      put: {
        tags: ['User Profile'],
        summary: 'Update preferences',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserPreferences' }
            }
          }
        },
        responses: { 
          200: { 
            description: 'Preferences updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/UserPreferences' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
