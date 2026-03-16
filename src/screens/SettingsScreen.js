import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { useApp } from '../context/AppContext';
import StorageService from '../services/StorageService';
import Card from '../components/Card';
import Button from '../components/Button';

export default function SettingsScreen() {
  const { settings, updateSettings, refreshTransactions } = useApp();
  const [clearing, setClearing] = useState(false);

  function handleClearData() {
    Alert.alert(
      'Clear All Data',
      'This will delete all transaction logs and reports. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setClearing(true);
            try {
              await StorageService.clearTransactions();
              await refreshTransactions();
              Alert.alert('Success', 'All data has been cleared.');
            } catch (e) {
              Alert.alert('Error', 'Failed to clear data');
            } finally {
              setClearing(false);
            }
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      {/* Gateway Preference */}
      <Text style={styles.sectionTitle}>Gateway Preference</Text>
      <Card>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Prefer Cheapest</Text>
            <Text style={styles.settingDesc}>Auto-select the gateway with lowest fees</Text>
          </View>
          <Switch
            value={settings.preferCheapest}
            onValueChange={(val) => updateSettings({ preferCheapest: val, preferSecure: !val })}
            trackColor={{ false: COLORS.gray300, true: COLORS.primaryLight }}
            thumbColor={settings.preferCheapest ? COLORS.primary : COLORS.gray400}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Prefer Most Secure</Text>
            <Text style={styles.settingDesc}>Auto-select the gateway with highest security rating</Text>
          </View>
          <Switch
            value={settings.preferSecure}
            onValueChange={(val) => updateSettings({ preferSecure: val, preferCheapest: !val })}
            trackColor={{ false: COLORS.gray300, true: COLORS.primaryLight }}
            thumbColor={settings.preferSecure ? COLORS.primary : COLORS.gray400}
          />
        </View>
      </Card>

      {/* Notifications */}
      <Text style={styles.sectionTitle}>Notifications</Text>
      <Card>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Payment Notifications</Text>
            <Text style={styles.settingDesc}>Get notified on payment success/failure</Text>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={(val) => updateSettings({ notificationsEnabled: val })}
            trackColor={{ false: COLORS.gray300, true: COLORS.primaryLight }}
            thumbColor={settings.notificationsEnabled ? COLORS.primary : COLORS.gray400}
          />
        </View>
      </Card>

      {/* Data Management */}
      <Text style={styles.sectionTitle}>Data Management</Text>
      <Card>
        <Button
          title="Clear All Transaction Data"
          variant="danger"
          onPress={handleClearData}
          loading={clearing}
        />
      </Card>

      {/* About */}
      <Text style={styles.sectionTitle}>About</Text>
      <Card>
        <Text style={styles.aboutName}>VBMPay</Text>
        <Text style={styles.aboutVersion}>Version 1.0.0</Text>
        <Text style={styles.aboutDesc}>
          Smart Payment Gateway Comparison & Management App.{'\n'}
          Compare fees, security ratings, and choose the best gateway for every payment.
        </Text>
      </Card>

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
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...FONTS.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingLabel: {
    ...FONTS.medium,
  },
  settingDesc: {
    ...FONTS.caption,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginVertical: SPACING.sm,
  },
  aboutName: {
    ...FONTS.h2,
    color: COLORS.primary,
  },
  aboutVersion: {
    ...FONTS.caption,
    marginBottom: SPACING.sm,
  },
  aboutDesc: {
    ...FONTS.regular,
    lineHeight: 22,
  },
});
