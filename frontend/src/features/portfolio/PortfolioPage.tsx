import { Container, Heading, Stack, Grid, Card, Text, Button } from '@chakra-ui/react';
import {
  LuTarget,
  LuBell,
  LuEye,
  LuTrendingUp,
  LuFileText,
  LuArrowRight,
} from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';

interface FeatureCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

const PortfolioPage = () => {
  const navigate = useNavigate();

  const features: FeatureCard[] = [
    {
      title: 'Goals',
      description: 'Set and track your financial goals with progress monitoring',
      icon: <LuTarget size={32} />,
      path: '/portfolio/goals',
      color: 'purple',
    },
    {
      title: 'Alerts',
      description: 'Get notified about price targets, stop losses, and maturity dates',
      icon: <LuBell size={32} />,
      path: '/portfolio/alerts',
      color: 'red',
    },
    {
      title: 'Watchlist',
      description: 'Monitor securities you\'re interested in buying',
      icon: <LuEye size={32} />,
      path: '/portfolio/watchlist',
      color: 'blue',
    },
    {
      title: 'Performance',
      description: 'Analyze your portfolio performance over time',
      icon: <LuTrendingUp size={32} />,
      path: '/portfolio/performance',
      color: 'green',
    },
    {
      title: 'Reports',
      description: 'Generate detailed portfolio reports for taxes and analysis',
      icon: <LuFileText size={32} />,
      path: '/portfolio/reports',
      color: 'orange',
    },
  ];

  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={6}>
        <Heading size="lg">Portfolio Features</Heading>
        <Text color="text.secondary">
          Advanced portfolio management tools to help you track, analyze, and optimize your investments.
        </Text>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
          {features.map((feature) => (
            <Card.Root
              key={feature.path}
              p={6}
              _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
              transition="all 0.2s"
            >
              <Card.Body>
                <Stack gap={4}>
                  <div style={{ color: `var(--chakra-colors-${feature.color}-500)` }}>
                    {feature.icon}
                  </div>
                  <Stack gap={2}>
                    <Heading size="md">{feature.title}</Heading>
                    <Text color="text.secondary" fontSize="sm">
                      {feature.description}
                    </Text>
                  </Stack>
                  <Button
                    colorScheme={feature.color}
                    variant="outline"
                    onClick={() => navigate(feature.path)}
                    w="full"
                  >
                    Open <LuArrowRight />
                  </Button>
                </Stack>
              </Card.Body>
            </Card.Root>
          ))}
        </Grid>
      </Stack>
    </Container>
  );
};

export default PortfolioPage;
