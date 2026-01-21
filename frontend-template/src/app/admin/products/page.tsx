'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Copy,
  Archive,
  ChevronLeft,
  ChevronRight,
  Package,
  ImageIcon,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  status: 'active' | 'draft' | 'archived';
  inventory: number;
  category: string;
  image?: string;
  createdAt: string;
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Classic White T-Shirt',
    slug: 'classic-white-t-shirt',
    sku: 'TSH-WHT-001',
    price: 29.99,
    compareAtPrice: 39.99,
    status: 'active',
    inventory: 150,
    category: 'T-Shirts',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Slim Fit Jeans',
    slug: 'slim-fit-jeans',
    sku: 'JNS-BLU-002',
    price: 79.99,
    status: 'active',
    inventory: 85,
    category: 'Jeans',
    createdAt: '2024-01-14',
  },
  {
    id: '3',
    name: 'Leather Jacket',
    slug: 'leather-jacket',
    sku: 'JKT-LTH-003',
    price: 199.99,
    compareAtPrice: 249.99,
    status: 'draft',
    inventory: 25,
    category: 'Jackets',
    createdAt: '2024-01-12',
  },
  {
    id: '4',
    name: 'Running Sneakers',
    slug: 'running-sneakers',
    sku: 'SHO-RUN-004',
    price: 129.99,
    status: 'active',
    inventory: 0,
    category: 'Shoes',
    createdAt: '2024-01-10',
  },
  {
    id: '5',
    name: 'Summer Dress',
    slug: 'summer-dress',
    sku: 'DRS-SUM-005',
    price: 59.99,
    status: 'archived',
    inventory: 45,
    category: 'Dresses',
    createdAt: '2024-01-08',
  },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: 'bg-green-100', text: 'text-green-800' },
  draft: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  archived: { bg: 'bg-gray-100', text: 'text-gray-800' },
};

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500">Manage your product inventory</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
          <Filter className="h-4 w-4" />
          More Filters
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="flex items-center gap-4 rounded-lg bg-blue-50 px-4 py-3">
          <span className="text-sm font-medium text-blue-700">
            {selectedProducts.length} selected
          </span>
          <div className="flex gap-2">
            <button className="rounded px-3 py-1 text-sm text-blue-700 hover:bg-blue-100">
              Set Active
            </button>
            <button className="rounded px-3 py-1 text-sm text-blue-700 hover:bg-blue-100">
              Set Draft
            </button>
            <button className="rounded px-3 py-1 text-sm text-red-600 hover:bg-red-100">
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={
                    selectedProducts.length === filteredProducts.length &&
                    filteredProducts.length > 0
                  }
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Inventory
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Price
              </th>
              <th className="w-20 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => toggleSelect(product.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="font-medium text-gray-900 hover:text-blue-600"
                      >
                        {product.name}
                      </Link>
                      <p className="text-sm text-gray-500">{product.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      statusColors[product.status].bg
                    } ${statusColors[product.status].text}`}
                  >
                    {product.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`text-sm ${
                      product.inventory === 0
                        ? 'font-medium text-red-600'
                        : product.inventory < 20
                        ? 'text-yellow-600'
                        : 'text-gray-700'
                    }`}
                  >
                    {product.inventory === 0
                      ? 'Out of stock'
                      : `${product.inventory} in stock`}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-700">
                  {product.category}
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    ${product.price.toFixed(2)}
                  </div>
                  {product.compareAtPrice && (
                    <div className="text-xs text-gray-500 line-through">
                      ${product.compareAtPrice.toFixed(2)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowActionMenu(
                          showActionMenu === product.id ? null : product.id
                        )
                      }
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    {showActionMenu === product.id && (
                      <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border bg-white py-1 shadow-lg">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Link>
                        <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                        <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <Copy className="h-4 w-4" />
                          Duplicate
                        </button>
                        <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <Archive className="h-4 w-4" />
                          Archive
                        </button>
                        <hr className="my-1" />
                        <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-4 py-3">
          <div className="text-sm text-gray-500">
            Showing 1 to {filteredProducts.length} of {mockProducts.length} products
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded border px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white">
              1
            </button>
            <button className="rounded border px-3 py-1 text-sm text-gray-600 hover:bg-gray-50">
              2
            </button>
            <button className="rounded border px-3 py-1 text-sm text-gray-600 hover:bg-gray-50">
              3
            </button>
            <button className="rounded border px-3 py-1 text-sm text-gray-600 hover:bg-gray-50">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
