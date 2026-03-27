# Customer Dashboard Documentation

## Overview

The customer dashboard provides a comprehensive, tab-based interface for customers to manage their accounts, track orders, view billing information, and access support resources. The dashboard features a modern, professional UI with proper error handling and user-friendly messaging.

## Architecture

### File Structure

```
src/
├── app/
│   ├── dashboard/
│   │   ├── customer/
│   │   │   └── page.js                 # Server component - fetches user data
│   │   └── layout.js                   # Dashboard layout wrapper
│   ├── support/
│   │   └── page.js                     # Support center page
│   └── faq/
│       └── page.js                     # FAQ page
└── components/
    ├── Dashboard/
    │   ├── CustomerDashboard.jsx       # Main dashboard with tab navigation
    │   └── Customer/
    │       ├── ManageAccountTab.jsx    # Account management features
    │       ├── BillingTab.jsx          # Billing & payment management
    │       └── TrackOrdersTab.jsx      # Order tracking & history
    ├── Support/
    │   ├── AIAssistant.jsx             # AI support assistant section
    │   ├── ContactSupport.jsx          # Contact form
    │   └── ContactInformation.jsx      # Contact cards (email, phone, chat)
    └── Faq/
        ├── FAQData.js                  # FAQ data
        ├── FAQCategories.jsx           # Category tabs
        └── FAQQuestions.jsx            # Questions/answers accordion
```

## Features Implemented

### 1. Main Dashboard (`CustomerDashboard.jsx`)

**Location:** `src/components/Dashboard/CustomerDashboard.jsx`

**Key Features:**
- ✅ Time-based greeting (Good morning/afternoon/evening)
- ✅ Display customer's first name (from Supabase accounts table)
- ✅ Email verification check using `user.email_confirmed_at` (Supabase Auth)
- ✅ Tab-based navigation (Manage Account, Billing, Track Orders)
- ✅ Professional UI with smooth transitions
- ✅ Global error handling with dismissible error messages
- ✅ Sign out functionality

**Email Verification Fix:**
- Changed from checking `account.email_verified` to `user.email_confirmed_at`
- This properly reflects Supabase Auth's email confirmation status
- Only shows warning if email is NOT verified

**Time-Based Greeting Logic:**
```javascript
function getTimeBasedGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}
```

### 2. Manage Account Tab (`ManageAccountTab.jsx`)

**Location:** `src/components/Dashboard/Customer/ManageAccountTab.jsx`

**Features:**

#### Personal Information
- Update first name, last name, phone number
- Email display (read-only, requires support contact to change)
- Real-time form validation
- Success notifications after updates

#### Address Management
- Billing address form (line1, line2, city, state, zip)
- Shipping address form (conditional based on checkbox)
- "Use billing as shipping" toggle
- All address fields saved to Supabase accounts table

#### Security Settings
- Password change form
- Password validation (minimum 8 characters)
- Confirm password matching
- Uses Supabase Auth `updateUser()` method
- Secure password updates without storing in custom tables

#### Subscription
- Premium membership section
- "Coming Soon" placeholder
- Ready for future subscription integration

#### Danger Zone
- Account deletion with double confirmation
- Permanent deletion warning
- Cascades to delete related data (via Supabase RLS)
- Signs user out and redirects after deletion

**Error Handling:**
- Try-catch blocks on all async operations
- User-friendly error messages via `onError` callback
- Loading states on all buttons
- Form validation before submission

### 3. Billing Tab (`BillingTab.jsx`)

**Location:** `src/components/Dashboard/Customer/BillingTab.jsx`

**Features:**

#### Payment Methods
- Display saved payment methods (dummy data)
- Card brand indicators (Visa, Mastercard)
- Default payment method highlighting
- Add/remove payment method buttons
- Stripe integration placeholder

#### Billing History
- Invoice table with ID, date, amount, status
- Download invoice functionality placeholder
- Paid/pending status indicators
- Professional table layout

#### Current Plan
- Plan details display
- Upgrade plan button
- Feature list with checkmarks
- Pricing display

**Dummy Data:**
- 2 payment methods (Visa, Mastercard)
- 3 invoices with paid status
- Free plan details

**Notes:**
- All payment actions show "Stripe integration required" message
- Blue info banner at top indicates dummy data in use
- Ready for Stripe integration

### 4. Track Orders Tab (`TrackOrdersTab.jsx`)

**Location:** `src/components/Dashboard/Customer/TrackOrdersTab.jsx`

**Features:**

#### Order Tracking
- Track by order ID or tracking number input
- Individual order cards with full details
- Order status badges (Processing, Shipped, Delivered, Cancelled)
- Visual progress bar showing order journey
- Tracking number display

#### Order Details
- Order ID, date, total amount
- Itemized list with quantities and prices
- Estimated/actual delivery dates
- Order actions (View Details, Reorder, Cancel)

#### Order Statistics
- Total orders count
- Total amount spent
- In-transit orders count
- Visual stat cards with icons

**Dummy Data:**
- 3 orders with different statuses
- Realistic tracking numbers
- Multiple items per order

**Notes:**
- "Browse Products" link directs to `/products`
- Empty state when no orders exist
- Tracking input shows integration placeholder message

### 5. Support & FAQ Pages

**Support Page Location:** `src/app/support/page.js`
**FAQ Page Location:** `src/app/faq/page.js`

**Features:**

#### Support Page (`/support`)
- **AI Assistant Section** - "Coming Soon" banner with professional gradient
- **FAQ Link** - Direct link to dedicated FAQ page
- **Contact Support Form** - Subject and message form with validation
- **Contact Information Cards** - Email, phone, and live chat options

#### FAQ Page (`/faq`)
- **4 Categories:** Orders & Shipping, Returns & Refunds, Account & Security, Products & Services
- **Category Tabs** - Easy navigation between FAQ categories
- **16 FAQ Entries** - 4 questions per category
- **Expandable/Collapsible Accordion** - Clean, accessible UI
- **Support Link** - Direct link back to support center

**Component Structure:**
- `Support/AIAssistant.jsx` - AI assistant banner
- `Support/ContactSupport.jsx` - Contact form
- `Support/ContactInformation.jsx` - Contact cards
- `Faq/FAQData.js` - All FAQ content
- `Faq/FAQCategories.jsx` - Category navigation
- `Faq/FAQQuestions.jsx` - Question/answer display

**Note:** Support functionality has been moved from dashboard tab to dedicated pages at `/support` and `/faq` for better accessibility.

## Error Handling Strategy

### Global Error State
- Error messages displayed in red banner at top of dashboard
- Dismissible via X button
- Automatically propagated from tab components to main dashboard
- Consistent error format across all tabs

### Per-Component Error Handling
All components use try-catch blocks with:
```javascript
try {
  setLoading(true)
  onError(null) // Clear previous errors
  // ... operation
  setSuccessMessage('Success!')
} catch (err) {
  onError('User-friendly error message')
  console.error('Detailed error:', err)
} finally {
  setLoading(false)
}
```

### User-Friendly Messages
- "Failed to update profile. Please try again."
- "Failed to change password. Please try again."
- "Failed to delete account. Please contact support."
- "Payment integration coming soon. This feature requires Stripe setup."

### Loading States
- All buttons show loading text while processing
- Disabled state prevents duplicate submissions
- Visual feedback (opacity change) on disabled buttons

## TODO Items

### High Priority

1. **Stripe Integration** (Billing Tab)
   - [ ] Set up Stripe account
   - [ ] Install `@stripe/stripe-js` and `stripe` npm packages
   - [ ] Create Stripe customer portal
   - [ ] Implement payment method management
   - [ ] Set up webhook handlers for payment events
   - [ ] Connect invoice history to Stripe invoices
   - [ ] Implement secure payment method storage

2. **AI Assistant** (Support Tab)
   - [ ] Choose AI service (OpenAI, Anthropic, etc.)
   - [ ] Design chat interface component
   - [ ] Implement message history
   - [ ] Create backend API route for AI requests
   - [ ] Add rate limiting and abuse prevention
   - [ ] Train/configure AI with product knowledge
   - [ ] Implement conversation context storage

3. **Order Management System**
   - [ ] Create `orders` table in Supabase
   - [ ] Create `order_items` table in Supabase
   - [ ] Implement order creation flow
   - [ ] Connect to payment processing
   - [ ] Add order status update system
   - [ ] Integrate real tracking API (ShipStation, EasyPost, etc.)
   - [ ] Add order cancellation logic

### Medium Priority

4. **Email Notifications**
   - [ ] Set up email service (SendGrid, Resend, etc.)
   - [ ] Create order confirmation email template
   - [ ] Create shipping notification email template
   - [ ] Create delivery confirmation email template
   - [ ] Add support ticket confirmation emails
   - [ ] Implement email preference settings

5. **Products Integration**
   - [ ] Create `/products` page if not exists
   - [ ] Ensure "Browse Products" links work
   - [ ] Connect shopping cart to orders system
   - [ ] Implement "Reorder" functionality

6. **Address Validation**
   - [ ] Integrate address validation API (SmartyStreets, Google Maps, etc.)
   - [ ] Add autocomplete for address inputs
   - [ ] Validate addresses before saving

### Low Priority

7. **Enhanced Features**
   - [ ] Add profile picture upload
   - [ ] Implement two-factor authentication (2FA)
   - [ ] Add order export (CSV, PDF)
   - [ ] Create wish list feature
   - [ ] Add product review system
   - [ ] Implement referral program

8. **Analytics & Tracking**
   - [ ] Add analytics tracking (Google Analytics, Plausible, etc.)
   - [ ] Track user interactions in dashboard
   - [ ] Monitor error rates
   - [ ] Set up conversion tracking

## Integration Guides

### Stripe Setup

**Steps:**
1. Create Stripe account at https://stripe.com
2. Get API keys from Stripe Dashboard
3. Install dependencies:
   ```bash
   npm install stripe @stripe/stripe-js
   ```
4. Add environment variables:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
5. Create API routes:
   - `/api/stripe/create-customer` - Create Stripe customer
   - `/api/stripe/add-payment-method` - Add payment method
   - `/api/stripe/create-subscription` - Create subscription
   - `/api/stripe/webhooks` - Handle Stripe events
6. Update `BillingTab.jsx` to call API routes instead of showing placeholders
7. Test with Stripe test cards: https://stripe.com/docs/testing

**Recommended Libraries:**
- `stripe` (server-side)
- `@stripe/stripe-js` (client-side)
- `@stripe/react-stripe-js` (if using Stripe Elements)

### AI Assistant Setup

**Option 1: OpenAI**
```bash
npm install openai
```
```javascript
import OpenAI from 'openai'
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
```

**Option 2: Anthropic Claude**
```bash
npm install @anthropic-ai/sdk
```
```javascript
import Anthropic from '@anthropic-ai/sdk'
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
```

**Implementation Steps:**
1. Create `/api/chat` endpoint
2. Implement conversation history storage (Supabase table)
3. Add rate limiting (1 request per 3 seconds per user)
4. Create chat UI component
5. Handle streaming responses for better UX
6. Add fallback to FAQ if AI is down

### Order Tracking Integration

**Recommended Services:**
- **ShipStation:** Full shipping management platform
- **EasyPost:** Multi-carrier shipping API
- **AfterShip:** Tracking-focused service

**Steps:**
1. Choose tracking service and sign up
2. Install SDK:
   ```bash
   npm install easypost  # or aftership-sdk
   ```
3. Create Supabase tables:
   ```sql
   CREATE TABLE orders (
     id UUID PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id),
     order_number TEXT UNIQUE,
     status TEXT,
     tracking_number TEXT,
     carrier TEXT,
     total DECIMAL,
     created_at TIMESTAMP,
     updated_at TIMESTAMP
   );

   CREATE TABLE order_items (
     id UUID PRIMARY KEY,
     order_id UUID REFERENCES orders(id),
     product_name TEXT,
     quantity INTEGER,
     price DECIMAL
   );
   ```
4. Create API routes:
   - `/api/orders/create`
   - `/api/orders/[id]/track`
   - `/api/orders/[id]/cancel`
5. Update `TrackOrdersTab.jsx` to fetch real data
6. Set up webhooks for tracking updates

## Database Schema Requirements

### Existing Tables (Already Created)

**accounts table:**
- ✅ first_name, last_name (for greeting)
- ✅ email (via auth.users)
- ✅ phone
- ✅ billing_address_* fields
- ✅ shipping_address_* fields
- ✅ use_billing_as_shipping

### Tables to Create

**orders table:**
```sql
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL, -- processing, shipped, delivered, cancelled
  total DECIMAL(10,2) NOT NULL,
  tracking_number TEXT,
  carrier TEXT,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```

**order_items table:**
```sql
CREATE TABLE public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID, -- References products table when created
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```

**support_tickets table:**
```sql
CREATE TABLE public.support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open', -- open, in_progress, resolved, closed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```

**ai_conversations table (for AI assistant):**
```sql
CREATE TABLE public.ai_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  messages JSONB NOT NULL, -- Array of {role, content, timestamp}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```

## Security Considerations

### Implemented
- ✅ Row Level Security (RLS) enabled on accounts table
- ✅ Password changes use Supabase Auth (no custom storage)
- ✅ Client-side validation with server-side enforcement
- ✅ Proper error messages without exposing system details
- ✅ CSRF protection via Supabase Auth tokens

### Required for Production
- [ ] Rate limiting on all API routes
- [ ] Input sanitization for all user inputs
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS protection (React handles most, but validate user content)
- [ ] Implement CAPTCHA on contact forms
- [ ] Add audit logging for sensitive operations
- [ ] Set up monitoring and alerting

## Testing Recommendations

### Manual Testing Checklist
- [ ] Test all tabs load without errors
- [ ] Verify greeting changes throughout the day
- [ ] Test profile update with valid/invalid data
- [ ] Test address update with all field combinations
- [ ] Test password change with matching/non-matching passwords
- [ ] Test account deletion flow (use test account!)
- [ ] Verify email verification notice appears/disappears correctly
- [ ] Test all FAQ accordions expand/collapse
- [ ] Test contact form submission
- [ ] Verify error messages display and dismiss properly
- [ ] Test sign out functionality
- [ ] Check mobile responsiveness on all tabs

### Automated Testing (Future)
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

Create tests for:
- Component rendering
- Form submissions
- Error handling
- Navigation between tabs
- Data fetching and updates

## Performance Optimization

### Current Implementation
- ✅ Client-side state management (no unnecessary re-renders)
- ✅ Conditional rendering for tabs
- ✅ Optimized re-renders with proper state updates

### Future Optimizations
- [ ] Implement React.memo for tab components
- [ ] Add loading skeletons for better perceived performance
- [ ] Lazy load tab components
- [ ] Cache FAQ data
- [ ] Optimize images with next/image
- [ ] Implement pagination for order history
- [ ] Add infinite scroll for billing history

## Accessibility (a11y)

### Implemented
- ✅ Semantic HTML elements
- ✅ Proper heading hierarchy
- ✅ Button labels and aria-labels
- ✅ Keyboard navigation support
- ✅ Focus states on interactive elements

### Improvements Needed
- [ ] Add ARIA labels to all interactive elements
- [ ] Test with screen readers (NVDA, JAWS, VoiceOver)
- [ ] Add skip navigation links
- [ ] Ensure proper color contrast ratios
- [ ] Add loading announcements for screen readers
- [ ] Implement focus trapping in modals
- [ ] Add keyboard shortcuts for power users

## Mobile Responsiveness

### Current Implementation
- ✅ Responsive grid layouts
- ✅ Mobile-friendly tab navigation
- ✅ Flexible forms that adapt to screen size
- ✅ Proper spacing and padding for touch targets

### Verified Breakpoints
- Mobile: 320px - 640px
- Tablet: 641px - 1024px
- Desktop: 1025px+

## Deployment Notes

### Environment Variables Required
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe (when integrated)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI Assistant (when integrated)
OPENAI_API_KEY=sk-...
# OR
ANTHROPIC_API_KEY=sk-ant-...

# Shipping/Tracking (when integrated)
EASYPOST_API_KEY=...
# OR
SHIPSTATION_API_KEY=...
```

### Build Command
```bash
npm run build
```

### Vercel Deployment
1. Connect GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

## Summary

The customer dashboard is now a fully-featured, tab-based interface with:
- ✅ Professional UI/UX
- ✅ Time-based personalized greetings
- ✅ Proper email verification checking
- ✅ Comprehensive account management
- ✅ Payment/billing interface (ready for Stripe)
- ✅ Order tracking system (ready for data)
- ✅ Support resources and FAQ
- ✅ Robust error handling
- ✅ Mobile-responsive design
- ✅ Accessibility features

All core features are implemented with placeholders for external integrations (Stripe, AI, order tracking) clearly marked and documented.
