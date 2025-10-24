import { relations } from 'drizzle-orm';
import { users, userProfiles, userPreferences } from './schemas/users.schema';
import { 
  brokers, 
  userBrokerAccounts, 
  securities, 
  securityPrices, 
  userSecurityHoldings, 
  securityTransactions 
} from './schemas/brokers-securities.schema';
import { 
  banks, 
  userBankAccounts, 
  fixedDeposits, 
  fdInterestPayments, 
  recurringDeposits, 
  rdInstallments, 
  bankTransactions 
} from './schemas/banks-deposits.schema';
import { 
  assetCategories, 
  assetSubcategories, 
  userAssets, 
  assetValuations, 
  assetTransactions, 
  realEstateDetails, 
  goldDetails, 
  assetPriceIndices 
} from './schemas/assets.schema';
import { 
  portfolioSummary, 
  portfolioPerformance, 
  portfolioGoals, 
  assetAllocationTargets, 
  portfolioAlerts, 
  portfolioReports, 
  userWatchlist, 
  portfolioTransactionsLog 
} from './schemas/portfolio.schema';

// =====================================================
// User Relations
// =====================================================

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.user_id],
    references: [userProfiles.user_id]
  }),
  preferences: one(userPreferences, {
    fields: [users.user_id],
    references: [userPreferences.user_id]
  }),
  brokerAccounts: many(userBrokerAccounts),
  securityHoldings: many(userSecurityHoldings),
  securityTransactions: many(securityTransactions),
  bankAccounts: many(userBankAccounts),
  fixedDeposits: many(fixedDeposits),
  recurringDeposits: many(recurringDeposits),
  assets: many(userAssets),
  assetTransactions: many(assetTransactions),
  portfolioSummaries: many(portfolioSummary),
  portfolioPerformances: many(portfolioPerformance),
  portfolioGoals: many(portfolioGoals),
  assetAllocationTargets: many(assetAllocationTargets),
  portfolioAlerts: many(portfolioAlerts),
  portfolioReports: many(portfolioReports),
  watchlist: many(userWatchlist),
  transactionLogs: many(portfolioTransactionsLog)
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.user_id],
    references: [users.user_id]
  })
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.user_id],
    references: [users.user_id]
  })
}));

// =====================================================
// Broker & Securities Relations
// =====================================================

export const brokersRelations = relations(brokers, ({ many }) => ({
  userAccounts: many(userBrokerAccounts)
}));

export const userBrokerAccountsRelations = relations(userBrokerAccounts, ({ one, many }) => ({
  user: one(users, {
    fields: [userBrokerAccounts.user_id],
    references: [users.user_id]
  }),
  broker: one(brokers, {
    fields: [userBrokerAccounts.broker_id],
    references: [brokers.broker_id]
  }),
  holdings: many(userSecurityHoldings),
  transactions: many(securityTransactions)
}));

export const securitiesRelations = relations(securities, ({ many }) => ({
  prices: many(securityPrices),
  holdings: many(userSecurityHoldings),
  transactions: many(securityTransactions),
  watchlist: many(userWatchlist)
}));

export const securityPricesRelations = relations(securityPrices, ({ one }) => ({
  security: one(securities, {
    fields: [securityPrices.security_id],
    references: [securities.security_id]
  })
}));

export const userSecurityHoldingsRelations = relations(userSecurityHoldings, ({ one }) => ({
  user: one(users, {
    fields: [userSecurityHoldings.user_id],
    references: [users.user_id]
  }),
  account: one(userBrokerAccounts, {
    fields: [userSecurityHoldings.account_id],
    references: [userBrokerAccounts.account_id]
  }),
  security: one(securities, {
    fields: [userSecurityHoldings.security_id],
    references: [securities.security_id]
  })
}));

export const securityTransactionsRelations = relations(securityTransactions, ({ one }) => ({
  user: one(users, {
    fields: [securityTransactions.user_id],
    references: [users.user_id]
  }),
  account: one(userBrokerAccounts, {
    fields: [securityTransactions.account_id],
    references: [userBrokerAccounts.account_id]
  }),
  security: one(securities, {
    fields: [securityTransactions.security_id],
    references: [securities.security_id]
  })
}));

// =====================================================
// Bank & Deposits Relations
// =====================================================

export const banksRelations = relations(banks, ({ many }) => ({
  userAccounts: many(userBankAccounts)
}));

export const userBankAccountsRelations = relations(userBankAccounts, ({ one, many }) => ({
  user: one(users, {
    fields: [userBankAccounts.user_id],
    references: [users.user_id]
  }),
  bank: one(banks, {
    fields: [userBankAccounts.bank_id],
    references: [banks.bank_id]
  }),
  fixedDeposits: many(fixedDeposits),
  recurringDeposits: many(recurringDeposits),
  transactions: many(bankTransactions)
}));

export const fixedDepositsRelations = relations(fixedDeposits, ({ one, many }) => ({
  user: one(users, {
    fields: [fixedDeposits.user_id],
    references: [users.user_id]
  }),
  account: one(userBankAccounts, {
    fields: [fixedDeposits.account_id],
    references: [userBankAccounts.account_id]
  }),
  interestPayments: many(fdInterestPayments),
  transactions: many(bankTransactions)
}));

export const fdInterestPaymentsRelations = relations(fdInterestPayments, ({ one }) => ({
  fixedDeposit: one(fixedDeposits, {
    fields: [fdInterestPayments.fd_id],
    references: [fixedDeposits.fd_id]
  })
}));

export const recurringDepositsRelations = relations(recurringDeposits, ({ one, many }) => ({
  user: one(users, {
    fields: [recurringDeposits.user_id],
    references: [users.user_id]
  }),
  account: one(userBankAccounts, {
    fields: [recurringDeposits.account_id],
    references: [userBankAccounts.account_id]
  }),
  installments: many(rdInstallments),
  transactions: many(bankTransactions)
}));

export const rdInstallmentsRelations = relations(rdInstallments, ({ one }) => ({
  recurringDeposit: one(recurringDeposits, {
    fields: [rdInstallments.rd_id],
    references: [recurringDeposits.rd_id]
  })
}));

export const bankTransactionsRelations = relations(bankTransactions, ({ one }) => ({
  user: one(users, {
    fields: [bankTransactions.user_id],
    references: [users.user_id]
  }),
  account: one(userBankAccounts, {
    fields: [bankTransactions.account_id],
    references: [userBankAccounts.account_id]
  }),
  fixedDeposit: one(fixedDeposits, {
    fields: [bankTransactions.related_fd_id],
    references: [fixedDeposits.fd_id]
  }),
  recurringDeposit: one(recurringDeposits, {
    fields: [bankTransactions.related_rd_id],
    references: [recurringDeposits.rd_id]
  })
}));

// =====================================================
// Assets Relations
// =====================================================

export const assetCategoriesRelations = relations(assetCategories, ({ many }) => ({
  subcategories: many(assetSubcategories),
  assets: many(userAssets),
  priceIndices: many(assetPriceIndices)
}));

export const assetSubcategoriesRelations = relations(assetSubcategories, ({ one, many }) => ({
  category: one(assetCategories, {
    fields: [assetSubcategories.category_id],
    references: [assetCategories.category_id]
  }),
  assets: many(userAssets),
  priceIndices: many(assetPriceIndices)
}));

export const userAssetsRelations = relations(userAssets, ({ one, many }) => ({
  user: one(users, {
    fields: [userAssets.user_id],
    references: [users.user_id]
  }),
  category: one(assetCategories, {
    fields: [userAssets.category_id],
    references: [assetCategories.category_id]
  }),
  subcategory: one(assetSubcategories, {
    fields: [userAssets.subcategory_id],
    references: [assetSubcategories.subcategory_id]
  }),
  valuations: many(assetValuations),
  transactions: many(assetTransactions),
  realEstateDetail: one(realEstateDetails, {
    fields: [userAssets.asset_id],
    references: [realEstateDetails.asset_id]
  }),
  goldDetail: one(goldDetails, {
    fields: [userAssets.asset_id],
    references: [goldDetails.asset_id]
  })
}));

export const assetValuationsRelations = relations(assetValuations, ({ one }) => ({
  asset: one(userAssets, {
    fields: [assetValuations.asset_id],
    references: [userAssets.asset_id]
  })
}));

export const assetTransactionsRelations = relations(assetTransactions, ({ one }) => ({
  user: one(users, {
    fields: [assetTransactions.user_id],
    references: [users.user_id]
  }),
  asset: one(userAssets, {
    fields: [assetTransactions.asset_id],
    references: [userAssets.asset_id]
  })
}));

export const realEstateDetailsRelations = relations(realEstateDetails, ({ one }) => ({
  asset: one(userAssets, {
    fields: [realEstateDetails.asset_id],
    references: [userAssets.asset_id]
  })
}));

export const goldDetailsRelations = relations(goldDetails, ({ one }) => ({
  asset: one(userAssets, {
    fields: [goldDetails.asset_id],
    references: [userAssets.asset_id]
  })
}));

export const assetPriceIndicesRelations = relations(assetPriceIndices, ({ one }) => ({
  category: one(assetCategories, {
    fields: [assetPriceIndices.category_id],
    references: [assetCategories.category_id]
  }),
  subcategory: one(assetSubcategories, {
    fields: [assetPriceIndices.subcategory_id],
    references: [assetSubcategories.subcategory_id]
  })
}));

// =====================================================
// Portfolio Relations
// =====================================================

export const portfolioSummaryRelations = relations(portfolioSummary, ({ one }) => ({
  user: one(users, {
    fields: [portfolioSummary.user_id],
    references: [users.user_id]
  })
}));

export const portfolioPerformanceRelations = relations(portfolioPerformance, ({ one }) => ({
  user: one(users, {
    fields: [portfolioPerformance.user_id],
    references: [users.user_id]
  })
}));

export const portfolioGoalsRelations = relations(portfolioGoals, ({ one }) => ({
  user: one(users, {
    fields: [portfolioGoals.user_id],
    references: [users.user_id]
  })
}));

export const assetAllocationTargetsRelations = relations(assetAllocationTargets, ({ one }) => ({
  user: one(users, {
    fields: [assetAllocationTargets.user_id],
    references: [users.user_id]
  })
}));

export const portfolioAlertsRelations = relations(portfolioAlerts, ({ one }) => ({
  user: one(users, {
    fields: [portfolioAlerts.user_id],
    references: [users.user_id]
  })
}));

export const portfolioReportsRelations = relations(portfolioReports, ({ one }) => ({
  user: one(users, {
    fields: [portfolioReports.user_id],
    references: [users.user_id]
  })
}));

export const userWatchlistRelations = relations(userWatchlist, ({ one }) => ({
  user: one(users, {
    fields: [userWatchlist.user_id],
    references: [users.user_id]
  }),
  security: one(securities, {
    fields: [userWatchlist.security_id],
    references: [securities.security_id]
  })
}));

export const portfolioTransactionsLogRelations = relations(portfolioTransactionsLog, ({ one }) => ({
  user: one(users, {
    fields: [portfolioTransactionsLog.user_id],
    references: [users.user_id]
  })
}));

