/**
 * Stripe Server-side Configuration
 *
 * This module initializes the Stripe SDK for server-side operations.
 * Use this in API routes and server components only.
 *
 * IMPORTANT: Never import this in client components!
 */

import Stripe from "stripe";

/**
 * Stripe instance for server-side operations
 * Initialized with secret key from environment variables
 * Lazy initialization to avoid build-time errors
 */
let stripeInstance = null;

export const stripe = new Proxy(
  {},
  {
    get: (_target, prop) => {
      if (!stripeInstance) {
        if (!process.env.STRIPE_SECRET_KEY) {
          throw new Error(
            "STRIPE_SECRET_KEY is not defined in environment variables. Please add it to your .env.local file.",
          );
        }
        stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: "2024-12-18.acacia", // Use latest stable API version
          typescript: true,
        });
      }
      return stripeInstance[prop];
    },
  },
);

/**
 * Helper function to format amount for Stripe
 * Stripe requires amounts in cents
 * @param {number} amount - Amount in dollars
 * @returns {number} Amount in cents
 */
export function formatAmountForStripe(amount) {
  return Math.round(amount * 100);
}

/**
 * Helper function to format amount from Stripe
 * Converts cents back to dollars
 * @param {number} amount - Amount in cents
 * @returns {number} Amount in dollars
 */
export function formatAmountFromStripe(amount) {
  return amount / 100;
}
