'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/api/types';
import { formatPrice } from '@/lib/utils/format-currency';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/stores/cart-store';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const primaryImage = product.media?.[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.altText || product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-200">
            <span className="text-gray-400">No image</span>
          </div>
        )}

        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <span className="absolute left-2 top-2 rounded-md bg-red-500 px-2 py-1 text-xs font-medium text-white">
            Sale
          </span>
        )}

        <div className="absolute bottom-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button size="icon" onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
          {product.name}
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {!product.trackInventory || product.quantity > 0 ? (
          <span className="text-xs text-green-600">In stock</span>
        ) : (
          <span className="text-xs text-red-600">Out of stock</span>
        )}
      </div>
    </Link>
  );
}
