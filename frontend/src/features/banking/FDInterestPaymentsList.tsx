import { useQuery } from '@tanstack/react-query';
import { Box, Stack, Text, Badge, VStack, Flex, HStack } from '@chakra-ui/react';
import { fixedDepositService } from '../../api/services/banking.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ResponsiveTable from '../../components/common/ResponsiveTable';

interface FDInterestPaymentsListProps {
  fdId: number;
  fdNumber: string;
  bankName: string;
}

interface InterestPayment {
  payment_id: number;
  fd_id: number;
  payment_date: string;
  interest_amount: string;
  cumulative_interest: string;
  payment_status: string;
  credited_date: string;
}

const FDInterestPaymentsList = ({
  fdId,
  fdNumber,
  bankName,
}: FDInterestPaymentsListProps) => {
  const { data: paymentsResponse, isLoading } = useQuery({
    queryKey: ['fixedDeposits', fdId, 'interestPayments'],
    queryFn: () => fixedDepositService.getInterestPayments(fdId),
  });

  const payments: InterestPayment[] = paymentsResponse?.data || [];

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(numValue);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'credited':
        return 'green';
      case 'reinvested':
        return 'purple';
      case 'pending':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const totalInterest = payments.reduce(
    (sum, payment) => sum + parseFloat(payment.interest_amount || '0'),
    0
  );
  const latestCumulativeInterest = payments.length > 0 
    ? parseFloat(payments[0].cumulative_interest || '0')
    : 0;

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
        <VStack align="start" gap={1}>
          <Text fontSize="md" fontWeight="semibold">
            Interest Payment History
          </Text>
          <Text fontSize="sm" color="text.secondary">
            {bankName} - {fdNumber}
          </Text>
        </VStack>

        {payments.length === 0 ? (
          <EmptyState
            title="No interest payments yet"
            description="Interest payments will appear here when credited"
          />
        ) : (
          <>
            <Box bg="bg.subtle" p={3} borderRadius="md">
              <HStack justify="space-around" wrap="wrap" gap={4}>
                <VStack align="center" gap={0}>
                  <Text fontSize="xs" color="text.secondary">
                    Total Interest Paid
                  </Text>
                  <Text fontSize="md" fontWeight="semibold" color="blue.600">
                    {formatCurrency(totalInterest)}
                  </Text>
                </VStack>
                <VStack align="center" gap={0}>
                  <Text fontSize="xs" color="text.secondary">
                    Cumulative Interest
                  </Text>
                  <Text fontSize="md" fontWeight="semibold" color="green.600">
                    {formatCurrency(latestCumulativeInterest)}
                  </Text>
                </VStack>
                <VStack align="center" gap={0}>
                  <Text fontSize="xs" color="text.secondary">
                    Total Payments
                  </Text>
                  <Text fontSize="md" fontWeight="semibold" color="purple.600">
                    {payments.length}
                  </Text>
                </VStack>
              </HStack>
            </Box>

            <ResponsiveTable
              data={payments}
              columns={[
                {
                  header: 'Payment Date',
                  cell: (payment) => formatDate(payment.payment_date),
                },
                {
                  header: 'Status',
                  cell: (payment) => (
                    <Badge colorScheme={getPaymentStatusColor(payment.payment_status)}>
                      {payment.payment_status?.toUpperCase() || 'N/A'}
                    </Badge>
                  ),
                },
                {
                  header: 'Interest Amount',
                  cell: (payment) => (
                    <Text fontWeight="medium" color="blue.600">
                      {formatCurrency(payment.interest_amount)}
                    </Text>
                  ),
                  textAlign: 'right',
                },
                {
                  header: 'Cumulative Interest',
                  cell: (payment) => formatCurrency(payment.cumulative_interest),
                  textAlign: 'right',
                },
                {
                  header: 'Credited Date',
                  cell: (payment) => formatDate(payment.credited_date),
                },
              ]}
              mobileConfig={{
                getKey: (payment) => payment.payment_id.toString(),
                summaryRender: (payment) => (
                  <Flex justify="space-between" align="center" w="full">
                    <VStack align="start" gap={1} flex={1}>
                      <HStack gap={2}>
                        <Badge colorScheme={getPaymentStatusColor(payment.payment_status)}>
                          {payment.payment_status?.toUpperCase() || 'N/A'}
                        </Badge>
                        <Text fontSize="sm" color="text.secondary">
                          {formatDate(payment.payment_date)}
                        </Text>
                      </HStack>
                      <Text fontSize="lg" fontWeight="semibold" color="blue.600">
                        {formatCurrency(payment.interest_amount)}
                      </Text>
                      <Text fontSize="sm" color="text.secondary">
                        Cumulative: {formatCurrency(payment.cumulative_interest)}
                      </Text>
                    </VStack>
                  </Flex>
                ),
                detailsRender: (payment) => (
                  <VStack align="stretch" gap={3}>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Interest Amount
                      </Text>
                      <Text fontWeight="medium" color="blue.600">
                        {formatCurrency(payment.interest_amount)}
                      </Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Cumulative Interest
                      </Text>
                      <Text fontWeight="medium">
                        {formatCurrency(payment.cumulative_interest)}
                      </Text>
                    </Flex>
                    {payment.credited_date && (
                      <Flex justify="space-between">
                        <Text color="text.secondary" fontSize="sm">
                          Credited On
                        </Text>
                        <Text fontWeight="medium">
                          {formatDate(payment.credited_date)}
                        </Text>
                      </Flex>
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

export default FDInterestPaymentsList;

