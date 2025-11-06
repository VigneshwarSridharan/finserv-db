import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Heading,
  Stack,
  Card,
  Button,
  Input,
  Text,
  HStack,
  VStack,
  Grid,
  Badge,
  Alert,
  Spinner,
  NativeSelect,
  SimpleGrid,
  SegmentGroup,
  SegmentGroupItemText,
} from '@chakra-ui/react';
import { LuTrendingUp, LuDownload, LuRefreshCw, LuCircleCheck } from 'react-icons/lu';
import { marketDataService, type MarketData } from '../../api/services/market-data.service';
import { securitiesService } from '../../api/services/securities.service';
import { toaster } from '../../components/ui/toaster';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Field } from '../../components/ui/field';
import type { Security } from '../../types/domain.types';

type SecurityTypeFilter = 'all' | 'equity' | 'bond';

const MarketDataTestPage = () => {
  const queryClient = useQueryClient();
  const [symbol, setSymbol] = useState('');
  const [securityTypeFilter, setSecurityTypeFilter] = useState<SecurityTypeFilter>('all');
  const [fetchType, setFetchType] = useState<'equity' | 'bond'>('equity');
  const [selectedSecurityId, setSelectedSecurityId] = useState<number | null>(null);
  const [fetchedData, setFetchedData] = useState<MarketData | null>(null);
  const [batchSecurityIds, setBatchSecurityIds] = useState<number[]>([]);

  // Fetch all securities for dropdown
  const { data: securitiesResponse, isLoading: securitiesLoading } = useQuery({
    queryKey: ['securities'],
    queryFn: () => securitiesService.getAll({ limit: 100 }),
  });

  const securities = securitiesResponse?.data || [];

  // Fetch LTP mutation
  const fetchLTPMutation = useMutation({
    mutationFn: ({ sym, type }: { sym: string; type: 'equity' | 'bond' }) => 
      marketDataService.fetchLTP(sym, type),
    onSuccess: (response) => {
      if (response.success && response.data) {
        setFetchedData(response.data);
        toaster.success({
          title: 'LTP Fetched',
          description: `Successfully fetched ${fetchType} price for ${symbol}`,
        });
      }
    },
    onError: (error: any) => {
      toaster.error({
        title: 'Fetch Failed',
        description: error.error || 'Failed to fetch LTP',
      });
    },
  });

  // Update security LTP mutation
  const updateLTPMutation = useMutation({
    mutationFn: (securityId: number) => marketDataService.updateSecurityLTP(securityId),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['securities'] });
        queryClient.invalidateQueries({ queryKey: ['security-prices'] });
        toaster.success({
          title: 'Price Updated',
          description: 'Security price updated successfully in database',
        });
      }
    },
    onError: (error: any) => {
      toaster.error({
        title: 'Update Failed',
        description: error.error || 'Failed to update security price',
      });
    },
  });

  // Batch update mutation
  const batchUpdateMutation = useMutation({
    mutationFn: (securityIds: number[]) => marketDataService.batchUpdateLTP(securityIds),
    onSuccess: (response) => {
      if (response.success && response.data) {
        queryClient.invalidateQueries({ queryKey: ['securities'] });
        queryClient.invalidateQueries({ queryKey: ['security-prices'] });
        toaster.success({
          title: 'Batch Update Complete',
          description: `${response.data.success} succeeded, ${response.data.failed} failed`,
        });
      }
    },
    onError: (error: any) => {
      toaster.error({
        title: 'Batch Update Failed',
        description: error.error || 'Failed to batch update prices',
      });
    },
  });

  const handleFetchLTP = () => {
    if (!symbol.trim()) {
      toaster.error({
        title: 'Invalid Input',
        description: 'Please enter a symbol',
      });
      return;
    }
    fetchLTPMutation.mutate({ sym: symbol.toUpperCase(), type: fetchType });
  };

  const handleUpdateSecurity = () => {
    if (!selectedSecurityId) {
      toaster.error({
        title: 'Invalid Selection',
        description: 'Please select a security',
      });
      return;
    }
    updateLTPMutation.mutate(selectedSecurityId);
  };

  const handleBatchUpdate = () => {
    if (batchSecurityIds.length === 0) {
      toaster.error({
        title: 'Invalid Selection',
        description: 'Please select at least one security',
      });
      return;
    }
    batchUpdateMutation.mutate(batchSecurityIds);
  };

  const toggleSecurityInBatch = (securityId: number) => {
    setBatchSecurityIds((prev) =>
      prev.includes(securityId)
        ? prev.filter((id) => id !== securityId)
        : [...prev, securityId]
    );
  };

  // Filter securities by exchange and security type
  const nseSecurities = securities.filter((s: Security) => {
    if (s.exchange !== 'NSE') return false;
    if (securityTypeFilter === 'all') return true;
    return s.security_type === securityTypeFilter;
  });

  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={6}>
        <Stack gap={2}>
          <Heading size="lg">Market Data Test - LTP Fetching</Heading>
          <Text color="text.secondary">
            Test fetching Latest Trading Price (LTP) from NSE/BSE exchanges for equities and bonds, and update security prices in the database.
          </Text>
        </Stack>

        {/* Fetch LTP by Symbol */}
        <Card.Root>
          <Card.Header>
            <Heading size="md">Fetch LTP by Symbol</Heading>
          </Card.Header>
          <Card.Body>
            <Stack gap={4}>
              <Field label="Security Type">
                <SegmentGroup.Root
                  value={fetchType}
                  onValueChange={(details) => {
                    const value = typeof details === 'string' ? details : details.value;
                    setFetchType(value as 'equity' | 'bond');
                  }}
                >
                  <SegmentGroup.Indicator />
                  
                  <SegmentGroup.Item value="equity">
                    <SegmentGroupItemText>Equity</SegmentGroupItemText>
                    <SegmentGroup.ItemHiddenInput />
                  </SegmentGroup.Item>
                  <SegmentGroup.Item value="bond">
                    <SegmentGroupItemText>Bond</SegmentGroupItemText>
                    <SegmentGroup.ItemHiddenInput />
                  </SegmentGroup.Item>
                </SegmentGroup.Root>
              </Field>
              <HStack gap={4}>
                <Field label="Symbol" flex={1}>
                  <Input
                    placeholder={fetchType === 'bond' ? "Enter bond symbol (e.g., BOND001)" : "Enter symbol (e.g., RELIANCE, TCS, INFY)"}
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && handleFetchLTP()}
                  />
                </Field>
                <Button
                  colorScheme="blue"
                  onClick={handleFetchLTP}
                  loading={fetchLTPMutation.isPending}
                >
                  <LuTrendingUp style={{ marginRight: '8px' }} /> Fetch LTP
                </Button>
              </HStack>

              {fetchedData && (
                <Card.Root variant="outline" bg="bg.subtle">
                  <Card.Body>
                    <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                      <VStack align="start" gap={1}>
                        <Text fontSize="sm" color="text.secondary">LTP</Text>
                        <Text fontSize="xl" fontWeight="bold" color="blue.500">
                          ₹{fetchedData.ltp.toFixed(2)}
                        </Text>
                      </VStack>
                      <VStack align="start" gap={1}>
                        <Text fontSize="sm" color="text.secondary">Open</Text>
                        <Text fontSize="lg">₹{fetchedData.open.toFixed(2)}</Text>
                      </VStack>
                      <VStack align="start" gap={1}>
                        <Text fontSize="sm" color="text.secondary">High</Text>
                        <Text fontSize="lg" color="green.500">
                          ₹{fetchedData.high.toFixed(2)}
                        </Text>
                      </VStack>
                      <VStack align="start" gap={1}>
                        <Text fontSize="sm" color="text.secondary">Low</Text>
                        <Text fontSize="lg" color="red.500">
                          ₹{fetchedData.low.toFixed(2)}
                        </Text>
                      </VStack>
                      <VStack align="start" gap={1}>
                        <Text fontSize="sm" color="text.secondary">Previous Close</Text>
                        <Text fontSize="lg">₹{fetchedData.close.toFixed(2)}</Text>
                      </VStack>
                      <VStack align="start" gap={1}>
                        <Text fontSize="sm" color="text.secondary">Volume</Text>
                        <Text fontSize="lg">
                          {fetchedData.volume.toLocaleString('en-IN')}
                        </Text>
                      </VStack>
                      {fetchedData.change !== undefined && (
                        <VStack align="start" gap={1}>
                          <Text fontSize="sm" color="text.secondary">Change</Text>
                          <HStack>
                            <Text
                              fontSize="lg"
                              fontWeight="bold"
                              color={fetchedData.change >= 0 ? 'green.500' : 'red.500'}
                            >
                              {fetchedData.change >= 0 ? '+' : ''}
                              {fetchedData.change.toFixed(2)}
                            </Text>
                            {fetchedData.changePercent !== undefined && (
                              <Badge
                                colorScheme={fetchedData.changePercent >= 0 ? 'green' : 'red'}
                              >
                                {fetchedData.changePercent >= 0 ? '+' : ''}
                                {fetchedData.changePercent.toFixed(2)}%
                              </Badge>
                            )}
                          </HStack>
                        </VStack>
                      )}
                    </SimpleGrid>
                  </Card.Body>
                </Card.Root>
              )}
            </Stack>
          </Card.Body>
        </Card.Root>

        {/* Update Security Price */}
        <Card.Root>
          <Card.Header>
            <Heading size="md">Update Security Price in Database</Heading>
          </Card.Header>
          <Card.Body>
            <Stack gap={4}>
              <Field label="Filter by Security Type">
                <SegmentGroup.Root
                  value={securityTypeFilter}
                  onValueChange={(details) => {
                    const value = typeof details === 'string' ? details : details.value;
                    setSecurityTypeFilter(value as SecurityTypeFilter);
                    setSelectedSecurityId(null);
                  }}
                >
                  <SegmentGroup.Indicator />
                  <SegmentGroup.Item value="all">
                    <SegmentGroupItemText>All</SegmentGroupItemText>
                    <SegmentGroup.ItemHiddenInput />
                  </SegmentGroup.Item>
                  <SegmentGroup.Item value="equity">
                    <SegmentGroupItemText>Equity</SegmentGroupItemText>
                    <SegmentGroup.ItemHiddenInput />
                  </SegmentGroup.Item>
                  <SegmentGroup.Item value="bond">
                    <SegmentGroupItemText>Bond</SegmentGroupItemText>
                    <SegmentGroup.ItemHiddenInput />
                  </SegmentGroup.Item>
                </SegmentGroup.Root>
              </Field>
              <Field label="Select Security">
                {securitiesLoading ? (
                  <Spinner />
                ) : (
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      placeholder="Select a security"
                      value={selectedSecurityId?.toString() || ''}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setSelectedSecurityId(e.target.value ? parseInt(e.target.value) : null)
                      }
                    >
                      {nseSecurities.map((security: Security) => (
                        <option key={security.security_id} value={security.security_id.toString()}>
                          {security.symbol} - {(security as any).name || (security as any).security_name} ({security.security_type} - {security.exchange})
                        </option>
                      ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                )}
              </Field>
              <Button
                colorScheme="green"
                onClick={handleUpdateSecurity}
                loading={updateLTPMutation.isPending}
                disabled={!selectedSecurityId}
              >
                <LuDownload style={{ marginRight: '8px' }} /> Update Price in Database
              </Button>
              {updateLTPMutation.isSuccess && (
                <Alert.Root status="success">
                  <Alert.Indicator />
                  <Alert.Title>Price updated successfully!</Alert.Title>
                </Alert.Root>
              )}
            </Stack>
          </Card.Body>
        </Card.Root>

        {/* Batch Update */}
        <Card.Root>
          <Card.Header>
            <Heading size="md">Batch Update Multiple Securities</Heading>
          </Card.Header>
          <Card.Body>
            <Stack gap={4}>
              <Field label="Filter by Security Type">
                <SegmentGroup.Root
                  value={securityTypeFilter}
                  onValueChange={(details) => {
                    const value = typeof details === 'string' ? details : details.value;
                    setSecurityTypeFilter(value as SecurityTypeFilter);
                    setBatchSecurityIds([]);
                  }}
                >
                  <SegmentGroup.Indicator />
                  <SegmentGroup.Item value="all">
                    <SegmentGroupItemText>All</SegmentGroupItemText>
                    <SegmentGroup.ItemHiddenInput />
                  </SegmentGroup.Item>
                  <SegmentGroup.Item value="equity">
                    <SegmentGroupItemText>Equity</SegmentGroupItemText>
                    <SegmentGroup.ItemHiddenInput />
                  </SegmentGroup.Item>
                  <SegmentGroup.Item value="bond">
                    <SegmentGroupItemText>Bond</SegmentGroupItemText>
                    <SegmentGroup.ItemHiddenInput />
                  </SegmentGroup.Item>
                </SegmentGroup.Root>
              </Field>
              <Text color="text.secondary" fontSize="sm">
                Select multiple securities to update their prices in batch. This may take a few moments.
              </Text>

              {securitiesLoading ? (
                <LoadingSpinner />
              ) : (
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={3}>
                  {nseSecurities.slice(0, 20).map((security: Security) => (
                    <Button
                      key={security.security_id}
                      variant={batchSecurityIds.includes(security.security_id) ? 'solid' : 'outline'}
                      colorScheme={batchSecurityIds.includes(security.security_id) ? 'blue' : 'gray'}
                      onClick={() => toggleSecurityInBatch(security.security_id)}
                      size="sm"
                    >
                      {security.symbol}
                      <Badge size="sm" ml={1} colorScheme={security.security_type === 'bond' ? 'purple' : 'blue'}>
                        {security.security_type}
                      </Badge>
                      {batchSecurityIds.includes(security.security_id) && (
                        <LuCircleCheck style={{ marginLeft: '4px' }} />
                      )}
                    </Button>
                  ))}
                </Grid>
              )}

              {batchSecurityIds.length > 0 && (
                <Stack gap={2}>
                  <Text fontSize="sm" fontWeight="medium">
                    Selected: {batchSecurityIds.length} security(ies)
                  </Text>
                  <Button
                    colorScheme="purple"
                    onClick={handleBatchUpdate}
                    loading={batchUpdateMutation.isPending}
                    w="full"
                  >
                    <LuRefreshCw style={{ marginRight: '8px' }} /> Update {batchSecurityIds.length} Securities
                  </Button>
                </Stack>
              )}

              {batchUpdateMutation.isSuccess && batchUpdateMutation.data?.data && (
                <Alert.Root status="success">
                  <Alert.Indicator />
                  <Alert.Title>
                    Batch update completed: {batchUpdateMutation.data.data.success} succeeded,{' '}
                    {batchUpdateMutation.data.data.failed} failed
                  </Alert.Title>
                  {batchUpdateMutation.data.data.errors.length > 0 && (
                    <Alert.Description>
                      <Stack gap={1} mt={2}>
                        {batchUpdateMutation.data.data.errors.map((error, idx) => (
                          <Text key={idx} fontSize="sm">
                            {error}
                          </Text>
                        ))}
                      </Stack>
                    </Alert.Description>
                  )}
                </Alert.Root>
              )}
            </Stack>
          </Card.Body>
        </Card.Root>

        {/* Information Card */}
        <Card.Root variant="outline" bg="bg.subtle">
          <Card.Body>
            <Stack gap={2}>
              <Heading size="sm">Information</Heading>
              <Text fontSize="sm" color="text.secondary">
                • Currently supports NSE (National Stock Exchange) securities only
              </Text>
              <Text fontSize="sm" color="text.secondary">
                • Supports both equities and bonds - prices are fetched in real-time from NSE API
              </Text>
              <Text fontSize="sm" color="text.secondary">
                • Use the security type filter to view and update specific types (equity/bond)
              </Text>
              <Text fontSize="sm" color="text.secondary">
                • Batch updates include a 500ms delay between requests to avoid rate limiting
              </Text>
              <Text fontSize="sm" color="text.secondary">
                • Prices are stored with today's date - existing prices for today will be updated
              </Text>
            </Stack>
          </Card.Body>
        </Card.Root>
      </Stack>
    </Container>
  );
};

export default MarketDataTestPage;

