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
  IconButton,
  Grid,
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
import type { BankAccount } from '../../types/domain.types';

const accountSchema = z.object({
  bank_id: z.number({ message: 'Bank is required' }),
  account_number: z.string().min(1, 'Account number is required'),
  account_type: z.enum(['savings', 'current', 'fixed_deposit', 'recurring_deposit', 'nro', 'nre']),
  ifsc_code: z.string().min(11, 'IFSC code must be 11 characters'),
  branch_name: z.string().optional(),
  account_name: z.string().optional(),
  opened_date: z.string().optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

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
        bank_id: account.bank_id,
        account_number: account.account_number,
        account_type: account.account_type as any,
        ifsc_code: account.ifsc_code || '',
        branch_name: account.branch_name,
        account_name: account.account_name,
        opened_date: account.opened_date,
      });
    } else {
      setSelectedAccount(null);
      reset({
        account_type: 'savings',
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
      updateMutation.mutate({ id: selectedAccount.account_id, data });
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
      deleteMutation.mutate(selectedAccount.account_id);
    }
  };

  const accounts: BankAccount[] = accountsResponse?.data || [];
  const banks = banksResponse?.data || [];

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

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
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
            actionLabel="Add Account"
            onAction={() => handleOpenDialog()}
          />
        ) : (
          <ResponsiveTable
            data={accounts}
            columns={[
              {
                header: 'Bank',
                cell: (account) => <Text fontWeight="medium">{account.bank?.bank_name || '-'}</Text>,
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
                cell: (account) => account.ifsc_code || '-',
              },
              {
                header: 'Branch',
                cell: (account) => account.branch_name || '-',
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
              getKey: (account) => account.account_id,
              summaryRender: (account) => {
                const maskedAccount =
                  account.account_number.slice(0, 4) +
                  '****' +
                  account.account_number.slice(-4);
                return (
                  <Flex justify="space-between" align="center" w="full">
                    <VStack align="start" gap={1} flex={1}>
                      <Text fontWeight="bold" fontSize="md">
                        {account.bank?.bank_name || 'Unknown Bank'}
                      </Text>
                      <Text fontSize="sm" color="text.secondary">
                        {maskedAccount}
                      </Text>
                      <Badge colorScheme={account.is_active ? 'green' : 'gray'}>
                        {account.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </VStack>
                    <LuChevronDown />
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
                    <Text fontWeight="medium">{account.ifsc_code || '-'}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="text.secondary" fontSize="sm">
                      Branch
                    </Text>
                    <Text fontWeight="medium">{account.branch_name || 'Not specified'}</Text>
                  </Flex>
                  {account.account_name && (
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Account Name
                      </Text>
                      <Text fontWeight="medium">{account.account_name}</Text>
                    </Flex>
                  )}
                  <Flex pt={2} borderTopWidth="1px" mt={2} gap={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      flex={1}
                      onClick={() => handleOpenDialog(account)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      flex={1}
                      onClick={() => handleDelete(account)}
                    >
                      Delete
                    </Button>
                  </Flex>
                </VStack>
              ),
            }}
          />
        )}
      </Stack>

      <DialogRoot open={isDialogOpen} onOpenChange={(e) => !e.open && handleCloseDialog()}>
        <Portal>
          <DialogBackdrop />
          <DialogPositioner>
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
                            <option key={bank.bank_id} value={bank.bank_id}>
                              {bank.bank_name}
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
                        <SelectField
                          label="Account Type"
                          required
                          error={errors.account_type?.message}
                          placeholder="Select type"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        >
                          <option value="savings">Savings</option>
                          <option value="current">Current</option>
                          <option value="fixed_deposit">Fixed Deposit</option>
                          <option value="recurring_deposit">Recurring Deposit</option>
                          <option value="nro">NRO</option>
                          <option value="nre">NRE</option>
                        </SelectField>
                      )}
                    />
                    <InputField
                      label="IFSC Code"
                      required
                      error={errors.ifsc_code?.message}
                      {...register('ifsc_code')}
                    />
                    <InputField
                      label="Branch Name"
                      error={errors.branch_name?.message}
                      {...register('branch_name')}
                    />
                    <InputField
                      label="Account Name"
                      error={errors.account_name?.message}
                      {...register('account_name')}
                      placeholder="Optional account nickname"
                    />
                    <InputField
                      label="Opened Date"
                      type="date"
                      error={errors.opened_date?.message}
                      {...register('opened_date')}
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
          </DialogPositioner>
        </Portal>
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

