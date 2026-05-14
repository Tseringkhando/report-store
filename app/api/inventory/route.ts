import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const inventory = await query(`
      SELECT
        p.sku, p.product_name, c.catname AS category,
       w.warehouse_name AS warehouse, w.region,
        i.quantity_on_hand, i.reorder_threshold,
        i.quantity_on_hand - i.reorder_threshold AS buffer,
        CASE
          WHEN i.quantity_on_hand = 0                          THEN 'OUT OF STOCK'
          WHEN i.quantity_on_hand <= i.reorder_threshold       THEN 'REORDER NOW'
          WHEN i.quantity_on_hand <= i.reorder_threshold * 1.5 THEN 'LOW'
          ELSE                                                       'OK'
        END AS stock_status,
        i.created_at AS last_updated
      FROM inventory i
      JOIN products p ON p.product_id = i.product_id
      JOIN categories c ON c.category_id = p.category_id
      JOIN warehouses w ON w.warehouse_id = i.warehouse_id
      ORDER BY buffer ASC, p.product_name
    `);

    const summary = await query(`
      SELECT
        COUNT(*) FILTER (WHERE quantity_on_hand = 0) AS out_of_stock,
        COUNT(*) FILTER (WHERE quantity_on_hand > 0 AND quantity_on_hand <= reorder_threshold) AS reorder_now,
        COUNT(*) FILTER (WHERE quantity_on_hand > reorder_threshold AND quantity_on_hand <= reorder_threshold * 1.5) AS low,
        COUNT(*) FILTER (WHERE quantity_on_hand > reorder_threshold * 1.5) AS ok,
        SUM(quantity_on_hand) AS total_units
      FROM inventory
    `);

    const byWarehouse = await query(`
      SELECT w.warehouse_name AS warehouse, w.region,
        SUM(i.quantity_on_hand) AS total_units,
        COUNT(DISTINCT i.product_id) AS product_count
      FROM inventory i
      FULL JOIN warehouses w ON w.warehouse_id = i.warehouse_id
      GROUP BY w.warehouse_id,w.warehouse_name, w.region
      ORDER BY total_units DESC
    `);

    return NextResponse.json({
      inventory: inventory.rows,
      summary: summary.rows[0],
      byWarehouse: byWarehouse.rows,
    });
  } catch (err) {
    console.error(err.message);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}


//post
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product_id, warehouse_id, quantity_on_hand, reorder_threshold } = body;

    // Check if this product-warehouse pair already exists
    const existing = await query(
      `SELECT inventory_id FROM inventory WHERE product_id = $1 AND warehouse_id = $2`,
      [product_id, warehouse_id]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'This product is already stocked in that warehouse. Use an inventory adjustment instead.' },
        { status: 400 }
      );
    }

    const result = await query(`
      INSERT INTO inventory (product_id, warehouse_id, quantity_on_hand, reorder_threshold)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [product_id, warehouse_id, quantity_on_hand, reorder_threshold ?? 10]);

    return NextResponse.json({ inventory: result.rows[0] }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}