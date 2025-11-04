import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Stack, Text, Badge, VStack, HStack, Flex, Button } from '@chakra-ui/react';
import { recurringDepositService } from '../../api/services/banking.service';
import { toaster } from '../../components/ui/toaster';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ResponsiveTable from '../../components/common/ResponsiveTable';

interface RDInstallmentsListProps {
  rdId: number;
  rdNumber: string;
  bankName: string;
}

interface RDInstallment {
  installment_id: number;
  rd_id: number;
  installment_number: number;
  due_date: string;
  installment_amount: string;
  paid_amount: string;
  paid_date: string | null;
  late_fee: string;
  payment_status: string;
  days_overdue: number;
}

const RDInstallmentsList = ({
  rdId,
  rdNumber,
  bankName,
}: RDInstallmentsListProps) => {
  const queryClient = useQueryClient();

  const { data: installmentsResponse, isLoading } = useQuery({
    queryKey: ['recurringDeposits', rdId, 'installments'],
    queryFn: () => recurringDepositService.getInstallments(rdId),
  });

  const payMutation = useMutation({
    mutationFn: ({ installmentId }: { installmentId: number }) =>
      recurringDepositService.payInstallment(rdId, installmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringDeposits', rdId, 'installments'] });
      queryClient.invalidateQueries({ queryKey: ['recurringDeposits'] });
      toaster.create({
        title: 'Payment recorded successfully',
        type: 'success',
      });
    },
    onError: () => {
      toaster.create({
        title: 'Failed to record payment',
        type: 'error',
      });
    },
  });

  const rollbackMutation = useMutation({
    mutationFn: ({ installmentId }: { installmentId: number }) =>
      recurringDepositService.rollbackInstallment(rdId, installmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringDeposits', rdId, 'installments'] });
      queryClient.invalidateQueries({ queryKey: ['recurringDeposits'] });
      toaster.create({
        title: 'Payment rollback successful',
        type: 'success',
      });
    },
    onError: () => {
      toaster.create({
        title: 'Failed to rollback payment',
        type: 'error',
      });
    },
  });

  const installments: RDInstallment[] = installmentsResponse?.data || [];

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(numValue);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'green';
      case 'pending':
        return 'orange';
      case 'overdue':
        return 'red';
      case 'waived':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const handlePayInstallment = (installmentId: number) => {
    payMutation.mutate({ installmentId });
  };

  const handleRollbackInstallment = (installmentId: number) => {
    rollbackMutation.mutate({ installmentId });
  };

  const totalInstallments = installments.length;
  const paidInstallments = installments.filter(
    (i) => i.payment_status?.toLowerCase() === 'paid'
  ).length;
  const totalPaid = installments.reduce(
    (sum, i) => sum + parseFloat(i.paid_amount || '0'),
    0
  );
  const totalLateFees = installments.reduce(
    (sum, i) => sum + parseFloat(i.late_fee || '0'),
    0
  );
  const overdueInstallments = installments.filter(
    (i) => i.payment_status?.toLowerCase() === 'overdue' || i.days_overdue > 0
  ).length;

  if (isLoading) {
    return (
      <Box p={4}>
        <LoadingSpinner />
      </Box>
    );
  }

  return (
    <Box p={4} borderRadius="md">
      <Stack gap={4}>
        <HStack justify="space-between" align="center">
          <Text fontSize="md" fontWeight="semibold">
            Installment History for {rdNumber} ({bankName})
          </Text>
        </HStack>

        {installments.length === 0 ? (
          <EmptyState
            title="No installments yet"
            description="Installment schedule will appear here"
          />
        ) : (
          <>
            <Box bg="bg.subtle" p={3} borderRadius="md">
              <HStack justify="space-around" wrap="wrap" gap={4}>
                <VStack align="center" gap={0}>
                  <Text fontSize="xs" color="text.secondary">
                    Total Paid
                  </Text>
                  <Text fontSize="md" fontWeight="semibold" color="green.600">
                    {formatCurrency(totalPaid)}
                  </Text>
                </VStack>
                <VStack align="center" gap={0}>
                  <Text fontSize="xs" color="text.secondary">
                    Installments Paid
                  </Text>
                  <Text fontSize="md" fontWeight="semibold" color="blue.600">
                    {paidInstallments}/{totalInstallments}
                  </Text>
                </VStack>
                {overdueInstallments > 0 && (
                  <VStack align="center" gap={0}>
                    <Text fontSize="xs" color="text.secondary">
                      Overdue
                    </Text>
                    <Text fontSize="md" fontWeight="semibold" color="red.600">
                      {overdueInstallments}
                    </Text>
                  </VStack>
                )}
                {totalLateFees > 0 && (
                  <VStack align="center" gap={0}>
                    <Text fontSize="xs" color="text.secondary">
                      Late Fees
                    </Text>
                    <Text fontSize="md" fontWeight="semibold" color="orange.600">
                      {formatCurrency(totalLateFees)}
                    </Text>
                  </VStack>
                )}
              </HStack>
            </Box>

            <ResponsiveTable
              data={installments}
              columns={[
                {
                  header: 'Installment #',
                  cell: (installment) => (
                    <Text fontWeight="medium">#{installment.installment_number}</Text>
                  ),
                },
                {
                  header: 'Due Date',
                  cell: (installment) => formatDate(installment.due_date),
                },
                {
                  header: 'Status',
                  cell: (installment) => (
                    <HStack gap={2}>
                      <Badge colorScheme={getPaymentStatusColor(installment.payment_status)}>
                        {installment.payment_status?.toUpperCase() || 'PENDING'}
                      </Badge>
                      {installment.days_overdue > 0 && (
                        <Badge colorScheme="red" fontSize="xs">
                          {installment.days_overdue}d overdue
                        </Badge>
                      )}
                    </HStack>
                  ),
                },
                {
                  header: 'Amount',
                  cell: (installment) => (
                    <Text fontWeight="medium">
                      {formatCurrency(installment.installment_amount)}
                    </Text>
                  ),
                  textAlign: 'right',
                },
                {
                  header: 'Paid Amount',
                  cell: (installment) => (
                    <Text
                      fontWeight="medium"
                      color={
                        parseFloat(installment.paid_amount) > 0 ? 'green.600' : 'text.secondary'
                      }
                    >
                      {formatCurrency(installment.paid_amount)}
                    </Text>
                  ),
                  textAlign: 'right',
                },
                {
                  header: 'Late Fee',
                  cell: (installment) =>
                    parseFloat(installment.late_fee) > 0 ? (
                      <Text color="orange.600">{formatCurrency(installment.late_fee)}</Text>
                    ) : (
                      '-'
                    ),
                  textAlign: 'right',
                },
                {
                  header: 'Paid Date',
                  cell: (installment) =>
                    installment.paid_date ? formatDate(installment.paid_date) : '-',
                },
                {
                  header: 'Action',
                  cell: (installment) => {
                    const isPaid = installment.payment_status?.toLowerCase() === 'paid';
                    const isPending = 
                      installment.payment_status?.toLowerCase() === 'pending' ||
                      installment.payment_status?.toLowerCase() === 'overdue';

                    return (
                      <HStack gap={2}>
                        {isPending && (
                          <Button
                            size="xs"
                            colorScheme="blue"
                            onClick={() => handlePayInstallment(installment.installment_id)}
                            loading={payMutation.isPending}
                          >
                            Pay
                          </Button>
                        )}
                        {isPaid && (
                          <Button
                            size="xs"
                            colorScheme="orange"
                            variant="outline"
                            onClick={() => handleRollbackInstallment(installment.installment_id)}
                            loading={rollbackMutation.isPending}
                          >
                            Rollback
                          </Button>
                        )}
                      </HStack>
                    );
                  },
                },
              ]}
              mobileConfig={{
                getKey: (installment) => installment.installment_id.toString(),
                summaryRender: (installment) => (
                  <Flex justify="space-between" align="center" w="full">
                    <VStack align="start" gap={1} flex={1}>
                      <HStack gap={2}>
                        <Text fontWeight="bold" fontSize="md">
                          Installment #{installment.installment_number}
                        </Text>
                        <Badge colorScheme={getPaymentStatusColor(installment.payment_status)}>
                          {installment.payment_status?.toUpperCase() || 'PENDING'}
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" color="text.secondary">
                        Due: {formatDate(installment.due_date)}
                      </Text>
                      <HStack gap={2}>
                        <Text fontSize="lg" fontWeight="semibold" color="blue.600">
                          {formatCurrency(installment.installment_amount)}
                        </Text>
                        {parseFloat(installment.paid_amount) > 0 && (
                          <Badge colorScheme="green">
                            Paid: {formatCurrency(installment.paid_amount)}
                          </Badge>
                        )}
                      </HStack>
                      {installment.days_overdue > 0 && (
                        <Badge colorScheme="red" fontSize="xs">
                          {installment.days_overdue} days overdue
                        </Badge>
                      )}
                    </VStack>
                  </Flex>
                ),
                detailsRender: (installment) => (
                  <VStack align="stretch" gap={3}>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Installment Amount
                      </Text>
                      <Text fontWeight="medium">
                        {formatCurrency(installment.installment_amount)}
                      </Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Paid Amount
                      </Text>
                      <Text
                        fontWeight="medium"
                        color={
                          parseFloat(installment.paid_amount) > 0 ? 'green.600' : 'text.secondary'
                        }
                      >
                        {formatCurrency(installment.paid_amount)}
                      </Text>
                    </Flex>
                    {parseFloat(installment.late_fee) > 0 && (
                      <Flex justify="space-between">
                        <Text color="text.secondary" fontSize="sm">
                          Late Fee
                        </Text>
                        <Text fontWeight="medium" color="orange.600">
                          {formatCurrency(installment.late_fee)}
                        </Text>
                      </Flex>
                    )}
                    {installment.paid_date && (
                      <Flex justify="space-between">
                        <Text color="text.secondary" fontSize="sm">
                          Paid On
                        </Text>
                        <Text fontWeight="medium">{formatDate(installment.paid_date)}</Text>
                      </Flex>
                    )}
                    {(installment.payment_status?.toLowerCase() === 'pending' ||
                      installment.payment_status?.toLowerCase() === 'overdue') && (
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={() => handlePayInstallment(installment.installment_id)}
                        loading={payMutation.isPending}
                        w="full"
                      >
                        Record Payment
                      </Button>
                    )}
                    {installment.payment_status?.toLowerCase() === 'paid' && (
                      <Button
                        size="sm"
                        colorScheme="orange"
                        variant="outline"
                        onClick={() => handleRollbackInstallment(installment.installment_id)}
                        loading={rollbackMutation.isPending}
                        w="full"
                      >
                        Rollback Payment
                      </Button>
                    )}
                  </VStack>
                ),
              }}
            />
          </>
        )}
      </Stack>
    </Box>
  );
};

export default RDInstallmentsList;

