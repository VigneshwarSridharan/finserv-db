import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Heading,
  Stack,
  Button,
  Grid,
  HStack,
} from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { bondsService } from '../../api/services/bonds.service';
import { securitiesService } from '../../api/services/securities.service';
import { toaster } from '../../components/ui/toaster';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { InputField, SelectField } from '../../components/common/FormField';
import type { CreateBondDetailRequest, UpdateBondDetailRequest, BondDetail } from '../../types/domain.types';

const bondSchema = z.object({
  security_id: z.number({ message: 'Security is required' }),
  issuer: z.string().min(1, 'Issuer is required'),
  coupon_rate: z.number().min(0).max(100).optional().nullable(),
  maturity_date: z.string().min(1, 'Maturity date is required'),
  coupon_payment_frequency: z.enum(['annual', 'semi_annual', 'quarterly', 'monthly']).optional().nullable(),
  bond_type: z.enum(['government', 'corporate', 'municipal', 'treasury', 'corporate_high_yield']).optional().nullable(),
  credit_rating: z.enum(['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'D']).optional().nullable(),
  yield_to_maturity: z.number().min(0).max(100).optional().nullable(),
  issue_date: z.string().optional().nullable(),
  next_coupon_date: z.string().optional().nullable(),
  day_count_convention: z.enum(['30/360', 'actual/365', 'actual/360']).optional().nullable(),
});

type BondFormData = z.infer<typeof bondSchema>;

const BondForm = () => {
  const navigate = useNavigate();
  const { securityId } = useParams<{ securityId: string }>();
  const isEditMode = !!securityId;
  const queryClient = useQueryClient();

  const { data: bondData, isLoading: isLoadingBond } = useQuery({
    queryKey: ['bond', securityId],
    queryFn: () => bondsService.getById(securityId!),
    enabled: isEditMode && !!securityId,
  });

  const { data: securitiesResponse, isLoading: isLoadingSecurities } = useQuery({
    queryKey: ['securities', 'bond'],
    queryFn: () => securitiesService.getAll({ security_type: 'bond' }),
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<BondFormData>({
    resolver: zodResolver(bondSchema),
  });

  useEffect(() => {
    if (isEditMode && bondData?.data) {
      const bond = bondData.data;
      reset({
        security_id: bond.security_id,
        issuer: bond.issuer,
        coupon_rate: bond.coupon_rate ? parseFloat(bond.coupon_rate) : null,
        maturity_date: bond.maturity_date,
        coupon_payment_frequency: bond.coupon_payment_frequency as any,
        bond_type: bond.bond_type as any,
        credit_rating: bond.credit_rating as any,
        yield_to_maturity: bond.yield_to_maturity ? parseFloat(bond.yield_to_maturity) : null,
        issue_date: bond.issue_date || null,
        next_coupon_date: bond.next_coupon_date || null,
        day_count_convention: bond.day_count_convention as any,
      });
    }
  }, [bondData, isEditMode, reset]);

  const createMutation = useMutation({
    mutationFn: (data: CreateBondDetailRequest) => bondsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bonds'] });
      toaster.create({
        title: 'Bond created successfully',
        type: 'success',
      });
      navigate('/securities/bonds');
    },
    onError: (error: any) => {
      toaster.create({
        title: error?.response?.data?.message || 'Failed to create bond',
        type: 'error',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ securityId, data }: { securityId: string; data: UpdateBondDetailRequest }) =>
      bondsService.update(securityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bonds'] });
      queryClient.invalidateQueries({ queryKey: ['bond', securityId] });
      toaster.create({
        title: 'Bond updated successfully',
        type: 'success',
      });
      navigate('/securities/bonds');
    },
    onError: (error: any) => {
      toaster.create({
        title: error?.response?.data?.message || 'Failed to update bond',
        type: 'error',
      });
    },
  });

  const onSubmit = (data: BondFormData) => {
    if (isEditMode && securityId) {
      updateMutation.mutate({ securityId, data });
    } else {
      createMutation.mutate(data as CreateBondDetailRequest);
    }
  };

  const securities = securitiesResponse?.data || [];
  const securityOptions = securities.map((sec) => ({
    value: sec.security_id,
    label: `${sec.symbol} - ${sec.name || sec.security_name}`,
  }));

  if (isLoadingBond || isLoadingSecurities) return <LoadingSpinner />;

  return (
    <Container maxW="4xl" py={8}>
      <Stack gap={6}>
        <Heading size="lg">{isEditMode ? 'Edit Bond' : 'Add Bond'}</Heading>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap={6}>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              <Controller
                name="security_id"
                control={control}
                render={({ field }) => (
                  <SelectField
                    label="Security"
                    required
                    error={errors.security_id?.message}
                    placeholder="Select security (must be bond type)"
                    options={securityOptions}
                    value={field.value}
                    onChange={(value) => field.onChange(value ? Number(value) : null)}
                    isDisabled={isEditMode}
                  />
                )}
              />

              <InputField
                label="Issuer"
                required
                error={errors.issuer?.message}
                {...register('issuer')}
              />

              <InputField
                label="Coupon Rate (%)"
                type="number"
                step="0.01"
                error={errors.coupon_rate?.message}
                {...register('coupon_rate', { valueAsNumber: true })}
              />

              <InputField
                label="Maturity Date"
                type="date"
                required
                error={errors.maturity_date?.message}
                {...register('maturity_date')}
              />

              <Controller
                name="coupon_payment_frequency"
                control={control}
                render={({ field }) => (
                  <SelectField
                    label="Coupon Payment Frequency"
                    error={errors.coupon_payment_frequency?.message}
                    placeholder="Select frequency"
                    options={[
                      { value: '', label: 'Select frequency' },
                      { value: 'annual', label: 'Annual' },
                      { value: 'semi_annual', label: 'Semi-Annual' },
                      { value: 'quarterly', label: 'Quarterly' },
                      { value: 'monthly', label: 'Monthly' },
                    ]}
                    value={field.value || ''}
                    onChange={(value) => field.onChange(value || null)}
                  />
                )}
              />

              <Controller
                name="bond_type"
                control={control}
                render={({ field }) => (
                  <SelectField
                    label="Bond Type"
                    error={errors.bond_type?.message}
                    placeholder="Select bond type"
                    options={[
                      { value: '', label: 'Select type' },
                      { value: 'government', label: 'Government' },
                      { value: 'corporate', label: 'Corporate' },
                      { value: 'municipal', label: 'Municipal' },
                      { value: 'treasury', label: 'Treasury' },
                      { value: 'corporate_high_yield', label: 'Corporate High Yield' },
                    ]}
                    value={field.value || ''}
                    onChange={(value) => field.onChange(value || null)}
                  />
                )}
              />

              <Controller
                name="credit_rating"
                control={control}
                render={({ field }) => (
                  <SelectField
                    label="Credit Rating"
                    error={errors.credit_rating?.message}
                    placeholder="Select rating"
                    options={[
                      { value: '', label: 'Select rating' },
                      { value: 'AAA', label: 'AAA' },
                      { value: 'AA', label: 'AA' },
                      { value: 'A', label: 'A' },
                      { value: 'BBB', label: 'BBB' },
                      { value: 'BB', label: 'BB' },
                      { value: 'B', label: 'B' },
                      { value: 'CCC', label: 'CCC' },
                      { value: 'D', label: 'D' },
                    ]}
                    value={field.value || ''}
                    onChange={(value) => field.onChange(value || null)}
                  />
                )}
              />

              <InputField
                label="Yield to Maturity (%)"
                type="number"
                step="0.01"
                error={errors.yield_to_maturity?.message}
                {...register('yield_to_maturity', { valueAsNumber: true })}
              />

              <InputField
                label="Issue Date"
                type="date"
                error={errors.issue_date?.message}
                {...register('issue_date')}
              />

              <InputField
                label="Next Coupon Date"
                type="date"
                error={errors.next_coupon_date?.message}
                {...register('next_coupon_date')}
              />

              <Controller
                name="day_count_convention"
                control={control}
                render={({ field }) => (
                  <SelectField
                    label="Day Count Convention"
                    error={errors.day_count_convention?.message}
                    placeholder="Select convention"
                    options={[
                      { value: '', label: 'Select convention' },
                      { value: '30/360', label: '30/360' },
                      { value: 'actual/365', label: 'Actual/365' },
                      { value: 'actual/360', label: 'Actual/360' },
                    ]}
                    value={field.value || ''}
                    onChange={(value) => field.onChange(value || null)}
                  />
                )}
              />
            </Grid>

            <HStack justifyContent="flex-end" gap={4}>
              <Button variant="outline" onClick={() => navigate('/securities/bonds')}>
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={createMutation.isPending || updateMutation.isPending}
              >
                {isEditMode ? 'Update Bond' : 'Create Bond'}
              </Button>
            </HStack>
          </Stack>
        </form>
      </Stack>
    </Container>
  );
};

export default BondForm;

