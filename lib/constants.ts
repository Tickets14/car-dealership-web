export const BUSINESS_NAME = process.env.NEXT_PUBLIC_BUSINESS_NAME || 'AutoDeals';
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

export const FUEL_TYPES = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid'] as const;
export const TRANSMISSIONS = ['Automatic', 'Manual', 'CVT'] as const;
export const BODY_TYPES = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback', 'Van', 'Wagon', 'Convertible'] as const;
export const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor'] as const;
export const CREDIT_SCORES = ['Excellent (750+)', 'Good (700-749)', 'Fair (650-699)', 'Poor (below 650)'] as const;

export const SORT_OPTIONS = [
  { label: 'Newest First', value: 'createdAt:desc' },
  { label: 'Price: Low to High', value: 'price:asc' },
  { label: 'Price: High to Low', value: 'price:desc' },
  { label: 'Mileage: Low to High', value: 'mileage:asc' },
  { label: 'Year: Newest', value: 'year:desc' },
] as const;

export const MAX_COMPARE_CARS = 3;
