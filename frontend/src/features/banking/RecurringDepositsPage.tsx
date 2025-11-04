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
import { LuChevronDown, LuPlus } from 'react-icons/lu';
import { format } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { recurringDepositService, bankAccountService } from '../../api/services/banking.service';
import { toaster } from '../../components/ui/toaster';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatCard from '../../components/common/StatCard';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import RDInstallmentsList from './RDInstallmentsList';
import { InputField, SelectField } from '../../components/common/FormField';
import { Field as ChakraField } from '../../components/ui/field';
import type { RecurringDeposit, BankAccount } from '../../types/domain.types';

const rdSchema = z.object({
  account_id: z.number({ message: 'Bank account is required' }),
  rd_number: z.string().min(1, 'RD number is required'),
  monthly_installment: z.number().min(1, 'Monthly installment is required'),
  interest_rate: z.number().min(0).max(100, 'Interest rate must be between 0 and 100'),
  start_date: z.string().min(1, 'Start date is required'),
  maturity_date: z.string().min(1, 'Maturity date is required'),
  tenure_months: z.number().min(1, 'Tenure must be at least 1 month'),
  installment_day: z.number().min(1).max(31, 'Installment day must be between 1 and 31'),
  maturity_amount: z.number().optional(),
  auto_debit: z.boolean().optional(),
  premature_closure_allowed: z.boolean().optional(),
  premature_penalty_rate: z.number().min(0).max(100).optional(),
});

type RDFormData = z.infer<typeof rdSchema>;

const RecurringDepositsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['recurringDeposits'],
    queryFn: () => recurringDepositService.getAll(),
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
  } = useForm<RDFormData>({
    resolver: zodResolver(rdSchema),
  });

  const rds: RecurringDeposit[] = response?.data || [];
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

  // Auto-calculate maturity amount using quarterly compounding
  const watchedFields = watch(['monthly_installment', 'interest_rate', 'tenure_months']);

  useEffect(() => {
    const [monthlyInstallment, rate, tenure] = watchedFields;
    if (monthlyInstallment && rate && tenure) {
      // Indian banking system: Quarterly compounding (90 days)
      // For RD: Total principal = monthly_installment * tenure_months
      // Formula: A = P * (1 + r/4)^(4*t)
      // Where P is total principal, r is annual rate as decimal, t is time in years
      const totalPrincipal = monthlyInstallment * tenure;
      const timeInYears = tenure / 12;
      const rateDecimal = rate / 100;
      const maturityAmount = totalPrincipal * Math.pow(1 + rateDecimal / 4, 4 * timeInYears);
      setValue('maturity_amount', parseFloat(maturityAmount.toFixed(2)));
    }
  }, [watchedFields, setValue]);

  const createMutation = useMutation({
    mutationFn: recurringDepositService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringDeposits'] });
      toaster.create({
        title: 'Recurring deposit created successfully',
        type: 'success',
      });
      handleCloseDialog();
    },
    onError: () => {
      toaster.create({
        title: 'Failed to create recurring deposit',
        type: 'error',
      });
    },
  });

  const handleOpenDialog = () => {
    reset({
      auto_debit: true,
      premature_closure_allowed: true,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    reset();
  };

  const onSubmit = (data: RDFormData) => {
    createMutation.mutate(data);
  };

  const totalInvestment = rds.reduce(
    (sum, rd) => sum + (parseFloat(rd.monthly_installment || '0') * (rd.paid_installments || 0)),
    0
  );
  const totalMaturityAmount = rds.reduce((sum, rd) => sum + parseFloat(rd.maturity_amount || '0'), 0);
  const activeRDs = rds.filter((rd) => rd.status?.toUpperCase() === 'ACTIVE' || rd.is_active).length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'green';
      case 'MATURED':
        return 'blue';
      case 'CLOSED':
        return 'gray';
      default:
        return 'gray';
    }
  };

  if (isLoading) return <LoadingSpinner />;

  // Options for SelectField
  const accountOptions = accounts.map((account) => ({
    value: account.account_id,
    label: `${account.bank?.bank_name} - ${account.account_number}`,
  }));

  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={6}>
        <HStack justifyContent="space-between">
          <Heading size="lg">Recurring Deposits</Heading>
          <Button colorScheme="blue" onClick={handleOpenDialog}>
            <LuPlus /> Add RD
          </Button>
        </HStack>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
          <StatCard
            label="Total Investment"
            value={formatCurrency(totalInvestment)}
            color="blue.600"
          />
          <StatCard
            label="Maturity Amount"
            value={formatCurrency(totalMaturityAmount)}
            color="green.600"
          />
          <StatCard
            label="Active RDs"
            value={activeRDs.toString()}
            color="purple.600"
          />
          <StatCard
            label="Total RDs"
            value={rds.length.toString()}
            color="teal.600"
          />
        </Grid>

        {rds.length === 0 ? (
          <EmptyState
            title="No recurring deposits yet"
            description="Create your first recurring deposit to start saving regularly"
          />
        ) : (
          <ResponsiveTable
            data={rds}
            columns={[
              {
                header: 'Bank',
                cell: (rd) => (
                  <Stack gap={0}>
                    <Text fontWeight="medium">{rd.bank_name}</Text>
                    <Text fontSize="sm" color="text.secondary">
                      {rd.account_number}
                    </Text>
                  </Stack>
                ),
              },
              {
                header: 'RD Number',
                cell: (rd) => <Text fontWeight="medium">{rd.rd_number}</Text>,
              },
              {
                header: 'Installment',
                cell: (rd) => formatCurrency(parseFloat(rd.monthly_installment)),
                textAlign: 'right',
              },
              {
                header: 'Interest Rate',
                cell: (rd) => `${parseFloat(rd.interest_rate)}%`,
                textAlign: 'right',
              },
              {
                header: 'Installment Day',
                cell: (rd) => <Badge>{rd.installment_day ? `Day ${rd.installment_day}` : '-'}</Badge>,
              },
              {
                header: 'Tenure',
                cell: (rd) => `${rd.tenure_months} months`,
              },
              {
                header: 'Start Date',
                cell: (rd) => format(new Date(rd.start_date), 'dd MMM yyyy'),
              },
              {
                header: 'Maturity Date',
                cell: (rd) => format(new Date(rd.maturity_date), 'dd MMM yyyy'),
              },
              {
                header: 'Progress',
                cell: (rd) => {
                  const paidInstallments = rd.paid_installments || 0;
                  const totalInstallments = rd.total_installments || rd.tenure_months || 1;
                  const progress = (paidInstallments / totalInstallments) * 100;
                  return (
                    <HStack gap={2}>
                      <Text fontSize="sm">
                        {paidInstallments}/{totalInstallments}
                      </Text>
                      <Badge
                        colorScheme={
                          progress === 100 ? 'green' : progress > 50 ? 'blue' : 'orange'
                        }
                      >
                        {progress.toFixed(0)}%
                      </Badge>
                    </HStack>
                  );
                },
              },
              {
                header: 'Maturity Amount',
                cell: (rd) => (
                  <Text fontWeight="medium" color="green.600">
                    {formatCurrency(parseFloat(rd.maturity_amount || '0'))}
                  </Text>
                ),
                textAlign: 'right',
              },
              {
                header: 'Status',
                cell: (rd) => (
                  <Badge colorScheme={getStatusColor(rd.status || 'ACTIVE')}>
                    {rd.status || 'ACTIVE'}
                  </Badge>
                ),
              },
            ]}
            mobileConfig={{
              getKey: (rd) => rd.rd_id,
              summaryRender: (rd) => {
                const paidInstallments = rd.paid_installments || 0;
                const totalInstallments = rd.total_installments || rd.tenure_months || 1;
                const progress = (paidInstallments / totalInstallments) * 100;
                const maturityAmount = parseFloat(rd.maturity_amount || '0');
                return (
                  <Flex justify="space-between" align="center" w="full">
                    <VStack align="start" gap={1} flex={1}>
                      <Text fontWeight="bold" fontSize="md">
                        {rd.bank_name}
                      </Text>
                      <Text fontSize="sm" color="text.secondary">
                        {rd.rd_number}
                      </Text>
                      <HStack gap={2}>
                        <Text fontSize="lg" fontWeight="semibold" color="green.600">
                          {formatCurrency(maturityAmount)}
                        </Text>
                        <Badge colorScheme={getStatusColor(rd.status || 'ACTIVE')}>{rd.status || 'ACTIVE'}</Badge>
                      </HStack>
                      <Badge
                        colorScheme={
                          progress === 100 ? 'green' : progress > 50 ? 'blue' : 'orange'
                        }
                      >
                        {paidInstallments}/{totalInstallments} ({progress.toFixed(0)}%)
                      </Badge>
                    </VStack>
                    <LuChevronDown />
                  </Flex>
                );
              },
              detailsRender: (rd) => {
                const monthlyInstallment = parseFloat(rd.monthly_installment);
                const interestRate = parseFloat(rd.interest_rate);
                return (
                  <VStack align="stretch" gap={3}>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Account Number
                      </Text>
                      <Text fontWeight="medium">{rd.account_number}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Monthly Installment
                      </Text>
                      <Text fontWeight="medium">{formatCurrency(monthlyInstallment)}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Installment Day
                      </Text>
                      <Badge>{rd.installment_day ? `Day ${rd.installment_day}` : '-'}</Badge>
                    </Flex>
                    {rd.auto_debit !== undefined && (
                      <Flex justify="space-between">
                        <Text color="text.secondary" fontSize="sm">
                          Auto Debit
                        </Text>
                        <Badge colorScheme={rd.auto_debit ? 'green' : 'gray'}>
                          {rd.auto_debit ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </Flex>
                    )}
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Interest Rate
                      </Text>
                      <Text fontWeight="medium">{interestRate}%</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Tenure
                      </Text>
                      <Text fontWeight="medium">{rd.tenure_months} months</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Start Date
                      </Text>
                      <Text fontWeight="medium">
                        {format(new Date(rd.start_date), 'dd MMM yyyy')}
                      </Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Maturity Date
                      </Text>
                      <Text fontWeight="medium">
                        {format(new Date(rd.maturity_date), 'dd MMM yyyy')}
                      </Text>
                    </Flex>
                  </VStack>
                );
              },
            }}
            expandableConfig={{
              getExpandKey: (rd) => rd.rd_id,
              expandedContent: (rd) => (
                <RDInstallmentsList
                  rdId={rd.rd_id}
                  rdNumber={rd.rd_number}
                  bankName={rd.bank_name || 'Unknown Bank'}
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
                  <DialogTitle>Add Recurring Deposit</DialogTitle>
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
                      label="RD Number"
                      required
                      error={errors.rd_number?.message}
                      {...register('rd_number')}
                    />
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                      <Controller
                        name="monthly_installment"
                        control={control}
                        render={({ field }) => (
                          <InputField
                            label="Monthly Installment"
                            type="number"
                            step="0.01"
                            required
                            error={errors.monthly_installment?.message}
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
                            helperText="Auto-calculated from dates"
                          />
                        )}
                      />
                      <Controller
                        name="installment_day"
                        control={control}
                        render={({ field }) => (
                          <InputField
                            label="Installment Day (1-31)"
                            type="number"
                            min="1"
                            max="31"
                            required
                            error={errors.installment_day?.message}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            helperText="Day of month for installment"
                          />
                        )}
                      />
                    </Grid>
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
                          helperText="Calculated based on monthly installment, rate, and tenure"
                        />
                      )}
                    />
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                      <Controller
                        name="auto_debit"
                        control={control}
                        render={({ field }) => (
                          <ChakraField label="Auto Debit">
                            <HStack>
                              <input
                                type="checkbox"
                                checked={field.value !== false}
                                onChange={(e) => field.onChange(e.target.checked)}
                              />
                              <Text fontSize="sm">Enable auto debit for installments</Text>
                            </HStack>
                          </ChakraField>
                        )}
                      />
                      <Controller
                        name="premature_closure_allowed"
                        control={control}
                        render={({ field }) => (
                          <ChakraField label="Premature Closure">
                            <HStack>
                              <input
                                type="checkbox"
                                checked={field.value !== false}
                                onChange={(e) => field.onChange(e.target.checked)}
                              />
                              <Text fontSize="sm">Allow premature closure</Text>
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
                          helperText="Penalty rate for premature closure"
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
                    loading={createMutation.isPending}
                  >
                    Create
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </DialogPositioner>
        </Portal>
      </DialogRoot>
    </Container>
  );
};

export default RecurringDepositsPage;

