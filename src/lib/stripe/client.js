/**
 * Stripe Client-side Configuration
 *
 * This module provides utilities for Stripe client-side operations.
 * Use this in client components for Stripe Elements, checkout, etc.
 */

import { loadStripe } from '@stripe/stripe-js'

let stripePromise

/**
 * Get Stripe.js instance
 * Returns a singleton promise that resolves to the Stripe.js instance
 * @returns {Promise<Stripe>} Stripe.js instance
 */
export const getStripe = () => {
  if (!stripePromise) {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      throw new Error(
        'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined in environment variables'
      )
    }
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  }
  return stripePromise
}

/**
 * Format amount for display
 * @param {number} amount - Amount in cents
 * @param {string} currency - Currency code (default: 'usd')
 * @returns {string} Formatted amount
 */
export function formatAmountForDisplay(amount, currency = 'usd') {
  const numberFormat = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  })
  return numberFormat.format(amount / 100)
}
