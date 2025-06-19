import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string
  inviterName: string
  organizationName: string
  invitationUrl: string
  recipientName: string
  role: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user is authenticated
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { to, inviterName, organizationName, invitationUrl, recipientName, role }: EmailRequest = await req.json()

    // Validate required fields
    if (!to || !inviterName || !organizationName || !invitationUrl || !recipientName || !role) {
      throw new Error('Missing required fields')
    }

    // Get email service configuration from environment
    const emailService = Deno.env.get('EMAIL_SERVICE') || 'resend' // Default to Resend
    
    let emailSent = false
    let emailError = null

    if (emailService === 'resend') {
      // Use Resend API
      const resendApiKey = Deno.env.get('RESEND_API_KEY')
      if (!resendApiKey) {
        throw new Error('RESEND_API_KEY not configured')
      }

      const emailHtml = generateEmailHTML({
        recipientName,
        inviterName,
        organizationName,
        invitationUrl,
        role
      })

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: Deno.env.get('FROM_EMAIL') || 'EPKalk <noreply@epkalk.no>',
          to: [to],
          subject: `Invitasjon til ${organizationName} - EPKalk`,
          html: emailHtml,
        }),
      })

      if (!emailResponse.ok) {
        const errorData = await emailResponse.text()
        emailError = `Resend API error: ${errorData}`
      } else {
        emailSent = true
      }
    } else if (emailService === 'sendgrid') {
      // Use SendGrid API
      const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY')
      if (!sendgridApiKey) {
        throw new Error('SENDGRID_API_KEY not configured')
      }

      const emailHtml = generateEmailHTML({
        recipientName,
        inviterName,
        organizationName,
        invitationUrl,
        role
      })

      const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: to, name: recipientName }],
            subject: `Invitasjon til ${organizationName} - EPKalk`
          }],
          from: {
            email: Deno.env.get('FROM_EMAIL') || 'noreply@epkalk.no',
            name: 'EPKalk'
          },
          content: [{
            type: 'text/html',
            value: emailHtml
          }]
        }),
      })

      if (!emailResponse.ok) {
        const errorData = await emailResponse.text()
        emailError = `SendGrid API error: ${errorData}`
      } else {
        emailSent = true
      }
    } else {
      throw new Error(`Unsupported email service: ${emailService}`)
    }

    if (!emailSent) {
      throw new Error(emailError || 'Failed to send email')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invitation email sent successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error sending invitation email:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

function generateEmailHTML({ recipientName, inviterName, organizationName, invitationUrl, role }: {
  recipientName: string
  inviterName: string
  organizationName: string
  invitationUrl: string
  role: string
}): string {
  const roleText = role === 'admin' ? 'Administrator' : role === 'manager' ? 'Manager' : 'Bruker'
  
  return `
<!DOCTYPE html>
<html lang="no">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitasjon til ${organizationName}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            color: white;
            font-size: 24px;
            font-weight: bold;
        }
        .title {
            color: #1f2937;
            font-size: 28px;
            font-weight: bold;
            margin: 0 0 10px 0;
        }
        .subtitle {
            color: #6b7280;
            font-size: 16px;
            margin: 0;
        }
        .content {
            margin: 30px 0;
        }
        .invitation-details {
            background: #f3f4f6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .detail-row:last-child {
            margin-bottom: 0;
        }
        .detail-label {
            color: #6b7280;
            font-weight: 500;
        }
        .detail-value {
            color: #1f2937;
            font-weight: 600;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-1px);
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .warning {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 12px;
            margin: 20px 0;
            font-size: 14px;
            color: #92400e;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .container {
                padding: 20px;
            }
            .title {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">EP</div>
            <h1 class="title">Du er invitert!</h1>
            <p class="subtitle">Bli med i ${organizationName} på EPKalk</p>
        </div>
        
        <div class="content">
            <p>Hei ${recipientName},</p>
            
            <p><strong>${inviterName}</strong> har invitert deg til å bli med i organisasjonen <strong>${organizationName}</strong> på EPKalk - et profesjonelt kalkyleverktøy for prosjektstyring.</p>
            
            <div class="invitation-details">
                <div class="detail-row">
                    <span class="detail-label">Organisasjon:</span>
                    <span class="detail-value">${organizationName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Din rolle:</span>
                    <span class="detail-value">${roleText}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Invitert av:</span>
                    <span class="detail-value">${inviterName}</span>
                </div>
            </div>
            
            <p>For å akseptere invitasjonen, klikk på knappen nedenfor:</p>
            
            <div style="text-align: center;">
                <a href="${invitationUrl}" class="cta-button">Aksepter invitasjon</a>
            </div>
            
            <div class="warning">
                <strong>Viktig:</strong> Denne invitasjonen utløper om 7 dager. Hvis du ikke har en EPKalk-konto, vil du bli bedt om å opprette en når du klikker på lenken.
            </div>
            
            <p>Hvis du har problemer med å klikke på knappen, kan du kopiere og lime inn denne lenken i nettleseren din:</p>
            <p style="word-break: break-all; color: #6366f1; font-family: monospace; font-size: 14px;">${invitationUrl}</p>
        </div>
        
        <div class="footer">
            <p>Denne e-posten ble sendt fra EPKalk. Hvis du ikke forventet denne invitasjonen, kan du trygt ignorere denne e-posten.</p>
            <p>© 2025 EPKalk - Kalkyleverktøy for profesjonelle</p>
        </div>
    </div>
</body>
</html>
  `
}