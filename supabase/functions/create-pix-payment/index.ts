
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
    console.log('PIX Payment request received')
    const { amount, description, customerName, customerEmail, customerPhone } = await req.json()

    console.log('Request data:', { amount, description, customerName, customerEmail, customerPhone })

    // Get Abacate Pay API key from environment
    const apiKey = Deno.env.get('ABACATE_PAY_API_KEY')
    
    if (!apiKey) {
      console.error('Abacate Pay API key not found in environment variables')
      throw new Error('Abacate Pay API key not configured')
    }

    console.log('API key found, making request to Abacate Pay')

    // Create PIX payment with Abacate Pay
    const abacateResponse = await fetch('https://api.abacatepay.com/v1/billing/pix', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
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

    console.log('Abacate Pay response status:', abacateResponse.status)

    if (!abacateResponse.ok) {
      const errorData = await abacateResponse.text()
      console.error('Abacate Pay API Error:', errorData)
      throw new Error(`Abacate Pay API error: ${abacateResponse.status} - ${errorData}`)
    }

    const paymentData = await abacateResponse.json()
    console.log('Payment data received:', paymentData)
    
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
