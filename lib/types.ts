export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  bodyType: string;
  color: string;
  images: string[];
  description: string;
  features: string[];
  status: 'available' | 'sold' | 'reserved';
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  name: string;
  email: string;
  phone: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  condition: string;
  description: string;
  images: string[];
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface InboxMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  carId?: string;
  read: boolean;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
}

export interface PreQualification {
  id: string;
  name: string;
  email: string;
  phone: string;
  income: number;
  creditScore: string;
  downPayment: number;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
