import { Container, Heading, Text, Stack } from '@chakra-ui/react';

const AssetsPage = () => {
  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={4}>
        <Heading size="lg">Assets</Heading>
        <Text color="text.secondary">
          Track your real estate, gold, vehicles, and other assets.
        </Text>
        <Text color="text.secondary" fontSize="sm">
          This page is under development. Features will include:
        </Text>
        <Stack gap={2} ml={4}>
          <Text fontSize="sm">• Asset categories management</Text>
          <Text fontSize="sm">• Real estate tracking</Text>
          <Text fontSize="sm">• Gold holdings</Text>
          <Text fontSize="sm">• Vehicle management</Text>
          <Text fontSize="sm">• Asset valuations over time</Text>
          <Text fontSize="sm">• Transaction history</Text>
        </Stack>
      </Stack>
    </Container>
  );
};

export default AssetsPage;


