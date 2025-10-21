import { useCallback } from 'react';
import { formatCPF, formatCNPJ } from '@/utils/validations/formatters';

/**
 * Hook para gerenciar formatação de documentos (CPF/CNPJ)
 * Centraliza a lógica de formatação e limitação de caracteres
 */
export function useDocumentFormatter() {
  /**
   * Manipula mudanças no campo CPF com formatação e limitação
   */
  const handleCPFChange = useCallback(
    (value: string, onChange: (formattedValue: string) => void) => {
      const cleanValue = value.replace(/\D/g, '');

      // Limitar a 11 dígitos para CPF
      if (cleanValue.length <= 11) {
        const formattedValue = formatCPF(value);
        onChange(formattedValue);
      }
    },
    [],
  );

  /**
   * Manipula mudanças no campo CNPJ com formatação
   */
  const handleCNPJChange = useCallback(
    (value: string, onChange: (formattedValue: string) => void) => {
      const formattedValue = formatCNPJ(value);
      onChange(formattedValue);
    },
    [],
  );

  return {
    handleCPFChange,
    handleCNPJChange,
  };
}
