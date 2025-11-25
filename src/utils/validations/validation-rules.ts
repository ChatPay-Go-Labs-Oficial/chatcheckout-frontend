/**
 * Constantes e regras de validação
 * Responsabilidade única: definir regras de validação
 */

export const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'E-mail deve ter um formato válido',
  },

  cpf: {
    pattern: /^\d{11}$/,
    message: 'CPF deve conter exatamente 11 dígitos numéricos',
  },

  cnpj: {
    pattern: /^\d{14}$/,
    message: 'CNPJ deve conter exatamente 14 dígitos numéricos',
  },

  password: {
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    minLength: 8,
    message:
      'Senha deve conter ao menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial',
  },

  name: {
    maxLength: 50,
    message: 'deve ter no máximo 50 caracteres',
  },

  companyName: {
    maxLength: 100,
    message: 'Nome da empresa deve ter no máximo 100 caracteres',
  },

  product: {
    name: {
      minLength: 3,
      maxLength: 100,
    },
    description: {
      minLength: 10,
      maxLength: 1000,
    },
    price: {
      min: 0.01,
      max: 999999999.99,
    },
    aiPrompt: {
      minLength: 20,
      maxLength: 2000,
    },
    url: {
      pattern: /^https?:\/\/.+/,
      message: 'URL deve começar com http:// ou https://',
    },
  },
} as const;
