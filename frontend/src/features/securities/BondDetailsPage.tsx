import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Heading,
  Stack,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Grid,
  HStack,
  Badge,
  Text,
  VStack,
  Flex,
  Stat,
  StatLabel,
  StatValue,
} from '@chakra-ui/react';
import { LuPencil, LuTrash2, LuArrowLeft, LuCalendar } from 'react-icons/lu';
import { format } from 'date-fns';
import { bondsService } from '../../api/services/bonds.service';
import { bondRepaymentsService } from '../../api/services/bond-repayments.service';
import { toaster } from '../../components/ui/toaster';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useState } from 'react';

const BondDetailsPage = () => {
  const navigate = useNavigate();
  const { securityId } = useParams<{ securityId: string }>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['bond', securityId],
    queryFn: () => bondsService.getById(securityId!),
    enabled: !!securityId,
  });

  const { data: repaymentsResponse, isLoading: isLoadingRepayments } = useQuery({
    queryKey: ['bond-repayments', 'security', securityId],
    queryFn: () => bondRepaymentsService.getBySecurity(securityId!),
    enabled: !!securityId,
  });

  const deleteMutation = useMutation({
    mutationFn: () => bondsService.delete(securityId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bonds'] });
      toaster.create({
        title: 'Bond deleted successfully',
        type: 'success',
      });
      navigate('/securities/bonds');
    },
    onError: () => {
      toaster.create({
        title: 'Failed to delete bond',
        type: 'error',
      });
    },
  });

  const bond = response?.data;

  const formatCurrency = (value: string | null | undefined) => {
    if (!value) return '-';
    const num = parseFloat(value);
    return `${num.toFixed(2)}%`;
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return '-';
    try {
      return format(new Date(date), 'MMM dd, yyyy');
    } catch {
      return date;
    }
  };

  const calculateDaysToMaturity = (maturityDate: string) => {
    try {
      const maturity = new Date(maturityDate);
      const today = new Date();
      const diffTime = maturity.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };

  const repayments = repaymentsResponse?.data || [];
  const upcomingRepayments = repayments.filter((r) => 
    r.payment_status === 'scheduled' && new Date(r.scheduled_date) >= new Date()
  ).slice(0, 5);
  const overdueRepayments = repayments.filter((r) => r.payment_status === 'overdue');

  if (isLoading || isLoadingRepayments) return <LoadingSpinner />;

  if (!bond) {
    return (
      <Container maxW="4xl" py={8}>
        <Stack gap={4}>
          <Button variant="ghost" onClick={() => navigate('/securities/bonds')}>
            <LuArrowLeft /> Back to Bonds
          </Button>
          <Text>Bond not found</Text>
        </Stack>
      </Container>
    );
  }

  const daysToMaturity = calculateDaysToMaturity(bond.maturity_date);

  return (
    <Container maxW="4xl" py={8}>
      <Stack gap={6}>
        <HStack justifyContent="space-between">
          <Button variant="ghost" onClick={() => navigate('/securities/bonds')}>
            <LuArrowLeft /> Back to Bonds
          </Button>
          <HStack gap={2}>
            <Button
              colorScheme="purple"
              variant="outline"
              onClick={() => navigate(`/securities/bond-repayments?security_id=${bond.security_id}`)}
            >
              <LuCalendar /> Repayments
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => navigate(`/securities/bonds/${bond.security_id}/edit`)}
            >
              <LuPencil /> Edit
            </Button>
            <Button
              colorScheme="red"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <LuTrash2 /> Delete
            </Button>
          </HStack>
        </HStack>

        <Heading size="lg">
          {bond.security?.symbol || bond.security?.name || 'Bond Details'}
        </Heading>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
          <Card>
            <CardHeader>
              <CardTitle>Bond Information</CardTitle>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" gap={4}>
                <Stat>
                  <StatLabel>Issuer</StatLabel>
                  <StatValue fontSize="lg">{bond.issuer}</StatValue>
                </Stat>

                <Stat>
                  <StatLabel>Coupon Rate</StatLabel>
                  <StatValue fontSize="lg">
                    {formatCurrency(bond.coupon_rate)}
                  </StatValue>
                </Stat>

                <Stat>
                  <StatLabel>Maturity Date</StatLabel>
                  <StatValue fontSize="lg">
                    {formatDate(bond.maturity_date)}
                  </StatValue>
                </Stat>

                {daysToMaturity !== null && (
                  <Stat>
                    <StatLabel>Days to Maturity</StatLabel>
                    <StatValue fontSize="lg">
                      <Badge
                        colorScheme={
                          daysToMaturity < 365
                            ? 'orange'
                            : daysToMaturity < 1825
                            ? 'blue'
                            : 'green'
                        }
                      >
                        {daysToMaturity} days
                      </Badge>
                    </StatValue>
                  </Stat>
                )}

                {bond.bond_type && (
                  <Stat>
                    <StatLabel>Bond Type</StatLabel>
                    <StatValue>
                      <Badge colorScheme="purple">
                        {bond.bond_type.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </StatValue>
                  </Stat>
                )}

                {bond.credit_rating && (
                  <Stat>
                    <StatLabel>Credit Rating</StatLabel>
                    <StatValue>
                      <Badge
                        colorScheme={
                          ['AAA', 'AA'].includes(bond.credit_rating)
                            ? 'green'
                            : ['A', 'BBB'].includes(bond.credit_rating)
                            ? 'blue'
                            : 'orange'
                        }
                      >
                        {bond.credit_rating}
                      </Badge>
                    </StatValue>
                  </Stat>
                )}
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" gap={4}>
                {bond.yield_to_maturity && (
                  <Stat>
                    <StatLabel>Yield to Maturity</StatLabel>
                    <StatValue fontSize="lg">
                      {formatCurrency(bond.yield_to_maturity)}
                    </StatValue>
                  </Stat>
                )}

                {bond.coupon_payment_frequency && (
                  <Stat>
                    <StatLabel>Coupon Payment Frequency</StatLabel>
                    <StatValue>
                      <Badge>
                        {bond.coupon_payment_frequency
                          .replace('_', ' ')
                          .toUpperCase()}
                      </Badge>
                    </StatValue>
                  </Stat>
                )}

                {bond.issue_date && (
                  <Stat>
                    <StatLabel>Issue Date</StatLabel>
                    <StatValue>{formatDate(bond.issue_date)}</StatValue>
                  </Stat>
                )}

                {bond.next_coupon_date && (
                  <Stat>
                    <StatLabel>Next Coupon Date</StatLabel>
                    <StatValue>{formatDate(bond.next_coupon_date)}</StatValue>
                  </Stat>
                )}

                {bond.day_count_convention && (
                  <Stat>
                    <StatLabel>Day Count Convention</StatLabel>
                    <StatValue>
                      <Badge>{bond.day_count_convention}</Badge>
                    </StatValue>
                  </Stat>
                )}
              </VStack>
            </CardBody>
          </Card>

          {bond.security && (
            <Card>
              <CardHeader>
                <CardTitle>Security Information</CardTitle>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" gap={4}>
                  <Stat>
                    <StatLabel>Symbol</StatLabel>
                    <StatValue fontSize="lg">{bond.security.symbol}</StatValue>
                  </Stat>

                  <Stat>
                    <StatLabel>Name</StatLabel>
                    <StatValue>{bond.security.name || bond.security.security_name}</StatValue>
                  </Stat>

                  {bond.security.exchange && (
                    <Stat>
                      <StatLabel>Exchange</StatLabel>
                      <StatValue>{bond.security.exchange}</StatValue>
                    </Stat>
                  )}

                  {bond.security.isin && (
                    <Stat>
                      <StatLabel>ISIN</StatLabel>
                      <StatValue>{bond.security.isin}</StatValue>
                    </Stat>
                  )}
                </VStack>
              </CardBody>
            </Card>
          )}

          <Card gridColumn={{ base: '1', md: '1 / -1' }}>
            <CardHeader>
              <HStack justifyContent="space-between">
                <CardTitle>Repayments</CardTitle>
                <Button
                  size="sm"
                  colorScheme="purple"
                  variant="outline"
                  onClick={() => navigate(`/securities/bond-repayments?security_id=${bond.security_id}`)}
                >
                  <LuCalendar /> View All Repayments
                </Button>
              </HStack>
            </CardHeader>
            <CardBody>
              {repayments.length === 0 ? (
                <Text color="text.secondary">No repayments scheduled yet.</Text>
              ) : (
                <VStack align="stretch" gap={4}>
                  {overdueRepayments.length > 0 && (
                    <Stack gap={2}>
                      <Text fontWeight="bold" color="red.500">
                        Overdue Payments ({overdueRepayments.length})
                      </Text>
                      {overdueRepayments.slice(0, 3).map((repayment) => (
                        <Flex key={repayment.repayment_id} justify="space-between" p={2} bg="red.50" borderRadius="md">
                          <VStack align="start" gap={0}>
                            <Text fontWeight="medium">
                              {repayment.repayment_type.toUpperCase()} - {formatDate(repayment.scheduled_date)}
                            </Text>
                            <Text fontSize="sm" color="text.secondary">
                              ₹{parseFloat(repayment.scheduled_amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </Text>
                          </VStack>
                        </Flex>
                      ))}
                    </Stack>
                  )}
                  
                  {upcomingRepayments.length > 0 && (
                    <Stack gap={2}>
                      <Text fontWeight="bold">Upcoming Payments</Text>
                      {upcomingRepayments.map((repayment) => (
                        <Flex key={repayment.repayment_id} justify="space-between" p={2} bg="bg.surface" borderRadius="md" borderWidth="1px">
                          <VStack align="start" gap={0}>
                            <Text fontWeight="medium">
                              {repayment.repayment_type.toUpperCase()} - {formatDate(repayment.scheduled_date)}
                            </Text>
                            <Text fontSize="sm" color="text.secondary">
                              ₹{parseFloat(repayment.scheduled_amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </Text>
                          </VStack>
                          <Badge colorScheme="blue">{repayment.payment_status.toUpperCase()}</Badge>
                        </Flex>
                      ))}
                    </Stack>
                  )}

                  <Stat>
                    <StatLabel>Total Scheduled</StatLabel>
                    <StatValue>
                      ₹{repayments
                        .filter((r) => r.payment_status === 'scheduled')
                        .reduce((sum, r) => sum + parseFloat(r.scheduled_amount || '0'), 0)
                        .toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </StatValue>
                  </Stat>
                  <Stat>
                    <StatLabel>Total Paid</StatLabel>
                    <StatValue>
                      ₹{repayments
                        .filter((r) => r.actual_amount)
                        .reduce((sum, r) => sum + parseFloat(r.actual_amount || '0'), 0)
                        .toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </StatValue>
                  </Stat>
                </VStack>
              )}
            </CardBody>
          </Card>
        </Grid>

        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => deleteMutation.mutate()}
          title="Delete Bond"
          message={`Are you sure you want to delete bond details for ${bond.security?.symbol || bond.security?.name || 'this bond'}?`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          confirmColorScheme="red"
        />
      </Stack>
    </Container>
  );
};

export default BondDetailsPage;

