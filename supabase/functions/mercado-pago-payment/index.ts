
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentRequest {
  amount: number
  description: string
  customerEmail: string
  customerName: string
  customerPhone: string
  metadata: {
    appointmentIds: string[]
    serviceNames: string[]
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const mercadoPagoAccessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')!

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    if (req.method === 'POST') {
      const { action, ...data } = await req.json()

      if (action === 'create_payment') {
        const { amount, description, customerEmail, customerName, customerPhone, metadata } = data as PaymentRequest

        console.log('Creating Mercado Pago payment preference:', { amount, description, customerEmail })

        // Create payment preference
        const preference = {
          items: [
            {
              title: description,
              quantity: 1,
              unit_price: amount,
              currency_id: 'BRL'
            }
          ],
          payer: {
            email: customerEmail,
            name: customerName,
            phone: {
              number: customerPhone
            }
          },
          payment_methods: {
            excluded_payment_types: [],
            installments: 12
          },
          notification_url: `${supabaseUrl}/functions/v1/mercado-pago-payment`,
          external_reference: JSON.stringify(metadata),
          auto_return: 'approved',
          statement_descriptor: 'SALON_AGENDAMENTO'
        }

        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mercadoPagoAccessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(preference)
        })

        if (!response.ok) {
          throw new Error(`Mercado Pago API error: ${response.status}`)
        }

        const preferenceData = await response.json()

        console.log('Payment preference created:', preferenceData.id)

        return new Response(
          JSON.stringify({
            preference_id: preferenceData.id,
            init_point: preferenceData.init_point,
            sandbox_init_point: preferenceData.sandbox_init_point
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        )
      }

      if (action === 'webhook') {
        console.log('Processing webhook notification')

        const { id, topic } = data

        if (topic === 'payment') {
          // Get payment details from Mercado Pago
          const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
            headers: {
              'Authorization': `Bearer ${mercadoPagoAccessToken}`
            }
          })

          if (!paymentResponse.ok) {
            throw new Error(`Failed to get payment details: ${paymentResponse.status}`)
          }

          const payment = await paymentResponse.json()
          console.log('Payment details:', payment)

          if (payment.status === 'approved') {
            const metadata = JSON.parse(payment.external_reference || '{}')
            const appointmentIds = metadata.appointmentIds || []

            console.log('Payment approved, updating appointments:', appointmentIds)

            // Update appointment status to "confirmado" and payment status to "pago"
            if (appointmentIds.length > 0) {
              const { error } = await supabase
                .from('agendamentos')
                .update({ 
                  status_pagamento: 'pago',
                  transaction_id: payment.id.toString(),
                  updated_at: new Date().toISOString()
                })
                .in('id', appointmentIds)

              if (error) {
                console.error('Error updating appointments:', error)
                throw error
              }

              console.log('Appointments updated successfully')
            }
          }
        }

        return new Response('OK', {
          headers: corsHeaders,
          status: 200
        })
      }
    }

    // Handle GET requests for webhook notifications from Mercado Pago
    if (req.method === 'GET') {
      const url = new URL(req.url)
      const id = url.searchParams.get('id')
      const topic = url.searchParams.get('topic')

      if (topic && id) {
        console.log('Webhook notification received:', { topic, id })
        
        if (topic === 'payment') {
          // Get payment details
          const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
            headers: {
              'Authorization': `Bearer ${mercadoPagoAccessToken}`
            }
          })

          if (paymentResponse.ok) {
            const payment = await paymentResponse.json()
            console.log('Payment webhook processed:', payment.status)

            if (payment.status === 'approved') {
              const metadata = JSON.parse(payment.external_reference || '{}')
              const appointmentIds = metadata.appointmentIds || []

              if (appointmentIds.length > 0) {
                const { error } = await supabase
                  .from('agendamentos')
                  .update({ 
                    status_pagamento: 'pago',
                    transaction_id: payment.id.toString(),
                    updated_at: new Date().toISOString()
                  })
                  .in('id', appointmentIds)

                if (!error) {
                  console.log('Appointments updated via webhook')
                }
              }
            }
          }
        }
      }

      return new Response('OK', {
        headers: corsHeaders,
        status: 200
      })
    }

    return new Response('Method not allowed', {
      headers: corsHeaders,
      status: 405
    })

  } catch (error) {
    console.error('Error in mercado-pago-payment function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
