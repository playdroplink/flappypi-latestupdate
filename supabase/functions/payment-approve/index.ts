// Supabase Edge Function - Payment Approval
// Approves Pi Network payments by calling Pi Network API
// Based on official Pi SDK payment documentation

// @ts-ignore - Deno imports work in Supabase Edge Runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const { paymentId, product } = await req.json();

    // Validate input
    if (!paymentId) {
      return new Response(
        JSON.stringify({ error: 'Payment ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!product) {
      return new Response(
        JSON.stringify({ error: 'Product information is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔄 Approving payment:', paymentId, 'for product:', product.name);

    // Get Pi Network API key from environment
    const piApiKey = Deno.env.get('PI_NETWORK_API_KEY');
    if (!piApiKey) {
      console.error('❌ PI_NETWORK_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error - API key missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Pi Network API to approve payment
    const approveResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${piApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!approveResponse.ok) {
      const errorText = await approveResponse.text();
      console.error('❌ Pi Network approval failed:', approveResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: `Payment approval failed: ${approveResponse.statusText}` }),
        { status: approveResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const approveData = await approveResponse.json();
    console.log('✅ Payment approved successfully:', approveData);

    return new Response(
      JSON.stringify({
        success: true,
        paymentId,
        approved: true,
        blockchainTx: approveData.blockchain_txn
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Payment approval error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});