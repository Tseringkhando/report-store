'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Order {
  order_id: number;
  full_name: string;
  email: string;
  status: string;
  total_amount: string;
  order_date: string;
  item_count: string;
}

const STATUS_OPTIONS = ['pending','confirmed','shipped','delivered','cancelled','refunded'];

const statusClass: Record<string, string> = {
  delivered: 'badge-delivered', shipped: 'badge-shipped',
  confirmed: 'badge-confirmed', pending: 'badge-pending',
  cancelled: 'badge-cancelled', refunded: 'badge-refunded',
};

function timeAgo(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function OrdersPage() {
  const [orders, setOrders]         = useState<Order[]>([]);
  const [loading, setLoading]       = useState(true);
  const [updating, setUpdating]     = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch]         = useState('');

  async function loadOrders() {
    setLoading(true);
    fetch('/api/orders')
      .then(r => r.json())
      .then(d => { setOrders(d.orders); setLoading(false); });
  }

  useEffect(() => { loadOrders(); }, []);

  async function updateStatus(order_id: number, status: string) {
    setUpdating(order_id);
    await fetch(`/api/orders/${order_id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setUpdating(null);
    loadOrders();
  }

  const filtered = orders
    .filter(o => statusFilter === 'ALL' || o.status === statusFilter)
    .filter(o => search === '' ||
      o.full_name.toLowerCase().includes(search.toLowerCase()) ||
      String(o.order_id).includes(search)
    );

  const statusCounts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Orders</h2>
          <p>All orders — update status or create a new one</p>
        </div>
        <Link href="/orders/new" style={{
          padding: '9px 18px', background: 'var(--accent)', color: 'white',
          borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none',
        }}>
          + New Order
        </Link>
      </div>

      {/* Status summary cards */}
      <div className="stat-grid mb-20">
        {STATUS_OPTIONS.map(s => (
          <div className="stat-card" key={s} style={{ cursor: 'pointer' }}
            onClick={() => setStatusFilter(statusFilter === s ? 'ALL' : s)}>
            <div className="stat-label">{s}</div>
            <div className="stat-value" style={{ fontSize: 22 }}>{statusCounts[s] || 0}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input className="search-input" placeholder="Search by customer or order ID…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="select-input" value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s} ({statusCounts[s] || 0})</option>
          ))}
        </select>
        <span className="text-muted text-sm">{filtered.length} orders</span>
      </div>

      {/* Orders table */}
      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div className="loading"><div className="spinner" /> Loading orders…</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.order_id}>
                    <td className="text-mono text-muted">#{o.order_id}</td>
                    <td>
                      <div className="font-medium">{o.full_name}</div>
                      <div className="text-muted text-sm">{o.email}</div>
                    </td>
                    <td className="text-mono">{o.item_count} items</td>
                    <td className="text-mono font-semibold">
                      ${parseFloat(o.total_amount).toFixed(2)}
                    </td>
                    <td className="text-muted">{timeAgo(o.order_date)}</td>
                    <td>
                      <span className={`badge ${statusClass[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                    <td>
                      <select
                        className="select-input"
                        style={{ padding: '5px 10px', fontSize: 12 }}
                        value={o.status}
                        disabled={updating === o.order_id}
                        onChange={e => updateStatus(o.order_id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {updating === o.order_id && (
                        <span className="text-muted text-sm" style={{ marginLeft: 8 }}>saving…</span>
                      )}
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