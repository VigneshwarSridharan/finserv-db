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

interface Asset {
  id: number;
  name: string;
  asset_type: string;
  category_name: string;
  purchase_price: number;
  purchase_date: string;
  current_value: number;
  description?: string;
}

const AssetsListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const { data: response, isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => assetService.getAll(),
  });

  const assets: Asset[] = response?.data || [];

  const filteredAssets = assets.filter((asset) =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPurchaseValue = assets.reduce((sum, asset) => sum + asset.purchase_price, 0);
  const totalCurrentValue = assets.reduce((sum, asset) => sum + asset.current_value, 0);
  const totalGain = totalCurrentValue - totalPurchaseValue;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value);
  };

  const getAssetTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'REAL_ESTATE':
        return 'purple';
      case 'GOLD':
        return 'yellow';
      case 'VEHICLE':
        return 'blue';
      case 'OTHER':
        return 'gray';
      default:
        return 'gray';
    }
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
            colorScheme="blue"
          />
          <StatCard
            label="Current Value"
            value={formatCurrency(totalCurrentValue)}
            colorScheme="green"
          />
          <StatCard
            label="Total Gain/Loss"
            value={formatCurrency(totalGain)}
            colorScheme={totalGain >= 0 ? 'green' : 'red'}
          />
          <StatCard
            label="Total Assets"
            value={assets.length.toString()}
            colorScheme="purple"
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
            action={
              !searchTerm ? (
                <Button colorScheme="blue" onClick={() => navigate('/assets/new')}>
                  <LuPlus /> Add Asset
                </Button>
              ) : undefined
            }
          />
        ) : (
          <ResponsiveTable
            data={filteredAssets}
            columns={[
              {
                header: 'Name',
                cell: (asset) => <Text fontWeight="medium">{asset.name}</Text>,
              },
              {
                header: 'Type',
                cell: (asset) => (
                  <Badge colorScheme={getAssetTypeBadgeColor(asset.asset_type)}>
                    {asset.asset_type.replace('_', ' ')}
                  </Badge>
                ),
              },
              {
                header: 'Category',
                cell: (asset) => asset.category_name,
              },
              {
                header: 'Purchase Date',
                cell: (asset) => format(new Date(asset.purchase_date), 'dd MMM yyyy'),
              },
              {
                header: 'Purchase Price',
                cell: (asset) => formatCurrency(asset.purchase_price),
                textAlign: 'right',
              },
              {
                header: 'Current Value',
                cell: (asset) => formatCurrency(asset.current_value),
                textAlign: 'right',
              },
              {
                header: 'Gain/Loss',
                cell: (asset) => {
                  const gain = asset.current_value - asset.purchase_price;
                  const gainPercent = (gain / asset.purchase_price) * 100;
                  return (
                    <Stack gap={0} alignItems="flex-end">
                      <Text
                        fontWeight="medium"
                        color={gain >= 0 ? 'green.600' : 'red.600'}
                      >
                        {formatCurrency(gain)}
                      </Text>
                      <Badge
                        colorScheme={gain >= 0 ? 'green' : 'red'}
                        fontSize="xs"
                      >
                        {gain >= 0 ? '+' : ''}
                        {gainPercent.toFixed(2)}%
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
                    onClick={() => navigate(`/assets/${asset.id}`)}
                  >
                    <LuEye />
                  </IconButton>
                ),
              },
            ]}
            mobileConfig={{
              getKey: (asset) => asset.id,
              summaryRender: (asset) => {
                const gain = asset.current_value - asset.purchase_price;
                const gainPercent = (gain / asset.purchase_price) * 100;
                return (
                  <Flex justify="space-between" align="center" w="full">
                    <VStack align="start" gap={1} flex={1}>
                      <Text fontWeight="bold" fontSize="md">
                        {asset.name}
                      </Text>
                      <HStack gap={2}>
                        <Text fontSize="lg" fontWeight="semibold">
                          {formatCurrency(asset.current_value)}
                        </Text>
                        <Badge colorScheme={gain >= 0 ? 'green' : 'red'} fontSize="xs">
                          {gain >= 0 ? '+' : ''}
                          {gainPercent.toFixed(2)}%
                        </Badge>
                      </HStack>
                    </VStack>
                    <HStack gap={2}>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/assets/${asset.id}`);
                        }}
                      >
                        <LuEye />
                      </IconButton>
                      <LuChevronDown />
                    </HStack>
                  </Flex>
                );
              },
              detailsRender: (asset) => (
                <VStack align="stretch" gap={3}>
                  <Flex justify="space-between">
                    <Text color="text.secondary" fontSize="sm">
                      Type
                    </Text>
                    <Badge colorScheme={getAssetTypeBadgeColor(asset.asset_type)}>
                      {asset.asset_type.replace('_', ' ')}
                    </Badge>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="text.secondary" fontSize="sm">
                      Category
                    </Text>
                    <Text fontWeight="medium">{asset.category_name}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="text.secondary" fontSize="sm">
                      Purchase Date
                    </Text>
                    <Text fontWeight="medium">
                      {format(new Date(asset.purchase_date), 'dd MMM yyyy')}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="text.secondary" fontSize="sm">
                      Purchase Price
                    </Text>
                    <Text fontWeight="medium">{formatCurrency(asset.purchase_price)}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="text.secondary" fontSize="sm">
                      Gain/Loss
                    </Text>
                    <Text
                      fontWeight="bold"
                      color={
                        asset.current_value - asset.purchase_price >= 0
                          ? 'green.600'
                          : 'red.600'
                      }
                    >
                      {formatCurrency(asset.current_value - asset.purchase_price)}
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
                </VStack>
              ),
            }}
          />
        )}
      </Stack>
    </Container>
  );
};

export default AssetsListPage;

