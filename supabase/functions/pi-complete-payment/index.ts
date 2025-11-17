
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paymentId, txid, metadata } = await req.json();

    if (!paymentId || !txid) {
      return new Response(
        JSON.stringify({ success: false, error: 'Payment ID and transaction ID are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const piApiKey = Deno.env.get('PI_API_KEY');
    if (!piApiKey) {
      console.error('PI_API_KEY not found in environment variables');
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Completing payment: ${paymentId} with txid: ${txid}`);

    // Call Pi Network API to complete payment (using testnet)
    const piResponse = await fetch(
              `https://api.minepi.com/v2/payments/${paymentId}/complete`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Key ${piApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ txid }),
      }
    );

    const piData = await piResponse.json();

    if (!piResponse.ok) {
      console.error('Pi API completion failed:', piData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Payment completion failed',
          details: piData 
        }),
        { 
          status: piResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Payment completed successfully:', paymentId);

    // Process the purchase based on metadata
    if (metadata) {
      try {
        await processPurchase(supabase, metadata, paymentId);
      } catch (error) {
        console.error('Error processing purchase:', error);
        // Don't fail the payment completion, just log the error
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: piData }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in pi-complete-payment:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function processPurchase(supabase: any, metadata: any, paymentId: string) {
  const { type, itemId, user_id } = metadata;

  if (!user_id) {
    console.log('No user_id in metadata, skipping purchase processing');
    return;
  }

  console.log(`Processing purchase for user ${user_id}: type=${type}, itemId=${itemId}`);

  switch (type) {
    case 'subscription':
      // Handle premium subscription
      await supabase
        .from('user_profiles')
        .update({ 
          premium_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        })
        .eq('pi_user_id', user_id);
      break;

    case 'skin':
      // Add skin to user inventory
      await supabase
        .from('user_inventory')
        .upsert({
          pi_user_id: user_id,
          item_type: 'skin',
          item_id: itemId,
          quantity: 1
        });
      break;

    case 'no-ads':
      // Grant permanent ad removal
      await supabase
        .from('user_profiles')
        .update({ 
          ad_free_permanent: true 
        })
        .eq('pi_user_id', user_id);
      break;

    default:
      console.log(`Unknown purchase type: ${type}`);
  }

  // Record the purchase
  await supabase
    .from('purchases')
    .insert({
      pi_user_id: user_id,
      item_type: type === 'skin' ? 'skin' : 'subscription',
      item_id: itemId || type,
      cost_coins: 0, // Pi payment, not coins
      pi_transaction_id: paymentId
    });
}
