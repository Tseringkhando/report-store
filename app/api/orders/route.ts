import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const orders = await query(`
      SELECT
        o.order_id,
        c.full_name,
        c.email,
        o.status,
        o.total_amount,
        o.order_date,
        o.shipped_date,
        o.delivery_date,
        o.cancelled_date,
        COUNT(oi.product_id) AS item_count
      FROM orders o
      JOIN customers c ON c.customer_id = o.customer_id
      LEFT JOIN order_products oi ON oi.order_id = o.order_id
      GROUP BY o.order_id, c.full_name, c.email
      ORDER BY o.order_date DESC
    `);

    return NextResponse.json({ orders: orders.rows });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer_id, items } = body;
    // items = [{ product_id, quantity, unit_price }]

    if (!customer_id || !items || items.length === 0) {
      return NextResponse.json({ error: 'Customer and at least one item are required.' }, { status: 400 });
    }

    const total_amount = items.reduce(
      (sum: number, item: { quantity: number; unit_price: number }) =>
        sum + item.quantity * item.unit_price, 0
    );

    // Insert order
    const orderResult = await query(`
      INSERT INTO orders (customer_id, status, total_amount, order_date)
      VALUES ($1, 'pending', $2, NOW())
      RETURNING *
    `, [customer_id, total_amount.toFixed(2)]);

    const order_id = orderResult.rows[0].order_id;

    // Insert order items
    for (const item of items) {
      await query(`
        INSERT INTO order_products (order_id, product_id, quantity, unit_price)
        VALUES ($1, $2, $3, $4)
      `, [order_id, item.product_id, item.quantity, item.unit_price]);
    }

    return NextResponse.json({ order: orderResult.rows[0] }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}