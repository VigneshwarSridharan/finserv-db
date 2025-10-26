import { Container, Heading, Text, Stack, Card } from '@chakra-ui/react';
import { useAuthStore } from '../../store/authStore';

const ProfilePage = () => {
  const { user } = useAuthStore();

  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={6}>
        <Heading size="lg">Profile</Heading>
        
        <Card.Root>
          <Card.Body>
            <Stack gap={4}>
              <Stack gap={2}>
                <Text fontSize="sm" color="text.secondary">Name</Text>
                <Text fontWeight="medium">
                  {user?.first_name} {user?.last_name}
                </Text>
              </Stack>
              
              <Stack gap={2}>
                <Text fontSize="sm" color="text.secondary">Email</Text>
                <Text fontWeight="medium">{user?.email}</Text>
              </Stack>
              
              <Stack gap={2}>
                <Text fontSize="sm" color="text.secondary">Username</Text>
                <Text fontWeight="medium">{user?.username}</Text>
              </Stack>
              
              {user?.phone && (
                <Stack gap={2}>
                  <Text fontSize="sm" color="text.secondary">Phone</Text>
                  <Text fontWeight="medium">{user.phone}</Text>
                </Stack>
              )}
              
              <Text color="text.secondary" fontSize="sm" mt={4}>
                Profile editing and preferences will be available soon.
              </Text>
            </Stack>
          </Card.Body>
        </Card.Root>
      </Stack>
    </Container>
  );
};

export default ProfilePage;


