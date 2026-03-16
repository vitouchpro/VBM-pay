# VBMPay

Smart Payment Gateway Comparison & Management App built with React Native (Expo).

## Features

- **Multi-Gateway Payment Processing** — Pay via Bank Account, UPI, Mobile/Wallet, or Card through 6 integrated gateways (Razorpay, Paytm, PhonePe, Cashfree, Stripe India, PayU)
- **Gateway Comparison Engine** — Compare all gateways by cost (cheapest fees) and security rating to choose the best option for every transaction
- **Smart Recommendations** — Auto-suggests the cheapest or most secure gateway based on payment method and amount
- **Complete Payment Logs** — Every transaction is logged with full details: reference ID, gateway, method, amount, fee, status, and timestamp
- **Report Generation** — Generate detailed payment reports for any time period with summary statistics, gateway breakdown, method breakdown, and exportable text/HTML formats
- **Settings & Preferences** — Configure default gateway preference (cheapest vs most secure), notification settings, and data management

## Supported Payment Methods

| Method | Description |
|--------|-------------|
| Bank Account | NEFT/IMPS/RTGS direct bank transfers |
| UPI | Unified Payments Interface |
| Mobile/Wallet | Mobile number & wallet-based payments |
| Debit/Credit Card | Visa, Mastercard, RuPay |

## Payment Gateways

| Gateway | UPI Fee | Bank Fee | Mobile Fee | Security Rating |
|---------|---------|----------|------------|-----------------|
| Razorpay | Free | Free | 1.5% | 4.5/5 |
| Paytm | Free | Free | 1.0% | 4.3/5 |
| PhonePe | Free | Free | 1.2% | 4.4/5 |
| Cashfree | Free | Free | 1.4% | 4.2/5 |
| Stripe India | Free | ₹5 flat | 2.0% | 4.8/5 |
| PayU Money | Free | Free | 1.5% | 4.1/5 |

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npx expo start

# Run on Android
npx expo start --android

# Run on iOS
npx expo start --ios

# Run on Web
npx expo start --web
```

## Project Structure

```
VBM-pay/
├── App.js                          # App entry point
├── app.json                        # Expo configuration
├── package.json                    # Dependencies
├── src/
│   ├── components/                 # Reusable UI components
│   │   ├── Button.js
│   │   ├── Card.js
│   │   └── GatewayCard.js
│   ├── constants/
│   │   ├── gateways.js             # Gateway configs, fees, security data
│   │   └── theme.js                # Colors, fonts, spacing
│   ├── context/
│   │   └── AppContext.js           # Global state management
│   ├── navigation/
│   │   └── AppNavigator.js         # Tab + stack navigation
│   ├── screens/
│   │   ├── HomeScreen.js           # Dashboard with stats & quick actions
│   │   ├── PaymentScreen.js        # Multi-step payment flow
│   │   ├── CompareScreen.js        # Gateway comparison tool
│   │   ├── LogsScreen.js           # Transaction log viewer
│   │   ├── ReportsScreen.js        # Report generation & sharing
│   │   └── SettingsScreen.js       # App settings
│   ├── services/
│   │   ├── PaymentService.js       # Payment processing & comparison logic
│   │   ├── ReportService.js        # Report generation (text & HTML)
│   │   └── StorageService.js       # AsyncStorage persistence
│   └── utils/
│       └── helpers.js              # Utility functions
```

## Tech Stack

- React Native with Expo
- React Navigation (Bottom Tabs + Native Stack)
- AsyncStorage for local data persistence
- Expo Print & Sharing for report export
