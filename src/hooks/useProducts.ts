import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/productService';

/**
 * Hook customizado para gerenciar listagem e operações de produtos
 * Utiliza TanStack Query para gerenciamento de estado e cache
 */
export function useProducts(userId: string) {
  const queryClient = useQueryClient();

  /**
   * Busca lista de produtos pelo usuário autenticado
   */
  const {
    data: products = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['products', userId],
    queryFn: () => productService.getProductsByUser(userId),
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
    enabled: !!userId, // Somente busca se tiver ID do usuário
  });

  /**
   * Deleta um produto pelo usuário autenticado
   */
  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      // Invalida a query de produtos para recarregar a lista
      queryClient.invalidateQueries({ queryKey: ['products', userId] });
    },
  });

  /**
   * Wrapper para a função de deletar, mantendo compatibilidade
   */
  const deleteProduct = async (id: string) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    products,
    isLoading,
    error: error instanceof Error ? error.message : error ? String(error) : null,
    fetchProducts: refetch, // Mantém compatibilidade com nome antigo, mas usa refetch do React Query
    deleteProduct,
    refetch,
    isDeleting: deleteMutation.isPending,
  };
}
