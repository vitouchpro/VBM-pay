import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { PAYMENT_METHODS } from '../constants/gateways';
import { useApp } from '../context/AppContext';
import PaymentService from '../services/PaymentService';
import GatewayCard from '../components/GatewayCard';
import Button from '../components/Button';
import { formatCurrency } from '../utils/helpers';

export default function PaymentScreen({ navigation }) {
  const { addTransaction, settings } = useApp();
  const [step, setStep] = useState(1); // 1: Details, 2: Choose Gateway, 3: Processing, 4: Result
  const [method, setMethod] = useState(null);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [comparisonResults, setComparisonResults] = useState([]);

  function handleMethodSelect(methodId) {
    setMethod(methodId);
  }

  function handleNext() {
    if (!method) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (!recipient.trim()) {
      Alert.alert('Error', 'Please enter recipient details');
      return;
    }

    // Compare gateways and move to step 2
    const results = PaymentService.compareGateways(method, amt);
    const cheapest = PaymentService.getCheapestGateway(method, amt);
    setComparisonResults(
      results
        .sort((a, b) => a.fee - b.fee)
        .map((r) => ({
          ...r,
          recommended: cheapest && r.gateway.id === cheapest.gateway.id,
        }))
    );
    setStep(2);
  }

  async function handlePay() {
    if (!selectedGateway) {
      Alert.alert('Error', 'Please select a payment gateway');
      return;
    }

    setStep(3);
    setProcessing(true);

    try {
      const txn = await PaymentService.processPayment({
        gatewayId: selectedGateway.id,
        method,
        amount: parseFloat(amount),
        recipient,
        description,
      });
      await addTransaction(txn);
      setResult(txn);
      setStep(4);
    } catch (error) {
      Alert.alert('Payment Error', error.message);
      setStep(2);
    } finally {
      setProcessing(false);
    }
  }

  function handleNewPayment() {
    setStep(1);
    setMethod(null);
    setAmount('');
    setRecipient('');
    setDescription('');
    setSelectedGateway(null);
    setResult(null);
    setComparisonResults([]);
  }

  // Step 1: Payment Details
  if (step === 1) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.container}>
          <Text style={styles.title}>New Payment</Text>
          <Text style={styles.subtitle}>Select payment method and enter details</Text>

          {/* Payment Method Selection */}
          <Text style={styles.label}>Payment Method</Text>
          <View style={styles.methodGrid}>
            {Object.values(PAYMENT_METHODS).map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[styles.methodCard, method === m.id && styles.methodSelected]}
                onPress={() => handleMethodSelect(m.id)}
              >
                <Text style={styles.methodIcon}>
                  {m.id === 'bank_account' ? '🏦' : m.id === 'upi' ? '📱' : m.id === 'mobile' ? '📲' : '💳'}
                </Text>
                <Text style={[styles.methodName, method === m.id && styles.methodNameSelected]}>
                  {m.name}
                </Text>
                <Text style={styles.methodDesc}>{m.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount */}
          <Text style={styles.label}>Amount (INR)</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencyPrefix}>₹</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
              placeholderTextColor={COLORS.gray400}
            />
          </View>

          {/* Recipient */}
          <Text style={styles.label}>
            {method === 'upi' ? 'UPI ID' : method === 'mobile' ? 'Mobile Number' : method === 'bank_account' ? 'Account Number' : 'Recipient'}
          </Text>
          <TextInput
            style={styles.input}
            value={recipient}
            onChangeText={setRecipient}
            placeholder={
              method === 'upi' ? 'name@upi' : method === 'mobile' ? '9876543210' : method === 'bank_account' ? 'Account number' : 'Enter recipient'
            }
            placeholderTextColor={COLORS.gray400}
          />

          {/* Description */}
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Payment for..."
            placeholderTextColor={COLORS.gray400}
          />

          <Button
            title="Compare Gateways & Continue"
            onPress={handleNext}
            size="large"
            style={{ marginTop: SPACING.lg, marginBottom: SPACING.xxl }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Step 2: Choose Gateway
  if (step === 2) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Choose Gateway</Text>
        <Text style={styles.subtitle}>
          Sending {formatCurrency(parseFloat(amount))} via {PAYMENT_METHODS[method]?.name}
        </Text>
        <Text style={styles.hint}>Sorted by lowest fee. Tap to select.</Text>

        {comparisonResults.map((r) => (
          <View key={r.gateway.id} style={{ paddingHorizontal: SPACING.md }}>
            <GatewayCard
              gateway={r.gateway}
              fee={r.fee}
              total={r.total}
              recommended={r.recommended}
              onSelect={() => setSelectedGateway(r.gateway)}
              compact={false}
            />
            {selectedGateway?.id === r.gateway.id && (
              <View style={styles.selectedIndicator}>
                <Text style={styles.selectedText}>✓ Selected</Text>
              </View>
            )}
          </View>
        ))}

        <View style={styles.bottomActions}>
          <Button title="Back" variant="outline" onPress={() => setStep(1)} style={{ flex: 1 }} />
          <View style={{ width: SPACING.sm }} />
          <Button
            title="Pay Now"
            onPress={handlePay}
            disabled={!selectedGateway}
            style={{ flex: 2 }}
            size="large"
          />
        </View>
      </ScrollView>
    );
  }

  // Step 3: Processing
  if (step === 3) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.processingText}>Processing Payment...</Text>
        <Text style={styles.processingSubtext}>Please wait while we process your transaction</Text>
      </View>
    );
  }

  // Step 4: Result
  if (step === 4 && result) {
    const isSuccess = result.status === 'success';
    return (
      <View style={styles.centerContainer}>
        <View style={[styles.resultIcon, { backgroundColor: isSuccess ? COLORS.successLight : COLORS.dangerLight }]}>
          <Text style={{ fontSize: 48 }}>{isSuccess ? '✅' : '❌'}</Text>
        </View>
        <Text style={[styles.resultTitle, { color: isSuccess ? COLORS.success : COLORS.danger }]}>
          {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
        </Text>
        <Text style={styles.resultAmount}>{formatCurrency(result.amount)}</Text>

        <View style={styles.resultDetails}>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Reference</Text>
            <Text style={styles.resultValue}>{result.referenceId}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Gateway</Text>
            <Text style={styles.resultValue}>{result.gatewayName}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Method</Text>
            <Text style={styles.resultValue}>{result.method.toUpperCase()}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Fee</Text>
            <Text style={styles.resultValue}>{formatCurrency(result.fee)}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Total</Text>
            <Text style={[styles.resultValue, { fontWeight: '700' }]}>
              {formatCurrency(result.totalAmount)}
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Recipient</Text>
            <Text style={styles.resultValue}>{result.recipient}</Text>
          </View>
        </View>

        <View style={styles.resultActions}>
          <Button title="New Payment" onPress={handleNewPayment} style={{ flex: 1 }} />
          <View style={{ width: SPACING.sm }} />
          <Button
            title="View Logs"
            variant="outline"
            onPress={() => navigation.navigate('Logs')}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    );
  }

  return null;
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
  hint: {
    ...FONTS.caption,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    fontStyle: 'italic',
  },
  label: {
    ...FONTS.medium,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  methodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  methodCard: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    ...SHADOWS.sm,
  },
  methodSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  methodIcon: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  methodName: {
    ...FONTS.medium,
    fontSize: 14,
  },
  methodNameSelected: {
    color: COLORS.primary,
  },
  methodDesc: {
    ...FONTS.caption,
    fontSize: 11,
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    marginHorizontal: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  currencyPrefix: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: SPACING.xs,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    paddingVertical: SPACING.sm + 4,
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    marginHorizontal: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    fontSize: 16,
    color: COLORS.text,
  },
  selectedIndicator: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.sm,
    padding: SPACING.xs,
    alignItems: 'center',
    marginTop: -SPACING.xs,
    marginBottom: SPACING.sm,
  },
  selectedText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  processingText: {
    ...FONTS.h2,
    marginTop: SPACING.lg,
  },
  processingSubtext: {
    ...FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  resultIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  resultTitle: {
    ...FONTS.h2,
  },
  resultAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  resultDetails: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    ...SHADOWS.sm,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  resultLabel: {
    ...FONTS.caption,
    fontWeight: '600',
  },
  resultValue: {
    ...FONTS.regular,
  },
  resultActions: {
    flexDirection: 'row',
    width: '100%',
    marginTop: SPACING.lg,
  },
});
