require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());

const MY_DOMAIN = 'https://coffeebrothers-7ec5c7fdf171.herokuapp.com';

app.post('/create-checkout-session', async (req,res) => {
try{
  console.log(req.body);
  const cartProducts = req.body.products;

  const lineItems = await cartProducts.map((product) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: product.name,
        images: [product.image],
      },
      unit_amount: parseInt(product.price * 100), //converting to cents for stripe api
    },
    quantity: product.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    line_items: lineItems,
    mode: 'payment',
    success_url: `${MY_DOMAIN}/success`,
    cancel_url: `${MY_DOMAIN}/cancel`
  });

  console.log('Stripe Response:', session);
  res.json({url: session.url})
} catch (e) {
  console.error("stripe Post error: ", e);
  res.status(500).json({ error: 'Error occurred while processing the request.' });
}
});

app.listen(process.env.PORT || 4242);
