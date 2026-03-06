'use client';

import React, { useEffect, useState } from 'react';
import { FormField } from '@/components/FormField';
import { TextAreaField } from '@/components/TextAreaField';
import { SelectField, SelectOption } from '@/components/SelectField';
import { FileUploadField } from './FileUploadField';
import { CheckoutLinkModal } from './CheckoutLinkModal';
import { useProductForm, FormMode } from '@/hooks/useProductForm';
import { Product, CURRENCY_LABELS } from '@/types/product';
import { VALIDATION_RULES } from '@/utils/validations/validation-rules';
import { useGlobalToast } from '@/contexts/ToastContext';

interface ProductFormProps {
  mode: FormMode;
  initialProduct?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Formulário completo de produto (criação e edição)
 * Integra todos os campos e validações
 */
export function ProductForm({ mode, initialProduct, onSuccess, onCancel }: ProductFormProps) {
  const {
    formData,
    errors,
    isSubmitting,
    submitError,
    imageUpload,
    productFileUpload,
    handleChange,
    handleSubmit,
  } = useProductForm(mode, initialProduct, undefined); // Não passa onSuccess aqui, vamos controlar manualmente

  const toast = useGlobalToast();

  // Estado para controlar o modal de link de checkout
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null);

  // Mostra toast quando houver erro de submissão
  useEffect(() => {
    if (submitError) {
      toast.error(submitError);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitError]); // toast é estável, não precisa estar nas dependências

  const currencyOptions: SelectOption[] = Object.entries(CURRENCY_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await handleSubmit();

    // Se produto foi criado/atualizado com sucesso
    if (result) {
      setCreatedProduct(result);
      setShowCheckoutModal(true);

      if (isCreate) {
        toast.success('Produto criado com sucesso!');
      } else {
        toast.success('Produto atualizado com sucesso!');
      }
    }
  };

  const handleCloseModal = () => {
    setShowCheckoutModal(false);
    setCreatedProduct(null);
    // Redireciona para lista após fechar o modal
    onSuccess();
  };

  const isCreate = mode === 'create';
  const title = isCreate ? 'Novo Produto' : 'Edição de Produto';
  const subtitle = isCreate
    ? 'Preencha os detalhes do seu produto digital'
    : 'Atualize os detalhes do seu produto abaixo';
  const submitButtonText = isCreate ? 'Salvar Produto' : 'Salvar Alterações';

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-3">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
      </div>

      {/* Formulário em 2 colunas */}
      <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda - Campos */}
        <div className="space-y-3">
          {/* Nome do Produto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome do produto</label>
            <FormField
              name="name"
              type="text"
              placeholder="Ex: Curso Completo de Python"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              hasError={!!errors.name}
              errorMessage={errors.name}
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
            <TextAreaField
              name="description"
              placeholder="Descreva os detalhes do seu produto aqui..."
              value={formData.description}
              rows={2}
              maxLength={VALIDATION_RULES.product.description.maxLength}
              onChange={(e) => handleChange('description', e.target.value)}
              hasError={!!errors.description}
              errorMessage={errors.description}
              required
            />
          </div>

          {/* Valor e Moeda */}
          <div className="grid grid-cols-2 gap-4">
            {/* Valor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
              <FormField
                name="price"
                type="number"
                placeholder="199,90"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                hasError={!!errors.price}
                errorMessage={errors.price}
                required
              />
            </div>

            {/* Moeda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Moeda</label>
              <div className="flex items-center px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-500 cursor-not-allowed select-none">
                <span>BRL — Real Brasileiro</span>
                <span className="ml-auto material-symbols-outlined text-base text-gray-400">
                  lock
                </span>
              </div>
            </div>
          </div>

          {/* Link da Página de Vendas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link da página de vendas
            </label>
            <FormField
              name="salesPageUrl"
              type="url"
              placeholder="https://seusite.com/produto"
              value={formData.salesPageUrl}
              onChange={(e) => handleChange('salesPageUrl', e.target.value)}
              hasError={!!errors.salesPageUrl}
              errorMessage={errors.salesPageUrl}
            />
          </div>

          {/* Prompt para Treinamento de IA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prompt para treinamento de IA <span className="text-gray-400">(opcional)</span>
            </label>
            <TextAreaField
              name="aiTrainingPrompt"
              placeholder="Ex: Curso online para iniciantes em Python. Público-alvo: estudantes e profissionais que buscam nova carreira."
              value={formData.aiTrainingPrompt ?? ''}
              rows={2}
              maxLength={VALIDATION_RULES.product.aiPrompt.maxLength}
              onChange={(e) => handleChange('aiTrainingPrompt', e.target.value)}
              hasError={!!errors.aiTrainingPrompt}
              errorMessage={errors.aiTrainingPrompt}
            />
          </div>
        </div>

        {/* Coluna Direita - Uploads */}
        <div className="space-y-3">
          {/* Card de Uploads */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
            <div className="mb-3">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Arquivos do Produto
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Faça upload da imagem de capa e do arquivo digital do seu produto
              </p>
            </div>

            <div className="space-y-3">
              {/* Upload de Imagem do Produto */}
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <FileUploadField
                  label="Imagem do produto"
                  accept=".png,.jpg,.jpeg,.gif,.webp"
                  maxSize={10 * 1024 * 1024}
                  file={imageUpload.file}
                  preview={imageUpload.preview}
                  error={imageUpload.error || errors.imageFile}
                  currentFileUrl={initialProduct?.imageUrl}
                  helpText="PNG, JPG ou até 10MB"
                  onFileSelect={imageUpload.selectFile}
                  onFileRemove={imageUpload.removeFile}
                />
              </div>

              {/* Upload do Produto */}
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <FileUploadField
                  label="Upload do produto"
                  accept=".pdf,.zip,.epub,.mp4,.mp3"
                  maxSize={500 * 1024 * 1024}
                  required={isCreate}
                  file={productFileUpload.file}
                  error={productFileUpload.error || errors.productFile}
                  currentFileUrl={initialProduct?.productUrl}
                  helpText="PDF, ZIP, etc. até 500MB"
                  onFileSelect={productFileUpload.selectFile}
                  onFileRemove={productFileUpload.removeFile}
                />
              </div>
            </div>

            {/* Dicas de Upload */}
            <div className="mt-3 bg-blue-100 rounded-md p-2.5">
              <p className="text-xs text-blue-800 font-medium flex items-start gap-2">
                <svg
                  className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  A imagem será exibida na página de vendas. O arquivo do produto será entregue ao
                  comprador após a confirmação do pagamento.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Botões de Ação - Full Width */}
        <div className="lg:col-span-2 flex items-center justify-end gap-4 pt-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#6f43d0] to-[#6fdcff] rounded-xl hover:scale-[1.02] hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isSubmitting ? 'Salvando...' : submitButtonText}
          </button>
        </div>
      </form>

      {/* Modal de Link de Checkout */}
      {createdProduct && (
        <CheckoutLinkModal
          product={createdProduct}
          checkoutUrl={`${process.env.NEXT_PUBLIC_CHECKOUT_URL}?hash=${createdProduct.productHash}`}
          isOpen={showCheckoutModal}
          onClose={handleCloseModal}
          mode={mode === 'create' ? 'create' : 'update'}
          hashChanged={!isCreate && initialProduct?.productHash !== createdProduct.productHash}
        />
      )}
    </div>
  );
}
