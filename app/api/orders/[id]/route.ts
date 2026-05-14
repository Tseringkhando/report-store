import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  _req: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    
    const order = await query(`
      SELECT
        o.*,
        c.full_name,
        c.email
      FROM orders o
      JOIN customers c ON c.customer_id = o.customer_id
      WHERE o.order_id = $1
    `, [id]);

    const items = await query(`
      SELECT
        oi.*,
        p.product_name AS product_name,
        p.sku
      FROM order_products oi
      JOIN products p ON p.product_id = oi.product_id
      WHERE oi.order_id = $1
    `, [id]);

    return NextResponse.json({
      order: order.rows[0],
      items: items.rows,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   const { id } = await params;
  try {
    const body = await req.json();
    const { status } = body;

    const dateField: Record<string, string> = {
      confirmed:  'confirmed_date',
      shipped:    'shipped_date',
      delivered:  'delivery_date',
      cancelled:  'cancelled_date',
      refunded:   'returned_date',
    };

    const col = dateField[status];

    const result = await query(`
      UPDATE orders
      SET
        status = $1
        ${col ? `, ${col} = NOW()` : ''}
      WHERE order_id = $2
      RETURNING *
    `, [status, id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order: result.rows[0] });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}