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
import HoldingTransactionsList from './HoldingTransactionsList';
import { useState } from 'react';

interface SecurityHolding {
  holding_id: number;
  user_id: number;
  account_id: number;
  security_id: number;
  user_name: string;
  broker_name: string;
  account_number: string;
  symbol: string;
  security_name: string;
  security_type: string;
  exchange: string;
  sector: string;
  quantity: string;
  average_price: string;
  current_price: string;
  total_investment: string;
  current_value: string;
  unrealized_pnl: string;
  return_percentage: string;
  first_purchase_date: string;
  last_purchase_date: string;
}

interface HoldingsSummary {
  total_investment: number;
  current_value: number;
  unrealized_pnl: number;
  return_percentage: number;
  total_holdings: number;
}

const HoldingsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: holdingsResponse, isLoading: holdingsLoading } = useQuery({
    queryKey: ['holdings'],
    queryFn: () => holdingsService.getAll(),
  });

  const holdings: SecurityHolding[] = holdingsResponse?.data || [];
  
  // Calculate summary from holdings data
  const summary: HoldingsSummary = holdings.reduce(
    (acc, holding) => ({
      total_investment: acc.total_investment + parseFloat(holding.total_investment || '0'),
      current_value: acc.current_value + parseFloat(holding.current_value || '0'),
      unrealized_pnl: acc.unrealized_pnl + parseFloat(holding.unrealized_pnl || '0'),
      return_percentage: 0, // Will calculate after
      total_holdings: acc.total_holdings + 1,
    }),
    {
      total_investment: 0,
      current_value: 0,
      unrealized_pnl: 0,
      return_percentage: 0,
      total_holdings: 0,
    }
  );

  // Calculate overall return percentage
  if (summary.total_investment > 0) {
    summary.return_percentage = (summary.unrealized_pnl / summary.total_investment) * 100;
  }

  const filteredHoldings = holdings.filter(
    (holding) =>
      holding.security_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      holding.symbol.toLowerCase().includes(searchTerm.toLowerCase())
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

  if (holdingsLoading) return <LoadingSpinner />;

  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={6}>
        <Heading size="lg">Securities Holdings</Heading>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
          <StatCard
            label="Total Invested"
            value={formatCurrency(summary.total_investment)}
            color="blue.500"
          />
          <StatCard
            label="Current Value"
            value={formatCurrency(summary.current_value)}
            color="purple.500"
          />
          <StatCard
            label="Unrealized P&L"
            value={formatCurrency(summary.unrealized_pnl)}
            color={summary.unrealized_pnl >= 0 ? 'green.500' : 'red.500'}
            trend={{
              value: formatPercentage(Math.abs(summary.return_percentage)),
              isPositive: summary.unrealized_pnl >= 0
            }}
          />
          <StatCard
            label="Total Holdings"
            value={summary.total_holdings.toString()}
            color="teal.500"
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
                      {holding.symbol}
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
                cell: (holding) => parseFloat(holding.quantity).toFixed(2),
                textAlign: 'right',
              },
              {
                header: 'Avg Buy Price',
                cell: (holding) => formatCurrency(parseFloat(holding.average_price)),
                textAlign: 'right',
              },
              {
                header: 'Current Price',
                cell: (holding) => formatCurrency(parseFloat(holding.current_price)),
                textAlign: 'right',
              },
              {
                header: 'Invested',
                cell: (holding) => formatCurrency(parseFloat(holding.total_investment)),
                textAlign: 'right',
              },
              {
                header: 'Current Value',
                cell: (holding) => formatCurrency(parseFloat(holding.current_value)),
                textAlign: 'right',
              },
              {
                header: 'P&L',
                cell: (holding) => {
                  const pnl = parseFloat(holding.unrealized_pnl);
                  const returnPct = parseFloat(holding.return_percentage);
                  const isProfitable = pnl >= 0;
                  return (
                    <Stack gap={0} alignItems="flex-end">
                      <Text
                        fontWeight="medium"
                        color={isProfitable ? 'green.600' : 'red.600'}
                      >
                        {formatCurrency(pnl)}
                      </Text>
                      <Badge colorScheme={isProfitable ? 'green' : 'red'} fontSize="xs">
                        {formatPercentage(returnPct)}
                      </Badge>
                    </Stack>
                  );
                },
                textAlign: 'right',
              },
            ]}
            mobileConfig={{
              getKey: (holding) => `${holding.user_id}-${holding.symbol}-${holding.account_number}`,
              summaryRender: (holding) => {
                const pnl = parseFloat(holding.unrealized_pnl);
                const returnPct = parseFloat(holding.return_percentage);
                const isProfitable = pnl >= 0;
                return (
                  <Flex justify="space-between" align="center" w="full">
                    <VStack align="start" gap={1} flex={1}>
                      <Text fontWeight="bold" fontSize="md">
                        {holding.security_name}
                      </Text>
                      <Text fontSize="sm" color="text.secondary">
                        {holding.symbol}
                      </Text>
                      <HStack gap={2}>
                        <Text fontSize="lg" fontWeight="semibold">
                          {formatCurrency(parseFloat(holding.current_value))}
                        </Text>
                        <Badge colorScheme={isProfitable ? 'green' : 'red'} fontSize="xs">
                          {formatPercentage(returnPct)}
                        </Badge>
                      </HStack>
                    </VStack>
                    <LuChevronDown />
                  </Flex>
                );
              },
              detailsRender: (holding) => {
                const pnl = parseFloat(holding.unrealized_pnl);
                const isProfitable = pnl >= 0;
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
                      <Text fontWeight="medium">{parseFloat(holding.quantity).toFixed(2)}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Avg Buy Price
                      </Text>
                      <Text fontWeight="medium">
                        {formatCurrency(parseFloat(holding.average_price))}
                      </Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Current Price
                      </Text>
                      <Text fontWeight="medium">{formatCurrency(parseFloat(holding.current_price))}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Total Invested
                      </Text>
                      <Text fontWeight="medium">{formatCurrency(parseFloat(holding.total_investment))}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Unrealized P&L
                      </Text>
                      <Text
                        fontWeight="bold"
                        color={isProfitable ? 'green.600' : 'red.600'}
                      >
                        {formatCurrency(pnl)}
                      </Text>
                    </Flex>
                  </VStack>
                );
              },
            }}
            expandableConfig={{
              getExpandKey: (holding) => holding.holding_id,
              expandedContent: (holding) => (
                <HoldingTransactionsList
                  holdingId={holding.holding_id}
                  accountId={holding.account_id}
                  securityId={holding.security_id}
                  securityName={holding.security_name}
                  symbol={holding.symbol}
                />
              ),
            }}
          />
        )}
      </Stack>
    </Container>
  );
};

export default HoldingsPage;

