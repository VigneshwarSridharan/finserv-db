import { Breadcrumb, Box } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiChevronRight } from 'react-icons/fi';
import { useMemo } from 'react';

interface BreadcrumbItem {
  label: string;
  path: string;
  isCurrentPage: boolean;
}

// Map of route segments to human-readable labels
const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  securities: 'Securities',
  brokers: 'Brokers',
  holdings: 'Holdings',
  transactions: 'Transactions',
  banking: 'Banking',
  accounts: 'Accounts',
  'fixed-deposits': 'Fixed Deposits',
  'recurring-deposits': 'Recurring Deposits',
  assets: 'Assets',
  list: 'All Assets',
  categories: 'Categories',
  portfolio: 'Portfolio',
  goals: 'Goals',
  alerts: 'Alerts',
  watchlist: 'Watchlist',
  profile: 'Profile',
  settings: 'Settings',
};

const Breadcrumbs = () => {
  const location = useLocation();

  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    // If we're on the root path, show just Dashboard
    if (pathSegments.length === 0 || location.pathname === '/') {
      return [
        { label: 'Dashboard', path: '/dashboard', isCurrentPage: true }
      ];
    }

    const items: BreadcrumbItem[] = [];
    let currentPath = '';

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      items.push({
        label: routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        path: currentPath,
        isCurrentPage: isLast,
      });
    });

    return items;
  }, [location.pathname]);

  // Don't show breadcrumbs on login/register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <Box
      px={{ base: 4, md: 6 }}
      py={3}
      borderBottom="1px"
      borderColor="border.default"
      bg="bg.surface"
    >
      <Breadcrumb.Root size="sm">
        <Breadcrumb.List>
          {/* Home Icon */}
          <Breadcrumb.Item>
            <Breadcrumb.Link asChild>
              <Link to="/dashboard">
                <FiHome />
              </Link>
            </Breadcrumb.Link>
          </Breadcrumb.Item>

          {breadcrumbs.length > 0 && location.pathname !== '/dashboard' && (
            <Breadcrumb.Separator>
              <FiChevronRight />
            </Breadcrumb.Separator>
          )}

          {/* Dynamic Breadcrumb Items */}
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            // Skip dashboard if it's the first item (already shown as home icon)
            if (item.path === '/dashboard' && index === 0) {
              return null;
            }

            return (
              <Box key={item.path} display="contents">
                <Breadcrumb.Item>
                  {isLast ? (
                    <Breadcrumb.CurrentLink fontWeight="semibold">
                      {item.label}
                    </Breadcrumb.CurrentLink>
                  ) : (
                    <Breadcrumb.Link asChild>
                      <Link to={item.path}>{item.label}</Link>
                    </Breadcrumb.Link>
                  )}
                </Breadcrumb.Item>

                {!isLast && (
                  <Breadcrumb.Separator>
                    <FiChevronRight />
                  </Breadcrumb.Separator>
                )}
              </Box>
            );
          })}
        </Breadcrumb.List>
      </Breadcrumb.Root>
    </Box>
  );
};

export default Breadcrumbs;

