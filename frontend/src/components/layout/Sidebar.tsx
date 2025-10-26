import { Box, Stack, Text, Flex } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiTrendingUp,
  FiDollarSign,
  FiPackage,
  FiPieChart,
  FiUser,
} from 'react-icons/fi';
import { useNavigationStore } from '../../store/navigationStore';

const menuItems = [
  { icon: FiHome, label: 'Dashboard', path: '/dashboard' },
  { icon: FiTrendingUp, label: 'Securities', path: '/securities' },
  { icon: FiDollarSign, label: 'Banking', path: '/banking' },
  { icon: FiPackage, label: 'Assets', path: '/assets' },
  { icon: FiPieChart, label: 'Portfolio', path: '/portfolio' },
  { icon: FiUser, label: 'Profile', path: '/profile' },
];

const Sidebar = () => {
  const { isSidebarCollapsed } = useNavigationStore();

  return (
    <Box h="full" py={4} overflowY="auto">
      <Stack gap={1} px={2}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={{ textDecoration: 'none' }}
          >
            {({ isActive }) => (
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
        ))}
      </Stack>
    </Box>
  );
};

export default Sidebar;



