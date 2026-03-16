// Generate a simple unique ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Format currency (INR)
export function formatCurrency(amount) {
  if (amount === undefined || amount === null) return '₹0.00';
  return '₹' + Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Calculate gateway fee for a given amount and payment method
export function calculateFee(gateway, method, amount) {
  const feeConfig = gateway.fees[method];
  if (!feeConfig) return 0;
  return (amount * feeConfig.percentage) / 100 + feeConfig.flat;
}

// Calculate total cost (amount + fee)
export function calculateTotal(gateway, method, amount) {
  const fee = calculateFee(gateway, method, amount);
  return amount + fee;
}

// Format date
export function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Format short date
export function formatShortDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Get status color
export function getStatusColor(status) {
  switch (status) {
    case 'success': return '#34A853';
    case 'failed': return '#EA4335';
    case 'pending': return '#FBBC04';
    case 'refunded': return '#1A73E8';
    default: return '#9AA0A6';
  }
}

// Calculate security score as percentage
export function getSecurityPercentage(rating) {
  return (rating / 5) * 100;
}

// Render star rating as text
export function renderStarRating(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

// Group transactions by date
export function groupByDate(transactions) {
  const groups = {};
  transactions.forEach((txn) => {
    const dateKey = formatShortDate(txn.timestamp);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(txn);
  });
  return groups;
}

// Calculate summary statistics from transactions
export function calculateStats(transactions) {
  const total = transactions.length;
  const successful = transactions.filter((t) => t.status === 'success');
  const failed = transactions.filter((t) => t.status === 'failed');
  const pending = transactions.filter((t) => t.status === 'pending');

  const totalAmount = successful.reduce((sum, t) => sum + t.amount, 0);
  const totalFees = successful.reduce((sum, t) => sum + (t.fee || 0), 0);
  const avgTransaction = successful.length > 0 ? totalAmount / successful.length : 0;

  // Gateway breakdown
  const gatewayBreakdown = {};
  transactions.forEach((t) => {
    if (!gatewayBreakdown[t.gatewayId]) {
      gatewayBreakdown[t.gatewayId] = { count: 0, amount: 0, fees: 0 };
    }
    gatewayBreakdown[t.gatewayId].count++;
    if (t.status === 'success') {
      gatewayBreakdown[t.gatewayId].amount += t.amount;
      gatewayBreakdown[t.gatewayId].fees += t.fee || 0;
    }
  });

  // Method breakdown
  const methodBreakdown = {};
  transactions.forEach((t) => {
    if (!methodBreakdown[t.method]) {
      methodBreakdown[t.method] = { count: 0, amount: 0 };
    }
    methodBreakdown[t.method].count++;
    if (t.status === 'success') {
      methodBreakdown[t.method].amount += t.amount;
    }
  });

  return {
    total,
    successCount: successful.length,
    failedCount: failed.length,
    pendingCount: pending.length,
    successRate: total > 0 ? ((successful.length / total) * 100).toFixed(1) : 0,
    totalAmount,
    totalFees,
    avgTransaction,
    gatewayBreakdown,
    methodBreakdown,
  };
}
