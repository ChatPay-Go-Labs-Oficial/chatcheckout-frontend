import { Product, CreateProductDTO, UpdateProductDTO } from '@/types/product';
import { NEXT_PUBLIC_API_URL } from '@/utils/env';

/**
 * Serviço responsável pelas operações CRUD de produtos
 */
class ProductService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = NEXT_PUBLIC_API_URL;
  }

  /**
   * Obtém o token de autenticação do localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('chatcheckout_access_token');
  }

  /**
   * Busca todos os produtos do usuário autenticado
   * @returns Lista de produtos
   * @throws Error se a busca falhar
   */
  async getProducts(): Promise<Product[]> {
    try {
      const token = this.getAuthToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}/product`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar produtos');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao buscar produtos. Tente novamente.');
    }
  }

  /**
   * Busca um produto específico por ID
   * @param id - ID do produto
   * @returns Dados do produto
   * @throws Error se o produto não for encontrado ou houver erro
   */
  async getProductById(id: string): Promise<Product> {
    try {
      const token = this.getAuthToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}/product/${id}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Produto não encontrado');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao buscar produto. Tente novamente.');
    }
  }

  /**
   * Cria um novo produto com upload de arquivos
   * @param data - Dados do produto a ser criado
   * @param productImage - Arquivo de imagem do produto (opcional)
   * @param productFile - Arquivo do produto (PDF, ZIP, etc.) - obrigatório
   * @returns Produto criado
   * @throws Error se a criação falhar
   */
  async createProduct(
    data: CreateProductDTO,
    productImage?: File,
    productFile?: File,
  ): Promise<Product> {
    try {
      const formData = new FormData();

      // Adiciona os campos do produto (nomes devem corresponder ao DTO do backend)
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('price', data.price.toString());
      formData.append('currency', data.currency);
      formData.append('salesPageUrl', data.salesPageUrl);
      formData.append('promptAi', data.promptAi);

      // Adiciona os arquivos com os NOMES EXATOS que o backend espera
      if (productImage) {
        formData.append('productImage', productImage);
      }

      if (productFile) {
        formData.append('productFile', productFile);
      }

      const token = this.getAuthToken();
      const headers: HeadersInit = {};

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}/product`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        // Tratamento específico para erro 401 (não autorizado)
        if (response.status === 401) {
          // Limpar token inválido
          if (typeof window !== 'undefined') {
            localStorage.removeItem('chatcheckout_access_token');
            localStorage.removeItem('chatcheckout_refresh_token');
            localStorage.removeItem('chatcheckout_user');
            // Redirecionar para login
            window.location.href = '/login';
          }
          throw new Error('Token inválido ou expirado');
        }

        const errorData = await response.json();
        const message = errorData.message || 'Erro ao criar produto';
        throw new Error(message);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao criar produto. Tente novamente.');
    }
  }

  /**
   * Atualiza um produto existente
   * @param id - ID do produto
   * @param data - Dados a serem atualizados
   * @returns Produto atualizado
   * @throws Error se a atualização falhar
   */
  async updateProduct(id: string, data: UpdateProductDTO): Promise<Product> {
    try {
      const token = this.getAuthToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}/product/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar produto');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao atualizar produto. Tente novamente.');
    }
  }

  /**
   * Deleta um produto
   * @param id - ID do produto a ser deletado
   * @throws Error se a exclusão falhar
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      const token = this.getAuthToken();
      const headers: HeadersInit = {};

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}/product/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar produto');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao deletar produto. Tente novamente.');
    }
  }
}

export const productService = new ProductService();
