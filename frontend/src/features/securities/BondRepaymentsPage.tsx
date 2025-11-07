import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
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
import { LuPlus, LuPencil, LuTrash2, LuChevronDown, LuCalendar } from 'react-icons/lu';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { bondRepaymentsService } from '../../api/services/bond-repayments.service';
import { securityHoldingsService } from '../../api/services/securities.service';
import { toaster } from '../../components/ui/toaster';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import StatCard from '../../components/common/StatCard';
import { InputField, SelectField } from '../../components/common/FormField';
import type { 
  BondRepayment,
  CreateBondRepaymentRequest,
  UpdateBondRepaymentRequest,
  GenerateRepaymentScheduleRequest
} from '../../types/domain.types';

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

type RepaymentFormData = z.infer<typeof repaymentSchema>;

const scheduleSchema = z.object({
  holding_id: z.number({ message: 'Holding is required' }),
  security_id: z.number({ message: 'Security is required' }),
  start_date: z.string().optional(),
  include_past: z.boolean().optional(),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

const BondRepaymentsPage = () => {
  const [searchParams] = useSearchParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRepayment, setSelectedRepayment] = useState<BondRepayment | null>(null);
  const [filters, setFilters] = useState({
    repayment_type: searchParams.get('repayment_type') || '',
    payment_status: searchParams.get('payment_status') || '',
    security_id: searchParams.get('security_id') || '',
  });

  // Update filters when search params change
  useEffect(() => {
    const securityId = searchParams.get('security_id');
    if (securityId) {
      setFilters((prev) => ({ ...prev, security_id: securityId }));
    }
  }, [searchParams]);

  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['bond-repayments', filters],
    queryFn: () => bondRepaymentsService.getAll({
      ...filters,
      security_id: filters.security_id ? Number(filters.security_id) : undefined,
    }),
  });

  const { data: holdingsResponse } = useQuery({
    queryKey: ['holdings'],
    queryFn: () => securityHoldingsService.getAll(),
  });

  const repayments: BondRepayment[] = response?.data || [];
  const holdings = holdingsResponse?.data || [];

  // Filter holdings to only bonds
  const bondHoldings = holdings.filter((h: any) => h.security?.security_type === 'bond' || h.security_type === 'bond');
  const holdingOptions = bondHoldings.map((h: any) => ({
    value: h.holding_id,
    label: `${h.security?.symbol || h.symbol || 'N/A'} - ${h.security?.name || h.security?.security_name || h.security_name || 'Unknown'} (Qty: ${h.quantity})`,
    securityId: h.security_id,
  }));

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalRepayments = repayments.length;
    const scheduled = repayments.filter((r) => r.payment_status === 'scheduled').length;
    const paid = repayments.filter((r) => r.payment_status === 'paid').length;
    const overdue = repayments.filter((r) => r.payment_status === 'overdue').length;
    const totalScheduled = repayments.reduce((sum, r) => sum + parseFloat(r.scheduled_amount || '0'), 0);
    const totalPaid = repayments
      .filter((r) => r.actual_amount)
      .reduce((sum, r) => sum + parseFloat(r.actual_amount || '0'), 0);

    return {
      totalRepayments,
      scheduled,
      paid,
      overdue,
      totalScheduled,
      totalPaid,
    };
  }, [repayments]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<RepaymentFormData>({
    resolver: zodResolver(repaymentSchema),
    defaultValues: {
      repayment_type: 'coupon',
      scheduled_date: format(new Date(), 'yyyy-MM-dd'),
      scheduled_amount: 0,
      payment_status: 'scheduled',
    },
  });

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

  const createMutation = useMutation({
    mutationFn: (data: CreateBondRepaymentRequest) => bondRepaymentsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bond-repayments'] });
      toaster.create({
        title: 'Repayment created successfully',
        type: 'success',
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toaster.create({
        title: error?.response?.data?.message || 'Failed to create repayment',
        type: 'error',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ repaymentId, data }: { repaymentId: number; data: UpdateBondRepaymentRequest }) =>
      bondRepaymentsService.update(repaymentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bond-repayments'] });
      toaster.create({
        title: 'Repayment updated successfully',
        type: 'success',
      });
      handleCloseDialog();
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
        title: `Schedule generated successfully. Created ${response.data.created_count} repayments.`,
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

  const deleteMutation = useMutation({
    mutationFn: (repaymentId: number) => bondRepaymentsService.delete(repaymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bond-repayments'] });
      toaster.create({
        title: 'Repayment deleted successfully',
        type: 'success',
      });
      setIsDeleteDialogOpen(false);
      setSelectedRepayment(null);
    },
    onError: () => {
      toaster.create({
        title: 'Failed to delete repayment',
        type: 'error',
      });
    },
  });

  const handleOpenDialog = (repayment?: BondRepayment) => {
    if (repayment) {
      setSelectedRepayment(repayment);
      reset({
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
      reset({
        repayment_type: 'coupon',
        scheduled_date: format(new Date(), 'yyyy-MM-dd'),
        scheduled_amount: 0,
        payment_status: 'scheduled',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedRepayment(null);
    reset();
  };

  const handleOpenScheduleDialog = () => {
    resetSchedule({
      include_past: false,
    });
    setIsScheduleDialogOpen(true);
  };

  const handleCloseScheduleDialog = () => {
    setIsScheduleDialogOpen(false);
    resetSchedule();
  };

  const onSubmit = (data: RepaymentFormData) => {
    if (selectedRepayment) {
      updateMutation.mutate({ repaymentId: selectedRepayment.repayment_id, data });
    } else {
      createMutation.mutate(data as CreateBondRepaymentRequest);
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

  const handleDelete = (repayment: BondRepayment) => {
    setSelectedRepayment(repayment);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedRepayment) {
      deleteMutation.mutate(selectedRepayment.repayment_id);
    }
  };

  const formatCurrency = (value: string | null | undefined) => {
    if (!value) return '-';
    const num = parseFloat(value);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(num);
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return '-';
    try {
      return format(new Date(date), 'MMM dd, yyyy');
    } catch {
      return date;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'green';
      case 'overdue':
        return 'red';
      case 'missed':
        return 'orange';
      case 'scheduled':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'coupon' ? 'purple' : 'teal';
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={6}>
        <HStack justifyContent="space-between">
          <Heading size="lg">Bond Repayments</Heading>
          <HStack gap={2}>
            <Button colorScheme="purple" variant="outline" onClick={handleOpenScheduleDialog}>
              <LuCalendar /> Generate Schedule
            </Button>
            <Button colorScheme="blue" onClick={() => handleOpenDialog()}>
              <LuPlus /> Add Repayment
            </Button>
          </HStack>
        </HStack>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
          <StatCard
            label="Total Repayments"
            value={summary.totalRepayments.toString()}
            color="blue.500"
          />
          <StatCard
            label="Scheduled"
            value={summary.scheduled.toString()}
            color="blue.500"
          />
          <StatCard
            label="Scheduled Amount"
            value={formatCurrency(summary.totalScheduled.toString())}
            color="purple.500"
          />
          <StatCard
            label="Total Paid"
            value={formatCurrency(summary.totalPaid.toString())}
            color="green.500"
          />
        </Grid>

        <Stack direction={{ base: 'column', md: 'row' }} gap={4}>
          <SelectField
            label="Repayment Type"
            placeholder="All Types"
            value={filters.repayment_type}
            onChange={(value) => setFilters({ ...filters, repayment_type: value as string })}
            options={[
              { value: '', label: 'All Types' },
              { value: 'coupon', label: 'Coupon' },
              { value: 'principal', label: 'Principal' },
            ]}
          />
          <SelectField
            label="Payment Status"
            placeholder="All Statuses"
            value={filters.payment_status}
            onChange={(value) => setFilters({ ...filters, payment_status: value as string })}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'paid', label: 'Paid' },
              { value: 'overdue', label: 'Overdue' },
              { value: 'missed', label: 'Missed' },
            ]}
          />
        </Stack>

        {repayments.length === 0 ? (
          <EmptyState
            title={filters.repayment_type || filters.payment_status ? 'No repayments found' : 'No repayments yet'}
            description={
              filters.repayment_type || filters.payment_status
                ? 'Try adjusting your filters'
                : 'Add your first repayment or generate a schedule'
            }
            actionLabel={filters.repayment_type || filters.payment_status ? undefined : 'Add Repayment'}
            onAction={
              filters.repayment_type || filters.payment_status
                ? undefined
                : () => handleOpenDialog()
            }
          />
        ) : (
          <ResponsiveTable
            data={repayments}
            columns={[
              {
                header: 'Type',
                cell: (repayment) => (
                  <Badge colorScheme={getTypeColor(repayment.repayment_type)}>
                    {repayment.repayment_type.toUpperCase()}
                  </Badge>
                ),
              },
              {
                header: 'Scheduled Date',
                cell: (repayment) => (
                  <Text fontWeight="medium">{formatDate(repayment.scheduled_date)}</Text>
                ),
              },
              {
                header: 'Scheduled Amount',
                cell: (repayment) => formatCurrency(repayment.scheduled_amount),
                textAlign: 'right',
              },
              {
                header: 'Actual Date',
                cell: (repayment) => formatDate(repayment.actual_payment_date),
              },
              {
                header: 'Actual Amount',
                cell: (repayment) => formatCurrency(repayment.actual_amount),
                textAlign: 'right',
              },
              {
                header: 'Status',
                cell: (repayment) => (
                  <Badge colorScheme={getStatusColor(repayment.payment_status)}>
                    {repayment.payment_status.toUpperCase()}
                  </Badge>
                ),
              },
              {
                header: 'Actions',
                cell: (repayment) => (
                  <HStack gap={2}>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenDialog(repayment)}
                    >
                      <LuPencil />
                    </IconButton>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleDelete(repayment)}
                    >
                      <LuTrash2 />
                    </IconButton>
                  </HStack>
                ),
              },
            ]}
            mobileConfig={{
              getKey: (repayment) => repayment.repayment_id,
              summaryRender: (repayment) => {
                return (
                  <Flex justify="space-between" align="center" w="full">
                    <VStack align="start" gap={1} flex={1}>
                      <HStack gap={2} flexWrap="wrap">
                        <Badge colorScheme={getTypeColor(repayment.repayment_type)}>
                          {repayment.repayment_type.toUpperCase()}
                        </Badge>
                        <Badge colorScheme={getStatusColor(repayment.payment_status)}>
                          {repayment.payment_status.toUpperCase()}
                        </Badge>
                      </HStack>
                      <Text fontWeight="bold" fontSize="md">
                        {formatCurrency(repayment.scheduled_amount)}
                      </Text>
                      <Text fontSize="sm" color="text.secondary">
                        Scheduled: {formatDate(repayment.scheduled_date)}
                      </Text>
                      {repayment.actual_payment_date && (
                        <Text fontSize="sm" color="text.secondary">
                          Paid: {formatDate(repayment.actual_payment_date)}
                        </Text>
                      )}
                    </VStack>
                    <LuChevronDown />
                  </Flex>
                );
              },
              detailsRender: (repayment) => {
                return (
                  <VStack align="stretch" gap={3} mt={2}>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Scheduled Date
                      </Text>
                      <Text fontWeight="medium">{formatDate(repayment.scheduled_date)}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Scheduled Amount
                      </Text>
                      <Text fontWeight="medium">{formatCurrency(repayment.scheduled_amount)}</Text>
                    </Flex>
                    {repayment.actual_payment_date && (
                      <Flex justify="space-between">
                        <Text color="text.secondary" fontSize="sm">
                          Actual Date
                        </Text>
                        <Text fontWeight="medium">{formatDate(repayment.actual_payment_date)}</Text>
                      </Flex>
                    )}
                    {repayment.actual_amount && (
                      <Flex justify="space-between">
                        <Text color="text.secondary" fontSize="sm">
                          Actual Amount
                        </Text>
                        <Text fontWeight="medium">{formatCurrency(repayment.actual_amount)}</Text>
                      </Flex>
                    )}
                    {repayment.coupon_period_start && repayment.coupon_period_end && (
                      <>
                        <Flex justify="space-between">
                          <Text color="text.secondary" fontSize="sm">
                            Period Start
                          </Text>
                          <Text fontWeight="medium">{formatDate(repayment.coupon_period_start)}</Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text color="text.secondary" fontSize="sm">
                            Period End
                          </Text>
                          <Text fontWeight="medium">{formatDate(repayment.coupon_period_end)}</Text>
                        </Flex>
                      </>
                    )}
                    {repayment.notes && (
                      <Flex justify="space-between">
                        <Text color="text.secondary" fontSize="sm">
                          Notes
                        </Text>
                        <Text fontWeight="medium">{repayment.notes}</Text>
                      </Flex>
                    )}
                    <Flex pt={2} borderTopWidth="1px" mt={2} gap={2}>
                      <Button
                        size="sm"
                        variant="outline"
                        flex={1}
                        onClick={() => handleOpenDialog(repayment)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        flex={1}
                        onClick={() => handleDelete(repayment)}
                      >
                        Delete
                      </Button>
                    </Flex>
                  </VStack>
                );
              },
            }}
          />
        )}

        {/* Repayment Form Dialog */}
        <DialogRoot open={isDialogOpen} onOpenChange={(e) => !e.open && handleCloseDialog()}>
          <Portal>
            <DialogBackdrop />
            <DialogPositioner>
              <DialogContent maxW="2xl">
                <form onSubmit={handleSubmit(onSubmit)}>
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
                        control={control}
                        render={({ field }) => (
                          <SelectField
                            label="Bond Holding"
                            required
                            error={errors.holding_id?.message}
                            placeholder="Select bond holding"
                            options={holdingOptions}
                            value={field.value}
                            onChange={(value) => {
                              const selected = holdingOptions.find((opt) => opt.value === Number(value));
                              field.onChange(value ? Number(value) : null);
                              if (selected && !selectedRepayment) {
                                reset({
                                  ...reset(),
                                  holding_id: Number(value),
                                  security_id: selected.securityId,
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
                          control={control}
                          render={({ field }) => (
                            <SelectField
                              label="Repayment Type"
                              required
                              error={errors.repayment_type?.message}
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
                          control={control}
                          render={({ field }) => (
                            <SelectField
                              label="Payment Status"
                              error={errors.payment_status?.message}
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
                          error={errors.scheduled_date?.message}
                          {...register('scheduled_date')}
                        />

                        <Controller
                          name="scheduled_amount"
                          control={control}
                          render={({ field }) => (
                            <InputField
                              label="Scheduled Amount"
                              type="number"
                              step="0.01"
                              required
                              error={errors.scheduled_amount?.message}
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
                          error={errors.actual_payment_date?.message}
                          {...register('actual_payment_date')}
                        />

                        <Controller
                          name="actual_amount"
                          control={control}
                          render={({ field }) => (
                            <InputField
                              label="Actual Amount"
                              type="number"
                              step="0.01"
                              error={errors.actual_amount?.message}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                            />
                          )}
                        />
                      </Grid>

                      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                        <Controller
                          name="coupon_period_start"
                          control={control}
                          render={({ field }) => (
                            <InputField
                              label="Coupon Period Start"
                              type="date"
                              error={errors.coupon_period_start?.message}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value || null)}
                            />
                          )}
                        />

                        <Controller
                          name="coupon_period_end"
                          control={control}
                          render={({ field }) => (
                            <InputField
                              label="Coupon Period End"
                              type="date"
                              error={errors.coupon_period_end?.message}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value || null)}
                            />
                          )}
                        />
                      </Grid>

                      <InputField
                        label="Notes"
                        error={errors.notes?.message}
                        {...register('notes')}
                      />
                    </Stack>
                  </DialogBody>
                  <DialogFooter>
                    <DialogActionTrigger asChild>
                      <Button variant="outline" onClick={handleCloseDialog}>
                        Cancel
                      </Button>
                    </DialogActionTrigger>
                    <Button
                      type="submit"
                      colorScheme="blue"
                      loading={createMutation.isPending || updateMutation.isPending}
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
                              const selected = holdingOptions.find((opt) => opt.value === Number(value));
                              field.onChange(value ? Number(value) : null);
                              if (selected) {
                                resetSchedule({
                                  ...resetSchedule(),
                                  holding_id: Number(value),
                                  security_id: selected.securityId,
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

        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedRepayment(null);
          }}
          onConfirm={confirmDelete}
          title="Delete Repayment"
          message={`Are you sure you want to delete this ${selectedRepayment?.repayment_type} repayment?`}
          confirmText="Delete"
          cancelText="Cancel"
          colorScheme="red"
          isLoading={deleteMutation.isPending}
        />
      </Stack>
    </Container>
  );
};

export default BondRepaymentsPage;
