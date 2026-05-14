'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Product {
  product_id: number;
  name: string;
  sku: string;
}

interface Warehouse {
  warehouse_id: number;
  name: string;
  region: string;
}

export default function NewInventoryPage() {
  const router = useRouter();
  const [products, setProducts]     = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [form, setForm] = useState({
    product_id: '',
    warehouse_id: '',
    quantity_on_hand: '',
    reorder_threshold: '10',
  });

  useEffect(() => {
    // Load products and warehouses for the dropdowns
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/warehouses').then(r => r.json()),
    ]).then(([pd, wd]) => {
      setProducts(pd.products);
      setWarehouses(wd.warehouses);
    });
  }, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit() {
    setError('');
    if (!form.product_id || !form.warehouse_id || !form.quantity_on_hand) {
      setError('Product, warehouse and quantity are required.');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id:        parseInt(form.product_id),
        warehouse_id:      parseInt(form.warehouse_id),
        quantity_on_hand:  parseInt(form.quantity_on_hand),
        reorder_threshold: parseInt(form.reorder_threshold),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
    router.push('/inventory');
  }

  // Find selected product details for the preview
  const selectedProduct = products.find(p => p.product_id === parseInt(form.product_id));
  const selectedWarehouse = warehouses.find(w => w.warehouse_id === parseInt(form.warehouse_id));

  return (
    <>
      <div className="page-header">
        <h2>Add to Inventory</h2>
        <p>Assign a product to a warehouse with an opening stock quantity</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

        {/* Form */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Inventory Entry</span>
            <Link href="/inventory" style={{ fontSize: 12, color: 'var(--gray-500)', textDecoration: 'none' }}>
              ← Back to Inventory
            </Link>
          </div>
          <div className="card-body">
            {error && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              <div>
                <label style={labelStyle}>Product *</label>
                <select style={inputStyle} value={form.product_id}
                  onChange={e => set('product_id', e.target.value)}>
                  <option value="">Select a product…</option>
                  {products.map(p => (
                    <option key={p.product_id} value={p.product_id}>
                      {p.sku} — {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Warehouse *</label>
                <select style={inputStyle} value={form.warehouse_id}
                  onChange={e => set('warehouse_id', e.target.value)}>
                  <option value="">Select a warehouse…</option>
                  {warehouses.map(w => (
                    <option key={w.warehouse_id} value={w.warehouse_id}>
                      {w.name} ({w.region})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Opening Quantity *</label>
                  <input style={inputStyle} type="number" min="0" placeholder="e.g. 200"
                    value={form.quantity_on_hand}
                    onChange={e => set('quantity_on_hand', e.target.value)} />
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>
                    Units going into this warehouse
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Reorder Threshold</label>
                  <input style={inputStyle} type="number" min="0" placeholder="e.g. 10"
                    value={form.reorder_threshold}
                    onChange={e => set('reorder_threshold', e.target.value)} />
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>
                    Alert fires below this level
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button onClick={handleSubmit} disabled={loading} style={btnPrimary}>
                  {loading ? 'Saving…' : 'Add to Inventory'}
                </button>
                <Link href="/inventory" style={btnSecondary}>Cancel</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Preview card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Preview</span>
          </div>
          <div className="card-body">
            {!selectedProduct && !selectedWarehouse ? (
              <div className="text-muted text-sm">
                Select a product and warehouse to see a preview of the inventory entry.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {selectedProduct && (
                  <div>
                    <div style={previewLabel}>Product</div>
                    <div className="font-semibold">{selectedProduct.name}</div>
                    <div className="text-muted text-sm">{selectedProduct.sku}</div>
                  </div>
                )}
                {selectedWarehouse && (
                  <div>
                    <div style={previewLabel}>Warehouse</div>
                    <div className="font-semibold">{selectedWarehouse.name}</div>
                    <div className="text-muted text-sm">{selectedWarehouse.region}</div>
                  </div>
                )}
                {form.quantity_on_hand && (
                  <div>
                    <div style={previewLabel}>Opening Stock</div>
                    <div className="font-semibold text-mono" style={{ fontSize: 22, color: 'var(--accent)' }}>
                      {parseInt(form.quantity_on_hand).toLocaleString()}
                    </div>
                    <div className="text-muted text-sm">units</div>
                  </div>
                )}
                {form.reorder_threshold && (
                  <div>
                    <div style={previewLabel}>Reorder Alert</div>
                    <div className="text-sm">
                      Fires when stock drops to{' '}
                      <strong>{form.reorder_threshold}</strong> units or below
                    </div>
                  </div>
                )}
                {form.quantity_on_hand && form.reorder_threshold && (
                  <div>
                    <div style={previewLabel}>Initial Status</div>
                    <span className={`badge ${
                      parseInt(form.quantity_on_hand) === 0 ? 'badge-out' :
                      parseInt(form.quantity_on_hand) <= parseInt(form.reorder_threshold) ? 'badge-reorder' :
                      parseInt(form.quantity_on_hand) <= parseInt(form.reorder_threshold) * 1.5 ? 'badge-low' :
                      'badge-ok'
                    }`}>
                      {parseInt(form.quantity_on_hand) === 0 ? 'OUT OF STOCK' :
                       parseInt(form.quantity_on_hand) <= parseInt(form.reorder_threshold) ? 'REORDER NOW' :
                       parseInt(form.quantity_on_hand) <= parseInt(form.reorder_threshold) * 1.5 ? 'LOW' :
                       'OK'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: 'var(--gray-600)', marginBottom: 6,
  textTransform: 'uppercase', letterSpacing: '0.04em',
};

const previewLabel: React.CSSProperties = {
  fontSize: 10, fontWeight: 600, color: 'var(--gray-400)',
  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4,
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