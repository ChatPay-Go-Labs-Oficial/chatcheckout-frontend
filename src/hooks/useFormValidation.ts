import { useState, useCallback } from 'react';
import { ValidationError, FieldMapping, ValidatorFunction } from '@/types/validation';

interface UseFormValidationProps<T> {
  validator: ValidatorFunction<T>;
  fieldMappings: FieldMapping;
}

/**
 * Hook personalizado para gerenciar validação de formulários com mapeamento de campos
 *
 * @param validator - Função que valida um campo específico
 * @param fieldMappings - Mapeamento de nomes de campos para possíveis chaves de erro
 * @returns Funções e estado para gerenciar validações
 */
export function useFormValidation<T extends Record<string, unknown>>({
  validator,
  fieldMappings,
}: UseFormValidationProps<T>) {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  /**
   * Obtém todas as possíveis chaves de erro para um campo
   */
  const getFieldKeys = useCallback(
    (fieldName: string): string[] => {
      const baseKey = fieldName.toLowerCase().replace(/\s+/g, '');
      const mappedKeys = fieldMappings[fieldName] || [];
      return [baseKey, ...mappedKeys];
    },
    [fieldMappings],
  );

  /**
   * Atualiza a validação de um campo específico
   */
  const updateFieldValidation = useCallback(
    (fieldName: keyof T, value: string, formData: T) => {
      const fieldError = validator(fieldName, value, formData);
      const fieldKeys = getFieldKeys(String(fieldName));

      setValidationErrors((prev) => {
        // Remove todos os erros relacionados a este campo
        const filtered = prev.filter((error) => !fieldKeys.includes(error.field));

        // Adiciona novo erro se houver
        if (fieldError) {
          return [...filtered, fieldError];
        }

        return filtered;
      });
    },
    [validator, getFieldKeys],
  );

  /**
   * Verifica se um campo tem erro
   */
  const hasFieldError = useCallback(
    (fieldName: string): boolean => {
      const fieldKeys = getFieldKeys(fieldName);
      return validationErrors.some((error) => fieldKeys.includes(error.field));
    },
    [validationErrors, getFieldKeys],
  );

  /**
   * Obtém a mensagem de erro de um campo
   */
  const getFieldError = useCallback(
    (fieldName: string): string | null => {
      const fieldKeys = getFieldKeys(fieldName);
      const error = validationErrors.find((err) => fieldKeys.includes(err.field));
      return error?.message || null;
    },
    [validationErrors, getFieldKeys],
  );

  /**
   * Limpa todos os erros de validação
   */
  const clearValidationErrors = useCallback(() => {
    setValidationErrors([]);
  }, []);

  /**
   * Define erros de validação (usado para validação completa do formulário)
   */
  const setErrors = useCallback((errors: ValidationError[]) => {
    setValidationErrors(errors);
  }, []);

  return {
    validationErrors,
    updateFieldValidation,
    hasFieldError,
    getFieldError,
    clearValidationErrors,
    setErrors,
  };
}
