// Supabase Edge Function - Pi Token Validation
// Validates Pi Network access token by calling Pi API and establishes session
// Based on official Pi SDK authentication flow

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
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { accessToken } = await req.json()

    // Validate access token presence
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Access token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate access token format
    if (typeof accessToken !== 'string' || accessToken.length < 10 || accessToken.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Invalid access token format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Validating Pi access token with Pi Network API...')

    // Step 1: Validate the Pi access token with Pi Network API
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
    
    // Validate that we received the expected data structure
    if (!piUserData || !piUserData.uid || !piUserData.username) {
      console.error('Invalid Pi user data structure:', piUserData)
      return new Response(
        JSON.stringify({ error: 'Invalid user data received from Pi API' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('Pi user verified successfully:', piUserData.username)

    // Step 2: Initialize Supabase Admin client
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

    // Step 3: Check if user already exists in Supabase
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserById(piUserData.uid)

    let user
    if (existingUser.user) {
      // User exists, update their metadata
      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        piUserData.uid,
        {
          user_metadata: {
            username: piUserData.username,
            pi_access_token: accessToken,
            last_login: new Date().toISOString(),
            verified_pi_user: true
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
        id: piUserData.uid,
        email: `${piUserData.uid}@pi.network`,
        email_confirm: true,
        user_metadata: {
          username: piUserData.username,
          pi_access_token: accessToken,
          provider: 'pi_network',
          created_at: new Date().toISOString(),
          verified_pi_user: true
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

    // Step 4: Generate session token
    const { data: tokenData, error: tokenError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: `${piUserData.uid}@pi.network`
    })

    if (tokenError) {
      console.error('Error generating tokens:', tokenError)
      return new Response(
        JSON.stringify({ error: 'Failed to generate session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Pi authentication successful for user:', piUserData.username)

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          uid: piUserData.uid,
          username: piUserData.username
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
    console.error('Pi token validation error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
