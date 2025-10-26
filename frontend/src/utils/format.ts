import { format, parseISO } from 'date-fns';

// Currency formatting
export const formatCurrency = (value: string | number, currency = '₹'): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return `${currency}0.00`;
  
  return `${currency}${numValue.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Percentage formatting
export const formatPercentage = (value: string | number, decimals = 2): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '0.00%';
  
  return `${numValue.toFixed(decimals)}%`;
};

// Date formatting
export const formatDate = (date: string | Date, formatStr = 'MMM dd, yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch {
    return 'Invalid date';
  }
};

// Date time formatting
export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'MMM dd, yyyy hh:mm a');
};

// Number formatting
export const formatNumber = (value: string | number, decimals = 0): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '0';
  
  return numValue.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// Compact number formatting (1K, 1M, 1B)
export const formatCompactNumber = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '0';
  
  if (numValue >= 1e9) return `${(numValue / 1e9).toFixed(2)}B`;
  if (numValue >= 1e7) return `${(numValue / 1e7).toFixed(2)}Cr`;
  if (numValue >= 1e5) return `${(numValue / 1e5).toFixed(2)}L`;
  if (numValue >= 1e3) return `${(numValue / 1e3).toFixed(2)}K`;
  return numValue.toFixed(2);
};

// P&L color based on value
export const getPnLColor = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue) || numValue === 0) return 'gray.500';
  return numValue > 0 ? 'green.500' : 'red.500';
};

// Status badge color
export const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    ACTIVE: 'green',
    MATURED: 'blue',
    CLOSED: 'gray',
    PENDING: 'yellow',
    COMPLETED: 'green',
    FAILED: 'red',
    TRIGGERED: 'orange',
  };
  return statusMap[status.toUpperCase()] || 'gray';
};



