'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { label: 'OVERVIEW', items: [
    { href: '/',              icon: '▦', name: 'Dashboard'       },
  ]},
  { label: 'CATALOGUE', items: [
    { href: '/products',      icon: '⊞', name: 'Products'        },
    { href: '/products/new',  icon: '+', name: 'Add Product'     },
    { href: '/customers',     icon: '◎', name: 'Customers'       },
    { href: '/customers/new', icon: '+', name: 'Add Customer'    },
  ]},
  { label: 'OPERATIONS', items: [
    { href: '/inventory',     icon: '⊟', name: 'Inventory'       },
    { href: '/inventory/new',     icon: '+', name: 'Update Inventory'       },
    { href: '/warehouses',    icon: '⬡', name: 'Warehouses'      },
    { href: '/warehouses/new',icon: '+', name: 'Add Warehouse'   },
  ]},
  { label: 'ORDERS', items: [
  { href: '/orders',     icon: '☰', name: 'All Orders'  },
  { href: '/orders/new', icon: '+', name: 'New Order'   },
]},
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>StoreDB</h1>
        <p>The Ultimate Dashboard</p>
      </div>
      <nav className="sidebar-nav">
        {nav.map(section => (
          <div key={section.label}>
            <div className="nav-label">{section.label}</div>
            {section.items.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${path === item.href ? 'active' : ''}`}
              >
                <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        PostgreSQL · Neon · Next.js
      </div>
    </aside>
  );
}