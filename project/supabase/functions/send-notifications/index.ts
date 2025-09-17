import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { emails, subject, message, type } = await req.json()

    // Validate input
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No email addresses provided' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    if (!subject || !message) {
      return new Response(
        JSON.stringify({ error: 'Subject and message are required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    // Get Resend API key from environment variables
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      )
    }

    // Send emails using Resend API
    const emailPromises = emails.map(async (email: string) => {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Fashion Walk Club <noreply@resend.dev>', // Using Resend's default domain
            to: [email],
            subject: subject,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                <div style="background: linear-gradient(135deg, #FFD700, #003366); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Fashion Walk Club</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Official Notification</p>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 8px; border-left: 4px solid #FFD700; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <h2 style="color: #003366; margin-top: 0; font-size: 22px; font-weight: bold;">${subject}</h2>
                  <div style="color: #333; line-height: 1.6; font-size: 16px;">
                    ${message.split('\n').map((line: string) => `<p style="margin: 10px 0;">${line}</p>`).join('')}
                  </div>
                </div>
                
                <div style="margin-top: 30px; padding: 20px; background: white; border: 1px solid #e9ecef; border-radius: 8px; text-align: center;">
                  <p style="color: #666; font-size: 14px; margin: 0;">
                    This is an automated notification from Fashion Walk Club.<br>
                    Please do not reply to this email.
                  </p>
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                  <p style="color: #999; font-size: 12px; margin: 0;">
                    © ${new Date().getFullYear()} Fashion Walk Club. All rights reserved.
                  </p>
                </div>
              </div>
            `,
          }),
        })

        const result = await response.json()
        
        if (response.ok) {
          console.log(`Email sent successfully to ${email}`)
          return {
            email,
            status: 'sent',
            messageId: result.id,
            message: 'Email sent successfully'
          }
        } else {
          console.error(`Failed to send email to ${email}:`, result)
          return {
            email,
            status: 'failed',
            error: result.message || 'Unknown error',
            message: 'Failed to send email'
          }
        }
      } catch (error) {
        console.error(`Error sending email to ${email}:`, error)
        return {
          email,
          status: 'failed',
          error: error.message,
          message: 'Failed to send email'
        }
      }
    })

    const results = await Promise.all(emailPromises)
    
    // Count successful and failed sends
    const successful = results.filter(r => r.status === 'sent').length
    const failed = results.filter(r => r.status === 'failed').length
    
    console.log(`Email notification summary: ${successful} sent, ${failed} failed`)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        summary: {
          total: emails.length,
          sent: successful,
          failed: failed
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in send-notifications function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})