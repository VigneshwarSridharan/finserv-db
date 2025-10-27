import { useState } from 'react';
import { Button } from '@chakra-ui/react';
import { LuAlertTriangle } from 'react-icons/lu';

/**
 * Test button to trigger errors for testing error boundaries
 * Only use in development mode
 */
export const ErrorTestButton = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('This is a test error triggered by the ErrorTestButton component');
  }

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Button
      onClick={() => setShouldThrow(true)}
      colorScheme="red"
      variant="ghost"
      size="sm"
      leftIcon={<LuAlertTriangle />}
    >
      Test Error Boundary
    </Button>
  );
};


