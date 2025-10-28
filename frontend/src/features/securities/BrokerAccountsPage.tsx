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
  Portal,
  HStack,
  Badge,
  IconButton,
  Grid,
  VStack,
  Flex,
  Text,
  DialogPositioner,
} from '@chakra-ui/react';
import { LuPlus, LuPencil, LuTrash2, LuChevronDown } from 'react-icons/lu';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { brokerAccountService, brokerService } from '../../api/services/securities.service';
import { toaster } from '../../components/ui/toaster';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { InputField, SelectField } from '../../components/common/FormField';
import StatCard from '../../components/common/StatCard';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import SearchBar from '../../components/common/SearchBar';
import type { BrokerAccount } from '../../types/domain.types';
import { format } from 'date-fns';

const accountSchema = z.object({
  broker_id: z.number({ message: 'Broker is required' }).min(1, 'Broker is required'),
  account_number: z.string().min(3, 'Account number must be at least 3 characters'),
  account_type: z.enum(['demat', 'trading', 'demat_trading'], {
    message: 'Account type is required',
  }),
  dp_id: z.string().max(20, 'DP ID must not exceed 20 characters').optional(),
  opened_date: z.string().optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

const BrokerAccountsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BrokerAccount | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: accountsResponse, isLoading } = useQuery({
    queryKey: ['brokerAccounts'],
    queryFn: () => brokerAccountService.getAll(),
  });

  const { data: brokersResponse } = useQuery({
    queryKey: ['brokers'],
    queryFn: () => brokerService.getAll(),
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
    mutationFn: brokerAccountService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brokerAccounts'] });
      toaster.create({
        title: 'Broker account created successfully',
        type: 'success',
      });
      handleCloseDialog();
    },
    onError: () => {
      toaster.create({
        title: 'Failed to create broker account',
        type: 'error',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AccountFormData }) =>
      brokerAccountService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brokerAccounts'] });
      toaster.create({
        title: 'Broker account updated successfully',
        type: 'success',
      });
      handleCloseDialog();
    },
    onError: () => {
      toaster.create({
        title: 'Failed to update broker account',
        type: 'error',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: brokerAccountService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brokerAccounts'] });
      toaster.create({
        title: 'Broker account deleted successfully',
        type: 'success',
      });
      setIsDeleteDialogOpen(false);
      setSelectedAccount(null);
    },
    onError: () => {
      toaster.create({
        title: 'Failed to delete broker account',
        type: 'error',
      });
    },
  });

  const handleOpenDialog = (account?: BrokerAccount) => {
    if (account) {
      setSelectedAccount(account);
      reset({
        broker_id: account.broker_id,
        account_number: account.account_number,
        account_type: account.account_type,
        dp_id: account.dp_id || '',
        opened_date: account.opened_date,
      });
    } else {
      setSelectedAccount(null);
      reset({
        account_type: 'demat_trading',
        account_number: '',
        dp_id: '',
        opened_date: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedAccount(null);
    reset();
  };

  const handleDeleteClick = (account: BrokerAccount) => {
    setSelectedAccount(account);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedAccount) {
      deleteMutation.mutate(selectedAccount.account_id);
    }
  };

  const onSubmit = (data: AccountFormData) => {
    if (selectedAccount) {
      updateMutation.mutate({ id: selectedAccount.account_id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const accounts: BrokerAccount[] = accountsResponse?.data || [];
  const brokers = brokersResponse?.data || [];

  const filteredAccounts = accounts.filter((account) => {
    const searchLower = searchTerm.toLowerCase();
    const brokerName = account.broker?.broker_name?.toLowerCase() || '';
    const accountNumber = account.account_number.toLowerCase();
    return brokerName.includes(searchLower) || accountNumber.includes(searchLower);
  });

  // Calculate stats
  const totalAccounts = accounts.length;
  const activeAccounts = accounts.filter((a) => a.is_active).length;
  const dematAccounts = accounts.filter(
    (a) => a.account_type === 'demat' || a.account_type === 'demat_trading'
  ).length;
  const tradingAccounts = accounts.filter(
    (a) => a.account_type === 'trading' || a.account_type === 'demat_trading'
  ).length;

  const getAccountTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'demat':
        return 'blue';
      case 'trading':
        return 'purple';
      case 'demat_trading':
        return 'green';
      default:
        return 'gray';
    }
  };

  const formatAccountType = (type: string) => {
    switch (type) {
      case 'demat':
        return 'Demat';
      case 'trading':
        return 'Trading';
      case 'demat_trading':
        return 'Demat + Trading';
      default:
        return type;
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={6}>
        <HStack justifyContent="space-between">
          <Heading size="lg">Broker Accounts</Heading>
          <Button colorScheme="blue" onClick={() => handleOpenDialog()}>
            <LuPlus /> Add Account
          </Button>
        </HStack>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
          <StatCard
            label="Total Accounts"
            value={totalAccounts.toString()}
            color="blue.600"
          />
          <StatCard
            label="Active Accounts"
            value={activeAccounts.toString()}
            color="green.600"
          />
          <StatCard
            label="Demat Accounts"
            value={dematAccounts.toString()}
            color="purple.600"
          />
          <StatCard
            label="Trading Accounts"
            value={tradingAccounts.toString()}
            color="orange.600"
          />
        </Grid>

        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by broker or account number..."
        />

        {filteredAccounts.length === 0 ? (
          <EmptyState
            title={searchTerm ? 'No accounts found' : 'No broker accounts yet'}
            description={
              searchTerm
                ? 'Try adjusting your search'
                : 'Add your first broker account to start trading'
            }
            actionLabel={!searchTerm ? 'Add Account' : undefined}
            onAction={!searchTerm ? () => handleOpenDialog() : undefined}
          />
        ) : (
          <ResponsiveTable
            data={filteredAccounts}
            columns={[
              {
                header: 'Broker',
                cell: (account) => (
                  <VStack align="start" gap={0}>
                    <Text fontWeight="medium">
                      {account.broker?.broker_name || 'Unknown'}
                    </Text>
                    <Text fontSize="xs" color="text.secondary">
                      {account.broker?.broker_code || ''}
                    </Text>
                  </VStack>
                ),
              },
              {
                header: 'Account Number',
                cell: (account) => (
                  <Text fontWeight="medium">{account.account_number}</Text>
                ),
              },
              {
                header: 'Account Type',
                cell: (account) => (
                  <Badge colorScheme={getAccountTypeBadgeColor(account.account_type)}>
                    {formatAccountType(account.account_type)}
                  </Badge>
                ),
              },
              {
                header: 'DP ID',
                cell: (account) => account.dp_id || '-',
              },
              {
                header: 'Opened Date',
                cell: (account) =>
                  account.opened_date
                    ? format(new Date(account.opened_date), 'dd MMM yyyy')
                    : '-',
              },
              {
                header: 'Status',
                cell: (account) => (
                  <Badge colorScheme={account.is_active ? 'green' : 'red'}>
                    {account.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                ),
              },
              {
                header: 'Actions',
                cell: (account) => (
                  <HStack gap={1}>
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
                      onClick={() => handleDeleteClick(account)}
                    >
                      <LuTrash2 />
                    </IconButton>
                  </HStack>
                ),
              },
            ]}
            mobileConfig={{
              getKey: (account) => account.account_id,
              summaryRender: (account) => (
                <Flex justify="space-between" align="center" w="full">
                  <VStack align="start" gap={1} flex={1}>
                    <Text fontWeight="bold" fontSize="md">
                      {account.broker?.broker_name || 'Unknown Broker'}
                    </Text>
                    <HStack gap={2}>
                      <Text fontSize="sm" color="text.secondary">
                        {account.account_number}
                      </Text>
                      <Badge
                        colorScheme={getAccountTypeBadgeColor(account.account_type)}
                        fontSize="xs"
                      >
                        {formatAccountType(account.account_type)}
                      </Badge>
                    </HStack>
                  </VStack>
                  <LuChevronDown />
                </Flex>
              ),
              detailsRender: (account) => (
                <VStack align="stretch" gap={3}>
                  <Flex justify="space-between">
                    <Text color="text.secondary" fontSize="sm">
                      Account Type
                    </Text>
                    <Badge colorScheme={getAccountTypeBadgeColor(account.account_type)}>
                      {formatAccountType(account.account_type)}
                    </Badge>
                  </Flex>
                  {account.dp_id && (
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        DP ID
                      </Text>
                      <Text fontWeight="medium">{account.dp_id}</Text>
                    </Flex>
                  )}
                  {account.opened_date && (
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Opened Date
                      </Text>
                      <Text fontWeight="medium">
                        {format(new Date(account.opened_date), 'dd MMM yyyy')}
                      </Text>
                    </Flex>
                  )}
                  <Flex justify="space-between">
                    <Text color="text.secondary" fontSize="sm">
                      Status
                    </Text>
                    <Badge colorScheme={account.is_active ? 'green' : 'red'}>
                      {account.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </Flex>
                  <Flex pt={2} borderTopWidth="1px" mt={2} gap={2}>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      flex={1}
                      onClick={() => handleOpenDialog(account)}
                    >
                      <LuPencil /> Edit
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      flex={1}
                      onClick={() => handleDeleteClick(account)}
                    >
                      <LuTrash2 /> Delete
                    </Button>
                  </Flex>
                </VStack>
              ),
            }}
          />
        )}
      </Stack>

      {/* Add/Edit Dialog */}
      <DialogRoot
        open={isDialogOpen}
        onOpenChange={(e) => !e.open && handleCloseDialog()}
        size="lg"
      >
        <Portal>
          <DialogBackdrop />
          <DialogPositioner>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedAccount ? 'Edit Broker Account' : 'Add Broker Account'}
              </DialogTitle>
              <DialogCloseTrigger />
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogBody>
                <Stack gap={4}>
                  <Controller
                    name="broker_id"
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        label="Broker"
                        error={errors.broker_id?.message}
                        required
                        placeholder="Select broker"
                        value={field.value?.toString() || ''}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      >
                        <option value="">Select broker</option>
                        {brokers.map((broker) => (
                          <option key={broker.broker_id} value={broker.broker_id}>
                            {broker.broker_name}
                          </option>
                        ))}
                      </SelectField>
                    )}
                  />

                  <InputField
                    label="Account Number"
                    error={errors.account_number?.message}
                    required
                    {...register('account_number')}
                  />

                  <SelectField
                    label="Account Type"
                    error={errors.account_type?.message}
                    required
                    {...register('account_type')}
                  >
                    <option value="demat">Demat</option>
                    <option value="trading">Trading</option>
                    <option value="demat_trading">Demat + Trading</option>
                  </SelectField>

                  <InputField
                    label="DP ID"
                    error={errors.dp_id?.message}
                    placeholder="Optional"
                    {...register('dp_id')}
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
                  <Button variant="outline">Cancel</Button>
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Broker Account"
        message={`Are you sure you want to delete account ${selectedAccount?.account_number}? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </Container>
  );
};

export default BrokerAccountsPage;

