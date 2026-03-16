export type SalesPaymentType = 'PIX' | 'CARD' | 'CRYPTO';
export type SalesOrderStatus = 'CREATED' | 'COMPLETED' | 'FAILED';
export type SalesSortBy = 'createdAt' | 'totalAmount';
export type SalesSortOrder = 'asc' | 'desc';

export interface SalesListItem {
  orderId: string;
  createdAt: string;
  product?: {
    name: string;
  };
  totalAmount: number;
  feeAmount: number;
  status: SalesOrderStatus;
  paymentMethod: string;
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
