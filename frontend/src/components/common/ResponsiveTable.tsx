import { ReactNode, useState } from 'react';
import {
  Table,
  Box,
  useBreakpointValue,
  AccordionRoot,
  AccordionItem,
  AccordionItemTrigger,
  AccordionItemContent,
  Card,
  IconButton,
} from '@chakra-ui/react';
import { LuChevronDown, LuChevronRight } from 'react-icons/lu';

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

export interface ExpandableConfig<T> {
  expandedContent: (item: T) => ReactNode;
  getExpandKey: (item: T) => string | number;
}

export interface ResponsiveTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  mobileConfig: MobileConfig<T>;
  variant?: 'outline' | 'simple' | 'striped';
  expandableConfig?: ExpandableConfig<T>;
}

function ResponsiveTable<T>({
  data,
  columns,
  mobileConfig,
  variant = 'outline',
  expandableConfig,
}: ResponsiveTableProps<T>) {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());

  const toggleRow = (key: string | number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

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
                {expandableConfig && (
                  <Box p={4} pt={0} borderTop="1px solid" borderColor="border.default">
                    {expandableConfig.expandedContent(item)}
                  </Box>
                )}
              </AccordionItemContent>
            </Card.Root>
          </AccordionItem>
        ))}
      </AccordionRoot>
    );
  }

  // Desktop view: Standard table with expandable rows
  return (
    <Table.Root variant={variant}>
      <Table.Header>
        <Table.Row>
          {expandableConfig && <Table.ColumnHeader width="40px" />}
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
          const expandKey = expandableConfig?.getExpandKey(item);
          const isExpanded = expandKey ? expandedRows.has(expandKey) : false;

          return (
            <>
              <Table.Row key={`row-${rowKey}`} _hover={{ bg: 'bg.muted' }}>
                {expandableConfig && (
                  <Table.Cell>
                    <IconButton
                      aria-label="Expand row"
                      size="sm"
                      variant="ghost"
                      onClick={() => expandKey && toggleRow(expandKey)}
                    >
                      {isExpanded ? <LuChevronDown /> : <LuChevronRight />}
                    </IconButton>
                  </Table.Cell>
                )}
                {columns.map((column, colIndex) => (
                  <Table.Cell key={`cell-${rowKey}-${colIndex}`} textAlign={column.textAlign}>
                    {column.cell(item)}
                  </Table.Cell>
                ))}
              </Table.Row>
              {expandableConfig && isExpanded && (
                <Table.Row key={`expanded-${rowKey}`}>
                  <Table.Cell colSpan={columns.length + 1}  p={0}>
                    {expandableConfig.expandedContent(item)}
                  </Table.Cell>
                </Table.Row>
              )}
            </>
          );
        })}
      </Table.Body>
    </Table.Root>
  );
}

export default ResponsiveTable;

