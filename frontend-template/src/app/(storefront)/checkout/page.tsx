'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/lib/stores/cart-store';

interface AddressForm {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

const initialAddress: AddressForm = {
  firstName: '',
  lastName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
  phone: '',
};

type ShippingMethod = 'standard' | 'express' | 'overnight';

const shippingRates = {
  standard: { name: 'Standard Shipping', price: 5.99, days: '5-7 business days' },
  express: { name: 'Express Shipping', price: 12.99, days: '2-3 business days' },
  overnight: { name: 'Overnight Shipping', price: 24.99, days: '1 business day' },
};

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const discountAmount = useCartStore((state) => state.discountAmount);
  const clearCart = useCartStore((state) => state.clearCart);

  const [step, setStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState<AddressForm>(initialAddress);
  const [billingAddress, setBillingAddress] = useState<AddressForm>(initialAddress);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <div className="mt-8 animate-pulse">
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">
          Add some items to your cart to checkout.
        </p>
        <Link href="/products">
          <Button size="lg">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const shippingCost = shippingRates[shippingMethod].price;
  const tax = (subtotal - discountAmount) * 0.08; // 8% tax
  const total = subtotal - discountAmount + shippingCost + tax;

  const validateAddress = (address: AddressForm, prefix: string): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!address.firstName.trim()) errs[`${prefix}FirstName`] = 'First name is required';
    if (!address.lastName.trim()) errs[`${prefix}LastName`] = 'Last name is required';
    if (!address.addressLine1.trim()) errs[`${prefix}AddressLine1`] = 'Address is required';
    if (!address.city.trim()) errs[`${prefix}City`] = 'City is required';
    if (!address.state.trim()) errs[`${prefix}State`] = 'State is required';
    if (!address.postalCode.trim()) errs[`${prefix}PostalCode`] = 'Postal code is required';
    return errs;
  };

  const handleContinueToShipping = () => {
    const addressErrors = validateAddress(shippingAddress, 'shipping');
    if (Object.keys(addressErrors).length > 0) {
      setErrors(addressErrors);
      return;
    }
    setErrors({});
    setStep(2);
  };

  const handleContinueToPayment = () => {
    if (!sameAsShipping) {
      const billingErrors = validateAddress(billingAddress, 'billing');
      if (Object.keys(billingErrors).length > 0) {
        setErrors(billingErrors);
        return;
      }
    }
    setErrors({});
    setStep(3);
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);

    try {
      // In production, this would:
      // 1. Call initiateCheckout API
      // 2. Get payment intent from Stripe
      // 3. Confirm payment with Stripe Elements
      // 4. Call confirmOrder API

      // Simulate checkout
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear cart and redirect to success
      clearCart();
      router.push('/checkout/success?order=ORD-' + Date.now().toString(36).toUpperCase());
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const AddressFormFields = ({
    address,
    setAddress,
    prefix,
  }: {
    address: AddressForm;
    setAddress: (a: AddressForm) => void;
    prefix: string;
  }) => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className="block text-sm font-medium text-gray-700">First Name</label>
        <Input
          value={address.firstName}
          onChange={(e) => setAddress({ ...address, firstName: e.target.value })}
          className={errors[`${prefix}FirstName`] ? 'border-red-500' : ''}
        />
        {errors[`${prefix}FirstName`] && (
          <p className="mt-1 text-sm text-red-600">{errors[`${prefix}FirstName`]}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Last Name</label>
        <Input
          value={address.lastName}
          onChange={(e) => setAddress({ ...address, lastName: e.target.value })}
          className={errors[`${prefix}LastName`] ? 'border-red-500' : ''}
        />
        {errors[`${prefix}LastName`] && (
          <p className="mt-1 text-sm text-red-600">{errors[`${prefix}LastName`]}</p>
        )}
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700">Address</label>
        <Input
          value={address.addressLine1}
          onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
          className={errors[`${prefix}AddressLine1`] ? 'border-red-500' : ''}
        />
        {errors[`${prefix}AddressLine1`] && (
          <p className="mt-1 text-sm text-red-600">{errors[`${prefix}AddressLine1`]}</p>
        )}
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700">
          Apartment, suite, etc. (optional)
        </label>
        <Input
          value={address.addressLine2}
          onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">City</label>
        <Input
          value={address.city}
          onChange={(e) => setAddress({ ...address, city: e.target.value })}
          className={errors[`${prefix}City`] ? 'border-red-500' : ''}
        />
        {errors[`${prefix}City`] && (
          <p className="mt-1 text-sm text-red-600">{errors[`${prefix}City`]}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">State</label>
        <Input
          value={address.state}
          onChange={(e) => setAddress({ ...address, state: e.target.value })}
          className={errors[`${prefix}State`] ? 'border-red-500' : ''}
        />
        {errors[`${prefix}State`] && (
          <p className="mt-1 text-sm text-red-600">{errors[`${prefix}State`]}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Postal Code</label>
        <Input
          value={address.postalCode}
          onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
          className={errors[`${prefix}PostalCode`] ? 'border-red-500' : ''}
        />
        {errors[`${prefix}PostalCode`] && (
          <p className="mt-1 text-sm text-red-600">{errors[`${prefix}PostalCode`]}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone (optional)</label>
        <Input
          value={address.phone}
          onChange={(e) => setAddress({ ...address, phone: e.target.value })}
          type="tel"
        />
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Progress Steps */}
      <div className="mb-8 flex items-center justify-center gap-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step >= s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`mx-2 h-0.5 w-16 ${
                  step > s ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Shipping Address */}
          {step === 1 && (
            <div className="rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              <AddressFormFields
                address={shippingAddress}
                setAddress={setShippingAddress}
                prefix="shipping"
              />
              <div className="mt-6">
                <Button onClick={handleContinueToShipping}>
                  Continue to Shipping
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Shipping Method & Billing */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4">Shipping Method</h2>
                <div className="space-y-3">
                  {(Object.entries(shippingRates) as [ShippingMethod, typeof shippingRates['standard']][]).map(
                    ([method, rate]) => (
                      <label
                        key={method}
                        className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 ${
                          shippingMethod === method
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping"
                            value={method}
                            checked={shippingMethod === method}
                            onChange={() => setShippingMethod(method)}
                            className="h-4 w-4"
                          />
                          <div>
                            <p className="font-medium">{rate.name}</p>
                            <p className="text-sm text-gray-500">{rate.days}</p>
                          </div>
                        </div>
                        <span className="font-medium">${rate.price.toFixed(2)}</span>
                      </label>
                    )
                  )}
                </div>
              </div>

              <div className="rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4">Billing Address</h2>
                <label className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={sameAsShipping}
                    onChange={(e) => setSameAsShipping(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span>Same as shipping address</span>
                </label>

                {!sameAsShipping && (
                  <AddressFormFields
                    address={billingAddress}
                    setAddress={setBillingAddress}
                    prefix="billing"
                  />
                )}
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={handleContinueToPayment}>
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Payment</h2>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  In production, this would integrate with Stripe Elements for secure payment processing.
                </p>
                <p className="text-sm text-gray-500">
                  Demo mode: Click "Place Order" to simulate a successful payment.
                </p>
              </div>

              {/* Demo card input */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Card Number</label>
                  <Input placeholder="4242 4242 4242 4242" disabled />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expiry</label>
                    <Input placeholder="12/25" disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CVC</label>
                    <Input placeholder="123" disabled />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 rounded-lg border bg-gray-50 p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              {items.map((item) => {
                const price = item.variant?.price ?? item.product.price;
                return (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.product.name} x {item.quantity}
                    </span>
                    <span>${(price * item.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

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
                <span>${shippingCost.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between border-t pt-2 text-lg font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
