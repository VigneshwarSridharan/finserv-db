import { useState, useMemo } from 'react';
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
import { LuPlus, LuPencil, LuHouse, LuChevronDown } from 'react-icons/lu';
import { format } from 'date-fns';
import { assetService, assetCategoryService } from '../../api/services/assets.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatCard from '../../components/common/StatCard';
import SearchBar from '../../components/common/SearchBar';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import AssetFormDialog from './AssetFormDialog';
import RealEstateDetailsDialog from './RealEstateDetailsDialog';
import type { Asset } from '../../types/domain.types';

const RealEstatePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => assetService.getAll(),
  });

  const { data: categoriesResponse } = useQuery({
    queryKey: ['assetCategories'],
    queryFn: () => assetCategoryService.getAll(),
  });

  const categories = categoriesResponse?.data || [];
  const realEstateCategory = categories.find((cat) => cat.category_type === 'real_estate');
  const realEstateCategoryId = realEstateCategory?.category_id;

  const assets: Asset[] = response?.data || [];

  // Filter only real estate assets
  const realEstateAssets = useMemo(() => {
    return assets.filter((asset) => asset.category?.category_type === 'real_estate');
  }, [assets]);

  const filteredAssets = useMemo(() => {
    return realEstateAssets.filter((asset) =>
      asset.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [realEstateAssets, searchTerm]);

  const totalProperties = realEstateAssets.length;
  const totalInvestment = realEstateAssets.reduce((sum, asset) => sum + parseFloat(asset.purchase_price || '0'), 0);
  const totalCurrentValue = realEstateAssets.reduce((sum, asset) => sum + parseFloat(asset.current_value || '0'), 0);
  const totalGain = totalCurrentValue - totalInvestment;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPropertyType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getPropertyTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'residential':
        return 'blue';
      case 'commercial':
        return 'purple';
      case 'industrial':
        return 'orange';
      case 'agricultural':
        return 'green';
      case 'land':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const handleOpenAssetDialog = (asset?: Asset) => {
    setSelectedAsset(asset || null);
    setIsAssetDialogOpen(true);
  };

  const handleCloseAssetDialog = () => {
    setIsAssetDialogOpen(false);
    setSelectedAsset(null);
  };

  const handleOpenDetailsDialog = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsDetailsDialogOpen(true);
  };

  const handleCloseDetailsDialog = () => {
    setIsDetailsDialogOpen(false);
    setSelectedAsset(null);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={6}>
        <HStack justifyContent="space-between">
          <HStack gap={3}>
            <LuHouse size={28} />
            <Heading size="lg">Real Estate Properties</Heading>
          </HStack>
          <Button
            colorScheme="green"
            onClick={() => handleOpenAssetDialog()}
            disabled={!realEstateCategoryId}
          >
            <LuPlus /> Add Property
          </Button>
        </HStack>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
          <StatCard
            label="Total Properties"
            value={totalProperties.toString()}
            color="purple.600"
          />
          <StatCard
            label="Total Investment"
            value={formatCurrency(totalInvestment)}
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
        </Grid>

        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search properties by name or location..."
        />

        {filteredAssets.length === 0 ? (
          <EmptyState
            title={searchTerm ? 'No properties found' : 'No properties yet'}
            description={
              searchTerm
                ? 'Try adjusting your search'
                : 'Add your first real estate property to start tracking'
            }
            actionLabel={!searchTerm ? 'Add Property' : undefined}
            onAction={!searchTerm && realEstateCategoryId ? () => handleOpenAssetDialog() : undefined}
          />
        ) : (
          <ResponsiveTable
            data={filteredAssets}
            columns={[
              {
                header: 'Property Name',
                cell: (asset) => (
                  <VStack align="start" gap={0}>
                    <Text fontWeight="medium">{asset.asset_name}</Text>
                    {asset.location && (
                      <Text fontSize="xs" color="text.secondary">
                        {asset.location}
                      </Text>
                    )}
                  </VStack>
                ),
              },
              {
                header: 'Category',
                cell: (asset) => asset.subcategory?.subcategory_name || asset.category?.category_name || '-',
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
                  <HStack gap={2}>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenAssetDialog(asset)}
                      title="Edit Asset"
                    >
                      <LuPencil />
                    </IconButton>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      colorScheme="green"
                      onClick={() => handleOpenDetailsDialog(asset)}
                      title="Property Details"
                    >
                      <LuHouse />
                    </IconButton>
                  </HStack>
                ),
              },
            ]}
            mobileConfig={{
              getKey: (asset) => asset.asset_id,
              summaryRender: (asset) => {
                const returns = typeof asset.returns === 'number' ? asset.returns : parseFloat(String(asset.returns || '0'));
                const returnsPercent = typeof asset.returns_percentage === 'number' ? asset.returns_percentage : parseFloat(String(asset.returns_percentage || '0'));
                const currentValue = parseFloat(String(asset.current_value || '0'));
                return (
                  <Flex justify="space-between" align="center" w="full">
                    <VStack align="start" gap={1} flex={1}>
                      <Text fontWeight="bold" fontSize="md">
                        {asset.asset_name}
                      </Text>
                      {asset.location && (
                        <Text fontSize="xs" color="text.secondary">
                          {asset.location}
                        </Text>
                      )}
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
                          Category
                        </Text>
                        <Text fontWeight="medium">
                          {asset.subcategory?.subcategory_name || asset.category?.category_name}
                        </Text>
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
                        onClick={() => handleOpenAssetDialog(asset)}
                      >
                        Edit Asset
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="green"
                        flex={1}
                        onClick={() => handleOpenDetailsDialog(asset)}
                      >
                        Property Details
                      </Button>
                    </Flex>
                  </VStack>
                );
              },
            }}
          />
        )}
      </Stack>

      {realEstateCategoryId && (
        <AssetFormDialog
          isOpen={isAssetDialogOpen}
          onClose={handleCloseAssetDialog}
          asset={selectedAsset}
          defaultCategoryId={realEstateCategoryId}
        />
      )}

      {selectedAsset && (
        <RealEstateDetailsDialog
          isOpen={isDetailsDialogOpen}
          onClose={handleCloseDetailsDialog}
          assetId={selectedAsset.asset_id}
        />
      )}
    </Container>
  );
};

export default RealEstatePage;

