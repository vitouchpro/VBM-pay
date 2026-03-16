import StorageService from './StorageService';
import { calculateStats, formatCurrency, formatDate, formatShortDate, generateId } from '../utils/helpers';
import { PAYMENT_GATEWAYS, PAYMENT_METHODS } from '../constants/gateways';

class ReportService {
  async generateReport(startDate, endDate, filters = {}) {
    const transactions = await StorageService.getTransactionsByDateRange(startDate, endDate);

    let filtered = transactions;
    if (filters.gatewayId) {
      filtered = filtered.filter((t) => t.gatewayId === filters.gatewayId);
    }
    if (filters.method) {
      filtered = filtered.filter((t) => t.method === filters.method);
    }
    if (filters.status) {
      filtered = filtered.filter((t) => t.status === filters.status);
    }

    const stats = calculateStats(filtered);

    const report = {
      id: generateId(),
      title: `Payment Report`,
      dateRange: {
        start: startDate,
        end: endDate,
      },
      generatedAt: new Date().toISOString(),
      filters,
      stats,
      transactions: filtered,
      transactionCount: filtered.length,
    };

    await StorageService.saveReport(report);
    return report;
  }

  // Generate plain text report for sharing
  formatReportAsText(report) {
    const lines = [];
    lines.push('═══════════════════════════════════════');
    lines.push('          VBMPay Payment Report         ');
    lines.push('═══════════════════════════════════════');
    lines.push('');
    lines.push(`Generated: ${formatDate(report.generatedAt)}`);
    lines.push(`Period: ${formatShortDate(report.dateRange.start)} - ${formatShortDate(report.dateRange.end)}`);
    lines.push('');
    lines.push('─── Summary ───────────────────────────');
    lines.push(`Total Transactions: ${report.stats.total}`);
    lines.push(`Successful: ${report.stats.successCount}`);
    lines.push(`Failed: ${report.stats.failedCount}`);
    lines.push(`Pending: ${report.stats.pendingCount}`);
    lines.push(`Success Rate: ${report.stats.successRate}%`);
    lines.push('');
    lines.push(`Total Amount: ${formatCurrency(report.stats.totalAmount)}`);
    lines.push(`Total Fees Paid: ${formatCurrency(report.stats.totalFees)}`);
    lines.push(`Average Transaction: ${formatCurrency(report.stats.avgTransaction)}`);
    lines.push('');

    // Gateway breakdown
    lines.push('─── Gateway Breakdown ─────────────────');
    Object.entries(report.stats.gatewayBreakdown).forEach(([gId, data]) => {
      const gw = PAYMENT_GATEWAYS.find((g) => g.id === gId);
      const name = gw ? gw.name : gId;
      lines.push(`  ${name}:`);
      lines.push(`    Transactions: ${data.count}`);
      lines.push(`    Amount: ${formatCurrency(data.amount)}`);
      lines.push(`    Fees: ${formatCurrency(data.fees)}`);
    });
    lines.push('');

    // Method breakdown
    lines.push('─── Payment Method Breakdown ──────────');
    Object.entries(report.stats.methodBreakdown).forEach(([method, data]) => {
      const m = PAYMENT_METHODS[method];
      const name = m ? m.name : method;
      lines.push(`  ${name}: ${data.count} txns, ${formatCurrency(data.amount)}`);
    });
    lines.push('');

    // Transaction list
    if (report.transactions.length > 0) {
      lines.push('─── Transaction Details ───────────────');
      report.transactions.forEach((t, i) => {
        lines.push(`  ${i + 1}. ${t.referenceId}`);
        lines.push(`     ${formatDate(t.timestamp)} | ${t.gatewayName}`);
        lines.push(`     ${formatCurrency(t.amount)} + ${formatCurrency(t.fee)} fee | ${t.status.toUpperCase()}`);
        if (t.recipient) lines.push(`     To: ${t.recipient}`);
      });
    }

    lines.push('');
    lines.push('═══════════════════════════════════════');
    lines.push('         Powered by VBMPay App          ');
    lines.push('═══════════════════════════════════════');

    return lines.join('\n');
  }

  // Generate HTML report for PDF export
  formatReportAsHTML(report) {
    const statusBadge = (status) => {
      const colors = { success: '#34A853', failed: '#EA4335', pending: '#FBBC04', refunded: '#1A73E8' };
      return `<span style="background:${colors[status] || '#9AA0A6'};color:#fff;padding:2px 8px;border-radius:4px;font-size:12px;">${status.toUpperCase()}</span>`;
    };

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; color: #202124; }
    h1 { color: #1A73E8; border-bottom: 2px solid #1A73E8; padding-bottom: 10px; }
    h2 { color: #3C4043; margin-top: 24px; }
    .meta { color: #5F6368; font-size: 14px; }
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 16px 0; }
    .stat-card { background: #F8F9FA; padding: 16px; border-radius: 8px; }
    .stat-value { font-size: 24px; font-weight: 700; color: #1A73E8; }
    .stat-label { font-size: 12px; color: #5F6368; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #DADCE0; font-size: 13px; }
    th { background: #F1F3F4; font-weight: 600; }
    .text-right { text-align: right; }
    .footer { margin-top: 32px; text-align: center; color: #9AA0A6; font-size: 12px; }
  </style>
</head>
<body>
  <h1>VBMPay Payment Report</h1>
  <p class="meta">Generated: ${formatDate(report.generatedAt)}</p>
  <p class="meta">Period: ${formatShortDate(report.dateRange.start)} to ${formatShortDate(report.dateRange.end)}</p>

  <h2>Summary</h2>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value">${report.stats.total}</div>
      <div class="stat-label">Total Transactions</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${report.stats.successRate}%</div>
      <div class="stat-label">Success Rate</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${formatCurrency(report.stats.totalAmount)}</div>
      <div class="stat-label">Total Amount</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${formatCurrency(report.stats.totalFees)}</div>
      <div class="stat-label">Total Fees</div>
    </div>
  </div>

  <h2>Transactions</h2>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Reference</th>
        <th>Date</th>
        <th>Gateway</th>
        <th>Method</th>
        <th class="text-right">Amount</th>
        <th class="text-right">Fee</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${report.transactions.map((t, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${t.referenceId}</td>
        <td>${formatDate(t.timestamp)}</td>
        <td>${t.gatewayName}</td>
        <td>${t.method}</td>
        <td class="text-right">${formatCurrency(t.amount)}</td>
        <td class="text-right">${formatCurrency(t.fee)}</td>
        <td>${statusBadge(t.status)}</td>
      </tr>`).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>Powered by VBMPay — Smart Payment Gateway Management</p>
  </div>
</body>
</html>`;
  }
}

export default new ReportService();
