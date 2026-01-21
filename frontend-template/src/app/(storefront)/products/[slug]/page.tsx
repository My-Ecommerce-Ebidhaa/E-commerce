import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { fetchProductBySlug } from '@/lib/api/products';
import { AddToCartButton } from '@/components/shared/product/add-to-cart-button';
import { ProductGallery } from '@/components/shared/product/product-gallery';
import { ProductInfo } from '@/components/shared/product/product-info';
import { ProductAttributes } from '@/components/shared/product/product-attributes';
import { Skeleton } from '@/components/ui/skeleton';
import type { Metadata } from 'next';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  // In production, get tenant from middleware/headers
  const tenantSlug = 'demo';
  const product = await fetchProductBySlug(tenantSlug, params.slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: product.metaTitle || `${product.name} | Store`,
    description: product.metaDescription || product.shortDescription || product.description,
    openGraph: {
      title: product.name,
      description: product.shortDescription || product.description,
      images: product.media?.[0]?.url ? [product.media[0].url] : [],
    },
  };
}

async function ProductDetail({ slug }: { slug: string }) {
  // In production, get tenant from middleware/headers
  const tenantSlug = 'demo';
  const product = await fetchProductBySlug(tenantSlug, slug);

  if (!product) {
    notFound();
  }

  const images = product.media
    ?.filter((m) => m.type === 'image')
    .map((m) => ({ url: m.url, alt: m.altText || product.name })) || [];

  const hasVariants = product.variants && product.variants.length > 0;
  const inStock = product.quantity > 0 || product.variants?.some((v) => v.quantity > 0);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Product Gallery */}
      <ProductGallery images={images} productName={product.name} />

      {/* Product Info */}
      <div className="space-y-6">
        <ProductInfo
          name={product.name}
          price={product.price}
          compareAtPrice={product.compareAtPrice}
          shortDescription={product.shortDescription}
          sku={product.sku}
          inStock={inStock}
          quantity={product.quantity}
        />

        {/* Variants Selection */}
        {hasVariants && (
          <div className="space-y-4">
            {/* Variant options would be rendered here */}
            <p className="text-sm text-gray-500">
              {product.variants?.length} variants available
            </p>
          </div>
        )}

        {/* Add to Cart */}
        <AddToCartButton
          product={product}
          inStock={inStock}
          hasVariants={hasVariants}
        />

        {/* Product Attributes */}
        {product.attributes && Object.keys(product.attributes).length > 0 && (
          <ProductAttributes attributes={product.attributes} />
        )}
      </div>

      {/* Full Description */}
      {product.description && (
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-xl font-semibold">Description</h2>
          <div
            className="prose max-w-none text-gray-600"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      )}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <Skeleton className="aspect-square w-full" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetail slug={params.slug} />
      </Suspense>
    </div>
  );
}
