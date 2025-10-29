import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Button,
  IconButton,
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
import { LuChevronDown, LuPlus, LuPencil, LuTrash2 } from 'react-icons/lu';
import { format, differenceInDays } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { fixedDepositService, bankAccountService } from '../../api/services/banking.service';
import { toaster } from '../../components/ui/toaster';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatCard from '../../components/common/StatCard';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { InputField, SelectField } from '../../components/common/FormField';
import { Field as ChakraField } from '../../components/ui/field';
import FDInterestPaymentsList from './FDInterestPaymentsList';
import type { FixedDeposit, BankAccount } from '../../types/domain.types';

const fdSchema = z.object({
  account_id: z.number({ message: 'Bank account is required' }),
  fd_number: z.string().min(1, 'FD number is required'),
  principal_amount: z.number().min(1, 'Principal amount is required'),
  interest_rate: z.number().min(0).max(100, 'Interest rate must be between 0 and 100'),
  start_date: z.string().min(1, 'Start date is required'),
  maturity_date: z.string().min(1, 'Maturity date is required'),
  tenure_months: z.number().min(1, 'Tenure must be at least 1 month'),
  maturity_amount: z.number().optional(),
  interest_payout_frequency: z.enum(['monthly', 'quarterly', 'half_yearly', 'yearly', 'maturity']).optional(),
  auto_renewal: z.boolean().optional(),
  premature_withdrawal_allowed: z.boolean().optional(),
  premature_penalty_rate: z.number().min(0).max(100).optional(),
});

type FDFormData = z.infer<typeof fdSchema>;

const FixedDepositsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFD, setSelectedFD] = useState<FixedDeposit | null>(null);
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['fixedDeposits'],
    queryFn: () => fixedDepositService.getAll(),
  });

  const { data: accountsResponse } = useQuery({
    queryKey: ['bankAccounts'],
    queryFn: () => bankAccountService.getAll(),
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FDFormData>({
    resolver: zodResolver(fdSchema),
  });

  const fds: FixedDeposit[] = response?.data || [];
  const accounts: BankAccount[] = accountsResponse?.data || [];

  // Auto-calculate tenure when dates change
  const [startDate, maturityDate] = watch(['start_date', 'maturity_date']);

  useEffect(() => {
    if (startDate && maturityDate) {
      const start = new Date(startDate);
      const maturity = new Date(maturityDate);
      
      // Calculate months between dates
      const yearsDiff = maturity.getFullYear() - start.getFullYear();
      const monthsDiff = maturity.getMonth() - start.getMonth();
      const daysDiff = maturity.getDate() - start.getDate();
      
      // Calculate total months
      let totalMonths = yearsDiff * 12 + monthsDiff;
      
      // If there are remaining days, add a fraction (round to nearest month)
      if (daysDiff > 0) {
        totalMonths += Math.round(daysDiff / 30);
      } else if (daysDiff < 0) {
        totalMonths -= 1;
        totalMonths += Math.round((30 + daysDiff) / 30);
      }
      
      // Ensure minimum of 1 month
      totalMonths = Math.max(1, totalMonths);
      
      setValue('tenure_months', totalMonths);
    }
  }, [startDate, maturityDate, setValue]);

  // Auto-calculate maturity amount using Indian banking quarterly compounding
  const watchedFields = watch(['principal_amount', 'interest_rate', 'tenure_months']);

  useEffect(() => {
    const [principal, rate, tenure] = watchedFields;
    if (principal && rate && tenure) {
      // Indian banking system: Quarterly compounding (90 days)
      // Formula: A = P * (1 + r/4)^(4*t)
      // Where t is time in years, r is annual rate as decimal
      const timeInYears = tenure / 12;
      const rateDecimal = rate / 100;
      const maturityAmount = principal * Math.pow(1 + rateDecimal / 4, 4 * timeInYears);
      setValue('maturity_amount', parseFloat(maturityAmount.toFixed(2)));
    }
  }, [watchedFields, setValue]);

  const createMutation = useMutation({
    mutationFn: fixedDepositService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixedDeposits'] });
      toaster.create({
        title: 'Fixed deposit created successfully',
        type: 'success',
      });
      handleCloseDialog();
    },
    onError: () => {
      toaster.create({
        title: 'Failed to create fixed deposit',
        type: 'error',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FDFormData }) =>
      fixedDepositService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixedDeposits'] });
      toaster.create({
        title: 'Fixed deposit updated successfully',
        type: 'success',
      });
      handleCloseDialog();
    },
    onError: () => {
      toaster.create({
        title: 'Failed to update fixed deposit',
        type: 'error',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: fixedDepositService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixedDeposits'] });
      toaster.create({
        title: 'Fixed deposit deleted successfully',
        type: 'success',
      });
      setIsDeleteDialogOpen(false);
      setSelectedFD(null);
    },
    onError: () => {
      toaster.create({
        title: 'Failed to delete fixed deposit',
        type: 'error',
      });
    },
  });

  const handleOpenDialog = (fd?: FixedDeposit) => {
    if (fd) {
      setSelectedFD(fd);
      reset({
        account_id: fd.account_id,
        fd_number: fd.fd_number,
        principal_amount: parseFloat(fd.principal_amount),
        interest_rate: parseFloat(fd.interest_rate),
        start_date: fd.start_date,
        maturity_date: fd.maturity_date,
        tenure_months: fd.tenure_months,
        maturity_amount: fd.maturity_amount ? parseFloat(fd.maturity_amount) : undefined,
        interest_payout_frequency: fd.interest_payout_frequency as any,
        auto_renewal: fd.auto_renewal,
        premature_withdrawal_allowed: fd.premature_withdrawal_allowed,
        premature_penalty_rate: fd.premature_penalty_rate ? parseFloat(fd.premature_penalty_rate) : undefined,
      });
    } else {
      setSelectedFD(null);
      reset({
        auto_renewal: false,
        premature_withdrawal_allowed: true,
        interest_payout_frequency: 'maturity',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedFD(null);
    reset();
  };

  const onSubmit = (data: FDFormData) => {
    if (selectedFD) {
      updateMutation.mutate({ id: selectedFD.fd_id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (fd: FixedDeposit) => {
    setSelectedFD(fd);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedFD) {
      deleteMutation.mutate(selectedFD.fd_id);
    }
  };

  const totalPrincipal = fds.reduce((sum, fd) => sum + parseFloat(fd.principal_amount || '0'), 0);
  const totalMaturityAmount = fds.reduce((sum, fd) => sum + parseFloat(fd.maturity_amount || '0'), 0);
  const activeFDs = fds.filter((fd) => fd.is_active).length;

  // Options for SelectField
  const accountOptions = accounts.map((account) => ({
    value: account.account_id,
    label: `${account.bank?.bank_name} - ${account.account_number}`,
  }));

  const interestPayoutOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'half_yearly', label: 'Half Yearly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'maturity', label: 'On Maturity' },
  ];

  const formatCurrency = (value: number | string | undefined) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : (value ?? 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(numValue);
  };

  const getStatusColor = (status: string | undefined) => {
    return status === 'ACTIVE' ? 'green' : 'gray';
  };

  const getDaysToMaturity = (maturityDate: string) => {
    const days = differenceInDays(new Date(maturityDate), new Date());
    return days > 0 ? days : 0;
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={6}>
        <HStack justifyContent="space-between">
          <Heading size="lg">Fixed Deposits</Heading>
          <Button colorScheme="blue" onClick={() => handleOpenDialog()}>
            <LuPlus /> Add FD
          </Button>
        </HStack>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
          <StatCard
            label="Total Principal"
            value={formatCurrency(totalPrincipal)}
            color="blue"
          />
          <StatCard
            label="Maturity Amount"
            value={formatCurrency(totalMaturityAmount)}
            color="green"
          />
          <StatCard
            label="Active FDs"
            value={activeFDs.toString()}
            color="purple"
          />
          <StatCard
            label="Total FDs"
            value={fds.length.toString()}
            color="teal"
          />
        </Grid>

        {fds.length === 0 ? (
          <EmptyState
            title="No fixed deposits yet"
            description="Create your first fixed deposit to start earning interest"
          />
        ) : (
          <ResponsiveTable
            data={fds}
            columns={[
              {
                header: 'Bank',
                cell: (fd) => (
                  <Stack gap={0}>
                    <Text fontWeight="medium">{fd.bank_name}</Text>
                    <Text fontSize="sm" color="text.secondary">
                      {fd.account_number}
                    </Text>
                  </Stack>
                ),
              },
              {
                header: 'FD Number',
                cell: (fd) => <Text fontWeight="medium">{fd.fd_number}</Text>,
              },
              {
                header: 'Principal',
                cell: (fd) => formatCurrency(fd.principal_amount),
                textAlign: 'right',
              },
              {
                header: 'Interest Rate',
                cell: (fd) => `${fd.interest_rate}%`,
                textAlign: 'right',
              },
              {
                header: 'Tenure',
                cell: (fd) => `${fd.tenure_months} months`,
              },
              {
                header: 'Start Date',
                cell: (fd) => format(new Date(fd.start_date), 'dd MMM yyyy'),
              },
              {
                header: 'Maturity Date',
                cell: (fd) => format(new Date(fd.maturity_date), 'dd MMM yyyy'),
              },
              {
                header: 'Maturity Amount',
                cell: (fd) => (
                  <Text fontWeight="medium" color="green.600">
                    {formatCurrency(fd.maturity_amount)}
                  </Text>
                ),
                textAlign: 'right',
              },
              {
                header: 'Days to Maturity',
                cell: (fd) => {
                  const daysToMaturity = getDaysToMaturity(fd.maturity_date);
                  return fd.status === 'ACTIVE' && daysToMaturity > 0 ? (
                    <Badge colorScheme={daysToMaturity < 30 ? 'orange' : 'blue'}>
                      {daysToMaturity} days
                    </Badge>
                  ) : (
                    '-'
                  );
                },
              },
              {
                header: 'Status',
                cell: (fd) => (
                  <Badge colorScheme={getStatusColor(fd.status)}>{fd.status}</Badge>
                ),
              },
              {
                header: 'Actions',
                cell: (fd) => (
                  <HStack gap={2}>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenDialog(fd)}
                    >
                      <LuPencil />
                    </IconButton>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleDelete(fd)}
                    >
                      <LuTrash2 />
                    </IconButton>
                  </HStack>
                ),
              },
            ]}
            mobileConfig={{
              getKey: (fd) => fd.fd_id,
              summaryRender: (fd) => {
                const daysToMaturity = getDaysToMaturity(fd.maturity_date);
                return (
                  <Flex justify="space-between" align="center" w="full">
                    <VStack align="start" gap={1} flex={1}>
                      <Text fontWeight="bold" fontSize="md">
                        {fd.bank_name}
                      </Text>
                      <Text fontSize="sm" color="text.secondary">
                        {fd.fd_number}
                      </Text>
                      <HStack gap={2}>
                        <Text fontSize="lg" fontWeight="semibold" color="green.600">
                          {formatCurrency(fd.maturity_amount)}
                        </Text>
                        <Badge colorScheme={getStatusColor(fd.status)}>{fd.status}</Badge>
                      </HStack>
                      {fd.status === 'ACTIVE' && daysToMaturity > 0 && (
                        <Badge colorScheme={daysToMaturity < 30 ? 'orange' : 'blue'}>
                          {daysToMaturity} days to maturity
                        </Badge>
                      )}
                    </VStack>
                    <LuChevronDown />
                  </Flex>
                );
              },
              detailsRender: (fd) => (
                <VStack align="stretch" gap={3}>
                  <Flex justify="space-between">
                    <Text color="text.secondary" fontSize="sm">
                      Account Number
                    </Text>
                    <Text fontWeight="medium">{fd.account_number}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="text.secondary" fontSize="sm">
                      Principal Amount
                    </Text>
                    <Text fontWeight="medium">{formatCurrency(fd.principal_amount)}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="text.secondary" fontSize="sm">
                      Interest Rate
                    </Text>
                    <Text fontWeight="medium">{fd.interest_rate}%</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="text.secondary" fontSize="sm">
                      Tenure
                    </Text>
                    <Text fontWeight="medium">{fd.tenure_months} months</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="text.secondary" fontSize="sm">
                      Start Date
                    </Text>
                    <Text fontWeight="medium">
                      {format(new Date(fd.start_date), 'dd MMM yyyy')}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="text.secondary" fontSize="sm">
                      Maturity Date
                    </Text>
                    <Text fontWeight="medium">
                      {format(new Date(fd.maturity_date), 'dd MMM yyyy')}
                    </Text>
                  </Flex>
                  <Flex pt={2} borderTopWidth="1px" mt={2} gap={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      flex={1}
                      onClick={() => handleOpenDialog(fd)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      flex={1}
                      onClick={() => handleDelete(fd)}
                    >
                      Delete
                    </Button>
                  </Flex>
                </VStack>
              ),
            }}
            expandableConfig={{
              getExpandKey: (fd) => fd.fd_id,
              expandedContent: (fd) => (
                <FDInterestPaymentsList
                  fdId={fd.fd_id}
                  fdNumber={fd.fd_number}
                  bankName={fd.bank_name || 'Unknown Bank'}
                />
              ),
            }}
          />
        )}
      </Stack>

      <DialogRoot open={isDialogOpen} onOpenChange={(e) => !e.open && handleCloseDialog()}>
        <Portal>
          <DialogBackdrop />
          <DialogPositioner>
            <DialogContent maxW="2xl">
              <form onSubmit={handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>
                    {selectedFD ? 'Edit Fixed Deposit' : 'Add Fixed Deposit'}
                  </DialogTitle>
                </DialogHeader>
                <DialogCloseTrigger />
                <DialogBody>
                  <Stack gap={4}>
                    <Controller
                      name="account_id"
                      control={control}
                      render={({ field }) => (
                        <SelectField
                          label="Bank Account"
                          required
                          error={errors.account_id?.message}
                          placeholder="Select bank account"
                          options={accountOptions}
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                        />
                      )}
                    />
                    <InputField
                      label="FD Number"
                      required
                      error={errors.fd_number?.message}
                      {...register('fd_number')}
                    />
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                      <Controller
                        name="principal_amount"
                        control={control}
                        render={({ field }) => (
                          <InputField
                            label="Principal Amount"
                            type="number"
                            step="0.01"
                            required
                            error={errors.principal_amount?.message}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        )}
                      />
                      <Controller
                        name="interest_rate"
                        control={control}
                        render={({ field }) => (
                          <InputField
                            label="Interest Rate (%)"
                            type="number"
                            step="0.01"
                            required
                            error={errors.interest_rate?.message}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        )}
                      />
                    </Grid>
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                      <InputField
                        label="Start Date"
                        type="date"
                        required
                        error={errors.start_date?.message}
                        {...register('start_date')}
                      />
                      <InputField
                        label="Maturity Date"
                        type="date"
                        required
                        error={errors.maturity_date?.message}
                        {...register('maturity_date')}
                      />
                    </Grid>
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                      <Controller
                        name="tenure_months"
                        control={control}
                        render={({ field }) => (
                          <InputField
                            label="Tenure (Months)"
                            type="number"
                            required
                            error={errors.tenure_months?.message}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        )}
                      />
                      <Controller
                        name="maturity_amount"
                        control={control}
                        render={({ field }) => (
                          <InputField
                            label="Maturity Amount (Auto-calculated)"
                            type="number"
                            step="0.01"
                            disabled
                            error={errors.maturity_amount?.message}
                            value={field.value || ''}
                            helperText="Calculated based on principal, rate, and tenure"
                          />
                        )}
                      />
                    </Grid>
                    <Controller
                      name="interest_payout_frequency"
                      control={control}
                      render={({ field }) => (
                        <SelectField
                          label="Interest Payout Frequency"
                          error={errors.interest_payout_frequency?.message}
                          placeholder="Select frequency"
                          options={interestPayoutOptions}
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                        />
                      )}
                    />
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                      <Controller
                        name="auto_renewal"
                        control={control}
                        render={({ field }) => (
                          <ChakraField label="Auto Renewal">
                            <HStack>
                              <input
                                type="checkbox"
                                checked={field.value || false}
                                onChange={(e) => field.onChange(e.target.checked)}
                              />
                              <Text fontSize="sm">Enable auto renewal on maturity</Text>
                            </HStack>
                          </ChakraField>
                        )}
                      />
                      <Controller
                        name="premature_withdrawal_allowed"
                        control={control}
                        render={({ field }) => (
                          <ChakraField label="Premature Withdrawal">
                            <HStack>
                              <input
                                type="checkbox"
                                checked={field.value !== false}
                                onChange={(e) => field.onChange(e.target.checked)}
                              />
                              <Text fontSize="sm">Allow premature withdrawal</Text>
                            </HStack>
                          </ChakraField>
                        )}
                      />
                    </Grid>
                    <Controller
                      name="premature_penalty_rate"
                      control={control}
                      render={({ field }) => (
                        <InputField
                          label="Premature Penalty Rate (%)"
                          type="number"
                          step="0.01"
                          error={errors.premature_penalty_rate?.message}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          helperText="Penalty rate for premature withdrawal"
                        />
                      )}
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
                    {selectedFD ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </DialogPositioner>
        </Portal>
      </DialogRoot>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Fixed Deposit"
        message={`Are you sure you want to delete FD "${selectedFD?.fd_number}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </Container>
  );
};

export default FixedDepositsPage;

