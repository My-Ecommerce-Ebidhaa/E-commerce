'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Eye,
  ImagePlus,
  X,
  GripVertical,
  Plus,
  Trash2,
} from 'lucide-react';

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  inventory: number;
  options: Record<string, string>;
}

interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'media' | 'variants' | 'inventory' | 'seo'>('general');

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

  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [hasVariants, setHasVariants] = useState(false);
  const [variantOptions, setVariantOptions] = useState<{ name: string; values: string[] }[]>([]);
  const [newTag, setNewTag] = useState('');

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

  const handleAddVariantOption = () => {
    setVariantOptions(prev => [...prev, { name: '', values: [] }]);
  };

  const handleRemoveVariantOption = (index: number) => {
    setVariantOptions(prev => prev.filter((_, i) => i !== index));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Implement API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    router.push('/admin/products');
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'media', label: 'Media' },
    { id: 'variants', label: 'Variants' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'seo', label: 'SEO' },
  ] as const;

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
            <h1 className="text-2xl font-bold text-gray-900">New Product</h1>
            <p className="text-gray-500">Add a new product to your store</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
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
            {isSubmitting ? 'Saving...' : 'Save Product'}
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
              {/* Basic Info */}
              <div className="rounded-lg border bg-white p-6">
                <h2 className="mb-4 font-semibold text-gray-900">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={(e) => {
                        handleChange(e);
                        if (!formData.slug) {
                          setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }));
                        }
                      }}
                      required
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter product name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Short Description
                    </label>
                    <textarea
                      name="shortDescription"
                      value={formData.shortDescription}
                      onChange={handleChange}
                      rows={2}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Brief description for product cards"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Full Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={6}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Detailed product description..."
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="rounded-lg border bg-white p-6">
                <h2 className="mb-4 font-semibold text-gray-900">Pricing</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Price *
                    </label>
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
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Compare at Price
                    </label>
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
                        placeholder="0.00"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Original price for showing discount</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Cost Price
                    </label>
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
                        placeholder="0.00"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">For profit calculation</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'media' && (
            <div className="rounded-lg border bg-white p-6">
              <h2 className="mb-4 font-semibold text-gray-900">Product Images</h2>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="group relative aspect-square rounded-lg border bg-gray-50"
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="h-full w-full rounded-lg object-cover"
                    />
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

              <p className="mt-4 text-sm text-gray-500">
                Drag images to reorder. First image will be the main product image.
              </p>
            </div>
          )}

          {activeTab === 'variants' && (
            <div className="rounded-lg border bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Product Variants</h2>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hasVariants}
                    onChange={(e) => setHasVariants(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">This product has variants</span>
                </label>
              </div>

              {hasVariants ? (
                <div className="space-y-6">
                  {/* Variant Options */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-700">Options</h3>
                    {variantOptions.map((option, index) => (
                      <div key={index} className="flex gap-4 rounded-lg border p-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700">
                            Option Name
                          </label>
                          <input
                            type="text"
                            value={option.name}
                            onChange={(e) => {
                              const updated = [...variantOptions];
                              updated[index].name = e.target.value;
                              setVariantOptions(updated);
                            }}
                            placeholder="e.g., Size, Color"
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex-[2]">
                          <label className="block text-sm font-medium text-gray-700">
                            Values (comma separated)
                          </label>
                          <input
                            type="text"
                            value={option.values.join(', ')}
                            onChange={(e) => {
                              const updated = [...variantOptions];
                              updated[index].values = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                              setVariantOptions(updated);
                            }}
                            placeholder="e.g., Small, Medium, Large"
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantOption(index)}
                          className="mt-6 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddVariantOption}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                      Add Option
                    </button>
                  </div>

                  {/* Generated Variants */}
                  {variantOptions.length > 0 && variantOptions[0].values.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-sm font-medium text-gray-700">Variants</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                Variant
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                SKU
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                Price
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                Stock
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {/* Example variants would be generated here */}
                            <tr>
                              <td className="px-4 py-3 text-sm text-gray-500" colSpan={4}>
                                Enter option values above to generate variants
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Enable variants if this product comes in different sizes, colors, or other options.
                </p>
              )}
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
                      placeholder="e.g., PROD-001"
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
                      placeholder="e.g., 1234567890123"
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
                      <label className="block text-sm font-medium text-gray-700">
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        name="inventory"
                        value={formData.inventory}
                        onChange={handleChange}
                        min="0"
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Low Stock Alert
                      </label>
                      <input
                        type="number"
                        name="lowStockThreshold"
                        value={formData.lowStockThreshold}
                        onChange={handleChange}
                        min="0"
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="10"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Get notified when stock falls below this level
                      </p>
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
                          placeholder="0.00"
                        />
                        <select
                          name="weightUnit"
                          value={formData.weightUnit}
                          onChange={handleChange}
                          className="rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                      placeholder="product-slug"
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
                    placeholder="Enter meta title"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.metaTitle.length}/60 characters
                  </p>
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
                    placeholder="Enter meta description"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.metaDescription.length}/160 characters
                  </p>
                </div>

                {/* Preview */}
                <div className="rounded-lg border bg-gray-50 p-4">
                  <p className="mb-2 text-xs font-medium text-gray-500">Search Preview</p>
                  <div className="space-y-1">
                    <p className="text-lg text-blue-700 hover:underline">
                      {formData.metaTitle || formData.name || 'Product Title'}
                    </p>
                    <p className="text-sm text-green-700">
                      yourstore.com/products/{formData.slug || 'product-slug'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formData.metaDescription || formData.shortDescription || 'Product description will appear here...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
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
            <p className="mt-2 text-xs text-gray-500">
              {formData.status === 'draft' && 'Product will not be visible to customers'}
              {formData.status === 'active' && 'Product will be visible and available for purchase'}
              {formData.status === 'archived' && 'Product will be hidden from store'}
            </p>
          </div>

          {/* Category */}
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

          {/* Tags */}
          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 font-semibold text-gray-900">Tags</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-gray-400 hover:text-gray-600"
                  >
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
    </div>
  );
}
