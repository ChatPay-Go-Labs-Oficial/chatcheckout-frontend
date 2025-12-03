/**
 * Header do produto exibido no topo do checkout
 */

'use client';

import Image from 'next/image';
import { ProductInfo } from '@/types/checkout';

interface ProductHeaderProps {
  product: ProductInfo;
}

export function ProductHeader({ product }: ProductHeaderProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <div className="px-4 py-3.5 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          {product.imageUrl ? (
            <div className="relative w-9 h-9 rounded-md bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="36px"
              />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-md gradient-bg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {product.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <h2 className="font-semibold text-gray-900 text-base truncate">{product.name}</h2>
        </div>
        <p className="text-base font-semibold text-gray-900 whitespace-nowrap ml-3">
          {formatPrice(product.price)}
        </p>
      </div>
    </div>
  );
}
