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
  IconButton,
  Grid,
  Select,
  VStack,
  Flex,
  Text,
} from '@chakra-ui/react';
import { LuPlus, LuPencil, LuTrash2, LuChevronDown } from 'react-icons/lu';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { bankAccountService, banksService } from '../../api/services/banking.service';
import { toaster } from '../../components/ui/toaster';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { InputField, SelectField } from '../../components/common/FormField';
import StatCard from '../../components/common/StatCard';
import ResponsiveTable from '../../components/common/ResponsiveTable';

const accountSchema = z.object({
  bank_id: z.number({ required_error: 'Bank is required' }),
  account_number: z.string().min(1, 'Account number is required'),
  account_type: z.enum(['SAVINGS', 'CURRENT', 'SALARY']),
  ifsc_code: z.string().min(11, 'IFSC code must be 11 characters'),
  branch: z.string().optional(),
  account_holder_name: z.string().min(1, 'Account holder name is required'),
  opening_balance: z.number().min(0).optional(),
  current_balance: z.number().min(0).optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface BankAccount {
  id: number;
  bank_name: string;
  account_number: string;
  account_type: string;
  ifsc_code: string;
  branch?: string;
  account_holder_name: string;
  current_balance: number;
  is_active: boolean;
}

const BankAccountsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const queryClient = useQueryClient();

  const { data: accountsResponse, isLoading } = useQuery({
    queryKey: ['bankAccounts'],
    queryFn: () => bankAccountService.getAll(),
  });

  const { data: banksResponse } = useQuery({
    queryKey: ['banks'],
    queryFn: () => banksService.getAll(),
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
  });

  const createMutation = useMutation({
    mutationFn: bankAccountService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      toaster.create({
        title: 'Bank account created successfully',
        type: 'success',
      });
      handleCloseDialog();
    },
    onError: () => {
      toaster.create({
        title: 'Failed to create bank account',
        type: 'error',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AccountFormData }) =>
      bankAccountService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      toaster.create({
        title: 'Bank account updated successfully',
        type: 'success',
      });
      handleCloseDialog();
    },
    onError: () => {
      toaster.create({
        title: 'Failed to update bank account',
        type: 'error',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: bankAccountService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      toaster.create({
        title: 'Bank account deleted successfully',
        type: 'success',
      });
      setIsDeleteDialogOpen(false);
      setSelectedAccount(null);
    },
    onError: () => {
      toaster.create({
        title: 'Failed to delete bank account',
        type: 'error',
      });
    },
  });

  const handleOpenDialog = (account?: BankAccount) => {
    if (account) {
      setSelectedAccount(account);
      reset({
        ...account,
        bank_id: 1, // Will need to map from bank_name
        account_type: account.account_type as any,
      });
    } else {
      setSelectedAccount(null);
      reset({
        account_type: 'SAVINGS',
        opening_balance: 0,
        current_balance: 0,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedAccount(null);
    reset();
  };

  const onSubmit = (data: AccountFormData) => {
    if (selectedAccount) {
      updateMutation.mutate({ id: selectedAccount.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (account: BankAccount) => {
    setSelectedAccount(account);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedAccount) {
      deleteMutation.mutate(selectedAccount.id);
    }
  };

  const accounts: BankAccount[] = accountsResponse?.data || [];
  const banks = banksResponse?.data || [];

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.current_balance || 0), 0);
  const activeAccounts = accounts.filter((acc) => acc.is_active).length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={6}>
        <HStack justifyContent="space-between">
          <Heading size="lg">Bank Accounts</Heading>
          <Button colorScheme="blue" onClick={() => handleOpenDialog()}>
            <LuPlus /> Add Account
          </Button>
        </HStack>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
          <StatCard
            label="Total Balance"
            value={formatCurrency(totalBalance)}
            colorScheme="green"
          />
          <StatCard
            label="Active Accounts"
            value={activeAccounts.toString()}
            colorScheme="blue"
          />
          <StatCard
            label="Total Accounts"
            value={accounts.length.toString()}
            colorScheme="purple"
          />
        </Grid>

        {accounts.length === 0 ? (
          <EmptyState
            title="No bank accounts yet"
            description="Add your first bank account to get started"
            action={
              <Button colorScheme="blue" onClick={() => handleOpenDialog()}>
                <LuPlus /> Add Account
              </Button>
            }
          />
        ) : (
          <ResponsiveTable
            data={accounts}
            columns={[
              {
                header: 'Bank',
                cell: (account) => <Text fontWeight="medium">{account.bank_name}</Text>,
              },
              {
                header: 'Account Number',
                cell: (account) => account.account_number,
              },
              {
                header: 'Type',
                cell: (account) => <Badge colorScheme="blue">{account.account_type}</Badge>,
              },
              {
                header: 'IFSC',
                cell: (account) => account.ifsc_code,
              },
              {
                header: 'Branch',
                cell: (account) => account.branch || '-',
              },
              {
                header: 'Balance',
                cell: (account) => (
                  <Text fontWeight="medium">{formatCurrency(account.current_balance)}</Text>
                ),
                textAlign: 'right',
              },
              {
                header: 'Status',
                cell: (account) => (
                  <Badge colorScheme={account.is_active ? 'green' : 'gray'}>
                    {account.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                ),
              },
              {
                header: 'Actions',
                cell: (account) => (
                  <HStack gap={2}>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenDialog(account)}
                    >
                      <LuPencil />
                    </IconButton>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleDelete(account)}
                    >
                      <LuTrash2 />
                    </IconButton>
                  </HStack>
                ),
              },
            ]}
            mobileConfig={{
              getKey: (account) => account.id,
              summaryRender: (account) => {
                const maskedAccount =
                  account.account_number.slice(0, 4) +
                  '****' +
                  account.account_number.slice(-4);
                return (
                  <Flex justify="space-between" align="center" w="full">
                    <VStack align="start" gap={1} flex={1}>
                      <Text fontWeight="bold" fontSize="md">
                        {account.bank_name}
                      </Text>
                      <Text fontSize="sm" color="text.secondary">
                        {maskedAccount}
                      </Text>
                      <HStack gap={2}>
                        <Text fontSize="lg" fontWeight="semibold">
                          {formatCurrency(account.current_balance)}
                        </Text>
                        <Badge colorScheme={account.is_active ? 'green' : 'gray'}>
                          {account.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </HStack>
                    </VStack>
                    <HStack gap={2}>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(account);
                        }}
                      >
                        <LuPencil />
                      </IconButton>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(account);
                        }}
                      >
                        <LuTrash2 />
                      </IconButton>
                      <LuChevronDown />
                    </HStack>
                  </Flex>
                );
              },
              detailsRender: (account) => (
                <VStack align="stretch" gap={3}>
                  <Flex justify="space-between">
                    <Text color="text.secondary" fontSize="sm">
                      Full Account Number
                    </Text>
                    <Text fontWeight="medium">{account.account_number}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="text.secondary" fontSize="sm">
                      Account Type
                    </Text>
                    <Badge colorScheme="blue">{account.account_type}</Badge>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="text.secondary" fontSize="sm">
                      IFSC Code
                    </Text>
                    <Text fontWeight="medium">{account.ifsc_code}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="text.secondary" fontSize="sm">
                      Branch
                    </Text>
                    <Text fontWeight="medium">{account.branch || 'Not specified'}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="text.secondary" fontSize="sm">
                      Account Holder
                    </Text>
                    <Text fontWeight="medium">{account.account_holder_name}</Text>
                  </Flex>
                </VStack>
              ),
            }}
          />
        )}
      </Stack>

      <DialogRoot open={isDialogOpen} onOpenChange={(e) => !e.open && handleCloseDialog()}>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                {selectedAccount ? 'Edit Account' : 'Add Account'}
              </DialogTitle>
            </DialogHeader>
            <DialogCloseTrigger />
            <DialogBody>
              <Stack gap={4}>
                <Controller
                  name="bank_id"
                  control={control}
                  render={({ field }) => (
                    <SelectField
                      label="Bank"
                      required
                      error={errors.bank_id?.message}
                      placeholder="Select bank"
                      value={field.value?.toString()}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    >
                      {banks.map((bank: any) => (
                        <option key={bank.id} value={bank.id}>
                          {bank.name}
                        </option>
                      ))}
                    </SelectField>
                  )}
                />
                <InputField
                  label="Account Number"
                  required
                  error={errors.account_number?.message}
                  {...register('account_number')}
                />
                <Controller
                  name="account_type"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label>Account Type *</label>
                      <Select.Root value={[field.value]} onValueChange={(e) => field.onChange(e.value[0])}>
                        <Select.Trigger>
                          <Select.ValueText placeholder="Select type" />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="SAVINGS">Savings</Select.Item>
                          <Select.Item value="CURRENT">Current</Select.Item>
                          <Select.Item value="SALARY">Salary</Select.Item>
                        </Select.Content>
                      </Select.Root>
                    </div>
                  )}
                />
                <InputField
                  label="IFSC Code"
                  required
                  error={errors.ifsc_code?.message}
                  {...register('ifsc_code')}
                />
                <InputField
                  label="Branch"
                  error={errors.branch?.message}
                  {...register('branch')}
                />
                <InputField
                  label="Account Holder Name"
                  required
                  error={errors.account_holder_name?.message}
                  {...register('account_holder_name')}
                />
                <InputField
                  label="Opening Balance"
                  type="number"
                  step="0.01"
                  error={errors.opening_balance?.message}
                  {...register('opening_balance', { valueAsNumber: true })}
                />
                <InputField
                  label="Current Balance"
                  type="number"
                  step="0.01"
                  error={errors.current_balance?.message}
                  {...register('current_balance', { valueAsNumber: true })}
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
                {selectedAccount ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogRoot>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Bank Account"
        message={`Are you sure you want to delete account "${selectedAccount?.account_number}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </Container>
  );
};

export default BankAccountsPage;

