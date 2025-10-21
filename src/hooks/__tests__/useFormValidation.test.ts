import { renderHook, act } from '@testing-library/react';
import { useFormValidation } from '../useFormValidation';
import { ValidationError } from '@/types/validation';

// Mock validator function for testing
const mockValidator = jest.fn();

const mockFieldMappings = {
  firstName: ['nome'],
  email: ['e-mail'],
  password: ['senha'],
};

describe('useFormValidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve inicializar com estado vazio', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        validator: mockValidator,
        fieldMappings: mockFieldMappings,
      }),
    );

    expect(result.current.validationErrors).toEqual([]);
  });

  it('deve adicionar erro quando validação falha', () => {
    const mockError: ValidationError = { field: 'nome', message: 'Nome é obrigatório' };
    mockValidator.mockReturnValue(mockError);

    const { result } = renderHook(() =>
      useFormValidation({
        validator: mockValidator,
        fieldMappings: mockFieldMappings,
      }),
    );

    act(() => {
      result.current.updateFieldValidation('firstName', '', {});
    });

    expect(result.current.validationErrors).toContain(mockError);
    expect(result.current.hasFieldError('firstName')).toBe(true);
    expect(result.current.getFieldError('firstName')).toBe('Nome é obrigatório');
  });

  it('deve remover erro quando validação passa', () => {
    const mockError: ValidationError = { field: 'nome', message: 'Nome é obrigatório' };
    mockValidator.mockReturnValueOnce(mockError).mockReturnValueOnce(null);

    const { result } = renderHook(() =>
      useFormValidation({
        validator: mockValidator,
        fieldMappings: mockFieldMappings,
      }),
    );

    // Adiciona erro
    act(() => {
      result.current.updateFieldValidation('firstName', '', {});
    });

    expect(result.current.hasFieldError('firstName')).toBe(true);

    // Remove erro
    act(() => {
      result.current.updateFieldValidation('firstName', 'João', {});
    });

    expect(result.current.hasFieldError('firstName')).toBe(false);
    expect(result.current.getFieldError('firstName')).toBe(null);
  });

  it('deve usar mapeamento de campos corretamente', () => {
    const mockError: ValidationError = { field: 'nome', message: 'Nome é obrigatório' };
    mockValidator.mockReturnValue(mockError);

    const { result } = renderHook(() =>
      useFormValidation({
        validator: mockValidator,
        fieldMappings: mockFieldMappings,
      }),
    );

    act(() => {
      result.current.updateFieldValidation('firstName', '', {});
    });

    // Deve encontrar erro usando mapeamento
    expect(result.current.hasFieldError('firstName')).toBe(true);
    expect(result.current.hasFieldError('nome')).toBe(true);
  });

  it('deve limpar todos os erros', () => {
    const mockError: ValidationError = { field: 'nome', message: 'Nome é obrigatório' };
    mockValidator.mockReturnValue(mockError);

    const { result } = renderHook(() =>
      useFormValidation({
        validator: mockValidator,
        fieldMappings: mockFieldMappings,
      }),
    );

    act(() => {
      result.current.updateFieldValidation('firstName', '', {});
    });

    expect(result.current.validationErrors.length).toBe(1);

    act(() => {
      result.current.clearValidationErrors();
    });

    expect(result.current.validationErrors).toEqual([]);
  });

  it('deve definir erros externos', () => {
    const externalErrors: ValidationError[] = [
      { field: 'email', message: 'Email inválido' },
      { field: 'password', message: 'Senha muito fraca' },
    ];

    const { result } = renderHook(() =>
      useFormValidation({
        validator: mockValidator,
        fieldMappings: mockFieldMappings,
      }),
    );

    act(() => {
      result.current.setErrors(externalErrors);
    });

    expect(result.current.validationErrors).toEqual(externalErrors);
  });
});
