/**
 * IMPORTANT: Backend Configuration Check for Stripe Integration
 * 
 * Please verify that your backend's appsettings.json contains these settings:
 */

// Expected settings in appsettings.json
{
  "SecretKey": "sk_test_51RztgML1qOrMw4UxYBredm3znUTcGfiM8vUImE29hQXCWja6vT1K9Ue6BekiomR0NWveVa4ilfVzAZaIB8kAbZJM00F0aLcN6x",
  "FRONTEND_URL": "http://localhost:4200",
  "STRIPE_WEBHOOK_SECRET": "your_webhook_secret_if_you_use_it"
}

/**
 * CRITICAL FIX NEEDED:
 * 
 * The "Not a valid URL" error is caused by Stripe rejecting your success_url or cancel_url.
 * 
 * In your StripeCheckoutController.cs, make this modification:
 */

// REPLACE THIS:
var options = new SessionCreateOptions
{
    PaymentMethodTypes = new List<string> { "card" },
    LineItems = new List<SessionLineItemOptions>(),
    Mode = "payment",
    SuccessUrl = $"{_configuration["FRONTEND_URL"]}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}",
    CancelUrl = $"{_configuration["FRONTEND_URL"]}/checkout/cancel",
    CustomerEmail = request.CustomerEmail,
    // ...
};

// WITH THIS:
var frontendUrl = _configuration["FRONTEND_URL"] ?? "http://localhost:4200";
var options = new SessionCreateOptions
{
    PaymentMethodTypes = new List<string> { "card" },
    LineItems = new List<SessionLineItemOptions>(),
    Mode = "payment",
    SuccessUrl = $"{frontendUrl}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}",
    CancelUrl = $"{frontendUrl}/checkout/cancel",
    CustomerEmail = request.CustomerEmail,
    // ...
};

/**
 * Why this works: 
 * 1. We provide a default fallback URL if FRONTEND_URL is missing
 * 2. This ensures Stripe always receives valid absolute URLs
 */
