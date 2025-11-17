// @ts-ignore
/// <reference types="deno.ns" />
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
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", // Use service role key for RLS bypass if needed
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  // Get the user's session from the request headers
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized: No Authorization header" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

  if (userError || !user) {
    console.error("User authentication error:", userError?.message);
    return new Response(JSON.stringify({ error: "Unauthorized: Invalid user session" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // --- Admin Role Verification (Copied from verify-admin-role function) ---
  const { data: profile, error: profileError } = await supabaseClient
    .from('user_profiles')
    .select('role')
    .eq('pi_user_id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    console.warn(`User ${user.id} (role: ${profile?.role}) attempted to access send-flappy-coins function without admin role.`);
    return new Response(JSON.stringify({ error: "Forbidden: Not an admin user" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  // --- End Admin Role Verification ---

  let requestBody;
  try {
    requestBody = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { target_pi_user_id, amount } = requestBody;

  if (!target_pi_user_id || typeof amount !== 'number' || amount <= 0) {
    return new Response(JSON.stringify({ error: 'Invalid parameters: target_pi_user_id and amount (positive number) are required.' }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Fetch the target user's current coins
    const { data: userProfile, error: fetchError } = await supabaseClient
      .from('user_profiles')
      .select('total_coins, username')
      .eq('pi_user_id', target_pi_user_id)
      .single();

    if (fetchError || !userProfile) {
      console.error(`Error fetching target user profile ${target_pi_user_id}:`, fetchError?.message);
      return new Response(JSON.stringify({ error: 'Target user not found or database error.' }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const newTotalCoins = (userProfile.total_coins || 0) + amount;

    // Update the target user's coins
    const { error: updateError } = await supabaseClient
      .from('user_profiles')
      .update({ total_coins: newTotalCoins })
      .eq('pi_user_id', target_pi_user_id);

    if (updateError) {
      console.error('Error updating user coins:', updateError.message);
      return new Response(JSON.stringify({ error: 'Failed to update user coins.' }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`Admin ${user.id} sent ${amount} Flappy Coins to ${target_pi_user_id} (${userProfile.username}). New total: ${newTotalCoins}`);
    
    return new Response(JSON.stringify({
      message: `Successfully sent ${amount} Flappy Coins to ${userProfile.username}.`,
      new_total_coins: newTotalCoins,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Unhandled error in send-flappy-coins function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error.' }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}); 