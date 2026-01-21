import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { ProductGrid, ProductGridSkeleton } from '@/components/shared/product/product-grid';
import { fetchProducts } from '@/lib/api/products';
import type { Metadata } from 'next';

interface CategoryPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    page?: string;
    minPrice?: string;
    maxPrice?: string;
    orderBy?: string;
    orderDir?: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

async function fetchCategory(tenantSlug: string, categorySlug: string): Promise<Category | null> {
  // In production, this would call the API
  // For now, return mock data
  const categories: Record<string, Category> = {
    electronics: { id: '1', name: 'Electronics', slug: 'electronics', description: 'Phones, laptops, and gadgets' },
    clothing: { id: '2', name: 'Clothing', slug: 'clothing', description: 'Fashion for everyone' },
    'home-garden': { id: '3', name: 'Home & Garden', slug: 'home-garden', description: 'Everything for your home' },
    'sports-outdoors': { id: '4', name: 'Sports & Outdoors', slug: 'sports-outdoors', description: 'Gear for your active lifestyle' },
  };

  return categories[categorySlug] || null;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const tenantSlug = 'demo';
  const category = await fetchCategory(tenantSlug, params.slug);

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} | Store`,
    description: category.description || `Browse ${category.name} products`,
  };
}

async function CategoryProducts({
  categorySlug,
  searchParams,
}: {
  categorySlug: string;
  searchParams: CategoryPageProps['searchParams'];
}) {
  const tenantSlug = 'demo';
  const category = await fetchCategory(tenantSlug, categorySlug);

  if (!category) {
    notFound();
  }

  const result = await fetchProducts(tenantSlug, {
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    limit: 20,
    categoryId: category.id,
    minPrice: searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
    orderBy: searchParams.orderBy || 'created_at',
    orderDir: (searchParams.orderDir as 'asc' | 'desc') || 'desc',
  });

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-gray-600">{category.description}</p>
        )}
      </div>

      {result.products.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-gray-500">No products found in this category.</p>
        </div>
      ) : (
        <>
          <ProductGrid products={result.products} />

          {/* Pagination */}
          {result.meta.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: result.meta.totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <a
                    key={pageNum}
                    href={`?page=${pageNum}`}
                    className={`rounded-md px-4 py-2 text-sm ${
                      pageNum === result.meta.page
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pageNum}
                  </a>
                )
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}

export default function CategoryPage({ params, searchParams }: CategoryPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<ProductGridSkeleton />}>
        <CategoryProducts categorySlug={params.slug} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
