import { renderHook, act } from '@testing-library/react';
import { useRegisterForm } from '../useRegisterForm';
import { UserRole } from '@/types/user';

describe('useRegisterForm', () => {
  it('deve inicializar com valores padrão', () => {
    const { result } = renderHook(() => useRegisterForm());

    expect(result.current.form).toEqual({
      firstName: '',
      lastName: '',
      email: '',
      cpf: '',
      password: '',
      confirmPassword: '',
      role: UserRole.Infoproducer,
      companyName: '',
      cnpj: '',
    });
  });

  it('deve atualizar campo do formulário', () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.updateField('firstName', 'João');
    });

    expect(result.current.form.firstName).toBe('João');
  });

  it('deve ter todas as funções necessárias', () => {
    const { result } = renderHook(() => useRegisterForm());

    expect(typeof result.current.handleFieldChange).toBe('function');
    expect(typeof result.current.handleFieldBlur).toBe('function');
    expect(typeof result.current.validateForm).toBe('function');
    expect(typeof result.current.hasFieldError).toBe('function');
    expect(typeof result.current.getFieldError).toBe('function');
    expect(typeof result.current.resetForm).toBe('function');
    expect(typeof result.current.clearValidationErrors).toBe('function');
    expect(typeof result.current.updateField).toBe('function');
  });
});
