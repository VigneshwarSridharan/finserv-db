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
  HStack,
  Badge,
  Text,
  Select,
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

const transactionSchema = z.object({
  broker_account_id: z.number({ required_error: 'Broker account is required' }),
  security_id: z.number({ required_error: 'Security is required' }),
  transaction_type: z.enum(['BUY', 'SELL', 'DIVIDEND', 'BONUS', 'SPLIT']),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  transaction_date: z.string().min(1, 'Transaction date is required'),
  fees: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface SecurityTransaction {
  id: number;
  security_name: string;
  security_symbol: string;
  broker_name: string;
  transaction_type: string;
  quantity: number;
  price: number;
  total_amount: number;
  transaction_date: string;
  fees?: number;
  tax?: number;
  notes?: string;
}

const TransactionsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const queryClient = useQueryClient();

  const { data: transactionsResponse, isLoading } = useQuery({
    queryKey: ['transactions', 'securities', startDate, endDate],
    queryFn: () =>
      transactionsService.getAll({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      }),
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
      transaction_type: 'BUY',
      quantity: 0,
      price: 0,
      fees: 0,
      tax: 0,
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
    switch (type) {
      case 'BUY':
        return 'blue';
      case 'SELL':
        return 'orange';
      case 'DIVIDEND':
        return 'green';
      case 'BONUS':
        return 'purple';
      case 'SPLIT':
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
            action={
              <Button colorScheme="blue" onClick={handleOpenDialog}>
                <LuPlus /> Add Transaction
              </Button>
            }
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
                      {transaction.security_symbol}
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
                    {transaction.transaction_type}
                  </Badge>
                ),
              },
              {
                header: 'Quantity',
                cell: (transaction) => transaction.quantity,
                textAlign: 'right',
              },
              {
                header: 'Price',
                cell: (transaction) => formatCurrency(transaction.price),
                textAlign: 'right',
              },
              {
                header: 'Total Amount',
                cell: (transaction) => (
                  <Text fontWeight="medium">{formatCurrency(transaction.total_amount)}</Text>
                ),
                textAlign: 'right',
              },
              {
                header: 'Fees',
                cell: (transaction) =>
                  transaction.fees ? formatCurrency(transaction.fees) : '-',
                textAlign: 'right',
              },
              {
                header: 'Tax',
                cell: (transaction) =>
                  transaction.tax ? formatCurrency(transaction.tax) : '-',
                textAlign: 'right',
              },
            ]}
            mobileConfig={{
              getKey: (transaction) => transaction.id,
              summaryRender: (transaction) => (
                <Flex justify="space-between" align="center" w="full">
                  <VStack align="start" gap={1} flex={1}>
                    <HStack gap={2}>
                      <Text fontSize="sm" color="text.secondary">
                        {format(new Date(transaction.transaction_date), 'dd MMM yyyy')}
                      </Text>
                      <Badge colorScheme={getTransactionBadgeColor(transaction.transaction_type)}>
                        {transaction.transaction_type}
                      </Badge>
                    </HStack>
                    <Text fontWeight="bold" fontSize="md">
                      {transaction.security_name}
                    </Text>
                    <Text fontSize="lg" fontWeight="semibold">
                      {formatCurrency(transaction.total_amount)}
                    </Text>
                  </VStack>
                  <LuChevronDown />
                </Flex>
              ),
              detailsRender: (transaction) => (
                <VStack align="stretch" gap={3}>
                  <Flex justify="space-between">
                    <Text color="text.secondary" fontSize="sm">
                      Security Symbol
                    </Text>
                    <Text fontWeight="medium">{transaction.security_symbol}</Text>
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
                    <Text fontWeight="medium">{transaction.quantity}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="text.secondary" fontSize="sm">
                      Price per Unit
                    </Text>
                    <Text fontWeight="medium">{formatCurrency(transaction.price)}</Text>
                  </Flex>
                  {transaction.fees && (
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Fees
                      </Text>
                      <Text fontWeight="medium">{formatCurrency(transaction.fees)}</Text>
                    </Flex>
                  )}
                  {transaction.tax && (
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Tax
                      </Text>
                      <Text fontWeight="medium">{formatCurrency(transaction.tax)}</Text>
                    </Flex>
                  )}
                  {transaction.notes && (
                    <Flex direction="column" gap={1}>
                      <Text color="text.secondary" fontSize="sm">
                        Notes
                      </Text>
                      <Text fontSize="sm">{transaction.notes}</Text>
                    </Flex>
                  )}
                </VStack>
              ),
            }}
          />
        )}
      </Stack>

      <DialogRoot
        open={isDialogOpen}
        onOpenChange={(e) => !e.open && handleCloseDialog()}
        size="lg"
      >
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Add Transaction</DialogTitle>
            </DialogHeader>
            <DialogCloseTrigger />
            <DialogBody>
              <Stack gap={4}>
                <Controller
                  name="broker_account_id"
                  control={control}
                  render={({ field }) => (
                    <SelectField
                      label="Broker Account"
                      required
                      error={errors.broker_account_id?.message}
                      placeholder="Select broker account"
                      value={field.value?.toString()}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    >
                      {brokerAccounts.map((account: any) => (
                        <option key={account.id} value={account.id}>
                          {account.broker_name} - {account.account_number}
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
                        <option key={security.id} value={security.id}>
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
                    <div>
                      <label>Transaction Type *</label>
                      <Select.Root value={[field.value]} onValueChange={(e) => field.onChange(e.value[0])}>
                        <Select.Trigger>
                          <Select.ValueText placeholder="Select type" />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="BUY">Buy</Select.Item>
                          <Select.Item value="SELL">Sell</Select.Item>
                          <Select.Item value="DIVIDEND">Dividend</Select.Item>
                          <Select.Item value="BONUS">Bonus</Select.Item>
                          <Select.Item value="SPLIT">Split</Select.Item>
                        </Select.Content>
                      </Select.Root>
                      {errors.transaction_type && (
                        <Text color="red.500" fontSize="sm">
                          {errors.transaction_type.message}
                        </Text>
                      )}
                    </div>
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
                    label="Price"
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
                    label="Fees"
                    type="number"
                    step="0.01"
                    error={errors.fees?.message}
                    {...register('fees', { valueAsNumber: true })}
                  />
                  <InputField
                    label="Tax"
                    type="number"
                    step="0.01"
                    error={errors.tax?.message}
                    {...register('tax', { valueAsNumber: true })}
                  />
                </HStack>

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
      </DialogRoot>
    </Container>
  );
};

export default TransactionsPage;

