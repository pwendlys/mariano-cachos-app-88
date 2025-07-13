
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

    // Create PIX QR Code with Abacate Pay - using correct endpoint
    const abacateResponse = await fetch('https://api.abacatepay.com/v1/pixQrCode/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        amount: amount,
        expiresIn: 3600, // 1 hour expiration
        description: description,
        customer: {
          name: customerName,
          cellphone: customerPhone,
          email: customerEmail,
          taxId: "000.000.000-00" // Default tax ID - you may want to collect this from the user
        }
      })
    })

    console.log('Abacate Pay response status:', abacateResponse.status)

    if (!abacateResponse.ok) {
      const errorData = await abacateResponse.text()
      console.error('Abacate Pay API Error:', errorData)
      throw new Error(`Abacate Pay API error: ${abacateResponse.status} - ${errorData}`)
    }

    const response = await abacateResponse.json()
    console.log('Payment data received:', response)
    
    // Check if response has the expected structure
    if (!response.data) {
      console.error('Unexpected response structure:', response)
      throw new Error('Unexpected response from Abacate Pay API')
    }

    const paymentData = response.data
    
    return new Response(
      JSON.stringify({
        success: true,
        qrCode: paymentData.brCode,
        qrCodeData: paymentData.brCodeBase64?.replace('data:image/png;base64,', '') || '',
        transactionId: paymentData.id,
        pixKey: paymentData.brCode || '',
        expiresAt: paymentData.expiresAt
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
