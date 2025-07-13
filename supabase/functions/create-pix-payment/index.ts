
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, description, customerName, customerEmail, customerPhone } = await req.json()

    // Get Abacate Pay API key from Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: config } = await supabaseClient
      .from('abacate_config')
      .select('api_key')
      .single()

    if (!config?.api_key) {
      throw new Error('Abacate Pay API key not configured')
    }

    // Create PIX payment with Abacate Pay
    const abacateResponse = await fetch('https://api.abacatepay.com/v1/billing/pix', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.api_key}`
      },
      body: JSON.stringify({
        amount: amount,
        description: description,
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone
        },
        methods: ['PIX'],
        metadata: {
          source: 'salon-booking'
        }
      })
    })

    if (!abacateResponse.ok) {
      const errorData = await abacateResponse.text()
      console.error('Abacate Pay API Error:', errorData)
      throw new Error(`Abacate Pay API error: ${abacateResponse.status}`)
    }

    const paymentData = await abacateResponse.json()
    
    return new Response(
      JSON.stringify({
        success: true,
        qrCode: paymentData.qr_code,
        qrCodeData: paymentData.qr_code_data,
        transactionId: paymentData.id,
        pixKey: paymentData.pix_key || '',
        expiresAt: paymentData.expires_at
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error creating PIX payment:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
