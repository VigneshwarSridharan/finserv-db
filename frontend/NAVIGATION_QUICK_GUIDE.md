# Navigation Quick Guide

## 🎯 What's New

### Breadcrumb Navigation (NEW! ✨)
```
┌─────────────────────────────────────────┐
│ ☰ Portfolio Manager          👤 ⚙️     │  ← Header
├─────────────────────────────────────────┤
│ 🏠 > Securities > Brokers               │  ← Breadcrumbs (clickable!)
├─────────────────────────────────────────┤
│                                         │
│         Page Content Here               │
│                                         │
└─────────────────────────────────────────┘
```

### Desktop Experience
```
┌─────────────────────────────────────────┐
│ ☰ Portfolio Manager          👤 ⚙️     │  ← Header with toggle
├─────────────────────────────────────────┤
│ Sidebar │                               │
│         │                               │
│ 🏠 Dashboard                           │
│                                        │
│ 📈 Securities        ▼                 │  ← Click to expand
│   📊 Overview                          │
│   💼 Brokers                           │
│   🛒 Holdings                          │
│   🔄 Transactions                      │
│                                        │
│ 💰 Banking          ▶                  │  ← Click to expand
│                                        │
│ 📦 Assets           ▶                  │
│                                        │
│ 🥧 Portfolio        ▶                  │
│                                        │
│ 👤 Profile                             │
└─────────────────────────────────────────┘
```

### Mobile Experience

#### Bottom Navigation (Always Visible)
```
┌─────────────────────────────────────────┐
│                                         │
│          Main Content Area              │
│                                         │
├─────────────────────────────────────────┤
│ 🏠    📈    💰    📦    🥧             │  ← Tap for quick navigation
│ Home  Sec   Bank  Asset Port            │
└─────────────────────────────────────────┘
```

#### Hamburger Menu (Slide-in Drawer)
```
┌─────────────────────────────────────────┐
│ ☰ Portfolio Manager          👤        │  ← Tap ☰ to open drawer
├─────────────────────────────────────────┤
│ Menu                          ✕         │
│                                         │
│ 🏠 Dashboard                            │
│                                         │
│ 📈 Securities                     ▼     │
│   📊 Overview                           │
│   💼 Brokers                            │
│   🛒 Holdings                           │
│   🔄 Transactions                       │
│                                         │
│ 💰 Banking                        ▶     │
│ 📦 Assets                         ▶     │
│ 🥧 Portfolio                      ▶     │
│ 👤 Profile                              │
└─────────────────────────────────────────┘
```

## 🚀 Key Features

### 1. **Breadcrumb Navigation** ✨ NEW!
Always know where you are and navigate back easily!
- **Home Icon**: Click 🏠 to return to dashboard
- **Clickable Path**: Click any breadcrumb to jump back
- **Current Page**: Shown in bold (last item)
- **Dynamic**: Updates automatically as you navigate

**Examples:**
- Dashboard: `🏠 Dashboard`
- Brokers: `🏠 > Securities > Brokers`
- Fixed Deposits: `🏠 > Banking > Fixed Deposits`

### 2. **Smart Auto-Expand**
When you navigate to a sub-page (e.g., `/securities/brokers`), the Securities section automatically expands to show you where you are.

### 3. **Collapsible Sections**
Click on any main section (Securities, Banking, Assets, Portfolio) to expand/collapse its sub-items.

### 4. **Dual Mobile Navigation**
- **Quick Access**: Bottom nav bar for main sections
- **Full Access**: Hamburger menu for all pages

### 5. **Visual Indicators**
- ▼ = Expanded section
- ▶ = Collapsed section
- Highlighted = Active page

## 📱 How to Use

### On Desktop
1. Click the menu icon (☰) to collapse/expand sidebar
2. Click section names to expand/collapse sub-items
3. Click any link to navigate

### On Mobile
1. **Quick Navigation**: Tap bottom nav icons
2. **Full Menu**: Tap ☰ in header for drawer menu
3. **Navigate**: Tap any item to go to that page
4. **Auto-Close**: Drawer closes automatically after navigation

## 🎨 Navigation Map

### All Available Pages

**Dashboard**
- `/dashboard` - Main dashboard

**Securities**
- `/securities` - Securities overview
- `/securities/brokers` - Manage brokers
- `/securities/holdings` - View holdings
- `/securities/transactions` - Transaction history

**Banking**
- `/banking` - Banking overview
- `/banking/accounts` - Bank accounts
- `/banking/fixed-deposits` - Fixed deposits
- `/banking/recurring-deposits` - Recurring deposits

**Assets**
- `/assets` - Assets overview
- `/assets/list` - All assets list
- `/assets/categories` - Asset categories

**Portfolio**
- `/portfolio` - Portfolio overview
- `/portfolio/goals` - Financial goals
- `/portfolio/alerts` - Portfolio alerts
- `/portfolio/watchlist` - Watchlist

**Profile**
- `/profile` - User profile

## ✨ Tips

1. **Quick Back Navigation**: Use breadcrumbs to quickly jump back to parent sections
2. **Keyboard Navigation**: Use Tab to navigate through menu items
3. **Breadcrumb Navigation**: Click any breadcrumb item to jump to that page
4. **Persistent State**: Section expand/collapse state is remembered during your session
5. **Active Highlights**: Current page is always highlighted in sidebar and breadcrumbs
6. **Responsive**: Layout adapts automatically to your screen size
7. **Touch-Friendly**: All buttons are sized for easy mobile interaction

## 🔧 Customization

Want to modify the navigation? Edit these files:
- `frontend/src/components/layout/Sidebar.tsx` - Desktop sidebar
- `frontend/src/components/layout/MobileDrawer.tsx` - Mobile drawer
- `frontend/src/components/layout/MobileNav.tsx` - Bottom navigation
- `frontend/src/components/layout/Header.tsx` - Top header
- `frontend/src/components/common/Breadcrumbs.tsx` - Breadcrumb navigation

**Menu Structure**: Defined in the `menuItems` array in both `Sidebar.tsx` and `MobileDrawer.tsx`
**Breadcrumb Labels**: Defined in the `routeLabels` object in `Breadcrumbs.tsx`


