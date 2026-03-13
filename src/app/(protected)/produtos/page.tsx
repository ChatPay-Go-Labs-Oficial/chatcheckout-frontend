'use client';

import { useRouter } from 'next/navigation';
import { ProductList } from '@/components/products';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Plus, Search, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAuth } from '@/hooks/useAuth';

export default function ProductsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { products, isLoading, deleteProduct } = useProducts(user?.id ?? '');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
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
    <div className="w-full p-8 pt-4">
      {/* Header */}
      {isLoading ? (
        // Skeleton do Header
        <div className="flex items-center justify-between mb-6 animate-pulse">
          <div>
            <div className="h-8 w-32 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-48 bg-gray-200 rounded"></div>
          </div>
          <div className="h-11 w-40 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Produtos</h1>
            <p className="text-[13px] text-muted-foreground mt-1">Gerencie, edite e acompanhe seus produtos digitais em diferentes visualizações.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background/50 focus-visible:ring-1 h-9"
              />
            </div>

            <div className="h-9 p-1 bg-muted rounded-lg flex items-center border shadow-sm">
                <Tabs value={view} onValueChange={(v) => setView(v as 'grid' | 'list')} className="w-full">
                    <TabsList className="bg-transparent h-7 p-0 gap-1">
                        <TabsTrigger value="grid" className="h-7 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <LayoutGrid className="h-3.5 w-3.5 mr-2" />
                            <span className="text-xs font-semibold">Grid</span>
                        </TabsTrigger>
                        <TabsTrigger value="list" className="h-7 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <List className="h-3.5 w-3.5 mr-2" />
                            <span className="text-xs font-semibold">Lista</span>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <Button
              onClick={handleNewProduct}
              className="flex items-center gap-2 whitespace-nowrap shadow-sm h-10 px-4"
            >
              <Plus className="w-4 h-4" />
              <span className="font-semibold text-xs">Novo Produto</span>
            </Button>
          </div>
        </div>
      )}

      {/* Lista de Produtos */}
      <ProductList
        products={products.filter(p => 
          p.name.toLowerCase().includes(search.toLowerCase()) || 
          p.description?.toLowerCase().includes(search.toLowerCase())
        )}
        view={view}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
