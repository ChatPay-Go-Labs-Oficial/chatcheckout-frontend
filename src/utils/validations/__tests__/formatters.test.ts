import { sanitizeDocument, formatCPF, formatCNPJ, formatDocument } from '../formatters';

describe('Document Formatters', () => {
  describe('sanitizeDocument', () => {
    it('deve remover todos os caracteres não numéricos', () => {
      expect(sanitizeDocument('123.456.789-00')).toBe('12345678900');
      expect(sanitizeDocument('12.345.678/0001-00')).toBe('12345678000100');
      expect(sanitizeDocument('abc123def456')).toBe('123456');
      expect(sanitizeDocument('')).toBe('');
    });
  });

  describe('formatCPF', () => {
    it('deve formatar CPF progressivamente', () => {
      expect(formatCPF('123')).toBe('123');
      expect(formatCPF('1234')).toBe('123.4');
      expect(formatCPF('1234567')).toBe('123.456.7');
      expect(formatCPF('1234567890')).toBe('123.456.789-0');
      expect(formatCPF('12345678901')).toBe('123.456.789-01');
    });

    it('deve limitar a 11 dígitos', () => {
      expect(formatCPF('123456789012345')).toBe('123.456.789-01');
    });

    it('deve trabalhar com valores já formatados', () => {
      expect(formatCPF('123.456.789-01')).toBe('123.456.789-01');
    });
  });

  describe('formatCNPJ', () => {
    it('deve formatar CNPJ progressivamente', () => {
      expect(formatCNPJ('12')).toBe('12');
      expect(formatCNPJ('123')).toBe('12.3');
      expect(formatCNPJ('123456')).toBe('12.345.6');
      expect(formatCNPJ('123456789')).toBe('12.345.678/9');
      expect(formatCNPJ('1234567890123')).toBe('12.345.678/9012-3');
      expect(formatCNPJ('12345678901234')).toBe('12.345.678/9012-34');
    });

    it('deve limitar a 14 dígitos', () => {
      expect(formatCNPJ('123456789012345678')).toBe('12.345.678/9012-34');
    });
  });

  describe('formatDocument', () => {
    it('deve detectar CPF e formatar adequadamente', () => {
      expect(formatDocument('12345678901')).toBe('123.456.789-01');
      expect(formatDocument('123456789')).toBe('123.456.789');
    });

    it('deve detectar CNPJ e formatar adequadamente', () => {
      expect(formatDocument('12345678901234')).toBe('12.345.678/9012-34');
      expect(formatDocument('123456789012345')).toBe('12.345.678/9012-34');
    });
  });
});
