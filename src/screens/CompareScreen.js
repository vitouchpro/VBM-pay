import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { PAYMENT_METHODS } from '../constants/gateways';
import PaymentService from '../services/PaymentService';
import GatewayCard from '../components/GatewayCard';
import Button from '../components/Button';
import Card from '../components/Card';
import { formatCurrency } from '../utils/helpers';

export default function CompareScreen() {
  const [method, setMethod] = useState('upi');
  const [amount, setAmount] = useState('1000');
  const [sortBy, setSortBy] = useState('cost'); // 'cost' | 'security'
  const [results, setResults] = useState([]);
  const [compared, setCompared] = useState(false);

  function handleCompare() {
    const amt = parseFloat(amount) || 0;
    if (amt <= 0) return;

    let res;
    if (sortBy === 'cost') {
      res = PaymentService.rankByCost(method, amt).map((r) => ({
        gateway: r.gateway,
        fee: r.fee,
        total: r.total,
      }));
    } else {
      const gateways = PaymentService.rankBySecurity(method);
      res = gateways.map((gw) => {
        const fee = PaymentService.compareGateways(method, amt).find(
          (r) => r.gateway.id === gw.id
        );
        return {
          gateway: gw,
          fee: fee?.fee || 0,
          total: fee?.total || amt,
        };
      });
    }

    // Mark cheapest and most secure
    const cheapest = PaymentService.getCheapestGateway(method, amt);
    const securest = PaymentService.getMostSecureGateway(method);

    setResults(
      res.map((r) => ({
        ...r,
        isCheapest: cheapest && r.gateway.id === cheapest.gateway.id,
        isSecurest: securest && r.gateway.id === securest.id,
      }))
    );
    setCompared(true);
  }

  const cheapestResult = results.find((r) => r.isCheapest);
  const securestResult = results.find((r) => r.isSecurest);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Compare Gateways</Text>
      <Text style={styles.subtitle}>Find the cheapest and most secure gateway for your payment</Text>

      {/* Method Selection */}
      <View style={styles.methodRow}>
        {Object.values(PAYMENT_METHODS).map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[styles.methodChip, method === m.id && styles.methodChipActive]}
            onPress={() => { setMethod(m.id); setCompared(false); }}
          >
            <Text style={[styles.methodChipText, method === m.id && styles.methodChipTextActive]}>
              {m.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Amount Input */}
      <View style={styles.amountRow}>
        <View style={styles.inputWrap}>
          <Text style={styles.currencySign}>₹</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={(v) => { setAmount(v); setCompared(false); }}
            keyboardType="numeric"
            placeholder="Enter amount"
            placeholderTextColor={COLORS.gray400}
          />
        </View>
      </View>

      {/* Sort Toggle */}
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity
          style={[styles.sortBtn, sortBy === 'cost' && styles.sortBtnActive]}
          onPress={() => { setSortBy('cost'); setCompared(false); }}
        >
          <Text style={[styles.sortBtnText, sortBy === 'cost' && styles.sortBtnTextActive]}>
            💰 Cheapest
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortBtn, sortBy === 'security' && styles.sortBtnActive]}
          onPress={() => { setSortBy('security'); setCompared(false); }}
        >
          <Text style={[styles.sortBtnText, sortBy === 'security' && styles.sortBtnTextActive]}>
            🔒 Most Secure
          </Text>
        </TouchableOpacity>
      </View>

      <Button
        title="Compare Now"
        onPress={handleCompare}
        style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.md }}
        size="large"
      />

      {/* Quick Recommendation */}
      {compared && results.length > 0 && (
        <>
          <View style={styles.recommendationRow}>
            {cheapestResult && (
              <Card style={[styles.recCard, { borderLeftColor: COLORS.success }]}>
                <Text style={styles.recTitle}>💰 Cheapest</Text>
                <Text style={styles.recGateway}>{cheapestResult.gateway.name}</Text>
                <Text style={styles.recFee}>
                  Fee: {cheapestResult.fee === 0 ? 'FREE' : formatCurrency(cheapestResult.fee)}
                </Text>
              </Card>
            )}
            {securestResult && (
              <Card style={[styles.recCard, { borderLeftColor: COLORS.primary }]}>
                <Text style={styles.recTitle}>🔒 Most Secure</Text>
                <Text style={styles.recGateway}>{securestResult.gateway.name}</Text>
                <Text style={styles.recFee}>Rating: {securestResult.gateway.securityRating}/5.0</Text>
              </Card>
            )}
          </View>

          {/* Full Comparison */}
          <Text style={styles.sectionTitle}>
            All Gateways ({sortBy === 'cost' ? 'Cheapest First' : 'Most Secure First'})
          </Text>
          {results.map((r, index) => (
            <View key={r.gateway.id} style={{ paddingHorizontal: SPACING.md }}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{index + 1}</Text>
                {r.isCheapest && <Text style={styles.tagCheap}>💰 Cheapest</Text>}
                {r.isSecurest && <Text style={styles.tagSecure}>🔒 Most Secure</Text>}
              </View>
              <GatewayCard
                gateway={r.gateway}
                fee={r.fee}
                total={r.total}
                recommended={index === 0}
              />
            </View>
          ))}
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
  methodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  methodChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  methodChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  methodChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  methodChipTextActive: {
    color: COLORS.white,
  },
  amountRow: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    paddingHorizontal: SPACING.md,
  },
  currencySign: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: SPACING.xs,
  },
  amountInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '600',
    paddingVertical: SPACING.sm + 2,
    color: COLORS.text,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  sortLabel: {
    ...FONTS.medium,
    marginRight: SPACING.xs,
  },
  sortBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gray100,
  },
  sortBtnActive: {
    backgroundColor: COLORS.primaryLight,
  },
  sortBtnText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  sortBtnTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  recommendationRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  recCard: {
    flex: 1,
    borderLeftWidth: 4,
  },
  recTitle: {
    ...FONTS.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  recGateway: {
    ...FONTS.medium,
    fontSize: 14,
  },
  recFee: {
    ...FONTS.caption,
    marginTop: 2,
  },
  sectionTitle: {
    ...FONTS.h3,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  tagCheap: {
    fontSize: 11,
    backgroundColor: COLORS.successLight,
    color: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    fontWeight: '600',
    overflow: 'hidden',
  },
  tagSecure: {
    fontSize: 11,
    backgroundColor: COLORS.primaryLight,
    color: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    fontWeight: '600',
    overflow: 'hidden',
  },
});
