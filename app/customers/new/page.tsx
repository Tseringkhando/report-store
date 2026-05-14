'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', address: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit() {
    setError('');
    if (!form.full_name || !form.email) {
      setError('Full name and email are required.');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
    router.push('/customers');
  }

  return (
    <>
      <div className="page-header">
        <h2>Add Customer</h2>
        <p>Register a new customer in the database</p>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        <div className="card-header">
          <span className="card-title">Customer Details</span>
          <Link href="/customers" style={{ fontSize: 12, color: 'var(--gray-500)', textDecoration: 'none' }}>
            ← Back to Customers
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
                <label style={labelStyle}>Full Name *</label>
                <input style={inputStyle} placeholder="e.g. John Doe"
                  value={form.full_name} onChange={e => set('full_name', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Email *</label>
                <input style={inputStyle} type="email" placeholder="john@email.com"
                  value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Phone</label>
              <input style={inputStyle} placeholder="e.g. 416-555-0101"
                value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>

            <div>
              <label style={labelStyle}>Address</label>
              <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }}
                placeholder="Street address, city, state, zip…"
                value={form.address} onChange={e => set('address', e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button onClick={handleSubmit} disabled={loading} style={btnPrimary}>
                {loading ? 'Saving…' : 'Add Customer'}
              </button>
              <Link href="/customers" style={btnSecondary}>Cancel</Link>
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