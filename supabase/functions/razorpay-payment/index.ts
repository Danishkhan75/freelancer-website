import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from "jsr:@supabase/supabase-js@2/cors"

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')!
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!
const ADMIN_EMAILS = [
  'mdmarufalam315@gmail.com',
  'khandanish0503@gmail.com'
]

// Razorpay order creation function
async function createRazorpayOrder(amount: number, orderId: string, customerName: string, customerEmail: string) {
  const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: orderId,
      notes: {
        customer_name: customerName,
        customer_email: customerEmail,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Razorpay API error: ${error}`)
  }

  return response.json()
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight for browser calls
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Create Supabase client
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SB_PUBLISHABLE_KEY')!,
  )

  try {
    const body = await req.json()
    const { customerName, customerEmail, customerPhone, packageName, packageType, amount } = body

    // Validate input
    if (!customerName || !customerEmail || !packageType || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create order record in database
    const { data: order, error: dbError } = await supabase
      .from('orders')
      .insert({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone || null,
        package_name: packageName,
        package_type: packageType,
        amount: amount,
        status: 'pending',
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Failed to create order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder(
      amount,
      order.id,
      customerName,
      customerEmail
    )

    // Update order with Razorpay ID
    await supabase
      .from('orders')
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq('id', order.id)

    return new Response(
      JSON.stringify({
        success: true,
        orderId: order.id,
        razorpayOrderId: razorpayOrder.id,
        amount: amount,
        currency: 'INR',
        key: RAZORPAY_KEY_ID,
        customerName,
        customerEmail,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
