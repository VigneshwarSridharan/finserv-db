import { ReactNode } from 'react';
import {
  Table,
  Box,
  useBreakpointValue,
  AccordionRoot,
  AccordionItem,
  AccordionItemTrigger,
  AccordionItemContent,
  Card,
} from '@chakra-ui/react';

export interface ColumnDef<T> {
  header: string;
  cell: (item: T) => ReactNode;
  textAlign?: 'left' | 'right' | 'center';
}

export interface MobileConfig<T> {
  summaryRender: (item: T) => ReactNode;
  detailsRender: (item: T) => ReactNode;
  getKey: (item: T, index: number) => string | number;
}

export interface ResponsiveTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  mobileConfig: MobileConfig<T>;
  variant?: 'outline' | 'simple' | 'striped';
}

function ResponsiveTable<T>({
  data,
  columns,
  mobileConfig,
  variant = 'outline',
}: ResponsiveTableProps<T>) {
  const isMobile = useBreakpointValue({ base: true, md: false });

  if (isMobile) {
    // Mobile view: Accordion cards
    return (
      <AccordionRoot collapsible multiple>
        {data.map((item, index) => (
          <AccordionItem
            key={mobileConfig.getKey(item, index)}
            value={mobileConfig.getKey(item, index)?.toString() ?? ''}
          >
            <Card.Root mb={3}>
              <AccordionItemTrigger
                p={4}
                cursor="pointer"
                _hover={{ bg: 'bg.muted' }}
                transition="background 0.2s"
              >
                {mobileConfig.summaryRender(item)}
              </AccordionItemTrigger>
              <AccordionItemContent>
                <Box p={4} pt={0} borderTop="1px solid" borderColor="border.default">
                  {mobileConfig.detailsRender(item)}
                </Box>
              </AccordionItemContent>
            </Card.Root>
          </AccordionItem>
        ))}
      </AccordionRoot>
    );
  }

  // Desktop view: Standard table
  return (
    <Table.Root variant={variant}>
      <Table.Header>
        <Table.Row>
          {columns.map((column, index) => (
            <Table.ColumnHeader key={`header-${index}`} textAlign={column.textAlign}>
              {column.header}
            </Table.ColumnHeader>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {data.map((item, index) => {
          const rowKey = mobileConfig.getKey(item, index);
          return (
            <Table.Row key={`row-${rowKey}`}>
              {columns.map((column, colIndex) => (
                <Table.Cell key={`cell-${rowKey}-${colIndex}`} textAlign={column.textAlign}>
                  {column.cell(item)}
                </Table.Cell>
              ))}
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table.Root>
  );
}

export default ResponsiveTable;

