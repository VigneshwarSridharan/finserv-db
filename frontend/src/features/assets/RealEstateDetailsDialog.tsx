import { useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogCloseTrigger,
  DialogActionTrigger,
  DialogBackdrop,
  DialogPositioner,
  Button,
  Stack,
  Portal,
  Grid,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { assetService } from '../../api/services/assets.service';
import { toaster } from '../../components/ui/toaster';
import { InputField, TextareaField, SelectField } from '../../components/common/FormField';
import type { RealEstateDetail, CreateRealEstateDetailRequest } from '../../types/domain.types';

const realEstateSchema = z.object({
  property_type: z.enum(['residential', 'commercial', 'industrial', 'agricultural', 'land'], {
    message: 'Please select a property type',
  }),
  property_address: z.string().min(1, 'Property address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().optional(),
  area_sqft: z.number().optional().nullable(),
  built_up_area_sqft: z.number().optional().nullable(),
  year_built: z.number().optional().nullable(),
  floors: z.number().optional().nullable(),
  bedrooms: z.number().optional().nullable(),
  bathrooms: z.number().optional().nullable(),
  parking_spaces: z.number().optional().nullable(),
  registration_number: z.string().optional(),
  registration_date: z.string().optional(),
  property_tax_number: z.string().optional(),
  maintenance_charges: z.number().optional().nullable(),
  rental_income: z.number().optional().nullable(),
  rental_yield: z.number().optional().nullable(),
  occupancy_status: z.enum(['self_occupied', 'rented', 'vacant', 'under_construction']).optional(),
});

type RealEstateFormData = z.infer<typeof realEstateSchema>;

interface RealEstateDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: number;
  onSuccess?: () => void;
}

const RealEstateDetailsDialog = ({ isOpen, onClose, assetId, onSuccess }: RealEstateDetailsDialogProps) => {
  const queryClient = useQueryClient();

  const { data: detailsResponse, isLoading } = useQuery({
    queryKey: ['realEstateDetails', assetId],
    queryFn: () => assetService.getRealEstateDetails(assetId),
    enabled: isOpen && !!assetId,
  });

  const existingDetails = detailsResponse?.data;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RealEstateFormData>({
    resolver: zodResolver(realEstateSchema),
  });

  useEffect(() => {
    if (isOpen && existingDetails) {
      reset({
        property_type: existingDetails.property_type,
        property_address: existingDetails.property_address,
        city: existingDetails.city,
        state: existingDetails.state,
        pincode: existingDetails.pincode || '',
        area_sqft: existingDetails.area_sqft ? parseFloat(existingDetails.area_sqft) : null,
        built_up_area_sqft: existingDetails.built_up_area_sqft ? parseFloat(existingDetails.built_up_area_sqft) : null,
        year_built: existingDetails.year_built || null,
        floors: existingDetails.floors || null,
        bedrooms: existingDetails.bedrooms || null,
        bathrooms: existingDetails.bathrooms || null,
        parking_spaces: existingDetails.parking_spaces || null,
        registration_number: existingDetails.registration_number || '',
        registration_date: existingDetails.registration_date || '',
        property_tax_number: existingDetails.property_tax_number || '',
        maintenance_charges: existingDetails.maintenance_charges ? parseFloat(existingDetails.maintenance_charges) : null,
        rental_income: existingDetails.rental_income ? parseFloat(existingDetails.rental_income) : null,
        rental_yield: existingDetails.rental_yield ? parseFloat(existingDetails.rental_yield) : null,
        occupancy_status: existingDetails.occupancy_status || 'self_occupied',
      });
    } else if (isOpen && !isLoading) {
      reset({
        property_type: 'residential',
        property_address: '',
        city: '',
        state: '',
        pincode: '',
        area_sqft: null,
        built_up_area_sqft: null,
        year_built: null,
        floors: null,
        bedrooms: null,
        bathrooms: null,
        parking_spaces: null,
        registration_number: '',
        registration_date: '',
        property_tax_number: '',
        maintenance_charges: null,
        rental_income: null,
        rental_yield: null,
        occupancy_status: 'self_occupied',
      });
    }
  }, [isOpen, existingDetails, isLoading, reset]);

  const createMutation = useMutation({
    mutationFn: (data: CreateRealEstateDetailRequest) => assetService.addRealEstateDetails(assetId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['realEstateDetails', assetId] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toaster.create({
        title: 'Real estate details added successfully',
        type: 'success',
      });
      onSuccess?.();
      onClose();
    },
    onError: () => {
      toaster.create({
        title: 'Failed to add real estate details',
        type: 'error',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateRealEstateDetailRequest>) => 
      assetService.updateRealEstateDetails(assetId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['realEstateDetails', assetId] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toaster.create({
        title: 'Real estate details updated successfully',
        type: 'success',
      });
      onSuccess?.();
      onClose();
    },
    onError: () => {
      toaster.create({
        title: 'Failed to update real estate details',
        type: 'error',
      });
    },
  });

  const onSubmit = (data: RealEstateFormData) => {
    const payload: CreateRealEstateDetailRequest = {
      ...data,
      area_sqft: data.area_sqft || undefined,
      built_up_area_sqft: data.built_up_area_sqft || undefined,
      year_built: data.year_built || undefined,
      floors: data.floors || undefined,
      bedrooms: data.bedrooms || undefined,
      bathrooms: data.bathrooms || undefined,
      parking_spaces: data.parking_spaces || undefined,
      maintenance_charges: data.maintenance_charges || undefined,
      rental_income: data.rental_income || undefined,
      rental_yield: data.rental_yield || undefined,
    };

    if (existingDetails) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && onClose()} size="xl">
      <Portal>
        <DialogBackdrop />
        <DialogPositioner>
          <DialogContent maxH="90vh" overflowY="auto">
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>
                  {existingDetails ? 'Edit Real Estate Details' : 'Add Real Estate Details'}
                </DialogTitle>
              </DialogHeader>
              <DialogCloseTrigger />
              <DialogBody>
                <Stack gap={4}>
                  <SelectField
                    label="Property Type"
                    required
                    error={errors.property_type?.message}
                    {...register('property_type')}
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="agricultural">Agricultural</option>
                    <option value="land">Land</option>
                  </SelectField>

                  <TextareaField
                    label="Property Address"
                    required
                    error={errors.property_address?.message}
                    {...register('property_address')}
                  />

                  <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
                    <InputField
                      label="City"
                      required
                      error={errors.city?.message}
                      {...register('city')}
                    />

                    <InputField
                      label="State"
                      required
                      error={errors.state?.message}
                      {...register('state')}
                    />

                    <InputField
                      label="Pincode"
                      error={errors.pincode?.message}
                      {...register('pincode')}
                    />
                  </Grid>

                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                    <InputField
                      label="Area (sq ft)"
                      type="number"
                      step="0.01"
                      error={errors.area_sqft?.message}
                      {...register('area_sqft', { 
                        setValueAs: (v) => v === '' || v === null ? null : Number(v)
                      })}
                    />

                    <InputField
                      label="Built-up Area (sq ft)"
                      type="number"
                      step="0.01"
                      error={errors.built_up_area_sqft?.message}
                      {...register('built_up_area_sqft', { 
                        setValueAs: (v) => v === '' || v === null ? null : Number(v)
                      })}
                    />
                  </Grid>

                  <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
                    <InputField
                      label="Year Built"
                      type="number"
                      error={errors.year_built?.message}
                      {...register('year_built', { 
                        setValueAs: (v) => v === '' || v === null ? null : Number(v)
                      })}
                    />

                    <InputField
                      label="Floors"
                      type="number"
                      error={errors.floors?.message}
                      {...register('floors', { 
                        setValueAs: (v) => v === '' || v === null ? null : Number(v)
                      })}
                    />

                    <InputField
                      label="Bedrooms"
                      type="number"
                      error={errors.bedrooms?.message}
                      {...register('bedrooms', { 
                        setValueAs: (v) => v === '' || v === null ? null : Number(v)
                      })}
                    />

                    <InputField
                      label="Bathrooms"
                      type="number"
                      error={errors.bathrooms?.message}
                      {...register('bathrooms', { 
                        setValueAs: (v) => v === '' || v === null ? null : Number(v)
                      })}
                    />
                  </Grid>

                  <InputField
                    label="Parking Spaces"
                    type="number"
                    error={errors.parking_spaces?.message}
                    {...register('parking_spaces', { 
                      setValueAs: (v) => v === '' || v === null ? null : Number(v)
                    })}
                  />

                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                    <InputField
                      label="Registration Number"
                      error={errors.registration_number?.message}
                      {...register('registration_number')}
                    />

                    <InputField
                      label="Registration Date"
                      type="date"
                      error={errors.registration_date?.message}
                      {...register('registration_date')}
                    />
                  </Grid>

                  <InputField
                    label="Property Tax Number"
                    error={errors.property_tax_number?.message}
                    {...register('property_tax_number')}
                  />

                  <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
                    <InputField
                      label="Maintenance Charges"
                      type="number"
                      step="0.01"
                      error={errors.maintenance_charges?.message}
                      {...register('maintenance_charges', { 
                        setValueAs: (v) => v === '' || v === null ? null : Number(v)
                      })}
                    />

                    <InputField
                      label="Rental Income"
                      type="number"
                      step="0.01"
                      error={errors.rental_income?.message}
                      {...register('rental_income', { 
                        setValueAs: (v) => v === '' || v === null ? null : Number(v)
                      })}
                    />

                    <InputField
                      label="Rental Yield (%)"
                      type="number"
                      step="0.01"
                      error={errors.rental_yield?.message}
                      {...register('rental_yield', { 
                        setValueAs: (v) => v === '' || v === null ? null : Number(v)
                      })}
                    />
                  </Grid>

                  <SelectField
                    label="Occupancy Status"
                    error={errors.occupancy_status?.message}
                    {...register('occupancy_status')}
                  >
                    <option value="self_occupied">Self Occupied</option>
                    <option value="rented">Rented</option>
                    <option value="vacant">Vacant</option>
                    <option value="under_construction">Under Construction</option>
                  </SelectField>
                </Stack>
              </DialogBody>
              <DialogFooter>
                <DialogActionTrigger asChild>
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                </DialogActionTrigger>
                <Button
                  type="submit"
                  colorScheme="blue"
                  loading={createMutation.isPending || updateMutation.isPending}
                >
                  {existingDetails ? 'Update' : 'Add'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </DialogPositioner>
      </Portal>
    </DialogRoot>
  );
};

export default RealEstateDetailsDialog;

