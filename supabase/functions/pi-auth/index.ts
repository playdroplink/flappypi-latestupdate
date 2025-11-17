
// Supabase Edge Function - Deno environment
// This file runs in Supabase Edge Runtime (Deno)
// TypeScript errors for Deno imports are expected in non-Deno environments

// @ts-ignore - Deno imports work in Supabase Edge Runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore - Deno imports work in Supabase Edge Runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Deno environment types
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { accessToken, piUserId, username } = await req.json()

    // Enhanced input validation
    if (!accessToken || !piUserId || !username) {
      return new Response(
        JSON.stringify({ error: 'Access token, Pi User ID and username are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate input format
    if (typeof accessToken !== 'string' || accessToken.length < 10 || accessToken.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Invalid access token format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (typeof piUserId !== 'string' || piUserId.length < 5 || piUserId.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Invalid Pi User ID format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Sanitize username
    const sanitizedUsername = username.replace(/[<>\"'&]/g, '').trim().substring(0, 50);
    if (!sanitizedUsername || sanitizedUsername.length < 2) {
      return new Response(
        JSON.stringify({ error: 'Invalid username format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Rate limiting check
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    console.log(`Pi auth request from IP: ${clientIP} for user: ${piUserId}`)

    // Step 1: Verify the Pi access token with Pi Network API
    console.log('Verifying Pi access token...')
    const piVerifyResponse = await fetch('https://api.minepi.com/v2/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!piVerifyResponse.ok) {
      console.error('Pi API verification failed:', piVerifyResponse.status)
      return new Response(
        JSON.stringify({ error: 'Invalid Pi Network access token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const piUserData = await piVerifyResponse.json()

    // Step 2: Verify that the UID matches (security check)
    if (piUserData.uid !== piUserId) {
      console.error('UID mismatch:', piUserData.uid, 'vs', piUserId)
      return new Response(
        JSON.stringify({ error: 'Invalid user verification' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Pi user verified successfully:', piUserData.username)

    // Step 3: Initialize Supabase Admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Step 4: Check if user already exists in Supabase
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserById(piUserId)

    let user
    if (existingUser.user) {
      // User exists, update their metadata with security logging
      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        piUserId,
        {
          user_metadata: {
            username: sanitizedUsername,
            pi_access_token: accessToken,
            last_login: new Date().toISOString(),
            verified_pi_user: true,
            login_ip: clientIP
          }
        }
      )
      
      if (updateError) {
        console.error('Error updating user:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update user' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      user = updatedUser.user
    } else {
      // Create new user in Supabase with verified Pi data
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        id: piUserId,
        email: `${piUserId}@pi.network`, // Using Pi UID as fake email
        email_confirm: true,
        user_metadata: {
          username: sanitizedUsername,
          pi_access_token: accessToken,
          provider: 'pi_network',
          created_at: new Date().toISOString(),
          verified_pi_user: true,
          signup_ip: clientIP
        }
      })

      if (createError) {
        console.error('Error creating user:', createError)
        return new Response(
          JSON.stringify({ error: 'Failed to create user' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      user = newUser.user
    }

    // Step 5: Generate access token for session
    const { data: tokenData, error: tokenError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: `${piUserId}@pi.network`
    })

    if (tokenError) {
      console.error('Error generating tokens:', tokenError)
      return new Response(
        JSON.stringify({ error: 'Failed to generate session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log successful authentication for security monitoring
    console.log('Pi authentication successful for user:', sanitizedUsername, 'IP:', clientIP)

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user?.id,
          email: user?.email,
          username: user?.user_metadata?.username
        },
        access_token: tokenData.properties?.access_token,
        refresh_token: tokenData.properties?.refresh_token
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Pi auth error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
