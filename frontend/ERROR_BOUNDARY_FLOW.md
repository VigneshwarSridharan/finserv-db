# Error Boundary Flow Diagram

## Error Boundary Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                           App.tsx                                │
│                    <ErrorBoundary>                               │
│                  (App-Level Protection)                          │
│                                                                   │
│  Catches: Catastrophic errors, Router crashes                    │
│  Behavior: Full-page error screen, reload or go to dashboard     │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    <Router>                               │  │
│  │                                                            │  │
│  │  ┌──────────────────────────────────────────────────┐    │  │
│  │  │              AppLayout.tsx                        │    │  │
│  │  │                                                    │    │  │
│  │  │  ┌──────────┐  ┌──────────────────────────────┐  │    │  │
│  │  │  │  Header  │  │    <RouteErrorBoundary>      │  │    │  │
│  │  │  └──────────┘  │  (Outlet-Level Protection)    │  │    │  │
│  │  │                │                                │  │    │  │
│  │  │  ┌──────────┐  │  Catches: Route render errors │  │    │  │
│  │  │  │          │  │  Behavior: Error within layout│  │    │  │
│  │  │  │ Sidebar  │  │            keeps header/nav   │  │    │  │
│  │  │  │          │  │                                │  │    │  │
│  │  │  │          │  │  ┌──────────────────────────┐ │  │    │  │
│  │  │  │          │  │  │      <Outlet>            │ │  │    │  │
│  │  │  │          │  │  │                           │ │  │    │  │
│  │  │  │          │  │  │  ┌────────────────────┐  │ │  │    │  │
│  │  │  │          │  │  │  │  <RouteElement>    │  │ │  │    │  │
│  │  │  │          │  │  │  │  (Route-Level)     │  │ │  │    │  │
│  │  │  │          │  │  │  │                     │  │ │  │    │  │
│  │  │  │          │  │  │  │  Catches: Page     │  │ │  │    │  │
│  │  │  │          │  │  │  │          component │  │ │  │    │  │
│  │  │  │          │  │  │  │          errors    │  │ │  │    │  │
│  │  │  │          │  │  │  │                     │  │ │  │    │  │
│  │  │  │          │  │  │  │  ┌──────────────┐  │  │ │  │    │  │
│  │  │  │          │  │  │  │  │ Page Content │  │  │ │  │    │  │
│  │  │  │          │  │  │  │  │              │  │  │ │  │    │  │
│  │  │  │          │  │  │  │  │ - Dashboard  │  │  │ │  │    │  │
│  │  │  │          │  │  │  │  │ - Securities │  │  │ │  │    │  │
│  │  │  │          │  │  │  │  │ - Banking    │  │  │ │  │    │  │
│  │  │  │          │  │  │  │  │ - Assets     │  │  │ │  │    │  │
│  │  │  │          │  │  │  │  │ - Portfolio  │  │  │ │  │    │  │
│  │  │  │          │  │  │  │  │ - Profile    │  │  │ │  │    │  │
│  │  │  │          │  │  │  │  └──────────────┘  │  │ │  │    │  │
│  │  │  │          │  │  │  │                     │  │ │  │    │  │
│  │  │  │          │  │  │  └─────────────────────┘  │ │  │    │  │
│  │  │  │          │  │  │                           │ │  │    │  │
│  │  │  │          │  │  └──────────────────────────┘ │  │    │  │
│  │  │  │          │  │                                │  │    │  │
│  │  │  │          │  └────────────────────────────────┘  │    │  │
│  │  │  │          │                                       │    │  │
│  │  │  └──────────┘                                       │    │  │
│  │  │                                                     │    │  │
│  │  │  ┌──────────────────────┐                          │    │  │
│  │  │  │    Mobile Nav        │                          │    │  │
│  │  │  └──────────────────────┘                          │    │  │
│  │  │                                                     │    │  │
│  │  └─────────────────────────────────────────────────────┘    │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Error Flow Examples

### Example 1: Error in Dashboard Page Component

```
Error thrown in DashboardPage
         ↓
Caught by RouteElement (Route-Level)
         ↓
Shows error within app layout
         ↓
Header & Sidebar remain visible ✅
User can navigate away ✅
```

### Example 2: Error in Outlet Rendering

```
Error during route transition
         ↓
Caught by RouteErrorBoundary (Outlet-Level)
         ↓
Shows error within app layout
         ↓
Header & Sidebar remain visible ✅
Auto-resets on navigation ✅
```

### Example 3: Catastrophic Error (Router Crash)

```
Router crashes or fundamental error
         ↓
Caught by ErrorBoundary (App-Level)
         ↓
Shows full-page error screen
         ↓
Options: Refresh or Go to Dashboard
```

## Error Recovery Flow

### Automatic Recovery (Route Change)

```
User on /dashboard (error occurred)
         ↓
User clicks "Securities" in sidebar
         ↓
Route changes to /securities
         ↓
RouteErrorBoundary detects route change
         ↓
Automatically resets error state ✅
         ↓
SecuritiesPage renders normally ✅
```

### Manual Recovery (Try Again)

```
Error shown on current page
         ↓
User clicks "Try Again" button
         ↓
Error boundary resets state
         ↓
Page re-renders
         ↓
If error persists: Show error again
If error resolved: Show page normally ✅
```

### Manual Recovery (Go to Dashboard)

```
Error shown on current page
         ↓
User clicks "Go to Dashboard" button
         ↓
Navigate to /dashboard
         ↓
Error boundary resets state
         ↓
Dashboard renders ✅
```

## Component Interaction

```
┌──────────────────────────────────────────────────────┐
│                 User Action                          │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│          Component throws error                      │
│          throw new Error('...')                      │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│  Error Boundary catches error                        │
│  - componentDidCatch()                               │
│  - getDerivedStateFromError()                        │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│  Log error to console                                │
│  console.error('Route error:', error, errorInfo)     │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│  Update state: hasError = true                       │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│  Render error UI                                     │
│  - Error icon                                        │
│  - Error message                                     │
│  - Error details (dev mode)                          │
│  - Recovery buttons                                  │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
         ┌───────┴───────┐
         │               │
         ▼               ▼
┌────────────────┐  ┌──────────────────┐
│ User clicks    │  │ User navigates   │
│ "Try Again" or │  │ to another route │
│ "Go Home"      │  │ using nav links  │
└────┬───────────┘  └────┬─────────────┘
     │                   │
     ▼                   ▼
┌────────────────┐  ┌──────────────────┐
│ Reset error    │  │ componentDidUp-  │
│ state manually │  │ date() detects   │
│                │  │ route change     │
└────┬───────────┘  └────┬─────────────┘
     │                   │
     └─────────┬─────────┘
               │
               ▼
┌──────────────────────────────────────────────────────┐
│  Update state: hasError = false                      │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│  Render children normally                            │
│  {this.props.children}                               │
└──────────────────────────────────────────────────────┘
```

## State Management

### Error Boundary State

```typescript
interface State {
  hasError: boolean;      // Whether an error occurred
  error?: Error;          // The error object
  errorInfo?: ErrorInfo;  // React error info (stack trace)
}
```

### State Transitions

```
Initial State
  hasError: false
       ↓
Error Occurs
  hasError: true
  error: Error object
  errorInfo: Stack trace
       ↓
Recovery Action
  hasError: false
  error: undefined
  errorInfo: undefined
       ↓
Back to Initial State
```

## Testing Flow

```
1. Add ErrorTestButton to page
         ↓
2. Click "Test Error Boundary" button
         ↓
3. Button sets state to trigger error
         ↓
4. Component throws test error
         ↓
5. Error boundary catches it
         ↓
6. Error UI is displayed
         ↓
7. Verify:
   ✅ Error message shown
   ✅ Layout remains intact
   ✅ Navigation still works
   ✅ Recovery buttons work
   ✅ Console shows error log
         ↓
8. Click recovery button or navigate
         ↓
9. Error resets, normal rendering resumes
```

---

This flow ensures that errors are caught at appropriate levels and users always have a way to recover without losing the entire application.


