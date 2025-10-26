import {
  Container,
  Heading,
  SimpleGrid,
  Text,
  Card,
  Stack,
  Grid,
  Box,
  Badge,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { portfolioOverviewService } from '../../api/services/portfolio-features.service';
import { queryKeys } from '../../api/queryClient';
import { formatCurrency, formatPercentage, getPnLColor } from '../../utils/format';
import PieChart from '../../components/charts/PieChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/common/StatCard';
import { FiDollarSign, FiTrendingUp, FiPieChart } from 'react-icons/fi';
import type { AssetBreakdown } from '../../types/domain.types';

const DashboardPage = () => {
  const { data: response, isLoading, error } = useQuery({
    queryKey: queryKeys.portfolio.overview,
    queryFn: portfolioOverviewService.getOverview,
  });

  if (isLoading) {
    return <LoadingSpinner message="Loading your portfolio..." fullScreen={false} />;
  }

  if (error || !response?.success) {
    return (
      <Container maxW="7xl" py={8}>
        <Heading size="lg" mb={6}>Dashboard</Heading>
        <Card.Root>
          <Card.Body>
            <Stack gap={4}>
              <Heading size="md">Welcome to Portfolio Manager</Heading>
              <Text color="text.secondary">
                Start by adding your securities, bank accounts, and assets to see your complete
                financial overview.
              </Text>
            </Stack>
          </Card.Body>
        </Card.Root>
      </Container>
    );
  }

  const portfolioData = response.data;
  
  if (!portfolioData) {
    return (
      <Container maxW="7xl" py={8}>
        <Heading size="lg" mb={6}>Dashboard</Heading>
        <Text>No data available</Text>
      </Container>
    );
  }

  const { overview, asset_breakdown, goals, asset_counts } = portfolioData;

  // Prepare data for pie chart
  const pieChartData = asset_breakdown.map((item: AssetBreakdown) => ({
    name: item.asset_type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    value: item.current_value,
  }));

  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={6}>
        <Heading size="lg">Dashboard</Heading>

        {/* Summary Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
          <StatCard
            label="Total Portfolio Value"
            value={formatCurrency(overview.total_value)}
            icon={<FiDollarSign />}
            color="brand.500"
          />

          <StatCard
            label="Total Investment"
            value={formatCurrency(overview.total_investment)}
            icon={<FiDollarSign />}
            color="blue.500"
          />

          <StatCard
            label="Total P&L"
            value={formatCurrency(overview.total_pnl)}
            icon={<FiTrendingUp />}
            color={getPnLColor(overview.total_pnl)}
            trend={{
              value: formatPercentage(overview.return_percentage),
              isPositive: overview.total_pnl >= 0,
            }}
          />

          <StatCard
            label="Day Change"
            value={formatCurrency(overview.day_change)}
            icon={<FiTrendingUp />}
            color={getPnLColor(overview.day_change)}
            trend={{
              value: formatPercentage(overview.day_change_percentage),
              isPositive: overview.day_change >= 0,
            }}
          />
        </SimpleGrid>

        {/* Asset Breakdown and Goals */}
        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
          {/* Asset Allocation */}
          <Card.Root>
            <Card.Header>
              <Heading size="md">Asset Allocation</Heading>
            </Card.Header>
            <Card.Body>
              {asset_breakdown.length > 0 ? (
                <PieChart data={pieChartData} height={300} />
              ) : (
                <Box textAlign="center" py={8}>
                  <FiPieChart size={48} style={{ margin: '0 auto', opacity: 0.3 }} />
                  <Text color="text.secondary" mt={4}>
                    No asset data available
                  </Text>
                </Box>
              )}
            </Card.Body>
          </Card.Root>

          {/* Goals Summary */}
          <Card.Root>
            <Card.Header>
              <Heading size="md">Goals & Assets</Heading>
            </Card.Header>
            <Card.Body>
              <Stack gap={4}>
                {/* Goals Section */}
                <Box>
                  <Text fontSize="sm" color="text.secondary" mb={3} fontWeight="medium">
                    Financial Goals
                  </Text>
                  <Stack gap={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Text fontSize="sm">Total Goals</Text>
                      <Badge colorPalette="blue">{goals.total_goals}</Badge>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Text fontSize="sm">Achieved</Text>
                      <Badge colorPalette="green">{goals.achieved_goals}</Badge>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Text fontSize="sm">Pending</Text>
                      <Badge colorPalette="orange">{goals.pending_goals}</Badge>
                    </Box>
                  </Stack>
                </Box>

                {/* Asset Counts Section */}
                <Box pt={4} borderTop="1px" borderColor="border.default">
                  <Text fontSize="sm" color="text.secondary" mb={3} fontWeight="medium">
                    Asset Summary
                  </Text>
                  <Stack gap={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Text fontSize="sm">Securities</Text>
                      <Badge colorPalette="gray">{asset_counts.securities}</Badge>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Text fontSize="sm">Fixed Deposits</Text>
                      <Badge colorPalette="gray">{asset_counts.fixed_deposits}</Badge>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Text fontSize="sm">Recurring Deposits</Text>
                      <Badge colorPalette="gray">{asset_counts.recurring_deposits}</Badge>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Text fontSize="sm">Other Assets</Text>
                      <Badge colorPalette="gray">{asset_counts.other_assets}</Badge>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </Card.Body>
          </Card.Root>
        </Grid>

        {/* Asset Breakdown Table */}
        {asset_breakdown.length > 0 && (
          <Card.Root>
            <Card.Header>
              <Heading size="md">Asset Breakdown</Heading>
            </Card.Header>
            <Card.Body>
              <Stack gap={3}>
                {asset_breakdown.map((asset: AssetBreakdown, index: number) => (
                  <Box
                    key={index}
                    p={4}
                    borderRadius="md"
                    border="1px"
                    borderColor="border.default"
                    _hover={{ bg: 'bg.hover' }}
                    transition="background 0.2s"
                  >
                    <Grid 
                      templateColumns={{ 
                        base: 'repeat(2, 1fr)', 
                        sm: 'repeat(3, 1fr)', 
                        md: 'repeat(5, 1fr)' 
                      }} 
                      gap={4}
                    >
                      <Box>
                        <Text fontSize="xs" color="text.secondary" mb={1}>Asset Type</Text>
                        <Text fontWeight="semibold" fontSize="sm" lineClamp={1}>
                          {asset.asset_type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="text.secondary" mb={1}>Investment</Text>
                        <Text fontWeight="medium" fontSize="sm">{formatCurrency(asset.investment)}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="text.secondary" mb={1}>Current Value</Text>
                        <Text fontWeight="medium" fontSize="sm">{formatCurrency(asset.current_value)}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="text.secondary" mb={1}>P&L</Text>
                        <Text fontWeight="medium" fontSize="sm" color={getPnLColor(asset.pnl)}>
                          {formatCurrency(asset.pnl)}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="text.secondary" mb={1}>Portfolio %</Text>
                        <Text fontWeight="medium" fontSize="sm">{formatPercentage(asset.percentage)}</Text>
                      </Box>
                    </Grid>
                  </Box>
                ))}
              </Stack>
            </Card.Body>
          </Card.Root>
        )}
      </Stack>
    </Container>
  );
};

export default DashboardPage;


