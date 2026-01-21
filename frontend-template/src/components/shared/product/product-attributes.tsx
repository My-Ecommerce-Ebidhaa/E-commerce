import type { ProductAttributes as ProductAttributesType } from '@/lib/api/types';

interface ProductAttributesProps {
  attributes: ProductAttributesType;
}

// Labels for common attribute keys
const attributeLabels: Record<string, string> = {
  // Auto
  year: 'Year',
  make: 'Make',
  model: 'Model',
  mileage: 'Mileage',
  vin: 'VIN',
  fuelType: 'Fuel Type',
  transmission: 'Transmission',
  drivetrain: 'Drivetrain',
  exteriorColor: 'Exterior Color',
  interiorColor: 'Interior Color',
  condition: 'Condition',
  features: 'Features',

  // Fashion
  brand: 'Brand',
  material: 'Material',
  fit: 'Fit',
  gender: 'Gender',
  season: 'Season',
  size: 'Size',
  color: 'Color',

  // Electronics
  warranty: 'Warranty',
  specifications: 'Specifications',

  // General
  weight: 'Weight',
  dimensions: 'Dimensions',
};

function formatAttributeValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
  }
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  return String(value);
}

export function ProductAttributes({ attributes }: ProductAttributesProps) {
  const entries = Object.entries(attributes).filter(
    ([_, value]) => value !== undefined && value !== null && value !== ''
  );

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="border-t pt-6">
      <h3 className="mb-4 text-lg font-semibold">Product Details</h3>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {entries.map(([key, value]) => (
          <div key={key} className="flex justify-between border-b border-gray-100 py-2">
            <dt className="text-sm font-medium text-gray-500">
              {attributeLabels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
            </dt>
            <dd className="text-sm text-gray-900">{formatAttributeValue(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
