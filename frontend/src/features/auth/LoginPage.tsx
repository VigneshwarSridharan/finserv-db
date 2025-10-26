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
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { loginSchema } from '../../utils/validation';
import { authService } from '../../api/services/auth.service';
import { useAuthStore } from '../../store/authStore';
import type { LoginRequest } from '../../types/api.types';
import { Field } from '../../components/ui/field';
import { toaster } from '../../components/ui/toaster';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      if (response.success && response.data) {
        setAuth(response.data.user, response.data.token);
        toaster.success({
          title: 'Login Successful',
          description: 'Welcome back!',
        });
        navigate('/dashboard');
      }
    },
    onError: (error: any) => {
      setError(error.error || 'Login failed. Please try again.');
      toaster.error({
        title: 'Login Failed',
        description: error.error || 'Invalid credentials',
      });
    },
  });

  const onSubmit = (data: LoginRequest) => {
    setError('');
    loginMutation.mutate(data);
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="bg.canvas">
      <Container maxW="md" py={12}>
        <Card.Root p={8}>
          <Stack gap={6}>
            <Box textAlign="center">
              <Heading size="xl" mb={2}>
                Portfolio Manager
              </Heading>
              <Text color="text.secondary">Sign in to your account</Text>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack gap={4}>
                <Field
                  label="Email"
                  invalid={!!errors.email}
                  errorText={errors.email?.message}
                >
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    {...register('email')}
                  />
                </Field>

                <Field
                  label="Password"
                  invalid={!!errors.password}
                  errorText={errors.password?.message}
                >
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    {...register('password')}
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
                  loading={loginMutation.isPending}
                >
                  Sign In
                </Button>
              </Stack>
            </form>

            <Text textAlign="center" fontSize="sm" color="text.secondary">
              Don't have an account?{' '}
              <Link asChild color="brand.500" fontWeight="medium">
                <RouterLink to="/register">Sign up</RouterLink>
              </Link>
            </Text>
          </Stack>
        </Card.Root>
      </Container>
    </Box>
  );
};

export default LoginPage;


