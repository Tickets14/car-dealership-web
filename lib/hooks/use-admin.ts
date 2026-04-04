'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { normalizeTestimonialsPayload } from '@/lib/testimonials';
import type {
  Car,
  CarPhoto,
  CarWithPhotos,
  ContactInfo,
  BusinessHours,
  InstallmentTerms,
  PreQualification,
  SellerSubmission,
  SellerSubmissionPhoto,
  SellerSubmissionWithPhotos,
  Inquiry,
  InquiryWithMessages,
  Testimonial,
  Notification as NotificationType,
  PaginatedResponse,
} from '@/lib/types';

// ─── Cars ────────────────────────────────────────────────────────────────────

export interface AdminCarFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sort?: string;
  featured?: boolean;
}

export interface AdminCarListItem extends Car {
  photos?: CarPhoto[];
  thumbnail_url?: string | null;
  photo_count?: number;
  inquiry_count?: number;
}

export interface AdminCarMutationResponse {
  id?: string;
  data?: Car | CarWithPhotos;
}

export function useAdminCars(filters: AdminCarFilters = {}) {
  return useQuery<PaginatedResponse<AdminCarListItem>>({
    queryKey: ['admin', 'cars', filters],
    queryFn: () => apiClient.get('/admin/cars', { params: filters }),
  });
}

export function useAdminCar(id: string | undefined) {
  return useQuery<CarWithPhotos>({
    queryKey: ['admin', 'cars', id],
    queryFn: () => apiClient.get(`/admin/cars/${id}`),
    enabled: !!id,
  });
}

export function useCreateCar() {
  const queryClient = useQueryClient();
  return useMutation<AdminCarMutationResponse, Error, Partial<Car> & Record<string, unknown>>({
    mutationFn: (data) => apiClient.post('/admin/cars', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cars'] });
    },
  });
}

export function useUpdateCar() {
  const queryClient = useQueryClient();
  return useMutation<
    AdminCarMutationResponse,
    Error,
    { id: string; data: Partial<Car> & Record<string, unknown> }
  >({
    mutationFn: ({ id, data }) =>
      apiClient.patch(`/admin/cars/${id}`, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cars'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'cars', id] });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
    },
  });
}

export function useDeleteCar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/cars/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cars'] });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
    },
  });
}

export function useUploadCarPhotos() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      apiClient.post(`/admin/cars/${id}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cars', id] });
      queryClient.invalidateQueries({ queryKey: ['cars', id] });
    },
  });
}

export function useReorderCarPhotos() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      photoOrder,
    }: {
      id: string;
      photoOrder: Array<{ id: string; sort_order: number }>;
    }) =>
      apiClient.patch(`/admin/cars/${id}/photos`, {
        photos: photoOrder,
      }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cars', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'cars'] });
      queryClient.invalidateQueries({ queryKey: ['cars', id] });
    },
  });
}

export function useDeleteCarPhotos() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ids }: { id: string; ids: string[] }) =>
      apiClient.delete(`/admin/cars/${id}/photos`, { data: { ids } }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cars', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'cars'] });
      queryClient.invalidateQueries({ queryKey: ['cars', id] });
    },
  });
}

export function useBulkUpdateCars() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { ids: string[]; updates: Partial<Car> }) =>
      apiClient.patch('/admin/cars/bulk', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cars'] });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
    },
  });
}

export function useBulkDeleteCars() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) =>
      Promise.all(ids.map((id) => apiClient.delete(`/admin/cars/${id}`))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cars'] });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
    },
  });
}

// ─── Submissions ─────────────────────────────────────────────────────────────

export interface AdminSubmissionFilters {
  page?: number;
  limit?: number;
  status?: string;
}

export interface AdminSubmissionListItem extends SellerSubmission {
  photos?: SellerSubmissionPhoto[];
  photo_count?: number;
}

export interface AdminSubmissionMutationResponse {
  car_id?: string;
  draft_car_id?: string;
  car?: { id?: string | null } | null;
  data?:
    | SellerSubmission
    | {
        car_id?: string;
        draft_car_id?: string;
        car?: { id?: string | null } | null;
      }
    | null;
}

export function useAdminSubmissions(filters: AdminSubmissionFilters = {}) {
  return useQuery<PaginatedResponse<AdminSubmissionListItem>>({
    queryKey: ['admin', 'submissions', filters],
    queryFn: () => apiClient.get('/admin/submissions', { params: filters }),
  });
}

export function useAdminSubmission(id: string | undefined) {
  return useQuery<SellerSubmissionWithPhotos>({
    queryKey: ['admin', 'submissions', id],
    queryFn: () => apiClient.get(`/admin/submissions/${id}`),
    enabled: !!id,
  });
}

export function useUpdateSubmission() {
  const queryClient = useQueryClient();
  return useMutation<
    AdminSubmissionMutationResponse,
    Error,
    {
      id: string;
      data: Partial<SellerSubmission> & Record<string, unknown>;
    }
  >({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<SellerSubmission> & Record<string, unknown>;
    }) => apiClient.patch(`/admin/submissions/${id}`, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'submissions'] });
      queryClient.invalidateQueries({
        queryKey: ['admin', 'submissions', id],
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'cars'] });
    },
  });
}

// ─── Inquiries ───────────────────────────────────────────────────────────────

export interface AdminInquiryFilters {
  page?: number;
  limit?: number;
  read?: boolean;
  type?: string;
  status?: string;
  search?: string;
}

export interface AdminInquiryListItem extends Inquiry {
  car?: Car | null;
  message_count?: number;
  unread?: boolean;
  last_message_preview?: string | null;
  last_message_at?: string | null;
}

export interface AdminInquiryDetail extends InquiryWithMessages {
  car?: Car | null;
  pre_qualification?: PreQualification | null;
  internal_notes?: string | null;
}

export function useAdminInquiries(filters: AdminInquiryFilters = {}) {
  return useQuery<PaginatedResponse<AdminInquiryListItem>>({
    queryKey: ['admin', 'inquiries', filters],
    queryFn: () => apiClient.get('/admin/inquiries', { params: filters }),
  });
}

export function useAdminInquiry(id: string | undefined) {
  return useQuery<AdminInquiryDetail>({
    queryKey: ['admin', 'inquiries', id],
    queryFn: () => apiClient.get(`/admin/inquiries/${id}`),
    enabled: !!id,
  });
}

export function useUpdateInquiry() {
  const queryClient = useQueryClient();
  return useMutation<
    unknown,
    Error,
    {
      id: string;
      data: Partial<Inquiry> & Record<string, unknown>;
    }
  >({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Inquiry> & Record<string, unknown>;
    }) => apiClient.patch(`/admin/inquiries/${id}`, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'inquiries', id] });
    },
  });
}

export function useSendReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      apiClient.post(`/admin/inquiries/${id}/messages`, { message }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'inquiries', id] });
    },
  });
}

// ─── Notifications ───────────────────────────────────────────────────────────

export function useAdminNotifications() {
  return useQuery<NotificationType[]>({
    queryKey: ['admin', 'notifications'],
    queryFn: () => apiClient.get('/admin/notifications'),
  });
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      apiClient.patch('/admin/notifications/read', { ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    },
  });
}

// ─── Testimonials ────────────────────────────────────────────────────────────

export function useAdminTestimonials() {
  return useQuery<unknown, Error, Testimonial[]>({
    queryKey: ['admin', 'testimonials'],
    queryFn: () => apiClient.get('/admin/testimonials'),
    select: normalizeTestimonialsPayload,
  });
}

export function useCreateTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Testimonial>) =>
      apiClient.post('/admin/testimonials', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
  });
}

export function useUpdateTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Testimonial>;
    }) => apiClient.patch(`/admin/testimonials/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
  });
}

export function useDeleteTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/testimonials/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
  });
}

// ─── Settings ────────────────────────────────────────────────────────────────

export function useAdminSettings() {
  return useQuery<
    | Record<string, unknown>
    | Array<{
        key: string;
        value: InstallmentTerms | BusinessHours | ContactInfo | Record<string, unknown>;
      }>
  >({
    queryKey: ['admin', 'settings'],
    queryFn: () => apiClient.get('/admin/settings'),
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { key: string; value: unknown }) =>
      apiClient.patch('/admin/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardActivity {
  id: string;
  type: string;
  message: string;
  createdAt: string;
}

export interface DashboardData {
  totalCars?: number;
  activeListings?: number;
  availableCars?: number;
  soldCars?: number;
  soldThisMonth?: number;
  reservedCars?: number;
  pendingSubmissions?: number;
  unreadInquiries?: number;
  newInquiriesToday?: number;
  recentActivity?: DashboardActivity[];
}

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => apiClient.get('/admin/dashboard'),
  });
}
