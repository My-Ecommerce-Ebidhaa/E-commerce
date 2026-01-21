'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/lib/stores/cart-store';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getTotal = useCartStore((state) => state.getTotal);
  const discountCode = useCartStore((state) => state.discountCode);
  const discountAmount = useCartStore((state) => state.discountAmount);
  const applyDiscount = useCartStore((state) => state.applyDiscount);
  const removeDiscount = useCartStore((state) => state.removeDiscount);

  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <div className="mt-8 animate-pulse">
          <div className="h-24 bg-gray-200 rounded mb-4" />
          <div className="h-24 bg-gray-200 rounded mb-4" />
        </div>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const total = getTotal();

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    // In production, validate with API
    // For now, simulate a 10% discount
    if (promoCode.toUpperCase() === 'SAVE10') {
      const discountAmt = subtotal * 0.1;
      applyDiscount(promoCode.toUpperCase(), discountAmt);
      setPromoError('');
      setPromoCode('');
    } else {
      setPromoError('Invalid promo code');
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">
          Looks like you haven't added any items to your cart yet.
        </p>
        <Link href="/products">
          <Button size="lg">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const price = item.variant?.price ?? item.product.price;
            const image = item.product.media?.[0]?.url;

            return (
              <div
                key={item.id}
                className="flex gap-4 rounded-lg border p-4"
              >
                {/* Product Image */}
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                  {image ? (
                    <Image
                      src={image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="hover:underline"
                        >
                          {item.product.name}
                        </Link>
                      </h3>
                      {item.variant && (
                        <p className="mt-1 text-sm text-gray-500">
                          {Object.entries(item.variant.options || {})
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ')}
                        </p>
                      )}
                    </div>
                    <p className="font-medium">${(price * item.quantity).toFixed(2)}</p>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-2">
                    {/* Quantity */}
                    <div className="flex items-center rounded-md border">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-10 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border bg-gray-50 p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            {/* Promo Code */}
            {!discountCode && (
              <div className="mb-4">
                <label className="text-sm text-gray-600">Promo Code</label>
                <div className="mt-1 flex gap-2">
                  <Input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={handleApplyPromo}
                  >
                    Apply
                  </Button>
                </div>
                {promoError && (
                  <p className="mt-1 text-sm text-red-600">{promoError}</p>
                )}
              </div>
            )}

            {discountCode && (
              <div className="mb-4 flex items-center justify-between rounded-md bg-green-50 p-2">
                <span className="text-sm text-green-800">
                  Code "{discountCode}" applied
                </span>
                <button
                  onClick={removeDiscount}
                  className="text-sm text-green-700 hover:text-green-900"
                >
                  Remove
                </button>
              </div>
            )}

            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-500">Calculated at checkout</span>
              </div>

              <div className="flex justify-between border-t pt-2 text-lg font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <Link href="/checkout" className="block mt-6">
              <Button className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </Link>

            <Link
              href="/products"
              className="mt-4 block text-center text-sm text-gray-600 hover:text-gray-900"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
