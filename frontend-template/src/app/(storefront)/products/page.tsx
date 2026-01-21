import { Suspense } from 'react';
import { ProductGrid, ProductGridSkeleton } from '@/components/shared/product/product-grid';
import { fetchProducts } from '@/lib/api/products';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Products | Store',
  description: 'Browse our collection of products',
};

interface ProductsPageProps {
  searchParams: {
    page?: string;
    category?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    orderBy?: string;
    orderDir?: string;
  };
}

async function ProductsList({ searchParams }: ProductsPageProps) {
  // In production, get tenant from middleware/headers
  const tenantSlug = 'demo'; // Placeholder

  const result = await fetchProducts(tenantSlug, {
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    limit: 20,
    categoryId: searchParams.category,
    search: searchParams.search,
    minPrice: searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
    orderBy: searchParams.orderBy || 'created_at',
    orderDir: (searchParams.orderDir as 'asc' | 'desc') || 'desc',
  });

  return (
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
  );
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="mt-2 text-gray-600">
          Browse our collection of products
        </p>
      </div>

      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductsList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
