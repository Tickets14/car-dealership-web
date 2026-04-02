export const BUSINESS_NAME = process.env.NEXT_PUBLIC_BUSINESS_NAME || 'AutoDeals';
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

export const FUEL_TYPES = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid'] as const;
export const TRANSMISSIONS = ['Automatic', 'Manual', 'CVT'] as const;
export const BODY_TYPES = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback', 'Van', 'Wagon', 'Convertible'] as const;
export const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor'] as const;
export const CREDIT_SCORES = ['Excellent (750+)', 'Good (700-749)', 'Fair (650-699)', 'Poor (below 650)'] as const;
export const EMPLOYMENT_STATUSES = [
  { value: 'employed', label: 'Employed' },
  { value: 'self_employed', label: 'Self-Employed' },
  { value: 'ofw', label: 'OFW' },
  { value: 'business_owner', label: 'Business Owner' },
] as const;
export const EMPLOYMENT_LENGTHS = [
  'Less than 6 months',
  '6 months to 1 year',
  '1 to 2 years',
  '3 to 5 years',
  'More than 5 years',
] as const;
export const INCOME_RANGES = [
  'Under PHP 25,000',
  'PHP 25,000 - 49,999',
  'PHP 50,000 - 74,999',
  'PHP 75,000 - 99,999',
  'PHP 100,000 - 149,999',
  'PHP 150,000+',
] as const;

export const SORT_OPTIONS = [
  { label: 'Newest First', value: 'createdAt:desc' },
  { label: 'Price: Low to High', value: 'price:asc' },
  { label: 'Price: High to Low', value: 'price:desc' },
  { label: 'Mileage: Low to High', value: 'mileage:asc' },
  { label: 'Year: Newest', value: 'year:desc' },
] as const;

export const MAX_COMPARE_CARS = 3;

export const PHOTO_LABELS = [
  'Front',
  'Rear',
  'Driver Side',
  'Passenger Side',
  'Dashboard',
  'Front Seats',
  'Rear Seats',
  'Engine Bay',
  'Trunk',
  'Odometer',
  'Wheels',
  'Other',
] as const;

export const CONDITION_CHECKS = [
  { key: 'engine_runs_well', label: 'Engine runs well' },
  { key: 'ac_works', label: 'Air conditioning works' },
  { key: 'no_warning_lights', label: 'No dashboard warning lights' },
  { key: 'no_leaks', label: 'No fluid leaks' },
  { key: 'tires_good', label: 'Tires in good condition' },
  { key: 'brakes_good', label: 'Brakes in good condition' },
  { key: 'paint_good', label: 'Paint/body in good condition' },
  { key: 'no_accidents', label: 'No accident history' },
  { key: 'complete_papers', label: 'Complete registration papers' },
  { key: 'spare_key', label: 'Spare key available' },
] as const;

export const REASONS_FOR_SELLING = [
  { value: 'upgrading', label: 'Upgrading to a new vehicle' },
  { value: 'need_cash', label: 'Need cash' },
  { value: 'moving_abroad', label: 'Moving abroad' },
  { value: 'too_many_cars', label: 'Too many cars' },
  { value: 'other', label: 'Other' },
] as const;

export const CONTACT_METHODS = [
  { value: 'phone', label: 'Phone Call' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
] as const;

export const ADMIN_TRANSMISSION_OPTIONS = [
  { value: 'automatic', label: 'Automatic' },
  { value: 'manual', label: 'Manual' },
  { value: 'cvt', label: 'CVT' },
] as const;

export const ADMIN_FUEL_TYPE_OPTIONS = [
  { value: 'gasoline', label: 'Gasoline' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'electric', label: 'Electric' },
] as const;

export const ADMIN_BODY_TYPE_OPTIONS = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'van', label: 'Van' },
  { value: 'wagon', label: 'Wagon' },
  { value: 'coupe', label: 'Coupe' },
  { value: 'mpv', label: 'MPV' },
] as const;

export const ADMIN_CAR_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'available', label: 'Available' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'sold', label: 'Sold' },
] as const;

export const SUBMISSION_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'counter_offered', label: 'Counter Offered' },
  { value: 'rejected', label: 'Rejected' },
] as const;

export const INQUIRY_TYPE_OPTIONS = [
  { value: 'buyer_inquiry', label: 'Buyer Inquiry' },
  { value: 'visit_request', label: 'Visit Request' },
  { value: 'pre_qualification', label: 'Pre-Qualification' },
  { value: 'seller_thread', label: 'Seller Thread' },
] as const;

export const INQUIRY_STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'visit_scheduled', label: 'Visit Scheduled' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'converted', label: 'Converted' },
  { value: 'lost', label: 'Lost' },
] as const;

export const ADMIN_CONDITION_RATING_OPTIONS = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'project', label: 'Project' },
] as const;

export const MILEAGE_UNIT_OPTIONS = [
  { value: 'km', label: 'Kilometers' },
  { value: 'miles', label: 'Miles' },
] as const;
