import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Heading,
  Stack,
  Button,
  Table,
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogCloseTrigger,
  DialogActionTrigger,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import { LuPlus, LuPencil, LuTrash2 } from 'react-icons/lu';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { assetCategoriesService } from '../../api/services/assets.service';
import { toaster } from '../../components/ui/toaster';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { InputField, TextareaField } from '../../components/common/FormField';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface AssetCategory {
  id: number;
  name: string;
  description?: string;
  asset_count?: number;
}

const CategoriesPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null);
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['assetCategories'],
    queryFn: () => assetCategoriesService.getAll(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  const createMutation = useMutation({
    mutationFn: assetCategoriesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assetCategories'] });
      toaster.create({
        title: 'Category created successfully',
        type: 'success',
      });
      handleCloseDialog();
    },
    onError: () => {
      toaster.create({
        title: 'Failed to create category',
        type: 'error',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryFormData }) =>
      assetCategoriesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assetCategories'] });
      toaster.create({
        title: 'Category updated successfully',
        type: 'success',
      });
      handleCloseDialog();
    },
    onError: () => {
      toaster.create({
        title: 'Failed to update category',
        type: 'error',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: assetCategoriesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assetCategories'] });
      toaster.create({
        title: 'Category deleted successfully',
        type: 'success',
      });
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
    },
    onError: () => {
      toaster.create({
        title: 'Failed to delete category',
        type: 'error',
      });
    },
  });

  const handleOpenDialog = (category?: AssetCategory) => {
    if (category) {
      setSelectedCategory(category);
      reset(category);
    } else {
      setSelectedCategory(null);
      reset({ name: '', description: '' });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedCategory(null);
    reset();
  };

  const onSubmit = (data: CategoryFormData) => {
    if (selectedCategory) {
      updateMutation.mutate({ id: selectedCategory.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (category: AssetCategory) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedCategory) {
      deleteMutation.mutate(selectedCategory.id);
    }
  };

  const categories: AssetCategory[] = response?.data || [];

  if (isLoading) return <LoadingSpinner />;

  return (
    <Container maxW="7xl" py={8}>
      <Stack gap={6}>
        <HStack justifyContent="space-between">
          <Heading size="lg">Asset Categories</Heading>
          <Button colorScheme="blue" onClick={() => handleOpenDialog()}>
            <LuPlus /> Add Category
          </Button>
        </HStack>

        {categories.length === 0 ? (
          <EmptyState
            title="No categories yet"
            description="Create your first asset category"
            action={
              <Button colorScheme="blue" onClick={() => handleOpenDialog()}>
                <LuPlus /> Add Category
              </Button>
            }
          />
        ) : (
          <Table.Root variant="outline">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Name</Table.ColumnHeader>
                <Table.ColumnHeader>Description</Table.ColumnHeader>
                <Table.ColumnHeader>Assets Count</Table.ColumnHeader>
                <Table.ColumnHeader>Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {categories.map((category) => (
                <Table.Row key={category.id}>
                  <Table.Cell fontWeight="medium">{category.name}</Table.Cell>
                  <Table.Cell>{category.description || '-'}</Table.Cell>
                  <Table.Cell>{category.asset_count || 0}</Table.Cell>
                  <Table.Cell>
                    <HStack gap={2}>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenDialog(category)}
                      >
                        <LuPencil />
                      </IconButton>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDelete(category)}
                      >
                        <LuTrash2 />
                      </IconButton>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Stack>

      <DialogRoot open={isDialogOpen} onOpenChange={(e) => !e.open && handleCloseDialog()}>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                {selectedCategory ? 'Edit Category' : 'Add Category'}
              </DialogTitle>
            </DialogHeader>
            <DialogCloseTrigger />
            <DialogBody>
              <Stack gap={4}>
                <InputField
                  label="Name"
                  required
                  error={errors.name?.message}
                  {...register('name')}
                />
                <TextareaField
                  label="Description"
                  error={errors.description?.message}
                  {...register('description')}
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
                {selectedCategory ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogRoot>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${selectedCategory?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </Container>
  );
};

export default CategoriesPage;

