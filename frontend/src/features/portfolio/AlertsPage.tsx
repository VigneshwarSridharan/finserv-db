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

interface PortfolioAlert {
  id: number;
  alert_type: string;
  alert_name: string;
  condition_type: string;
  threshold_value: number;
  current_value?: number;
  is_triggered: boolean;
  is_active: boolean;
  created_at: string;
  triggered_at?: string;
}

const AlertsPage = () => {
  const { data: response, isLoading } = useQuery({
    queryKey: ['portfolioAlerts'],
    queryFn: () => portfolioAlertsService.getAll(),
  });

  const alerts: PortfolioAlert[] = response?.data || [];
  const activeAlerts = alerts.filter((alert) => alert.is_active);
  const triggeredAlerts = alerts.filter((alert) => alert.is_triggered);

  const formatValue = (value: number, type: string) => {
    if (type === 'PRICE_TARGET' || type === 'STOP_LOSS') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      }).format(value);
    }
    return value.toString();
  };

  const getAlertTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'PRICE_TARGET':
        return 'green';
      case 'STOP_LOSS':
        return 'red';
      case 'MATURITY_DATE':
        return 'blue';
      case 'REBALANCE':
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
            action={
              <Button colorScheme="blue">
                <LuPlus /> Add Alert
              </Button>
            }
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
                <Table.Row key={alert.id} bg={alert.is_triggered ? 'red.50' : undefined}>
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
                    {alert.current_value
                      ? formatValue(alert.current_value, alert.alert_type)
                      : '-'}
                  </Table.Cell>
                  <Table.Cell>
                    {format(new Date(alert.created_at), 'dd MMM yyyy')}
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

