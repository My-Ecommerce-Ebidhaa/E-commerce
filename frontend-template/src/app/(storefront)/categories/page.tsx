import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Categories | Store',
  description: 'Browse our product categories',
};

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  children?: Category[];
}

async function fetchCategories(tenantSlug: string): Promise<Category[]> {
  // In production, this would call the API
  // For now, return mock data
  return [
    {
      id: '1',
      name: 'Electronics',
      slug: 'electronics',
      description: 'Phones, laptops, and gadgets',
      image: 'https://via.placeholder.com/400x300',
    },
    {
      id: '2',
      name: 'Clothing',
      slug: 'clothing',
      description: 'Fashion for everyone',
      image: 'https://via.placeholder.com/400x300',
    },
    {
      id: '3',
      name: 'Home & Garden',
      slug: 'home-garden',
      description: 'Everything for your home',
      image: 'https://via.placeholder.com/400x300',
    },
    {
      id: '4',
      name: 'Sports & Outdoors',
      slug: 'sports-outdoors',
      description: 'Gear for your active lifestyle',
      image: 'https://via.placeholder.com/400x300',
    },
  ];
}

async function CategoriesList() {
  // In production, get tenant from middleware/headers
  const tenantSlug = 'demo';
  const categories = await fetchCategories(tenantSlug);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/categories/${category.slug}`}
          className="group overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
            {category.image ? (
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                No image
              </div>
            )}
          </div>
          <div className="p-4">
            <h2 className="text-lg font-semibold group-hover:text-primary">
              {category.name}
            </h2>
            {category.description && (
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                {category.description}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-lg border">
          <Skeleton className="aspect-[4/3] w-full" />
          <div className="p-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="mt-2 h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Categories</h1>
        <p className="mt-2 text-gray-600">
          Browse our product categories
        </p>
      </div>

      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoriesList />
      </Suspense>
    </div>
  );
}
