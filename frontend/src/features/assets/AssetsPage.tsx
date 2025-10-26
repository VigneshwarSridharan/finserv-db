import { Container, Heading, Stack, Grid, Card, Text, Button } from '@chakra-ui/react';
import {
  LuHouse,
  LuCoins,
  LuFolderTree,
  LuTrendingUp,
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

const AssetsPage = () => {
  const navigate = useNavigate();

  const features: FeatureCard[] = [
    {
      title: 'All Assets',
      description: 'View and manage all your assets in one place',
      icon: <LuTrendingUp size={32} />,
      path: '/assets/list',
      color: 'blue',
    },
    {
      title: 'Categories',
      description: 'Organize assets by creating custom categories',
      icon: <LuFolderTree size={32} />,
      path: '/assets/categories',
      color: 'purple',
    },
    {
      title: 'Real Estate',
      description: 'Track properties, land, and real estate investments',
      icon: <LuHouse size={32} />,
      path: '/assets/real-estate',
      color: 'green',
    },
    {
      title: 'Gold',
      description: 'Monitor gold holdings, bars, coins, and jewelry',
      icon: <LuCoins size={32} />,
      path: '/assets/gold',
      color: 'yellow',
    },
  ];

  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={6}>
        <Heading size="lg">Assets Management</Heading>
        <Text color="text.secondary">
          Track and manage your real estate, gold, vehicles, and other valuable assets.
        </Text>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
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

export default AssetsPage;
