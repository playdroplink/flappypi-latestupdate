// Pi Payment utility
export function createPiPayment({ amount, memo, metadata }, { onServerApproval, onServerCompletion, onCancel, onError }) {
  if (!window.Pi) throw new Error("Pi SDK not loaded");
  window.Pi.createPayment(
    { amount, memo, metadata },
    {
      onReadyForServerApproval: (paymentId) => {
        if (onServerApproval) onServerApproval(paymentId);
      },
      onReadyForServerCompletion: (paymentId, txid) => {
        if (onServerCompletion) onServerCompletion(paymentId, txid);
      },
      onCancel: (paymentId) => {
        if (onCancel) onCancel(paymentId);
      },
      onError: (error, payment) => {
        if (onError) onError(error, payment);
      }
    }
  );
} 