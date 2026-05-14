'use client';
import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Legend, Sector, PieSectorShapeProps, Label, LabelList, LabelProps
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  delivered: '#10b981', shipped: '#3b82f6', confirmed: '#6366f1',
  pending: '#f59e0b', cancelled: '#ef4444', returned: '#94a3b8',
};
const CustomSlice = (props: PieSectorShapeProps) => (
  <Sector {...props} fill={STATUS_COLORS[props.name as string] || '#94a3b8'} />
);
const chartAmt = (n: number | null) =>
  n == null ? '—' : n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`;

export default function DashboardPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /> Loading dashboard…</div>;
  if (!data)   return <div className="loading">Failed to load data.</div>;

  const s = data.stats as Record<string, string>;
  const statCards = [
    { label: 'Total Revenue',   value: chartAmt(parseFloat(s.total_revenue)),    sub: 'All time' },
    { label: 'Last 30 Days',    value: chartAmt(parseFloat(s.revenue_last_30d)), sub: 'Revenue' },
    { label: 'Last 7 Days',     value: chartAmt(parseFloat(s.revenue_last_7d)),  sub: 'Revenue' },
    { label: 'Avg Order Value', value: chartAmt(parseFloat(s.avg_order_value)),  sub: `${s.valid_orders} valid orders` },
    { label: 'Total Orders',    value: s.total_orders,                      sub: `${s.valid_orders} valid` },
  ];

  const revenueByMonth = (data.revenueByMonth as Record<string, unknown>[]).map(r => ({
    month:   r.month as string,
    revenue: parseFloat(r.revenue as string) || 0,
    orders:  parseInt(r.orders as string)    || 0,
  }));
console.log(revenueByMonth);
  const ordersByStatus = (data.ordersByStatus as Record<string, unknown>[]).map(r => ({
    name:  r.status as string,
    value: parseInt(r.count as string),
  }));

  const topProducts  = data.topProducts  as Record<string, unknown>[];
  const recentOrders = data.recentOrders as Record<string, unknown>[];

  return (
    <>
   
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>E-commerce store overview — live from PostgreSQL</p>
      </div>

      <div className="stat-grid mb-28">
        {statCards.map(c => (
          <div className="stat-card" key={c.label}>
            <div className="stat-label">{c.label}</div>
            <div className="stat-value">{c.value ?? '—'}</div>
            <div className="stat-sub">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2 mb-20">
        <div className="card">
          <div className="card-header"><span className="card-title">Monthly Revenue</span></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueByMonth} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Revenue']}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Orders by Status</span></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
      <Pie
  data={ordersByStatus}
  cx="50%"
  cy="50%"
  innerRadius={30}
  outerRadius={100}
  paddingAngle={3}
  dataKey="value"
  shape={CustomSlice}
/>
                <Legend formatter={v => <span style={{ fontSize: 12 }}>{v}</span>} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Top 5 Products by Revenue</span></div>
          <div className="card-body" style={{ padding: '12px 0' }}>
            {topProducts.map((p, i) => {
              const max = parseFloat(topProducts[0].revenue as string);
              const pct = (parseFloat(p.revenue as string) / max) * 100;
              return (
                <div key={i} style={{ padding: '8px 22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span className="font-medium" style={{ fontSize: 13 }}>{p.name as string}</span>
                    <span className="text-mono" style={{ fontSize: 13, color: '#1F3864' }}>
                      ${parseFloat(p.revenue as string).toFixed(2)}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-muted text-sm" style={{ marginTop: 3 }}>
                    {p.units_sold as string} units · {p.category as string}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Recent Orders</span></div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Customer</th><th>Status</th><th>Amount</th></tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.order_id as number}>
                    <td className="text-mono text-muted">{o.order_id as number}</td>
                    <td>{o.full_name as string}</td>
                    <td><span className={`badge badge-${o.status as string}`}>{o.status as string}</span></td>
                    <td className="text-mono">${parseFloat(o.total_amount as string).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}