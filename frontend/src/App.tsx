import { BrowserRouter as Router } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import { useThemeStore } from './store/themeStore';
import { useEffect } from 'react';
import AppRoutes from './routes';
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  const { colorMode } = useThemeStore();

  // Apply color mode to document
  useEffect(() => {
    const root = document.documentElement;
    if (colorMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [colorMode]);

  return (
    <ErrorBoundary>
      <Router>
        <Box minH="100vh" bg="bg.canvas">
          <AppRoutes />
        </Box>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
