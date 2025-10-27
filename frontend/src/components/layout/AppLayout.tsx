import { Outlet } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import MobileDrawer from './MobileDrawer';
import RouteErrorBoundary from '../common/RouteErrorBoundary';
import { useNavigationStore } from '../../store/navigationStore';

const AppLayout = () => {
  const { isSidebarCollapsed } = useNavigationStore();

  return (
    <Flex minH="100vh" direction="column">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <Flex flex="1" overflow="hidden">
        {/* Desktop Sidebar */}
        <Box
          display={{ base: 'none', lg: 'block' }}
          w={isSidebarCollapsed ? '70px' : '250px'}
          transition="width 0.2s"
          borderRight="1px"
          borderColor="border.default"
          bg="bg.surface"
        >
          <Sidebar />
        </Box>

        {/* Main Content */}
        <Box 
          flex="1" 
          overflow="auto" 
          bg="bg.canvas"
          pb={{ base: '80px', lg: '0' }}
        >
          <RouteErrorBoundary>
            <Outlet />
          </RouteErrorBoundary>
        </Box>
      </Flex>

      {/* Mobile Bottom Navigation */}
      <Box display={{ base: 'block', lg: 'none' }}>
        <MobileNav />
      </Box>

      {/* Mobile Drawer Menu */}
      <MobileDrawer />
    </Flex>
  );
};

export default AppLayout;



