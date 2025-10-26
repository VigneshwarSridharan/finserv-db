import { Box, Stack, Text, Button } from '@chakra-ui/react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({ icon, title, description, actionLabel, onAction }: EmptyStateProps) => {
  return (
    <Box textAlign="center" py={12}>
      <Stack gap={4} alignItems="center" maxW="md" mx="auto">
        {icon && (
          <Box color="text.secondary" opacity={0.3} fontSize="5xl">
            {icon}
          </Box>
        )}
        
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
        
        {actionLabel && onAction && (
          <Button onClick={onAction} colorPalette="brand" size="md" mt={2}>
            {actionLabel}
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default EmptyState;
