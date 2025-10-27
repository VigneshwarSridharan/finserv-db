import { Box, Flex, Text } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiTrendingUp,
  FiDollarSign,
  FiPackage,
  FiPieChart,
} from 'react-icons/fi';

const mobileMenuItems = [
  { icon: FiHome, label: 'Home', path: '/dashboard' },
  { icon: FiTrendingUp, label: 'Securities', path: '/securities' },
  { icon: FiDollarSign, label: 'Banking', path: '/banking' },
  { icon: FiPackage, label: 'Assets', path: '/assets' },
  { icon: FiPieChart, label: 'Portfolio', path: '/portfolio' },
];

const MobileNav = () => {
  return (
    <Box
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      borderTop="1px"
      borderColor="border.default"
      bg="bg.surface"
      zIndex={99}
      pb="env(safe-area-inset-bottom)"
    >
      <Flex justifyContent="space-around" px={2} py={2}>
        {mobileMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={{ textDecoration: 'none' }}
          >
            {({ isActive }) => (
              <Flex
                direction="column"
                align="center"
                justify="center"
                gap={1}
                px={3}
                py={1}
                minW="60px"
                color={isActive ? 'text.active' : 'text.secondary'}
                transition="color 0.2s"
              >
                <Box as={item.icon} fontSize="22px" />
                <Text fontSize="xs" fontWeight="medium">
                  {item.label}
                </Text>
              </Flex>
            )}
          </NavLink>
        ))}
      </Flex>
    </Box>
  );
};

export default MobileNav;



