import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Heading,
  Stack,
  Badge,
  Grid,
  HStack,
  Text,
  VStack,
  Flex,
} from '@chakra-ui/react';
import { LuChevronDown } from 'react-icons/lu';
import { holdingsService } from '../../api/services/securities.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatCard from '../../components/common/StatCard';
import SearchBar from '../../components/common/SearchBar';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import { useState } from 'react';

interface SecurityHolding {
  id: number;
  security_name: string;
  security_symbol: string;
  quantity: number;
  average_buy_price: number;
  current_price: number;
  total_invested: number;
  current_value: number;
  unrealized_pnl: number;
  unrealized_pnl_percentage: number;
  broker_name: string;
}

interface HoldingsSummary {
  total_invested: number;
  current_value: number;
  unrealized_pnl: number;
  unrealized_pnl_percentage: number;
  total_holdings: number;
}

const HoldingsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: holdingsResponse, isLoading: holdingsLoading } = useQuery({
    queryKey: ['holdings'],
    queryFn: () => holdingsService.getAll(),
  });

  const { data: summaryResponse, isLoading: summaryLoading } = useQuery({
    queryKey: ['holdings', 'summary'],
    queryFn: () => holdingsService.getSummary(),
  });

  const holdings: SecurityHolding[] = holdingsResponse?.data || [];
  const summary: HoldingsSummary = summaryResponse?.data || {
    total_invested: 0,
    current_value: 0,
    unrealized_pnl: 0,
    unrealized_pnl_percentage: 0,
    total_holdings: 0,
  };

  const filteredHoldings = holdings.filter(
    (holding) =>
      holding.security_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      holding.security_symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (holdingsLoading || summaryLoading) return <LoadingSpinner />;

  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={6}>
        <Heading size="lg">Securities Holdings</Heading>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
          <StatCard
            label="Total Invested"
            value={formatCurrency(summary.total_invested)}
            colorScheme="blue"
          />
          <StatCard
            label="Current Value"
            value={formatCurrency(summary.current_value)}
            colorScheme="purple"
          />
          <StatCard
            label="Unrealized P&L"
            value={formatCurrency(summary.unrealized_pnl)}
            colorScheme={summary.unrealized_pnl >= 0 ? 'green' : 'red'}
            trend={
              summary.unrealized_pnl >= 0
                ? { type: 'up' as const, value: formatPercentage(summary.unrealized_pnl_percentage) }
                : { type: 'down' as const, value: formatPercentage(Math.abs(summary.unrealized_pnl_percentage)) }
            }
          />
          <StatCard
            label="Total Holdings"
            value={summary.total_holdings.toString()}
            colorScheme="teal"
          />
        </Grid>

        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by security name or symbol..."
        />

        {filteredHoldings.length === 0 ? (
          <EmptyState
            title={searchTerm ? 'No holdings found' : 'No holdings yet'}
            description={
              searchTerm
                ? 'Try adjusting your search'
                : 'Start by adding your first security transaction'
            }
          />
        ) : (
          <ResponsiveTable
            data={filteredHoldings}
            columns={[
              {
                header: 'Security',
                cell: (holding) => (
                  <Stack gap={0}>
                    <Text fontWeight="medium">{holding.security_name}</Text>
                    <Text fontSize="sm" color="text.secondary">
                      {holding.security_symbol}
                    </Text>
                  </Stack>
                ),
              },
              {
                header: 'Broker',
                cell: (holding) => holding.broker_name,
              },
              {
                header: 'Quantity',
                cell: (holding) => holding.quantity,
                textAlign: 'right',
              },
              {
                header: 'Avg Buy Price',
                cell: (holding) => formatCurrency(holding.average_buy_price),
                textAlign: 'right',
              },
              {
                header: 'Current Price',
                cell: (holding) => formatCurrency(holding.current_price),
                textAlign: 'right',
              },
              {
                header: 'Invested',
                cell: (holding) => formatCurrency(holding.total_invested),
                textAlign: 'right',
              },
              {
                header: 'Current Value',
                cell: (holding) => formatCurrency(holding.current_value),
                textAlign: 'right',
              },
              {
                header: 'P&L',
                cell: (holding) => {
                  const isProfitable = holding.unrealized_pnl >= 0;
                  return (
                    <Stack gap={0} alignItems="flex-end">
                      <Text
                        fontWeight="medium"
                        color={isProfitable ? 'green.600' : 'red.600'}
                      >
                        {formatCurrency(holding.unrealized_pnl)}
                      </Text>
                      <Badge colorScheme={isProfitable ? 'green' : 'red'} fontSize="xs">
                        {formatPercentage(holding.unrealized_pnl_percentage)}
                      </Badge>
                    </Stack>
                  );
                },
                textAlign: 'right',
              },
            ]}
            mobileConfig={{
              getKey: (holding) => holding.id,
              summaryRender: (holding) => {
                const isProfitable = holding.unrealized_pnl >= 0;
                return (
                  <Flex justify="space-between" align="center" w="full">
                    <VStack align="start" gap={1} flex={1}>
                      <Text fontWeight="bold" fontSize="md">
                        {holding.security_name}
                      </Text>
                      <Text fontSize="sm" color="text.secondary">
                        {holding.security_symbol}
                      </Text>
                      <HStack gap={2}>
                        <Text fontSize="lg" fontWeight="semibold">
                          {formatCurrency(holding.current_value)}
                        </Text>
                        <Badge colorScheme={isProfitable ? 'green' : 'red'} fontSize="xs">
                          {formatPercentage(holding.unrealized_pnl_percentage)}
                        </Badge>
                      </HStack>
                    </VStack>
                    <LuChevronDown />
                  </Flex>
                );
              },
              detailsRender: (holding) => {
                const isProfitable = holding.unrealized_pnl >= 0;
                return (
                  <VStack align="stretch" gap={3}>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Broker
                      </Text>
                      <Text fontWeight="medium">{holding.broker_name}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Quantity
                      </Text>
                      <Text fontWeight="medium">{holding.quantity}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Avg Buy Price
                      </Text>
                      <Text fontWeight="medium">
                        {formatCurrency(holding.average_buy_price)}
                      </Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Current Price
                      </Text>
                      <Text fontWeight="medium">{formatCurrency(holding.current_price)}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Total Invested
                      </Text>
                      <Text fontWeight="medium">{formatCurrency(holding.total_invested)}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Unrealized P&L
                      </Text>
                      <Text
                        fontWeight="bold"
                        color={isProfitable ? 'green.600' : 'red.600'}
                      >
                        {formatCurrency(holding.unrealized_pnl)}
                      </Text>
                    </Flex>
                  </VStack>
                );
              },
            }}
          />
        )}
      </Stack>
    </Container>
  );
};

export default HoldingsPage;

