'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Warehouse {
  warehouse_id: number; name: string;
  address: string; region: string; created_at: string;
}

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    fetch('/api/warehouses')
      .then(r => r.json())
      .then(d => { setWarehouses(d.warehouses); setLoading(false); });
  }, []);

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Warehouses</h2>
          <p>Distribution centres and regional stock locations</p>
        </div>
        <Link href="/warehouses/new" style={{
          padding: '9px 18px', background: 'var(--accent)', color: 'white',
          borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none',
        }}>
          + Add Warehouse
        </Link>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div className="loading"><div className="spinner" /> Loading warehouses…</div>
          ) : (
            <table>
              <thead>
                <tr><th>ID</th><th>Name</th><th>Address</th><th>Region</th></tr>
              </thead>
              <tbody>
                {warehouses.map(w => (
                  <tr key={w.warehouse_id}>
                    <td className="text-mono text-muted">{w.warehouse_id}</td>
                    <td className="font-medium">{w.warehouse_name}</td>
                    <td className="text-muted">{w.address}</td>
                    <td>
                      <span className="badge" style={{ background: '#e0e7ff', color: '#3730a3' }}>
                        {w.region}
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