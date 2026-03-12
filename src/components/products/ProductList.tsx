'use client';

import React, { useState } from 'react';
import { Product } from '@/types/product';
import { useGlobalToast } from '@/contexts/ToastContext';
import { Copy, Pencil, Trash2, PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface ProductListProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ProductList({ products, isLoading, onEdit, onDelete }: ProductListProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useGlobalToast();

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(productToDelete.id);
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao deletar produto. Tente novamente.';
      toast.error(message);
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copiado para a área de transferência!');
  };

  const formatPrice = (price: number | string, currency: string): string => {
    const priceNum = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(priceNum)) return `${currency} 0.00`;
    if (currency === 'BRL') {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(priceNum);
    }
    return `${currency} ${priceNum.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Moeda</TableHead>
              <TableHead>Link</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded animate-pulse" />
                    <div className="w-32 h-4 bg-muted rounded animate-pulse" />
                  </div>
                </TableCell>
                <TableCell><div className="w-16 h-4 bg-muted rounded animate-pulse" /></TableCell>
                <TableCell><div className="w-12 h-4 bg-muted rounded animate-pulse" /></TableCell>
                <TableCell><div className="w-8 h-8 bg-muted rounded animate-pulse" /></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                    <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
          <PackageOpen className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Nenhum produto cadastrado</h3>
        <p className="text-sm text-muted-foreground mt-1 text-balance">
          Comece criando seu primeiro produto digital para vender
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Moeda</TableHead>
              <TableHead>Link</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {product.imageUrl ? (
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-muted">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {product.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {product.description}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {formatPrice(product.price, product.currency)}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{product.currency}</Badge>
                </TableCell>
                <TableCell>
                  {product.productHash ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(`${process.env.NEXT_PUBLIC_CHECKOUT_URL}?hash=${product.productHash}`)}
                      title="Copiar link"
                    >
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" onClick={() => onEdit(product.id)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="hover:text-destructive hover:bg-destructive/10 border-destructive/20" onClick={() => handleDeleteClick(product)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o produto{' '}
              <span className="font-semibold text-foreground">{productToDelete?.name}</span>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
