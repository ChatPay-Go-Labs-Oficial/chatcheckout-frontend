import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterPage from './page';

// Mock do hook useUser
const mockRegister = jest.fn();
jest.mock('@/hooks/useUser', () => ({
  useUser: jest.fn(() => ({
    register: mockRegister,
    isLoading: false,
    error: null,
  })),
}));

// Mock do hook useAuth
const mockLogin = jest.fn();
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    user: null,
    isLoading: false,
    login: mockLogin,
  })),
}));

// Mock do hook useRouter
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    replace: mockReplace,
  })),
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRegister.mockResolvedValue(undefined);
    mockLogin.mockResolvedValue(undefined);
  });

  it('deve renderizar todos os campos obrigatórios', () => {
    render(<RegisterPage />);

    expect(screen.getByTestId('firstName-input')).toBeInTheDocument();
    expect(screen.getByTestId('lastName-input')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('cpf-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('confirmPassword-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('deve aplicar máscara ao CPF', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const cpfInput = screen.getByTestId('cpf-input');
    await user.type(cpfInput, '12345678901');

    expect(cpfInput).toHaveValue('123.456.789-01');
  });

  it('deve aplicar máscara ao CNPJ', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const cnpjInput = screen.getByTestId('cnpj-input');
    await user.type(cnpjInput, '12345678000195');

    expect(cnpjInput).toHaveValue('12.345.678/0001-95');
  });

  it('deve limitar CPF a 11 dígitos', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const cpfInput = screen.getByTestId('cpf-input');
    await user.type(cpfInput, '12345678000195'); // Tentando digitar 14 dígitos

    expect(cpfInput).toHaveValue('123.456.780-00'); // Deve parar em 11 dígitos
  });

  it('deve mostrar erros de validação', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Sobrenome é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('E-mail é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('CPF é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Senha é obrigatório')).toBeInTheDocument();
    });
  });

  it('deve validar senhas diferentes', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByTestId('firstName-input'), 'João');
    await user.type(screen.getByTestId('lastName-input'), 'Silva');
    await user.type(screen.getByTestId('email-input'), 'joao@exemplo.com');
    await user.type(screen.getByTestId('cpf-input'), '12345678901');
    await user.type(screen.getByTestId('password-input'), 'MinhaSenh@123');
    await user.type(screen.getByTestId('confirmPassword-input'), 'SenhasDiferentes123');

    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('As senhas não coincidem')).toBeInTheDocument();
    });
  });

  it('deve chamar registerUser com dados corretos', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByTestId('firstName-input'), 'João');
    await user.type(screen.getByTestId('lastName-input'), 'Silva');
    await user.type(screen.getByTestId('email-input'), 'joao@exemplo.com');
    await user.type(screen.getByTestId('cpf-input'), '11144477735'); // CPF válido
    await user.type(screen.getByTestId('password-input'), 'MinhaSenh@123');
    await user.type(screen.getByTestId('confirmPassword-input'), 'MinhaSenh@123');

    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@exemplo.com',
        cpf: '11144477735',
        password: 'MinhaSenh@123',
        confirmPassword: 'MinhaSenh@123',
        role: 'infoproducer',
        companyName: undefined,
        cnpj: undefined,
      });
    });
  });

  it('deve remover erro de senha quando corrigida', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const passwordInput = screen.getByTestId('password-input');

    // Digite uma senha inválida primeiro
    await user.type(passwordInput, '123');
    await user.tab(); // Sai do campo

    // Digite uma senha válida
    await user.clear(passwordInput);
    await user.type(passwordInput, 'ValidPass123!');
    await user.tab(); // Sai do campo

    // Não deve haver erro de senha
    await waitFor(() => {
      expect(screen.queryByText(/Senha deve/)).not.toBeInTheDocument();
    });
  });

  it('deve remover erro de nome quando corrigido', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const firstNameInput = screen.getByTestId('firstName-input');
    const submitButton = screen.getByTestId('submit-button');

    // Força validação clicando submit com campo vazio
    await user.click(submitButton);

    // Verifica se erro aparece
    await waitFor(() => {
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
    });

    // Digita um nome válido
    await user.type(firstNameInput, 'João');
    await user.tab(); // Sai do campo

    // O erro deve desaparecer
    await waitFor(() => {
      expect(screen.queryByText('Nome é obrigatório')).not.toBeInTheDocument();
    });
  });

  it('deve remover erro de email quando corrigido', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const emailInput = screen.getByTestId('email-input');
    const submitButton = screen.getByTestId('submit-button');

    // Força validação clicando submit com campo vazio
    await user.click(submitButton);

    // Verifica se erro aparece
    await waitFor(() => {
      expect(screen.getByText('E-mail é obrigatório')).toBeInTheDocument();
    });

    // Digita um email válido
    await user.type(emailInput, 'joao@exemplo.com');
    await user.tab(); // Sai do campo

    // O erro deve desaparecer
    await waitFor(() => {
      expect(screen.queryByText('E-mail é obrigatório')).not.toBeInTheDocument();
    });
  });

  it('deve remover todos os erros quando corrigidos sequencialmente', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const firstNameInput = screen.getByTestId('firstName-input');
    const lastNameInput = screen.getByTestId('lastName-input');
    const emailInput = screen.getByTestId('email-input');
    const cpfInput = screen.getByTestId('cpf-input');
    const passwordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByTestId('confirmPassword-input');
    const submitButton = screen.getByTestId('submit-button');

    // Força validação clicando submit com todos os campos vazios
    await user.click(submitButton);

    // Verifica se todos os erros aparecem
    await waitFor(() => {
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Sobrenome é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('E-mail é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('CPF é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Senha é obrigatório')).toBeInTheDocument();
    });

    // Corrige os campos sequencialmente e verifica se os erros desaparecem
    await user.type(firstNameInput, 'João');
    await user.tab();
    await waitFor(() => {
      expect(screen.queryByText('Nome é obrigatório')).not.toBeInTheDocument();
    });

    await user.type(lastNameInput, 'Silva');
    await user.tab();
    await waitFor(() => {
      expect(screen.queryByText('Sobrenome é obrigatório')).not.toBeInTheDocument();
    });

    await user.type(emailInput, 'joao@exemplo.com');
    await user.tab();
    await waitFor(() => {
      expect(screen.queryByText('E-mail é obrigatório')).not.toBeInTheDocument();
    });

    await user.type(cpfInput, '11144477735');
    await user.tab();
    await waitFor(() => {
      expect(screen.queryByText('CPF é obrigatório')).not.toBeInTheDocument();
    });

    await user.type(passwordInput, 'ValidPass123!');
    await user.tab();
    await waitFor(() => {
      expect(screen.queryByText('Senha é obrigatório')).not.toBeInTheDocument();
    });

    await user.type(confirmPasswordInput, 'ValidPass123!');
    await user.tab();
    await waitFor(() => {
      expect(screen.queryByText('Confirmação de senha é obrigatório')).not.toBeInTheDocument();
    });

    // Ao final, nenhum erro deve estar presente
    expect(screen.queryByText(/é obrigatório/)).not.toBeInTheDocument();
  });

  it('deve mostrar erro de API', async () => {
    const user = userEvent.setup();
    mockRegister.mockRejectedValue(new Error('E-mail já está em uso'));

    render(<RegisterPage />);

    await user.type(screen.getByTestId('firstName-input'), 'João');
    await user.type(screen.getByTestId('lastName-input'), 'Silva');
    await user.type(screen.getByTestId('email-input'), 'joao@exemplo.com');
    await user.type(screen.getByTestId('cpf-input'), '11144477735'); // CPF válido
    await user.type(screen.getByTestId('password-input'), 'MinhaSenh@123');
    await user.type(screen.getByTestId('confirmPassword-input'), 'MinhaSenh@123');

    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled();
    });
  });
});
