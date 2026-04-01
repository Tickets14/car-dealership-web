import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(7, 'Invalid phone number'),
  subject: z.string().min(2, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  carId: z.string().optional(),
});

export const sellCarSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(7, 'Invalid phone number'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  mileage: z.coerce.number().min(0),
  condition: z.string().min(1, 'Condition is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

export const preQualifySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(7, 'Invalid phone number'),
  income: z.coerce.number().min(0, 'Income is required'),
  creditScore: z.string().min(1, 'Credit score range is required'),
  downPayment: z.coerce.number().min(0),
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

export type ContactFormData = z.infer<typeof contactSchema>;
export type SellCarFormData = z.infer<typeof sellCarSchema>;
export type PreQualifyFormData = z.infer<typeof preQualifySchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type CarFormData = z.infer<typeof carSchema>;
