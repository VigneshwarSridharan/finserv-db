import {
  Box,
  Flex,
  Heading,
  IconButton,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
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
      zIndex="sticky"
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
          <IconButton
            aria-label="Toggle menu"
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
            <MenuTrigger asChild>
              <IconButton
                aria-label="User menu"
                variant="ghost"
              >
                <FiUser />
              </IconButton>
            </MenuTrigger>
            <MenuContent>
              <Box px={3} py={2}>
                <Text fontWeight="semibold" fontSize="sm">
                  {user?.first_name} {user?.last_name}
                </Text>
                <Text fontSize="xs" color="text.secondary">
                  {user?.email}
                </Text>
              </Box>
              <MenuSeparator />
              <MenuItem value="profile" onClick={() => navigate('/profile')}>
                <FiUser />
                Profile
              </MenuItem>
              <MenuItem value="settings" onClick={() => navigate('/settings')}>
                <FiSettings />
                Settings
              </MenuItem>
              <MenuSeparator />
              <MenuItem value="logout" onClick={handleLogout} color="red.500">
                <FiLogOut />
                Logout
              </MenuItem>
            </MenuContent>
          </Menu.Root>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;



