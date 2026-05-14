import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const search   = req.nextUrl.searchParams.get('search')   || '';
  const category = req.nextUrl.searchParams.get('category') || '';

  try {
    const products = await query(`
      SELECT
        p.product_id, p.sku, p.product_name, p.description, p.price, p.is_active,
        c.catname AS category,
        ROUND(AVG(r.rating), 1) AS avg_rating,
        COUNT(r.review_id) AS review_count,
        COALESCE(SUM(inv.quantity_on_hand), 0) AS total_stock
      FROM products p
      JOIN categories c ON c.category_id = p.category_id
      LEFT JOIN reviews r ON r.product_id = p.product_id
      LEFT JOIN inventory inv ON inv.product_id = p.product_id
      WHERE
        ($1 = '' OR p.product_name ILIKE '%' || $1 || '%' OR p.sku ILIKE '%' || $1 || '%')
        AND ($2 = '' OR c.catname = $2)
      GROUP BY p.product_id, p.sku, p.product_name, p.description, p.price, p.is_active, c.catname
      ORDER BY p.product_id
    `, [search, category]);

    const categories = await query(`SELECT catname FROM categories ORDER BY catname`);

    return NextResponse.json({
      products: products.rows,
      categories: categories.rows.map((r: { catname: string }) => r.catname),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

//POST
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sku, product_name, description, price, catname, is_active } = body;

    const category = await query(
      `SELECT category_id FROM categories WHERE catname = $1`,
      [catname]
    );

    if (category.rows.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 400 });
    }

    const category_id = category.rows[0].category_id;

    const result = await query(`
      INSERT INTO products (sku, product_name, description, price, category_id, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [sku, product_name, description, price, category_id, is_active ?? true]);

    return NextResponse.json({ product: result.rows[0] }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}