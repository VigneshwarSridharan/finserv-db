import { Box, Stack, Text, Button } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { FiInbox } from 'react-icons/fi';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState = ({ title, description, icon, action }: EmptyStateProps) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={12}
      px={4}
    >
      <Stack gap={4} textAlign="center" maxW="md">
        <Box
          display="flex"
          justifyContent="center"
          fontSize="4xl"
          color="text.secondary"
          opacity={0.5}
        >
          {icon || <FiInbox />}
        </Box>
        
        <Stack gap={2}>
          <Text fontSize="lg" fontWeight="semibold" color="text.primary">
            {title}
          </Text>
          
          {description && (
            <Text fontSize="sm" color="text.secondary">
              {description}
            </Text>
          )}
        </Stack>
        
        {action && (
          <Button
            onClick={action.onClick}
            colorScheme="brand"
            size="md"
            mt={2}
          >
            {action.label}
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default EmptyState;

