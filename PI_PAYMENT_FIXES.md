# 🔧 PI PAYMENT IMPLEMENTATION FIX - COMPLETE GUIDE

## ⚠️ CRITICAL: Payment Flow Issues Identified

Based on the official Pi Network documentation, your payment system needs specific fixes to work correctly. Here's what's missing:

---

## 📋 OFFICIAL PAYMENT FLOW (3 PHASES)

### **Phase 1: Payment Creation & Server-Side Approval**
```
1. Frontend: Call Pi.createPayment() with amount, memo, metadata
2. Backend: Pi SDK provides PaymentID via onReadyForServerApproval callback
3. Backend → Server: Send PaymentID to your backend
4. Server → Pi API: POST /payments/{payment_id}/approve with Server API Key
5. Result: Payment UI becomes interactive
```

### **Phase 2: User Interaction & Blockchain Transaction**
```
(Automatic - User confirms in Pi Wallet)
```

### **Phase 3: Server-Side Completion**
```
5. Frontend: Pi SDK calls onReadyForServerCompletion with TxID
6. Frontend → Server: Send TxID to your backend
7. Server → Pi API: POST /payments/{payment_id}/complete with TxID and Server API Key
8. Result: Payment completed, user sees confirmation
```

---

## 🔑 KEY REQUIREMENTS MISSING

### 1. **Server API Key Authorization**
Your current code uses:
```javascript
headers: { Authorization: `Key ${PI_SERVER_API_KEY}` }  ❌ WRONG
```

Should be:
```javascript
headers: { Authorization: `Key ${PI_SERVER_API_KEY}` }  ✅ CORRECT (but must be on SERVER)
```

### 2. **Two Separate Callbacks Required**
Your `piPayment.ts` only has `onReadyForServerApproval` but also needs `onReadyForServerCompletion`:

```typescript
❌ INCOMPLETE:
window.Pi.createPayment({
  { amount, memo, metadata },
  {
    onReadyForServerApproval: (paymentId) => { ... },
    onReadyForServerCompletion: (paymentId, txid) => { ... },  ⬅️ MISSING!
    onCancel: (paymentId) => { ... },
    onError: (error, payment) => { ... },
  }
});
```

### 3. **Proper Error Handling**
Must validate response from `/complete` endpoint:
```javascript
const response = await axios.post(`/payments/${paymentId}/complete`, { txid });
if (response.status !== 200) {
  // DO NOT mark payment as complete
  // DO NOT deliver the item
  throw new Error('Payment completion failed');
}
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Backend (backend/services/piService.js)
- [ ] Use correct API endpoint: `https://api.minepi.com/v2`
- [ ] Include `Authorization: Key <PI_SERVER_API_KEY>` header
- [ ] POST `/payments/{paymentId}/approve` with Server API Key
- [ ] POST `/payments/{paymentId}/complete` with `{ txid }` body
- [ ] Validate responses before confirming payment

### Frontend (src/utils/piPayment.ts)
- [ ] Implement BOTH callbacks: `onReadyForServerApproval` AND `onReadyForServerCompletion`
- [ ] Call backend for approval after payment created
- [ ] Call backend for completion after blockchain confirmation
- [ ] Wait for server response before proceeding

### Environment (.env)
- [ ] `PI_SERVER_API_KEY` set correctly (this is what you pass to /approve and /complete)
- [ ] `PI_API_KEY` can be different (used for other operations)

---

## 🔧 FIXES NEEDED

### 1. Fix `backend/routes/pi.cjs` - Approve Endpoint
```javascript
router.post('/approve-payment', async (req, res) => {
  const { paymentId } = req.body;
  try {
    const response = await axios.post(
      `https://api.minepi.com/v2/payments/${paymentId}/approve`,  // ✅ CORRECT URL
      {},  // ✅ Empty body
      {
        headers: {
          'Authorization': `Key ${PI_SERVER_API_KEY}`,  // ✅ CORRECT HEADER
          'Content-Type': 'application/json'
        }
      }
    );
    res.json({ success: true, payment: response.data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
```

### 2. Fix `backend/routes/pi.cjs` - Complete Endpoint
```javascript
router.post('/complete-payment', async (req, res) => {
  const { paymentId, txid } = req.body;
  try {
    const response = await axios.post(
      `https://api.minepi.com/v2/payments/${paymentId}/complete`,  // ✅ CORRECT URL
      { txid },  // ✅ Transaction ID required
      {
        headers: {
          'Authorization': `Key ${PI_SERVER_API_KEY}`,  // ✅ CORRECT HEADER
          'Content-Type': 'application/json'
        }
      }
    );
    
    // ✅ CRITICAL: Validate response
    if (response.status !== 200) {
      return res.status(response.status).json({
        error: 'Payment completion failed',
        details: response.data
      });
    }
    
    res.json({ success: true, payment: response.data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
```

### 3. Fix `src/utils/piPayment.ts` - Add Completion Callback
```typescript
export function createPiPayment(
  { amount, memo, metadata },
  {
    onServerApproval,
    onServerCompletion,  // ✅ ADD THIS
    onCancel,
    onError
  }
) {
  if (!window.Pi) throw new Error("Pi SDK not loaded");
  
  window.Pi.createPayment(
    { amount, memo, metadata },
    {
      onReadyForServerApproval: (paymentId) => {
        console.log('💳 Payment ready for approval:', paymentId);
        if (onServerApproval) onServerApproval(paymentId);
      },
      onReadyForServerCompletion: (paymentId, txid) => {  // ✅ ADD THIS
        console.log('✅ Payment ready for completion:', paymentId, txid);
        if (onServerCompletion) onServerCompletion(paymentId, txid);
      },
      onCancel: (paymentId) => {
        console.log('❌ Payment cancelled:', paymentId);
        if (onCancel) onCancel(paymentId);
      },
      onError: (error, payment) => {
        console.error('🔴 Payment error:', error, payment);
        if (onError) onError(error, payment);
      }
    }
  );
}
```

### 4. Fix ShopModal/Payment Flow
```typescript
// When user clicks "Buy with Pi":
async function handlePiPayment(item) {
  try {
    // Step 1: Create payment
    createPiPayment(
      { amount: item.piPrice, memo: `Purchase: ${item.name}`, metadata: { itemId: item.id } },
      {
        // Step 2: Frontend receives PaymentID
        onServerApproval: async (paymentId) => {
          console.log('Step 1: Approving payment', paymentId);
          
          // Step 3: Send to backend for approval
          const approvalRes = await fetch('/api/pi/approve-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId })
          });
          
          if (!approvalRes.ok) {
            throw new Error('Payment approval failed');
          }
          console.log('✅ Payment approved by server');
        },
        
        // Step 5: Frontend receives TxID after blockchain confirmation
        onServerCompletion: async (paymentId, txid) => {
          console.log('Step 3: Completing payment', paymentId, txid);
          
          // Step 6: Send to backend for completion
          const completeRes = await fetch('/api/pi/complete-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid })
          });
          
          if (!completeRes.ok) {
            throw new Error('Payment completion failed');
          }
          
          const completedPayment = await completeRes.json();
          console.log('✅ Payment completed');
          
          // NOW (and only now) deliver the item
          addToInventory(item);
          showSuccessNotification(`Purchased ${item.name}!`);
        },
        
        onCancel: (paymentId) => {
          console.log('❌ User cancelled payment');
          showErrorNotification('Payment cancelled');
        },
        
        onError: (error, payment) => {
          console.error('❌ Payment error:', error);
          showErrorNotification(`Payment failed: ${error.message}`);
        }
      }
    );
  } catch (error) {
    console.error('❌ Payment flow error:', error);
    showErrorNotification(`Error: ${error.message}`);
  }
}
```

---

## 📊 ENVIRONMENT VARIABLES REQUIRED

```ini
# For Pi API calls (server-side):
PI_SERVER_API_KEY="zrt9rwcjrdaejytlu72ha0yi2czvljx6geuwphzueaeybqsyboixukixy0cmogmo"

# For payment creation (frontend - can use PI_API_KEY):
VITE_PI_SERVER_API_KEY="zrt9rwcjrdaejytlu72ha0yi2czvljx6geuwphzueaeybqsyboixukixy0cmogmo"
```

---

## 🎯 SHOP INTEGRATION FLOW

```
User in Shop:
     ↓
User clicks "Buy with Pi"
     ↓
Frontend calls Pi.createPayment()
     ↓
Pi Wallet shows payment dialog
     ↓
Pi SDK calls onReadyForServerApproval(paymentId)
     ↓
Frontend sends paymentId to backend: POST /api/pi/approve-payment
     ↓
Backend calls: POST api.minepi.com/v2/payments/{paymentId}/approve
     ↓
Backend response: Payment approved ✅
     ↓
User sees payment confirmation dialog in Pi Wallet
     ↓
User confirms and signs with Pi Wallet
     ↓
Transaction submitted to blockchain
     ↓
Pi SDK calls onReadyForServerCompletion(paymentId, txid)
     ↓
Frontend sends txid to backend: POST /api/pi/complete-payment
     ↓
Backend calls: POST api.minepi.com/v2/payments/{paymentId}/complete
     ↓
Backend response: Payment completed ✅
     ↓
Frontend delivers item (add to inventory)
     ↓
Success notification shown to user ✅
```

---

## 🔗 SUBSCRIPTION INTEGRATION FLOW

Identical to shop, but:
1. Metadata includes `{ subscriptionPlan: "pro", monthlyRecurring: true }`
2. Memo shows: "Pi Subscription: Pro Plan (Monthly)"
3. After completion, update `subscriptions` table with expiration date

---

## 🚨 CRITICAL SECURITY NOTES

1. **Never trust client data**: Always validate payment completion on backend
2. **Check response status**: `if (status !== 200) { do not deliver }`
3. **Keep Server API Key secret**: Only use on server, never in frontend code
4. **Validate transaction**: Verify `txid` matches expected payment

---

## ✅ VALIDATION CHECKLIST

- [ ] Backend has correct `/approve` endpoint
- [ ] Backend has correct `/complete` endpoint  
- [ ] Both endpoints use `Authorization: Key` header
- [ ] Frontend implements both callbacks
- [ ] Payment flow waits for server approval before showing payment UI
- [ ] Payment delivered ONLY after server completion succeeds
- [ ] Error responses are handled (don't deliver on 4xx/5xx)
- [ ] Environment variables set correctly
- [ ] Subscription metadata includes plan details
- [ ] Database records payment transaction

---

## 🧪 QUICK TEST

```typescript
// Test in browser console:
console.log('PI_SERVER_API_KEY available:', !!process.env.PI_SERVER_API_KEY);
console.log('Payment endpoints available:', !!window.location.origin);

// Manual payment test (if Pi SDK loaded):
if (window.Pi) {
  window.Pi.createPayment(
    { amount: 0.01, memo: "Test Payment", metadata: {} },
    {
      onReadyForServerApproval: (id) => console.log('✅ Approval ready:', id),
      onReadyForServerCompletion: (id, tx) => console.log('✅ Completion ready:', id, tx),
      onError: (e) => console.error('❌ Error:', e)
    }
  );
}
```

---

## 📚 REFERENCE LINKS

- **Official Payments Docs**: https://github.com/pi-apps/pi-platform-docs/blob/master/payments.md
- **Platform API**: https://github.com/pi-apps/pi-platform-docs/blob/master/platform_API.md
- **Demo App**: https://github.com/pi-apps/demo

---

**Status**: Ready to implement fixes ✅  
**Priority**: HIGH - Payment system cannot work without these changes  
**Estimated Time**: 1-2 hours to implement all fixes
