import { PAYMENT_GATEWAYS } from '../constants/gateways';
import { calculateFee, generateId } from '../utils/helpers';
import StorageService from './StorageService';

class PaymentService {
  // Simulate a payment through a specific gateway
  async processPayment({ gatewayId, method, amount, recipient, description }) {
    const gateway = PAYMENT_GATEWAYS.find((g) => g.id === gatewayId);
    if (!gateway) throw new Error('Gateway not found');
    if (!gateway.isActive) throw new Error('Gateway is not active');
    if (!gateway.supportedMethods.includes(method)) {
      throw new Error(`${gateway.name} does not support ${method}`);
    }
    if (amount < gateway.minTransaction) {
      throw new Error(`Minimum transaction amount is ${gateway.minTransaction}`);
    }
    if (amount > gateway.maxTransaction) {
      throw new Error(`Maximum transaction amount is ${gateway.maxTransaction}`);
    }

    const fee = calculateFee(gateway, method, amount);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate success/failure (95% success rate)
    const isSuccess = Math.random() < 0.95;

    const transaction = {
      id: generateId(),
      gatewayId: gateway.id,
      gatewayName: gateway.name,
      method,
      amount,
      fee,
      totalAmount: amount + fee,
      recipient,
      description: description || '',
      status: isSuccess ? 'success' : 'failed',
      timestamp: new Date().toISOString(),
      referenceId: 'VBM' + Date.now().toString().slice(-10),
    };

    // Log the transaction
    await StorageService.saveTransaction(transaction);

    return transaction;
  }

  // Compare gateways for a given amount and method
  compareGateways(method, amount) {
    const results = PAYMENT_GATEWAYS
      .filter((g) => g.isActive && g.supportedMethods.includes(method))
      .map((gateway) => {
        const fee = calculateFee(gateway, method, amount);
        return {
          gateway,
          fee,
          total: amount + fee,
          feePercentage: amount > 0 ? ((fee / amount) * 100).toFixed(2) : 0,
        };
      });

    return results;
  }

  // Get the cheapest gateway for a method and amount
  getCheapestGateway(method, amount) {
    const results = this.compareGateways(method, amount);
    if (results.length === 0) return null;
    return results.reduce((cheapest, current) =>
      current.fee < cheapest.fee ? current : cheapest
    );
  }

  // Get the most secure gateway for a method
  getMostSecureGateway(method) {
    const gateways = PAYMENT_GATEWAYS
      .filter((g) => g.isActive && g.supportedMethods.includes(method));
    if (gateways.length === 0) return null;
    return gateways.reduce((best, current) =>
      current.securityRating > best.securityRating ? current : best
    );
  }

  // Get best gateway considering both cost and security
  getBestGateway(method, amount, preferCheapest = true) {
    const results = this.compareGateways(method, amount);
    if (results.length === 0) return null;

    // Score: lower is better. Weight cost vs security based on preference.
    const scored = results.map((r) => {
      const costScore = r.fee; // Lower is better
      const securityScore = (5 - r.gateway.securityRating) * (amount * 0.01); // Normalize
      const weight = preferCheapest ? 0.7 : 0.3;
      const score = costScore * weight + securityScore * (1 - weight);
      return { ...r, score };
    });

    return scored.reduce((best, current) =>
      current.score < best.score ? current : best
    );
  }

  // Rank gateways by cost (cheapest first)
  rankByCost(method, amount) {
    return this.compareGateways(method, amount)
      .sort((a, b) => a.fee - b.fee);
  }

  // Rank gateways by security (most secure first)
  rankBySecurity(method) {
    return PAYMENT_GATEWAYS
      .filter((g) => g.isActive && g.supportedMethods.includes(method))
      .sort((a, b) => b.securityRating - a.securityRating);
  }
}

export default new PaymentService();
