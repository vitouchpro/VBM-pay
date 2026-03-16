import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useApp } from '../context/AppContext';
import ReportService from '../services/ReportService';
import Button from '../components/Button';
import Card from '../components/Card';
import { formatCurrency, formatDate, formatShortDate } from '../utils/helpers';

export default function ReportsScreen() {
  const { transactions } = useApp();
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState(null);
  const [period, setPeriod] = useState('week'); // 'week', 'month', 'all'

  function getDateRange() {
    const end = new Date();
    const start = new Date();
    if (period === 'week') {
      start.setDate(start.getDate() - 7);
    } else if (period === 'month') {
      start.setMonth(start.getMonth() - 1);
    } else {
      start.setFullYear(2020, 0, 1); // All time
    }
    return { start: start.toISOString(), end: end.toISOString() };
  }

  async function handleGenerate() {
    if (transactions.length === 0) {
      Alert.alert('No Data', 'No transactions available to generate a report.');
      return;
    }

    setGenerating(true);
    try {
      const { start, end } = getDateRange();
      const rep = await ReportService.generateReport(start, end);
      setReport(rep);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  }

  async function handleShare() {
    if (!report) return;
    try {
      const text = ReportService.formatReportAsText(report);
      await Share.share({
        message: text,
        title: 'VBMPay Payment Report',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share report');
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Reports</Text>
      <Text style={styles.subtitle}>Generate and share detailed payment reports</Text>

      {/* Period Selection */}
      <View style={styles.periodRow}>
        {[
          { key: 'week', label: 'Last 7 Days' },
          { key: 'month', label: 'Last 30 Days' },
          { key: 'all', label: 'All Time' },
        ].map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[styles.periodChip, period === p.key && styles.periodChipActive]}
            onPress={() => { setPeriod(p.key); setReport(null); }}
          >
            <Text style={[styles.periodText, period === p.key && styles.periodTextActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        title="Generate Report"
        onPress={handleGenerate}
        loading={generating}
        style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.lg }}
        size="large"
      />

      {/* Report Display */}
      {report && (
        <>
          {/* Summary Cards */}
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryGrid}>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{report.stats.total}</Text>
              <Text style={styles.summaryLabel}>Total Txns</Text>
            </Card>
            <Card style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                {report.stats.successRate}%
              </Text>
              <Text style={styles.summaryLabel}>Success Rate</Text>
            </Card>
            <Card style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { fontSize: 16 }]}>
                {formatCurrency(report.stats.totalAmount)}
              </Text>
              <Text style={styles.summaryLabel}>Volume</Text>
            </Card>
            <Card style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { fontSize: 16, color: COLORS.danger }]}>
                {formatCurrency(report.stats.totalFees)}
              </Text>
              <Text style={styles.summaryLabel}>Fees Paid</Text>
            </Card>
          </View>

          {/* Breakdown Stats */}
          <Card style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>Status Breakdown</Text>
            <View style={styles.breakdownRow}>
              <View style={[styles.breakdownItem, { borderLeftColor: COLORS.success }]}>
                <Text style={styles.breakdownCount}>{report.stats.successCount}</Text>
                <Text style={styles.breakdownLabel}>Successful</Text>
              </View>
              <View style={[styles.breakdownItem, { borderLeftColor: COLORS.danger }]}>
                <Text style={styles.breakdownCount}>{report.stats.failedCount}</Text>
                <Text style={styles.breakdownLabel}>Failed</Text>
              </View>
              <View style={[styles.breakdownItem, { borderLeftColor: COLORS.warning }]}>
                <Text style={styles.breakdownCount}>{report.stats.pendingCount}</Text>
                <Text style={styles.breakdownLabel}>Pending</Text>
              </View>
            </View>
          </Card>

          {/* Gateway Breakdown */}
          {Object.keys(report.stats.gatewayBreakdown).length > 0 && (
            <Card style={styles.breakdownCard}>
              <Text style={styles.breakdownTitle}>Gateway Breakdown</Text>
              {Object.entries(report.stats.gatewayBreakdown).map(([gId, data]) => (
                <View key={gId} style={styles.gwRow}>
                  <Text style={styles.gwName}>{gId}</Text>
                  <View style={styles.gwStats}>
                    <Text style={styles.gwStat}>{data.count} txns</Text>
                    <Text style={styles.gwStat}>{formatCurrency(data.amount)}</Text>
                    <Text style={[styles.gwStat, { color: COLORS.danger }]}>
                      Fee: {formatCurrency(data.fees)}
                    </Text>
                  </View>
                </View>
              ))}
            </Card>
          )}

          {/* Method Breakdown */}
          {Object.keys(report.stats.methodBreakdown).length > 0 && (
            <Card style={styles.breakdownCard}>
              <Text style={styles.breakdownTitle}>Payment Method Breakdown</Text>
              {Object.entries(report.stats.methodBreakdown).map(([method, data]) => (
                <View key={method} style={styles.gwRow}>
                  <Text style={styles.gwName}>{method.toUpperCase()}</Text>
                  <View style={styles.gwStats}>
                    <Text style={styles.gwStat}>{data.count} txns</Text>
                    <Text style={styles.gwStat}>{formatCurrency(data.amount)}</Text>
                  </View>
                </View>
              ))}
            </Card>
          )}

          {/* Average Transaction */}
          <Card style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>Average Transaction</Text>
            <Text style={styles.avgAmount}>{formatCurrency(report.stats.avgTransaction)}</Text>
          </Card>

          {/* Report Meta */}
          <Card style={styles.metaCard}>
            <Text style={styles.metaText}>
              Report generated on {formatDate(report.generatedAt)}
            </Text>
            <Text style={styles.metaText}>
              Period: {formatShortDate(report.dateRange.start)} — {formatShortDate(report.dateRange.end)}
            </Text>
            <Text style={styles.metaText}>Report ID: {report.id}</Text>
          </Card>

          {/* Share Button */}
          <View style={styles.shareRow}>
            <Button
              title="📤 Share Report"
              onPress={handleShare}
              variant="secondary"
              style={{ flex: 1 }}
            />
          </View>
        </>
      )}

      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: SPACING.md,
  },
  title: {
    ...FONTS.h1,
    paddingHorizontal: SPACING.md,
  },
  subtitle: {
    ...FONTS.regular,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  periodRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  periodChip: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
  },
  periodChipActive: {
    backgroundColor: COLORS.primary,
  },
  periodText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  periodTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  sectionTitle: {
    ...FONTS.h3,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  summaryCard: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
  },
  summaryLabel: {
    ...FONTS.caption,
    marginTop: 4,
  },
  breakdownCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  breakdownTitle: {
    ...FONTS.medium,
    marginBottom: SPACING.sm,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  breakdownRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  breakdownItem: {
    flex: 1,
    borderLeftWidth: 3,
    paddingLeft: SPACING.sm,
  },
  breakdownCount: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  breakdownLabel: {
    ...FONTS.caption,
  },
  gwRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  gwName: {
    ...FONTS.medium,
    fontSize: 13,
    flex: 1,
  },
  gwStats: {
    alignItems: 'flex-end',
  },
  gwStat: {
    ...FONTS.caption,
    fontSize: 12,
  },
  avgAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
  },
  metaCard: {
    marginHorizontal: SPACING.md,
    backgroundColor: COLORS.gray50,
    marginBottom: SPACING.sm,
  },
  metaText: {
    ...FONTS.caption,
    marginBottom: 2,
  },
  shareRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
});
