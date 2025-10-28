import { ChangeEvent } from 'react';
import { formatDocument } from '@/utils/validations';

interface IdentifierInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export default function IdentifierInput({
  value,
  onChange,
  placeholder = 'E-mail, CPF ou CNPJ',
  error,
  disabled = false,
  required = false,
  className = '',
}: IdentifierInputProps) {
  // Se parece com um email, não formata. Caso contrário, aplica formatação de CPF/CNPJ
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Se já tem @ ou se o último caractere digitado não é número, trata como email
    const lastChar = newValue[newValue.length - 1] || '';
    if (newValue.includes('@') || !/^\d$/.test(lastChar)) {
      onChange(newValue);
    } else {
      onChange(formatDocument(newValue));
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`w-full border ${
          error ? 'border-red-500' : 'border-gray-300'
        } rounded-xl px-5 py-4 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6f43d0] shadow-sm transition-all text-base ${className}`}
      />
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  );
}
