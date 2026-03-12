'use client';

import React, { useState } from 'react';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TextAreaField } from '@/components/TextAreaField';
import { FileUploadField } from './FileUploadField';
import { CheckoutLinkModal } from './CheckoutLinkModal';
import { useFileUpload } from '@/hooks/useFileUpload';
import { FILE_VALIDATIONS, Product, Currency } from '@/types/product';
import { useGlobalToast } from '@/contexts/ToastContext';
import { Lock, FileArchive, Info } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/productService';

const productFormSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
  description: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Valor inválido'),
  currency: z.string().default('BRL'),
  salesPageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  aiTrainingPrompt: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  mode: 'create' | 'edit';
  initialProduct?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ mode, initialProduct, onSuccess, onCancel }: ProductFormProps) {
  const toast = useGlobalToast();
  const queryClient = useQueryClient();

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null);

  const imageUpload = useFileUpload('image', FILE_VALIDATIONS.image);
  const productFileUpload = useFileUpload('product', FILE_VALIDATIONS.product);

  const isCreate = mode === 'create';
  const title = isCreate ? 'Novo Produto' : 'Edição de Produto';
  const subtitle = isCreate
    ? 'Preencha os detalhes do seu produto digital'
    : 'Atualize os detalhes do seu produto abaixo';
  const submitButtonText = isCreate ? 'Salvar Produto' : 'Salvar Alterações';

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: initialProduct?.name || '',
      description: initialProduct?.description || '',
      price: initialProduct?.price?.toString() || '',
      currency: initialProduct?.currency || 'BRL',
      salesPageUrl: initialProduct?.salesPageUrl || '',
      aiTrainingPrompt: initialProduct?.promptAi || '',
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      if (isCreate && !productFileUpload.file) {
        throw new Error('Arquivo do produto é obrigatório');
      }

      return productService.createProduct(
        {
          name: data.name,
          description: data.description,
          price: parseFloat(data.price),
          currency: data.currency as Currency,
          salesPageUrl: data.salesPageUrl || '',
          promptAi: data.aiTrainingPrompt || '',
        },
        imageUpload.file || undefined,
        productFileUpload.file || undefined,
      );
    },
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setCreatedProduct(product);
      setShowCheckoutModal(true);
      toast.success('Produto criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar produto');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      if (!initialProduct?.id) throw new Error('ID não encontrado');

      return productService.updateProduct(
        initialProduct.id,
        {
          name: data.name,
          description: data.description,
          price: parseFloat(data.price),
          currency: data.currency as Currency,
          salesPageUrl: data.salesPageUrl || '',
          promptAi: data.aiTrainingPrompt || '',
        },
        imageUpload.file || undefined,
      );
    },
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', product.id] });
      setCreatedProduct(product);
      setShowCheckoutModal(true);
      toast.success('Produto atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar produto');
    },
  });

  const onSubmit = (values: ProductFormValues) => {
    if (isCreate && !productFileUpload.file && !productFileUpload.error) {
      toast.error('O arquivo do produto é obrigatório na criação.');
      return;
    }

    if (imageUpload.error) {
      toast.error(imageUpload.error);
      return;
    }

    if (isCreate) {
      createMutation.mutate(values);
    } else {
      updateMutation.mutate(values);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do produto *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Curso Completo de Python" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição *</FormLabel>
                  <FormControl>
                    <TextAreaField
                      placeholder="Descreva os detalhes do seu produto aqui..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="199.90" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Moeda</FormLabel>
                <div className="flex items-center px-3 h-10 bg-muted border border-border rounded-md text-sm font-medium text-muted-foreground cursor-not-allowed select-none">
                  <span>BRL — Real</span>
                  <Lock className="w-4 h-4 ml-auto text-muted-foreground/60" />
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="salesPageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link da página de vendas (opcional)</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://seusite.com/produto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="aiTrainingPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt param treinamento de IA (opcional)</FormLabel>
                  <FormControl>
                    <TextAreaField
                      placeholder="Ex: Curso online para iniciantes em Python..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <div className="bg-card rounded-lg p-5 border shadow-sm">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <FileArchive className="w-4 h-4 text-primary" />
                  Arquivos do Produto
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Faça upload da imagem de capa e do arquivo digital do seu produto
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-background rounded-lg p-3 border">
                  <FileUploadField
                    label="Imagem do produto"
                    accept=".png,.jpg,.jpeg,.gif,.webp"
                    maxSize={10 * 1024 * 1024}
                    file={imageUpload.file}
                    preview={imageUpload.preview}
                    error={imageUpload.error}
                    currentFileUrl={initialProduct?.imageUrl}
                    helpText="PNG, JPG ou até 10MB"
                    onFileSelect={imageUpload.selectFile}
                    onFileRemove={imageUpload.removeFile}
                  />
                </div>

                <div className="bg-background rounded-lg p-3 border">
                  <FileUploadField
                    label="Upload do produto *"
                    accept=".pdf,.zip,.epub,.mp4,.mp3"
                    maxSize={500 * 1024 * 1024}
                    required={isCreate}
                    file={productFileUpload.file}
                    error={productFileUpload.error}
                    currentFileUrl={initialProduct?.productUrl}
                    helpText="PDF, ZIP, etc. até 500MB"
                    onFileSelect={productFileUpload.selectFile}
                    onFileRemove={productFileUpload.removeFile}
                  />
                </div>
              </div>

              <div className="mt-4 bg-secondary/10 rounded-md p-3">
                <p className="text-xs text-secondary-foreground font-medium flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-secondary" />
                  <span>
                    A imagem será exibida na página de vendas. O arquivo digital será entregue
                    imediatamente após o pagamento.
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex items-center justify-end gap-4 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {submitButtonText}
            </Button>
          </div>
        </form>
      </Form>

      {createdProduct && (
        <CheckoutLinkModal
          product={createdProduct}
          checkoutUrl={`${process.env.NEXT_PUBLIC_CHECKOUT_URL}?hash=${createdProduct.productHash}`}
          isOpen={showCheckoutModal}
          onClose={() => {
            setShowCheckoutModal(false);
            onSuccess();
          }}
          mode={mode}
          hashChanged={!isCreate && initialProduct?.productHash !== createdProduct.productHash}
        />
      )}
    </div>
  );
}
