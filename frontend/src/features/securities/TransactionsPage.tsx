import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Heading,
  Stack,
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
  HStack,
  Badge,
  Text,
  VStack,
  Flex,
} from '@chakra-ui/react';
import { LuPlus, LuChevronDown } from 'react-icons/lu';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  transactionsService,
  brokerAccountService,
  securitiesService,
} from '../../api/services/securities.service';
import { toaster } from '../../components/ui/toaster';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { InputField, SelectField } from '../../components/common/FormField';
import DateRangePicker from '../../components/common/DateRangePicker';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import type { SecurityTransaction } from '../../types/domain.types';

const transactionSchema = z.object({
  account_id: z.number({ message: 'Broker account is required' }),
  security_id: z.number({ message: 'Security is required' }),
  transaction_type: z.enum(['buy', 'sell', 'dividend', 'bonus', 'split']),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  transaction_date: z.string().min(1, 'Transaction date is required'),
  total_amount: z.number().min(0, 'Total amount is required'),
  brokerage: z.number().min(0).optional(),
  taxes: z.number().min(0).optional(),
  other_charges: z.number().min(0).optional(),
  net_amount: z.number().min(0, 'Net amount is required'),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

const TransactionsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const queryClient = useQueryClient();

  const { data: transactionsResponse, isLoading } = useQuery({
    queryKey: ['transactions', 'securities', startDate, endDate],
    queryFn: () => transactionsService.getAll(),
  });

  const { data: accountsResponse } = useQuery({
    queryKey: ['brokerAccounts'],
    queryFn: () => brokerAccountService.getAll(),
  });

  const { data: securitiesResponse } = useQuery({
    queryKey: ['securities'],
    queryFn: () => securitiesService.getAll(),
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
  });

  const createMutation = useMutation({
    mutationFn: transactionsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['holdings'] });
      toaster.create({
        title: 'Transaction created successfully',
        type: 'success',
      });
      handleCloseDialog();
    },
    onError: () => {
      toaster.create({
        title: 'Failed to create transaction',
        type: 'error',
      });
    },
  });

  const handleOpenDialog = () => {
    reset({
      transaction_type: 'buy',
      quantity: 0,
      price: 0,
      total_amount: 0,
      brokerage: 0,
      taxes: 0,
      other_charges: 0,
      net_amount: 0,
      transaction_date: format(new Date(), 'yyyy-MM-dd'),
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    reset();
  };

  const onSubmit = (data: TransactionFormData) => {
    createMutation.mutate(data);
  };

  const transactions: SecurityTransaction[] = transactionsResponse?.data || [];
  const brokerAccounts = accountsResponse?.data || [];
  const securities = securitiesResponse?.data || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value);
  };

  const getTransactionBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'buy':
        return 'blue';
      case 'sell':
        return 'orange';
      case 'dividend':
        return 'green';
      case 'bonus':
        return 'purple';
      case 'split':
        return 'teal';
      default:
        return 'gray';
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={6}>
        <HStack justifyContent="space-between">
          <Heading size="lg">Security Transactions</Heading>
          <Button colorScheme="blue" onClick={handleOpenDialog}>
            <LuPlus /> Add Transaction
          </Button>
        </HStack>

        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />

        {transactions.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="Add your first security transaction to get started"
            actionLabel="Add Transaction"
            onAction={handleOpenDialog}
          />
        ) : (
          <ResponsiveTable
            data={transactions}
            columns={[
              {
                header: 'Date',
                cell: (transaction) =>
                  format(new Date(transaction.transaction_date), 'dd MMM yyyy'),
              },
              {
                header: 'Security',
                cell: (transaction) => (
                  <Stack gap={0}>
                    <Text fontWeight="medium">{transaction.security_name}</Text>
                    <Text fontSize="sm" color="text.secondary">
                      {transaction.symbol}
                    </Text>
                  </Stack>
                ),
              },
              {
                header: 'Broker',
                cell: (transaction) => transaction.broker_name,
              },
              {
                header: 'Type',
                cell: (transaction) => (
                  <Badge colorScheme={getTransactionBadgeColor(transaction.transaction_type)}>
                    {transaction.transaction_type.toUpperCase()}
                  </Badge>
                ),
              },
              {
                header: 'Quantity',
                cell: (transaction) => parseFloat(transaction.quantity).toFixed(2),
                textAlign: 'right',
              },
              {
                header: 'Price',
                cell: (transaction) => formatCurrency(parseFloat(transaction.price)),
                textAlign: 'right',
              },
              {
                header: 'Total Amount',
                cell: (transaction) => (
                  <Text fontWeight="medium">{formatCurrency(parseFloat(transaction.total_amount))}</Text>
                ),
                textAlign: 'right',
              },
              {
                header: 'Brokerage',
                cell: (transaction) => {
                  const brokerage = parseFloat(transaction.brokerage || '0');
                  return brokerage > 0 ? formatCurrency(brokerage) : '-';
                },
                textAlign: 'right',
              },
              {
                header: 'Taxes',
                cell: (transaction) => {
                  const taxes = parseFloat(transaction.taxes || '0');
                  return taxes > 0 ? formatCurrency(taxes) : '-';
                },
                textAlign: 'right',
              },
            ]}
            mobileConfig={{
              getKey: (transaction) => transaction.transaction_id,
              summaryRender: (transaction) => (
                <Flex justify="space-between" align="center" w="full">
                  <VStack align="start" gap={1} flex={1}>
                    <HStack gap={2}>
                      <Text fontSize="sm" color="text.secondary">
                        {format(new Date(transaction.transaction_date), 'dd MMM yyyy')}
                      </Text>
                      <Badge colorScheme={getTransactionBadgeColor(transaction.transaction_type)}>
                        {transaction.transaction_type.toUpperCase()}
                      </Badge>
                    </HStack>
                    <Text fontWeight="bold" fontSize="md">
                      {transaction.security_name}
                    </Text>
                    <Text fontSize="lg" fontWeight="semibold">
                      {formatCurrency(parseFloat(transaction.total_amount))}
                    </Text>
                  </VStack>
                  <LuChevronDown />
                </Flex>
              ),
              detailsRender: (transaction) => {
                const brokerage = parseFloat(transaction.brokerage || '0');
                const taxes = parseFloat(transaction.taxes || '0');
                const otherCharges = parseFloat(transaction.other_charges || '0');
                
                return (
                  <VStack align="stretch" gap={3}>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Security Symbol
                      </Text>
                      <Text fontWeight="medium">{transaction.symbol}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Broker
                      </Text>
                      <Text fontWeight="medium">{transaction.broker_name}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Quantity
                      </Text>
                      <Text fontWeight="medium">{parseFloat(transaction.quantity).toFixed(2)}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Price per Unit
                      </Text>
                      <Text fontWeight="medium">{formatCurrency(parseFloat(transaction.price))}</Text>
                    </Flex>
                    {brokerage > 0 && (
                      <Flex justify="space-between">
                        <Text color="text.secondary" fontSize="sm">
                          Brokerage
                        </Text>
                        <Text fontWeight="medium">{formatCurrency(brokerage)}</Text>
                      </Flex>
                    )}
                    {taxes > 0 && (
                      <Flex justify="space-between">
                        <Text color="text.secondary" fontSize="sm">
                          Taxes
                        </Text>
                        <Text fontWeight="medium">{formatCurrency(taxes)}</Text>
                      </Flex>
                    )}
                    {otherCharges > 0 && (
                      <Flex justify="space-between">
                        <Text color="text.secondary" fontSize="sm">
                          Other Charges
                        </Text>
                        <Text fontWeight="medium">{formatCurrency(otherCharges)}</Text>
                      </Flex>
                    )}
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Net Amount
                      </Text>
                      <Text fontWeight="bold">{formatCurrency(parseFloat(transaction.net_amount))}</Text>
                    </Flex>
                    {transaction.notes && (
                      <Flex direction="column" gap={1}>
                        <Text color="text.secondary" fontSize="sm">
                          Notes
                        </Text>
                        <Text fontSize="sm">{transaction.notes}</Text>
                      </Flex>
                    )}
                  </VStack>
                );
              },
            }}
          />
        )}
      </Stack>

      <DialogRoot
        open={isDialogOpen}
        onOpenChange={(e) => !e.open && handleCloseDialog()}
        size="lg"
      >
        <Portal>
          <DialogBackdrop />
          <DialogPositioner>
            <DialogContent>
              <form onSubmit={handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>Add Transaction</DialogTitle>
                </DialogHeader>
                <DialogCloseTrigger />
            <DialogBody>
              <Stack gap={4}>
                <Controller
                  name="account_id"
                  control={control}
                  render={({ field }) => (
                    <SelectField
                      label="Broker Account"
                      required
                      error={errors.account_id?.message}
                      placeholder="Select broker account"
                      value={field.value?.toString()}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    >
                      {brokerAccounts.map((account: any) => (
                        <option key={account.account_id} value={account.account_id}>
                          {account.broker?.broker_name || 'Unknown'} - {account.account_number}
                        </option>
                      ))}
                    </SelectField>
                  )}
                />

                <Controller
                  name="security_id"
                  control={control}
                  render={({ field }) => (
                    <SelectField
                      label="Security"
                      required
                      error={errors.security_id?.message}
                      placeholder="Select security"
                      value={field.value?.toString()}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    >
                      {securities.map((security: any) => (
                        <option key={security.security_id} value={security.security_id}>
                          {security.name} ({security.symbol})
                        </option>
                      ))}
                    </SelectField>
                  )}
                />

                <Controller
                  name="transaction_type"
                  control={control}
                  render={({ field }) => (
                    <SelectField
                      label="Transaction Type"
                      required
                      error={errors.transaction_type?.message}
                      placeholder="Select type"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      <option value="buy">Buy</option>
                      <option value="sell">Sell</option>
                      <option value="dividend">Dividend</option>
                      <option value="bonus">Bonus</option>
                      <option value="split">Split</option>
                    </SelectField>
                  )}
                />

                <HStack>
                  <InputField
                    label="Quantity"
                    type="number"
                    step="0.01"
                    required
                    error={errors.quantity?.message}
                    {...register('quantity', { valueAsNumber: true })}
                  />
                  <InputField
                    label="Price per Unit"
                    type="number"
                    step="0.01"
                    required
                    error={errors.price?.message}
                    {...register('price', { valueAsNumber: true })}
                  />
                </HStack>

                <InputField
                  label="Transaction Date"
                  type="date"
                  required
                  error={errors.transaction_date?.message}
                  {...register('transaction_date')}
                />

                <HStack>
                  <InputField
                    label="Total Amount"
                    type="number"
                    step="0.01"
                    required
                    error={errors.total_amount?.message}
                    {...register('total_amount', { valueAsNumber: true })}
                  />
                  <InputField
                    label="Net Amount"
                    type="number"
                    step="0.01"
                    required
                    error={errors.net_amount?.message}
                    {...register('net_amount', { valueAsNumber: true })}
                  />
                </HStack>

                <HStack>
                  <InputField
                    label="Brokerage"
                    type="number"
                    step="0.01"
                    error={errors.brokerage?.message}
                    {...register('brokerage', { valueAsNumber: true })}
                  />
                  <InputField
                    label="Taxes"
                    type="number"
                    step="0.01"
                    error={errors.taxes?.message}
                    {...register('taxes', { valueAsNumber: true })}
                  />
                </HStack>

                <InputField
                  label="Other Charges"
                  type="number"
                  step="0.01"
                  error={errors.other_charges?.message}
                  {...register('other_charges', { valueAsNumber: true })}
                />

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

export default TransactionsPage;

