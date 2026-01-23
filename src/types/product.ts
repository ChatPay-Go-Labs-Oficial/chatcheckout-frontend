/**
 * Enumeração de moedas suportadas pelo sistema
 * Sincronizado com backend: BRL, XLM, USDC
 */
export enum Currency {
  BRL = 'BRL',
  XLM = 'XLM',
  USDC = 'USDC',
}

/**
 * Interface do produto retornado pela API
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number | string; // Backend pode retornar como string ou number
  currency: Currency;
  salesPageUrl: string;
  promptAi: string;
  imageUrl?: string;
  productUrl: string;
  productHash: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO para criação de produto
 * Campos enviados via FormData junto com files productFile e productImage
 */
export interface CreateProductDTO {
  name: string;
  description: string;
  price: number;
  currency: Currency;
  salesPageUrl: string;
  promptAi: string;
}

/**
 * DTO para atualização de produto (todos os campos opcionais)
 */
export interface UpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  currency?: Currency;
  salesPageUrl?: string;
  promptAi?: string;
}

/**
 * Estado do formulário de produto
 */
export interface ProductFormData {
  name: string;
  description: string;
  price: string; // string no form, convertido para number no submit
  currency: Currency | '';
  salesPageUrl: string;
  aiTrainingPrompt?: string;
  imageFile: File | null;
  productFile: File | null;
}

/**
 * Resposta padrão dos endpoints de upload
 */
export interface UploadResponse {
  url: string;
}

/**
 * Validações de arquivos
 */
export const FILE_VALIDATIONS = {
  image: {
    maxSize: 10 * 1024 * 1024, // 10MB
    acceptedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
    acceptedExtensions: ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
  },
  product: {
    maxSize: 500 * 1024 * 1024, // 500MB
    acceptedTypes: [
      'application/pdf',
      'application/zip',
      'application/epub+zip',
      'video/mp4',
      'audio/mpeg',
    ],
    acceptedExtensions: ['.pdf', '.zip', '.epub', '.mp4', '.mp3'],
  },
} as const;

/**
 * Labels das moedas para exibição
 */
export const CURRENCY_LABELS: Record<Currency, string> = {
  [Currency.BRL]: 'Real Brasileiro (BRL)',
  [Currency.USDC]: 'USD Coin (USDC)',
  [Currency.XLM]: 'Stellar Lumens (XLM)',
};
