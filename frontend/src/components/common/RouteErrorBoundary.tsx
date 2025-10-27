import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Card, Heading, Stack, Text } from '@chakra-ui/react';
import { LuCircleAlert, LuHouse, LuRefreshCw } from 'react-icons/lu';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class RouteErrorBoundaryClass extends Component<Props & { navigate: (to: string) => void; location: any }, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Route error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public componentDidUpdate(prevProps: Props & { navigate: (to: string) => void; location: any }) {
    // Reset error boundary when route changes
    if (prevProps.location.pathname !== this.props.location.pathname) {
      if (this.state.hasError) {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
      }
    }
  }

  private handleRefresh = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    this.props.navigate('/dashboard');
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box p={{ base: 4, md: 8 }} maxW="4xl" mx="auto">
          <Card.Root variant="elevated" borderColor="red.500" borderWidth="2px">
            <Card.Body>
              <Stack gap={6} alignItems="center" textAlign="center">
                <Box color="red.500">
                  <LuCircleAlert size={56} />
                </Box>
                
                <Stack gap={2}>
                  <Heading size="xl">Oops! Something went wrong</Heading>
                  <Text color="text.secondary" fontSize="lg">
                    This page encountered an error and couldn't load properly.
                  </Text>
                </Stack>

                {this.state.error && (
                  <Card.Root variant="subtle" w="full" bg="red.50" _dark={{ bg: 'red.950' }}>
                    <Card.Body>
                      <Stack gap={2}>
                        <Text fontSize="sm" fontWeight="semibold" color="red.700" _dark={{ color: 'red.300' }}>
                          Error Details:
                        </Text>
                        <Text fontSize="sm" fontFamily="mono" color="red.600" _dark={{ color: 'red.400' }}>
                          {this.state.error.message}
                        </Text>
                        {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                          <Box
                            mt={2}
                            p={3}
                            bg="red.100"
                            _dark={{ bg: 'red.900' }}
                            borderRadius="md"
                            maxH="200px"
                            overflowY="auto"
                          >
                            <Text fontSize="xs" fontFamily="mono" whiteSpace="pre-wrap" color="red.800" _dark={{ color: 'red.200' }}>
                              {this.state.errorInfo.componentStack}
                            </Text>
                          </Box>
                        )}
                      </Stack>
                    </Card.Body>
                  </Card.Root>
                )}

                <Stack direction={{ base: 'column', sm: 'row' }} gap={3} w="full" justifyContent="center">
                  <Button
                    onClick={this.handleRefresh}
                    colorScheme="gray"
                    variant="outline"
                    size="lg"
                    leftIcon={<LuRefreshCw />}
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={this.handleGoHome}
                    colorScheme="blue"
                    size="lg"
                    leftIcon={<LuHouse />}
                  >
                    Go to Dashboard
                  </Button>
                </Stack>

                <Text fontSize="sm" color="text.tertiary">
                  Don't worry, your other pages are still working fine. Try navigating to a different page using the sidebar.
                </Text>
              </Stack>
            </Card.Body>
          </Card.Root>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Wrapper component with hooks
const RouteErrorBoundary = ({ children }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <RouteErrorBoundaryClass navigate={navigate} location={location}>
      {children}
    </RouteErrorBoundaryClass>
  );
};

export default RouteErrorBoundary;


