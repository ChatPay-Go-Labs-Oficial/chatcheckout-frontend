/**
 * Índice central das validações
 * Fornece uma API limpa e organizada
 */

// Formatadores
export { sanitizeDocument, formatCPF, formatCNPJ, formatDocument } from './formatters';

// Regras de validação
export { VALIDATION_RULES } from './validation-rules';

// Validadores de documentos
export { isValidCPF, isValidCNPJ, validateCPF, validateCNPJ } from './document-validators';

// Validadores de campo
export {
  validateRequired,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateName,
  validateCompanyName,
  validateIdentifier,
} from './field-validators';

// Validadores de formulário
export {
  validateBusinessRules,
  validateRegistrationForm,
  getFieldError,
  hasFieldError,
} from './form-validators';
