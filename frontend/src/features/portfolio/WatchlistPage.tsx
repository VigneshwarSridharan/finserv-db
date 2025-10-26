import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Heading,
  Stack,
  Button,
  Table,
  Badge,
  HStack,
  Text,
  IconButton,
} from '@chakra-ui/react';
import { LuPlus, LuTrash2, LuTrendingUp, LuTrendingDown } from 'react-icons/lu';
import { watchlistService } from '../../api/services/portfolio-features.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

interface WatchlistItem {
  id: number;
  security_name: string;
  security_symbol: string;
  current_price: number;
  added_price: number;
  price_change: number;
  price_change_percentage: number;
  notes?: string;
}

const WatchlistPage = () => {
  const { data: response, isLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => watchlistService.getAll(),
  });

  const watchlist: WatchlistItem[] = response?.data || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={6}>
        <HStack justifyContent="space-between">
          <Heading size="lg">Watchlist</Heading>
          <Button colorScheme="blue">
            <LuPlus /> Add to Watchlist
          </Button>
        </HStack>

        {watchlist.length === 0 ? (
          <EmptyState
            title="Your watchlist is empty"
            description="Add securities to your watchlist to track their prices"
            action={
              <Button colorScheme="blue">
                <LuPlus /> Add to Watchlist
              </Button>
            }
          />
        ) : (
          <Table.Root variant="outline">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Security</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">Current Price</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">Added At</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">Change</Table.ColumnHeader>
                <Table.ColumnHeader>Notes</Table.ColumnHeader>
                <Table.ColumnHeader>Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {watchlist.map((item) => {
                const isPositive = item.price_change >= 0;
                return (
                  <Table.Row key={item.id}>
                    <Table.Cell>
                      <Stack gap={0}>
                        <Text fontWeight="medium">{item.security_name}</Text>
                        <Text fontSize="sm" color="text.secondary">
                          {item.security_symbol}
                        </Text>
                      </Stack>
                    </Table.Cell>
                    <Table.Cell textAlign="right" fontWeight="medium">
                      {formatCurrency(item.current_price)}
                    </Table.Cell>
                    <Table.Cell textAlign="right">
                      {formatCurrency(item.added_price)}
                    </Table.Cell>
                    <Table.Cell textAlign="right">
                      <Stack gap={1} alignItems="flex-end">
                        <HStack gap={1}>
                          {isPositive ? (
                            <LuTrendingUp color="green" />
                          ) : (
                            <LuTrendingDown color="red" />
                          )}
                          <Text
                            fontWeight="medium"
                            color={isPositive ? 'green.600' : 'red.600'}
                          >
                            {formatCurrency(Math.abs(item.price_change))}
                          </Text>
                        </HStack>
                        <Badge colorScheme={isPositive ? 'green' : 'red'}>
                          {formatPercentage(item.price_change_percentage)}
                        </Badge>
                      </Stack>
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontSize="sm" color="text.secondary">
                        {item.notes || '-'}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <HStack>
                        <Button size="sm" colorScheme="blue">
                          Buy
                        </Button>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                        >
                          <LuTrash2 />
                        </IconButton>
                      </HStack>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>
        )}
      </Stack>
    </Container>
  );
};

export default WatchlistPage;

