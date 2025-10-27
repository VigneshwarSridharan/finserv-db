import { Box, Stack, Text, Flex, Collapsible } from '@chakra-ui/react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiTrendingUp,
  FiDollarSign,
  FiPackage,
  FiPieChart,
  FiUser,
  FiChevronDown,
  FiChevronRight,
  FiBriefcase,
  FiBarChart2,
  FiShoppingCart,
  FiCreditCard,
  FiSave,
  FiRepeat,
  FiGrid,
  FiTag,
  FiTarget,
  FiBell,
  FiEye,
} from 'react-icons/fi';
import { useNavigationStore } from '../../store/navigationStore';
import { useState } from 'react';
import * as React from 'react';

interface SubMenuItem {
  label: string;
  path: string;
  icon: any;
}

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  subItems?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  { 
    icon: FiHome, 
    label: 'Dashboard', 
    path: '/dashboard' 
  },
  {
    icon: FiTrendingUp,
    label: 'Securities',
    path: '/securities',
    subItems: [
      { label: 'Overview', path: '/securities', icon: FiBarChart2 },
      { label: 'Brokers', path: '/securities/brokers', icon: FiBriefcase },
      { label: 'Holdings', path: '/securities/holdings', icon: FiShoppingCart },
      { label: 'Transactions', path: '/securities/transactions', icon: FiRepeat },
    ],
  },
  {
    icon: FiDollarSign,
    label: 'Banking',
    path: '/banking',
    subItems: [
      { label: 'Overview', path: '/banking', icon: FiCreditCard },
      { label: 'Accounts', path: '/banking/accounts', icon: FiCreditCard },
      { label: 'Fixed Deposits', path: '/banking/fixed-deposits', icon: FiSave },
      { label: 'Recurring Deposits', path: '/banking/recurring-deposits', icon: FiRepeat },
    ],
  },
  {
    icon: FiPackage,
    label: 'Assets',
    path: '/assets',
    subItems: [
      { label: 'Overview', path: '/assets', icon: FiGrid },
      { label: 'All Assets', path: '/assets/list', icon: FiPackage },
      { label: 'Categories', path: '/assets/categories', icon: FiTag },
    ],
  },
  {
    icon: FiPieChart,
    label: 'Portfolio',
    path: '/portfolio',
    subItems: [
      { label: 'Overview', path: '/portfolio', icon: FiPieChart },
      { label: 'Goals', path: '/portfolio/goals', icon: FiTarget },
      { label: 'Alerts', path: '/portfolio/alerts', icon: FiBell },
      { label: 'Watchlist', path: '/portfolio/watchlist', icon: FiEye },
    ],
  },
  { 
    icon: FiUser, 
    label: 'Profile', 
    path: '/profile' 
  },
];

const Sidebar = () => {
  const { isSidebarCollapsed } = useNavigationStore();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    // Auto-expand sections that contain the current path
    const initialExpanded: string[] = [];
    menuItems.forEach((item) => {
      if (item.subItems && item.subItems.some((sub) => location.pathname === sub.path)) {
        initialExpanded.push(item.path);
      }
    });
    return initialExpanded;
  });

  const toggleExpanded = (path: string) => {
    setExpandedItems((prev) =>
      prev.includes(path)
        ? prev.filter((item) => item !== path)
        : [...prev, path]
    );
  };

  const isPathActive = (path: string, subItems?: SubMenuItem[]) => {
    if (location.pathname === path) return true;
    if (subItems) {
      return subItems.some((sub) => location.pathname === sub.path);
    }
    return false;
  };

  // Auto-expand when navigating to a sub-page
  React.useEffect(() => {
    menuItems.forEach((item) => {
      if (item.subItems && item.subItems.some((sub) => location.pathname === sub.path)) {
        setExpandedItems((prev) => 
          prev.includes(item.path) ? prev : [...prev, item.path]
        );
      }
    });
  }, [location.pathname]);

  return (
    <Box h="full" py={4} overflowY="auto">
      <Stack gap={1} px={2}>
        {menuItems.map((item) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isExpanded = expandedItems.includes(item.path);
          const isActive = isPathActive(item.path, item.subItems);

          return (
            <Box key={item.path}>
              {/* Main Menu Item */}
              {hasSubItems && !isSidebarCollapsed ? (
                <Flex
                  align="center"
                  px={3}
                  py={3}
                  borderRadius="md"
                  cursor="pointer"
                  bg={isActive ? 'bg.active' : 'transparent'}
                  color={isActive ? 'text.active' : 'text.secondary'}
                  _hover={{
                    bg: isActive ? 'bg.active' : 'bg.hover',
                  }}
                  transition="all 0.2s"
                  onClick={() => toggleExpanded(item.path)}
                >
                  <Box as={item.icon} fontSize="20px" />
                  {!isSidebarCollapsed && (
                    <>
                      <Text ml={3} fontWeight="medium" fontSize="sm" flex="1">
                        {item.label}
                      </Text>
                      <Box
                        as={isExpanded ? FiChevronDown : FiChevronRight}
                        fontSize="16px"
                        transition="transform 0.2s"
                      />
                    </>
                  )}
                </Flex>
              ) : (
                <NavLink to={item.path} style={{ textDecoration: 'none' }}>
                  {({ isActive: isLinkActive }) => (
                    <Flex
                      align="center"
                      px={3}
                      py={3}
                      borderRadius="md"
                      cursor="pointer"
                      bg={isLinkActive ? 'bg.active' : 'transparent'}
                      color={isLinkActive ? 'text.active' : 'text.secondary'}
                      _hover={{
                        bg: isLinkActive ? 'bg.active' : 'bg.hover',
                      }}
                      transition="all 0.2s"
                    >
                      <Box as={item.icon} fontSize="20px" />
                      {!isSidebarCollapsed && (
                        <Text ml={3} fontWeight="medium" fontSize="sm">
                          {item.label}
                        </Text>
                      )}
                    </Flex>
                  )}
                </NavLink>
              )}

              {/* Sub Items */}
              {hasSubItems && !isSidebarCollapsed && (
                <Collapsible.Root open={isExpanded}>
                  <Collapsible.Content>
                    <Stack gap={1} mt={1} ml={4}>
                      {item.subItems!.map((subItem) => (
                        <NavLink
                          key={subItem.path}
                          to={subItem.path}
                          style={{ textDecoration: 'none' }}
                        >
                          {({ isActive: isSubActive }) => (
                            <Flex
                              align="center"
                              px={3}
                              py={2}
                              borderRadius="md"
                              cursor="pointer"
                              bg={isSubActive ? 'bg.active' : 'transparent'}
                              color={isSubActive ? 'text.active' : 'text.secondary'}
                              _hover={{
                                bg: isSubActive ? 'bg.active' : 'bg.hover',
                              }}
                              transition="all 0.2s"
                            >
                              <Box as={subItem.icon} fontSize="16px" />
                              <Text ml={3} fontSize="sm">
                                {subItem.label}
                              </Text>
                            </Flex>
                          )}
                        </NavLink>
                      ))}
                    </Stack>
                  </Collapsible.Content>
                </Collapsible.Root>
              )}
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

export default Sidebar;



