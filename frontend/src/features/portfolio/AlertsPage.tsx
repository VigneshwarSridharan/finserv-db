import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Heading,
  Stack,
  Button,
  Table,
  Badge,
  HStack,
  Text,
} from '@chakra-ui/react';
import { LuPlus, LuBell } from 'react-icons/lu';
import { format } from 'date-fns';
import { portfolioAlertsService } from '../../api/services/portfolio-features.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import type { PortfolioAlert } from '../../types/domain.types';

const AlertsPage = () => {
  const { data: response, isLoading } = useQuery({
    queryKey: ['portfolioAlerts'],
    queryFn: () => portfolioAlertsService.getAll(),
  });

  const alerts: PortfolioAlert[] = response?.data || [];
  const activeAlerts = alerts.filter((alert) => alert.is_active);
  const triggeredAlerts = alerts.filter((alert) => alert.is_triggered);

  const formatValue = (value: string | number | undefined, type: string) => {
    if (!value) return '-';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (type.toLowerCase().includes('price') || type.toLowerCase().includes('loss') || type.toLowerCase().includes('target')) {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      }).format(numValue);
    }
    return numValue.toString();
  };

  const getAlertTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'price_target':
        return 'green';
      case 'stop_loss':
        return 'red';
      case 'maturity_date':
        return 'blue';
      case 'rebalance':
        return 'orange';
      default:
        return 'gray';
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={6}>
        <HStack justifyContent="space-between">
          <Heading size="lg">Portfolio Alerts</Heading>
          <Button colorScheme="blue">
            <LuPlus /> Add Alert
          </Button>
        </HStack>

        <HStack gap={4}>
          <Badge colorScheme="blue" fontSize="md" p={2}>
            <LuBell /> Active: {activeAlerts.length}
          </Badge>
          <Badge colorScheme="red" fontSize="md" p={2}>
            Triggered: {triggeredAlerts.length}
          </Badge>
        </HStack>

        {alerts.length === 0 ? (
          <EmptyState
            title="No alerts yet"
            description="Create alerts to stay notified about important portfolio events"
            actionLabel="Add Alert"
            onAction={() => {}}
          />
        ) : (
          <Table.Root variant="outline">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Alert Name</Table.ColumnHeader>
                <Table.ColumnHeader>Type</Table.ColumnHeader>
                <Table.ColumnHeader>Condition</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">Threshold</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">Current Value</Table.ColumnHeader>
                <Table.ColumnHeader>Created</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader>Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {alerts.map((alert) => (
                <Table.Row key={alert.alert_id} bg={alert.is_triggered ? 'red.50' : undefined}>
                  <Table.Cell fontWeight="medium">{alert.alert_name}</Table.Cell>
                  <Table.Cell>
                    <Badge colorScheme={getAlertTypeBadgeColor(alert.alert_type)}>
                      {alert.alert_type.replace('_', ' ')}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge>{alert.condition_type}</Badge>
                  </Table.Cell>
                  <Table.Cell textAlign="right">
                    {formatValue(alert.threshold_value, alert.alert_type)}
                  </Table.Cell>
                  <Table.Cell textAlign="right">
                    {formatValue(alert.current_value, alert.alert_type)}
                  </Table.Cell>
                  <Table.Cell>
                    {alert.created_at ? format(new Date(alert.created_at), 'dd MMM yyyy') : '-'}
                  </Table.Cell>
                  <Table.Cell>
                    <Stack gap={1}>
                      {alert.is_triggered && (
                        <Badge colorScheme="red">Triggered</Badge>
                      )}
                      {alert.is_active ? (
                        <Badge colorScheme="green">Active</Badge>
                      ) : (
                        <Badge colorScheme="gray">Inactive</Badge>
                      )}
                    </Stack>
                  </Table.Cell>
                  <Table.Cell>
                    <Button size="sm" variant="ghost">
                      Edit
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Stack>
    </Container>
  );
};

export default AlertsPage;

