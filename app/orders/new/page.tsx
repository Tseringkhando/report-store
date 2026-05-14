'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Customer { customer_id: number; full_name: string; email: string; }
interface Product  { product_id: number; name: string; sku: string; price: string; }
interface CartItem { product_id: number; name: string; sku: string; unit_price: number; quantity: number; }

export default function NewOrderPage() {
  const router = useRouter();
  const [customers, setCustomers]   = useState<Customer[]>([]);
  const [products, setProducts]     = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [cart, setCart]             = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity]     = useState('1');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
    ]).then(([cd, pd]) => {
      setCustomers(cd.customers);
      setProducts(pd.products);
    });
  }, []);

  function addToCart() {
    if (!selectedProduct || !quantity) return;
    const product = products.find(p => p.product_id === parseInt(selectedProduct));
    if (!product) return;

    // If already in cart, update quantity
    const existing = cart.find(c => c.product_id === product.product_id);
    if (existing) {
      setCart(cart.map(c =>
        c.product_id === product.product_id
          ? { ...c, quantity: c.quantity + parseInt(quantity) }
          : c
      ));
    } else {
      setCart([...cart, {
        product_id: product.product_id,
        name: product.name,
        sku: product.sku,
        unit_price: parseFloat(product.price),
        quantity: parseInt(quantity),
      }]);
    }
    setSelectedProduct('');
    setQuantity('1');
  }

  function removeFromCart(product_id: number) {
    setCart(cart.filter(c => c.product_id !== product_id));
  }

  function updateQty(product_id: number, qty: number) {
    if (qty <= 0) { removeFromCart(product_id); return; }
    setCart(cart.map(c => c.product_id === product_id ? { ...c, quantity: qty } : c));
  }

  const total = cart.reduce((sum, c) => sum + c.unit_price * c.quantity, 0);

  async function handleSubmit() {
    setError('');
    if (!customerId) { setError('Please select a customer.'); return; }
    if (cart.length === 0) { setError('Please add at least one product.'); return; }

    setLoading(true);
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: parseInt(customerId),
        items: cart.map(c => ({
          product_id: c.product_id,
          quantity: c.quantity,
          unit_price: c.unit_price,
        })),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
    router.push('/orders');
  }

  return (
    <>
      <div className="page-header">
        <h2>New Order</h2>
        <p>Select a customer, add products, and place the order</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>

        {/* Left — form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Customer */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">1 — Select Customer</span>
            </div>
            <div className="card-body">
              <select style={inputStyle} value={customerId}
                onChange={e => setCustomerId(e.target.value)}>
                <option value="">Choose a customer…</option>
                {customers.map(c => (
                  <option key={c.customer_id} value={c.customer_id}>
                    {c.full_name} — {c.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Add products */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">2 — Add Products</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px auto', gap: 10, alignItems: 'end' }}>
                <div>
                  <label style={labelStyle}>Product</label>
                  <select style={inputStyle} value={selectedProduct}
                    onChange={e => setSelectedProduct(e.target.value)}>
                    <option value="">Select product…</option>
                    {products.map(p => (
                      <option key={p.product_id} value={p.product_id}>
                        {p.sku} — {p.name} (${parseFloat(p.price).toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Qty</label>
                  <input style={inputStyle} type="number" min="1" value={quantity}
                    onChange={e => setQuantity(e.target.value)} />
                </div>
                <button onClick={addToCart} style={btnPrimary}>
                  Add
                </button>
              </div>

              {/* Cart table */}
              {cart.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Unit Price</th>
                        <th>Qty</th>
                        <th>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map(item => (
                        <tr key={item.product_id}>
                          <td>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-muted text-sm">{item.sku}</div>
                          </td>
                          <td className="text-mono">${item.unit_price.toFixed(2)}</td>
                          <td>
                            <input
                              type="number" min="1"
                              value={item.quantity}
                              onChange={e => updateQty(item.product_id, parseInt(e.target.value))}
                              style={{ ...inputStyle, width: 70, padding: '5px 8px' }}
                            />
                          </td>
                          <td className="text-mono font-semibold">
                            ${(item.unit_price * item.quantity).toFixed(2)}
                          </td>
                          <td>
                            <button
                              onClick={() => removeFromCart(item.product_id)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16 }}
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {cart.length === 0 && (
                <div className="text-muted text-sm" style={{ marginTop: 16, textAlign: 'center', padding: '20px 0' }}>
                  No products added yet — select a product and click Add
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — order summary */}
        <div className="card" style={{ position: 'sticky', top: 20 }}>
          <div className="card-header">
            <span className="card-title">Order Summary</span>
          </div>
          <div className="card-body">
            {error && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={previewLabel}>Customer</div>
                <div className="font-medium">
                  {customerId
                    ? customers.find(c => c.customer_id === parseInt(customerId))?.full_name
                    : <span className="text-muted">Not selected</span>}
                </div>
              </div>

              <div>
                <div style={previewLabel}>Items</div>
                <div className="text-mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy-900)' }}>
                  {cart.reduce((s, c) => s + c.quantity, 0)} units
                </div>
                <div className="text-muted text-sm">{cart.length} product{cart.length !== 1 ? 's' : ''}</div>
              </div>

              <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 12 }}>
                <div style={previewLabel}>Order Total</div>
                <div className="text-mono" style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)' }}>
                  ${total.toFixed(2)}
                </div>
              </div>

              <div>
                <div style={previewLabel}>Status</div>
                <span className="badge badge-pending">pending</span>
              </div>

              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={handleSubmit}
                  disabled={loading || cart.length === 0 || !customerId}
                  style={{
                    ...btnPrimary,
                    width: '100%',
                    justifyContent: 'center',
                    opacity: (cart.length === 0 || !customerId) ? 0.5 : 1,
                  }}
                >
                  {loading ? 'Placing Order…' : 'Place Order'}
                </button>
                <Link href="/orders" style={{ ...btnSecondary, justifyContent: 'center' }}>
                  Cancel
                </Link>
              </div>
            </div>
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
  padding: '10px 20px', background: 'var(--accent)', color: 'white',
  border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
  display: 'inline-flex', alignItems: 'center',
};

const btnSecondary: React.CSSProperties = {
  padding: '10px 20px', background: 'var(--white)', color: 'var(--gray-600)',
  border: '1px solid var(--gray-200)', borderRadius: 8, fontSize: 13,
  fontWeight: 600, textDecoration: 'none',
  display: 'inline-flex', alignItems: 'center', fontFamily: 'DM Sans, sans-serif',
};