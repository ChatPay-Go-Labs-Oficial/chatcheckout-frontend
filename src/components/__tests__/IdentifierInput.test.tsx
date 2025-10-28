import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import IdentifierInput from '@/components/IdentifierInput';

describe('IdentifierInput', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render correctly with default props', () => {
    render(<IdentifierInput value="" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('E-mail, CPF ou CNPJ');
    expect(input).toBeInTheDocument();
  });

  it('should show error message when provided', () => {
    const errorMessage = 'Campo inválido';
    render(<IdentifierInput value="" onChange={mockOnChange} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should format CPF correctly', () => {
    render(<IdentifierInput value="" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('E-mail, CPF ou CNPJ');
    fireEvent.change(input, { target: { value: '12345678900' } });

    expect(mockOnChange).toHaveBeenCalledWith('123.456.789-00');
  });

  it('should format CNPJ correctly', () => {
    render(<IdentifierInput value="" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('E-mail, CPF ou CNPJ');
    fireEvent.change(input, { target: { value: '12345678000190' } });

    expect(mockOnChange).toHaveBeenCalledWith('12.345.678/0001-90');
  });

  it('should not format email', () => {
    render(<IdentifierInput value="" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('E-mail, CPF ou CNPJ');
    fireEvent.change(input, { target: { value: 'test@example.com' } });

    expect(mockOnChange).toHaveBeenCalledWith('test@example.com');
  });
});
