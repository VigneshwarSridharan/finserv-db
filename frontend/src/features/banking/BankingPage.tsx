import { Container, Heading, Stack, Grid, Card, Text, Button } from '@chakra-ui/react';
import { LuBanknote, LuPiggyBank, LuRepeat, LuArrowRight } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';

interface FeatureCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

const BankingPage = () => {
  const navigate = useNavigate();

  const features: FeatureCard[] = [
    {
      title: 'Bank Accounts',
      description: 'Manage your savings, current, and salary accounts',
      icon: <LuBanknote size={32} />,
      path: '/banking/accounts',
      color: 'blue',
    },
    {
      title: 'Fixed Deposits',
      description: 'Track your FDs, maturity dates, and interest earnings',
      icon: <LuPiggyBank size={32} />,
      path: '/banking/fixed-deposits',
      color: 'green',
    },
    {
      title: 'Recurring Deposits',
      description: 'Monitor RD installments and maturity amounts',
      icon: <LuRepeat size={32} />,
      path: '/banking/recurring-deposits',
      color: 'purple',
    },
  ];

  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={6}>
        <Heading size="lg">Banking & Deposits</Heading>
        <Text color="text.secondary">
          Manage your bank accounts, fixed deposits, and recurring deposits all in one place.
        </Text>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
          {features.map((feature) => (
            <Card.Root key={feature.path} p={6} _hover={{ shadow: 'md', transform: 'translateY(-2px)' }} transition="all 0.2s">
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

export default BankingPage;
