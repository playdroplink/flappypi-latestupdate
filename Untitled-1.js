const getPaymentInfo = async (paymentId: string) => {
  try {
    const headers = { Authorization: `key ${process.env.APIKEY}` };
    const response = await axios.get(`https://api.minepi.com/v2/payments/${paymentId}`, { headers });
    console.log('Payment Info:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment info:', error);
  }
};