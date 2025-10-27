import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Heading,
  Stack,
  Button,
  Card,
  Text,
  Badge,
  HStack,
  Progress,
  Grid,
} from '@chakra-ui/react';
import { LuPlus, LuTarget } from 'react-icons/lu';
import { format } from 'date-fns';
import { portfolioGoalsService } from '../../api/services/portfolio-features.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import type { PortfolioGoal } from '../../types/domain.types';

const GoalsPage = () => {
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['portfolioGoals'],
    queryFn: () => portfolioGoalsService.getAll(),
  });

  const goals: PortfolioGoal[] = response?.data || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getGoalTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'retirement':
        return 'purple';
      case 'education':
        return 'blue';
      case 'emergency':
        return 'red';
      case 'custom':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'green';
    if (percentage >= 50) return 'blue';
    if (percentage >= 25) return 'orange';
    return 'red';
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={6}>
        <HStack justifyContent="space-between">
          <Heading size="lg">Portfolio Goals</Heading>
          <Button colorScheme="blue">
            <LuPlus /> Add Goal
          </Button>
        </HStack>

        {goals.length === 0 ? (
          <EmptyState
            title="No goals yet"
            description="Set your first financial goal to start tracking your progress"
            actionLabel="Add Goal"
            onAction={() => {}}
          />
        ) : (
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
            {goals.map((goal) => {
              const targetAmount = parseFloat(String(goal.target_amount));
              const currentAmount = parseFloat(String(goal.current_amount || '0'));
              const progressPercentage = parseFloat(String(goal.progress_percentage || '0'));
              
              return (
                <Card.Root key={goal.goal_id}>
                  <Card.Body>
                    <Stack gap={4}>
                      <HStack justifyContent="space-between" alignItems="flex-start">
                        <Stack gap={1}>
                          <HStack>
                            <LuTarget size={20} />
                            <Heading size="md">{goal.goal_name}</Heading>
                          </HStack>
                          <HStack gap={2}>
                            <Badge colorScheme={getGoalTypeBadgeColor(goal.goal_type)}>
                              {goal.goal_type}
                            </Badge>
                            <Badge colorScheme={getPriorityBadgeColor(goal.priority)}>
                              {goal.priority}
                            </Badge>
                            {goal.is_achieved && (
                              <Badge colorScheme="green">Achieved</Badge>
                            )}
                          </HStack>
                        </Stack>
                        <Text fontSize="sm" color="text.secondary">
                          {goal.target_date ? format(new Date(goal.target_date), 'MMM yyyy') : '-'}
                        </Text>
                      </HStack>

                      {goal.notes && (
                        <Text fontSize="sm" color="text.secondary">
                          {goal.notes}
                        </Text>
                      )}

                      <Stack gap={2}>
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" fontWeight="medium">
                            Progress
                          </Text>
                          <Text fontSize="sm" fontWeight="bold" color={`${getProgressColor(progressPercentage)}.500`}>
                            {progressPercentage.toFixed(1)}%
                          </Text>
                        </HStack>
                        <Progress.Root
                          value={progressPercentage}
                          colorScheme={getProgressColor(progressPercentage)}
                        >
                          <Progress.Track>
                            <Progress.Range />
                          </Progress.Track>
                        </Progress.Root>
                      </Stack>

                      <HStack justifyContent="space-between">
                        <Stack gap={0}>
                          <Text fontSize="xs" color="text.secondary">
                            Current
                          </Text>
                          <Text fontWeight="medium">
                            {formatCurrency(currentAmount)}
                          </Text>
                        </Stack>
                        <Stack gap={0} alignItems="flex-end">
                          <Text fontSize="xs" color="text.secondary">
                            Target
                          </Text>
                          <Text fontWeight="medium" color="green.600">
                            {formatCurrency(targetAmount)}
                          </Text>
                        </Stack>
                      </HStack>

                      {goal.remaining_amount && (
                        <Text fontSize="sm" color="text.secondary" textAlign="center">
                          {formatCurrency(parseFloat(String(goal.remaining_amount)))} remaining
                        </Text>
                      )}

                      <HStack>
                        <Button size="sm" variant="outline" flex={1}>
                          Edit
                        </Button>
                        <Button size="sm" colorScheme="blue" flex={1}>
                          Update Progress
                        </Button>
                      </HStack>
                    </Stack>
                  </Card.Body>
                </Card.Root>
              );
            })}
          </Grid>
        )}
      </Stack>
    </Container>
  );
};

export default GoalsPage;

