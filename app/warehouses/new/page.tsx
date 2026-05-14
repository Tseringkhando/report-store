'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const REGIONS = ['Northeast', 'Southeast', 'Midwest', 'West Coast', 'Southwest', 'Northwest'];

export default function NewWarehousePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm] = useState({
    name: '', address: '', region: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit() {
    setError('');
    if (!form.name || !form.address || !form.region) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/warehouses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
    router.push('/warehouses');
  }

  return (
    <>
      <div className="page-header">
        <h2>Add Warehouse</h2>
        <p>Register a new warehouse distribution centre</p>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        <div className="card-header">
          <span className="card-title">Warehouse Details</span>
          <Link href="/warehouses" style={{ fontSize: 12, color: 'var(--gray-500)', textDecoration: 'none' }}>
            ← Back to Warehouses
          </Link>
        </div>
        <div className="card-body">
          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Warehouse Name *</label>
                <input style={inputStyle} placeholder="e.g. Central DC"
                  value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Region *</label>
                <select style={inputStyle} value={form.region}
                  onChange={e => set('region', e.target.value)}>
                  <option value="">Select region</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Address *</label>
              <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }}
                placeholder="Street address, city, state, zip…"
                value={form.address} onChange={e => set('address', e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button onClick={handleSubmit} disabled={loading} style={btnPrimary}>
                {loading ? 'Saving…' : 'Add Warehouse'}
              </button>
              <Link href="/warehouses" style={btnSecondary}>Cancel</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: 'var(--gray-600)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: '1px solid var(--gray-200)',
  borderRadius: 8, fontSize: 13, fontFamily: 'DM Sans, sans-serif',
  color: 'var(--navy-900)', background: 'var(--white)', outline: 'none',
};

const btnPrimary: React.CSSProperties = {
  padding: '10px 24px', background: 'var(--accent)', color: 'white',
  border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
};

const btnSecondary: React.CSSProperties = {
  padding: '10px 24px', background: 'var(--white)', color: 'var(--gray-600)',
  border: '1px solid var(--gray-200)', borderRadius: 8, fontSize: 13,
  fontWeight: 600, textDecoration: 'none',
  display: 'inline-flex', alignItems: 'center', fontFamily: 'DM Sans, sans-serif',
};