import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Stack,
  Text,
  Link,
  Card,
  SimpleGrid,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { registerSchema } from '../../utils/validation';
import { authService } from '../../api/services/auth.service';
import { useAuthStore } from '../../store/authStore';
import type { RegisterRequest } from '../../types/api.types';
import { Field } from '../../components/ui/field';
import { toaster } from '../../components/ui/toaster';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterRequest>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (response) => {
      if (response.success && response.data) {
        setAuth(response.data.user, response.data.token);
        toaster.success({
          title: 'Registration Successful',
          description: 'Welcome to Portfolio Manager!',
        });
        navigate('/dashboard');
      }
    },
    onError: (error: any) => {
      setError(error.error || 'Registration failed. Please try again.');
      toaster.error({
        title: 'Registration Failed',
        description: error.error || 'Please try again',
      });
    },
  });

  const onSubmit = (data: RegisterRequest) => {
    setError('');
    registerMutation.mutate(data);
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="bg.canvas">
      <Container maxW="2xl" py={12}>
        <Card.Root p={8}>
          <Stack gap={6}>
            <Box textAlign="center">
              <Heading size="xl" mb={2}>
                Create Account
              </Heading>
              <Text color="text.secondary">Join Portfolio Manager today</Text>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack gap={4}>
                <Field
                  label="Username"
                  invalid={!!errors.username}
                  errorText={errors.username?.message}
                >
                  <Input
                    placeholder="johndoe"
                    {...register('username')}
                  />
                </Field>

                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <Field
                    label="First Name"
                    invalid={!!errors.first_name}
                    errorText={errors.first_name?.message}
                  >
                    <Input
                      placeholder="John"
                      {...register('first_name')}
                    />
                  </Field>

                  <Field
                    label="Last Name"
                    invalid={!!errors.last_name}
                    errorText={errors.last_name?.message}
                  >
                    <Input
                      placeholder="Doe"
                      {...register('last_name')}
                    />
                  </Field>
                </SimpleGrid>

                <Field
                  label="Email"
                  invalid={!!errors.email}
                  errorText={errors.email?.message}
                >
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    {...register('email')}
                  />
                </Field>

                <Field
                  label="Phone (Optional)"
                  invalid={!!errors.phone}
                  errorText={errors.phone?.message}
                >
                  <Input
                    type="tel"
                    placeholder="+919876543210"
                    {...register('phone')}
                  />
                </Field>

                <Field
                  label="Password"
                  invalid={!!errors.password}
                  errorText={errors.password?.message}
                >
                  <Input
                    type="password"
                    placeholder="Minimum 8 characters"
                    {...register('password')}
                  />
                </Field>

                <Field
                  label="Date of Birth (Optional)"
                  invalid={!!errors.date_of_birth}
                  errorText={errors.date_of_birth?.message}
                >
                  <Input
                    type="date"
                    {...register('date_of_birth')}
                  />
                </Field>

                {error && (
                  <Text color="red.500" fontSize="sm">
                    {error}
                  </Text>
                )}

                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  w="full"
                  loading={registerMutation.isPending}
                >
                  Create Account
                </Button>
              </Stack>
            </form>

            <Text textAlign="center" fontSize="sm" color="text.secondary">
              Already have an account?{' '}
              <Link asChild color="brand.500" fontWeight="medium">
                <RouterLink to="/login">Sign in</RouterLink>
              </Link>
            </Text>
          </Stack>
        </Card.Root>
      </Container>
    </Box>
  );
};

export default RegisterPage;


