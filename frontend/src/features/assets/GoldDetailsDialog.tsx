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
import { InputField, SelectField } from '../../components/common/FormField';
import type { GoldDetail, CreateGoldDetailRequest } from '../../types/domain.types';

const goldSchema = z.object({
  gold_type: z.enum(['jewelry', 'coins', 'bars', 'etf', 'mutual_fund'], {
    message: 'Please select a gold type',
  }),
  purity: z.enum(['18K', '22K', '24K', '999', '995', '916'], {
    message: 'Please select purity',
  }),
  weight_grams: z.number({ message: 'Weight must be a number' }).positive('Weight must be positive'),
  making_charges: z.number().optional().nullable(),
  wastage_charges: z.number().optional().nullable(),
  hallmark_certificate: z.string().optional(),
  jeweler_name: z.string().optional(),
  purchase_bill_number: z.string().optional(),
  current_gold_rate_per_gram: z.number().optional().nullable(),
});

type GoldFormData = z.infer<typeof goldSchema>;

interface GoldDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: number;
  onSuccess?: () => void;
}

const GoldDetailsDialog = ({ isOpen, onClose, assetId, onSuccess }: GoldDetailsDialogProps) => {
  const queryClient = useQueryClient();

  const { data: detailsResponse, isLoading } = useQuery({
    queryKey: ['goldDetails', assetId],
    queryFn: () => assetService.getGoldDetails(assetId),
    enabled: isOpen && !!assetId,
  });

  const existingDetails = detailsResponse?.data;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GoldFormData>({
    resolver: zodResolver(goldSchema),
  });

  useEffect(() => {
    if (isOpen && existingDetails) {
      reset({
        gold_type: existingDetails.gold_type,
        purity: existingDetails.purity,
        weight_grams: parseFloat(existingDetails.weight_grams),
        making_charges: existingDetails.making_charges ? parseFloat(existingDetails.making_charges) : null,
        wastage_charges: existingDetails.wastage_charges ? parseFloat(existingDetails.wastage_charges) : null,
        hallmark_certificate: existingDetails.hallmark_certificate || '',
        jeweler_name: existingDetails.jeweler_name || '',
        purchase_bill_number: existingDetails.purchase_bill_number || '',
        current_gold_rate_per_gram: existingDetails.current_gold_rate_per_gram 
          ? parseFloat(existingDetails.current_gold_rate_per_gram) 
          : null,
      });
    } else if (isOpen && !isLoading) {
      reset({
        gold_type: 'jewelry',
        purity: '22K',
        weight_grams: 0,
        making_charges: null,
        wastage_charges: null,
        hallmark_certificate: '',
        jeweler_name: '',
        purchase_bill_number: '',
        current_gold_rate_per_gram: null,
      });
    }
  }, [isOpen, existingDetails, isLoading, reset]);

  const createMutation = useMutation({
    mutationFn: (data: CreateGoldDetailRequest) => assetService.addGoldDetails(assetId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goldDetails', assetId] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toaster.create({
        title: 'Gold details added successfully',
        type: 'success',
      });
      onSuccess?.();
      onClose();
    },
    onError: () => {
      toaster.create({
        title: 'Failed to add gold details',
        type: 'error',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateGoldDetailRequest>) => 
      assetService.updateGoldDetails(assetId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goldDetails', assetId] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toaster.create({
        title: 'Gold details updated successfully',
        type: 'success',
      });
      onSuccess?.();
      onClose();
    },
    onError: () => {
      toaster.create({
        title: 'Failed to update gold details',
        type: 'error',
      });
    },
  });

  const onSubmit = (data: GoldFormData) => {
    const payload: CreateGoldDetailRequest = {
      ...data,
      making_charges: data.making_charges || undefined,
      wastage_charges: data.wastage_charges || undefined,
      current_gold_rate_per_gram: data.current_gold_rate_per_gram || undefined,
    };

    if (existingDetails) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && onClose()} size="lg">
      <Portal>
        <DialogBackdrop />
        <DialogPositioner>
          <DialogContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>
                  {existingDetails ? 'Edit Gold Details' : 'Add Gold Details'}
                </DialogTitle>
              </DialogHeader>
              <DialogCloseTrigger />
              <DialogBody>
                <Stack gap={4}>
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                    <SelectField
                      label="Gold Type"
                      required
                      error={errors.gold_type?.message}
                      {...register('gold_type')}
                    >
                      <option value="jewelry">Jewelry</option>
                      <option value="coins">Coins</option>
                      <option value="bars">Bars</option>
                      <option value="etf">ETF</option>
                      <option value="mutual_fund">Mutual Fund</option>
                    </SelectField>

                    <SelectField
                      label="Purity"
                      required
                      error={errors.purity?.message}
                      {...register('purity')}
                    >
                      <option value="18K">18K</option>
                      <option value="22K">22K</option>
                      <option value="24K">24K</option>
                      <option value="916">916 (22K)</option>
                      <option value="995">995 (24K)</option>
                      <option value="999">999 (24K)</option>
                    </SelectField>
                  </Grid>

                  <InputField
                    label="Weight (grams)"
                    type="number"
                    step="0.0001"
                    required
                    error={errors.weight_grams?.message}
                    {...register('weight_grams', { valueAsNumber: true })}
                  />

                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                    <InputField
                      label="Making Charges"
                      type="number"
                      step="0.01"
                      error={errors.making_charges?.message}
                      {...register('making_charges', { 
                        setValueAs: (v) => v === '' || v === null ? null : Number(v)
                      })}
                    />

                    <InputField
                      label="Wastage Charges"
                      type="number"
                      step="0.01"
                      error={errors.wastage_charges?.message}
                      {...register('wastage_charges', { 
                        setValueAs: (v) => v === '' || v === null ? null : Number(v)
                      })}
                    />
                  </Grid>

                  <InputField
                    label="Hallmark Certificate Number"
                    error={errors.hallmark_certificate?.message}
                    {...register('hallmark_certificate')}
                  />

                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                    <InputField
                      label="Jeweler Name"
                      error={errors.jeweler_name?.message}
                      {...register('jeweler_name')}
                    />

                    <InputField
                      label="Purchase Bill Number"
                      error={errors.purchase_bill_number?.message}
                      {...register('purchase_bill_number')}
                    />
                  </Grid>

                  <InputField
                    label="Current Gold Rate (per gram)"
                    type="number"
                    step="0.01"
                    error={errors.current_gold_rate_per_gram?.message}
                    {...register('current_gold_rate_per_gram', { 
                      setValueAs: (v) => v === '' || v === null ? null : Number(v)
                    })}
                  />
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

export default GoldDetailsDialog;

