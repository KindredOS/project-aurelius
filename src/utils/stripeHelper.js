export const redirectToStripeCheckout = (user) => {
  if (!user || !user.email) {
    console.error('User information is missing. Cannot proceed to Stripe.');
    return;
  }

  const stripeCheckoutUrl = `https://your-stripe-checkout-link.com?email=${encodeURIComponent(user.email)}`;
  window.open(stripeCheckoutUrl, '_blank');
};
