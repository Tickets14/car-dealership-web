import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(7, 'Invalid phone number'),
  subject: z.string().min(2, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  carId: z.string().optional(),
});

// Step 1 — Car Details
export const sellCarStep1Schema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1, 'Invalid year'),
  variant: z.string().optional(),
  transmission: z.string().min(1, 'Transmission is required'),
  fuel_type: z.string().min(1, 'Fuel type is required'),
  mileage: z.coerce.number().min(0, 'Mileage must be 0 or more'),
  color: z.string().min(1, 'Color is required'),
});

// Step 3 — Condition
export const sellCarStep3Schema = z.object({
  condition_checklist: z.record(z.string(), z.boolean()),
  condition_notes: z.record(z.string(), z.string().optional()),
});

// Step 4 — Pricing & Contact
export const sellCarStep4Schema = z.object({
  asking_price: z.coerce.number().min(1, 'Asking price is required'),
  negotiable: z.boolean(),
  reason_for_selling: z.string().min(1, 'Reason is required'),
  seller_name: z.string().min(2, 'Name must be at least 2 characters'),
  seller_email: z.string().email('Invalid email address'),
  seller_phone: z.string().min(7, 'Invalid phone number'),
  contact_method: z.string().min(1, 'Contact method is required'),
  location: z.string().min(1, 'Location is required'),
});

// Combined for type inference
export const sellCarSchema = sellCarStep1Schema
  .merge(sellCarStep3Schema)
  .merge(sellCarStep4Schema);

export const preQualifySchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  contact_number: z.string().min(7, 'Invalid phone number'),
  employment_status: z.enum([
    'employed',
    'self_employed',
    'ofw',
    'business_owner',
  ]),
  employer_name: z.string().min(2, 'Employer or business name is required'),
  employment_length: z.string().min(1, 'Employment length is required'),
  monthly_income_range: z.string().min(1, 'Monthly income range is required'),
  credit_score_range: z.string().min(1, 'Credit profile is required'),
  down_payment: z.coerce.number().min(0, 'Down payment must be 0 or more'),
  existing_car_loans: z.boolean(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const carSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  price: z.coerce.number().min(0, 'Price is required'),
  mileage: z.coerce.number().min(0),
  fuelType: z.string().min(1, 'Fuel type is required'),
  transmission: z.string().min(1, 'Transmission is required'),
  bodyType: z.string().min(1, 'Body type is required'),
  color: z.string().min(1, 'Color is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  features: z.string().optional(),
  status: z.enum(['available', 'sold', 'reserved']).default('available'),
});

export const adminCarFormSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  variant: z.string().optional(),
  transmission: z.enum(['automatic', 'manual', 'cvt']),
  fuel_type: z.enum(['gasoline', 'diesel', 'hybrid', 'electric']),
  mileage: z.coerce.number().min(0, 'Mileage must be 0 or more'),
  mileage_unit: z.enum(['km', 'miles']).default('km'),
  color: z.string().min(1, 'Color is required'),
  body_type: z
    .enum(['sedan', 'suv', 'hatchback', 'pickup', 'van', 'wagon', 'coupe', 'mpv'])
    .optional()
    .or(z.literal('')),
  engine_displacement: z.string().optional(),
  drivetrain: z.string().optional(),
  seats: z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.coerce.number().int().min(1).max(20).optional()
  ),
  plate_ending: z.string().optional(),
  price_cash: z.coerce.number().min(1, 'Price is required'),
  status: z.enum(['draft', 'available', 'reserved', 'sold']),
  is_featured: z.boolean(),
  condition_rating: z.enum(['excellent', 'good', 'fair', 'project']),
  description: z.string().optional(),
  accident_history: z.boolean(),
  accident_notes: z.string().optional(),
  flood_damage: z.boolean(),
  repainted_panels: z.boolean(),
  repaint_notes: z.string().optional(),
  mechanical_issues: z.boolean(),
  mechanical_notes: z.string().optional(),
  dashboard_warnings: z.string().optional(),
  ac_functional: z.boolean(),
  power_accessories_working: z.boolean(),
  tire_condition: z.string().optional(),
  modifications: z.boolean(),
  modification_notes: z.string().optional(),
  requirements_text: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
export type SellCarFormData = z.infer<typeof sellCarSchema>;
export type PreQualifyFormInput = z.input<typeof preQualifySchema>;
export type PreQualifyFormData = z.output<typeof preQualifySchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type CarFormData = z.infer<typeof carSchema>;
export type AdminCarFormInput = z.input<typeof adminCarFormSchema>;
export type AdminCarFormData = z.output<typeof adminCarFormSchema>;
