import { createClient } from '@supabase/supabase-js';

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

    // Fetch user's current referral_earned_coins and total_coins
    const { data: userProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('referral_earned_coins, total_coins')
      .eq('pi_user_id', pi_user_id)
      .single();

    if (fetchError || !userProfile) {
      console.error('Error fetching user profile or user not found:', fetchError);
      return new Response(JSON.stringify({ error: 'User not found or fetch error' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    const amountToCashOut = userProfile.referral_earned_coins || 0;

    if (amountToCashOut === 0) {
      return new Response(JSON.stringify({ success: false, error: 'No referral coins to cash out' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const newTotalCoins = (userProfile.total_coins || 0) + amountToCashOut;

    // Update user's total_coins and reset referral_earned_coins
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        total_coins: newTotalCoins,
        referral_earned_coins: 0,
      })
      .eq('pi_user_id', pi_user_id);

    if (updateError) {
      console.error('Error cashing out referral coins:', updateError);
      return new Response(JSON.stringify({ error: updateError.message }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully cashed out ${amountToCashOut} Flappy Coins!`,
      amount: amountToCashOut,
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error processing cash-out-referral-coins request:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 