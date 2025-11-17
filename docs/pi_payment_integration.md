# Flappy Pi Pi Network Payment Integration Guide

## Overview

This document describes how Flappy Pi integrates Pi Network payments for in-game purchases such as bird skins, revives, and score multipliers. The integration uses the official Pi SDK to authenticate users, connect wallets, and handle secure Pi transactions.

---

## Setup

### 1. Register your app with Pi Network

* Obtain your App ID and API keys from the Pi Developer Portal
* Configure allowed redirect URIs and permissions

### 2. Install Pi SDK

Include the Pi Network SDK in your frontend project:

```html
<script src="https://sdk.minepi.com/pi-sdk.js"></script>
```

---

## Authentication Flow

1. User clicks **Login with Pi** button
2. Call `Pi.authenticate()` to trigger Pi login popup
3. On success, retrieve `piUserId` and authentication token
4. Store user info in app state and backend for session persistence

---

## Payment Flow

### Initiating a Payment

* When user selects an item in the shop, call the Pi SDK payment method:

```javascript
Pi.requestPayment({
  recipient: "your_pi_wallet_address",
  amount: amountInPi,
  memo: "Flappy Pi purchase: itemId"
}).then(response => {
  // Handle successful payment
  // response.transactionId can be sent to backend for verification
}).catch(error => {
  // Handle payment errors or cancellations
});
```

### Backend Verification

* After payment completes, send transaction details to backend `/purchase` endpoint for validation and inventory update.
* Backend verifies transaction ID and amount using Pi Network APIs (if available).

---

## Wallet Connection

* Use `Pi.connectWallet()` to prompt users to connect their Pi wallet for balance display and payment authorization.
* Keep wallet session active while app is open.

---

## Error Handling

* Handle declined payments, network issues, or user cancellations gracefully.
* Display user-friendly messages and allow retry.

---

## Security Considerations

* Never trust client-side payment confirmation alone — always verify on backend.
* Store minimal sensitive data; rely on Pi Network's authentication and transaction verification.
* Use HTTPS for all API calls.

---

## Best Practices

* Show payment progress and confirmation UI to users
* Offer clear pricing in Pi coins with conversion rates if needed
* Enable refunds or support via backend if applicable

---

## References

* [Pi Network Developer Portal](https://minepi.com/developers)
* [Pi SDK Documentation](https://minepi.com/developers/sdk)

---

