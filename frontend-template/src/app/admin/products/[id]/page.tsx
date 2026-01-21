'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Eye,
  Trash2,
  ImagePlus,
  X,
  GripVertical,
  Plus,
  MoreVertical,
  ExternalLink,
  Copy,
  Archive,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku: string;
  barcode?: string;
  trackInventory: boolean;
  inventory: number;
  lowStockThreshold: number;
  weight?: number;
  weightUnit: string;
  status: 'active' | 'draft' | 'archived';
  categoryId: string;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  slug: string;
  images: { id: string; url: string; alt: string }[];
  createdAt: string;
  updatedAt: string;
}

// Mock product data
const mockProduct: Product = {
  id: '1',
  name: 'Classic White T-Shirt',
  description: 'A timeless classic white t-shirt made from 100% organic cotton. Perfect for everyday wear, this comfortable and versatile piece features a relaxed fit and durable construction that only gets softer with each wash.',
  shortDescription: 'Premium organic cotton t-shirt for everyday comfort',
  price: 29.99,
  compareAtPrice: 39.99,
  costPrice: 12.50,
  sku: 'TSH-WHT-001',
  barcode: '1234567890123',
  trackInventory: true,
  inventory: 150,
  lowStockThreshold: 20,
  weight: 0.3,
  weightUnit: 'kg',
  status: 'active',
  categoryId: '1',
  tags: ['cotton', 'casual', 'summer'],
  metaTitle: 'Classic White T-Shirt | Premium Organic Cotton',
  metaDescription: 'Shop our classic white t-shirt made from 100% organic cotton. Comfortable, durable, and perfect for everyday wear.',
  slug: 'classic-white-t-shirt',
  images: [],
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-20T14:45:00Z',
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'media' | 'variants' | 'inventory' | 'seo'>('general');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    compareAtPrice: '',
    costPrice: '',
    sku: '',
    barcode: '',
    trackInventory: true,
    inventory: '',
    lowStockThreshold: '10',
    weight: '',
    weightUnit: 'kg',
    status: 'draft',
    categoryId: '',
    tags: [] as string[],
    metaTitle: '',
    metaDescription: '',
    slug: '',
  });

  const [images, setImages] = useState<{ id: string; url: string; alt: string }[]>([]);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    // Simulate loading product data
    const loadProduct = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));

      // In real implementation, fetch product from API
      const product = mockProduct;

      setFormData({
        name: product.name,
        description: product.description,
        shortDescription: product.shortDescription,
        price: product.price.toString(),
        compareAtPrice: product.compareAtPrice?.toString() || '',
        costPrice: product.costPrice?.toString() || '',
        sku: product.sku,
        barcode: product.barcode || '',
        trackInventory: product.trackInventory,
        inventory: product.inventory.toString(),
        lowStockThreshold: product.lowStockThreshold.toString(),
        weight: product.weight?.toString() || '',
        weightUnit: product.weightUnit,
        status: product.status,
        categoryId: product.categoryId,
        tags: product.tags,
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
        slug: product.slug,
      });
      setImages(product.images);
      setIsLoading(false);
    };

    loadProduct();
  }, [productId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleAddTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Implement API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    // TODO: Implement delete API call
    await new Promise(resolve => setTimeout(resolve, 500));
    router.push('/admin/products');
  };

  const handleDuplicate = () => {
    // Navigate to new product with pre-filled data
    router.push(`/admin/products/new?duplicate=${productId}`);
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'media', label: 'Media' },
    { id: 'variants', label: 'Variants' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'seo', label: 'SEO' },
  ] as const;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{formData.name}</h1>
            <p className="text-gray-500">
              Last updated {new Date(mockProduct.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowActionMenu(!showActionMenu)}
              className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {showActionMenu && (
              <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border bg-white py-1 shadow-lg">
                <a
                  href={`/products/${formData.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <ExternalLink className="h-4 w-4" />
                  View on Store
                </a>
                <button
                  onClick={handleDuplicate}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Copy className="h-4 w-4" />
                  Duplicate
                </button>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, status: 'archived' }))}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Archive className="h-4 w-4" />
                  Archive
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'general' && (
            <>
              <div className="rounded-lg border bg-white p-6">
                <h2 className="mb-4 font-semibold text-gray-900">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Short Description</label>
                    <textarea
                      name="shortDescription"
                      value={formData.shortDescription}
                      onChange={handleChange}
                      rows={2}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={6}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-white p-6">
                <h2 className="mb-4 font-semibold text-gray-900">Pricing</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price *</label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        step="0.01"
                        min="0"
                        className="block w-full rounded-lg border border-gray-300 py-2 pl-7 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Compare at Price</label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        name="compareAtPrice"
                        value={formData.compareAtPrice}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className="block w-full rounded-lg border border-gray-300 py-2 pl-7 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cost Price</label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        name="costPrice"
                        value={formData.costPrice}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className="block w-full rounded-lg border border-gray-300 py-2 pl-7 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {formData.price && formData.costPrice && (
                  <div className="mt-4 rounded-lg bg-gray-50 p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Profit Margin</span>
                      <span className="font-medium text-green-600">
                        ${(parseFloat(formData.price) - parseFloat(formData.costPrice)).toFixed(2)} (
                        {(((parseFloat(formData.price) - parseFloat(formData.costPrice)) / parseFloat(formData.price)) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'media' && (
            <div className="rounded-lg border bg-white p-6">
              <h2 className="mb-4 font-semibold text-gray-900">Product Images</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {images.map((image, index) => (
                  <div key={image.id} className="group relative aspect-square rounded-lg border bg-gray-50">
                    <img src={image.url} alt={image.alt} className="h-full w-full rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages(prev => prev.filter(img => img.id !== image.id))}
                      className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="absolute left-2 top-2 cursor-grab text-gray-400">
                      <GripVertical className="h-4 w-4" />
                    </div>
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 rounded bg-blue-600 px-2 py-0.5 text-xs text-white">
                        Main
                      </span>
                    )}
                  </div>
                ))}
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
                  <ImagePlus className="h-8 w-8 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">Add Image</span>
                  <input type="file" accept="image/*" className="hidden" multiple />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="rounded-lg border bg-white p-6">
              <h2 className="mb-4 font-semibold text-gray-900">Inventory</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">SKU</label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Barcode</label>
                    <input
                      type="text"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="trackInventory"
                    name="trackInventory"
                    checked={formData.trackInventory}
                    onChange={(e) => setFormData(prev => ({ ...prev, trackInventory: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="trackInventory" className="text-sm text-gray-700">
                    Track inventory for this product
                  </label>
                </div>

                {formData.trackInventory && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                      <input
                        type="number"
                        name="inventory"
                        value={formData.inventory}
                        onChange={handleChange}
                        min="0"
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Low Stock Alert</label>
                      <input
                        type="number"
                        name="lowStockThreshold"
                        value={formData.lowStockThreshold}
                        onChange={handleChange}
                        min="0"
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h3 className="mb-3 text-sm font-medium text-gray-700">Shipping</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Weight</label>
                      <div className="mt-1 flex">
                        <input
                          type="number"
                          name="weight"
                          value={formData.weight}
                          onChange={handleChange}
                          step="0.01"
                          min="0"
                          className="block w-full rounded-l-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <select
                          name="weightUnit"
                          value={formData.weightUnit}
                          onChange={handleChange}
                          className="rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 px-3 py-2 text-sm"
                        >
                          <option value="kg">kg</option>
                          <option value="g">g</option>
                          <option value="lb">lb</option>
                          <option value="oz">oz</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="rounded-lg border bg-white p-6">
              <h2 className="mb-4 font-semibold text-gray-900">Search Engine Optimization</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">URL Slug</label>
                  <div className="mt-1 flex">
                    <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                      /products/
                    </span>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      className="block w-full rounded-r-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Meta Title</label>
                  <input
                    type="text"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleChange}
                    maxLength={60}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">{formData.metaTitle.length}/60 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Meta Description</label>
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleChange}
                    rows={3}
                    maxLength={160}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">{formData.metaDescription.length}/160 characters</p>
                </div>

                <div className="rounded-lg border bg-gray-50 p-4">
                  <p className="mb-2 text-xs font-medium text-gray-500">Search Preview</p>
                  <div className="space-y-1">
                    <p className="text-lg text-blue-700 hover:underline">
                      {formData.metaTitle || formData.name}
                    </p>
                    <p className="text-sm text-green-700">yourstore.com/products/{formData.slug}</p>
                    <p className="text-sm text-gray-600">
                      {formData.metaDescription || formData.shortDescription}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 font-semibold text-gray-900">Status</h2>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 font-semibold text-gray-900">Category</h2>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select category</option>
              <option value="1">T-Shirts</option>
              <option value="2">Jeans</option>
              <option value="3">Jackets</option>
              <option value="4">Shoes</option>
              <option value="5">Dresses</option>
            </select>
          </div>

          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 font-semibold text-gray-900">Tags</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                >
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add a tag"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">Delete Product</h2>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete "{formData.name}"? This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
