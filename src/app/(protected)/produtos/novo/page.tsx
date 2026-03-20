'use client';

import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/products';

export default function NewProductPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/produtos');
  };

  const handleCancel = () => {
    router.back();
  };

  return <ProductForm mode="create" onSuccess={handleSuccess} onCancel={handleCancel} />;
}
