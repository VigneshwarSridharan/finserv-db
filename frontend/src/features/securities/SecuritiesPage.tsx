import { Container, Heading, Text, Stack } from '@chakra-ui/react';

const SecuritiesPage = () => {
  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={4}>
        <Heading size="lg">Securities</Heading>
        <Text color="text.secondary">
          Manage your brokers, securities, holdings, and transactions.
        </Text>
        <Text color="text.secondary" fontSize="sm">
          This page is under development. Features will include:
        </Text>
        <Stack gap={2} ml={4}>
          <Text fontSize="sm">• Broker management</Text>
          <Text fontSize="sm">• Securities tracking</Text>
          <Text fontSize="sm">• Holdings with P&L</Text>
          <Text fontSize="sm">• Transaction management</Text>
          <Text fontSize="sm">• Price history</Text>
          <Text fontSize="sm">• Bulk imports</Text>
        </Stack>
      </Stack>
    </Container>
  );
};

export default SecuritiesPage;


