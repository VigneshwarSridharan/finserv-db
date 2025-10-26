<!-- 5497d504-0d42-40e0-845b-5c5cb3559025 d57eccd2-8855-403e-aeda-d2e56a3fc9cb -->
# Portfolio Management React PWA Implementation

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Chakra UI v3 (modern, accessible, lightweight)
- **State Management**: Zustand (lightweight, simple)
- **API Client**: Axios + React Query (TanStack Query)
- **Charts**: Recharts (React-native, simple)
- **Routing**: React Router v6
- **PWA**: Vite PWA Plugin (Workbox)
- **Forms**: React Hook Form + Zod validation
- **Date**: date-fns
- **Icons**: React Icons

## Project Structure

```
frontend/
├── public/
│   ├── manifest.json
│   ├── icons/ (PWA icons 192x192, 512x512)
│   └── robots.txt
├── src/
│   ├── api/             # API client & services
│   ├── components/      # Reusable components
│   │   ├── common/      # Buttons, inputs, cards
│   │   ├── layout/      # Header, sidebar, footer
│   │   └── charts/      # Chart components
│   ├── features/        # Feature-specific components
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── securities/
│   │   ├── banking/
│   │   ├── assets/
│   │   ├── portfolio/
│   │   └── profile/
│   ├── hooks/           # Custom React hooks
│   ├── store/           # Zustand stores
│   ├── types/           # TypeScript types
│   ├── utils/           # Helper functions
│   ├── theme/           # Chakra UI theme
│   ├── routes/          # Route configuration
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Implementation Phases

### Phase 1: Project Setup & Infrastructure

**1.1 Initialize React + TypeScript + Vite Project**

- Create `frontend` directory at project root
- Run `yarn create vite frontend --template react-ts`
- Install core dependencies: `react-router-dom`, `@chakra-ui/react`, `@emotion/react`, `@emotion/styled`, `framer-motion`

**1.2 Install Additional Dependencies**

```bash
# State & API
yarn add zustand axios @tanstack/react-query

# Forms & Validation
yarn add react-hook-form zod @hookform/resolvers

# PWA
yarn add -D vite-plugin-pwa

# Charts & Utils
yarn add recharts react-icons date-fns

# Additional
yarn add jwt-decode
```

**1.3 Configure Vite for PWA**

- Update `vite.config.ts` with PWA plugin
- Configure service worker (network-first strategy)
- Set up manifest.json with app metadata

**1.4 Setup Chakra UI Theme**

- Create `src/theme/index.ts` with custom theme
- Configure colors, fonts, component styles
- Add light/dark mode support
- Set up responsive breakpoints

### Phase 2: Core Infrastructure

**2.1 API Client Setup**

- Create `src/api/client.ts` with Axios instance
- Add request/response interceptors for JWT
- Configure base URL from environment variables
- Add error handling and retry logic

**2.2 API Service Layer**

Create service files for each domain:

- `src/api/services/auth.service.ts` - login, register
- `src/api/services/portfolio.service.ts` - portfolio summary
- `src/api/services/securities.service.ts` - brokers, securities, holdings, transactions
- `src/api/services/banking.service.ts` - banks, accounts, FDs, RDs
- `src/api/services/assets.service.ts` - assets, real estate, gold
- `src/api/services/portfolio-features.service.ts` - goals, alerts, watchlist
- `src/api/services/user.service.ts` - profile, preferences

**2.3 React Query Setup**

- Create `src/api/queryClient.ts` with TanStack Query config
- Set up caching strategies (5 min stale time)
- Configure refetch on window focus
- Add query keys factory pattern

**2.4 Zustand Store Setup**

Create stores:

- `src/store/authStore.ts` - user, token, login/logout
- `src/store/themeStore.ts` - color mode toggle
- `src/store/navigationStore.ts` - mobile menu state
- `src/store/filterStore.ts` - global filters (date ranges, search)

**2.5 TypeScript Types**

- Create `src/types/api.types.ts` - API response types
- Create `src/types/domain.types.ts` - User, Portfolio, Security, etc.
- Import and adapt types from backend (`backend/src/types/index.ts`)

### Phase 3: Authentication & Layout

**3.1 Auth Components**

- `features/auth/LoginPage.tsx` - login form
- `features/auth/RegisterPage.tsx` - registration form
- `components/common/PrivateRoute.tsx` - protected route wrapper
- Add form validation with Zod schemas

**3.2 Layout Components**

- `components/layout/AppLayout.tsx` - main app shell
- `components/layout/Header.tsx` - top navbar with user menu
- `components/layout/Sidebar.tsx` - desktop sidebar navigation
- `components/layout/MobileNav.tsx` - mobile bottom navigation
- `components/layout/PageContainer.tsx` - page wrapper with padding

**3.3 Routing Setup**

- Create `src/routes/index.tsx` with React Router v6
- Define routes for all pages
- Add nested routes for details pages
- Implement 404 page

**3.4 Responsive Navigation**

- Desktop: Sidebar + Header
- Mobile: Bottom navigation bar (4-5 main items)
- Responsive breakpoints: `base` (mobile), `md` (tablet), `lg` (desktop)

### Phase 4: Dashboard & Portfolio Overview

**4.1 Dashboard Page**

- `features/dashboard/DashboardPage.tsx` - main dashboard
- Portfolio summary cards (total value, P&L, returns)
- Asset allocation pie chart (Recharts)
- Recent transactions list
- Quick actions (add transaction, view holdings)

**4.2 Portfolio Overview**

- `features/portfolio/OverviewPage.tsx` - detailed portfolio view
- Use `/portfolio/overview` endpoint
- Asset breakdown table
- Performance chart (line chart with time ranges)
- Asset allocation chart

**4.3 Portfolio Summary**

- `features/portfolio/SummaryPage.tsx` - portfolio summary by asset type
- Use `/portfolios` endpoint
- Editable summary cards
- Create/update portfolio summary

**4.4 Charts Components**

- `components/charts/PieChart.tsx` - asset allocation
- `components/charts/LineChart.tsx` - performance over time
- `components/charts/BarChart.tsx` - comparisons
- Responsive chart sizing

### Phase 5: Securities Domain (32 Endpoints)

**5.1 Brokers Management**

- `features/securities/BrokersPage.tsx` - list brokers
- `features/securities/BrokerForm.tsx` - create/edit broker
- API: `/brokers` (GET, POST, PUT, DELETE)

**5.2 Securities Management**

- `features/securities/SecuritiesPage.tsx` - list securities with search
- `features/securities/SecurityDetailPage.tsx` - security details + price history
- `features/securities/SecurityForm.tsx` - add/edit security
- API: `/securities`, `/securities/:id`, `/securities/search`

**5.3 Security Prices**

- `features/securities/PriceHistoryPage.tsx` - price chart
- `features/securities/PriceForm.tsx` - add price manually
- `features/securities/BulkPriceUpload.tsx` - CSV upload for bulk prices
- API: `/securities/:securityId/prices`, `/securities/prices/bulk`

**5.4 Broker Accounts**

- `features/securities/BrokerAccountsPage.tsx` - user's broker accounts
- `features/securities/BrokerAccountForm.tsx` - link broker account
- API: `/accounts/brokers`

**5.5 Security Holdings**

- `features/securities/HoldingsPage.tsx` - current holdings with P&L
- `features/securities/HoldingDetailPage.tsx` - holding details
- Summary cards: total investment, current value, unrealized P&L
- Holdings table with sorting/filtering
- API: `/holdings/securities`, `/holdings/securities/summary`

**5.6 Security Transactions**

- `features/securities/TransactionsPage.tsx` - transaction history
- `features/securities/TransactionForm.tsx` - add buy/sell transaction
- `features/securities/BulkTransactionUpload.tsx` - CSV import
- Transaction types: BUY, SELL, DIVIDEND, BONUS, SPLIT
- API: `/transactions/securities`, `/transactions/securities/bulk`

### Phase 6: Banking Domain (21 Endpoints)

**6.1 Banks Management**

- `features/banking/BanksPage.tsx` - list banks
- `features/banking/BankForm.tsx` - add bank
- API: `/banks`

**6.2 Bank Accounts**

- `features/banking/BankAccountsPage.tsx` - user's bank accounts
- `features/banking/BankAccountForm.tsx` - add/edit account
- Account types: SAVINGS, CURRENT, SALARY
- API: `/accounts/banks`

**6.3 Fixed Deposits**

- `features/banking/FixedDepositsPage.tsx` - FD list with maturity status
- `features/banking/FDDetailPage.tsx` - FD details + interest history
- `features/banking/FDForm.tsx` - create FD
- Status indicators: ACTIVE, MATURED, CLOSED
- API: `/deposits/fixed`, `/deposits/fixed/:id/interest-payments`

**6.4 Recurring Deposits**

- `features/banking/RecurringDepositsPage.tsx` - RD list
- `features/banking/RDDetailPage.tsx` - RD details + installments
- `features/banking/RDForm.tsx` - create RD
- `features/banking/InstallmentPaymentForm.tsx` - record payment
- API: `/deposits/recurring`, `/deposits/recurring/:id/installments`

**6.5 Bank Transactions**

- `features/banking/BankTransactionsPage.tsx` - transaction history
- `features/banking/BankTransactionForm.tsx` - add transaction
- Filter by account, date range, type
- API: `/transactions/bank`

### Phase 7: Assets Domain (18 Endpoints)

**7.1 Asset Categories**

- `features/assets/CategoriesPage.tsx` - manage categories
- `features/assets/CategoryForm.tsx` - add/edit category
- API: `/assets/categories`

**7.2 Assets Management**

- `features/assets/AssetsPage.tsx` - list all assets
- `features/assets/AssetDetailPage.tsx` - asset details
- `features/assets/AssetForm.tsx` - add/edit asset
- Asset types: REAL_ESTATE, GOLD, VEHICLE, OTHER
- API: `/assets`

**7.3 Real Estate**

- `features/assets/RealEstateDetailPage.tsx` - property details
- `features/assets/RealEstateForm.tsx` - add property details
- Fields: address, area, property type, purchase price
- API: `/assets/:assetId/real-estate`

**7.4 Gold Assets**

- `features/assets/GoldDetailPage.tsx` - gold details
- `features/assets/GoldForm.tsx` - add gold details
- Fields: weight, purity, form (BAR, COIN, JEWELRY)
- API: `/assets/:assetId/gold`

**7.5 Asset Valuations**

- `features/assets/ValuationsPage.tsx` - valuation history
- `features/assets/ValuationForm.tsx` - add valuation
- Chart showing value over time
- API: `/assets/:assetId/valuations`

**7.6 Asset Transactions**

- `features/assets/AssetTransactionsPage.tsx` - asset transactions
- `features/assets/AssetTransactionForm.tsx` - record transaction
- Transaction types: PURCHASE, SALE, MAINTENANCE
- API: `/transactions/assets`

### Phase 8: Portfolio Features (22 Endpoints)

**8.1 Portfolio Goals**

- `features/portfolio/GoalsPage.tsx` - goals list with progress bars
- `features/portfolio/GoalForm.tsx` - create/edit goal
- Goal types: RETIREMENT, EDUCATION, EMERGENCY, CUSTOM
- Progress visualization
- API: `/portfolio/goals`

**8.2 Asset Allocation**

- `features/portfolio/AllocationPage.tsx` - target vs current allocation
- `features/portfolio/AllocationForm.tsx` - set allocation targets
- Deviation warnings
- Rebalancing suggestions
- API: `/portfolio/allocation`

**8.3 Portfolio Alerts**

- `features/portfolio/AlertsPage.tsx` - active alerts
- `features/portfolio/AlertForm.tsx` - create alert
- Alert types: PRICE_TARGET, STOP_LOSS, MATURITY_DATE, REBALANCE
- Notification badges
- API: `/portfolio/alerts`

**8.4 Watchlist**

- `features/portfolio/WatchlistPage.tsx` - watched securities
- `features/portfolio/WatchlistForm.tsx` - add to watchlist
- Price change indicators
- Quick buy action
- API: `/portfolio/watchlist`

**8.5 Portfolio Performance**

- `features/portfolio/PerformancePage.tsx` - performance analytics
- Time period filters (1W, 1M, 3M, 6M, 1Y, ALL)
- Performance charts (line, bar)
- Benchmark comparison
- API: `/portfolio/performance`

**8.6 Portfolio Reports**

- `features/portfolio/ReportsPage.tsx` - report generator
- Report types: SUMMARY, TAX, GAINS, DETAILED
- Date range selection
- Export to PDF/CSV
- API: `/portfolio/reports`

### Phase 9: User Profile

**9.1 User Profile Pages**

- `features/profile/ProfilePage.tsx` - view/edit profile
- `features/profile/PreferencesPage.tsx` - user preferences
- Update email, phone, password
- Notification preferences
- API: `/profile`, `/profile/preferences`

### Phase 10: Common Components

**10.1 Reusable Components**

- `components/common/DataTable.tsx` - sortable, filterable table
- `components/common/StatCard.tsx` - metric display card
- `components/common/FormField.tsx` - form input wrapper
- `components/common/LoadingSpinner.tsx` - loading states
- `components/common/EmptyState.tsx` - no data placeholder
- `components/common/ErrorBoundary.tsx` - error handling
- `components/common/ConfirmDialog.tsx` - action confirmation
- `components/common/SearchBar.tsx` - search input
- `components/common/DateRangePicker.tsx` - date range filter
- `components/common/FileUpload.tsx` - CSV upload component

**10.2 Form Components**

- All forms use React Hook Form + Zod validation
- Consistent error display
- Loading states on submit
- Success/error toasts (Chakra UI toast)

### Phase 11: PWA Configuration

**11.1 Service Worker Setup**

- Configure Vite PWA plugin in `vite.config.ts`
- Strategy: Network-first with cache fallback
- Cache API responses for 5 minutes
- Cache static assets (JS, CSS, images) permanently
- Offline fallback page

**11.2 Manifest Configuration**

- `public/manifest.json` with app metadata
- App name: "Portfolio Manager"
- Icons: 192x192, 512x512 (maskable + any)
- Theme color, background color
- Start URL, display: standalone
- Orientation: any

**11.3 PWA Icons**

- Generate icon set (192x192, 512x512)
- Create favicon.ico
- Add apple-touch-icon
- Place in `public/icons/`

**11.4 Install Prompt**

- Create `components/common/InstallPrompt.tsx`
- Show install banner on mobile
- Handle beforeinstallprompt event
- Dismiss and don't show again option

### Phase 12: Mobile Optimization

**12.1 Responsive Design**

- All components use Chakra UI responsive props
- Mobile-first approach with breakpoints
- Touch-friendly targets (44px minimum)
- Swipe gestures for navigation

**12.2 Mobile Navigation**

- Bottom tab bar for mobile
- Tabs: Home, Holdings, Transactions, Portfolio, Profile
- Active tab highlighting
- Badge notifications

**12.3 Mobile-Specific Features**

- Pull-to-refresh on lists
- Infinite scroll for long lists
- Mobile-optimized forms (full-screen modals)
- Native-like transitions

**12.4 Performance Optimization**

- Lazy load routes with React.lazy()
- Code splitting by route
- Image optimization
- Virtual scrolling for large tables

### Phase 13: Additional Features

**13.1 Search & Filters**

- Global search bar in header
- Filter panels for all list pages
- Persist filters in URL query params
- Clear filters button

**13.2 Bulk Operations**

- CSV import components
- CSV template downloads
- Bulk delete with selection
- Progress indicators

**13.3 Notifications**

- Toast notifications for actions
- Alert badges in navigation
- Push notifications (optional)

**13.4 Theme & Customization**

- Light/dark mode toggle in header
- Persist theme preference
- Custom color schemes
- Font size options

### Phase 14: Testing & Polish

**14.1 Error Handling**

- API error handling with retry
- Form validation errors
- Network error states
- Offline mode indicators

**14.2 Loading States**

- Skeleton loaders for data
- Loading spinners for actions
- Optimistic UI updates

**14.3 Accessibility**

- ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management

**14.4 Final Polish**

- Consistent spacing and sizing
- Animation and transitions
- Loading performance
- Browser compatibility testing

## Environment Variables

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=Portfolio Manager
VITE_APP_VERSION=1.0.0
```

## Key Implementation Notes

1. **Backend Integration**: All API calls to `http://localhost:3000` with JWT auth
2. **Authentication**: Store JWT in localStorage, add to Axios headers
3. **Offline Support**: Cache GET requests, queue POST/PUT/DELETE for sync
4. **Mobile UI**: Native-like experience with bottom navigation and full-screen modals
5. **Charts**: Recharts for all visualizations (pie, line, bar charts)
6. **Forms**: React Hook Form with Zod validation matching backend schemas
7. **State**: Zustand for auth/theme/UI state, React Query for server state
8. **Responsive**: Chakra UI breakpoints - `base` (mobile), `md` (tablet), `lg` (desktop)

## Development Workflow

1. Setup project structure and install dependencies
2. Configure Chakra UI theme and PWA
3. Build auth flow and layout
4. Implement each domain incrementally
5. Add charts and visualizations
6. Configure PWA and test offline
7. Mobile optimization and responsive testing
8. Final polish and production build

## Success Criteria

- ✅ All 50+ backend endpoints integrated
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ PWA installable with offline support
- ✅ Light/dark mode support
- ✅ Mobile-native feel on touch devices
- ✅ Fast loading (< 3s initial load)
- ✅ Accessible (WCAG 2.1 AA)
- ✅ Production-ready build

### To-dos

- [ ] Initialize React + TypeScript + Vite project with all dependencies
- [ ] Setup Chakra UI theme, PWA plugin, and TypeScript config
- [ ] Create API client, service layer, and React Query setup
- [ ] Setup Zustand stores for auth, theme, navigation, filters
- [ ] Create TypeScript types for all API models and responses
- [ ] Implement login, register, and protected routes
- [ ] Build app layout with header, sidebar, and mobile navigation
- [ ] Setup React Router with all routes and nested routes
- [ ] Create dashboard and portfolio overview pages with charts
- [ ] Implement all securities features (brokers, securities, holdings, transactions)
- [ ] Implement banking features (banks, accounts, FDs, RDs, transactions)
- [ ] Implement assets domain (categories, assets, real estate, gold, valuations)
- [ ] Implement portfolio features (goals, alerts, watchlist, performance, reports)
- [ ] Create user profile and preferences pages
- [ ] Build reusable components (tables, cards, forms, charts)
- [ ] Configure PWA manifest, service worker, and install prompt
- [ ] Optimize for mobile with bottom navigation and touch interactions
- [ ] Implement Recharts components for all data visualizations
- [ ] Add CSV upload and bulk import features
- [ ] Implement comprehensive error handling and loading states
- [ ] Add ARIA labels, keyboard navigation, and screen reader support
- [ ] Final testing, performance optimization, and production build