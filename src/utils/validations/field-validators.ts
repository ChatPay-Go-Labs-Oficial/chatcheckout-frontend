import { ValidationError } from '@/types/validation';
import { VALIDATION_RULES } from './validation-rules';
import { isValidCPF, isValidCNPJ } from './document-validators';
import { sanitizeDocument } from './formatters';

/**
 * Validadores básicos reutilizáveis
 * Responsabilidade única: validações básicas de campo
 */

export function validateRequired(value: string, fieldName: string): ValidationError | null {
  if (!value?.trim()) {
    return {
      field: fieldName.toLowerCase().replace(/\s+/g, ''),
      message: `${fieldName} é obrigatório`,
    };
  }
  return null;
}

export function validateEmail(email: string): ValidationError | null {
  if (!email) return validateRequired(email, 'E-mail');

  if (!VALIDATION_RULES.email.pattern.test(email)) {
    return { field: 'e-mail', message: VALIDATION_RULES.email.message };
  }

  return null;
}

export function validatePassword(password: string): ValidationError | null {
  if (!password) return validateRequired(password, 'Senha');

  if (password.length < VALIDATION_RULES.password.minLength) {
    return {
      field: 'senha',
      message: `Senha deve ter no mínimo ${VALIDATION_RULES.password.minLength} caracteres`,
    };
  }

  if (!VALIDATION_RULES.password.pattern.test(password)) {
    return { field: 'senha', message: VALIDATION_RULES.password.message };
  }

  return null;
}

export function validatePasswordConfirmation(
  password: string,
  confirmPassword: string,
): ValidationError | null {
  if (!confirmPassword) return validateRequired(confirmPassword, 'Confirmação de senha');

  if (password !== confirmPassword) {
    return { field: 'confirmaçãodesenha', message: 'As senhas não coincidem' };
  }

  return null;
}

export function validateName(name: string, fieldName: string): ValidationError | null {
  if (!name) return validateRequired(name, fieldName);

  if (name.length > VALIDATION_RULES.name.maxLength) {
    return {
      field: fieldName.toLowerCase().replace(/\s+/g, ''),
      message: `${fieldName} ${VALIDATION_RULES.name.message}`,
    };
  }

  return null;
}

export function validateCompanyName(companyName: string): ValidationError | null {
  if (!companyName?.trim()) return null; // Opcional

  if (companyName.length > VALIDATION_RULES.companyName.maxLength) {
    return { field: 'companyName', message: VALIDATION_RULES.companyName.message };
  }

  return null;
}

/**
 * Valida um identificador que pode ser email, CPF ou CNPJ
 * Retorna o identificador limpo se válido ou null se inválido
 */
export function validateIdentifier(identifier: string): { isValid: boolean; value: string } {
  if (!validateEmail(identifier)) {
    return { isValid: true, value: identifier };
  }

  const clean = sanitizeDocument(identifier);

  if (isValidCPF(clean)) {
    return { isValid: true, value: clean };
  }

  if (isValidCNPJ(clean)) {
    return { isValid: true, value: clean };
  }

  return { isValid: false, value: identifier };
}
