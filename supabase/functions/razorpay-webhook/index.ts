import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from "jsr:@supabase/supabase-js@2/cors"

const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!
const ADMIN_EMAILS = [
  'mdmarufalam315@gmail.com',
  'khandanish0503@gmail.com'
]

// Verify webhook signature
function verifyWebhookSignature(body: string, signature: string): boolean {
  const crypto = globalThis.crypto
  const encoder = new TextEncoder()
  const data = encoder.encode(body + RAZORPAY_KEY_SECRET)

  // For Razorpay webhook verification, we'd use HMAC SHA256
  // In production, use a proper HMAC library
  return true // Placeholder - in production implement full verification
}

// Send notification email to all admins
async function sendNotificationEmail(orderData: any, status: string) {
  try {
    // Use Resend or similar email service
    // This is a placeholder for email integration
    console.log(`Sending ${status} notification to admins: ${ADMIN_EMAILS.join(', ')}`, orderData)
  } catch (error) {
    console.error('Email error:', error.message)
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only accept POST requests for webhooks
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SB_PUBLISHABLE_KEY')!,
  )

  try {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature!)) {
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const event = JSON.parse(body)
    const { event: eventType, payload } = event
    const paymentData = payload.payment?.entity

    if (eventType === 'payment.authorized' || eventType === 'payment.captured') {
      const orderId = paymentData.receipt
      const paymentId = paymentData.id

      // Update order status to completed
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          razorpay_payment_id: paymentId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      if (!updateError) {
        // Get order details for email
        const { data: order } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single()

        if (order) {
          await sendNotificationEmail(order, 'completed')
        }
      }
    } else if (eventType === 'payment.failed') {
      const orderId = paymentData.receipt

      // Update order status to failed
      const { data: order } = await supabase
        .from('orders')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single()

      if (order) {
        await sendNotificationEmail(order, 'failed')
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Webhook error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
