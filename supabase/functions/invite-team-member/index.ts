import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, full_name } = await req.json();
    
    console.log('Invite team member request:', { email, full_name });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the inviting user
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token || '');

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    console.log('Inviting user:', user.id);

    // Check if user already exists with this email
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    if (existingUser) {
      // User already has an account, just add them to team_members
      const { data: teamMember, error: teamError } = await supabase
        .from('team_members')
        .insert({
          user_id: existingUser.id,
          email: email,
          full_name: full_name,
          status: 'active',
          invited_by: user.id,
        })
        .select()
        .single();

      if (teamError) throw teamError;

      return new Response(
        JSON.stringify({ 
          success: true, 
          member: teamMember,
          message: 'User added to team'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create invitation for new user
    const redirectUrl = `${req.headers.get('origin') || 'https://9e73e8ae-0cd4-4dff-a6a9-69830d6fec81.lovableproject.com'}/auth?invited=true`;
    
    const { data: invitedUser, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: redirectUrl,
        data: {
          full_name: full_name,
          invited_by: user.id,
        }
      }
    );

    if (inviteError) {
      console.error('Invitation error:', inviteError);
      throw inviteError;
    }

    console.log('User invited:', invitedUser);

    // Add to team_members table with pending status
    const { data: teamMember, error: teamError } = await supabase
      .from('team_members')
      .insert({
        user_id: invitedUser.user.id,
        email: email,
        full_name: full_name,
        status: 'invited',
        invited_by: user.id,
      })
      .select()
      .single();

    if (teamError) {
      console.error('Team member insert error:', teamError);
      throw teamError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        member: teamMember,
        message: 'Invitation sent successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Invite team member error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
