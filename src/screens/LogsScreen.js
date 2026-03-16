import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { formatCurrency, formatDate, getStatusColor } from '../utils/helpers';

export default function LogsScreen() {
  const { transactions } = useApp();
  const [filter, setFilter] = useState('all'); // all, success, failed, pending
  const [selectedTxn, setSelectedTxn] = useState(null);

  const filtered = filter === 'all'
    ? transactions
    : transactions.filter((t) => t.status === filter);

  const statusCounts = {
    all: transactions.length,
    success: transactions.filter((t) => t.status === 'success').length,
    failed: transactions.filter((t) => t.status === 'failed').length,
    pending: transactions.filter((t) => t.status === 'pending').length,
  };

  function renderTransaction({ item }) {
    return (
      <TouchableOpacity onPress={() => setSelectedTxn(item)}>
        <Card style={styles.txnCard}>
          <View style={styles.txnHeader}>
            <View style={styles.txnInfo}>
              <Text style={styles.txnRef}>{item.referenceId}</Text>
              <Text style={styles.txnDate}>{formatDate(item.timestamp)}</Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          </View>
          <View style={styles.txnBody}>
            <View style={styles.txnDetail}>
              <Text style={styles.txnLabel}>Gateway</Text>
              <Text style={styles.txnValue}>{item.gatewayName}</Text>
            </View>
            <View style={styles.txnDetail}>
              <Text style={styles.txnLabel}>Method</Text>
              <Text style={styles.txnValue}>{item.method.toUpperCase()}</Text>
            </View>
            <View style={styles.txnDetail}>
              <Text style={styles.txnLabel}>Amount</Text>
              <Text style={[styles.txnValue, styles.txnAmount]}>{formatCurrency(item.amount)}</Text>
            </View>
          </View>
          <View style={styles.txnFooter}>
            <Text style={styles.feeText}>Fee: {formatCurrency(item.fee)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Logs</Text>
      <Text style={styles.subtitle}>{transactions.length} total transactions</Text>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {['all', 'success', 'failed', 'pending'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)} ({statusCounts[f]})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transaction List */}
      <FlatList
        data={filtered}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No transactions found</Text>
            <Text style={styles.emptySubtext}>
              {filter !== 'all' ? 'Try changing the filter' : 'Make a payment to see logs here'}
            </Text>
          </View>
        }
      />

      {/* Transaction Detail Modal */}
      <Modal
        visible={!!selectedTxn}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTxn(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedTxn && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Transaction Details</Text>
                  <TouchableOpacity onPress={() => setSelectedTxn(null)}>
                    <Text style={styles.closeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={[
                  styles.modalStatus,
                  { backgroundColor: getStatusColor(selectedTxn.status) + '15' },
                ]}>
                  <Text style={[styles.modalStatusText, { color: getStatusColor(selectedTxn.status) }]}>
                    {selectedTxn.status.toUpperCase()}
                  </Text>
                </View>

                <Text style={styles.modalAmount}>{formatCurrency(selectedTxn.amount)}</Text>

                {[
                  ['Reference ID', selectedTxn.referenceId],
                  ['Transaction ID', selectedTxn.id],
                  ['Gateway', selectedTxn.gatewayName],
                  ['Payment Method', selectedTxn.method.toUpperCase()],
                  ['Fee', formatCurrency(selectedTxn.fee)],
                  ['Total Amount', formatCurrency(selectedTxn.totalAmount)],
                  ['Recipient', selectedTxn.recipient],
                  ['Description', selectedTxn.description || '-'],
                  ['Date & Time', formatDate(selectedTxn.timestamp)],
                ].map(([label, value]) => (
                  <View key={label} style={styles.modalRow}>
                    <Text style={styles.modalLabel}>{label}</Text>
                    <Text style={styles.modalValue}>{value}</Text>
                  </View>
                ))}

                <Button
                  title="Close"
                  variant="outline"
                  onPress={() => setSelectedTxn(null)}
                  style={{ marginTop: SPACING.md }}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
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
    ...FONTS.caption,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gray100,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  list: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  txnCard: {
    marginBottom: SPACING.sm,
  },
  txnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  txnInfo: {},
  txnRef: {
    ...FONTS.medium,
    fontSize: 14,
    fontFamily: Platform?.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  txnDate: {
    ...FONTS.caption,
    marginTop: 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  txnBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  txnDetail: {},
  txnLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  txnValue: {
    ...FONTS.regular,
    marginTop: 2,
  },
  txnAmount: {
    fontWeight: '700',
    color: COLORS.text,
  },
  txnFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  feeText: {
    ...FONTS.caption,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    ...FONTS.h3,
    color: COLORS.textSecondary,
  },
  emptySubtext: {
    ...FONTS.caption,
    marginTop: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    ...FONTS.h2,
  },
  closeBtn: {
    fontSize: 22,
    color: COLORS.textSecondary,
    padding: SPACING.xs,
  },
  modalStatus: {
    alignSelf: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.sm,
  },
  modalStatusText: {
    fontSize: 14,
    fontWeight: '800',
  },
  modalAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  modalLabel: {
    ...FONTS.caption,
    fontWeight: '600',
  },
  modalValue: {
    ...FONTS.regular,
    fontSize: 13,
    textAlign: 'right',
    flex: 1,
    marginLeft: SPACING.md,
  },
});
