import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Button, HStack, Stack, Text, Badge, VStack, Flex } from '@chakra-ui/react';
import { LuPlus } from 'react-icons/lu';
import { holdingsService } from '../../api/services/securities.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import AddTransactionDialog from './AddTransactionDialog';

interface HoldingTransactionsListProps {
  holdingId: number;
  accountId: number;
  securityId: number;
  securityName: string;
  symbol: string;
}

const HoldingTransactionsList = ({
  holdingId,
  accountId,
  securityId,
  securityName,
  symbol,
}: HoldingTransactionsListProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: transactionsResponse, isLoading } = useQuery({
    queryKey: ['holdings', holdingId, 'transactions'],
    queryFn: () => holdingsService.getTransactions(holdingId),
  });

  const transactions = transactionsResponse?.data || [];

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

  if (isLoading) {
    return (
      <Box p={4}>
        <LoadingSpinner />
      </Box>
    );
  }

  return (
    <Box p={4}  borderRadius="md">
      <Stack gap={4}>
        <HStack justify="space-between" align="center">
          <Text fontSize="md" fontWeight="semibold" >
            Transaction History
          </Text>
          <Button
            size="sm"
            colorScheme="blue"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <LuPlus /> Add Transaction
          </Button>
        </HStack>

        {transactions.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="Add your first transaction to get started"
          />
        ) : (
          <ResponsiveTable
            data={transactions}
            columns={[
              {
                header: 'Date',
                cell: (txn) => formatDate(txn.transaction_date),
              },
              {
                header: 'Type',
                cell: (txn) => (
                  <Badge
                    colorScheme={
                      txn.transaction_type === 'buy' ? 'green' :
                      txn.transaction_type === 'sell' ? 'red' :
                      'blue'
                    }
                  >
                    {txn.transaction_type.toUpperCase()}
                  </Badge>
                ),
              },
              {
                header: 'Quantity',
                cell: (txn) => parseFloat(txn.quantity).toFixed(2),
                textAlign: 'right',
              },
              {
                header: 'Price',
                cell: (txn) => formatCurrency(txn.price),
                textAlign: 'right',
              },
              {
                header: 'Total Amount',
                cell: (txn) => formatCurrency(txn.total_amount),
                textAlign: 'right',
              },
              {
                header: 'Charges',
                cell: (txn) => {
                  const totalCharges =
                    parseFloat(txn.brokerage || '0') +
                    parseFloat(txn.taxes || '0') +
                    parseFloat(txn.other_charges || '0');
                  return formatCurrency(totalCharges);
                },
                textAlign: 'right',
              },
              {
                header: 'Net Amount',
                cell: (txn) => formatCurrency(txn.net_amount),
                textAlign: 'right',
              },
            ]}
            mobileConfig={{
              getKey: (txn) => txn.transaction_id.toString(),
              summaryRender: (txn) => (
                <Flex justify="space-between" align="center" w="full">
                  <VStack align="start" gap={1} flex={1}>
                    <HStack gap={2}>
                      <Badge
                        colorScheme={
                          txn.transaction_type === 'buy' ? 'green' :
                          txn.transaction_type === 'sell' ? 'red' :
                          'blue'
                        }
                      >
                        {txn.transaction_type.toUpperCase()}
                      </Badge>
                      <Text fontSize="sm" color="text.secondary">
                        {formatDate(txn.transaction_date)}
                      </Text>
                    </HStack>
                    <Text fontSize="lg" fontWeight="semibold">
                      {formatCurrency(txn.net_amount)}
                    </Text>
                    <Text fontSize="sm" color="text.secondary">
                      {parseFloat(txn.quantity).toFixed(2)} @ {formatCurrency(txn.price)}
                    </Text>
                  </VStack>
                </Flex>
              ),
              detailsRender: (txn) => {
                const totalCharges =
                  parseFloat(txn.brokerage || '0') +
                  parseFloat(txn.taxes || '0') +
                  parseFloat(txn.other_charges || '0');

                return (
                  <VStack align="stretch" gap={3}>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Total Amount
                      </Text>
                      <Text fontWeight="medium">{formatCurrency(txn.total_amount)}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Total Charges
                      </Text>
                      <Text fontWeight="medium">{formatCurrency(totalCharges)}</Text>
                    </Flex>
                    {txn.notes && (
                      <Box>
                        <Text color="text.secondary" fontSize="sm" mb={1}>
                          Notes
                        </Text>
                        <Text fontSize="sm">{txn.notes}</Text>
                      </Box>
                    )}
                  </VStack>
                );
              },
            }}
          />
        )}
      </Stack>

      <AddTransactionDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        holdingId={holdingId}
        accountId={accountId}
        securityId={securityId}
        securityName={`${securityName} (${symbol})`}
      />
    </Box>
  );
};

export default HoldingTransactionsList;


