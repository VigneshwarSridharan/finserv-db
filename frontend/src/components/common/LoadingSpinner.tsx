import { Box, Spinner, Text, Stack } from '@chakra-ui/react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
}

const LoadingSpinner = ({ message = 'Loading...', size = 'xl', fullScreen = false }: LoadingSpinnerProps) => {
  const content = (
    <Stack gap={4} alignItems="center">
      <Spinner size={size} color="brand.500" />
      {message && (
        <Text fontSize="sm" color="text.secondary">
          {message}
        </Text>
      )}
    </Stack>
  );

  if (fullScreen) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH="100vh"
        bg="bg.canvas"
      >
        {content}
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={12}
    >
      {content}
    </Box>
  );
};

export default LoadingSpinner;


