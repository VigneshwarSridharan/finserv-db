import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Heading,
  Stack,
  Button,
  HStack,
  Badge,
  IconButton,
  VStack,
  Flex,
  Text,
  Grid,
} from '@chakra-ui/react';
import { LuPlus, LuPencil, LuTrash2, LuEye, LuChevronDown } from 'react-icons/lu';
import { bondsService } from '../../api/services/bonds.service';
import { toaster } from '../../components/ui/toaster';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import SearchBar from '../../components/common/SearchBar';
import StatCard from '../../components/common/StatCard';
import { SelectField } from '../../components/common/FormField';
import type { BondDetail } from '../../types/domain.types';
import { format } from 'date-fns';

const BondsPage = () => {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBond, setSelectedBond] = useState<BondDetail | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    bond_type: '',
    credit_rating: '',
  });
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['bonds', filters],
    queryFn: () => bondsService.getAll(filters),
  });

  const bonds: BondDetail[] = response?.data || [];

  // Filter bonds by search term
  const filteredBonds = useMemo(() => {
    return bonds.filter((bond) => {
      const matchesSearch =
        bond.issuer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bond.security?.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bond.security?.security_name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [bonds, searchTerm]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalBonds = filteredBonds.length;
    const bondsWithCoupon = filteredBonds.filter((b) => b.coupon_rate);
    const avgCouponRate =
      bondsWithCoupon.length > 0
        ? bondsWithCoupon.reduce((sum, b) => sum + parseFloat(b.coupon_rate || '0'), 0) /
          bondsWithCoupon.length
        : 0;

    const bondsWithMaturity = filteredBonds.filter((b) => b.maturity_date);
    const avgDaysToMaturity =
      bondsWithMaturity.length > 0
        ? bondsWithMaturity.reduce((sum, b) => {
            const days = calculateDaysToMaturity(b.maturity_date);
            return sum + (days || 0);
          }, 0) / bondsWithMaturity.length
        : 0;

    const maturingSoon = filteredBonds.filter((b) => {
      const days = calculateDaysToMaturity(b.maturity_date);
      return days !== null && days < 365;
    }).length;

    return {
      totalBonds,
      avgCouponRate,
      avgDaysToMaturity: Math.round(avgDaysToMaturity),
      maturingSoon,
    };
  }, [filteredBonds]);

  const deleteMutation = useMutation({
    mutationFn: (securityId: number) => bondsService.delete(securityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bonds'] });
      toaster.create({
        title: 'Bond deleted successfully',
        type: 'success',
      });
      setIsDeleteDialogOpen(false);
      setSelectedBond(null);
    },
    onError: () => {
      toaster.create({
        title: 'Failed to delete bond',
        type: 'error',
      });
    },
  });

  const handleDelete = (bond: BondDetail) => {
    setSelectedBond(bond);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedBond) {
      deleteMutation.mutate(selectedBond.security_id);
    }
  };

  const handleView = (bond: BondDetail) => {
    navigate(`/securities/bonds/${bond.security_id}`);
  };

  const handleEdit = (bond: BondDetail) => {
    navigate(`/securities/bonds/${bond.security_id}/edit`);
  };

  const formatCurrency = (value: string | null | undefined) => {
    if (!value) return '-';
    const num = parseFloat(value);
    return `${num.toFixed(2)}%`;
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return '-';
    try {
      return format(new Date(date), 'MMM dd, yyyy');
    } catch {
      return date;
    }
  };

  const calculateDaysToMaturity = (maturityDate: string) => {
    try {
      const maturity = new Date(maturityDate);
      const today = new Date();
      const diffTime = maturity.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={6}>
        <HStack justifyContent="space-between">
          <Heading size="lg">Bonds</Heading>
          <Button colorScheme="blue" onClick={() => navigate('/securities/bonds/new')}>
            <LuPlus /> Add Bond
          </Button>
        </HStack>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
          <StatCard
            label="Total Bonds"
            value={summary.totalBonds.toString()}
            color="blue.500"
          />
          <StatCard
            label="Avg Coupon Rate"
            value={summary.avgCouponRate > 0 ? `${summary.avgCouponRate.toFixed(2)}%` : '-'}
            color="purple.500"
          />
          <StatCard
            label="Avg Days to Maturity"
            value={summary.avgDaysToMaturity > 0 ? `${summary.avgDaysToMaturity} days` : '-'}
            color="teal.500"
          />
          <StatCard
            label="Maturing Soon"
            value={summary.maturingSoon.toString()}
            color={summary.maturingSoon > 0 ? 'orange.500' : 'gray.500'}
            trend={
              summary.maturingSoon > 0
                ? {
                    value: '< 1 year',
                    isPositive: false,
                  }
                : undefined
            }
          />
        </Grid>

        <Stack direction={{ base: 'column', md: 'row' }} gap={4}>
          <Flex flex={1}>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by issuer, symbol, or name..."
            />
          </Flex>
          <SelectField
            label="Bond Type"
            placeholder="Bond Type"
            value={filters.bond_type}
            onChange={(value) => setFilters({ ...filters, bond_type: value as string })}
            options={[
              { value: '', label: 'All Types' },
              { value: 'government', label: 'Government' },
              { value: 'corporate', label: 'Corporate' },
              { value: 'municipal', label: 'Municipal' },
              { value: 'treasury', label: 'Treasury' },
              { value: 'corporate_high_yield', label: 'Corporate High Yield' },
            ]}
          />
          <SelectField
            label="Credit Rating"
            placeholder="Credit Rating"
            value={filters.credit_rating}
            onChange={(value) => setFilters({ ...filters, credit_rating: value as string })}
            options={[
              { value: '', label: 'All Ratings' },
              { value: 'AAA', label: 'AAA' },
              { value: 'AA', label: 'AA' },
              { value: 'A', label: 'A' },
              { value: 'BBB', label: 'BBB' },
              { value: 'BB', label: 'BB' },
              { value: 'B', label: 'B' },
              { value: 'CCC', label: 'CCC' },
              { value: 'D', label: 'D' },
            ]}
          />
        </Stack>

        {filteredBonds.length === 0 ? (
          <EmptyState
            title={searchTerm || filters.bond_type || filters.credit_rating ? 'No bonds found' : 'No bonds yet'}
            description={
              searchTerm || filters.bond_type || filters.credit_rating
                ? 'Try adjusting your search or filters'
                : 'Add your first bond to get started'
            }
            actionLabel={searchTerm || filters.bond_type || filters.credit_rating ? undefined : 'Add Bond'}
            onAction={
              searchTerm || filters.bond_type || filters.credit_rating
                ? undefined
                : () => navigate('/securities/bonds/new')
            }
          />
        ) : (
          <ResponsiveTable
            data={filteredBonds}
            columns={[
              {
                header: 'Symbol',
                cell: (bond) => (
                  <Text fontWeight="medium">{bond.security?.symbol || '-'}</Text>
                ),
              },
              {
                header: 'Name',
                cell: (bond) => (
                  <Text>{bond.security?.security_name || '-'}</Text>
                ),
              },
              {
                header: 'Issuer',
                cell: (bond) => <Text fontWeight="medium">{bond.issuer}</Text>,
              },
              {
                header: 'Coupon Rate',
                cell: (bond) => formatCurrency(bond.coupon_rate),
              },
              {
                header: 'Maturity Date',
                cell: (bond) => formatDate(bond.maturity_date),
              },
              {
                header: 'Days to Maturity',
                cell: (bond) => {
                  const days = calculateDaysToMaturity(bond.maturity_date);
                  if (days === null) return '-';
                  return (
                    <Badge colorScheme={days < 365 ? 'orange' : days < 1825 ? 'blue' : 'green'}>
                      {days} days
                    </Badge>
                  );
                },
              },
              {
                header: 'Credit Rating',
                cell: (bond) =>
                  bond.credit_rating ? (
                    <Badge
                      colorScheme={
                        ['AAA', 'AA'].includes(bond.credit_rating)
                          ? 'green'
                          : ['A', 'BBB'].includes(bond.credit_rating)
                          ? 'blue'
                          : 'orange'
                      }
                    >
                      {bond.credit_rating}
                    </Badge>
                  ) : (
                    '-'
                  ),
              },
              {
                header: 'Type',
                cell: (bond) =>
                  bond.bond_type ? (
                    <Badge colorScheme="purple">
                      {bond.bond_type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  ) : (
                    '-'
                  ),
              },
              {
                header: 'Actions',
                cell: (bond) => (
                  <HStack gap={2}>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      onClick={() => handleView(bond)}
                    >
                      <LuEye />
                    </IconButton>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(bond)}
                    >
                      <LuPencil />
                    </IconButton>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleDelete(bond)}
                    >
                      <LuTrash2 />
                    </IconButton>
                  </HStack>
                ),
              },
            ]}
            mobileConfig={{
              getKey: (bond) => bond.bond_id,
              summaryRender: (bond) => {
                const days = calculateDaysToMaturity(bond.maturity_date);
                return (
                  <Flex justify="space-between" align="center" w="full">
                    <VStack align="start" gap={1} flex={1}>
                      <Text fontWeight="bold" fontSize="md">
                        {bond.security?.security_name || bond.security?.symbol || 'Unknown'}
                      </Text>
                      <Text fontSize="sm" color="text.secondary">
                        {bond.issuer}
                      </Text>
                      <HStack gap={2} flexWrap="wrap">
                        {bond.coupon_rate && (
                          <Badge colorScheme="blue" fontSize="xs">
                            {formatCurrency(bond.coupon_rate)} Coupon
                          </Badge>
                        )}
                        {bond.credit_rating && (
                          <Badge
                            colorScheme={
                              ['AAA', 'AA'].includes(bond.credit_rating)
                                ? 'green'
                                : ['A', 'BBB'].includes(bond.credit_rating)
                                ? 'blue'
                                : 'orange'
                            }
                            fontSize="xs"
                          >
                            {bond.credit_rating}
                          </Badge>
                        )}
                        {days !== null && (
                          <Badge
                            colorScheme={days < 365 ? 'orange' : days < 1825 ? 'blue' : 'green'}
                            fontSize="xs"
                          >
                            {days} days
                          </Badge>
                        )}
                      </HStack>
                    </VStack>
                    <LuChevronDown />
                  </Flex>
                );
              },
              detailsRender: (bond) => {
                const days = calculateDaysToMaturity(bond.maturity_date);
                return (
                  <VStack align="stretch" gap={3} mt={2}>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Symbol
                      </Text>
                      <Text fontWeight="medium">{bond.security?.symbol || '-'}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Coupon Rate
                      </Text>
                      <Text fontWeight="medium">{formatCurrency(bond.coupon_rate)}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Maturity Date
                      </Text>
                      <Text fontWeight="medium">{formatDate(bond.maturity_date)}</Text>
                    </Flex>
                    {days !== null && (
                      <Flex justify="space-between">
                        <Text color="text.secondary" fontSize="sm">
                          Days to Maturity
                        </Text>
                        <Badge
                          colorScheme={days < 365 ? 'orange' : days < 1825 ? 'blue' : 'green'}
                        >
                          {days} days
                        </Badge>
                      </Flex>
                    )}
                    {bond.bond_type && (
                      <Flex justify="space-between">
                        <Text color="text.secondary" fontSize="sm">
                          Type
                        </Text>
                        <Badge colorScheme="purple">
                          {bond.bond_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </Flex>
                    )}
                    {bond.credit_rating && (
                      <Flex justify="space-between">
                        <Text color="text.secondary" fontSize="sm">
                          Credit Rating
                        </Text>
                        <Badge
                          colorScheme={
                            ['AAA', 'AA'].includes(bond.credit_rating)
                              ? 'green'
                              : ['A', 'BBB'].includes(bond.credit_rating)
                              ? 'blue'
                              : 'orange'
                          }
                        >
                          {bond.credit_rating}
                        </Badge>
                      </Flex>
                    )}
                    {bond.yield_to_maturity && (
                      <Flex justify="space-between">
                        <Text color="text.secondary" fontSize="sm">
                          Yield to Maturity
                        </Text>
                        <Text fontWeight="medium">{formatCurrency(bond.yield_to_maturity)}</Text>
                      </Flex>
                    )}
                  </VStack>
                );
              },
            }}
          />
        )}

        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedBond(null);
          }}
          onConfirm={confirmDelete}
          title="Delete Bond"
          message={`Are you sure you want to delete bond details for ${selectedBond?.security?.symbol || selectedBond?.security?.security_name || 'this bond'}?`}
          confirmText="Delete"
          cancelText="Cancel"
          colorScheme="red"
        />
      </Stack>
    </Container>
  );
};

export default BondsPage;

