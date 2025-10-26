import { Container, Heading, Stack, Grid, Card, Text, Button, HStack } from '@chakra-ui/react';
import { LuBriefcase, LuChartLine, LuWallet, LuArrowRight } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';

interface FeatureCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

const SecuritiesPage = () => {
  const navigate = useNavigate();

  const features: FeatureCard[] = [
    {
      title: 'Brokers',
      description: 'Manage your broker accounts and track commissions',
      icon: <LuBriefcase size={32} />,
      path: '/securities/brokers',
      color: 'blue',
    },
    {
      title: 'Holdings',
      description: 'View your current security holdings and P&L',
      icon: <LuWallet size={32} />,
      path: '/securities/holdings',
      color: 'green',
    },
    {
      title: 'Transactions',
      description: 'Track buy, sell, dividend, and other transactions',
      icon: <LuChartLine size={32} />,
      path: '/securities/transactions',
      color: 'purple',
    },
  ];

  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={6}>
        <Heading size="lg">Securities Management</Heading>
        <Text color="text.secondary">
          Manage your brokers, securities, holdings, and transactions all in one place.
        </Text>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
          {features.map((feature) => (
            <Card.Root key={feature.path} p={6} _hover={{ shadow: 'md', transform: 'translateY(-2px)' }} transition="all 0.2s">
              <Card.Body>
                <Stack gap={4}>
                  <HStack justifyContent="space-between">
                    <div style={{ color: `var(--chakra-colors-${feature.color}-500)` }}>
                      {feature.icon}
                    </div>
                  </HStack>
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

export default SecuritiesPage;
