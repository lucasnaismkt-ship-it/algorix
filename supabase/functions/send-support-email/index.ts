import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message, supportEmail } = await req.json();

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const destination = supportEmail || 'suporte@algorixinvest.com';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Algorix Suporte <noreply@algorixinvest.com>',
        to: [destination],
        reply_to: email,
        subject: `[Suporte] ${subject || 'Nova mensagem'} — ${name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 32px; border-radius: 16px;">
            <h2 style="color: #2563eb; margin-bottom: 24px;">Nova mensagem de suporte</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #888; width: 120px;">Nome</td><td style="padding: 8px 0; font-weight: bold;">${name}</td></tr>
              <tr><td style="padding: 8px 0; color: #888;">E-mail</td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #2563eb;">${email}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #888;">Assunto</td><td style="padding: 8px 0;">${subject || '—'}</td></tr>
            </table>
            <hr style="border: none; border-top: 1px solid #222; margin: 24px 0;" />
            <p style="color: #888; margin-bottom: 8px;">Mensagem:</p>
            <p style="background: #111; padding: 16px; border-radius: 8px; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
            <p style="color: #555; font-size: 12px; margin-top: 24px;">Responda diretamente a este e-mail para entrar em contato com o usuário.</p>
          </div>
        `,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Resend error:', data);
      return new Response(JSON.stringify({ error: data }), {
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
