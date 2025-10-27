import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Heading,
  Stack,
  Button,
  Badge,
  Grid,
  HStack,
  Text,
  IconButton,
  VStack,
  Flex,
} from '@chakra-ui/react';
import { LuPlus, LuEye, LuChevronDown } from 'react-icons/lu';
import { format } from 'date-fns';
import { assetService } from '../../api/services/assets.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatCard from '../../components/common/StatCard';
import SearchBar from '../../components/common/SearchBar';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import { useNavigate } from 'react-router-dom';
import type { Asset } from '../../types/domain.types';

const AssetsListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const { data: response, isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => assetService.getAll(),
  });

  const assets: Asset[] = response?.data || [];

  const filteredAssets = assets.filter((asset) =>
    asset.asset_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPurchaseValue = assets.reduce((sum, asset) => sum + parseFloat(asset.purchase_price || '0'), 0);
  const totalCurrentValue = assets.reduce((sum, asset) => sum + parseFloat(asset.current_value || '0'), 0);
  const totalGain = totalCurrentValue - totalPurchaseValue;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value);
  };

  const getCategoryBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'precious_metal':
        return 'yellow';
      case 'real_estate':
        return 'purple';
      case 'commodity':
        return 'orange';
      case 'collectible':
        return 'blue';
      case 'other':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const formatCategoryType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={6}>
        <HStack justifyContent="space-between">
          <Heading size="lg">Assets</Heading>
          <Button colorScheme="blue" onClick={() => navigate('/assets/new')}>
            <LuPlus /> Add Asset
          </Button>
        </HStack>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
          <StatCard
            label="Total Purchase Value"
            value={formatCurrency(totalPurchaseValue)}
            color="blue.600"
          />
          <StatCard
            label="Current Value"
            value={formatCurrency(totalCurrentValue)}
            color="green.600"
          />
          <StatCard
            label="Total Gain/Loss"
            value={formatCurrency(totalGain)}
            color={totalGain >= 0 ? 'green.600' : 'red.600'}
          />
          <StatCard
            label="Total Assets"
            value={assets.length.toString()}
            color="purple.600"
          />
        </Grid>

        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search assets..."
        />

        {filteredAssets.length === 0 ? (
          <EmptyState
            title={searchTerm ? 'No assets found' : 'No assets yet'}
            description={
              searchTerm
                ? 'Try adjusting your search'
                : 'Add your first asset to start tracking'
            }
            actionLabel={!searchTerm ? 'Add Asset' : undefined}
            onAction={!searchTerm ? () => navigate('/assets/new') : undefined}
          />
        ) : (
          <ResponsiveTable
            data={filteredAssets}
            columns={[
              {
                header: 'Name',
                cell: (asset) => (
                  <VStack align="start" gap={0}>
                    <Text fontWeight="medium">{asset.asset_name}</Text>
                    {asset.subcategory && (
                      <Text fontSize="xs" color="text.secondary">
                        {asset.subcategory.subcategory_name}
                      </Text>
                    )}
                  </VStack>
                ),
              },
              {
                header: 'Type',
                cell: (asset) => asset.category ? (
                  <Badge colorScheme={getCategoryBadgeColor(asset.category.category_type)}>
                    {formatCategoryType(asset.category.category_type)}
                  </Badge>
                ) : '-',
              },
              {
                header: 'Category',
                cell: (asset) => asset.category?.category_name || '-',
              },
              {
                header: 'Purchase Date',
                cell: (asset) => asset.purchase_date ? format(new Date(asset.purchase_date), 'dd MMM yyyy') : '-',
              },
              {
                header: 'Purchase Price',
                cell: (asset) => formatCurrency(parseFloat(asset.purchase_price)),
                textAlign: 'right',
              },
              {
                header: 'Current Value',
                cell: (asset) => formatCurrency(parseFloat(asset.current_value || '0')),
                textAlign: 'right',
              },
              {
                header: 'Gain/Loss',
                cell: (asset) => {
                  // Backend returns returns and returns_percentage as numbers
                  const returns = typeof asset.returns === 'number' ? asset.returns : parseFloat(String(asset.returns || '0'));
                  const returnsPercent = typeof asset.returns_percentage === 'number' ? asset.returns_percentage : parseFloat(String(asset.returns_percentage || '0'));
                  return (
                    <Stack gap={0} alignItems="flex-end">
                      <Text
                        fontWeight="medium"
                        color={returns >= 0 ? 'green.600' : 'red.600'}
                      >
                        {formatCurrency(returns)}
                      </Text>
                      <Badge
                        colorScheme={returns >= 0 ? 'green' : 'red'}
                        fontSize="xs"
                      >
                        {returns >= 0 ? '+' : ''}
                        {returnsPercent.toFixed(2)}%
                      </Badge>
                    </Stack>
                  );
                },
                textAlign: 'right',
              },
              {
                header: 'Actions',
                cell: (asset) => (
                  <IconButton
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/assets/${asset.asset_id}`)}
                  >
                    <LuEye />
                  </IconButton>
                ),
              },
            ]}
            mobileConfig={{
              getKey: (asset) => asset.asset_id,
              summaryRender: (asset) => {
                // Backend returns returns and returns_percentage as numbers, but prices as strings
                const returns = typeof asset.returns === 'number' ? asset.returns : parseFloat(String(asset.returns || '0'));
                const returnsPercent = typeof asset.returns_percentage === 'number' ? asset.returns_percentage : parseFloat(String(asset.returns_percentage || '0'));
                const currentValue = parseFloat(String(asset.current_value || '0'));
                return (
                  <Flex justify="space-between" align="center" w="full">
                    <VStack align="start" gap={1} flex={1}>
                      <Text fontWeight="bold" fontSize="md">
                        {asset.asset_name}
                      </Text>
                      <HStack gap={2}>
                        <Text fontSize="lg" fontWeight="semibold">
                          {formatCurrency(currentValue)}
                        </Text>
                        <Badge colorScheme={returns >= 0 ? 'green' : 'red'} fontSize="xs">
                          {returns >= 0 ? '+' : ''}
                          {returnsPercent.toFixed(2)}%
                        </Badge>
                      </HStack>
                    </VStack>
                    <LuChevronDown />
                  </Flex>
                );
              },
              detailsRender: (asset) => {
                const returns = typeof asset.returns === 'number' ? asset.returns : parseFloat(String(asset.returns || '0'));
                const purchasePrice = parseFloat(String(asset.purchase_price));
                return (
                  <VStack align="stretch" gap={3}>
                    {asset.category && (
                      <Flex justify="space-between">
                        <Text color="text.secondary" fontSize="sm">
                          Type
                        </Text>
                        <Badge colorScheme={getCategoryBadgeColor(asset.category.category_type)}>
                          {formatCategoryType(asset.category.category_type)}
                        </Badge>
                      </Flex>
                    )}
                    {asset.category && (
                      <Flex justify="space-between">
                        <Text color="text.secondary" fontSize="sm">
                          Category
                        </Text>
                        <Text fontWeight="medium">{asset.category.category_name}</Text>
                      </Flex>
                    )}
                    {asset.subcategory && (
                      <Flex justify="space-between">
                        <Text color="text.secondary" fontSize="sm">
                          Subcategory
                        </Text>
                        <Text fontWeight="medium">{asset.subcategory.subcategory_name}</Text>
                      </Flex>
                    )}
                    {asset.purchase_date && (
                      <Flex justify="space-between">
                        <Text color="text.secondary" fontSize="sm">
                          Purchase Date
                        </Text>
                        <Text fontWeight="medium">
                          {format(new Date(asset.purchase_date), 'dd MMM yyyy')}
                        </Text>
                      </Flex>
                    )}
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Purchase Price
                      </Text>
                      <Text fontWeight="medium">{formatCurrency(purchasePrice)}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Gain/Loss
                      </Text>
                      <Text
                        fontWeight="bold"
                        color={returns >= 0 ? 'green.600' : 'red.600'}
                      >
                        {formatCurrency(returns)}
                      </Text>
                    </Flex>
                    {asset.description && (
                      <Flex direction="column" gap={1}>
                        <Text color="text.secondary" fontSize="sm">
                          Description
                        </Text>
                        <Text fontSize="sm">{asset.description}</Text>
                      </Flex>
                    )}
                    <Flex pt={2} borderTopWidth="1px" mt={2} gap={2}>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        variant="outline"
                        flex={1}
                        onClick={() => navigate(`/assets/${asset.asset_id}`)}
                      >
                        View Details
                      </Button>
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

export default AssetsListPage;

