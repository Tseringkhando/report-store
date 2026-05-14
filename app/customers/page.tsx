'use client';
import { useEffect, useState } from 'react';

interface Customer {
  customer_id: number; full_name: string; email: string; phone: string;
  created_at: string; order_count: string; lifetime_value: string | null;
  last_order_date: string | null; segment: string;
}

const segmentClass: Record<string, string> = {
  VIP: 'badge-vip', Loyal: 'badge-loyal',
  Regular: 'badge-regular', New: 'badge-new', 'No orders': 'badge-cancelled',
};

function timeAgo(dateStr: string | null) {
  if (!dateStr) return '—';
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30)  return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    fetch(`/api/customers?${params}`)
      .then(r => r.json())
      .then(d => { setCustomers(d.customers); setLoading(false); });
  }, [search]);

  const segments  = ['VIP', 'Loyal', 'Regular', 'New', 'No orders'];
  const segCounts = segments.map(s => ({
    label: s,
    count: customers.filter(c => c.segment === s).length,
  }));

  return (
    <>
      <div className="page-header">
        <h2>Customers</h2>
        <p>Lifetime value, segmentation, and order history</p>
      </div>

      <div className="stat-grid mb-20">
        {segCounts.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.count}</div>
            <div className="stat-sub">customers</div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <input className="search-input" placeholder="Search by name or email…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <span className="text-muted text-sm">{loading ? 'Loading…' : `${customers.length} customers`}</span>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div className="loading"><div className="spinner" /> Loading customers…</div>
          ) : (
            <table>
              <thead>
                <tr><th>Customer</th><th>Email</th><th>Segment</th><th>Orders</th><th>Lifetime Value</th><th>Last Order</th></tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.customer_id}>
                    <td>
                      <div className="font-medium">{c.full_name}</div>
                      <div className="text-muted text-sm">{c.phone}</div>
                    </td>
                    <td className="text-muted">{c.email}</td>
                    <td><span className={`badge ${segmentClass[c.segment] || ''}`}>{c.segment}</span></td>
                    <td className="text-mono">{c.order_count}</td>
                    <td className="text-mono font-semibold">
                      {c.lifetime_value ? `$${parseFloat(c.lifetime_value).toFixed(2)}` : '—'}
                    </td>
                    <td className="text-muted">{timeAgo(c.last_order_date)}</td>
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