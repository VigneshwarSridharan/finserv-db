import { Container, Heading, Text, Stack } from '@chakra-ui/react';

const PortfolioPage = () => {
  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={4}>
        <Heading size="lg">Portfolio</Heading>
        <Text color="text.secondary">
          View your complete portfolio overview, goals, alerts, and performance.
        </Text>
        <Text color="text.secondary" fontSize="sm">
          This page is under development. Features will include:
        </Text>
        <Stack gap={2} ml={4}>
          <Text fontSize="sm">• Portfolio overview</Text>
          <Text fontSize="sm">• Goals tracking with progress</Text>
          <Text fontSize="sm">• Asset allocation analysis</Text>
          <Text fontSize="sm">• Alerts & notifications</Text>
          <Text fontSize="sm">• Watchlist management</Text>
          <Text fontSize="sm">• Performance analytics</Text>
          <Text fontSize="sm">• Report generation</Text>
        </Stack>
      </Stack>
    </Container>
  );
};

export default PortfolioPage;


