import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Card from './Card';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { formatCurrency, renderStarRating } from '../utils/helpers';

export default function GatewayCard({ gateway, fee, total, onSelect, recommended, compact }) {
  return (
    <TouchableOpacity onPress={() => onSelect && onSelect(gateway)} activeOpacity={0.7}>
      <Card style={[styles.container, recommended && styles.recommended]}>
        {recommended && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>RECOMMENDED</Text>
          </View>
        )}
        <View style={styles.header}>
          <View style={styles.info}>
            <Text style={styles.name}>{gateway.name}</Text>
            {!compact && (
              <Text style={styles.description} numberOfLines={2}>
                {gateway.description}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Security</Text>
            <Text style={styles.stars}>{renderStarRating(gateway.securityRating)}</Text>
            <Text style={styles.ratingText}>{gateway.securityRating}/5.0</Text>
          </View>

          {fee !== undefined && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Fee</Text>
              <Text style={[styles.feeText, fee === 0 && styles.freeText]}>
                {fee === 0 ? 'FREE' : formatCurrency(fee)}
              </Text>
            </View>
          )}

          {total !== undefined && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Total</Text>
              <Text style={styles.totalText}>{formatCurrency(total)}</Text>
            </View>
          )}
        </View>

        {!compact && (
          <View style={styles.footer}>
            <Text style={styles.settlementText}>Settlement: {gateway.settlementTime}</Text>
            <View style={styles.features}>
              {gateway.securityFeatures.slice(0, 3).map((f, i) => (
                <View key={i} style={styles.featureTag}>
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  recommended: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderBottomLeftRadius: RADIUS.sm,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  info: {
    flex: 1,
  },
  name: {
    ...FONTS.h3,
    marginBottom: 2,
  },
  description: {
    ...FONTS.caption,
    marginTop: 2,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    ...FONTS.caption,
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: 10,
  },
  stars: {
    fontSize: 14,
    color: COLORS.accent,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
  },
  feeText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.danger,
  },
  freeText: {
    color: COLORS.success,
  },
  totalText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    paddingTop: SPACING.sm,
    marginTop: SPACING.xs,
  },
  settlementText: {
    ...FONTS.caption,
    marginBottom: SPACING.xs,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  featureTag: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  featureText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '500',
  },
});
