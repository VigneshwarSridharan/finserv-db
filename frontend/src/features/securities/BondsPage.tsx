import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogCloseTrigger,
  DialogActionTrigger,
  DialogBackdrop,
  DialogPositioner,
  Portal,
} from '@chakra-ui/react';
import { LuPlus, LuPencil, LuTrash2, LuChevronDown } from 'react-icons/lu';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { bondsService } from '../../api/services/bonds.service';
import { bondRepaymentsService } from '../../api/services/bond-repayments.service';
import { securitiesService, holdingsService } from '../../api/services/securities.service';
import { toaster } from '../../components/ui/toaster';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import SearchBar from '../../components/common/SearchBar';
import StatCard from '../../components/common/StatCard';
import { InputField, SelectField } from '../../components/common/FormField';
import BondRepaymentsList from './BondRepaymentsList';
import type {
  BondDetail,
  CreateBondDetailRequest,
  UpdateBondDetailRequest,
  BondRepayment,
  CreateBondRepaymentRequest,
  UpdateBondRepaymentRequest,
  GenerateRepaymentScheduleRequest,
} from '../../types/domain.types';

const bondSchema = z.object({
  security_id: z.number({ message: 'Security is required' }),
  issuer: z.string().min(1, 'Issuer is required'),
  coupon_rate: z.number().min(0).max(100).optional().nullable(),
  maturity_date: z.string().min(1, 'Maturity date is required'),
  coupon_payment_frequency: z.enum(['annual', 'semi_annual', 'quarterly', 'monthly']).optional().nullable(),
  bond_type: z.enum(['government', 'corporate', 'municipal', 'treasury', 'corporate_high_yield']).optional().nullable(),
  credit_rating: z.enum(['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'D']).optional().nullable(),
  yield_to_maturity: z.number().min(0).max(100).optional().nullable(),
  issue_date: z.string().optional().nullable(),
  next_coupon_date: z.string().optional().nullable(),
  day_count_convention: z.enum(['30/360', 'actual/365', 'actual/360']).optional().nullable(),
});

const repaymentSchema = z.object({
  holding_id: z.number({ message: 'Holding is required' }),
  security_id: z.number({ message: 'Security is required' }),
  repayment_type: z.enum(['coupon', 'principal']),
  scheduled_date: z.string().min(1, 'Scheduled date is required'),
  scheduled_amount: z.number().min(0, 'Scheduled amount must be 0 or greater'),
  actual_payment_date: z.string().optional().nullable(),
  actual_amount: z.number().min(0).optional().nullable(),
  payment_status: z.enum(['scheduled', 'paid', 'overdue', 'missed']).optional(),
  coupon_period_start: z.string().optional().nullable(),
  coupon_period_end: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const scheduleSchema = z.object({
  holding_id: z.number({ message: 'Holding is required' }),
  security_id: z.number({ message: 'Security is required' }),
  start_date: z.string().optional(),
  include_past: z.boolean().optional(),
});

type BondFormData = z.infer<typeof bondSchema>;
type RepaymentFormData = z.infer<typeof repaymentSchema>;
type ScheduleFormData = z.infer<typeof scheduleSchema>;

const BondsPage = () => {
  const [isBondDialogOpen, setIsBondDialogOpen] = useState(false);
  const [isRepaymentDialogOpen, setIsRepaymentDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isDeleteBondDialogOpen, setIsDeleteBondDialogOpen] = useState(false);
  const [isDeleteRepaymentDialogOpen, setIsDeleteRepaymentDialogOpen] = useState(false);
  const [selectedBond, setSelectedBond] = useState<BondDetail | null>(null);
  const [selectedRepayment, setSelectedRepayment] = useState<BondRepayment | null>(null);
  const [selectedBondForRepayment, setSelectedBondForRepayment] = useState<BondDetail | null>(null);
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

  const { data: securitiesResponse } = useQuery({
    queryKey: ['securities', 'bond'],
    queryFn: () => securitiesService.getAll(),
  });

  const { data: holdingsResponse } = useQuery({
    queryKey: ['holdings'],
    queryFn: () => holdingsService.getAll(),
  });

  const bonds: BondDetail[] = response?.data || [];
  const securities = securitiesResponse?.data || [];
  const holdings = holdingsResponse?.data || [];

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

  // Filter holdings to only bonds
  const bondHoldings = holdings.filter((h: any) => h.security?.security_type === 'bond' || h.security_type === 'bond');
  const holdingOptions = bondHoldings.map((h: any) => ({
    value: h.holding_id,
    label: `${h.security?.symbol || h.symbol || 'N/A'} - ${h.security?.security_name || h.security_name || 'Unknown'} (Qty: ${h.quantity})`,
    securityId: h.security_id,
  }));

  const securityOptions = securities
    .filter((sec) => sec.security_type === 'bond')
    .map((sec) => ({
      value: sec.security_id,
      label: `${sec.symbol} - ${sec.security_name}`,
    }));

  // Bond form
  const {
    register: registerBond,
    handleSubmit: handleSubmitBond,
    reset: resetBond,
    control: controlBond,
    formState: { errors: errorsBond },
  } = useForm<BondFormData>({
    resolver: zodResolver(bondSchema),
  });

  // Repayment form
  const {
    register: registerRepayment,
    handleSubmit: handleSubmitRepayment,
    reset: resetRepayment,
    control: controlRepayment,
    formState: { errors: errorsRepayment },
  } = useForm<RepaymentFormData>({
    resolver: zodResolver(repaymentSchema),
    defaultValues: {
      repayment_type: 'coupon',
      scheduled_date: format(new Date(), 'yyyy-MM-dd'),
      scheduled_amount: 0,
      payment_status: 'scheduled',
    },
  });

  // Schedule form
  const {
    register: registerSchedule,
    handleSubmit: handleSubmitSchedule,
    reset: resetSchedule,
    control: controlSchedule,
    formState: { errors: errorsSchedule },
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      include_past: false,
    },
  });

  // Bond mutations
  const createBondMutation = useMutation({
    mutationFn: (data: CreateBondDetailRequest) => bondsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bonds'] });
      toaster.create({
        title: 'Bond created successfully',
        type: 'success',
      });
      handleCloseBondDialog();
    },
    onError: (error: any) => {
      toaster.create({
        title: error?.response?.data?.message || 'Failed to create bond',
        type: 'error',
      });
    },
  });

  const updateBondMutation = useMutation({
    mutationFn: ({ securityId, data }: { securityId: number; data: UpdateBondDetailRequest }) =>
      bondsService.update(securityId.toString(), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bonds'] });
      toaster.create({
        title: 'Bond updated successfully',
        type: 'success',
      });
      handleCloseBondDialog();
    },
    onError: (error: any) => {
      toaster.create({
        title: error?.response?.data?.message || 'Failed to update bond',
        type: 'error',
      });
    },
  });

  const deleteBondMutation = useMutation({
    mutationFn: (securityId: number) => bondsService.delete(securityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bonds'] });
      toaster.create({
        title: 'Bond deleted successfully',
        type: 'success',
      });
      setIsDeleteBondDialogOpen(false);
      setSelectedBond(null);
    },
    onError: () => {
      toaster.create({
        title: 'Failed to delete bond',
        type: 'error',
      });
    },
  });

  // Repayment mutations
  const createRepaymentMutation = useMutation({
    mutationFn: (data: CreateBondRepaymentRequest) => bondRepaymentsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bond-repayments'] });
      toaster.create({
        title: 'Repayment created successfully',
        type: 'success',
      });
      handleCloseRepaymentDialog();
    },
    onError: (error: any) => {
      toaster.create({
        title: error?.response?.data?.message || 'Failed to create repayment',
        type: 'error',
      });
    },
  });

  const updateRepaymentMutation = useMutation({
    mutationFn: ({ repaymentId, data }: { repaymentId: number; data: UpdateBondRepaymentRequest }) =>
      bondRepaymentsService.update(repaymentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bond-repayments'] });
      toaster.create({
        title: 'Repayment updated successfully',
        type: 'success',
      });
      handleCloseRepaymentDialog();
    },
    onError: (error: any) => {
      toaster.create({
        title: error?.response?.data?.message || 'Failed to update repayment',
        type: 'error',
      });
    },
  });

  const generateScheduleMutation = useMutation({
    mutationFn: (data: GenerateRepaymentScheduleRequest) => bondRepaymentsService.generateSchedule(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['bond-repayments'] });
      toaster.create({
        title: `Schedule generated successfully. Created ${response.data?.created_count || 0} repayments.`,
        type: 'success',
      });
      handleCloseScheduleDialog();
    },
    onError: (error: any) => {
      toaster.create({
        title: error?.response?.data?.message || 'Failed to generate schedule',
        type: 'error',
      });
    },
  });

  const deleteRepaymentMutation = useMutation({
    mutationFn: (repaymentId: number) => bondRepaymentsService.delete(repaymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bond-repayments'] });
      toaster.create({
        title: 'Repayment deleted successfully',
        type: 'success',
      });
      setIsDeleteRepaymentDialogOpen(false);
      setSelectedRepayment(null);
    },
    onError: () => {
      toaster.create({
        title: 'Failed to delete repayment',
        type: 'error',
      });
    },
  });

  // Dialog handlers
  const handleOpenBondDialog = (bond?: BondDetail) => {
    if (bond) {
    setSelectedBond(bond);
      resetBond({
        security_id: bond.security_id,
        issuer: bond.issuer,
        coupon_rate: bond.coupon_rate ? parseFloat(bond.coupon_rate) : null,
        maturity_date: bond.maturity_date,
        coupon_payment_frequency: bond.coupon_payment_frequency as any,
        bond_type: bond.bond_type as any,
        credit_rating: bond.credit_rating as any,
        yield_to_maturity: bond.yield_to_maturity ? parseFloat(bond.yield_to_maturity) : null,
        issue_date: bond.issue_date || null,
        next_coupon_date: bond.next_coupon_date || null,
        day_count_convention: bond.day_count_convention as any,
      });
    } else {
      setSelectedBond(null);
      resetBond();
    }
    setIsBondDialogOpen(true);
  };

  const handleCloseBondDialog = () => {
    setIsBondDialogOpen(false);
    setSelectedBond(null);
    resetBond();
  };

  const handleOpenRepaymentDialog = (bond: BondDetail, repayment?: BondRepayment) => {
    setSelectedBondForRepayment(bond);
    if (repayment) {
      setSelectedRepayment(repayment);
      resetRepayment({
        holding_id: repayment.holding_id,
        security_id: repayment.security_id,
        repayment_type: repayment.repayment_type,
        scheduled_date: repayment.scheduled_date,
        scheduled_amount: parseFloat(repayment.scheduled_amount || '0'),
        actual_payment_date: repayment.actual_payment_date || null,
        actual_amount: repayment.actual_amount ? parseFloat(repayment.actual_amount) : null,
        payment_status: repayment.payment_status,
        coupon_period_start: repayment.coupon_period_start || null,
        coupon_period_end: repayment.coupon_period_end || null,
        notes: repayment.notes || null,
      });
    } else {
      setSelectedRepayment(null);
      // Find a holding for this bond
      const bondHolding = bondHoldings.find((h: any) => h.security_id === bond.security_id);
      resetRepayment({
        repayment_type: 'coupon',
        scheduled_date: format(new Date(), 'yyyy-MM-dd'),
        scheduled_amount: 0,
        payment_status: 'scheduled',
        holding_id: bondHolding?.holding_id || 0,
        security_id: bond.security_id,
      });
    }
    setIsRepaymentDialogOpen(true);
  };

  const handleCloseRepaymentDialog = () => {
    setIsRepaymentDialogOpen(false);
    setSelectedRepayment(null);
    setSelectedBondForRepayment(null);
    resetRepayment();
  };


  const handleCloseScheduleDialog = () => {
    setIsScheduleDialogOpen(false);
    setSelectedBondForRepayment(null);
    resetSchedule();
  };

  const handleDeleteBond = (bond: BondDetail) => {
    setSelectedBond(bond);
    setIsDeleteBondDialogOpen(true);
  };

  const handleDeleteRepayment = (repayment: BondRepayment) => {
    setSelectedRepayment(repayment);
    setIsDeleteRepaymentDialogOpen(true);
  };

  const onSubmitBond = (data: BondFormData) => {
    if (selectedBond) {
      // Convert null to undefined for update request
      const updateData: UpdateBondDetailRequest = {
        ...data,
        coupon_rate: data.coupon_rate ?? undefined,
        yield_to_maturity: data.yield_to_maturity ?? undefined,
        issue_date: data.issue_date || undefined,
        next_coupon_date: data.next_coupon_date || undefined,
        coupon_payment_frequency: data.coupon_payment_frequency || undefined,
        bond_type: data.bond_type || undefined,
        credit_rating: data.credit_rating || undefined,
        day_count_convention: data.day_count_convention || undefined,
      };
      updateBondMutation.mutate({ securityId: selectedBond.security_id, data: updateData });
    } else {
      createBondMutation.mutate(data as CreateBondDetailRequest);
    }
  };

  const onSubmitRepayment = (data: RepaymentFormData) => {
    if (selectedRepayment) {
      // Convert null to undefined for update request
      const updateData: UpdateBondRepaymentRequest = {
        ...data,
        actual_payment_date: data.actual_payment_date || undefined,
        actual_amount: data.actual_amount ?? undefined,
        coupon_period_start: data.coupon_period_start || undefined,
        coupon_period_end: data.coupon_period_end || undefined,
        notes: data.notes || undefined,
      };
      updateRepaymentMutation.mutate({ repaymentId: selectedRepayment.repayment_id, data: updateData });
    } else {
      createRepaymentMutation.mutate(data as CreateBondRepaymentRequest);
    }
  };

  const onSubmitSchedule = (data: ScheduleFormData) => {
    generateScheduleMutation.mutate({
      holding_id: data.holding_id,
      security_id: data.security_id,
      start_date: data.start_date || undefined,
      include_past: data.include_past || false,
    });
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

  if (isLoading) return <LoadingSpinner />;

  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={6}>
        <HStack justifyContent="space-between">
          <Heading size="lg">Bonds</Heading>
          <Button colorScheme="blue" onClick={() => handleOpenBondDialog()}>
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
                : () => handleOpenBondDialog()
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
                      onClick={() => handleOpenBondDialog(bond)}
                      title="Edit"
                    >
                      <LuPencil />
                    </IconButton>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleDeleteBond(bond)}
                      title="Delete"
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
                    <Flex pt={2} borderTopWidth="1px" mt={2} gap={2}>
                      <Button
                        size="sm"
                        variant="outline"
                        flex={1}
                        onClick={() => handleOpenBondDialog(bond)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        flex={1}
                        onClick={() => handleDeleteBond(bond)}
                      >
                        Delete
                      </Button>
                    </Flex>
                  </VStack>
                );
              },
            }}
            expandableConfig={{
              getExpandKey: (bond) => bond.security_id,
              expandedContent: (bond) => (
                <BondRepaymentsList
                  securityId={bond.security_id}
                  bondSymbol={bond.security?.symbol}
                  bondName={bond.security?.security_name}
                  onAddRepayment={() => handleOpenRepaymentDialog(bond)}
                  onEditRepayment={(repayment) => handleOpenRepaymentDialog(bond, repayment)}
                  onDeleteRepayment={handleDeleteRepayment}
                />
              ),
            }}
          />
        )}

        {/* Bond Form Dialog */}
        <DialogRoot open={isBondDialogOpen} onOpenChange={(e) => !e.open && handleCloseBondDialog()}>
          <Portal>
            <DialogBackdrop />
            <DialogPositioner>
              <DialogContent maxW="4xl">
                <form onSubmit={handleSubmitBond(onSubmitBond)}>
                  <DialogHeader>
                    <DialogTitle>{selectedBond ? 'Edit Bond' : 'Add Bond'}</DialogTitle>
                  </DialogHeader>
                  <DialogCloseTrigger />
                  <DialogBody>
                    <Stack gap={4}>
                      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                        <Controller
                          name="security_id"
                          control={controlBond}
                          render={({ field }) => (
                            <SelectField
                              label="Security"
                              required
                              error={errorsBond.security_id?.message}
                              placeholder="Select security (must be bond type)"
                              options={securityOptions}
                              value={field.value}
                              onChange={(value) => field.onChange(value ? Number(value) : null)}
                              isDisabled={!!selectedBond}
                            />
                          )}
                        />

                        <InputField
                          label="Issuer"
                          required
                          error={errorsBond.issuer?.message}
                          {...registerBond('issuer')}
                        />

                        <Controller
                          name="coupon_rate"
                          control={controlBond}
                          render={({ field }) => (
                            <InputField
                              label="Coupon Rate (%)"
                              type="number"
                              step="0.01"
                              error={errorsBond.coupon_rate?.message}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                            />
                          )}
                        />

                        <InputField
                          label="Maturity Date"
                          type="date"
                          required
                          error={errorsBond.maturity_date?.message}
                          {...registerBond('maturity_date')}
                        />

                        <Controller
                          name="coupon_payment_frequency"
                          control={controlBond}
                          render={({ field }) => (
                            <SelectField
                              label="Coupon Payment Frequency"
                              error={errorsBond.coupon_payment_frequency?.message}
                              placeholder="Select frequency"
                              options={[
                                { value: '', label: 'Select frequency' },
                                { value: 'annual', label: 'Annual' },
                                { value: 'semi_annual', label: 'Semi-Annual' },
                                { value: 'quarterly', label: 'Quarterly' },
                                { value: 'monthly', label: 'Monthly' },
                              ]}
                              value={field.value || ''}
                              onChange={(value) => field.onChange(value || null)}
                            />
                          )}
                        />

                        <Controller
                          name="bond_type"
                          control={controlBond}
                          render={({ field }) => (
                            <SelectField
                              label="Bond Type"
                              error={errorsBond.bond_type?.message}
                              placeholder="Select bond type"
                              options={[
                                { value: '', label: 'Select type' },
                                { value: 'government', label: 'Government' },
                                { value: 'corporate', label: 'Corporate' },
                                { value: 'municipal', label: 'Municipal' },
                                { value: 'treasury', label: 'Treasury' },
                                { value: 'corporate_high_yield', label: 'Corporate High Yield' },
                              ]}
                              value={field.value || ''}
                              onChange={(value) => field.onChange(value || null)}
                            />
                          )}
                        />

                        <Controller
                          name="credit_rating"
                          control={controlBond}
                          render={({ field }) => (
                            <SelectField
                              label="Credit Rating"
                              error={errorsBond.credit_rating?.message}
                              placeholder="Select rating"
                              options={[
                                { value: '', label: 'Select rating' },
                                { value: 'AAA', label: 'AAA' },
                                { value: 'AA', label: 'AA' },
                                { value: 'A', label: 'A' },
                                { value: 'BBB', label: 'BBB' },
                                { value: 'BB', label: 'BB' },
                                { value: 'B', label: 'B' },
                                { value: 'CCC', label: 'CCC' },
                                { value: 'D', label: 'D' },
                              ]}
                              value={field.value || ''}
                              onChange={(value) => field.onChange(value || null)}
                            />
                          )}
                        />

                        <Controller
                          name="yield_to_maturity"
                          control={controlBond}
                          render={({ field }) => (
                            <InputField
                              label="Yield to Maturity (%)"
                              type="number"
                              step="0.01"
                              error={errorsBond.yield_to_maturity?.message}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                            />
                          )}
                        />

                        <InputField
                          label="Issue Date"
                          type="date"
                          error={errorsBond.issue_date?.message}
                          {...registerBond('issue_date')}
                        />

                        <InputField
                          label="Next Coupon Date"
                          type="date"
                          error={errorsBond.next_coupon_date?.message}
                          {...registerBond('next_coupon_date')}
                        />

                        <Controller
                          name="day_count_convention"
                          control={controlBond}
                          render={({ field }) => (
                            <SelectField
                              label="Day Count Convention"
                              error={errorsBond.day_count_convention?.message}
                              placeholder="Select convention"
                              options={[
                                { value: '', label: 'Select convention' },
                                { value: '30/360', label: '30/360' },
                                { value: 'actual/365', label: 'Actual/365' },
                                { value: 'actual/360', label: 'Actual/360' },
                              ]}
                              value={field.value || ''}
                              onChange={(value) => field.onChange(value || null)}
                            />
                          )}
                        />
                      </Grid>
                    </Stack>
                  </DialogBody>
                  <DialogFooter>
                    <DialogActionTrigger asChild>
                      <Button variant="outline" onClick={handleCloseBondDialog}>
                        Cancel
                      </Button>
                    </DialogActionTrigger>
                    <Button
                      type="submit"
                      colorScheme="blue"
                      loading={createBondMutation.isPending || updateBondMutation.isPending}
                    >
                      {selectedBond ? 'Update' : 'Create'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </DialogPositioner>
          </Portal>
        </DialogRoot>

        {/* Repayment Form Dialog */}
        <DialogRoot open={isRepaymentDialogOpen} onOpenChange={(e) => !e.open && handleCloseRepaymentDialog()}>
          <Portal>
            <DialogBackdrop />
            <DialogPositioner>
              <DialogContent maxW="2xl">
                <form onSubmit={handleSubmitRepayment(onSubmitRepayment)}>
                  <DialogHeader>
                    <DialogTitle>
                      {selectedRepayment ? 'Edit Repayment' : 'Add Repayment'}
                    </DialogTitle>
                  </DialogHeader>
                  <DialogCloseTrigger />
                  <DialogBody>
                    <Stack gap={4}>
                      <Controller
                        name="holding_id"
                        control={controlRepayment}
                        render={({ field }) => (
                          <SelectField
                            label="Bond Holding"
                            required
                            error={errorsRepayment.holding_id?.message}
                            placeholder="Select bond holding"
                            options={holdingOptions}
                            value={field.value}
                            onChange={(value) => {
                              const selected = holdingOptions.find((opt: { value: number; securityId: number }) => opt.value === Number(value));
                              field.onChange(value ? Number(value) : null);
                              if (selected && !selectedRepayment) {
                                resetRepayment({
                                  holding_id: Number(value),
                                  security_id: selected.securityId,
                                  repayment_type: 'coupon',
                                  scheduled_date: format(new Date(), 'yyyy-MM-dd'),
                                  scheduled_amount: 0,
                                  payment_status: 'scheduled',
                                });
                              }
                            }}
                            isDisabled={!!selectedRepayment}
                          />
                        )}
                      />

                      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                        <Controller
                          name="repayment_type"
                          control={controlRepayment}
                          render={({ field }) => (
                            <SelectField
                              label="Repayment Type"
                              required
                              error={errorsRepayment.repayment_type?.message}
                              options={[
                                { value: 'coupon', label: 'Coupon' },
                                { value: 'principal', label: 'Principal' },
                              ]}
                              value={field.value}
                              onChange={(value) => field.onChange(value as 'coupon' | 'principal')}
                            />
                          )}
                        />

                        <Controller
                          name="payment_status"
                          control={controlRepayment}
                          render={({ field }) => (
                            <SelectField
                              label="Payment Status"
                              error={errorsRepayment.payment_status?.message}
                              options={[
                                { value: 'scheduled', label: 'Scheduled' },
                                { value: 'paid', label: 'Paid' },
                                { value: 'overdue', label: 'Overdue' },
                                { value: 'missed', label: 'Missed' },
                              ]}
                              value={field.value || 'scheduled'}
                              onChange={(value) => field.onChange(value as any)}
                            />
                          )}
                        />
                      </Grid>

                      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                        <InputField
                          label="Scheduled Date"
                          type="date"
                          required
                          error={errorsRepayment.scheduled_date?.message}
                          {...registerRepayment('scheduled_date')}
                        />

                        <Controller
                          name="scheduled_amount"
                          control={controlRepayment}
                          render={({ field }) => (
                            <InputField
                              label="Scheduled Amount"
                              type="number"
                              step="0.01"
                              required
                              error={errorsRepayment.scheduled_amount?.message}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          )}
                        />
                      </Grid>

                      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                        <InputField
                          label="Actual Payment Date"
                          type="date"
                          error={errorsRepayment.actual_payment_date?.message}
                          {...registerRepayment('actual_payment_date')}
                        />

                        <Controller
                          name="actual_amount"
                          control={controlRepayment}
                          render={({ field }) => (
                            <InputField
                              label="Actual Amount"
                              type="number"
                              step="0.01"
                              error={errorsRepayment.actual_amount?.message}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                            />
                          )}
                        />
                      </Grid>

                      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                        <Controller
                          name="coupon_period_start"
                          control={controlRepayment}
                          render={({ field }) => (
                            <InputField
                              label="Coupon Period Start"
                              type="date"
                              error={errorsRepayment.coupon_period_start?.message}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value || null)}
                            />
                          )}
                        />

                        <Controller
                          name="coupon_period_end"
                          control={controlRepayment}
                          render={({ field }) => (
                            <InputField
                              label="Coupon Period End"
                              type="date"
                              error={errorsRepayment.coupon_period_end?.message}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value || null)}
                            />
                          )}
                        />
                      </Grid>

                      <InputField
                        label="Notes"
                        error={errorsRepayment.notes?.message}
                        {...registerRepayment('notes')}
                      />
                    </Stack>
                  </DialogBody>
                  <DialogFooter>
                    <DialogActionTrigger asChild>
                      <Button variant="outline" onClick={handleCloseRepaymentDialog}>
                        Cancel
                      </Button>
                    </DialogActionTrigger>
                    <Button
                      type="submit"
                      colorScheme="blue"
                      loading={createRepaymentMutation.isPending || updateRepaymentMutation.isPending}
                    >
                      {selectedRepayment ? 'Update' : 'Create'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </DialogPositioner>
          </Portal>
        </DialogRoot>

        {/* Generate Schedule Dialog */}
        <DialogRoot open={isScheduleDialogOpen} onOpenChange={(e) => !e.open && handleCloseScheduleDialog()}>
          <Portal>
            <DialogBackdrop />
            <DialogPositioner>
              <DialogContent maxW="xl">
                <form onSubmit={handleSubmitSchedule(onSubmitSchedule)}>
                  <DialogHeader>
                    <DialogTitle>Generate Repayment Schedule</DialogTitle>
                  </DialogHeader>
                  <DialogCloseTrigger />
                  <DialogBody>
                    <Stack gap={4}>
                      {selectedBondForRepayment && (
                        <Text fontSize="sm" color="text.secondary">
                          Generating schedule for: {selectedBondForRepayment.security?.symbol || selectedBondForRepayment.security?.security_name}
                        </Text>
                      )}
                      <Controller
                        name="holding_id"
                        control={controlSchedule}
                        render={({ field }) => (
                          <SelectField
                            label="Bond Holding"
                            required
                            error={errorsSchedule.holding_id?.message}
                            placeholder="Select bond holding"
                            options={holdingOptions}
                            value={field.value}
                            onChange={(value) => {
                              const selected = holdingOptions.find((opt: { value: number; securityId: number }) => opt.value === Number(value));
                              field.onChange(value ? Number(value) : null);
                              if (selected) {
                                resetSchedule({
                                  holding_id: Number(value),
                                  security_id: selected.securityId,
                                  include_past: false,
                                });
                              }
                            }}
                          />
                        )}
                      />

                      <InputField
                        label="Start Date (Optional)"
                        type="date"
                        error={errorsSchedule.start_date?.message}
                        {...registerSchedule('start_date')}
                        helperText="Leave empty to start from today or issue date"
                      />

                      <Controller
                        name="include_past"
                        control={controlSchedule}
                        render={({ field }) => (
                          <Flex align="center" gap={2}>
                            <input
                              type="checkbox"
                              checked={field.value || false}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                            <Text fontSize="sm">Include past scheduled payments</Text>
                          </Flex>
                        )}
                      />
                    </Stack>
                  </DialogBody>
                  <DialogFooter>
                    <DialogActionTrigger asChild>
                      <Button variant="outline" onClick={handleCloseScheduleDialog}>
                        Cancel
                      </Button>
                    </DialogActionTrigger>
                    <Button
                      type="submit"
                      colorScheme="purple"
                      loading={generateScheduleMutation.isPending}
                    >
                      Generate Schedule
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </DialogPositioner>
          </Portal>
        </DialogRoot>

        {/* Delete Bond Dialog */}
        <ConfirmDialog
          isOpen={isDeleteBondDialogOpen}
          onClose={() => {
            setIsDeleteBondDialogOpen(false);
            setSelectedBond(null);
          }}
          onConfirm={() => {
            if (selectedBond) {
              deleteBondMutation.mutate(selectedBond.security_id);
            }
          }}
          title="Delete Bond"
          message={`Are you sure you want to delete bond details for ${selectedBond?.security?.symbol || selectedBond?.security?.security_name || 'this bond'}?`}
          confirmText="Delete"
          cancelText="Cancel"
          colorScheme="red"
          isLoading={deleteBondMutation.isPending}
        />

        {/* Delete Repayment Dialog */}
        <ConfirmDialog
          isOpen={isDeleteRepaymentDialogOpen}
          onClose={() => {
            setIsDeleteRepaymentDialogOpen(false);
            setSelectedRepayment(null);
          }}
          onConfirm={() => {
            if (selectedRepayment) {
              deleteRepaymentMutation.mutate(selectedRepayment.repayment_id);
            }
          }}
          title="Delete Repayment"
          message={`Are you sure you want to delete this ${selectedRepayment?.repayment_type} repayment?`}
          confirmText="Delete"
          cancelText="Cancel"
          colorScheme="red"
          isLoading={deleteRepaymentMutation.isPending}
        />
      </Stack>
    </Container>
  );
};

export default BondsPage;
