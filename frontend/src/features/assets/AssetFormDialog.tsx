import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { assetService, assetCategoryService } from '../../api/services/assets.service';
import { toaster } from '../../components/ui/toaster';
import { InputField, TextareaField, SelectField } from '../../components/common/FormField';
import type { Asset, CreateAssetRequest } from '../../types/domain.types';

const assetSchema = z.object({
  asset_name: z.string().min(1, 'Asset name is required'),
  category_id: z.number({ message: 'Please select a category' }),
  subcategory_id: z.number().optional().nullable(),
  description: z.string().optional(),
  purchase_date: z.string().min(1, 'Purchase date is required'),
  purchase_price: z.number({ message: 'Purchase price must be a number' }).positive('Purchase price must be positive'),
  current_value: z.number().optional().nullable(),
  quantity: z.number().positive('Quantity must be positive').default(1),
  unit: z.string().min(1, 'Unit is required'),
  location: z.string().optional(),
  storage_location: z.string().optional(),
  insurance_policy_number: z.string().optional(),
  insurance_company: z.string().optional(),
  insurance_amount: z.number().optional().nullable(),
  insurance_expiry_date: z.string().optional(),
});

type AssetFormData = z.infer<typeof assetSchema>;

interface AssetFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  asset?: Asset | null;
  defaultCategoryId?: number;
  onSuccess?: () => void;
}

const AssetFormDialog = ({ isOpen, onClose, asset, defaultCategoryId, onSuccess }: AssetFormDialogProps) => {
  const queryClient = useQueryClient();

  const { data: categoriesResponse } = useQuery({
    queryKey: ['assetCategories'],
    queryFn: () => assetCategoryService.getAll(),
  });

  const categories = categoriesResponse?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      quantity: 1,
      unit: 'piece',
    },
  });

  const categoryId = watch('category_id');

  // Filter subcategories based on selected category
  const subcategories = categories
    .find((cat) => cat.category_id === categoryId)
    ?.subcategories || [];

  useEffect(() => {
    if (isOpen) {
      if (asset) {
        // Editing existing asset
        reset({
          asset_name: asset.asset_name,
          category_id: asset.category_id,
          subcategory_id: asset.subcategory_id || null,
          description: asset.description || '',
          purchase_date: asset.purchase_date || '',
          purchase_price: parseFloat(asset.purchase_price),
          current_value: asset.current_value ? parseFloat(asset.current_value) : null,
          quantity: asset.quantity ? parseFloat(asset.quantity) : 1,
          unit: asset.unit || 'piece',
          location: asset.location || '',
          storage_location: asset.storage_location || '',
          insurance_policy_number: asset.insurance_policy_number || '',
          insurance_company: asset.insurance_company || '',
          insurance_amount: asset.insurance_amount ? parseFloat(asset.insurance_amount) : null,
          insurance_expiry_date: asset.insurance_expiry_date || '',
        });
      } else {
        // Creating new asset
        reset({
          asset_name: '',
          category_id: defaultCategoryId,
          subcategory_id: null,
          description: '',
          purchase_date: '',
          purchase_price: 0,
          current_value: null,
          quantity: 1,
          unit: 'piece',
          location: '',
          storage_location: '',
          insurance_policy_number: '',
          insurance_company: '',
          insurance_amount: null,
          insurance_expiry_date: '',
        });
      }
    }
  }, [isOpen, asset, defaultCategoryId, reset]);

  const createMutation = useMutation({
    mutationFn: assetService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toaster.create({
        title: 'Asset created successfully',
        type: 'success',
      });
      onSuccess?.();
      onClose();
    },
    onError: () => {
      toaster.create({
        title: 'Failed to create asset',
        type: 'error',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateAssetRequest> }) =>
      assetService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toaster.create({
        title: 'Asset updated successfully',
        type: 'success',
      });
      onSuccess?.();
      onClose();
    },
    onError: () => {
      toaster.create({
        title: 'Failed to update asset',
        type: 'error',
      });
    },
  });

  const onSubmit = (data: AssetFormData) => {
    const payload: CreateAssetRequest = {
      ...data,
      subcategory_id: data.subcategory_id || undefined,
      current_value: data.current_value || undefined,
      insurance_amount: data.insurance_amount || undefined,
    };

    if (asset) {
      updateMutation.mutate({ id: asset.asset_id, data: payload });
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
                <DialogTitle>{asset ? 'Edit Asset' : 'Add Asset'}</DialogTitle>
              </DialogHeader>
              <DialogCloseTrigger />
              <DialogBody>
                <Stack gap={4}>
                  <InputField
                    label="Asset Name"
                    required
                    error={errors.asset_name?.message}
                    {...register('asset_name')}
                  />

                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                    <SelectField
                      label="Category"
                      required
                      error={errors.category_id?.message}
                      disabled={!!defaultCategoryId}
                      {...register('category_id', { valueAsNumber: true })}
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.category_id} value={cat.category_id}>
                          {cat.category_name}
                        </option>
                      ))}
                    </SelectField>

                    <SelectField
                      label="Subcategory"
                      error={errors.subcategory_id?.message}
                      {...register('subcategory_id', { 
                        setValueAs: (v) => v === '' || v === null ? null : Number(v)
                      })}
                    >
                      <option value="">None</option>
                      {subcategories.map((sub: any) => (
                        <option key={sub.subcategory_id} value={sub.subcategory_id}>
                          {sub.subcategory_name}
                        </option>
                      ))}
                    </SelectField>
                  </Grid>

                  <TextareaField
                    label="Description"
                    error={errors.description?.message}
                    {...register('description')}
                  />

                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                    <InputField
                      label="Purchase Date"
                      type="date"
                      required
                      error={errors.purchase_date?.message}
                      {...register('purchase_date')}
                    />

                    <InputField
                      label="Purchase Price"
                      type="number"
                      step="0.01"
                      required
                      error={errors.purchase_price?.message}
                      {...register('purchase_price', { valueAsNumber: true })}
                    />
                  </Grid>

                  <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
                    <InputField
                      label="Current Value"
                      type="number"
                      step="0.01"
                      error={errors.current_value?.message}
                      {...register('current_value', { 
                        setValueAs: (v) => v === '' || v === null ? null : Number(v)
                      })}
                    />

                    <InputField
                      label="Quantity"
                      type="number"
                      step="0.0001"
                      required
                      error={errors.quantity?.message}
                      {...register('quantity', { valueAsNumber: true })}
                    />

                    <InputField
                      label="Unit"
                      required
                      error={errors.unit?.message}
                      {...register('unit')}
                    />
                  </Grid>

                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                    <InputField
                      label="Location"
                      error={errors.location?.message}
                      {...register('location')}
                    />

                    <InputField
                      label="Storage Location"
                      error={errors.storage_location?.message}
                      {...register('storage_location')}
                    />
                  </Grid>

                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                    <InputField
                      label="Insurance Policy Number"
                      error={errors.insurance_policy_number?.message}
                      {...register('insurance_policy_number')}
                    />

                    <InputField
                      label="Insurance Company"
                      error={errors.insurance_company?.message}
                      {...register('insurance_company')}
                    />
                  </Grid>

                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                    <InputField
                      label="Insurance Amount"
                      type="number"
                      step="0.01"
                      error={errors.insurance_amount?.message}
                      {...register('insurance_amount', { 
                        setValueAs: (v) => v === '' || v === null ? null : Number(v)
                      })}
                    />

                    <InputField
                      label="Insurance Expiry Date"
                      type="date"
                      error={errors.insurance_expiry_date?.message}
                      {...register('insurance_expiry_date')}
                    />
                  </Grid>
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
                  {asset ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </DialogPositioner>
      </Portal>
    </DialogRoot>
  );
};

export default AssetFormDialog;

