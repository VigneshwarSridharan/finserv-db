import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Box, Text } from '@chakra-ui/react';

interface BarChartData {
  [key: string]: string | number;
}

interface BarChartProps {
  data: BarChartData[];
  xKey: string;
  yKey: string;
  height?: number;
  title?: string;
  color?: string;
}

const BarChart = ({
  data,
  xKey,
  yKey,
  height = 300,
  title,
  color = '#3182CE',
}: BarChartProps) => {
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
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={yKey} fill={color} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default BarChart;


