import {
  Box,
  Table,
  Text,
} from '@chakra-ui/react';
import type { ReactNode } from 'react';
import EmptyState from './EmptyState';
import LoadingSpinner from './LoadingSpinner';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

function DataTable<T extends { [key: string]: any }>({
  columns,
  data,
  isLoading,
  emptyMessage = 'No data available',
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return <LoadingSpinner message="Loading data..." />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <Box overflowX="auto">
      <Table.Root variant="outline" size="sm">
        <Table.Header>
          <Table.Row>
            {columns.map((column) => (
              <Table.ColumnHeader key={column.key}>
                <Text fontWeight="semibold">{column.header}</Text>
              </Table.ColumnHeader>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.map((item, index) => (
            <Table.Row
              key={index}
              onClick={() => onRowClick?.(item)}
              cursor={onRowClick ? 'pointer' : 'default'}
              _hover={onRowClick ? { bg: 'bg.canvas' } : undefined}
              transition="background 0.2s"
            >
              {columns.map((column) => (
                <Table.Cell key={column.key}>
                  {column.render
                    ? column.render(item)
                    : item[column.key]?.toString() || '-'}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}

export default DataTable;

