/**
 * Checkout Session API Route
 *
 * Creates a Stripe Checkout Session for hosted checkout page.
 * Redirects to Stripe's pre-built checkout UI.
 */

import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request) {
  try {
    const {
      priceId,
      quantity = 1,
      mode = 'payment', // 'payment' for one-time, 'subscription' for recurring
      successUrl,
      cancelUrl,
      metadata = {},
    } = await request.json()

    // Validate required fields
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    // Allow guest checkout - user is optional
    let customerId = null
    let customerEmail = null

    if (user) {
      // Get or create Stripe customer for authenticated users
      const { data: account } = await supabase
        .from('accounts')
        .select('customer_id, first_name, last_name')
        .eq('user_id', user.id)
        .single()

      customerId = account?.customer_id
      customerEmail = user.email

      // Create Stripe customer if doesn't exist
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name:
            account?.first_name && account?.last_name
              ? `${account.first_name} ${account.last_name}`
              : undefined,
          metadata: {
            account_id: account?.id,
            user_id: user.id,
          },
        })

        customerId = customer.id

        // Save customer ID to database
        await supabase
          .from('accounts')
          .update({ customer_id: customerId })
          .eq('user_id', user.id)
      }
    }

    // Build base URL for redirect URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    // Create checkout session
    const sessionParams = {
      mode,
      line_items: [
        {
          price: priceId,
          quantity,
        },
      ],
      success_url: successUrl || `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${baseUrl}/checkout/cancel`,
      metadata: {
        user_id: user?.id || 'guest',
        ...metadata,
      },
    }

    // Add customer info if authenticated
    if (customerId) {
      sessionParams.customer = customerId
    } else if (customerEmail) {
      sessionParams.customer_email = customerEmail
    } else {
      // For guests, allow email collection
      sessionParams.customer_email = null
    }

    // For payment mode, add shipping address collection
    if (mode === 'payment') {
      sessionParams.shipping_address_collection = {
        allowed_countries: ['US', 'CA'], // Adjust based on your shipping regions
      }
      sessionParams.billing_address_collection = 'required'
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Checkout session error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
