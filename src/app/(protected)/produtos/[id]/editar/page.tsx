'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProductForm } from '@/components/products';
import { Product } from '@/types/product';
import { productService } from '@/services/productService';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        const fetchedProduct = await productService.getProductById(productId);
        setProduct(fetchedProduct);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar produto');
      } finally {
        setIsLoading(false);
      }
    }

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const handleSuccess = () => {
    router.push('/produtos');
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#6f43d0] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Carregando produto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="w-full flex justify-center items-center min-h-[400px]">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Erro ao carregar produto</h3>
          <p className="text-sm text-red-500">{error || 'Produto não encontrado'}</p>
          <button
            onClick={() => router.push('/produtos')}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition"
          >
            Voltar para produtos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <ProductForm
        mode="edit"
        initialProduct={product}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
