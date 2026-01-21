interface ProductInfoProps {
  name: string;
  price: number;
  compareAtPrice?: number;
  shortDescription?: string;
  sku?: string;
  inStock: boolean;
  quantity: number;
}

export function ProductInfo({
  name,
  price,
  compareAtPrice,
  shortDescription,
  sku,
  inStock,
  quantity,
}: ProductInfoProps) {
  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">{name}</h1>
        {sku && <p className="mt-1 text-sm text-gray-500">SKU: {sku}</p>}
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold">${price.toFixed(2)}</span>
        {hasDiscount && (
          <>
            <span className="text-lg text-gray-500 line-through">
              ${compareAtPrice.toFixed(2)}
            </span>
            <span className="rounded-md bg-red-100 px-2 py-1 text-sm font-medium text-red-700">
              {discountPercent}% OFF
            </span>
          </>
        )}
      </div>

      {shortDescription && (
        <p className="text-gray-600">{shortDescription}</p>
      )}

      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
            inStock
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {inStock ? 'In Stock' : 'Out of Stock'}
        </span>
        {inStock && quantity <= 10 && quantity > 0 && (
          <span className="text-sm text-orange-600">
            Only {quantity} left
          </span>
        )}
      </div>
    </div>
  );
}
