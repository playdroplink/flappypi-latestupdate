const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

// POST /api/user/save - Save or update user profile
router.post('/save', async (req, res) => {
  const { uid, username, ...rest } = req.body;
  if (!uid || !username) {
    return res.status(400).json({ error: 'uid and username are required' });
  }
  try {
    // Upsert user profile (insert or update if exists)
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert([
        { uid, username, ...rest }
      ], { onConflict: ['uid'] })
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
