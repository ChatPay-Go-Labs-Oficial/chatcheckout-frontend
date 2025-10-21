/**
 * Utilitários para formatação de documentos brasileiros
 * Responsabilidade única: formatação e sanitização
 */

/**
 * Remove formatação mantendo apenas números
 */
export function sanitizeDocument(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Aplica máscara de CPF (000.000.000-00)
 */
export function formatCPF(value: string): string {
  const clean = sanitizeDocument(value);
  const limited = clean.slice(0, 11);

  if (limited.length <= 3) return limited;
  if (limited.length <= 6) return limited.replace(/(\d{3})(\d+)/, '$1.$2');
  if (limited.length <= 9) return limited.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
  return limited.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
}

/**
 * Aplica máscara de CNPJ (00.000.000/0000-00)
 */
export function formatCNPJ(value: string): string {
  const clean = sanitizeDocument(value);
  const limited = clean.slice(0, 14);

  if (limited.length <= 2) return limited;
  if (limited.length <= 5) return limited.replace(/(\d{2})(\d+)/, '$1.$2');
  if (limited.length <= 8) return limited.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
  if (limited.length <= 12) return limited.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
  return limited.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d+)/, '$1.$2.$3/$4-$5');
}

/**
 * Detecta automaticamente o tipo de documento e aplica a formatação adequada
 */
export function formatDocument(value: string): string {
  const clean = sanitizeDocument(value);

  if (clean.length <= 11) {
    return formatCPF(value);
  }

  return formatCNPJ(value);
}
