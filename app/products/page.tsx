'use client';
import { useEffect, useState } from 'react';

interface Product {
  product_id: number; sku: string; product_name: string; description: string;
  price: string; is_active: boolean; category: string;
  avg_rating: string | null; review_count: string; total_stock: string;
}

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-muted text-sm">No reviews</span>;
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ color: '#f59e0b', fontSize: 13 }}>
        {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
      </span>
      <span className="text-muted text-sm">{rating.toFixed(1)}</span>
    </span>
  );
}

export default function ProductsPage() {
  const [products, setProducts]     = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('');
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search)   params.set('search', search);
    if (category) params.set('category', category);
    fetch(`/api/products?${params}`)
      .then(r => r.json())
      .then(d => { setProducts(d.products); setCategories(d.categories); setLoading(false); });
  }, [search, category]);

  return (
    <>
      <div className="page-header">
        <h2>Products</h2>
        <p>Full catalogue — search, filter, and review ratings</p>
      </div>

      <div className="filter-bar">
        <input className="search-input" placeholder="Search by name or SKU…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="select-input" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="text-muted text-sm">{loading ? 'Loading…' : `${products.length} products`}</span>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div className="loading"><div className="spinner" /> Loading products…</div>
          ) : (
            <table>
              <thead>
                <tr><th>SKU</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th>Status</th></tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.product_id}>
                    <td className="text-mono text-muted">{p.sku}</td>
                    <td>
                      <div className="font-medium">{p.product_name}</div>
                      <div className="text-muted text-sm" style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.description}
                      </div>
                    </td>
                    <td><span className="badge" style={{ background: '#e0e7ff', color: '#3730a3' }}>{p.category}</span></td>
                    <td className="text-mono font-semibold">${parseFloat(p.price).toFixed(2)}</td>
                    <td className="text-mono">{p.total_stock}</td>
                    <td>
                      <StarRating rating={p.avg_rating ? parseFloat(p.avg_rating) : null} />
                      <div className="text-muted text-sm">{p.review_count} reviews</div>
                    </td>
                    <td>
                      <span className={`badge ${p.is_active ? 'badge-ok' : 'badge-cancelled'}`}>
                        {p.is_active ? 'Active' : 'Inactive'}
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