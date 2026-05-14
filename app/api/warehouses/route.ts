import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const warehouses = await query(`
      SELECT warehouse_id, warehouse_name, address, region, created_at
      FROM warehouses
      ORDER BY warehouse_id
    `);
    return NextResponse.json({ warehouses: warehouses.rows });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { warehouse_name, address, region } = body;

    const result = await query(`
      INSERT INTO warehouses (name, address, region)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [warehouse_name, address, region]);

    return NextResponse.json({ warehouse: result.rows[0] }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}