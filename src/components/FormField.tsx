import React from 'react';

interface FormFieldProps {
  name: string;
  type?: string;
  placeholder: string;
  value: string;
  autoComplete?: string;
  testId?: string;
  hasError?: boolean;
  errorMessage?: string | null;
  helperText?: string;
  required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Componente reutilizável para campos de entrada do formulário
 * Padroniza aparência e comportamento de validação
 */
export function FormField({
  name,
  type = 'text',
  placeholder,
  value,
  autoComplete,
  testId,
  hasError = false,
  errorMessage,
  helperText,
  required = false,
  onChange,
  onBlur,
  disabled = false,
  className = '',
}: FormFieldProps) {
  const baseClasses = `
    border rounded-xl px-5 py-3 bg-white text-black placeholder-gray-400 
    focus:outline-none focus:ring-2 focus:ring-[#6f43d0] shadow-sm 
    transition-all text-base ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
  `;

  const errorClasses = hasError ? 'border-red-500' : 'border-gray-300';

  const fullClassName = `${baseClasses} ${errorClasses} ${className}`.trim();

  return (
    <div className="flex flex-col">
      <input
        data-testid={testId}
        name={name}
        type={type}
        placeholder={`${placeholder}${required ? ' *' : ''}`}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={fullClassName}
      />

      {hasError && errorMessage && (
        <span className="text-red-500 text-xs mt-1">{errorMessage}</span>
      )}

      {!hasError && helperText && <span className="text-xs text-gray-400 mt-1">{helperText}</span>}
    </div>
  );
}
