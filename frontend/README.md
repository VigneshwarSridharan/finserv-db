# Portfolio Manager - Frontend

A comprehensive Portfolio Management Progressive Web Application built with React, TypeScript, and Chakra UI.

## Features

- 📱 **Progressive Web App** - Install on any device, works offline
- 🎨 **Modern UI** - Built with Chakra UI v3
- 🌓 **Dark Mode** - Full light/dark theme support
- 📊 **Interactive Charts** - Recharts for data visualization
- 🔐 **Secure Authentication** - JWT-based auth with protected routes
- 📱 **Mobile-First** - Responsive design with native mobile feel
- ⚡ **Fast & Efficient** - React Query for data caching and state management

## Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe code
- **Vite** - Fast build tool
- **Chakra UI v3** - Component library
- **React Query** - Server state management
- **Zustand** - Client state management
- **React Router v6** - Routing
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Recharts** - Charts and visualizations
- **Axios** - HTTP client

## Prerequisites

- Node.js 16+
- Yarn package manager
- Backend API running on `http://localhost:3000`

## Getting Started

### 1. Install Dependencies

```bash
yarn install
```

### 2. Configure Environment

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=Portfolio Manager
VITE_APP_VERSION=1.0.0
```

### 3. Start Development Server

```bash
yarn dev
```

The application will be available at `http://localhost:5173`

### 4. Build for Production

```bash
yarn build
```

### 5. Preview Production Build

```bash
yarn preview
```

## Project Structure

```
frontend/
├── public/                 # Static assets
│   ├── icons/             # PWA icons
│   └── robots.txt
├── src/
│   ├── api/               # API client & services
│   │   ├── client.ts      # Axios instance
│   │   ├── queryClient.ts # React Query config
│   │   └── services/      # API service layer
│   ├── components/        # Reusable components
│   │   ├── common/        # Common components
│   │   ├── layout/        # Layout components
│   │   ├── charts/        # Chart components
│   │   └── ui/            # Chakra UI components
│   ├── features/          # Feature modules
│   │   ├── auth/          # Authentication
│   │   ├── dashboard/     # Dashboard
│   │   ├── securities/    # Securities management
│   │   ├── banking/       # Banking & deposits
│   │   ├── assets/        # Assets management
│   │   ├── portfolio/     # Portfolio features
│   │   └── profile/       # User profile
│   ├── hooks/             # Custom React hooks
│   ├── store/             # Zustand stores
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   ├── theme/             # Chakra UI theme
│   ├── routes/            # Route configuration
│   ├── App.tsx            # Root component
│   └── main.tsx           # Entry point
├── .env                   # Environment variables
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint

## Features by Domain

### Authentication
- User registration and login
- JWT token management
- Protected routes
- Session persistence

### Dashboard
- Portfolio overview
- Total value & P&L
- Asset allocation visualization
- Quick actions

### Securities
- Broker management
- Securities tracking
- Holdings with P&L
- Transaction management
- Price history
- Bulk imports

### Banking
- Bank accounts
- Fixed deposits
- Recurring deposits
- Interest tracking
- Maturity management

### Assets
- Asset categories
- Real estate tracking
- Gold holdings
- Asset valuations
- Transaction history

### Portfolio Features
- Goals tracking
- Asset allocation
- Alerts & notifications
- Watchlist
- Performance analytics
- Report generation

### User Profile
- Profile management
- Preferences
- Password update

## PWA Features

- **Offline Support** - Works without internet connection
- **Installable** - Add to home screen on any device
- **App-like Experience** - Full-screen, native feel
- **Auto-updates** - Seamless updates in background
- **Caching** - Smart caching for better performance

## API Integration

The frontend connects to the backend API at `http://localhost:3000`. All API calls include:
- JWT authentication headers
- Error handling and retry logic
- Request/response interceptors
- TypeScript type safety

## State Management

- **Server State**: React Query for API data, caching, and synchronization
- **Client State**: Zustand for auth, theme, navigation, and UI state
- **Form State**: React Hook Form for form handling

## Responsive Design

- **Mobile**: Bottom navigation, touch-optimized
- **Tablet**: Adapted layout with sidebar
- **Desktop**: Full sidebar navigation

Breakpoints:
- `base`: Mobile (< 768px)
- `md`: Tablet (768px - 1024px)
- `lg`: Desktop (> 1024px)

## Development Tips

### Adding New Features

1. Create service in `src/api/services/`
2. Add query keys in `src/api/queryClient.ts`
3. Create components in `src/features/[domain]/`
4. Add routes in `src/routes/index.tsx`
5. Update navigation in layout components

### Using React Query

```tsx
import { useQuery } from '@tanstack/react-query';
import { portfolioService } from '../api/services/portfolio.service';
import { queryKeys } from '../api/queryClient';

const { data, isLoading, error } = useQuery({
  queryKey: queryKeys.portfolios.all,
  queryFn: portfolioService.getAll,
});
```

### Using Zustand Store

```tsx
import { useAuthStore } from '../store/authStore';

const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
```

### Form Validation

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../utils/validation';

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(loginSchema),
});
```

## Troubleshooting

### Port Already in Use
Change the port in `vite.config.ts`:
```ts
server: {
  port: 5174, // or any available port
}
```

### API Connection Issues
- Ensure backend is running on `http://localhost:3000`
- Check CORS configuration in backend
- Verify environment variables in `.env`

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules yarn.lock
yarn install

# Clear Vite cache
rm -rf node_modules/.vite
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Code splitting by route
- Lazy loading for better initial load
- Image optimization
- Efficient caching strategies
- Tree shaking for smaller bundles

## Security

- JWT token storage in localStorage
- Automatic token refresh
- Protected routes
- Input validation and sanitization
- XSS protection via React
- CORS configuration

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

MIT
