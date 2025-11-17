import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.1";

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  let requestBody;
  try {
    requestBody = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { adId, userId, rewardType } = requestBody;
  if (!adId || !userId || !rewardType) {
    return new Response(JSON.stringify({ error: 'Missing adId, userId, or rewardType' }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 1. Verify with Pi Platform API
  let piRes, data;
  try {
          piRes = await fetch(`https://api.testnet.minepi.com/v2/ads/rewarded/${adId}/verify`, {
      headers: { Authorization: `Bearer ${Deno.env.get('PI_API_KEY')}` }
    });
    data = await piRes.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to verify with Pi Platform API' }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (data.mediator_ack_status !== "granted") {
    return new Response(JSON.stringify({ rewarded: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Grant reward in DB
  if (rewardType === 'revive') {
    // You may want to update a revive count or status for the user
    // For now, just return success
    return new Response(JSON.stringify({ rewarded: true, reward: { type: 'revive' } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } else if (rewardType === 'coins') {
    // Add 10 coins to user
    const { data: userProfile, error: fetchError } = await supabaseClient
      .from('user_profiles')
      .select('total_coins')
      .eq('pi_user_id', userId)
      .single();
    if (fetchError || !userProfile) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    const newTotal = (userProfile.total_coins || 0) + 10;
    const { error: updateError } = await supabaseClient
      .from('user_profiles')
      .update({ total_coins: newTotal })
      .eq('pi_user_id', userId);
    if (updateError) {
      return new Response(JSON.stringify({ error: 'Failed to update coins' }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ rewarded: true, reward: { type: 'coins', amount: 10 } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  // Add more reward types as needed
  return new Response(JSON.stringify({ rewarded: true, reward: { type: rewardType } }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}); 