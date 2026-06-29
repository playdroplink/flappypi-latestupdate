// Supabase Edge Function - Payment Completion
// Completes Pi Network payments by calling Pi Network API and delivering products
// Based on official Pi SDK payment documentation

// @ts-ignore - Deno imports work in Supabase Edge Runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore - Deno imports work in Supabase Edge Runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Deno environment types
interface DenoEnv {
  get(key: string): string | undefined;
}

declare const Deno: {
  env: DenoEnv;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { paymentId, txid, product } = await req.json();

    // Validate input
    if (!paymentId) {
      return new Response(
        JSON.stringify({ error: 'Payment ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!txid) {
      return new Response(
        JSON.stringify({ error: 'Transaction ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!product) {
      return new Response(
        JSON.stringify({ error: 'Product information is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔄 Completing payment:', paymentId, 'with txid:', txid, 'for product:', product.name);

    // Get Pi Network API key from environment
    const piApiKey = Deno.env.get('PI_NETWORK_API_KEY');
    if (!piApiKey) {
      console.error('❌ PI_NETWORK_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error - API key missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Pi Network API to complete payment
    const completeResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${piApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ txid })
    });

    if (!completeResponse.ok) {
      const errorText = await completeResponse.text();
      console.error('❌ Pi Network completion failed:', completeResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: `Payment completion failed: ${completeResponse.statusText}` }),
        { status: completeResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const completeData = await completeResponse.json();
    console.log('✅ Payment completed successfully on Pi Network:', completeData);

    // Initialize Supabase client for product delivery
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Deliver product based on type
    const userId = product.metadata?.user_id;
    if (!userId) {
      console.error('❌ User ID not found in product metadata');
      return new Response(
        JSON.stringify({ error: 'User information missing' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await deliverProduct(supabaseAdmin, userId, product, paymentId, txid);

    return new Response(
      JSON.stringify({
        success: true,
        paymentId,
        completed: true,
        product_delivered: true
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Payment completion error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Product delivery function
async function deliverProduct(supabaseAdmin: any, userId: string, product: any, paymentId: string, txid: string) {
  console.log('📦 Delivering product:', product.type, 'to user:', userId);

  switch (product.type) {
    case 'game_lives':
      await deliverGameLives(supabaseAdmin, userId, product, paymentId, txid);
      break;
    case 'premium_skins':
      await deliverPremiumSkin(supabaseAdmin, userId, product, paymentId, txid);
      break;
    case 'subscription':
      await deliverSubscription(supabaseAdmin, userId, product, paymentId, txid);
      break;
    case 'coins':
      await deliverCoins(supabaseAdmin, userId, product, paymentId, txid);
      break;
    default:
      console.error('❌ Unknown product type:', product.type);
  }
}

async function deliverGameLives(supabaseAdmin: any, userId: string, product: any, paymentId: string, txid: string) {
  const lives = product.metadata?.lives || 1;
  console.log('💖 Delivering', lives, 'game lives to user:', userId);

  // Update user's game lives in database
  const { error } = await supabaseAdmin
    .from('user_inventory')
    .upsert({
      user_id: userId,
      item_type: 'game_lives',
      quantity: lives,
      payment_id: paymentId,
      txid: txid,
      acquired_at: new Date().toISOString()
    }, { onConflict: 'user_id,item_type' });

  if (error) {
    console.error('❌ Error delivering game lives:', error);
    throw error;
  }

  console.log('✅ Game lives delivered successfully');
}

async function deliverPremiumSkin(supabaseAdmin: any, userId: string, product: any, paymentId: string, txid: string) {
  const skinId = product.metadata?.skin_id;
  const themeId = product.metadata?.theme_id;
  console.log('🎨 Delivering premium skin/theme to user:', userId, skinId || themeId);

  const itemId = skinId || themeId;
  if (!itemId) {
    throw new Error('Skin or theme ID not found in product metadata');
  }

  // Add premium skin to user's inventory
  const { error } = await supabaseAdmin
    .from('user_inventory')
    .upsert({
      user_id: userId,
      item_type: 'premium_skin',
      item_id: itemId,
      rarity: product.metadata?.rarity || 'common',
      payment_id: paymentId,
      txid: txid,
      acquired_at: new Date().toISOString()
    }, { onConflict: 'user_id,item_id' });

  if (error) {
    console.error('❌ Error delivering premium skin:', error);
    throw error;
  }

  console.log('✅ Premium skin delivered successfully');
}

async function deliverSubscription(supabaseAdmin: any, userId: string, product: any, paymentId: string, txid: string) {
  const plan = product.metadata?.plan;
  const durationDays = product.metadata?.duration_days || 30;
  console.log('⭐ Delivering subscription to user:', userId, 'plan:', plan, 'duration:', durationDays, 'days');

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + durationDays);

  // Create or update subscription
  const { error } = await supabaseAdmin
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      plan_type: plan,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      payment_id: paymentId,
      txid: txid,
      status: 'active',
      created_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

  if (error) {
    console.error('❌ Error delivering subscription:', error);
    throw error;
  }

  console.log('✅ Subscription delivered successfully');
}

async function deliverCoins(supabaseAdmin: any, userId: string, product: any, paymentId: string, txid: string) {
  const coins = product.metadata?.coins || 0;
  console.log('💰 Delivering', coins, 'coins to user:', userId);

  // Get current coin balance
  const { data: currentBalance } = await supabaseAdmin
    .from('user_wallets')
    .select('coin_balance')
    .eq('user_id', userId)
    .single();

  const currentCoins = currentBalance?.coin_balance || 0;
  const newBalance = currentCoins + coins;

  // Update user's coin balance
  const { error } = await supabaseAdmin
    .from('user_wallets')
    .upsert({
      user_id: userId,
      coin_balance: newBalance,
      last_updated: new Date().toISOString()
    }, { onConflict: 'user_id' });

  if (error) {
    console.error('❌ Error delivering coins:', error);
    throw error;
  }

  // Log coin transaction
  await supabaseAdmin
    .from('coin_transactions')
    .insert({
      user_id: userId,
      amount: coins,
      transaction_type: 'purchase',
      payment_id: paymentId,
      txid: txid,
      created_at: new Date().toISOString()
    });

  console.log('✅ Coins delivered successfully. New balance:', newBalance);
}