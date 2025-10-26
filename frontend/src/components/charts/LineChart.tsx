import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Box, Text } from '@chakra-ui/react';

interface LineChartData {
  [key: string]: string | number;
}

interface LineChartProps {
  data: LineChartData[];
  xKey: string;
  yKey: string;
  height?: number;
  title?: string;
  color?: string;
}

const LineChart = ({
  data,
  xKey,
  yKey,
  height = 300,
  title,
  color = '#3182CE',
}: LineChartProps) => {
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
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey={yKey}
            stroke={color}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default LineChart;


