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

  // Fetch the user's role from the public.user_profiles table
  const { data: profile, error: profileError } = await supabaseClient
    .from('user_profiles')
    .select('role')
    .eq('pi_user_id', user.id) // Assuming pi_user_id is the unique identifier for the user
    .single();

  if (profileError || !profile) {
    console.error("Error fetching user profile:", profileError?.message);
    return new Response(JSON.stringify({ error: "Unauthorized: User profile not found" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (profile.role !== 'admin') {
    console.warn(`User ${user.id} (role: ${profile.role}) attempted to access admin function.`);
    return new Response(JSON.stringify({ error: "Forbidden: User is not an admin" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // If the user is an admin, proceed. For this function, we just verify.
  // In a real scenario, you'd chain this verification before calling another admin function.
  return new Response(JSON.stringify({ message: "Admin role verified", userId: user.id }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}); 