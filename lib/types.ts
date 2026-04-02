// ============================================================
// Shared types — keep in sync with car-dealership-api/src/lib/types.ts
// ============================================================

// ============================================================
// Enum union types
// ============================================================

export type TransmissionType = "automatic" | "manual" | "cvt";
export type FuelType = "gasoline" | "diesel" | "hybrid" | "electric";
export type MileageUnit = "km" | "miles";
export type BodyType = "sedan" | "suv" | "hatchback" | "pickup" | "van" | "wagon" | "coupe" | "mpv";
export type ConditionRating = "excellent" | "good" | "fair" | "project";
export type CarStatus = "draft" | "available" | "reserved" | "sold";
export type PhotoCategory = "exterior" | "interior" | "engine" | "documents";

export type ContactMethod = "phone" | "whatsapp" | "email";
export type ReasonForSelling = "upgrading" | "need_cash" | "moving_abroad" | "too_many_cars" | "other";
export type SubmissionStatus = "pending" | "approved" | "rejected" | "counter_offered";

export type InquiryType = "buyer_inquiry" | "visit_request" | "pre_qualification" | "seller_thread";
export type InquiryStatus = "new" | "contacted" | "qualified" | "visit_scheduled" | "reserved" | "converted" | "lost";
export type MessageSender = "admin" | "customer";

export type EmploymentStatus = "employed" | "self_employed" | "ofw" | "business_owner";
export type PreQualificationStatus = "pending" | "qualified" | "not_qualified";

export type AdminRole = "owner" | "staff";
export type NotificationType = "new_inquiry" | "new_submission" | "reservation_request" | "pre_qual_submitted" | "visit_scheduled";

// ============================================================
// Table interfaces
// ============================================================

export interface Car {
  id: string;
  stock_number: string;
  make: string;
  model: string;
  year: number;
  variant: string | null;
  transmission: TransmissionType;
  fuel_type: FuelType;
  mileage: number;
  mileage_unit: MileageUnit;
  color: string | null;
  body_type: BodyType | null;
  engine_displacement: string | null;
  drivetrain: string | null;
  seats: number | null;
  plate_ending: string | null;
  price_cash: number;
  condition_rating: ConditionRating;
  condition_details: Record<string, unknown>;
  description: string | null;
  requirements_docs: string[];
  status: CarStatus;
  is_featured: boolean;
  sold_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CarPhoto {
  id: string;
  car_id: string;
  url: string;
  category: PhotoCategory | null;
  sort_order: number;
  alt_text: string | null;
  created_at: string;
}

export interface CarWithPhotos extends Car {
  photos: CarPhoto[];
}

export interface SellerSubmission {
  id: string;
  reference_number: string;
  seller_name: string;
  seller_email: string;
  seller_phone: string;
  contact_method: ContactMethod;
  location: string | null;
  make: string;
  model: string;
  year: number;
  variant: string | null;
  transmission: string | null;
  fuel_type: string | null;
  mileage: number | null;
  color: string | null;
  asking_price: number | null;
  negotiable: boolean;
  reason_for_selling: ReasonForSelling | null;
  condition_checklist: Record<string, unknown>;
  status: SubmissionStatus;
  admin_notes: string | null;
  counter_offer_price: number | null;
  counter_offer_message: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface SellerSubmissionPhoto {
  id: string;
  submission_id: string;
  url: string;
  label: string | null;
  sort_order: number;
  created_at: string;
}

export interface SellerSubmissionWithPhotos extends SellerSubmission {
  photos: SellerSubmissionPhoto[];
}

export interface Inquiry {
  id: string;
  car_id: string | null;
  type: InquiryType;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  preferred_visit_date: string | null;
  preferred_visit_time: string | null;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
}

export interface InquiryMessage {
  id: string;
  inquiry_id: string;
  sender: MessageSender;
  message: string;
  created_at: string;
}

export interface InquiryWithMessages extends Inquiry {
  messages: InquiryMessage[];
}

export interface PreQualification {
  id: string;
  inquiry_id: string;
  full_name: string;
  contact_number: string;
  email: string;
  employment_status: EmploymentStatus | null;
  monthly_income_range: string | null;
  employer_name: string | null;
  employment_length: string | null;
  existing_car_loans: boolean;
  status: PreQualificationStatus;
  created_at: string;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  car_purchased: string | null;
  quote: string;
  rating: number | null;
  photo_url: string | null;
  is_visible: boolean;
  sort_order: number;
  created_at: string;
}

export interface AdminProfile {
  id: string;
  name: string;
  role: AdminRole;
  created_at: string;
}

export interface Notification {
  id: string;
  admin_user_id: string;
  type: NotificationType | null;
  title: string;
  message: string | null;
  is_read: boolean;
  related_id: string | null;
  related_type: string | null;
  created_at: string;
}

// ============================================================
// Site settings
// ============================================================

export interface InstallmentTerms {
  interest_rate_annual: number;
  available_terms: number[];
  min_down_payment_percent: number;
}

export interface DayHours {
  open: string;
  close: string;
}

export interface BusinessHours {
  monday: DayHours | null;
  tuesday: DayHours | null;
  wednesday: DayHours | null;
  thursday: DayHours | null;
  friday: DayHours | null;
  saturday: DayHours | null;
  sunday: DayHours | null;
}

export interface ContactInfo {
  business_name: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  facebook: string;
  instagram: string;
}

export interface SiteSettings {
  key: string;
  value: InstallmentTerms | BusinessHours | ContactInfo | Record<string, unknown>;
  updated_at: string;
}

// ============================================================
// API response wrappers
// ============================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
