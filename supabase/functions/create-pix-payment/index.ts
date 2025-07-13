
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
    // Get Abacate Pay API key from environment
    const apiKey = Deno.env.get('ABACATE_PAY_API_KEY')
    
    if (!apiKey) {
      console.error('Abacate Pay API key not found in environment variables')
      throw new Error('Abacate Pay API key not configured')
    }

    const requestBody = await req.json()
    console.log('Request body received:', requestBody)

    // Handle payment status check
    if (requestBody.action === 'check') {
      console.log('Checking payment status')
      const { transactionId } = requestBody

      if (!transactionId) {
        console.error('Transaction ID is required for payment check')
        throw new Error('Transaction ID is required for payment check')
      }

      console.log('Checking payment status for transaction:', transactionId)

      // Use 'id' parameter instead of 'transactionId' as required by Abacate Pay API
      const checkResponse = await fetch(`https://api.abacatepay.com/v1/pixQrCode/check?id=${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Payment check response status:', checkResponse.status)
      console.log('Payment check response headers:', Object.fromEntries(checkResponse.headers.entries()))

      if (!checkResponse.ok) {
        const errorData = await checkResponse.text()
        console.error('Abacate Pay check API Error:', errorData)
        throw new Error(`Abacate Pay check API error: ${checkResponse.status} - ${errorData}`)
      }

      const checkData = await checkResponse.json()
      console.log('Payment check data received:', checkData)

      return new Response(
        JSON.stringify({
          success: true,
          status: checkData.data?.status || 'UNKNOWN',
          expiresAt: checkData.data?.expiresAt,
          isPaid: checkData.data?.status === 'PAID'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Handle payment creation (existing code)
    console.log('PIX Payment creation request received')
    const { amount, description, customerName, customerEmail, customerPhone, customerCPF } = requestBody

    console.log('Request data:', { amount, description, customerName, customerEmail, customerPhone, customerCPF })

    console.log('API key found, making request to Abacate Pay')

    // Convert amount from reais to centavos (multiply by 100)
    const amountInCentavos = Math.round(amount * 100)
    console.log('Amount in centavos:', amountInCentavos)

    // Create PIX QR Code with Abacate Pay - using correct format from API docs
    const abacateResponse = await fetch('https://api.abacatepay.com/v1/pixQrCode/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        amount: amountInCentavos,
        expiresIn: 3600, // 1 hour expiration
        description: description,
        customer: {
          name: customerName,
          cellphone: customerPhone,
          email: customerEmail,
          taxId: customerCPF || "000.000.000-00"
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
    console.error('Error in PIX payment function:', error)
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
