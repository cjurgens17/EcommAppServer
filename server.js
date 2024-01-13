require('dotenv').config();
const stripe = require('stripe')('sk_test_51NWLWiAAwBntl43mAAscP0tDxysTzcY6oO8PfCPxpbBmEJVgl9WlJchi0x3pFgycOrtWMW9yCMdoy0jb2Comob3f00Jnz53sLm');
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());

const MY_DOMAIN = 'https://ecommerce-app-three-tau.vercel.app';

app.get('/', (req, res) => {
  res.send('<h1>Coffee Brothers Server!</h1>');
});

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

app.listen(process.env.PORT || 4242, () => console.log('Server is running!'));
