import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Heading,
  Stack,
  Card,
  Button,
  Tabs,
  Grid,
  HStack,
  Text,
  Badge,
  Input,
  Switch,
} from '@chakra-ui/react';
import { LuUser, LuSettings, LuKey, LuBell } from 'react-icons/lu';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { userService } from '../../api/services/user.service';
import { toaster } from '../../components/ui/toaster';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { InputField } from '../../components/common/FormField';
import { Field } from '../../components/ui/field';

const profileSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone_number: z.string().optional(),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string().min(1, 'Please confirm password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface UserProfile {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone_number?: string;
  created_at: string;
  email_verified: boolean;
}

interface UserPreferences {
  notifications_enabled: boolean;
  email_alerts: boolean;
  price_alerts: boolean;
  maturity_alerts: boolean;
  theme: string;
}

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const queryClient = useQueryClient();

  const { data: profileResponse, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => userService.getProfile(),
  });

  const { data: preferencesResponse, isLoading: preferencesLoading } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: () => userService.getPreferences(),
  });

  const profile: UserProfile = profileResponse?.data;
  const preferences: UserPreferences = preferencesResponse?.data || {
    notifications_enabled: true,
    email_alerts: true,
    price_alerts: true,
    maturity_alerts: true,
    theme: 'light',
  };

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: profile,
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toaster.create({
        title: 'Profile updated successfully',
        type: 'success',
      });
    },
    onError: () => {
      toaster.create({
        title: 'Failed to update profile',
        type: 'error',
      });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: PasswordFormData) => userService.updatePassword(data),
    onSuccess: () => {
      toaster.create({
        title: 'Password updated successfully',
        type: 'success',
      });
      resetPassword();
    },
    onError: () => {
      toaster.create({
        title: 'Failed to update password',
        type: 'error',
      });
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (data: Partial<UserPreferences>) =>
      userService.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
      toaster.create({
        title: 'Preferences updated successfully',
        type: 'success',
      });
    },
    onError: () => {
      toaster.create({
        title: 'Failed to update preferences',
        type: 'error',
      });
    },
  });

  const onProfileSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
    updatePasswordMutation.mutate(data);
  };

  const handlePreferenceChange = (key: keyof UserPreferences, value: boolean) => {
    updatePreferencesMutation.mutate({ [key]: value });
  };

  if (profileLoading || preferencesLoading) return <LoadingSpinner />;

  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={6}>
        <Heading size="lg">Profile & Settings</Heading>

        <Tabs.Root value={activeTab} onValueChange={(e) => setActiveTab(e.value)}>
          <Tabs.List>
            <Tabs.Trigger value="profile">
              <LuUser /> Profile
            </Tabs.Trigger>
            <Tabs.Trigger value="security">
              <LuKey /> Security
            </Tabs.Trigger>
            <Tabs.Trigger value="preferences">
              <LuSettings /> Preferences
            </Tabs.Trigger>
            <Tabs.Trigger value="notifications">
              <LuBell /> Notifications
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="profile">
            <Card.Root mt={4}>
          <Card.Body>
                <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
                  <Stack gap={6}>
                    <Heading size="md">Profile Information</Heading>

                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              <Stack gap={2}>
                        <Text fontSize="sm" fontWeight="medium" color="text.secondary">
                          Username
                </Text>
                        <Input value={profile?.username} disabled />
              </Stack>
              
              <Stack gap={2}>
                        <Text fontSize="sm" fontWeight="medium" color="text.secondary">
                          Email Verification
                        </Text>
                        <Badge
                          colorScheme={profile?.email_verified ? 'green' : 'orange'}
                          w="fit-content"
                        >
                          {profile?.email_verified ? 'Verified' : 'Not Verified'}
                        </Badge>
                      </Stack>
                    </Grid>

                    <InputField
                      label="Full Name"
                      required
                      error={profileErrors.full_name?.message}
                      {...registerProfile('full_name')}
                    />

                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                      <InputField
                        label="Email"
                        type="email"
                        required
                        error={profileErrors.email?.message}
                        {...registerProfile('email')}
                      />
                      <InputField
                        label="Phone Number"
                        error={profileErrors.phone_number?.message}
                        {...registerProfile('phone_number')}
                      />
                    </Grid>

                    <HStack justifyContent="flex-end">
                      <Button
                        type="submit"
                        colorScheme="blue"
                        loading={updateProfileMutation.isPending}
                      >
                        Save Changes
                      </Button>
                    </HStack>
              </Stack>
                </form>
              </Card.Body>
            </Card.Root>
          </Tabs.Content>

          <Tabs.Content value="security">
            <Card.Root mt={4}>
              <Card.Body>
                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                  <Stack gap={6}>
                    <Heading size="md">Change Password</Heading>

                    <InputField
                      label="Current Password"
                      type="password"
                      required
                      error={passwordErrors.current_password?.message}
                      {...registerPassword('current_password')}
                    />

                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                      <InputField
                        label="New Password"
                        type="password"
                        required
                        error={passwordErrors.new_password?.message}
                        helperText="At least 8 characters"
                        {...registerPassword('new_password')}
                      />
                      <InputField
                        label="Confirm New Password"
                        type="password"
                        required
                        error={passwordErrors.confirm_password?.message}
                        {...registerPassword('confirm_password')}
                      />
                    </Grid>

                    <HStack justifyContent="flex-end">
                      <Button
                        type="submit"
                        colorScheme="blue"
                        loading={updatePasswordMutation.isPending}
                      >
                        Update Password
                      </Button>
                    </HStack>
              </Stack>
                </form>
              </Card.Body>
            </Card.Root>
          </Tabs.Content>

          <Tabs.Content value="preferences">
            <Card.Root mt={4}>
              <Card.Body>
                <Stack gap={6}>
                  <Heading size="md">App Preferences</Heading>

                  <Field label="Theme" helperText="Choose your preferred color scheme">
                    <HStack>
                      <Button
                        variant={preferences.theme === 'light' ? 'solid' : 'outline'}
                        onClick={() => handlePreferenceChange('theme' as any, true)}
                      >
                        Light
                      </Button>
                      <Button
                        variant={preferences.theme === 'dark' ? 'solid' : 'outline'}
                        onClick={() => handlePreferenceChange('theme' as any, false)}
                      >
                        Dark
                      </Button>
                    </HStack>
                  </Field>
                </Stack>
              </Card.Body>
            </Card.Root>
          </Tabs.Content>

          <Tabs.Content value="notifications">
            <Card.Root mt={4}>
              <Card.Body>
                <Stack gap={6}>
                  <Heading size="md">Notification Settings</Heading>

                  <Stack gap={4}>
                    <HStack justifyContent="space-between">
                      <Stack gap={0}>
                        <Text fontWeight="medium">Enable Notifications</Text>
                        <Text fontSize="sm" color="text.secondary">
                          Receive all notifications
                        </Text>
                      </Stack>
                      <Switch
                        checked={preferences.notifications_enabled}
                        onCheckedChange={(e) =>
                          handlePreferenceChange('notifications_enabled', e.checked)
                        }
                      />
                    </HStack>

                    <HStack justifyContent="space-between">
                      <Stack gap={0}>
                        <Text fontWeight="medium">Email Alerts</Text>
                        <Text fontSize="sm" color="text.secondary">
                          Get alerts via email
                        </Text>
                      </Stack>
                      <Switch
                        checked={preferences.email_alerts}
                        onCheckedChange={(e) =>
                          handlePreferenceChange('email_alerts', e.checked)
                        }
                      />
                    </HStack>

                    <HStack justifyContent="space-between">
                      <Stack gap={0}>
                        <Text fontWeight="medium">Price Alerts</Text>
                        <Text fontSize="sm" color="text.secondary">
                          Notify when price targets are hit
                        </Text>
                      </Stack>
                      <Switch
                        checked={preferences.price_alerts}
                        onCheckedChange={(e) =>
                          handlePreferenceChange('price_alerts', e.checked)
                        }
                      />
                    </HStack>

                    <HStack justifyContent="space-between">
                      <Stack gap={0}>
                        <Text fontWeight="medium">Maturity Alerts</Text>
                        <Text fontSize="sm" color="text.secondary">
                          Notify about upcoming FD/RD maturities
              </Text>
                      </Stack>
                      <Switch
                        checked={preferences.maturity_alerts}
                        onCheckedChange={(e) =>
                          handlePreferenceChange('maturity_alerts', e.checked)
                        }
                      />
                    </HStack>
                  </Stack>
            </Stack>
          </Card.Body>
        </Card.Root>
          </Tabs.Content>
        </Tabs.Root>
      </Stack>
    </Container>
  );
};

export default ProfilePage;
