export type SalesPaymentType = 'PIX' | 'CARD' | 'CRYPTO';
export type SalesOrderStatus = 'CREATED' | 'COMPLETED' | 'FAILED';
export type SalesSortBy = 'createdAt' | 'totalAmount';
export type SalesSortOrder = 'asc' | 'desc';

export interface SalesListItem {
  orderId: string;
  createdAt: string;
  productName: string;
  totalAmount: number;
  feeAmount: number;
  netAmount: number;
  status: SalesOrderStatus;
  paymentType: SalesPaymentType;
}

export interface SalesListResponse {
  data: SalesListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SalesQueryParams {
  page?: number;
  limit?: number;
  paymentType?: SalesPaymentType;
  startDate?: string;
  endDate?: string;
  sortBy?: SalesSortBy;
  sortOrder?: SalesSortOrder;
}
