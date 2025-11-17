import { createClient } from '@supabase/supabase-js';

interface WebhookPayload {
  referrer_id: string;
  new_user_id: string;
}

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

const REFERRAL_REWARD_AMOUNT = 100; // 100 Flappy Coins

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  try {
    const payload: WebhookPayload = await req.json();
    const { referrer_id, new_user_id } = payload;

    if (!referrer_id || !new_user_id) {
      return new Response(JSON.stringify({ error: 'Missing referrer_id or new_user_id' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // 1. Award Flappy Coins to the referrer (add to referral_earned_coins)
    const { data: referrerProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('referral_earned_coins')
      .eq('pi_user_id', referrer_id)
      .single();

    if (fetchError || !referrerProfile) {
      console.error('Error fetching referrer profile or referrer not found:', fetchError);
      return new Response(JSON.stringify({ error: 'Referrer not found or fetch error' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    const newReferralEarnedCoins = (referrerProfile.referral_earned_coins || 0) + REFERRAL_REWARD_AMOUNT;

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ referral_earned_coins: newReferralEarnedCoins })
      .eq('pi_user_id', referrer_id);

    if (updateError) {
      console.error('Error updating referrer coins:', updateError);
      return new Response(JSON.stringify({ error: updateError.message }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // 2. Link the new user to the referrer
    const { error: newUserUpdateError } = await supabase
      .from('user_profiles')
      .update({ referred_by: referrer_id })
      .eq('pi_user_id', new_user_id);
    
    if (newUserUpdateError) {
      console.error('Error linking new user to referrer:', newUserUpdateError);
      // This error might not be critical enough to fail the entire response,
      // but it's important for tracking.
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully rewarded ${REFERRAL_REWARD_AMOUNT} Flappy Coins to ${referrer_id}`,
      rewardAmount: REFERRAL_REWARD_AMOUNT,
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error processing track-referral request:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 