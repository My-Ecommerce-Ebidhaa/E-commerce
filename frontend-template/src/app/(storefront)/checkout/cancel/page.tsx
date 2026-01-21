'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CheckoutCancelPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="mx-auto max-w-md">
        {/* Cancel Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-10 w-10 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-4">Payment Cancelled</h1>

        <p className="text-gray-600 mb-8">
          Your payment was cancelled. Don't worry, your cart items are still saved.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/cart">
            <Button variant="outline">Return to Cart</Button>
          </Link>
          <Link href="/checkout">
            <Button>Try Again</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
