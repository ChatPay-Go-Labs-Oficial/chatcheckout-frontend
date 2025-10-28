/**
 * Tipos genéricos para validação de formulários
 * Pode ser usado em qualquer formulário da aplicação
 */
export type ValidationError = {
  field: string;
  message: string;
};

/**
 * Tipos para inputs formatados (máscaras)
 * Usado para CPF, CNPJ, telefone, etc.
 */
export type FormattedInput = {
  value: string;
  formattedValue: string;
  isValid: boolean;
};

/**
 * Tipo genérico para mapear campos de formulário com suas possíveis chaves de erro
 */
export type FieldMapping = {
  [fieldName: string]: string[];
};

/**
 * Função de validação genérica para formulários
 */
export type ValidatorFunction<T> = (
  fieldName: keyof T,
  value: string,
  formData: T,
) => ValidationError | null;
