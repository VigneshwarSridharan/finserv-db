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

interface PortfolioGoal {
  id: number;
  goal_name: string;
  goal_type: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  description?: string;
  progress_percentage: number;
}

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
    switch (type) {
      case 'RETIREMENT':
        return 'purple';
      case 'EDUCATION':
        return 'blue';
      case 'EMERGENCY':
        return 'red';
      case 'CUSTOM':
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
            action={
              <Button colorScheme="blue">
                <LuPlus /> Add Goal
              </Button>
            }
          />
        ) : (
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
            {goals.map((goal) => (
              <Card.Root key={goal.id}>
                <Card.Body>
                  <Stack gap={4}>
                    <HStack justifyContent="space-between" alignItems="flex-start">
                      <Stack gap={1}>
                        <HStack>
                          <LuTarget size={20} />
                          <Heading size="md">{goal.goal_name}</Heading>
                        </HStack>
                        <Badge colorScheme={getGoalTypeBadgeColor(goal.goal_type)}>
                          {goal.goal_type}
                        </Badge>
                      </Stack>
                      <Text fontSize="sm" color="text.secondary">
                        {format(new Date(goal.target_date), 'MMM yyyy')}
                      </Text>
                    </HStack>

                    {goal.description && (
                      <Text fontSize="sm" color="text.secondary">
                        {goal.description}
                      </Text>
                    )}

                    <Stack gap={2}>
                      <HStack justifyContent="space-between">
                        <Text fontSize="sm" fontWeight="medium">
                          Progress
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color={`${getProgressColor(goal.progress_percentage)}.500`}>
                          {goal.progress_percentage.toFixed(1)}%
                        </Text>
                      </HStack>
                      <Progress.Root
                        value={goal.progress_percentage}
                        colorScheme={getProgressColor(goal.progress_percentage)}
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
                          {formatCurrency(goal.current_amount)}
                        </Text>
                      </Stack>
                      <Stack gap={0} alignItems="flex-end">
                        <Text fontSize="xs" color="text.secondary">
                          Target
                        </Text>
                        <Text fontWeight="medium" color="green.600">
                          {formatCurrency(goal.target_amount)}
                        </Text>
                      </Stack>
                    </HStack>

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
            ))}
          </Grid>
        )}
      </Stack>
    </Container>
  );
};

export default GoalsPage;

