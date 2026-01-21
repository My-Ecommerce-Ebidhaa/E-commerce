'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/stores/cart-store';
import type { Product, ProductVariant } from '@/lib/api/types';

interface AddToCartButtonProps {
  product: Product;
  inStock: boolean;
  hasVariants?: boolean;
  selectedVariant?: ProductVariant;
}

export function AddToCartButton({
  product,
  inStock,
  hasVariants,
  selectedVariant,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const price = selectedVariant?.price ?? product.price;

  const handleAddToCart = async () => {
    if (!inStock) return;

    if (hasVariants && !selectedVariant) {
      alert('Please select a variant');
      return;
    }

    setIsLoading(true);
    try {
      addItem(product, quantity, selectedVariant);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Quantity:</span>
        <div className="flex items-center rounded-md border">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-2 text-gray-600 hover:bg-gray-100"
            disabled={quantity <= 1}
          >
            -
          </button>
          <span className="w-12 text-center">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="px-3 py-2 text-gray-600 hover:bg-gray-100"
          >
            +
          </button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={!inStock || isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          'Adding...'
        ) : !inStock ? (
          'Out of Stock'
        ) : (
          `Add to Cart - $${(price * quantity).toFixed(2)}`
        )}
      </Button>
    </div>
  );
}

// Simple wrapper for cases where we only have basic product info
interface SimpleAddToCartButtonProps {
  productId: string;
  productName: string;
  price: number;
  inStock: boolean;
  image?: string;
}

export function SimpleAddToCartButton({
  productId,
  productName,
  price,
  inStock,
  image,
}: SimpleAddToCartButtonProps) {
  const product: Product = {
    id: productId,
    name: productName,
    slug: '',
    status: 'active',
    price,
    trackInventory: true,
    quantity: inStock ? 1 : 0,
    attributes: {},
    media: image ? [{ id: '1', type: 'image', url: image, position: 0 }] : [],
    createdAt: '',
    updatedAt: '',
  };

  return <AddToCartButton product={product} inStock={inStock} />;
}
