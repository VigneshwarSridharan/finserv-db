import { Container, Heading, Text, Stack } from '@chakra-ui/react';

const BankingPage = () => {
  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={4}>
        <Heading size="lg">Banking & Deposits</Heading>
        <Text color="text.secondary">
          Manage your bank accounts, fixed deposits, and recurring deposits.
        </Text>
        <Text color="text.secondary" fontSize="sm">
          This page is under development. Features will include:
        </Text>
        <Stack gap={2} ml={4}>
          <Text fontSize="sm">• Bank accounts</Text>
          <Text fontSize="sm">• Fixed deposits with interest tracking</Text>
          <Text fontSize="sm">• Recurring deposits with installments</Text>
          <Text fontSize="sm">• Maturity management</Text>
          <Text fontSize="sm">• Transaction history</Text>
        </Stack>
      </Stack>
    </Container>
  );
};

export default BankingPage;


