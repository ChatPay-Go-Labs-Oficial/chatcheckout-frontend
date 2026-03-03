import { apiClient } from '@/utils/api-client';

interface DashboardQuery {
  startDate?: string;
  endDate?: string;
  productId?: string;
}

function toQueryString(query: DashboardQuery): string {
  const params = new URLSearchParams();
  if (query.startDate) params.set('startDate', query.startDate);
  if (query.endDate) params.set('endDate', query.endDate);
  if (query.productId) params.set('productId', query.productId);
  const result = params.toString();
  return result ? `?${result}` : '';
}

export interface CheckoutSummaryResponse {
  sessions: number;
  successfulCheckouts: number;
  conversionRate: number;
  totalOrders: number;
  totalAmount: number;
  totalFeeAmount: number;
  netAmount: number;
  avgTicket: number;
}

export interface CheckoutFunnelResponse {
  stages: Array<{ label: string; value: number }>;
}

export interface CheckoutAbandonmentResponse {
  totalAbandonedSessions: number;
  byStep: Array<{ step: string; count: number }>;
}

export interface PaymentsBreakdownResponse {
  breakdown: Array<{
    paymentMethod: 'PIX' | 'CARD' | 'CRYPTO';
    attempts: number;
    success: number;
    failed: number;
    successRate: number;
  }>;
}

export interface DailySalesResponse {
  data: Array<{ day: string; value: number }>;
}

export const dashboardService = {
  async getCheckoutSummary(query: DashboardQuery = {}): Promise<CheckoutSummaryResponse> {
    return apiClient.get<CheckoutSummaryResponse>(
      `/dashboard/checkout/summary${toQueryString(query)}`,
    );
  },

  async getCheckoutFunnel(query: DashboardQuery = {}): Promise<CheckoutFunnelResponse> {
    return apiClient.get<CheckoutFunnelResponse>(
      `/dashboard/checkout/funnel${toQueryString(query)}`,
    );
  },

  async getCheckoutAbandonment(query: DashboardQuery = {}): Promise<CheckoutAbandonmentResponse> {
    return apiClient.get<CheckoutAbandonmentResponse>(
      `/dashboard/checkout/abandonment${toQueryString(query)}`,
    );
  },

  async getPaymentsBreakdown(query: DashboardQuery = {}): Promise<PaymentsBreakdownResponse> {
    return apiClient.get<PaymentsBreakdownResponse>(
      `/dashboard/checkout/payments-breakdown${toQueryString(query)}`,
    );
  },

  async getDailySales(query: DashboardQuery = {}): Promise<DailySalesResponse> {
    return apiClient.get<DailySalesResponse>(
      `/dashboard/checkout/daily-sales${toQueryString(query)}`,
    );
  },
};
