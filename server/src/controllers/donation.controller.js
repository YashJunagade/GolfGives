import stripe from '../config/stripe.js';
import supabase from '../config/supabase.js';

export const createDonationCheckout = async (req, res, next) => {
  try {
    const { charity_id, amount } = req.body;
    const cents = Math.round(Number(amount) * 100);
    if (!cents || cents < 100) {
      return res.status(422).json({ error: 'Minimum donation is £1.' });
    }

    let charityName = 'Charity Donation';
    if (charity_id) {
      const { data } = await supabase.from('charities').select('name').eq('id', charity_id).single();
      if (data?.name) charityName = data.name;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: { name: `Donation to ${charityName}` },
          unit_amount: cents,
        },
        quantity: 1,
      }],
      customer_email: req.user.email,
      metadata: { user_id: req.user.id, charity_id: charity_id || null, type: 'donation' },
      success_url: `${process.env.CLIENT_URL}/dashboard?donated=1`,
      cancel_url:  charity_id
        ? `${process.env.CLIENT_URL}/charities/${charity_id}`
        : `${process.env.CLIENT_URL}/charities`,
    });

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
};
