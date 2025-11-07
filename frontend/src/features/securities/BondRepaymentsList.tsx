import { useQuery } from '@tanstack/react-query';
import { Box, Stack, Text, Badge, VStack, Flex, HStack, Button, IconButton } from '@chakra-ui/react';
import { LuPlus, LuPencil, LuTrash2 } from 'react-icons/lu';
import { format } from 'date-fns';
import { bondRepaymentsService } from '../../api/services/bond-repayments.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import type { BondRepayment } from '../../types/domain.types';

interface BondRepaymentsListProps {
  securityId: number;
  bondSymbol?: string;
  bondName?: string;
  onAddRepayment?: () => void;
  onEditRepayment?: (repayment: BondRepayment) => void;
  onDeleteRepayment?: (repayment: BondRepayment) => void;
}

const BondRepaymentsList = ({
  securityId,
  bondSymbol,
  bondName,
  onAddRepayment,
  onEditRepayment,
  onDeleteRepayment,
}: BondRepaymentsListProps) => {
  const { data: repaymentsResponse, isLoading } = useQuery({
    queryKey: ['bond-repayments', 'security', securityId],
    queryFn: () => bondRepaymentsService.getBySecurity(securityId),
  });

  const repayments: BondRepayment[] = repaymentsResponse?.data || [];

  const formatCurrency = (value: string | null | undefined) => {
    if (!value) return '-';
    const num = parseFloat(value);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(num);
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return '-';
    try {
      return format(new Date(date), 'MMM dd, yyyy');
    } catch {
      return date;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'green';
      case 'overdue':
        return 'red';
      case 'missed':
        return 'orange';
      case 'scheduled':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'coupon' ? 'purple' : 'teal';
  };

  const totalScheduled = repayments
    .filter((r) => r.payment_status === 'scheduled')
    .reduce((sum, r) => sum + parseFloat(r.scheduled_amount || '0'), 0);
  const totalPaid = repayments
    .filter((r) => r.actual_amount)
    .reduce((sum, r) => sum + parseFloat(r.actual_amount || '0'), 0);
  const overdueCount = repayments.filter((r) => r.payment_status === 'overdue').length;

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
        <Flex justify="space-between" align="center">
          <VStack align="start" gap={1}>
            <Text fontSize="md" fontWeight="semibold">
              Bond Repayments
            </Text>
            {(bondSymbol || bondName) && (
              <Text fontSize="sm" color="text.secondary">
                {bondSymbol || bondName}
              </Text>
            )}
          </VStack>
          {onAddRepayment && (
            <Button size="sm" colorScheme="blue" onClick={onAddRepayment}>
              <LuPlus /> Add Repayment
            </Button>
          )}
        </Flex>

        {repayments.length === 0 ? (
          <EmptyState
            title="No repayments scheduled yet"
            description="Add repayments or generate a schedule to track bond payments"
            actionLabel={onAddRepayment ? 'Add Repayment' : undefined}
            onAction={onAddRepayment}
          />
        ) : (
          <>
            <Box bg="bg.subtle" p={3} borderRadius="md">
              <HStack justify="space-around" wrap="wrap" gap={4}>
                <VStack align="center" gap={0}>
                  <Text fontSize="xs" color="text.secondary">
                    Scheduled Amount
                  </Text>
                  <Text fontSize="md" fontWeight="semibold" color="blue.600">
                    {formatCurrency(totalScheduled.toString())}
                  </Text>
                </VStack>
                <VStack align="center" gap={0}>
                  <Text fontSize="xs" color="text.secondary">
                    Total Paid
                  </Text>
                  <Text fontSize="md" fontWeight="semibold" color="green.600">
                    {formatCurrency(totalPaid.toString())}
                  </Text>
                </VStack>
                <VStack align="center" gap={0}>
                  <Text fontSize="xs" color="text.secondary">
                    Overdue
                  </Text>
                  <Text fontSize="md" fontWeight="semibold" color={overdueCount > 0 ? 'red.600' : 'gray.600'}>
                    {overdueCount}
                  </Text>
                </VStack>
                <VStack align="center" gap={0}>
                  <Text fontSize="xs" color="text.secondary">
                    Total Repayments
                  </Text>
                  <Text fontSize="md" fontWeight="semibold" color="purple.600">
                    {repayments.length}
                  </Text>
                </VStack>
              </HStack>
            </Box>

            <ResponsiveTable
              data={repayments}
              columns={[
                {
                  header: 'Type',
                  cell: (repayment) => (
                    <Badge colorScheme={getTypeColor(repayment.repayment_type)}>
                      {repayment.repayment_type.toUpperCase()}
                    </Badge>
                  ),
                },
                {
                  header: 'Scheduled Date',
                  cell: (repayment) => (
                    <Text fontWeight="medium">{formatDate(repayment.scheduled_date)}</Text>
                  ),
                },
                {
                  header: 'Scheduled Amount',
                  cell: (repayment) => formatCurrency(repayment.scheduled_amount),
                  textAlign: 'right',
                },
                {
                  header: 'Actual Date',
                  cell: (repayment) => formatDate(repayment.actual_payment_date),
                },
                {
                  header: 'Actual Amount',
                  cell: (repayment) => formatCurrency(repayment.actual_amount),
                  textAlign: 'right',
                },
                {
                  header: 'Status',
                  cell: (repayment) => (
                    <Badge colorScheme={getStatusColor(repayment.payment_status)}>
                      {repayment.payment_status.toUpperCase()}
                    </Badge>
                  ),
                },
                ...(onEditRepayment || onDeleteRepayment
                  ? [
                      {
                        header: 'Actions',
                        cell: (repayment) => (
                          <HStack gap={2}>
                            {onEditRepayment && (
                              <IconButton
                                size="sm"
                                variant="ghost"
                                onClick={() => onEditRepayment(repayment)}
                                title="Edit"
                              >
                                <LuPencil />
                              </IconButton>
                            )}
                            {onDeleteRepayment && (
                              <IconButton
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => onDeleteRepayment(repayment)}
                                title="Delete"
                              >
                                <LuTrash2 />
                              </IconButton>
                            )}
                          </HStack>
                        ),
                      },
                    ]
                  : []),
              ]}
              mobileConfig={{
                getKey: (repayment) => repayment.repayment_id.toString(),
                summaryRender: (repayment) => (
                  <Flex justify="space-between" align="center" w="full">
                    <VStack align="start" gap={1} flex={1}>
                      <HStack gap={2} flexWrap="wrap">
                        <Badge colorScheme={getTypeColor(repayment.repayment_type)}>
                          {repayment.repayment_type.toUpperCase()}
                        </Badge>
                        <Badge colorScheme={getStatusColor(repayment.payment_status)}>
                          {repayment.payment_status.toUpperCase()}
                        </Badge>
                      </HStack>
                      <Text fontSize="lg" fontWeight="semibold">
                        {formatCurrency(repayment.scheduled_amount)}
                      </Text>
                      <Text fontSize="sm" color="text.secondary">
                        Scheduled: {formatDate(repayment.scheduled_date)}
                      </Text>
                      {repayment.actual_payment_date && (
                        <Text fontSize="sm" color="text.secondary">
                          Paid: {formatDate(repayment.actual_payment_date)}
                        </Text>
                      )}
                    </VStack>
                  </Flex>
                ),
                detailsRender: (repayment) => (
                  <VStack align="stretch" gap={3}>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Scheduled Date
                      </Text>
                      <Text fontWeight="medium">{formatDate(repayment.scheduled_date)}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Scheduled Amount
                      </Text>
                      <Text fontWeight="medium">{formatCurrency(repayment.scheduled_amount)}</Text>
                    </Flex>
                    {repayment.actual_payment_date && (
                      <Flex justify="space-between">
                        <Text color="text.secondary" fontSize="sm">
                          Actual Date
                        </Text>
                        <Text fontWeight="medium">{formatDate(repayment.actual_payment_date)}</Text>
                      </Flex>
                    )}
                    {repayment.actual_amount && (
                      <Flex justify="space-between">
                        <Text color="text.secondary" fontSize="sm">
                          Actual Amount
                        </Text>
                        <Text fontWeight="medium">{formatCurrency(repayment.actual_amount)}</Text>
                      </Flex>
                    )}
                    {repayment.coupon_period_start && repayment.coupon_period_end && (
                      <>
                        <Flex justify="space-between">
                          <Text color="text.secondary" fontSize="sm">
                            Period Start
                          </Text>
                          <Text fontWeight="medium">{formatDate(repayment.coupon_period_start)}</Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text color="text.secondary" fontSize="sm">
                            Period End
                          </Text>
                          <Text fontWeight="medium">{formatDate(repayment.coupon_period_end)}</Text>
                        </Flex>
                      </>
                    )}
                    {repayment.notes && (
                      <Flex justify="space-between">
                        <Text color="text.secondary" fontSize="sm">
                          Notes
                        </Text>
                        <Text fontWeight="medium">{repayment.notes}</Text>
                      </Flex>
                    )}
                    {(onEditRepayment || onDeleteRepayment) && (
                      <Flex pt={2} borderTopWidth="1px" mt={2} gap={2}>
                        {onEditRepayment && (
                          <Button
                            size="sm"
                            variant="outline"
                            flex={1}
                            onClick={() => onEditRepayment(repayment)}
                          >
                            Edit
                          </Button>
                        )}
                        {onDeleteRepayment && (
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="outline"
                            flex={1}
                            onClick={() => onDeleteRepayment(repayment)}
                          >
                            Delete
                          </Button>
                        )}
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

export default BondRepaymentsList;

