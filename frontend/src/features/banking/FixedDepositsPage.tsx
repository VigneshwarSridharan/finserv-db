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
import { format, differenceInDays } from 'date-fns';
import { fixedDepositsService } from '../../api/services/banking.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatCard from '../../components/common/StatCard';
import ResponsiveTable from '../../components/common/ResponsiveTable';

interface FixedDeposit {
  id: number;
  bank_name: string;
  account_number: string;
  fd_number: string;
  principal_amount: number;
  interest_rate: number;
  start_date: string;
  maturity_date: string;
  maturity_amount: number;
  status: string;
  tenure_months: number;
}

const FixedDepositsPage = () => {
  const { data: response, isLoading } = useQuery({
    queryKey: ['fixedDeposits'],
    queryFn: () => fixedDepositsService.getAll(),
  });

  const fds: FixedDeposit[] = response?.data || [];

  const totalPrincipal = fds.reduce((sum, fd) => sum + fd.principal_amount, 0);
  const totalMaturityAmount = fds.reduce((sum, fd) => sum + fd.maturity_amount, 0);
  const activeFDs = fds.filter((fd) => fd.status === 'ACTIVE').length;

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

  const getDaysToMaturity = (maturityDate: string) => {
    const days = differenceInDays(new Date(maturityDate), new Date());
    return days > 0 ? days : 0;
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={6}>
        <Heading size="lg">Fixed Deposits</Heading>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
          <StatCard
            label="Total Principal"
            value={formatCurrency(totalPrincipal)}
            colorScheme="blue"
          />
          <StatCard
            label="Maturity Amount"
            value={formatCurrency(totalMaturityAmount)}
            colorScheme="green"
          />
          <StatCard
            label="Active FDs"
            value={activeFDs.toString()}
            colorScheme="purple"
          />
          <StatCard
            label="Total FDs"
            value={fds.length.toString()}
            colorScheme="teal"
          />
        </Grid>

        {fds.length === 0 ? (
          <EmptyState
            title="No fixed deposits yet"
            description="Create your first fixed deposit to start earning interest"
          />
        ) : (
          <ResponsiveTable
            data={fds}
            columns={[
              {
                header: 'Bank',
                cell: (fd) => (
                  <Stack gap={0}>
                    <Text fontWeight="medium">{fd.bank_name}</Text>
                    <Text fontSize="sm" color="text.secondary">
                      {fd.account_number}
                    </Text>
                  </Stack>
                ),
              },
              {
                header: 'FD Number',
                cell: (fd) => <Text fontWeight="medium">{fd.fd_number}</Text>,
              },
              {
                header: 'Principal',
                cell: (fd) => formatCurrency(fd.principal_amount),
                textAlign: 'right',
              },
              {
                header: 'Interest Rate',
                cell: (fd) => `${fd.interest_rate}%`,
                textAlign: 'right',
              },
              {
                header: 'Tenure',
                cell: (fd) => `${fd.tenure_months} months`,
              },
              {
                header: 'Start Date',
                cell: (fd) => format(new Date(fd.start_date), 'dd MMM yyyy'),
              },
              {
                header: 'Maturity Date',
                cell: (fd) => format(new Date(fd.maturity_date), 'dd MMM yyyy'),
              },
              {
                header: 'Maturity Amount',
                cell: (fd) => (
                  <Text fontWeight="medium" color="green.600">
                    {formatCurrency(fd.maturity_amount)}
                  </Text>
                ),
                textAlign: 'right',
              },
              {
                header: 'Days to Maturity',
                cell: (fd) => {
                  const daysToMaturity = getDaysToMaturity(fd.maturity_date);
                  return fd.status === 'ACTIVE' && daysToMaturity > 0 ? (
                    <Badge colorScheme={daysToMaturity < 30 ? 'orange' : 'blue'}>
                      {daysToMaturity} days
                    </Badge>
                  ) : (
                    '-'
                  );
                },
              },
              {
                header: 'Status',
                cell: (fd) => (
                  <Badge colorScheme={getStatusColor(fd.status)}>{fd.status}</Badge>
                ),
              },
            ]}
            mobileConfig={{
              getKey: (fd) => fd.id,
              summaryRender: (fd) => {
                const daysToMaturity = getDaysToMaturity(fd.maturity_date);
                return (
                  <Flex justify="space-between" align="center" w="full">
                    <VStack align="start" gap={1} flex={1}>
                      <Text fontWeight="bold" fontSize="md">
                        {fd.bank_name}
                      </Text>
                      <Text fontSize="sm" color="text.secondary">
                        {fd.fd_number}
                      </Text>
                      <HStack gap={2}>
                        <Text fontSize="lg" fontWeight="semibold" color="green.600">
                          {formatCurrency(fd.maturity_amount)}
                        </Text>
                        <Badge colorScheme={getStatusColor(fd.status)}>{fd.status}</Badge>
                      </HStack>
                      {fd.status === 'ACTIVE' && daysToMaturity > 0 && (
                        <Badge colorScheme={daysToMaturity < 30 ? 'orange' : 'blue'}>
                          {daysToMaturity} days to maturity
                        </Badge>
                      )}
                    </VStack>
                    <LuChevronDown />
                  </Flex>
                );
              },
              detailsRender: (fd) => (
                <VStack align="stretch" gap={3}>
                  <Flex justify="space-between">
                    <Text color="text.secondary" fontSize="sm">
                      Account Number
                    </Text>
                    <Text fontWeight="medium">{fd.account_number}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="text.secondary" fontSize="sm">
                      Principal Amount
                    </Text>
                    <Text fontWeight="medium">{formatCurrency(fd.principal_amount)}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="text.secondary" fontSize="sm">
                      Interest Rate
                    </Text>
                    <Text fontWeight="medium">{fd.interest_rate}%</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="text.secondary" fontSize="sm">
                      Tenure
                    </Text>
                    <Text fontWeight="medium">{fd.tenure_months} months</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="text.secondary" fontSize="sm">
                      Start Date
                    </Text>
                    <Text fontWeight="medium">
                      {format(new Date(fd.start_date), 'dd MMM yyyy')}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="text.secondary" fontSize="sm">
                      Maturity Date
                    </Text>
                    <Text fontWeight="medium">
                      {format(new Date(fd.maturity_date), 'dd MMM yyyy')}
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

export default FixedDepositsPage;

