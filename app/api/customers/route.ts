import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search') || '';

  try {
    const customers = await query(`
      SELECT
        c.customer_id, c.full_name, c.email, c.phone, c.created_at,
        COUNT(o.order_id) AS order_count,
        ROUND(SUM(o.total_amount) FILTER (WHERE o.status NOT IN ('cancelled','returned')), 2) AS lifetime_value,
        MAX(o.order_date) AS last_order_date,
        CASE
          WHEN SUM(o.total_amount) FILTER (WHERE o.status NOT IN ('cancelled','returned')) >= 500 THEN 'VIP'
          WHEN SUM(o.total_amount) FILTER (WHERE o.status NOT IN ('cancelled','returned')) >= 200 THEN 'Loyal'
          WHEN SUM(o.total_amount) FILTER (WHERE o.status NOT IN ('cancelled','returned')) >= 50  THEN 'Regular'
          WHEN SUM(o.total_amount) FILTER (WHERE o.status NOT IN ('cancelled','returned')) IS NOT NULL THEN 'New'
          ELSE 'No orders'
        END AS segment
      FROM customers c
      LEFT JOIN orders o ON o.customer_id = c.customer_id
      WHERE $1 = '' OR c.full_name ILIKE '%' || $1 || '%' OR c.email ILIKE '%' || $1 || '%'
      GROUP BY c.customer_id, c.full_name, c.email, c.phone, c.created_at
      ORDER BY lifetime_value DESC NULLS LAST
    `, [search]);

    return NextResponse.json({ customers: customers.rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

//post 
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, full_name, address, phone } = body;

    const result = await query(`
      INSERT INTO customers (email, full_name, address, phone)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [email, full_name, address, phone]);

    return NextResponse.json({ customer: result.rows[0] }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
