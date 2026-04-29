import Stripe from 'stripe'
import { PayloadRequest } from 'payload'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  // ... настройки
})

export default async function createPayment(req: PayloadRequest): Promise<Response> {
  try {
    const body = await req.json!()
    const { items } = body

    if (!items || items.length === 0) {
      // Используем современный Response.json()
      return Response.json({ error: 'No items' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.title,
          },
          // Убеждаемся, что передаем целое число (центы)
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/cart`,
    })

    return Response.json({ url: session.url }, { status: 200 })
  } catch (err: any) {
    console.error(err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
