import {
  Box,
  Flex,
  Heading,
  IconButton,
  Menu,
  Portal,
  Text,
} from '@chakra-ui/react';
import { FiMenu, FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import { ColorModeButton } from '../ui/color-mode';
import { useAuthStore } from '../../store/authStore';
import { useNavigationStore } from '../../store/navigationStore';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, clearAuth } = useAuthStore();
  const { toggleSidebar } = useNavigationStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <Box
      as="header"
      borderBottom="1px"
      borderColor="border.default"
      bg="bg.surface"
      position="sticky"
      top="0"
      zIndex={100}
    >
      <Flex
        h="16"
        alignItems="center"
        justifyContent="space-between"
        px={4}
        maxW="100%"
      >
        {/* Left Section */}
        <Flex alignItems="center" gap={3}>
          {/* Mobile Hamburger Menu */}
          <IconButton
            aria-label="Open menu"
            variant="ghost"
            onClick={() => useNavigationStore.getState().toggleMobileMenu()}
            display={{ base: 'flex', lg: 'none' }}
          >
            <FiMenu />
          </IconButton>

          {/* Desktop Sidebar Toggle */}
          <IconButton
            aria-label="Toggle sidebar"
            variant="ghost"
            onClick={toggleSidebar}
            display={{ base: 'none', lg: 'flex' }}
          >
            <FiMenu />
          </IconButton>

          <Heading size="md" color="text.primary">
            Portfolio Manager
          </Heading>
        </Flex>

        {/* Right Section */}
        <Flex alignItems="center" gap={2}>
          <ColorModeButton />

          <Menu.Root>
            <Menu.Trigger asChild>
              <IconButton
                aria-label="User menu"
                variant="ghost"
              >
                <FiUser />
              </IconButton>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  <Box px={3} py={2}>
                    <Text fontWeight="semibold" fontSize="sm" color="text.primary">
                      {user?.first_name} {user?.last_name}
                    </Text>
                    <Text fontSize="xs" color="text.secondary">
                      {user?.email}
                    </Text>
                  </Box>
                  <Menu.Separator />
                  <Menu.Item value="profile" onClick={() => navigate('/profile')}>
                    <FiUser style={{ marginRight: '8px' }} />
                    Profile
                  </Menu.Item>
                  <Menu.Item value="settings" onClick={() => navigate('/settings')}>
                    <FiSettings style={{ marginRight: '8px' }} />
                    Settings
                  </Menu.Item>
                  <Menu.Separator />
                  <Menu.Item value="logout" onClick={handleLogout} color="red.500">
                    <FiLogOut style={{ marginRight: '8px' }} />
                    Logout
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;



