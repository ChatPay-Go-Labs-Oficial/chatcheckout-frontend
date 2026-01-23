import { ValidationError } from '@/types/validation';
import { VALIDATION_RULES } from './validation-rules';
import { validateRequired } from './field-validators';
import { Currency } from '@/types/product';

/**
 * Validadores específicos para produtos
 * Responsabilidade única: validações de campos de produto
 */

/**
 * Valida o nome do produto
 */
export function validateProductName(name: string): ValidationError | null {
  const requiredError = validateRequired(name, 'Nome do produto');
  if (requiredError) return requiredError;

  const trimmedName = name.trim();

  if (trimmedName.length < VALIDATION_RULES.product.name.minLength) {
    return {
      field: 'name',
      message: `Nome deve ter pelo menos ${VALIDATION_RULES.product.name.minLength} caracteres`,
    };
  }

  if (trimmedName.length > VALIDATION_RULES.product.name.maxLength) {
    return {
      field: 'name',
      message: `Nome deve ter no máximo ${VALIDATION_RULES.product.name.maxLength} caracteres`,
    };
  }

  return null;
}

/**
 * Valida a descrição do produto
 */
export function validateProductDescription(description: string): ValidationError | null {
  const requiredError = validateRequired(description, 'Descrição');
  if (requiredError) return requiredError;

  const trimmedDescription = description.trim();

  if (trimmedDescription.length < VALIDATION_RULES.product.description.minLength) {
    return {
      field: 'description',
      message: `Descrição deve ter pelo menos ${VALIDATION_RULES.product.description.minLength} caracteres`,
    };
  }

  if (trimmedDescription.length > VALIDATION_RULES.product.description.maxLength) {
    return {
      field: 'description',
      message: `Descrição deve ter no máximo ${VALIDATION_RULES.product.description.maxLength} caracteres`,
    };
  }

  return null;
}

/**
 * Valida o preço do produto
 */
export function validateProductPrice(price: string): ValidationError | null {
  const requiredError = validateRequired(price, 'Valor');
  if (requiredError) return requiredError;

  const priceNum = parseFloat(price);

  if (isNaN(priceNum)) {
    return {
      field: 'price',
      message: 'Valor deve ser um número válido',
    };
  }

  if (priceNum < VALIDATION_RULES.product.price.min) {
    return {
      field: 'price',
      message: 'Valor deve ser maior que zero',
    };
  }

  if (priceNum > VALIDATION_RULES.product.price.max) {
    return {
      field: 'price',
      message: 'Valor muito alto',
    };
  }

  return null;
}

/**
 * Valida a moeda selecionada
 */
export function validateCurrency(currency: string): ValidationError | null {
  const requiredError = validateRequired(currency, 'Moeda');
  if (requiredError) return requiredError;

  if (!Object.values(Currency).includes(currency as Currency)) {
    return {
      field: 'currency',
      message: 'Moeda inválida',
    };
  }

  return null;
}

/**
 * Valida uma URL (opcional)
 */
export function validateUrl(url: string, fieldName = 'URL'): ValidationError | null {
  // URL é opcional
  if (!url || !url.trim()) {
    return null;
  }

  if (!VALIDATION_RULES.product.url.pattern.test(url)) {
    return {
      field: fieldName.toLowerCase().replace(/\s+/g, ''),
      message: VALIDATION_RULES.product.url.message,
    };
  }

  // Validação adicional para garantir que é uma URL válida
  try {
    const urlObj = new URL(url);
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return {
        field: fieldName.toLowerCase().replace(/\s+/g, ''),
        message: 'URL deve usar protocolo HTTP ou HTTPS',
      };
    }
  } catch {
    return {
      field: fieldName.toLowerCase().replace(/\s+/g, ''),
      message: 'URL inválida',
    };
  }

  return null;
}

/**
 * Valida o prompt de treinamento de IA (opcional)
 */
export function validateAiPrompt(prompt: string | null | undefined): ValidationError | null {
  // Prompt é opcional
  if (!prompt || !prompt.trim()) {
    return null;
  }

  const trimmedPrompt = prompt.trim();

  if (trimmedPrompt.length < VALIDATION_RULES.product.aiPrompt.minLength) {
    return {
      field: 'aiTrainingPrompt',
      message: `Prompt deve ter pelo menos ${VALIDATION_RULES.product.aiPrompt.minLength} caracteres`,
    };
  }

  if (trimmedPrompt.length > VALIDATION_RULES.product.aiPrompt.maxLength) {
    return {
      field: 'aiTrainingPrompt',
      message: `Prompt deve ter no máximo ${VALIDATION_RULES.product.aiPrompt.maxLength} caracteres`,
    };
  }

  return null;
}

/**
 * Valida arquivo de upload (apenas se selecionado)
 */
export function validateProductFile(
  file: File | null,
  isRequired: boolean,
): ValidationError | null {
  if (isRequired && !file) {
    return {
      field: 'productFile',
      message: 'Arquivo do produto é obrigatório',
    };
  }

  return null;
}
