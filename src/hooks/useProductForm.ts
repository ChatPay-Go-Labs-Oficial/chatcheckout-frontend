import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/productService';
import { Product, ProductFormData, Currency, CreateProductDTO } from '@/types/product';
import { useFileUpload } from './useFileUpload';
import { FILE_VALIDATIONS } from '@/types/product';
import {
  validateProductName,
  validateProductDescription,
  validateProductPrice,
  validateCurrency,
  validateUrl,
  validateAiPrompt,
  validateProductFile,
} from '@/utils/validations';

/**
 * Modo de operação do formulário
 */
export type FormMode = 'create' | 'edit';

/**
 * Erros de validação do formulário
 */
export interface FormErrors {
  name?: string;
  description?: string;
  price?: string;
  currency?: string;
  salesPageUrl?: string;
  aiTrainingPrompt?: string;
  imageFile?: string;
  productFile?: string;
}

/**
 * Hook customizado para gerenciar formulário de produto
 * Responsável por validação, submissão e integração com uploads
 * Utiliza TanStack Query para mutations
 *
 * @param mode - Modo de operação (create ou edit)
 * @param initialProduct - Produto inicial para edição
 * @param onSuccess - Callback executado após sucesso
 * @returns Estado e métodos para gerenciar o formulário
 */
export function useProductForm(
  mode: FormMode,
  initialProduct?: Product,
  onSuccess?: (product: Product) => void,
) {
  const queryClient = useQueryClient();

  // Estado do formulário
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialProduct?.name || '',
    description: initialProduct?.description || '',
    price: initialProduct?.price.toString() || '',
    currency: (initialProduct?.currency as Currency) || Currency.BRL,
    salesPageUrl: initialProduct?.salesPageUrl || '',
    aiTrainingPrompt: initialProduct?.promptAi || '',
    imageFile: null,
    productFile: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Hooks de upload
  const imageUpload = useFileUpload('image', FILE_VALIDATIONS.image);
  const productFileUpload = useFileUpload('product', FILE_VALIDATIONS.product);

  // Mutation para criar produto
  const createMutation = useMutation({
    mutationFn: async (data: {
      productData: CreateProductDTO;
      imageFile?: File;
      productFile?: File;
    }) => productService.createProduct(data.productData, data.imageFile, data.productFile),
    onSuccess: (savedProduct) => {
      // Invalidar lista de produtos usando prefix pattern para garantir que todas as queries ['products', userId] sejam invalidadas
      queryClient.invalidateQueries({ queryKey: ['products'], exact: false });
      if (onSuccess) onSuccess(savedProduct);
    },
  });

  // Mutation para atualizar produto
  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; productData: Partial<CreateProductDTO>; imageFile?: File }) =>
      productService.updateProduct(data.id, data.productData, data.imageFile),
    onSuccess: (savedProduct) => {
      // Invalidar lista de produtos usando prefix pattern para garantir que todas as queries ['products', userId] sejam invalidadas
      queryClient.invalidateQueries({ queryKey: ['products'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['product', savedProduct.id] });
      if (onSuccess) onSuccess(savedProduct);
    },
  });

  /**
   * Valida um campo específico usando os validadores centralizados
   */
  const validateField = useCallback(
    (field: keyof ProductFormData, value: string): string | undefined => {
      let validationError = null;

      switch (field) {
        case 'name':
          validationError = validateProductName(value);
          break;

        case 'description':
          validationError = validateProductDescription(value);
          break;

        case 'price':
          validationError = validateProductPrice(value);
          break;

        case 'currency':
          validationError = validateCurrency(value);
          break;

        case 'salesPageUrl':
          validationError = validateUrl(value, 'Link da página de vendas');
          break;

        case 'aiTrainingPrompt':
          validationError = validateAiPrompt(value);
          break;

        default:
          return undefined;
      }

      return validationError?.message;
    },
    [],
  );

  /**
   * Valida todo o formulário usando os validadores centralizados
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Validar campos de texto usando validadores
    const nameError = validateProductName(formData.name);
    if (nameError) newErrors.name = nameError.message;

    const descError = validateProductDescription(formData.description);
    if (descError) newErrors.description = descError.message;

    const priceError = validateProductPrice(formData.price);
    if (priceError) newErrors.price = priceError.message;

    const currencyError = validateCurrency(formData.currency);
    if (currencyError) newErrors.currency = currencyError.message;

    const urlError = validateUrl(formData.salesPageUrl, 'Link da página de vendas');
    if (urlError) newErrors.salesPageUrl = urlError.message;

    const promptError = validateAiPrompt(formData.aiTrainingPrompt);
    if (promptError) newErrors.aiTrainingPrompt = promptError.message;

    // Validar arquivo do produto (obrigatório apenas na criação)
    const productFileError = validateProductFile(productFileUpload.file, mode === 'create');
    if (productFileError) newErrors.productFile = productFileError.message;

    // Validar erros de upload
    if (imageUpload.error) {
      newErrors.imageFile = imageUpload.error;
    }

    if (productFileUpload.error) {
      newErrors.productFile = productFileUpload.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, mode, imageUpload.error, productFileUpload.error, productFileUpload.file]);

  /**
   * Atualiza campo do formulário
   */
  const handleChange = useCallback((field: keyof ProductFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpar erro do campo ao digitar
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  }, []);

  /**
   * Submete o formulário
   */
  const handleSubmit = useCallback(async (): Promise<Product | null> => {
    setSubmitError(null);

    // Validar formulário
    if (!validateForm()) {
      return null;
    }

    try {
      // Preparar dados para envio (nomes dos campos devem corresponder ao DTO do backend)
      const productData: CreateProductDTO = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        currency: formData.currency as Currency,
        salesPageUrl: formData.salesPageUrl.trim(),
        promptAi: formData.aiTrainingPrompt?.trim() || '',
      };

      let savedProduct: Product;

      if (mode === 'create') {
        // Criar produto usando mutation
        savedProduct = await createMutation.mutateAsync({
          productData,
          imageFile: imageUpload.file || undefined,
          productFile: productFileUpload.file || undefined,
        });
      } else {
        if (!initialProduct?.id) {
          throw new Error('ID do produto não encontrado');
        }
        // Atualizar produto usando mutation
        savedProduct = await updateMutation.mutateAsync({
          id: initialProduct.id,
          productData: {
            name: productData.name,
            description: productData.description,
            price: productData.price,
            currency: productData.currency,
            salesPageUrl: productData.salesPageUrl,
            promptAi: productData.promptAi,
          },
          imageFile: imageUpload.file || undefined,
        });
      }

      return savedProduct;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar produto';
      setSubmitError(errorMessage);
      return null;
    }
  }, [
    formData,
    mode,
    initialProduct,
    imageUpload.file,
    productFileUpload.file,
    validateForm,
    createMutation,
    updateMutation,
    onSuccess,
  ]);

  /**
   * Reseta o formulário
   */
  const reset = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      price: '',
      currency: Currency.BRL,
      salesPageUrl: '',
      aiTrainingPrompt: '',
      imageFile: null,
      productFile: null,
    });
    setErrors({});
    setSubmitError(null);
    imageUpload.reset();
    productFileUpload.reset();
  }, [imageUpload, productFileUpload]);

  /**
   * Carrega dados de um produto para edição
   */
  const loadProduct = useCallback((product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      currency: product.currency,
      salesPageUrl: product.salesPageUrl || '',
      aiTrainingPrompt: product.promptAi,
      imageFile: null,
      productFile: null,
    });
    setErrors({});
    setSubmitError(null);
  }, []);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return {
    formData,
    errors,
    isSubmitting,
    submitError,
    imageUpload,
    productFileUpload,
    handleChange,
    validateField,
    validateForm,
    handleSubmit,
    reset,
    loadProduct,
  };
}
