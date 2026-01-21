'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  FolderTree,
  Image as ImageIcon,
  ChevronRight,
  ChevronDown,
  GripVertical,
  Eye,
  EyeOff,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  productCount: number;
  isVisible: boolean;
  order: number;
  children?: Category[];
}

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Clothing',
    slug: 'clothing',
    description: 'All types of clothing',
    productCount: 245,
    isVisible: true,
    order: 1,
    children: [
      {
        id: '1-1',
        name: 'T-Shirts',
        slug: 't-shirts',
        parentId: '1',
        productCount: 89,
        isVisible: true,
        order: 1,
      },
      {
        id: '1-2',
        name: 'Jeans',
        slug: 'jeans',
        parentId: '1',
        productCount: 56,
        isVisible: true,
        order: 2,
      },
      {
        id: '1-3',
        name: 'Jackets',
        slug: 'jackets',
        parentId: '1',
        productCount: 34,
        isVisible: true,
        order: 3,
      },
      {
        id: '1-4',
        name: 'Dresses',
        slug: 'dresses',
        parentId: '1',
        productCount: 66,
        isVisible: true,
        order: 4,
      },
    ],
  },
  {
    id: '2',
    name: 'Shoes',
    slug: 'shoes',
    description: 'Footwear for all occasions',
    productCount: 123,
    isVisible: true,
    order: 2,
    children: [
      {
        id: '2-1',
        name: 'Sneakers',
        slug: 'sneakers',
        parentId: '2',
        productCount: 45,
        isVisible: true,
        order: 1,
      },
      {
        id: '2-2',
        name: 'Boots',
        slug: 'boots',
        parentId: '2',
        productCount: 28,
        isVisible: true,
        order: 2,
      },
      {
        id: '2-3',
        name: 'Sandals',
        slug: 'sandals',
        parentId: '2',
        productCount: 50,
        isVisible: false,
        order: 3,
      },
    ],
  },
  {
    id: '3',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Bags, belts, and more',
    productCount: 78,
    isVisible: true,
    order: 3,
    children: [
      {
        id: '3-1',
        name: 'Bags',
        slug: 'bags',
        parentId: '3',
        productCount: 32,
        isVisible: true,
        order: 1,
      },
      {
        id: '3-2',
        name: 'Belts',
        slug: 'belts',
        parentId: '3',
        productCount: 24,
        isVisible: true,
        order: 2,
      },
      {
        id: '3-3',
        name: 'Watches',
        slug: 'watches',
        parentId: '3',
        productCount: 22,
        isVisible: true,
        order: 3,
      },
    ],
  },
];

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['1', '2', '3']);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const CategoryRow = ({ category, level = 0 }: { category: Category; level?: number }) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.includes(category.id);

    return (
      <>
        <tr className="hover:bg-gray-50">
          <td className="px-4 py-3" style={{ paddingLeft: `${level * 24 + 16}px` }}>
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 cursor-grab text-gray-400" />
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(category.id)}
                  className="rounded p-0.5 hover:bg-gray-100"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              ) : (
                <span className="w-5" />
              )}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                ) : (
                  <FolderTree className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{category.name}</p>
                <p className="text-xs text-gray-500">/{category.slug}</p>
              </div>
            </div>
          </td>
          <td className="px-4 py-3 text-sm text-gray-700">
            {category.productCount} products
          </td>
          <td className="px-4 py-3">
            <button
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                category.isVisible
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {category.isVisible ? (
                <>
                  <Eye className="h-3 w-3" />
                  Visible
                </>
              ) : (
                <>
                  <EyeOff className="h-3 w-3" />
                  Hidden
                </>
              )}
            </button>
          </td>
          <td className="px-4 py-3">
            <div className="relative">
              <button
                onClick={() =>
                  setShowActionMenu(showActionMenu === category.id ? null : category.id)
                }
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              {showActionMenu === category.id && (
                <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border bg-white py-1 shadow-lg">
                  <button
                    onClick={() => {
                      setEditCategory(category);
                      setShowActionMenu(null);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Plus className="h-4 w-4" />
                    Add Subcategory
                  </button>
                  <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    {category.isVisible ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        Hide Category
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        Show Category
                      </>
                    )}
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
        {hasChildren && isExpanded && (
          category.children!.map((child) => (
            <CategoryRow key={child.id} category={child} level={level + 1} />
          ))
        )}
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500">Organize your products into categories</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Categories Table */}
      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Products
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Visibility
              </th>
              <th className="w-20 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockCategories.map((category) => (
              <CategoryRow key={category.id} category={category} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Category Modal */}
      {(showCreateModal || editCategory) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">
              {editCategory ? 'Edit Category' : 'Create Category'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {editCategory
                ? 'Update the category details below'
                : 'Add a new category to organize your products'}
            </p>

            <form className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category Name
                </label>
                <input
                  type="text"
                  defaultValue={editCategory?.name}
                  placeholder="e.g., Electronics"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Slug</label>
                <div className="mt-1 flex">
                  <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                    /categories/
                  </span>
                  <input
                    type="text"
                    defaultValue={editCategory?.slug}
                    placeholder="electronics"
                    className="block w-full rounded-r-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Parent Category
                </label>
                <select className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="">None (Top Level)</option>
                  {mockCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  defaultValue={editCategory?.description}
                  rows={3}
                  placeholder="Brief description of this category"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category Image
                </label>
                <div className="mt-1 flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <button
                    type="button"
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Upload Image
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isVisible"
                  defaultChecked={editCategory?.isVisible ?? true}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isVisible" className="text-sm text-gray-700">
                  Visible on storefront
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditCategory(null);
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  {editCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
