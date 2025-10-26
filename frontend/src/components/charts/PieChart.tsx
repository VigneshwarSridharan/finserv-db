import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Box, Text } from '@chakra-ui/react';
import { CHART_COLORS } from '../../utils/constants';
import { useColorMode } from '../ui/color-mode';

interface PieChartData {
  name: string;
  value: number;
  color?: string;
  [key: string]: any;
}

interface PieChartProps {
  data: PieChartData[];
  height?: number;
  title?: string;
}

const PieChart = ({ data, height = 300, title }: PieChartProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  
  if (!data || data.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="text.secondary">No data available</Text>
      </Box>
    );
  }

  // Custom label with theme-aware colors
  const renderLabel = ({ name, percent }: any) => {
    return `${name} ${((percent as number) * 100).toFixed(0)}%`;
  };

  // Custom tooltip with theme-aware styling
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          bg={isDark ? 'gray.800' : 'white'}
          border="1px"
          borderColor={isDark ? 'gray.700' : 'gray.200'}
          borderRadius="md"
          p={3}
          shadow="lg"
        >
          <Text fontSize="sm" fontWeight="semibold" color="text.primary">
            {payload[0].name}
          </Text>
          <Text fontSize="sm" color="text.secondary">
            Value: ₹{payload[0].value.toLocaleString('en-IN')}
          </Text>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box>
      {title && (
        <Text fontSize="md" fontWeight="semibold" mb={4} color="text.primary">
          {title}
        </Text>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{
              color: isDark ? '#E2E8F0' : '#2D3748',
            }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default PieChart;

