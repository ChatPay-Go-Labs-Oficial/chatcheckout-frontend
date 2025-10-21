import { useState, useCallback } from 'react';
import { UserRole } from '@/types/user';
import { ValidationError } from '@/types/validation';
import {
  validateName,
  validateEmail,
  validateCPF,
  validatePassword,
  validatePasswordConfirmation,
  validateCompanyName,
  validateCNPJ,
  validateRegistrationForm,
} from '@/utils/validations';
import { useFormValidation } from './useFormValidation';

export interface RegisterFormData extends Record<string, unknown> {
  firstName: string;
  lastName: string;
  email: string;
  cpf: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  companyName: string;
  cnpj: string;
}

const INITIAL_FORM_STATE: RegisterFormData = {
  firstName: '',
  lastName: '',
  email: '',
  cpf: '',
  password: '',
  confirmPassword: '',
  role: UserRole.Infoproducer,
  companyName: '',
  cnpj: '',
};

const FIELD_MAPPINGS = {
  firstName: ['nome'],
  lastName: ['sobrenome'],
  email: ['e-mail'],
  password: ['senha'],
  confirmPassword: ['confirmaçãodesenha'],
  companyName: ['nomedaempresa', 'companyname'],
};

/**
 * Validador específico para o formulário de registro
 */
function validateField(
  fieldName: keyof RegisterFormData,
  value: string,
  formData: RegisterFormData,
): ValidationError | null {
  switch (fieldName) {
    case 'firstName':
      return validateName(value, 'Nome');
    case 'lastName':
      return validateName(value, 'Sobrenome');
    case 'email':
      return validateEmail(value);
    case 'cpf':
      return validateCPF(value);
    case 'password':
      return validatePassword(value);
    case 'confirmPassword':
      return validatePasswordConfirmation(formData.password, value);
    case 'companyName':
      return validateCompanyName(value);
    case 'cnpj':
      return validateCNPJ(value);
    default:
      return null;
  }
}

/**
 * Hook personalizado para gerenciar o formulário de registro
 * Centraliza toda a lógica de estado, validação e formatação
 */
export function useRegisterForm() {
  const [form, setForm] = useState<RegisterFormData>(INITIAL_FORM_STATE);

  const {
    validationErrors,
    updateFieldValidation,
    hasFieldError,
    getFieldError,
    clearValidationErrors,
    setErrors,
  } = useFormValidation<RegisterFormData>({
    validator: validateField,
    fieldMappings: FIELD_MAPPINGS,
  });

  /**
   * Atualiza um campo do formulário
   */
  const updateField = useCallback(
    (fieldName: keyof RegisterFormData, value: string) => {
      const updatedForm = { ...form, [fieldName]: value };
      setForm(updatedForm);
      return updatedForm;
    },
    [form],
  );

  /**
   * Manipula mudanças em campos com validação em tempo real
   */
  const handleFieldChange = useCallback(
    (fieldName: keyof RegisterFormData, value: string) => {
      const updatedForm = updateField(fieldName, value);

      // Verifica se o campo já tem erro para validar em tempo real
      const hasError = hasFieldError(String(fieldName));

      if (hasError || value.trim() !== '') {
        updateFieldValidation(fieldName, value, updatedForm);

        // Revalida campos relacionados (senha e confirmação)
        if (fieldName === 'password' && updatedForm.confirmPassword) {
          updateFieldValidation('confirmPassword', updatedForm.confirmPassword, updatedForm);
        }
        if (fieldName === 'confirmPassword') {
          updateFieldValidation('password', updatedForm.password, updatedForm);
        }
      }
    },
    [updateField, hasFieldError, updateFieldValidation],
  );

  /**
   * Manipula blur (saída do campo) - sempre valida
   */
  const handleFieldBlur = useCallback(
    (fieldName: keyof RegisterFormData, value: string) => {
      const updatedForm = { ...form, [fieldName]: value };
      updateFieldValidation(fieldName, value, updatedForm);
    },
    [form, updateFieldValidation],
  );

  /**
   * Valida todo o formulário
   */
  const validateForm = useCallback((): boolean => {
    const errors = validateRegistrationForm(form);
    setErrors(errors);
    return errors.length === 0;
  }, [form, setErrors]);

  /**
   * Reseta o formulário
   */
  const resetForm = useCallback(() => {
    setForm(INITIAL_FORM_STATE);
    clearValidationErrors();
  }, [clearValidationErrors]);

  return {
    // Estado do formulário
    form,
    validationErrors,

    // Funções de manipulação
    updateField,
    handleFieldChange,
    handleFieldBlur,

    // Funções de validação
    validateForm,
    hasFieldError,
    getFieldError,

    // Utilitários
    resetForm,
    clearValidationErrors,
  };
}
