'use client';

import { useRouter } from 'next/navigation';
import { ProductList } from '@/components/products';
import { useProducts } from '@/hooks/useProducts';

import { useAuth } from '@/hooks/useAuth';

export default function ProductsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { products, isLoading, deleteProduct } = useProducts(user?.id || '');
  const handleEdit = (id: string) => {
    router.push(`/produtos/${id}/editar`);
  };

  console.log(user?.id);
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
            <h1 className="text-2xl font-bold text-[#181b4a]">Produtos</h1>
            <p className="text-sm text-gray-500 mt-1">Gerencie seus produtos digitais</p>
          </div>

          <button
            onClick={handleNewProduct}
            className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-[#6f43d0] to-[#6fdcff] rounded-xl hover:scale-[1.02] hover:shadow-lg transition flex items-center gap-2"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 4v16m8-8H4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Novo Produto
          </button>
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
