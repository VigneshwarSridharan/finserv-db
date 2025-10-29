import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { transactionsService } from '../../api/services/securities.service';
import { toaster } from '../../components/ui/toaster';
import { InputField, SelectField } from '../../components/common/FormField';
import type { CreateTransactionRequest } from '../../types/domain.types';

const transactionSchema = z.object({
  transaction_type: z.enum(['buy', 'sell', 'dividend', 'bonus', 'split'], {
    message: 'Please select a transaction type',
  }),
  transaction_date: z.string().min(1, 'Transaction date is required'),
  quantity: z.number({ message: 'Quantity must be a number' }).positive('Quantity must be positive'),
  price: z.number({ message: 'Price must be a number' }).positive('Price must be positive'),
  brokerage: z.number().optional().nullable(),
  taxes: z.number().optional().nullable(),
  other_charges: z.number().optional().nullable(),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface AddTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  holdingId: number;
  accountId: number;
  securityId: number;
  securityName: string;
  onSuccess?: () => void;
}

const AddTransactionDialog = ({
  isOpen,
  onClose,
  holdingId,
  accountId,
  securityId,
  securityName,
  onSuccess,
}: AddTransactionDialogProps) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      transaction_type: 'buy',
      brokerage: 0,
      taxes: 0,
      other_charges: 0,
    },
  });

  const quantity = watch('quantity');
  const price = watch('price');
  const brokerage = watch('brokerage') || 0;
  const taxes = watch('taxes') || 0;
  const otherCharges = watch('other_charges') || 0;

  // Calculate total_amount and net_amount
  const totalAmount = (quantity || 0) * (price || 0);
  const netAmount = totalAmount + brokerage + taxes + otherCharges;

  // Options for SelectField
  const transactionTypeOptions = [
    { value: 'buy', label: 'Buy' },
    { value: 'sell', label: 'Sell' },
    { value: 'dividend', label: 'Dividend' },
    { value: 'bonus', label: 'Bonus' },
    { value: 'split', label: 'Split' },
  ];

  const createMutation = useMutation({
    mutationFn: (data: CreateTransactionRequest) => transactionsService.create(data),
    onSuccess: () => {
      toaster.create({
        title: 'Transaction added successfully',
        type: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['holdings'] });
      queryClient.invalidateQueries({ queryKey: ['holdings', holdingId, 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      reset();
      onClose();
      onSuccess?.();
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Failed to add transaction',
        description: error?.response?.data?.message || error.message,
        type: 'error',
      });
    },
  });

  const onSubmit = (data: TransactionFormData) => {
    const requestData: CreateTransactionRequest = {
      account_id: accountId,
      security_id: securityId,
      transaction_type: data.transaction_type,
      transaction_date: data.transaction_date,
      quantity: data.quantity,
      price: data.price,
      total_amount: totalAmount,
      brokerage: data.brokerage || 0,
      taxes: data.taxes || 0,
      other_charges: data.other_charges || 0,
      net_amount: netAmount,
      notes: data.notes,
    };
    createMutation.mutate(requestData);
  };

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && onClose()} size="lg">
      <Portal>
        <DialogBackdrop />
        <DialogPositioner>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Transaction - {securityName}</DialogTitle>
              <DialogCloseTrigger />
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogBody>
                <Stack gap={4}>
                  <Controller
                    name="transaction_type"
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        label="Transaction Type"
                        error={errors.transaction_type?.message}
                        required
                        options={transactionTypeOptions}
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                      />
                    )}
                  />

                  <InputField
                    label="Transaction Date"
                    type="date"
                    error={errors.transaction_date?.message}
                    required
                    {...register('transaction_date')}
                  />

                  <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                    <InputField
                      label="Quantity"
                      type="number"
                      step="0.0001"
                      error={errors.quantity?.message}
                      required
                      {...register('quantity', { valueAsNumber: true })}
                    />

                    <InputField
                      label="Price per Unit"
                      type="number"
                      step="0.01"
                      error={errors.price?.message}
                      required
                      {...register('price', { valueAsNumber: true })}
                    />
                  </Grid>

                  <InputField
                    label="Total Amount"
                    type="text"
                    value={totalAmount.toFixed(2)}
                    disabled
                    helperText="Auto-calculated: Quantity × Price"
                  />

                  <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
                    <InputField
                      label="Brokerage"
                      type="number"
                      step="0.01"
                      error={errors.brokerage?.message}
                      {...register('brokerage', { valueAsNumber: true })}
                    />

                    <InputField
                      label="Taxes"
                      type="number"
                      step="0.01"
                      error={errors.taxes?.message}
                      {...register('taxes', { valueAsNumber: true })}
                    />

                    <InputField
                      label="Other Charges"
                      type="number"
                      step="0.01"
                      error={errors.other_charges?.message}
                      {...register('other_charges', { valueAsNumber: true })}
                    />
                  </Grid>

                  <InputField
                    label="Net Amount"
                    type="text"
                    value={netAmount.toFixed(2)}
                    disabled
                    helperText="Total Amount + Brokerage + Taxes + Other Charges"
                  />

                  <InputField
                    label="Notes"
                    error={errors.notes?.message}
                    {...register('notes')}
                  />
                </Stack>
              </DialogBody>

              <DialogFooter>
                <DialogActionTrigger asChild>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </DialogActionTrigger>
                <Button type="submit" colorScheme="blue" loading={createMutation.isPending}>
                  Add Transaction
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </DialogPositioner>
      </Portal>
    </DialogRoot>

  );
};

export default AddTransactionDialog;


