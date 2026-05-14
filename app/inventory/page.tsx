'use client';
import { useEffect, useState } from 'react';

interface InventoryRow {
  sku: string; name: string; category: string; warehouse: string; region: string;
  quantity_on_hand: number; reorder_threshold: number; buffer: number;
  stock_status: string; last_updated: string;
}

interface WarehouseRow {
  warehouse: string; region: string; total_units: number; product_count: number;
}

interface Summary {
  out_of_stock: string; reorder_now: string; low: string; ok: string; total_units: string;
}

const statusClass: Record<string, string> = {
  'OK': 'badge-ok', 'LOW': 'badge-low',
  'REORDER NOW': 'badge-reorder', 'OUT OF STOCK': 'badge-out',
};

const statusDot: Record<string, string> = {
  'OK': 'dot-green', 'LOW': 'dot-yellow',
  'REORDER NOW': 'dot-red', 'OUT OF STOCK': 'dot-red',
};

export default function InventoryPage() {
  const [inventory, setInventory]     = useState<InventoryRow[]>([]);
  const [summary, setSummary]         = useState<Summary | null>(null);
  const [byWarehouse, setByWarehouse] = useState<WarehouseRow[]>([]);
  const [filter, setFilter]           = useState('ALL');
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    fetch('/api/inventory')
      .then(r => r.json())
      .then(d => {
        setInventory(d.inventory);
        setSummary(d.summary);
        setByWarehouse(d.byWarehouse);
        setLoading(false);
      });
  }, []);

  const filtered  = filter === 'ALL' ? inventory : inventory.filter(i => i.stock_status === filter);
  const statuses  = ['ALL', 'OUT OF STOCK', 'REORDER NOW', 'LOW', 'OK'];

  return (
    <>
      <div className="page-header">
        <h2>Inventory Health</h2>
        <p>Stock levels across all warehouses — reorder alerts highlighted</p>
      </div>

      {summary && (
        <div className="stat-grid mb-20">
          <div className="stat-card">
            <div className="stat-label">Total Units</div>
            <div className="stat-value">{parseInt(summary.total_units).toLocaleString()}</div>
            <div className="stat-sub">across all warehouses</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Out of Stock</div>
            <div className="stat-value" style={{ color: '#ef4444' }}>{summary.out_of_stock}</div>
            <div className="stat-sub">SKU-warehouse pairs</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Reorder Now</div>
            <div className="stat-value" style={{ color: '#ef4444' }}>{summary.reorder_now}</div>
            <div className="stat-sub">below threshold</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Low Stock</div>
            <div className="stat-value" style={{ color: '#f59e0b' }}>{summary.low}</div>
            <div className="stat-sub">within 1.5× threshold</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Healthy</div>
            <div className="stat-value" style={{ color: '#10b981' }}>{summary.ok}</div>
            <div className="stat-sub">well stocked</div>
          </div>
        </div>
      )}

      <div className="card mb-20">
        <div className="card-header"><span className="card-title">Stock by Warehouse</span></div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Warehouse</th><th>Region</th><th>Total Units</th><th>Products Stocked</th></tr>
            </thead>
            <tbody>
              {byWarehouse.map(w => (
                <tr key={w.warehouse}>
                  <td className="font-medium">{w.warehouse}</td>
                  <td><span className="badge" style={{ background: '#e0e7ff', color: '#3730a3' }}>{w.region}</span></td>
                  <td className="text-mono">{parseInt(w.total_units as unknown as string).toLocaleString()}</td>
                  <td className="text-mono">{w.product_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="filter-bar">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '7px 14px', borderRadius: 8, border: '1px solid',
            borderColor: filter === s ? 'var(--accent)' : 'var(--gray-200)',
            background: filter === s ? 'var(--accent)' : 'var(--white)',
            color: filter === s ? 'white' : 'var(--gray-600)',
            fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
          }}>
            {s}
            {s !== 'ALL' && summary && (
              <span style={{ marginLeft: 6, opacity: 0.8 }}>
                ({s === 'OUT OF STOCK' ? summary.out_of_stock
                  : s === 'REORDER NOW' ? summary.reorder_now
                  : s === 'LOW' ? summary.low : summary.ok})
              </span>
            )}
          </button>
        ))}
        <span className="text-muted text-sm">{filtered.length} rows</span>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div className="loading"><div className="spinner" /> Loading inventory…</div>
          ) : (
            <table>
              <thead>
                <tr><th>SKU</th><th>Product</th><th>Category</th><th>Warehouse</th><th>On Hand</th><th>Threshold</th><th>Buffer</th><th>Status</th></tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={i}>
                    <td className="text-mono text-muted">{row.sku}</td>
                    <td className="font-medium">{row.name}</td>
                    <td className="text-muted">{row.category}</td>
                    <td>
                      <div>{row.warehouse}</div>
                      <div className="text-muted text-sm">{row.region}</div>
                    </td>
                    <td className="text-mono">{row.quantity_on_hand}</td>
                    <td className="text-mono text-muted">{row.reorder_threshold}</td>
                    <td className="text-mono" style={{
                      color: row.buffer <= 0 ? '#ef4444' : row.buffer <= row.reorder_threshold * 0.5 ? '#f59e0b' : '#10b981',
                      fontWeight: 600,
                    }}>
                      {row.buffer > 0 ? `+${row.buffer}` : row.buffer}
                    </td>
                    <td>
                      <span className={`badge ${statusClass[row.stock_status] || ''}`}>
                        <span className={`dot ${statusDot[row.stock_status]}`} />
                        {row.stock_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}