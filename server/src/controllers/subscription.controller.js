import stripe from '../config/stripe.js';
import supabase from '../config/supabase.js';
import { sendSubscriptionConfirmation, sendSubscriptionCancelled } from '../services/emailService.js';

const PLANS = {
  [process.env.STRIPE_PRICE_MONTHLY]: 'monthly',
  [process.env.STRIPE_PRICE_YEARLY]:  'yearly',
};

// Stripe ≥2024-09-30 returns dates as ISO strings; older versions use Unix timestamps
function toIso(val) {
  if (!val) return null;
  if (typeof val === 'string') return val;
  return new Date(val * 1000).toISOString();
}

export const createCheckout = async (req, res, next) => {
  try {
    const { plan } = req.body;
    const priceId = plan === 'yearly'
      ? process.env.STRIPE_PRICE_YEARLY
      : process.env.STRIPE_PRICE_MONTHLY;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: req.user.email,
      metadata: { user_id: req.user.id },
      success_url: `${process.env.CLIENT_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.CLIENT_URL}/pricing`,
    });

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
};

export const cancelSubscription = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', req.user.id)
      .single();

    if (error || !data?.stripe_subscription_id) {
      return res.status(404).json({ error: 'No active subscription found.' });
    }

    const updated = await stripe.subscriptions.update(data.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    const periodEnd = toIso(updated.current_period_end ?? updated.cancel_at);

    await supabase
      .from('subscriptions')
      .update({ status: 'cancelled', current_period_end: periodEnd })
      .eq('user_id', req.user.id);

    const { data: user } = await supabase.from('users').select('email, full_name').eq('id', req.user.id).single();
    if (user) sendSubscriptionCancelled(user.email, user.full_name, periodEnd);

    res.json({ cancelled: true });
  } catch (err) {
    next(err);
  }
};

export const verifySession = async (req, res, next) => {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ error: 'session_id required.' });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== 'paid') return res.json({ status: 'pending' });

    // Upsert the subscription in case the webhook hasn't fired yet
    const subId     = session.subscription;
    const customerId = session.customer;
    const stripeSub = await stripe.subscriptions.retrieve(subId);
    const priceId   = stripeSub.items.data[0].price.id;
    const plan      = PLANS[priceId] || 'monthly';
    const periodEnd = toIso(stripeSub.current_period_end);

    await supabase.from('subscriptions').upsert({
      user_id:                req.user.id,
      plan,
      status:                 'active',
      stripe_customer_id:     customerId,
      stripe_subscription_id: subId,
      current_period_end:     periodEnd,
    }, { onConflict: 'user_id' });

    res.json({ status: 'active', plan });
  } catch (err) {
    next(err);
  }
};

export const getStatus = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('plan, status, current_period_end')
      .eq('user_id', req.user.id)
      .single();

    if (error || !data) return res.json({ status: 'none' });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await onCheckoutComplete(event.data.object);
        break;
      case 'customer.subscription.updated':
        await onSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await onSubscriptionDeleted(event.data.object);
        break;
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).json({ error: 'Handler failed' });
  }
};

async function onCheckoutComplete(session) {
  const userId    = session.metadata.user_id;
  const subId     = session.subscription;
  const customerId = session.customer;

  const stripeSub = await stripe.subscriptions.retrieve(subId);
  const priceId   = stripeSub.items.data[0].price.id;
  const plan      = PLANS[priceId] || 'monthly';

  await supabase.from('subscriptions').upsert({
    user_id:                userId,
    plan,
    status:                 'active',
    stripe_customer_id:     customerId,
    stripe_subscription_id: subId,
    current_period_end:     toIso(stripeSub.current_period_end ?? stripeSub.cancel_at),
  }, { onConflict: 'user_id' });

  const { data: user } = await supabase.from('users').select('email, full_name').eq('id', userId).single();
  if (user) sendSubscriptionConfirmation(user.email, user.full_name, plan);
}

async function onSubscriptionUpdated(stripeSub) {
  const status = stripeSub.cancel_at_period_end
    ? 'cancelled'
    : stripeSub.status === 'active' ? 'active' : 'lapsed';

  await supabase.from('subscriptions')
    .update({ status, current_period_end: toIso(stripeSub.current_period_end ?? stripeSub.cancel_at) })
    .eq('stripe_subscription_id', stripeSub.id);

}

async function onSubscriptionDeleted(stripeSub) {
  const { data: sub } = await supabase.from('subscriptions')
    .select('users(email, full_name), current_period_end')
    .eq('stripe_subscription_id', stripeSub.id)
    .single();

  await supabase.from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('stripe_subscription_id', stripeSub.id);

  const user = sub?.users;
  if (user) sendSubscriptionCancelled(user.email, user.full_name, sub?.current_period_end ?? null);
}
