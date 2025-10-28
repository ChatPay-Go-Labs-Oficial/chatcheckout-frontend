import {
  validateRequired,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateName,
  validateCompanyName,
} from '../field-validators';

describe('Field Validators', () => {
  describe('validateRequired', () => {
    it('deve retornar erro para valores vazios', () => {
      expect(validateRequired('', 'Nome')).toEqual({
        field: 'nome',
        message: 'Nome é obrigatório',
      });
      expect(validateRequired('   ', 'Email')).toEqual({
        field: 'email',
        message: 'Email é obrigatório',
      });
    });

    it('deve retornar null para valores válidos', () => {
      expect(validateRequired('João', 'Nome')).toBeNull();
      expect(validateRequired('teste@email.com', 'Email')).toBeNull();
    });
  });

  describe('validateEmail', () => {
    it('deve validar emails válidos', () => {
      expect(validateEmail('teste@email.com')).toBeNull();
      expect(validateEmail('usuario.nome@dominio.com.br')).toBeNull();
    });

    it('deve rejeitar emails inválidos', () => {
      expect(validateEmail('email_invalido')).toEqual({
        field: 'e-mail',
        message: 'E-mail deve ter um formato válido',
      });
      expect(validateEmail('teste@')).toEqual({
        field: 'e-mail',
        message: 'E-mail deve ter um formato válido',
      });
    });

    it('deve tratar email vazio como obrigatório', () => {
      expect(validateEmail('')).toEqual({
        field: 'e-mail',
        message: 'E-mail é obrigatório',
      });
    });
  });

  describe('validatePassword', () => {
    it('deve validar senhas fortes', () => {
      expect(validatePassword('MinhaSenh@123')).toBeNull();
      expect(validatePassword('SenhaForte$456')).toBeNull();
    });

    it('deve rejeitar senhas fracas', () => {
      const result = validatePassword('123456');
      expect(result?.field).toBe('senha');
      expect(result?.message).toContain('caracteres');
    });

    it('deve tratar senha vazia', () => {
      expect(validatePassword('')).toEqual({
        field: 'senha',
        message: 'Senha é obrigatório',
      });
    });
  });

  describe('validatePasswordConfirmation', () => {
    it('deve validar senhas iguais', () => {
      expect(validatePasswordConfirmation('MinhaSenh@123', 'MinhaSenh@123')).toBeNull();
    });

    it('deve rejeitar senhas diferentes', () => {
      expect(validatePasswordConfirmation('senha1', 'senha2')).toEqual({
        field: 'confirmaçãodesenha',
        message: 'As senhas não coincidem',
      });
    });
  });

  describe('validateName', () => {
    it('deve validar nomes válidos', () => {
      expect(validateName('João', 'Nome')).toBeNull();
      expect(validateName('Maria Silva', 'Nome')).toBeNull();
    });

    it('deve rejeitar nomes muito longos', () => {
      const nomeLongo = 'a'.repeat(51);
      expect(validateName(nomeLongo, 'Nome')).toEqual({
        field: 'nome',
        message: 'Nome deve ter no máximo 50 caracteres',
      });
    });
  });

  describe('validateCompanyName', () => {
    it('deve aceitar empresa vazia (opcional)', () => {
      expect(validateCompanyName('')).toBeNull();
      expect(validateCompanyName('   ')).toBeNull();
    });

    it('deve validar nomes de empresa válidos', () => {
      expect(validateCompanyName('Minha Empresa LTDA')).toBeNull();
    });

    it('deve rejeitar nomes muito longos', () => {
      const nomeLongo = 'a'.repeat(101);
      expect(validateCompanyName(nomeLongo)).toEqual({
        field: 'companyName',
        message: 'Nome da empresa deve ter no máximo 100 caracteres',
      });
    });
  });
});
