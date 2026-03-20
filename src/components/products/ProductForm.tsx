'use client';

import React, { useState } from 'react';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileUploadField } from './FileUploadField';
import { CheckoutLinkModal } from './CheckoutLinkModal';
import { useFileUpload } from '@/hooks/useFileUpload';
import { FILE_VALIDATIONS, Product, Currency } from '@/types/product';
import { useGlobalToast } from '@/contexts/ToastContext';
import {
  Lock,
  FileArchive,
  Info,
  Package,
  Sparkles,
  Layout,
  RefreshCcw,
  ArrowLeft,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/productService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const productFormSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
  description: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Valor inválido'),
  currency: z.string(),
  salesPageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  aiTrainingPrompt: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  mode: 'create' | 'update';
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
    ? 'Preencha os detalhes do seu produto digital para começar a vender.'
    : 'Atualize as informações do seu produto abaixo.';
  const submitButtonText = isCreate ? 'Criar Produto' : 'Salvar Alterações';

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
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Erro ao criar produto';
      toast.error(message);
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
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar produto';
      toast.error(message);
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
    <div className="w-full p-8 pt-4 mx-auto pb-6 min-w-0 max-w-[100vw]">
      <div className="flex flex-col mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 -ml-2 text-muted-foreground hover:text-foreground"
            onClick={onCancel}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        </div>
        <p className="text-[13px] text-muted-foreground ml-8">{subtitle}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Linha 1: 3 Colunas com Altura Uniforme */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Coluna 1: Informações Básicas */}
            <Card className="shadow-sm border-muted/60 h-full flex flex-col bg-background">
              <CardHeader className="py-3 px-5 border-b bg-transparent">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pt-3 pb-5 flex-1 flex flex-col space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Nome do produto</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Masterclass de Design Digital"
                          {...field}
                          className="bg-muted/30 focus-visible:ring-1 h-10 text-sm border-muted/60"
                        />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="flex-1 flex flex-col">
                      <FormLabel className="text-xs">Descrição Completa</FormLabel>
                      <FormControl className="flex-1">
                        <Textarea
                          placeholder="Ex: Neste treinamento completo, você aprenderá as estratégias fundamentais para escalar suas vendas digitais, desde o tráfego pago até a conversão em alta escala, com foco 100% prático e cases reais..."
                          className="min-h-[100px] h-full bg-muted/30 focus-visible:ring-1 resize-none text-sm flex-1 border-muted/60"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Coluna 2: Vendas & Checkout */}
            <Card className="shadow-sm border-muted/60 h-full flex flex-col bg-background">
              <CardHeader className="py-3 px-5 border-b bg-transparent">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Layout className="w-4 h-4 text-muted-foreground" />
                  Vendas & Checkout
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-5 pt-3 pb-5 flex-1">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Valor de Venda</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                            R$
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            {...field}
                            className="pl-10 bg-muted/30 focus-visible:ring-1 h-10 text-sm border-muted/60"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel className="text-xs">Moeda</FormLabel>
                  <div className="flex items-center px-3 h-10 bg-muted/20 border border-muted/60 rounded-md text-[13px] font-medium text-muted-foreground/70 cursor-not-allowed select-none">
                    <span>BRL — Real Brasileiro</span>
                    <Lock className="w-3 h-3 ml-auto opacity-50" />
                  </div>
                </FormItem>

                <FormField
                  control={form.control}
                  name="salesPageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Página de Vendas (Opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://seu-produto.com"
                          {...field}
                          className="bg-muted/30 focus-visible:ring-1 h-10 text-sm border-muted/60"
                        />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Coluna 3: Treinamento IA */}
            <Card className="shadow-sm border-muted/60 h-full flex flex-col bg-background">
              <CardHeader className="py-3 px-5 border-b bg-transparent">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-muted-foreground" />
                  Treinamento IA (Opcional)
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pt-3 pb-5 flex-1 flex flex-col">
                <FormField
                  control={form.control}
                  name="aiTrainingPrompt"
                  render={({ field }) => (
                    <FormItem className="flex-1 flex flex-col">
                      <FormLabel className="text-xs">Contexto para Treinamento</FormLabel>
                      <FormControl className="flex-1">
                        <Textarea
                          placeholder="Ex: Este produto é um eBook focado em marketing de afiliados. Ele aborda ferramentas de automação, escolha de nichos lucrativos e copywriting persuasivo. Utilize um tom mentor e profissional para tirar dúvidas dos clientes."
                          className="min-h-[145px] h-full bg-muted/30 focus-visible:ring-1 resize-none text-sm flex-1 border-muted/60"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Linha 2: Arquivos (Lado a Lado) */}
          <Card className="shadow-sm border-muted/60 bg-background">
            <CardHeader className="py-3 px-5 border-b bg-transparent">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileArchive className="w-4 h-4 text-muted-foreground" />
                Arquivos & Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUploadField
                  label="Capa do Produto"
                  accept=".png,.jpg,.jpeg,.webp"
                  maxSize={10 * 1024 * 1024}
                  helpText="600px x 600px (Máx 10MB)"
                  file={imageUpload.file}
                  preview={imageUpload.preview}
                  error={imageUpload.error}
                  currentFileUrl={initialProduct?.imageUrl}
                  onFileSelect={imageUpload.selectFile}
                  onFileRemove={imageUpload.removeFile}
                />

                <FileUploadField
                  label="Arquivo Digital"
                  accept=".pdf,.zip,.epub,.mp4"
                  maxSize={500 * 1024 * 1024}
                  required={isCreate}
                  file={productFileUpload.file}
                  error={productFileUpload.error}
                  currentFileUrl={initialProduct?.productUrl}
                  onFileSelect={productFileUpload.selectFile}
                  onFileRemove={productFileUpload.removeFile}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-muted/30">
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground font-medium h-10 text-sm w-full sm:w-auto"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="shadow-md px-8 h-10 font-bold text-sm bg-primary hover:bg-primary/90 w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                  Processando...
                </span>
              ) : (
                submitButtonText
              )}
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
