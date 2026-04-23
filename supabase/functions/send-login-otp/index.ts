import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Store OTP in database via service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Invalidate any previous unused codes for this email
    await supabase
      .from('login_otp')
      .update({ used: true })
      .eq('email', email)
      .eq('used', false);

    // Insert new code
    const { error: insertError } = await supabase
      .from('login_otp')
      .insert({ email, code, expires_at: expiresAt });

    if (insertError) {
      console.error('DB insert error:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to generate OTP' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Algorix <noreply@algorixinvest.com>',
        to: [email],
        subject: `${code} é seu código de verificação — Algorix`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 40px 32px; border-radius: 20px; border: 1px solid #1a1a1a;">
            <div style="text-align: center; margin-bottom: 32px;">
              <img src="https://algorixinvest.com/logo.png" alt="Algorix" style="height: 48px; width: auto;" />
            </div>

            <h1 style="font-size: 22px; font-weight: 800; margin: 0 0 8px; text-align: center;">Verificação de Login</h1>
            <p style="color: #888; text-align: center; font-size: 14px; margin: 0 0 32px;">Use o código abaixo para confirmar seu acesso à plataforma.</p>

            <div style="background: #111; border: 1px solid #222; border-radius: 16px; padding: 28px; text-align: center; margin-bottom: 28px;">
              <p style="color: #888; font-size: 12px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 12px;">Código de verificação</p>
              <p style="font-size: 48px; font-weight: 900; letter-spacing: 0.25em; color: #2563eb; margin: 0; font-family: monospace;">${code}</p>
            </div>

            <p style="color: #666; font-size: 13px; text-align: center; margin: 0 0 8px;">⏱ Este código expira em <strong style="color: #fff;">10 minutos</strong>.</p>
            <p style="color: #555; font-size: 12px; text-align: center; margin: 0;">Se você não tentou fazer login, ignore este e-mail.</p>

            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #1a1a1a; text-align: center;">
              <p style="color: #444; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} Algorix Invest · Singapura</p>
            </div>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      console.error('Resend error:', data);
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
