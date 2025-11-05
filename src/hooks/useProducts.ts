import { useState, useCallback, useEffect } from 'react';
import { productService } from '@/services/productService';
import { Product } from '@/types/product';

/**
 * Estado do hook de produtos
 */
export interface ProductsState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook customizado para gerenciar listagem e operações de produtos
 * Responsável por buscar, deletar e manter estado atualizado
 *
 * @param autoFetch - Se deve buscar produtos automaticamente ao montar (default: true)
 * @returns Estado e métodos para gerenciar produtos
 */
export function useProducts(autoFetch = true) {
  const [state, setState] = useState<ProductsState>({
    products: [],
    isLoading: false,
    error: null,
  });

  /**
   * Busca lista de produtos
   */
  const fetchProducts = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const products = await productService.getProducts();

      setState({
        products,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar produtos';

      setState({
        products: [],
        isLoading: false,
        error: errorMessage,
      });
    }
  }, []);

  /**
   * Deleta um produto
   */
  const deleteProduct = useCallback(async (id: string): Promise<void> => {
    try {
      await productService.deleteProduct(id);

      // Remove o produto da lista local
      setState((prev) => ({
        ...prev,
        products: prev.products.filter((p) => p.id !== id),
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar produto';
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Recarrega a lista de produtos
   */
  const refetch = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  /**
   * Busca produtos automaticamente ao montar o componente
   */
  useEffect(() => {
    if (autoFetch) {
      fetchProducts();
    }
  }, [autoFetch, fetchProducts]);

  return {
    products: state.products,
    isLoading: state.isLoading,
    error: state.error,
    fetchProducts,
    deleteProduct,
    refetch,
  };
}
