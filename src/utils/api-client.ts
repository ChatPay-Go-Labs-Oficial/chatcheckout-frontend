/**
 * Utilitários para requisições HTTP e tratamento de erros
 * Centraliza a lógica de comunicação com APIs
 */

import { NEXT_PUBLIC_API_URL } from '@/utils/env';

/**
 * Tipos para respostas de erro da API
 */
export type ApiErrorResponse = {
  message: string | string[];
  statusCode: number;
  error?: string;
};

/**
 * Configuração para requisições HTTP
 */
export type RequestConfig = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  token?: string;
};

/**
 * Trata erros da API e retorna mensagens de erro contextuais
 */
export function handleApiError(response: Response, data: unknown): string {
  const status = response.status;

  // Type guard para verificar se data tem a propriedade message
  const hasMessage = (obj: unknown): obj is { message: string | string[] } => {
    return typeof obj === 'object' && obj !== null && 'message' in obj;
  };

  // Erros específicos baseados no status code
  switch (status) {
    case 400: {
      // Erro de validação - extrair mensagens específicas
      if (hasMessage(data)) {
        if (Array.isArray(data.message)) {
          return data.message[0]; // Retorna o primeiro erro de validação
        }
        return data.message;
      }
      return 'Dados inválidos fornecidos';
    }

    case 409: {
      // Conflito - dados duplicados
      if (hasMessage(data) && typeof data.message === 'string') {
        if (data.message.includes('e-mail')) {
          return 'Este e-mail já está cadastrado';
        }
        if (data.message.includes('CPF')) {
          return 'Este CPF já está cadastrado';
        }
        if (data.message.includes('CNPJ')) {
          return 'Este CNPJ já está cadastrado';
        }
        return data.message;
      }
      return 'Dados já existem no sistema';
    }

    case 422: {
      // Entidade não processável
      return 'Dados fornecidos não puderam ser processados';
    }

    case 429: {
      return 'Muitas tentativas. Aguarde alguns instantes e tente novamente';
    }

    case 500: {
      return 'Erro interno do servidor. Tente novamente mais tarde';
    }

    case 503: {
      return 'Serviço temporariamente indisponível. Tente novamente em alguns instantes';
    }

    default: {
      // Erro genérico baseado na mensagem da API ou fallback
      if (hasMessage(data)) {
        return Array.isArray(data.message) ? data.message[0] : data.message;
      }
      return `Erro na requisição (${status})`;
    }
  }
}

/**
 * Cliente HTTP centralizado com tratamento de erros
 * Reutilizável por todos os services
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = NEXT_PUBLIC_API_URL) {
    this.baseUrl = baseUrl;
  }

  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { method = 'GET', headers = {}, body, token } = config;

    // Headers padrão
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Adiciona token de autorização se fornecido
    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const finalHeaders = { ...defaultHeaders, ...headers };

    // Configuração da requisição
    const requestConfig: RequestInit = {
      method,
      headers: finalHeaders,
    };

    if (body && method !== 'GET') {
      requestConfig.body = JSON.stringify(body);
    }

    // Executa requisição
    const response = await fetch(`${this.baseUrl}${endpoint}`, requestConfig);

    // Verifica se a resposta é JSON válido
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error('Servidor indisponível. Verifique se o backend está rodando.');
    }

    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage = handleApiError(response, responseData);
      throw new Error(errorMessage);
    }

    return responseData as T;
  }

  // Métodos convenientes
  async get<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', token });
  }

  async post<T>(endpoint: string, data: unknown, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body: data, token });
  }

  async put<T>(endpoint: string, data: unknown, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body: data, token });
  }

  async delete<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', token });
  }
}

// Instância padrão exportada
export const apiClient = new ApiClient();
