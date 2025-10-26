import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Heading,
  Stack,
  Button,
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogCloseTrigger,
  DialogActionTrigger,
  HStack,
  Badge,
  IconButton,
  VStack,
  Flex,
  Text,
  Link,
  Portal,
  DialogBackdrop,
  DialogPositioner,
} from '@chakra-ui/react';
import { LuPlus, LuPencil, LuTrash2, LuChevronDown, LuExternalLink } from 'react-icons/lu';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { brokerService } from '../../api/services/securities.service';
import { toaster } from '../../components/ui/toaster';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { InputField, SelectField, TextareaField } from '../../components/common/FormField';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import type { Broker } from '../../types/domain.types';

const brokerSchema = z.object({
  broker_name: z.string().min(1, 'Name is required'),
  broker_code: z.string().min(1, 'Code is required'),
  broker_type: z.enum(['full_service', 'discount', 'online', 'bank']),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  contact_email: z.string().email('Invalid email').optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
});

type BrokerFormData = z.infer<typeof brokerSchema>;

const BrokersPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null);
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['brokers'],
    queryFn: () => brokerService.getAll(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BrokerFormData>({
    resolver: zodResolver(brokerSchema),
  });

  const createMutation = useMutation({
    mutationFn: brokerService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brokers'] });
      toaster.create({
        title: 'Broker created successfully',
        type: 'success',
      });
      handleCloseDialog();
    },
    onError: () => {
      toaster.create({
        title: 'Failed to create broker',
        type: 'error',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ broker_id, data }: { broker_id: number; data: BrokerFormData }) =>
      brokerService.update(broker_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brokers'] });
      toaster.create({
        title: 'Broker updated successfully',
        type: 'success',
      });
      handleCloseDialog();
    },
    onError: () => {
      toaster.create({
        title: 'Failed to update broker',
        type: 'error',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (broker_id: number) => brokerService.delete(broker_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brokers'] });
      toaster.create({
        title: 'Broker deleted successfully',
        type: 'success',
      });
      setIsDeleteDialogOpen(false);
      setSelectedBroker(null);
    },
    onError: () => {
      toaster.create({
        title: 'Failed to delete broker',
        type: 'error',
      });
    },
  });

  const handleOpenDialog = (broker?: Broker) => {
    if (broker) {
      setSelectedBroker(broker);
      reset({
        broker_name: broker.broker_name,
        broker_code: broker.broker_code,
        broker_type: broker.broker_type,
        website: broker.website || '',
        contact_email: broker.contact_email || '',
        contact_phone: broker.contact_phone || '',
        address: broker.address || '',
        city: broker.city || '',
        state: broker.state || '',
        country: broker.country || '',
      });
    } else {
      setSelectedBroker(null);
      reset({
        broker_name: '',
        broker_code: '',
        broker_type: 'discount',
        website: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        city: '',
        state: '',
        country: 'India',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedBroker(null);
    reset();
  };

  const onSubmit = (data: BrokerFormData) => {
    if (selectedBroker) {
      updateMutation.mutate({ broker_id: selectedBroker.broker_id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (broker: Broker) => {
    setSelectedBroker(broker);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedBroker) {
      deleteMutation.mutate(selectedBroker.broker_id);
    }
  };

  const brokers = response?.data || [];

  if (isLoading) return <LoadingSpinner />;

  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={6}>
        <HStack justifyContent="space-between">
          <Heading size="lg">Brokers</Heading>
          <Button colorScheme="blue" onClick={() => handleOpenDialog()}>
            <LuPlus /> Add Broker
          </Button>
        </HStack>

        {brokers.length === 0 ? (
          <EmptyState
            title="No brokers yet"
            description="Add your first broker to get started"
            actionLabel="Add Broker"
            onAction={() => handleOpenDialog()}
          />
        ) : (
          <ResponsiveTable
            data={brokers}
            columns={[
              {
                header: 'Name',
                cell: (broker) => <Text fontWeight="medium">{broker.broker_name}</Text>,
              },
              {
                header: 'Code',
                cell: (broker) => broker.broker_code,
              },
              {
                header: 'Type',
                cell: (broker) => (
                  <Badge colorScheme="blue">
                    {broker.broker_type.replace('_', ' ').toUpperCase()}
                  </Badge>
                ),
              },
              {
                header: 'Website',
                cell: (broker) =>
                  broker.website ? (
                    <Link
                      href={broker.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="blue.500"
                      textDecoration="underline"
                    >
                      Visit <LuExternalLink style={{ display: 'inline' }} />
                    </Link>
                  ) : (
                    '-'
                  ),
              },
              {
                header: 'Contact Email',
                cell: (broker) => broker.contact_email || '-',
              },
              {
                header: 'Contact Phone',
                cell: (broker) => broker.contact_phone || '-',
              },
              {
                header: 'Status',
                cell: (broker) => (
                  <Badge colorScheme={broker.is_active ? 'green' : 'gray'}>
                    {broker.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                ),
              },
              {
                header: 'Actions',
                cell: (broker) => (
                  <HStack gap={2}>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenDialog(broker)}
                    >
                      <LuPencil />
                    </IconButton>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleDelete(broker)}
                    >
                      <LuTrash2 />
                    </IconButton>
                  </HStack>
                ),
              },
            ]}
            mobileConfig={{
              getKey: (broker) => broker.broker_id,
              summaryRender: (broker) => (
                <Flex justify="space-between" align="center" w="full">
                  <VStack align="start" gap={1} flex={1}>
                    <Text fontWeight="bold" fontSize="md">
                      {broker.broker_name}
                    </Text>
                    <Text fontSize="sm" color="text.secondary">
                      {broker.broker_code}
                    </Text>
                    <HStack gap={2}>
                      <Badge colorScheme="blue" fontSize="xs">
                        {broker.broker_type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge colorScheme={broker.is_active ? 'green' : 'gray'} fontSize="xs">
                        {broker.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </HStack>
                  </VStack>
                  <LuChevronDown />
                </Flex>
              ),
              detailsRender: (broker) => (
                <VStack align="stretch" gap={3}>
                  {broker.website && (
                    <Flex justify="space-between" align="center">
                      <Text color="text.secondary" fontSize="sm">
                        Website
                      </Text>
                      <Link
                        href={broker.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="blue.500"
                        fontSize="sm"
                      >
                        Visit Website <LuExternalLink style={{ display: 'inline' }} />
                      </Link>
                    </Flex>
                  )}
                  {broker.contact_email && (
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Contact Email
                      </Text>
                      <Link
                        href={`mailto:${broker.contact_email}`}
                        color="blue.500"
                        fontSize="sm"
                      >
                        {broker.contact_email}
                      </Link>
                    </Flex>
                  )}
                  {broker.contact_phone && (
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Contact Phone
                      </Text>
                      <Link
                        href={`tel:${broker.contact_phone}`}
                        color="blue.500"
                        fontSize="sm"
                      >
                        {broker.contact_phone}
                      </Link>
                    </Flex>
                  )}
                  {broker.address && (
                    <Flex justify="space-between">
                      <Text color="text.secondary" fontSize="sm">
                        Address
                      </Text>
                      <Text fontSize="sm" textAlign="right" maxW="60%">
                        {broker.address}
                        {broker.city && `, ${broker.city}`}
                        {broker.state && `, ${broker.state}`}
                        {broker.country && `, ${broker.country}`}
                      </Text>
                    </Flex>
                  )}
                  {!broker.website && !broker.contact_email && !broker.contact_phone && !broker.address && (
                    <Text fontSize="sm" color="text.secondary" textAlign="center">
                      No additional contact information available
                    </Text>
                  )}

                  {/* Action Buttons */}
                  <Flex justify="flex-end" gap={2} pt={2} borderTopWidth="1px" mt={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDialog(broker)}
                    >
                      <LuPencil /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="red"
                      onClick={() => handleDelete(broker)}
                    >
                      <LuTrash2 /> Delete
                    </Button>
                  </Flex>
                </VStack>
              ),
            }}
          />
        )}
      </Stack>

      <DialogRoot open={isDialogOpen} onOpenChange={(e) => !e.open && handleCloseDialog()}>
        <Portal>
          <DialogBackdrop />
          <DialogPositioner>
            <DialogContent>
              <form onSubmit={handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>
                    {selectedBroker ? 'Edit Broker' : 'Add Broker'}
                  </DialogTitle>
                </DialogHeader>
                <DialogCloseTrigger />
                <DialogBody>
                  <Stack gap={4}>
                    <InputField
                      label="Broker Name"
                      required
                      error={errors.broker_name?.message}
                      {...register('broker_name')}
                    />
                    <InputField
                      label="Broker Code"
                      required
                      error={errors.broker_code?.message}
                      {...register('broker_code')}
                      placeholder="e.g., ZERODHA, UPSTOX"
                    />
                    <SelectField
                      label="Broker Type"
                      required
                      error={errors.broker_type?.message}
                      {...register('broker_type')}
                    >
                      <option value="full_service">Full Service</option>
                      <option value="discount">Discount</option>
                      <option value="online">Online</option>
                      <option value="bank">Bank</option>
                    </SelectField>
                    <InputField
                      label="Website"
                      type="url"
                      error={errors.website?.message}
                      {...register('website')}
                      placeholder="https://example.com"
                    />
                    <InputField
                      label="Contact Email"
                      type="email"
                      error={errors.contact_email?.message}
                      {...register('contact_email')}
                      placeholder="support@example.com"
                    />
                    <InputField
                      label="Contact Phone"
                      error={errors.contact_phone?.message}
                      {...register('contact_phone')}
                      placeholder="+91 1234567890"
                    />
                    <TextareaField
                      label="Address"
                      error={errors.address?.message}
                      {...register('address')}
                      rows={2}
                    />
                    <HStack gap={4}>
                      <InputField
                        label="City"
                        error={errors.city?.message}
                        {...register('city')}
                      />
                      <InputField
                        label="State"
                        error={errors.state?.message}
                        {...register('state')}
                      />
                    </HStack>
                    <InputField
                      label="Country"
                      error={errors.country?.message}
                      {...register('country')}
                      placeholder="India"
                    />
                  </Stack>
                </DialogBody>
                <DialogFooter>
                  <DialogActionTrigger asChild>
                    <Button variant="outline" onClick={handleCloseDialog}>
                      Cancel
                    </Button>
                  </DialogActionTrigger>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    loading={createMutation.isPending || updateMutation.isPending}
                  >
                    {selectedBroker ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </DialogPositioner>
        </Portal>
      </DialogRoot>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Broker"
        message={`Are you sure you want to delete "${selectedBroker?.broker_name}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </Container>
  );
};

export default BrokersPage;

