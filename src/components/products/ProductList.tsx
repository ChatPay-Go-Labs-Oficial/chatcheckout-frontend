'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Product } from '@/types/product';
import { useGlobalToast } from '@/contexts/ToastContext';
import { Copy, Pencil, Trash2, PackageOpen, MoreHorizontal, ExternalLink, Globe } from 'lucide-react';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from "@/components/ui/card";

interface ProductListProps {
    products: Product[];
    view: 'grid' | 'list';
    isLoading: boolean;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

const ProductImage = ({ src, alt, className }: { src: string | null | undefined; alt: string; className?: string }) => {
    const [error, setError] = React.useState(false);

    if (!src || error) {
        return (
            <div className={cn("aspect-video w-full bg-muted/10 flex flex-col items-center justify-center shrink-0", className)}>
                <PackageOpen className="w-8 h-8 text-muted-foreground/20" />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={cn("aspect-video w-full object-cover shrink-0", className)}
            onError={() => setError(true)}
        />
    );
};

export function ProductList({ products, view, isLoading, onEdit, onDelete }: ProductListProps) {
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

    const formatPriceValue = (price: number | string): string => {
        const priceNum = typeof price === 'string' ? parseFloat(price) : price;
        if (isNaN(priceNum)) return '0,00';
        return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(priceNum);
    };

    const getCurrencySymbol = (currency: string): string => {
        if (currency === 'BRL') return 'R$';
        return currency;
    };

    if (isLoading) {
        return (
            <div className={view === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4" : "rounded-lg border bg-card shadow-sm overflow-hidden"}>
                {view === 'grid' ? (
                    [1, 2, 3, 4, 5].map((i) => (
                        <Card key={i} className="overflow-hidden gap-0 py-0">
                            <div className="aspect-video bg-muted animate-pulse" />
                            <CardHeader className="px-4 py-3">
                                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                                <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                            </CardHeader>
                            <CardFooter className="px-4 py-2">
                                <div className="h-8 w-full bg-muted rounded animate-pulse" />
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[400px]">Produto</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead className="text-right">AÇÕES</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[1, 2, 3, 4].map((i) => (
                                <TableRow key={i} className="hover:bg-transparent">
                                    <TableCell>
                                        <div className="flex items-center gap-3 py-1">
                                            <div className="h-8 w-8 rounded bg-muted animate-pulse" />
                                            <div className="space-y-2">
                                                <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                                                <div className="h-2 w-48 bg-muted rounded animate-pulse" />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell><div className="h-3 w-16 bg-muted rounded animate-pulse" /></TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2 text-right">
                                            <div className="h-7 w-7 bg-muted rounded animate-pulse" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center rounded-lg border border-dashed bg-muted/20">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background border shadow-sm mb-4">
                    <PackageOpen className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <h3 className="text-base font-semibold text-foreground">Sua vitrine está vazia</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    Crie seu primeiro produto para começar a vender.
                </p>
            </div>
        );
    }

    return (
        <>
            {view === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-fr">
                    {products.map((product) => (
                        <Card key={product.id} className="group flex flex-col border-muted/60 transition-colors shadow-sm overflow-hidden gap-0 py-0 h-full">
                            {/* Imagem (Sangramento total com tratamento de erro) */}
                            <ProductImage src={product.imageUrl} alt={product.name} />

                            {/* Content Section (Ultra-tightened following Shadcn example) */}
                            <CardHeader className="px-4 py-3.5 space-y-1 flex-1 bg-background">
                                <CardTitle className="text-sm font-semibold tracking-tight line-clamp-1" title={product.name}>
                                    {product.name}
                                </CardTitle>
                                <CardDescription className="text-[11px] leading-relaxed text-muted-foreground/80 line-clamp-2">
                                    {product.description || 'Nenhuma descrição técnica informada.'}
                                </CardDescription>
                            </CardHeader>

                            {/* Footer com contraste (bg-muted/50 e espaçamento mínimo) */}
                            <CardFooter className="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-t shrink-0">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="text-[17px] font-bold text-foreground tracking-tight whitespace-nowrap">
                                        {getCurrencySymbol(product.currency)} {formatPriceValue(product.price)}
                                    </span>
                                    {product.currency !== 'BRL' && (
                                        <Badge variant="outline" className="text-[9px] h-4 px-1 bg-background/50 border-muted-foreground/20 font-medium whitespace-nowrap">
                                            {product.currency}
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex items-center gap-0.5 shrink-0 ml-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-md hover:bg-background/80"
                                        onClick={() => onEdit(product.id)}
                                    >
                                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                    </Button>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 p-0 rounded-md hover:bg-background/80">
                                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem onClick={() => copyToClipboard(`${process.env.NEXT_PUBLIC_CHECKOUT_URL || ''}?hash=${product.productHash}`)}>
                                                <Copy className="mr-2 h-4 w-4" /> Copiar Link
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => window.open(`${process.env.NEXT_PUBLIC_CHECKOUT_URL || ''}?hash=${product.productHash}`, '_blank')}>
                                                <ExternalLink className="mr-2 h-4 w-4" /> Ver Checkout
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-destructive focus:bg-destructive/10 focus:text-destructive font-medium"
                                                onClick={() => handleDeleteClick(product)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent bg-muted/50">
                                <TableHead className="px-4 h-11 text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-[160px]">Produto</TableHead>
                                <TableHead className="px-4 h-11 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left whitespace-nowrap w-[140px]">Preço</TableHead>
                                <TableHead className="px-4 h-11 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left whitespace-nowrap w-[140px]">Moeda</TableHead>
                                <TableHead className="px-4 h-11 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left whitespace-nowrap w-[140px]">AÇÕES</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.id} className="group transition-colors border-b last:border-0 hover:bg-muted/10">
                                    <TableCell className="px-4 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-md border bg-background shrink-0 overflow-hidden ring-1 ring-muted/50">
                                                <ProductImage
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-semibold text-sm text-foreground truncate leading-none" title={product.name}>
                                                    {product.name}
                                                </span>
                                                <span className="text-[11px] text-muted-foreground truncate font-normal mt-1.5">
                                                    {product.description || 'Nenhuma descrição técnica informada.'}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3.5 font-semibold text-sm text-foreground whitespace-nowrap text-left">
                                        {getCurrencySymbol(product.currency)} {formatPriceValue(product.price)}
                                    </TableCell>
                                    <TableCell className="px-4 py-3.5 text-left">
                                        <Badge variant="outline" className="text-[10.5px] px-2 py-0 h-5 bg-muted/60 text-foreground font-bold border-muted-foreground/30 shadow-none">
                                            {product.currency}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-4 py-3.5 text-left">
                                        <div className="flex justify-start items-center gap-2.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 p-0"
                                                onClick={() => copyToClipboard(`${process.env.NEXT_PUBLIC_CHECKOUT_URL || ''}?hash=${product.productHash}`)}
                                                title="Link Checkout"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 p-0"
                                                onClick={() => onEdit(product.id)}
                                                title="Editar"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => window.open(`${process.env.NEXT_PUBLIC_CHECKOUT_URL || ''}?hash=${product.productHash}`, '_blank')}>
                                                        <Globe className="mr-2 h-4 w-4" /> Visualizar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:bg-destructive/10 focus:text-destructive font-semibold"
                                                        onClick={() => handleDeleteClick(product)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Remover
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent className="sm:max-w-md rounded-lg">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-foreground">Remover Produto</DialogTitle>
                        <DialogDescription className="text-sm">
                            Você tem certeza que deseja deletar <span className="font-semibold text-foreground">{productToDelete?.name}</span>? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={() => setDeleteModalOpen(false)} disabled={isDeleting}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" className="flex-1" onClick={handleConfirmDelete} disabled={isDeleting}>
                            {isDeleting ? 'Removendo...' : 'Remover'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
