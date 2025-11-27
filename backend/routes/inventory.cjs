const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

// POST /api/inventory/save - Save claimed rewards to user_inventory
router.post('/save', async (req, res) => {
  const { user_id, items } = req.body;
  if (!user_id || !Array.isArray(items)) {
    return res.status(400).json({ error: 'user_id and items are required' });
  }
  try {
    const { data, error } = await supabase
      .from('user_inventory')
      .insert(items.map(item => ({
        user_id,
        item_type: item.type,
        item_id: item.id,
        item_name: item.name,
        quantity: item.quantity,
        metadata: item.metadata || {},
      })));
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
