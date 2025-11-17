
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const { paymentId, metadata } = await req.json();

    // Enhanced validation
    if (!paymentId || typeof paymentId !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Valid payment ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate payment ID format
    if (!/^[a-zA-Z0-9_-]{10,100}$/.test(paymentId)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid payment ID format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate metadata if provided
    if (metadata && typeof metadata !== 'object') {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid metadata format' }),
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

    // Log the approval attempt for security monitoring
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    console.log(`Payment approval request from IP: ${clientIP} for payment: ${paymentId}`);

    // Call Pi Network API to approve payment (using testnet)
    const piResponse = await fetch(
              `https://api.minepi.com/v2/payments/${paymentId}/approve`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Key ${piApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const piData = await piResponse.json();

    if (!piResponse.ok) {
      console.error('Pi API approval failed:', piData);
      
      // Log failed payment approval
      console.error(`Payment approval failed for ${paymentId} from IP ${clientIP}:`, piData);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Payment approval failed',
          details: piData 
        }),
        { 
          status: piResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Payment approved successfully:', paymentId, 'IP:', clientIP);

    return new Response(
      JSON.stringify({ success: true, data: piData }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    console.error(`Error in pi-approve-payment from IP ${clientIP}:`, error);
    
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
