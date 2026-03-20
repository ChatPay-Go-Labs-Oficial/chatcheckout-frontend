import { apiClient } from '@/utils/api-client';
import { SalesListResponse, SalesQueryParams } from '@/types/sales';

function toQueryString(query: SalesQueryParams): string {
  const params = new URLSearchParams();

  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.paymentType) params.set('paymentType', query.paymentType);
  if (query.startDate) params.set('startDate', query.startDate);
  if (query.endDate) params.set('endDate', query.endDate);
  if (query.sortBy) params.set('sortBy', query.sortBy);
  if (query.sortOrder) params.set('sortOrder', query.sortOrder);

  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const salesService = {
  async getMySales(query: SalesQueryParams): Promise<SalesListResponse> {
    return apiClient.get<SalesListResponse>(`/order/my/sales${toQueryString(query)}`);
  },
};
