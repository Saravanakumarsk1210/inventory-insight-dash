
export const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(numValue);
};

export const formatDate = (dateString: string): string => {
  // Parsing date in DD-MMM-YY format
  const months: Record<string, number> = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };
  
  const [day, monthStr, year] = dateString.split('-');
  const month = months[monthStr];
  const fullYear = parseInt(`20${year}`);
  
  const date = new Date(fullYear, month, parseInt(day));
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

export const calculateDaysUntilExpiry = (expiryDate: string): number => {
  const months: Record<string, number> = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };
  
  const [day, monthStr, year] = expiryDate.split('-');
  const month = months[monthStr];
  const fullYear = parseInt(`20${year}`);
  
  const expiryDateTime = new Date(fullYear, month, parseInt(day)).getTime();
  const today = new Date().getTime();
  
  return Math.floor((expiryDateTime - today) / (1000 * 60 * 60 * 24));
};

export const getExpiryStatus = (daysUntilExpiry: number): string => {
  if (daysUntilExpiry < 0) {
    return 'expired';
  } else if (daysUntilExpiry < 90) {
    return 'expiring-soon';
  } else if (daysUntilExpiry < 180) {
    return 'attention';
  } else {
    return 'good';
  }
};

export const getUniqueProductNames = (data: any[]): string[] => {
  const uniqueNames = new Set<string>();
  
  data.forEach(item => {
    // Extract base product name without package info
    const nameMatch = item.particulars.match(/^([^-]+)/);
    if (nameMatch) {
      uniqueNames.add(nameMatch[0].trim());
    }
  });
  
  return Array.from(uniqueNames);
};
