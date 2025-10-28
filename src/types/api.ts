/**
 * Tipos genéricos para respostas de API
 * Usado em toda a aplicação para padronizar respostas de erro
 */
export type ApiErrorResponse = {
  statusCode: number;
  message: string | string[];
  error?: string;
};

/**
 * Tipo genérico para respostas de sucesso da API
 */
export type ApiSuccessResponse<T = unknown> = {
  data: T;
  message?: string;
  success: boolean;
};

/**
 * Estado de loading para operações assíncronas
 */
export type LoadingState = {
  isLoading: boolean;
  error: string | null;
};
