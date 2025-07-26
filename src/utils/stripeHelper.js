// stripeHelper.js

const STRIPE_BASE_URL = 'https://kos-monetization.shepherdn.workers.dev';

/**
 * Redirects the user to Stripe Checkout for the selected plan.
 */
export const redirectToStripeCheckout = async ({ username, email, planKey }) => {
  if (!username || !planKey) {
    console.error('Missing username or planKey. Cannot proceed to Stripe.');
    return;
  }

  try {
    const response = await fetch(`${STRIPE_BASE_URL}/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, planKey })
    });

    const result = await response.json();

    if (!response.ok) throw new Error(result.detail || 'Stripe session creation failed');
    if (result.url) window.location.href = result.url;

  } catch (err) {
    console.error('Stripe checkout failed:', err);
  }
};

/**
 * Redirects the user to the Stripe Customer Portal.
 */
export const redirectToStripePortal = async ({ username, email }) => {
  if (!username) {
    console.error('Missing username. Cannot open portal.');
    return;
  }

  try {
    const response = await fetch(`${STRIPE_BASE_URL}/customer-portal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email })
    });

    const result = await response.json();

    if (!response.ok) throw new Error(result.detail || 'Stripe portal session failed');
    if (result.url) window.location.href = result.url;

  } catch (err) {
    console.error('Stripe portal redirect failed:', err);
  }
};

/**
 * Retrieves a checkout URL without redirecting. Useful for modals.
 */
export const getStripeCheckoutUrl = async ({ username, email, planKey }) => {
  try {
    const response = await fetch(`${STRIPE_BASE_URL}/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, planKey })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || 'Failed to get Stripe URL');
    return result.url;
  } catch (err) {
    console.error('Failed to fetch Stripe checkout URL:', err);
    return null;
  }
};
