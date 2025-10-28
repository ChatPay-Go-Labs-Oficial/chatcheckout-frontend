import { validateRegistrationForm } from './validations/form-validators';

describe('Validations', () => {
  describe('validateRegistrationForm', () => {
    it('deve validar formulário completo válido', () => {
      const validForm = {
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@exemplo.com',
        cpf: '11144477735', // CPF válido
        password: 'MinhaSenh@123',
        confirmPassword: 'MinhaSenh@123',
        companyName: 'Minha Empresa LTDA',
        cnpj: '11222333000181', // CNPJ válido
      };

      const errors = validateRegistrationForm(validForm);
      expect(errors).toHaveLength(0);
    });

    it('deve retornar erros para campos obrigatórios vazios', () => {
      const emptyForm = {
        firstName: '',
        lastName: '',
        email: '',
        cpf: '',
        password: '',
        confirmPassword: '',
      };

      const errors = validateRegistrationForm(emptyForm);
      expect(errors.length).toBeGreaterThan(0);

      // Verifica se todos os campos obrigatórios têm erros
      const expectedFields = ['nome', 'sobrenome', 'e-mail', 'cpf', 'senha', 'confirmaçãodesenha'];
      expectedFields.forEach((field) => {
        const hasError = errors.some((error) => error.field === field);
        expect(hasError).toBe(true);
      });
    });

    it('deve validar senhas diferentes', () => {
      const formWithDifferentPasswords = {
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@exemplo.com',
        cpf: '12345678901',
        password: 'MinhaSenh@123',
        confirmPassword: 'SenhasDiferentes@456',
      };

      const errors = validateRegistrationForm(formWithDifferentPasswords);
      expect(errors.some((error) => error.field === 'confirmaçãodesenha')).toBe(true);
      expect(errors.find((error) => error.field === 'confirmaçãodesenha')?.message).toBe(
        'As senhas não coincidem',
      );
    });

    it('deve validar regra de negócio CNPJ sem empresa', () => {
      const formWithCnpjNoCompany = {
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@exemplo.com',
        cpf: '12345678901',
        password: 'MinhaSenh@123',
        confirmPassword: 'MinhaSenh@123',
        cnpj: '12345678000195',
        companyName: '',
      };

      const errors = validateRegistrationForm(formWithCnpjNoCompany);
      expect(errors.some((error) => error.field === 'companyName')).toBe(true);
      expect(errors.find((error) => error.field === 'companyName')?.message).toBe(
        'Quando informado o CNPJ, o nome da empresa é obrigatório',
      );
    });
  });

  describe('CPF/CNPJ Validation', () => {
    it('deve rejeitar CPF inválido', () => {
      const invalidForm = {
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@exemplo.com',
        cpf: '123.456.789-00', // CPF inválido
        password: 'MinhaSenh@123',
        confirmPassword: 'MinhaSenh@123',
      };

      const errors = validateRegistrationForm(invalidForm);
      expect(errors.some((e) => e.field === 'cpf' && e.message === 'CPF inválido')).toBe(true);
    });

    it('deve rejeitar CNPJ inválido', () => {
      const invalidForm = {
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@exemplo.com',
        cpf: '11144477735',
        password: 'MinhaSenh@123',
        confirmPassword: 'MinhaSenh@123',
        companyName: 'Empresa Teste',
        cnpj: '12.345.678/0001-00', // CNPJ inválido
      };

      const errors = validateRegistrationForm(invalidForm);
      expect(errors.some((e) => e.field === 'cnpj' && e.message === 'CNPJ inválido')).toBe(true);
    });
  });
});
