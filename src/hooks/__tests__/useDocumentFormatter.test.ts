import { renderHook, act } from '@testing-library/react';
import { useDocumentFormatter } from '../useDocumentFormatter';

// Mock das funções de formatação
jest.mock('@/utils/validations', () => ({
  formatCPF: jest.fn((value) =>
    value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
  ),
  formatCNPJ: jest.fn((value) =>
    value.replace(/\D/g, '').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5'),
  ),
}));

describe('useDocumentFormatter', () => {
  it('deve formatar CPF corretamente', () => {
    const { result } = renderHook(() => useDocumentFormatter());
    const mockOnChange = jest.fn();

    act(() => {
      result.current.handleCPFChange('12345678901', mockOnChange);
    });

    expect(mockOnChange).toHaveBeenCalledWith('123.456.789-01');
  });

  it('deve limitar CPF a 11 dígitos', () => {
    const { result } = renderHook(() => useDocumentFormatter());
    const mockOnChange = jest.fn();

    // Tenta inserir 14 dígitos (tamanho de CNPJ)
    act(() => {
      result.current.handleCPFChange('12345678901234', mockOnChange);
    });

    // Não deve chamar onChange porque excede 11 dígitos
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('deve formatar CNPJ corretamente', () => {
    const { result } = renderHook(() => useDocumentFormatter());
    const mockOnChange = jest.fn();

    act(() => {
      result.current.handleCNPJChange('12345678000195', mockOnChange);
    });

    expect(mockOnChange).toHaveBeenCalledWith('12.345.678/0001-95');
  });

  it('deve ter as funções necessárias', () => {
    const { result } = renderHook(() => useDocumentFormatter());

    expect(typeof result.current.handleCPFChange).toBe('function');
    expect(typeof result.current.handleCNPJChange).toBe('function');
  });
});
