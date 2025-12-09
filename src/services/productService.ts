import { Product, CreateProductDTO, UpdateProductDTO } from '@/types/product';
import { NEXT_PUBLIC_API_URL } from '@/utils/env';
import { AuthInterceptor } from '@/utils/authInterceptor';

/**
 * Serviço responsável pelas operações CRUD de produtos
 */
class ProductService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = NEXT_PUBLIC_API_URL;
  }

  /**
   * Busca todos os produtos do usuário autenticado
   * @returns Lista de produtos
   * @throws Error se a busca falhar
   */
  async getProductsByUser(userId: string): Promise<Product[]> {
    try {
      const response = await AuthInterceptor.fetch(`${this.baseUrl}/product/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar produtos');
      }

      const result = await response.json();
      return Array.isArray(result) ? result : result.data || [];
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
      const response = await AuthInterceptor.fetch(`${this.baseUrl}/product/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
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

      const response = await AuthInterceptor.fetch(`${this.baseUrl}/product`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
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
      const response = await AuthInterceptor.fetch(`${this.baseUrl}/product/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
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
      const response = await AuthInterceptor.fetch(`${this.baseUrl}/product/${id}`, {
        method: 'DELETE',
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
