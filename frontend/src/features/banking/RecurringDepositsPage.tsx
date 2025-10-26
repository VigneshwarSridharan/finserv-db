import { useQuery } from '@tanstack/react-query';
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
} from '@chakra-ui/react';
import { LuChevronDown } from 'react-icons/lu';
import { format } from 'date-fns';
import { recurringDepositsService } from '../../api/services/banking.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatCard from '../../components/common/StatCard';
import ResponsiveTable from '../../components/common/ResponsiveTable';

interface RecurringDeposit {
  id: number;
  bank_name: string;
  account_number: string;
  rd_number: string;
  installment_amount: number;
  interest_rate: number;
  start_date: string;
  maturity_date: string;
  maturity_amount: number;
  status: string;
  tenure_months: number;
  frequency: string;
  total_installments: number;
  paid_installments: number;
}

const RecurringDepositsPage = () => {
  const { data: response, isLoading } = useQuery({
    queryKey: ['recurringDeposits'],
    queryFn: () => recurringDepositsService.getAll(),
  });

  const rds: RecurringDeposit[] = response?.data || [];

  const totalInvestment = rds.reduce(
    (sum, rd) => sum + rd.installment_amount * rd.paid_installments,
    0
  );
  const totalMaturityAmount = rds.reduce((sum, rd) => sum + rd.maturity_amount, 0);
  const activeRDs = rds.filter((rd) => rd.status === 'ACTIVE').length;

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

  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={6}>
        <Heading size="lg">Recurring Deposits</Heading>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
          <StatCard
            label="Total Investment"
            value={formatCurrency(totalInvestment)}
            colorScheme="blue"
          />
          <StatCard
            label="Maturity Amount"
            value={formatCurrency(totalMaturityAmount)}
            colorScheme="green"
          />
          <StatCard
            label="Active RDs"
            value={activeRDs.toString()}
            colorScheme="purple"
          />
          <StatCard
            label="Total RDs"
            value={rds.length.toString()}
            colorScheme="teal"
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
                cell: (rd) => formatCurrency(rd.installment_amount),
                textAlign: 'right',
              },
              {
                header: 'Interest Rate',
                cell: (rd) => `${rd.interest_rate}%`,
                textAlign: 'right',
              },
              {
                header: 'Frequency',
                cell: (rd) => <Badge>{rd.frequency}</Badge>,
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
                  const progress = (rd.paid_installments / rd.total_installments) * 100;
                  return (
                    <HStack gap={2}>
                      <Text fontSize="sm">
                        {rd.paid_installments}/{rd.total_installments}
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
                    {formatCurrency(rd.maturity_amount)}
                  </Text>
                ),
                textAlign: 'right',
              },
              {
                header: 'Status',
                cell: (rd) => (
                  <Badge colorScheme={getStatusColor(rd.status)}>{rd.status}</Badge>
                ),
              },
            ]}
            mobileConfig={{
              getKey: (rd) => rd.id,
              summaryRender: (rd) => {
                const progress = (rd.paid_installments / rd.total_installments) * 100;
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
                          {formatCurrency(rd.maturity_amount)}
                        </Text>
                        <Badge colorScheme={getStatusColor(rd.status)}>{rd.status}</Badge>
                      </HStack>
                      <Badge
                        colorScheme={
                          progress === 100 ? 'green' : progress > 50 ? 'blue' : 'orange'
                        }
                      >
                        {rd.paid_installments}/{rd.total_installments} ({progress.toFixed(0)}
                        %)
                      </Badge>
                    </VStack>
                    <LuChevronDown />
                  </Flex>
                );
              },
              detailsRender: (rd) => (
                <VStack align="stretch" gap={3}>
                  <Flex justify="space-between">
                    <Text color="text.secondary" fontSize="sm">
                      Account Number
                    </Text>
                    <Text fontWeight="medium">{rd.account_number}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="text.secondary" fontSize="sm">
                      Installment Amount
                    </Text>
                    <Text fontWeight="medium">{formatCurrency(rd.installment_amount)}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="text.secondary" fontSize="sm">
                      Frequency
                    </Text>
                    <Badge>{rd.frequency}</Badge>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="text.secondary" fontSize="sm">
                      Interest Rate
                    </Text>
                    <Text fontWeight="medium">{rd.interest_rate}%</Text>
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
              ),
            }}
          />
        )}
      </Stack>
    </Container>
  );
};

export default RecurringDepositsPage;

