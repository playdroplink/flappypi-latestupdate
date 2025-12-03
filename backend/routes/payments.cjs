const express = require('express');
const router = express.Router();

// Import ESM default export from CommonJS
const PiService = require('../services/piService.js').default;

// Lazily create a single PiService instance to avoid repeated init
let piServiceInstance = null;
function getPiService() {
	if (!piServiceInstance) {
		piServiceInstance = new PiService();
	}
	return piServiceInstance;
}

// POST /api/payments/create - Create A2U payment (App -> User)
router.post('/create', async (req, res) => {
	try {
		const { amount, memo, metadata, user_id, skin_id } = req.body || {};
		if (!amount || !memo || !user_id) {
			return res.status(400).json({ error: 'amount, memo and user_id are required' });
		}
		// If purchasing a skin, check supply and deduct
		if (metadata && metadata.type === 'skin' && skin_id) {
			const db = getPiService().db;
			const purchaseSuccess = await db.purchaseSkinAndDeductSupply(skin_id, user_id);
			if (!purchaseSuccess) {
				return res.status(409).json({ success: false, error: 'Skin is sold out!' });
			}
		}
		const pi = getPiService();
		const paymentId = await pi.createPayment({ amount, memo, metadata, user_id });
		return res.json({ success: true, paymentId });
	} catch (error) {
		return res.status(400).json({ success: false, error: error.message || 'Failed to create payment' });
	}
});

// POST /api/payments/submit - Submit payment to blockchain
router.post('/submit', async (req, res) => {
	try {
		const { paymentId } = req.body || {};
		if (!paymentId) {
			return res.status(400).json({ error: 'paymentId is required' });
		}
		const pi = getPiService();
		const txid = await pi.submitPayment(paymentId);
		return res.json({ success: true, paymentId, txid });
	} catch (error) {
		return res.status(400).json({ success: false, error: error.message || 'Failed to submit payment' });
	}
});

// POST /api/payments/complete - Complete a payment
router.post('/complete', async (req, res) => {
	try {
		const { paymentId, txid } = req.body || {};
		if (!paymentId || !txid) {
			return res.status(400).json({ error: 'paymentId and txid are required' });
		}
		const pi = getPiService();
		const payment = await pi.completePayment(paymentId, txid);
		return res.json({ success: true, payment });
	} catch (error) {
		return res.status(400).json({ success: false, error: error.message || 'Failed to complete payment' });
	}
});

// POST /api/payments/process-a2u - Create, submit and complete in one call
router.post('/process-a2u', async (req, res) => {
	try {
		const { amount, memo, metadata, user_id } = req.body || {};
		if (!amount || !memo || !user_id) {
			return res.status(400).json({ error: 'amount, memo and user_id are required' });
		}
		const pi = getPiService();
		const result = await pi.processA2UPayment({ amount, memo, metadata, user_id });
		return res.json(result);
	} catch (error) {
		return res.status(400).json({ success: false, error: error.message || 'Failed to process payment' });
	}
});

// GET /api/payments/:paymentId - Get payment details
router.get('/:paymentId', async (req, res) => {
	try {
		const { paymentId } = req.params;
		const pi = getPiService();
		const payment = await pi.getPayment(paymentId);
		return res.json({ success: true, payment });
	} catch (error) {
		return res.status(400).json({ success: false, error: error.message || 'Failed to get payment' });
	}
});

// POST /api/payments/cancel - Cancel payment
router.post('/cancel', async (req, res) => {
	try {
		const { paymentId } = req.body || {};
		if (!paymentId) {
			return res.status(400).json({ error: 'paymentId is required' });
		}
		const pi = getPiService();
		const cancelled = await pi.cancelPayment(paymentId);
		return res.json({ success: true, payment: cancelled });
	} catch (error) {
		return res.status(400).json({ success: false, error: error.message || 'Failed to cancel payment' });
	}
});

// GET /api/payments/incomplete/list - List incomplete server-side payments
router.get('/incomplete/list', async (_req, res) => {
	try {
		const pi = getPiService();
		const payments = await pi.getIncompleteServerPayments();
		return res.json({ success: true, payments });
	} catch (error) {
		return res.status(400).json({ success: false, error: error.message || 'Failed to list incomplete payments' });
	}
});

module.exports = router;


