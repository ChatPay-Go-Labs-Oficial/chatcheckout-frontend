import { ValidationError } from '@/types/validation';
import { sanitizeDocument } from './formatters';

/**
 * Valida se um CPF é válido usando algoritmo de dígito verificador
 */
export function isValidCPF(cpf: string): boolean {
  const clean = sanitizeDocument(cpf);

  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;

  // Primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean[i]) * (10 - i);
  }
  let firstDigit = 11 - (sum % 11);
  if (firstDigit >= 10) firstDigit = 0;

  // Segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean[i]) * (11 - i);
  }
  let secondDigit = 11 - (sum % 11);
  if (secondDigit >= 10) secondDigit = 0;

  return parseInt(clean[9]) === firstDigit && parseInt(clean[10]) === secondDigit;
}

/**
 * Valida se um CNPJ é válido usando algoritmo de dígito verificador
 */
export function isValidCNPJ(cnpj: string): boolean {
  const clean = sanitizeDocument(cnpj);

  if (clean.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(clean)) return false;

  // Primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(clean[i]) * weights1[i];
  }
  let firstDigit = 11 - (sum % 11);
  if (firstDigit >= 10) firstDigit = 0;

  // Segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(clean[i]) * weights2[i];
  }
  let secondDigit = 11 - (sum % 11);
  if (secondDigit >= 10) secondDigit = 0;

  return parseInt(clean[12]) === firstDigit && parseInt(clean[13]) === secondDigit;
}

/**
 * Valida CPF
 */
export function validateCPF(cpf: string): ValidationError | null {
  if (!cpf?.trim()) {
    return { field: 'cpf', message: 'CPF é obrigatório' };
  }

  const clean = sanitizeDocument(cpf);
  if (clean.length !== 11) {
    return { field: 'cpf', message: 'CPF deve conter exatamente 11 dígitos numéricos' };
  }

  if (!isValidCPF(clean)) {
    return { field: 'cpf', message: 'CPF inválido' };
  }

  return null;
}

/**
 * Valida CNPJ
 */
export function validateCNPJ(cnpj: string): ValidationError | null {
  if (!cnpj?.trim()) return null; // Opcional

  const clean = sanitizeDocument(cnpj);
  if (clean.length !== 14) {
    return { field: 'cnpj', message: 'CNPJ deve conter exatamente 14 dígitos numéricos' };
  }

  if (!isValidCNPJ(clean)) {
    return { field: 'cnpj', message: 'CNPJ inválido' };
  }

  return null;
}
