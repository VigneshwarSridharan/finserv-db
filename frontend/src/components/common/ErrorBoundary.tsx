import { Component, ErrorInfo, ReactNode } from 'react';
import { Container, Heading, Stack, Text, Button, Card } from '@chakra-ui/react';
import { LuTriangleAlert } from 'react-icons/lu';


interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Container maxW="2xl" py={20}>
          <Card.Root>
            <Card.Body>
              <Stack gap={6} alignItems="center" textAlign="center">
                <LuTriangleAlert size={64} color="red" />
                <Heading size="lg">Something went wrong</Heading>
                <Text color="text.secondary">
                  We're sorry, but something unexpected happened. Please try refreshing the
                  page or contact support if the problem persists.
                </Text>
                {this.state.error && (
                  <Card.Root variant="outline" w="full">
                    <Card.Body>
                      <Text fontSize="sm" fontFamily="mono" color="red.600">
                        {this.state.error.message}
                      </Text>
                    </Card.Body>
                  </Card.Root>
                )}
                <Stack direction="row" gap={4}>
                  <Button onClick={() => window.location.reload()}>
                    Refresh Page
                  </Button>
                  <Button colorScheme="blue" onClick={this.handleReset}>
                    Go to Dashboard
                  </Button>
                </Stack>
              </Stack>
            </Card.Body>
          </Card.Root>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

