import { Card, Stack, Text, Box } from '@chakra-ui/react';
import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: string;
}

const StatCard = ({ label, value, icon, trend, color }: StatCardProps) => {
  return (
    <Card.Root>
      <Card.Body>
        <Stack gap={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Text fontSize="sm" color="text.secondary">
              {label}
            </Text>
            {icon && (
              <Box color={color || 'brand.500'} fontSize="xl">
                {icon}
              </Box>
            )}
          </Box>
          
          <Text fontSize="2xl" fontWeight="bold" color={color || 'text.primary'}>
            {value}
          </Text>
          
          {trend && (
            <Text
              fontSize="sm"
              color={trend.isPositive ? 'green.500' : 'red.500'}
              fontWeight="medium"
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </Text>
          )}
        </Stack>
      </Card.Body>
    </Card.Root>
  );
};

export default StatCard;

