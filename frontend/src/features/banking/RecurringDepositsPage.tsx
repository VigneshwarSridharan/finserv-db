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
import { recurringDepositService } from '../../api/services/banking.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatCard from '../../components/common/StatCard';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import type { RecurringDeposit } from '../../types/domain.types';

const RecurringDepositsPage = () => {
  const { data: response, isLoading } = useQuery({
    queryKey: ['recurringDeposits'],
    queryFn: () => recurringDepositService.getAll(),
  });

  const rds: RecurringDeposit[] = response?.data || [];

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

  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={6}>
        <Heading size="lg">Recurring Deposits</Heading>

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
                  <Badge colorScheme={getStatusColor(rd.status)}>{rd.status}</Badge>
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
          />
        )}
      </Stack>
    </Container>
  );
};

export default RecurringDepositsPage;

