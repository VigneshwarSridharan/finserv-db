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
import { LuPlus, LuPencil, LuCoins, LuChevronDown } from 'react-icons/lu';
import { format } from 'date-fns';
import { assetService, assetCategoryService } from '../../api/services/assets.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatCard from '../../components/common/StatCard';
import SearchBar from '../../components/common/SearchBar';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import AssetFormDialog from './AssetFormDialog';
import GoldDetailsDialog from './GoldDetailsDialog';
import type { Asset } from '../../types/domain.types';

const GoldPage = () => {
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
  const preciousMetalCategory = categories.find((cat) => cat.category_type === 'precious_metal');
  const preciousMetalCategoryId = preciousMetalCategory?.category_id;

  const assets: Asset[] = response?.data || [];

  // Filter only precious metal assets (gold)
  const goldAssets = useMemo(() => {
    return assets.filter((asset) => asset.category?.category_type === 'precious_metal');
  }, [assets]);

  const filteredAssets = useMemo(() => {
    return goldAssets.filter((asset) =>
      asset.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [goldAssets, searchTerm]);

  const totalItems = goldAssets.length;
  const totalWeight = goldAssets.reduce((sum, asset) => {
    const quantity = asset.quantity ? parseFloat(asset.quantity) : 0;
    return sum + quantity;
  }, 0);
  const totalInvestment = goldAssets.reduce((sum, asset) => sum + parseFloat(asset.purchase_price || '0'), 0);
  const totalCurrentValue = goldAssets.reduce((sum, asset) => sum + parseFloat(asset.current_value || '0'), 0);
  const totalGain = totalCurrentValue - totalInvestment;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatWeight = (grams: number) => {
    return `${grams.toFixed(4)} g`;
  };

  const getGoldTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'jewelry':
        return 'yellow';
      case 'coins':
        return 'orange';
      case 'bars':
        return 'amber';
      case 'etf':
        return 'blue';
      case 'mutual_fund':
        return 'purple';
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
            <LuCoins size={28} />
            <Heading size="lg">Gold Assets</Heading>
          </HStack>
          <Button
            colorScheme="yellow"
            onClick={() => handleOpenAssetDialog()}
            disabled={!preciousMetalCategoryId}
          >
            <LuPlus /> Add Gold
          </Button>
        </HStack>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
          <StatCard
            label="Total Items"
            value={totalItems.toString()}
            color="purple.600"
          />
          <StatCard
            label="Total Weight"
            value={formatWeight(totalWeight)}
            color="amber.600"
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
        </Grid>

        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search gold assets..."
        />

        {filteredAssets.length === 0 ? (
          <EmptyState
            title={searchTerm ? 'No gold assets found' : 'No gold assets yet'}
            description={
              searchTerm
                ? 'Try adjusting your search'
                : 'Add your first gold asset to start tracking'
            }
            actionLabel={!searchTerm ? 'Add Gold' : undefined}
            onAction={!searchTerm && preciousMetalCategoryId ? () => handleOpenAssetDialog() : undefined}
          />
        ) : (
          <ResponsiveTable
            data={filteredAssets}
            columns={[
              {
                header: 'Asset Name',
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
                header: 'Weight',
                cell: (asset) => {
                  const weight = asset.quantity ? parseFloat(asset.quantity) : 0;
                  return (
                    <Text fontWeight="medium">
                      {formatWeight(weight)}
                    </Text>
                  );
                },
              },
              {
                header: 'Unit',
                cell: (asset) => asset.unit || '-',
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
                      colorScheme="yellow"
                      onClick={() => handleOpenDetailsDialog(asset)}
                      title="Gold Details"
                    >
                      <LuCoins />
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
                const weight = asset.quantity ? parseFloat(asset.quantity) : 0;
                return (
                  <Flex justify="space-between" align="center" w="full">
                    <VStack align="start" gap={1} flex={1}>
                      <Text fontWeight="bold" fontSize="md">
                        {asset.asset_name}
                      </Text>
                      <Text fontSize="xs" color="text.secondary">
                        {formatWeight(weight)}
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
                const weight = asset.quantity ? parseFloat(asset.quantity) : 0;
                return (
                  <VStack align="stretch" gap={3}>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Weight
                      </Text>
                      <Text fontWeight="medium">{formatWeight(weight)}</Text>
                    </Flex>
                    {asset.subcategory && (
                      <Flex justify="space-between">
                        <Text color="text.secondary" fontSize="sm">
                          Type
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
                        onClick={() => handleOpenAssetDialog(asset)}
                      >
                        Edit Asset
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="yellow"
                        flex={1}
                        onClick={() => handleOpenDetailsDialog(asset)}
                      >
                        Gold Details
                      </Button>
                    </Flex>
                  </VStack>
                );
              },
            }}
          />
        )}
      </Stack>

      {preciousMetalCategoryId && (
        <AssetFormDialog
          isOpen={isAssetDialogOpen}
          onClose={handleCloseAssetDialog}
          asset={selectedAsset}
          defaultCategoryId={preciousMetalCategoryId}
        />
      )}

      {selectedAsset && (
        <GoldDetailsDialog
          isOpen={isDetailsDialogOpen}
          onClose={handleCloseDetailsDialog}
          assetId={selectedAsset.asset_id}
        />
      )}
    </Container>
  );
};

export default GoldPage;

