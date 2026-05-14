import { NextResponse } from 'next/server';
import { query } from '@/lib/db';


export async function GET() {
  try {
    const stats = await query(`
      SELECT
        COUNT(*) AS total_orders,
        COUNT(*) FILTER (WHERE status NOT IN ('cancelled','returned')) AS valid_orders,
        ROUND(SUM(total_amount) FILTER (WHERE status NOT IN ('cancelled','returned')), 2) AS total_revenue,
        ROUND(SUM(total_amount) FILTER (WHERE status NOT IN ('cancelled','returned') AND order_date >= NOW() - INTERVAL '30 days'), 2) AS revenue_last_30d,
        ROUND(SUM(total_amount) FILTER (WHERE status NOT IN ('cancelled','returned') AND order_date >= NOW() - INTERVAL '7 days'), 2) AS revenue_last_7d,
        ROUND(AVG(total_amount) FILTER (WHERE status NOT IN ('cancelled','returned')), 2) AS avg_order_value
      FROM orders
    `);

    const ordersByStatus = await query(`
      SELECT status, COUNT(*) AS count FROM orders GROUP BY status ORDER BY count DESC
    `);

    const revenueByMonth = await query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', order_date), 'Mon YYYY') AS month,
        DATE_TRUNC('month', order_date) AS month_date,
        ROUND(SUM(total_amount) FILTER (WHERE status NOT IN ('cancelled','returned')), 2) AS revenue,
        COUNT(*) FILTER (WHERE status NOT IN ('cancelled','returned')) AS orders
      FROM orders
      GROUP BY DATE_TRUNC('month', order_date)
      ORDER BY month_date ASC
    `);

    const topProducts = await query(`
      SELECT
        p.product_name, c.catname AS category,
        SUM(oi.quantity) AS units_sold,
        ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
      FROM order_products oi
      JOIN products p ON p.product_id = oi.product_id
      JOIN categories c ON c.category_id = p.category_id
      JOIN orders o ON o.order_id = oi.order_id
      WHERE o.status NOT IN ('cancelled','returned')
      GROUP BY p.product_id, p.product_name, c.catname
      ORDER BY revenue DESC LIMIT 5
    `);

    const recentOrders = await query(`
      SELECT o.order_id, c.full_name, o.status, o.total_amount, o.order_date
      FROM orders o
      JOIN customers c ON c.customer_id = o.customer_id
      ORDER BY o.order_date DESC LIMIT 8
    `);

    return NextResponse.json({
      stats: stats.rows[0],
      ordersByStatus: ordersByStatus.rows,
      revenueByMonth: revenueByMonth.rows,
      topProducts: topProducts.rows,
      recentOrders: recentOrders.rows,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}