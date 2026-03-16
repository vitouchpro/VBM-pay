import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { formatCurrency, getStatusColor } from '../utils/helpers';
import Card from '../components/Card';

export default function HomeScreen({ navigation }) {
  const { transactions, refreshTransactions, loading } = useApp();

  const recentTxns = transactions.slice(0, 5);
  const successTxns = transactions.filter((t) => t.status === 'success');
  const totalVolume = successTxns.reduce((sum, t) => sum + t.amount, 0);
  const totalFees = successTxns.reduce((sum, t) => sum + (t.fee || 0), 0);
  const successRate = transactions.length > 0
    ? ((successTxns.length / transactions.length) * 100).toFixed(0)
    : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refreshTransactions} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>VBMPay</Text>
        <Text style={styles.tagline}>Smart Payment Gateway Manager</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{transactions.length}</Text>
          <Text style={styles.statLabel}>Transactions</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { color: COLORS.success }]}>{successRate}%</Text>
          <Text style={styles.statLabel}>Success Rate</Text>
        </Card>
      </View>
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { fontSize: 18 }]}>{formatCurrency(totalVolume)}</Text>
          <Text style={styles.statLabel}>Total Volume</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, { fontSize: 18, color: COLORS.danger }]}>
            {formatCurrency(totalFees)}
          </Text>
          <Text style={styles.statLabel}>Total Fees</Text>
        </Card>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
          onPress={() => navigation.navigate('Payment')}
        >
          <Text style={styles.actionIcon}>💳</Text>
          <Text style={styles.actionText}>New Payment</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: COLORS.secondary }]}
          onPress={() => navigation.navigate('Compare')}
        >
          <Text style={styles.actionIcon}>⚖️</Text>
          <Text style={styles.actionText}>Compare</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#7C4DFF' }]}
          onPress={() => navigation.navigate('Logs')}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionText}>Logs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: COLORS.accent }]}
          onPress={() => navigation.navigate('Reports')}
        >
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={styles.actionText}>Reports</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Transactions */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {transactions.length > 0 && (
          <TouchableOpacity onPress={() => navigation.navigate('Logs')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      {recentTxns.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>No transactions yet. Make your first payment!</Text>
        </Card>
      ) : (
        recentTxns.map((txn) => (
          <Card key={txn.id} style={styles.txnCard}>
            <View style={styles.txnRow}>
              <View style={styles.txnInfo}>
                <Text style={styles.txnGateway}>{txn.gatewayName}</Text>
                <Text style={styles.txnMethod}>{txn.method.toUpperCase()}</Text>
              </View>
              <View style={styles.txnRight}>
                <Text style={styles.txnAmount}>{formatCurrency(txn.amount)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(txn.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(txn.status) }]}>
                    {txn.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        ))
      )}

      <View style={{ height: SPACING.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.xxl + SPACING.md,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    ...FONTS.caption,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  sectionTitle: {
    ...FONTS.h3,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  viewAll: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
    marginTop: SPACING.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  actionBtn: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    ...SHADOWS.md,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  actionText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 13,
  },
  txnCard: {
    marginHorizontal: SPACING.md,
  },
  txnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txnInfo: {
    flex: 1,
  },
  txnGateway: {
    ...FONTS.medium,
  },
  txnMethod: {
    ...FONTS.caption,
    marginTop: 2,
  },
  txnRight: {
    alignItems: 'flex-end',
  },
  txnAmount: {
    ...FONTS.bold,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginTop: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyText: {
    ...FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: SPACING.lg,
  },
});
