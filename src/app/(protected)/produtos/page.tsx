'use client';

import { useRouter } from 'next/navigation';
import { ProductList } from '@/components/products';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';

export default function ProductsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { products, isLoading, deleteProduct } = useProducts(user?.id ?? '');
  const handleEdit = (id: string) => {
    router.push(`/produtos/${id}/editar`);
  };

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
  };

  const handleNewProduct = () => {
    router.push('/produtos/novo');
  };

  return (
    <div className="w-full">
      {/* Header */}
      {isLoading ? (
        // Skeleton do Header
        <div className="flex items-center justify-between mb-8 animate-pulse">
          <div>
            <div className="h-8 w-32 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-48 bg-gray-200 rounded"></div>
          </div>
          <div className="h-11 w-40 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
        </div>
      ) : (
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Produtos</h1>
            <p className="text-sm text-muted-foreground mt-1">Gerencie seus produtos digitais</p>
          </div>

          <Button
            onClick={handleNewProduct}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Produto
          </Button>
        </div>
      )}

      {/* Lista de Produtos */}
      <ProductList
        products={products}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
