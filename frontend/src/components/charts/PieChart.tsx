import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Box, Text } from '@chakra-ui/react';
import { CHART_COLORS } from '../../utils/constants';

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
  if (!data || data.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="text.secondary">No data available</Text>
      </Box>
    );
  }

  return (
    <Box>
      {title && (
        <Text fontSize="md" fontWeight="semibold" mb={4}>
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
            label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
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
          <Tooltip />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default PieChart;

