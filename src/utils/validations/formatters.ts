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

/**
 * Formata um valor numérico como moeda brasileira (BRL)
 * @param value - Valor numérico a ser formatado
 * @returns String formatada como moeda brasileira (ex: "R$ 1.234,56")
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata um valor numérico como moeda brasileira compacta
 * Usa sufixos K (mil), M (milhões) para valores grandes
 * @param value - Valor numérico a ser formatado
 * @returns String formatada de forma compacta (ex: "R$ 1,2K", "R$ 1,5M")
 */
export function formatCurrencyCompact(value: number): string {
  const absValue = Math.abs(value);

  if (absValue >= 1_000_000) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 1_000_000).replace('R$', 'R$ ') + 'M';
  }

  if (absValue >= 1_000) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 1_000).replace('R$', 'R$ ') + 'K';
  }

  return formatCurrency(value);
}

/**
 * Resultado da formatação de tendência
 */
export interface TrendFormatResult {
  icon: string;
  color: string;
  text: string;
  isPositive: boolean;
}

/**
 * Formata uma tendência percentual com ícone e cores apropriadas
 * @param percentage - Variação percentual (positiva ou negativa)
 * @param inverse - Inverte a lógica (true = negativo é bom, ex: custos)
 * @returns Objeto com ícone, cor e texto formatados
 */
export function formatTrend(percentage: number, inverse = false): TrendFormatResult {
  const isPositive = percentage > 0;
  const isNeutral = percentage === 0;
  const absPercentage = Math.abs(percentage);

  // Formata o texto do percentual
  const text = `${isPositive ? '+' : ''}${absPercentage.toFixed(1)}%`;

  if (isNeutral) {
    return {
      icon: '—',
      color: 'text-gray-500',
      text,
      isPositive: true,
    };
  }

  // Se inverse=true, negativo é bom (ex: redução de custos)
  const isGood = inverse ? !isPositive : isPositive;

  if (isGood) {
    return {
      icon: '↑',
      color: 'text-green-500',
      text,
      isPositive: true,
    };
  }

  return {
    icon: '↓',
    color: 'text-red-500',
    text,
    isPositive: false,
  };
}
