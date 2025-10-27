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
  Portal,
  DialogBackdrop,
  DialogPositioner,
  Badge,
} from '@chakra-ui/react';
import { LuPlus, LuPencil, LuTrash2 } from 'react-icons/lu';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { assetCategoryService } from '../../api/services/assets.service';
import { toaster } from '../../components/ui/toaster';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { InputField, TextareaField, SelectField } from '../../components/common/FormField';
import type { AssetCategory, CreateAssetCategoryRequest } from '../../types/domain.types';

const categorySchema = z.object({
  category_name: z.string().min(1, 'Category name is required'),
  category_type: z.enum(['precious_metal', 'real_estate', 'commodity', 'collectible', 'other'], {
    message: 'Please select a category type',
  }),
  description: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

const CategoriesPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null);
  const queryClient = useQueryClient();

  const formatCategoryType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const { data: response, isLoading } = useQuery({
    queryKey: ['assetCategories'],
    queryFn: () => assetCategoryService.getAll(),
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
    mutationFn: assetCategoryService.create,
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
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateAssetCategoryRequest> }) =>
      assetCategoryService.update(id, data),
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
    mutationFn: assetCategoryService.delete,
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
      reset({
        category_name: category.category_name,
        category_type: category.category_type,
        description: category.description,
      });
    } else {
      setSelectedCategory(null);
      reset({ category_name: '', category_type: 'other', description: '' });
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
      updateMutation.mutate({ id: selectedCategory.category_id, data });
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
      deleteMutation.mutate(selectedCategory.category_id);
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
            actionLabel="Add Category"
            onAction={() => handleOpenDialog()}
          />
        ) : (
          <Table.Root variant="outline">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Name</Table.ColumnHeader>
                <Table.ColumnHeader>Type</Table.ColumnHeader>
                <Table.ColumnHeader>Description</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader>Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {categories.map((category) => (
                <Table.Row key={category.category_id}>
                  <Table.Cell fontWeight="medium">{category.category_name}</Table.Cell>
                  <Table.Cell>
                    <Badge colorScheme="blue">
                      {formatCategoryType(category.category_type)}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{category.description || '-'}</Table.Cell>
                  <Table.Cell>
                    <Badge colorScheme={category.is_active ? 'green' : 'gray'}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </Table.Cell>
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
        <Portal>
          <DialogBackdrop />
          <DialogPositioner>
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
                      label="Category Name"
                      required
                      error={errors.category_name?.message}
                      {...register('category_name')}
                    />
                    <SelectField
                      label="Category Type"
                      required
                      error={errors.category_type?.message}
                      {...register('category_type')}
                    >
                      <option value="precious_metal">Precious Metal</option>
                      <option value="real_estate">Real Estate</option>
                      <option value="commodity">Commodity</option>
                      <option value="collectible">Collectible</option>
                      <option value="other">Other</option>
                    </SelectField>
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
          </DialogPositioner>
        </Portal>
      </DialogRoot>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${selectedCategory?.category_name}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </Container>
  );
};

export default CategoriesPage;

