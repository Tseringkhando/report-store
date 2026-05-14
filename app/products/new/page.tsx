'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [form, setForm] = useState({
    sku: '', product_name: '', description: '',
    price: '', catname: '', is_active: true,
  });

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(d => setCategories(d.categories));
  }, []);

  const set = (k: string, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit() {
    setError('');
    if (!form.sku || !form.product_name || !form.price || !form.catname) {
      setError('SKU, product name, price and category are required.');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
    router.push('/products');
  }

  return (
    <>
      <div className="page-header">
        <h2>Add Product</h2>
        <p>Fill in the details below to add a new product to the catalogue</p>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        <div className="card-header">
          <span className="card-title">Product Details</span>
          <Link href="/products" style={{ fontSize: 12, color: 'var(--gray-500)', textDecoration: 'none' }}>
            ← Back to Products
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
                <label style={labelStyle}>SKU *</label>
                <input style={inputStyle} placeholder="e.g. ELEC-006"
                  value={form.sku} onChange={e => set('sku', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Category *</label>
                <select style={inputStyle} value={form.catname}
                  onChange={e => set('catname', e.target.value)}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Product Name *</label>
              <input style={inputStyle} placeholder="e.g. Wireless Mouse"
                value={form.product_name} onChange={e => set('product_name', e.target.value)} />
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }}
                placeholder="Brief product description…"
                value={form.description} onChange={e => set('description', e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Price ($) *</label>
                <input style={inputStyle} type="number" step="0.01" min="0" placeholder="0.00"
                  value={form.price} onChange={e => set('price', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select style={inputStyle} value={form.is_active ? 'true' : 'false'}
                  onChange={e => set('is_active', e.target.value === 'true')}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button onClick={handleSubmit} disabled={loading} style={btnPrimary}>
                {loading ? 'Saving…' : 'Add Product'}
              </button>
              <Link href="/products" style={btnSecondary}>Cancel</Link>
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
  fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
  textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
};