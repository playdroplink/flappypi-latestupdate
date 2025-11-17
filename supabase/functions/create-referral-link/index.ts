import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

interface WebhookPayload {
  pi_user_id: string;
}

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  try {
    const payload: WebhookPayload = await req.json();
    const { pi_user_id } = payload;

    if (!pi_user_id) {
      return new Response(JSON.stringify({ error: 'Missing pi_user_id' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Generate a unique referral code
    const referralCode = uuidv4().replace(/-/g, '').substring(0, 10); // Example: 10-char alphanumeric

    // Update the user's profile with the new referral code
    const { error } = await supabase
      .from('user_profiles')
      .update({ referral_code: referralCode })
      .eq('pi_user_id', pi_user_id);

    if (error) {
      console.error('Error updating user profile:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ referralCode }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 