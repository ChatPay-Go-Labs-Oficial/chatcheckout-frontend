import { ValidationError } from '@/types/validation';
import {
  validateName,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateCompanyName,
} from './field-validators';
import { validateCPF, validateCNPJ } from './document-validators';

/**
 * Regras de negócio específicas
 */
export function validateBusinessRules(cnpj: string, companyName: string): ValidationError | null {
  if (cnpj?.trim() && !companyName?.trim()) {
    return {
      field: 'companyName',
      message: 'Quando informado o CNPJ, o nome da empresa é obrigatório',
    };
  }
  return null;
}

/**
 * Validador composável para formulário de registro
 * Agora é reutilizável para outros formulários similares
 */
export function validateRegistrationForm(form: {
  firstName: string;
  lastName: string;
  email: string;
  cpf: string;
  password: string;
  confirmPassword: string;
  companyName?: string;
  cnpj?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validações obrigatórias - usando composição
  const validators = [
    () => validateName(form.firstName, 'Nome'),
    () => validateName(form.lastName, 'Sobrenome'),
    () => validateEmail(form.email),
    () => validateCPF(form.cpf),
    () => validatePassword(form.password),
    () => validatePasswordConfirmation(form.password, form.confirmPassword),
  ];

  validators.forEach((validator) => {
    const error = validator();
    if (error) errors.push(error);
  });

  // Validações opcionais
  if (form.companyName?.trim()) {
    const companyError = validateCompanyName(form.companyName);
    if (companyError) errors.push(companyError);
  }

  if (form.cnpj?.trim()) {
    const cnpjError = validateCNPJ(form.cnpj);
    if (cnpjError) errors.push(cnpjError);
  }

  // Regras de negócio
  const businessError = validateBusinessRules(form.cnpj || '', form.companyName || '');
  if (businessError) errors.push(businessError);

  return errors;
}

/**
 * Utilitários para trabalhar com erros
 */
export function getFieldError(errors: ValidationError[], fieldName: string): string | null {
  return errors.find((err) => err.field === fieldName)?.message || null;
}

export function hasFieldError(errors: ValidationError[], fieldName: string): boolean {
  return errors.some((err) => err.field === fieldName);
}
