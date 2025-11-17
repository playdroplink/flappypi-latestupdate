export interface AuthResults {
  accessToken: string;
  user: UserDTO;
}

export interface UserDTO {
  uid: string; // Add uid to the UserDTO interface
  username: string; // Add username to the UserDTO interface
  name?: string; // Optional fields if needed
  email?: string;
}

// Example usage of Pi.authenticate
const Pi = window.Pi;

// Request the username scope
const scopes = ['username'];

// Callback function to handle incomplete payments
function onIncompletePaymentFound(payment) {
  console.log("Incomplete payment found:", payment);
}

// Call the authenticate function
Pi.authenticate(scopes, onIncompletePaymentFound)
  .then(function (auth) {
    console.log("Authentication successful:", auth);
    console.log("Access Token:", auth.accessToken);
    console.log("User Info:", auth.user);
    console.log("User UID:", auth.user.uid);
    console.log("User Username:", auth.user.username);
  })
  .catch(function (error) {
    console.error("Authentication failed:", error);
  });

// Payment Data
const paymentData = {
  amount: 1, // Pi Amount being transacted
  memo: 'This is a Test Payment', // Information about the payment
  metadata: { InternalPaymentID: 1234 }, // Additional metadata
};

// Callbacks the developer needs to implement
const paymentCallbacks = {
  onReadyForServerApproval: function (paymentId: string) {
    console.log(`Payment ready for server approval: ${paymentId}`);
    // Send paymentId to your server for approval
  },
  onReadyForServerCompletion: function (paymentId: string, txid: string) {
    console.log(`Payment ready for server completion: ${paymentId}, Transaction ID: ${txid}`);
    // Send paymentId and txid to your server for completion
  },
  onCancel: function (paymentId: string) {
    console.log(`Payment canceled: ${paymentId}`);
    // Handle payment cancellation
  },
  onError: function (error: any, payment: any) {
    console.error(`Payment error: ${error}`, payment);
    // Handle payment errors
  },
};

// Call the createPayment function
Pi.createPayment(paymentData, paymentCallbacks)
  .then(function (payment) {
    console.log('Payment created successfully:', payment);
  })
  .catch(function (error) {
    console.error('Payment creation failed:', error);
  });