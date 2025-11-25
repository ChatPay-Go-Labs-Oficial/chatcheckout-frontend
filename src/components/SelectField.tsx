import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  name: string;
  placeholder?: string;
  value: string;
  options: SelectOption[];
  testId?: string;
  hasError?: boolean;
  errorMessage?: string | null;
  helperText?: string;
  required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  className?: string;
}

/**
 * Componente reutilizável para campos select
 * Padroniza aparência e comportamento de validação
 */
export function SelectField({
  name,
  placeholder = 'Selecione...',
  value,
  options,
  testId,
  hasError = false,
  errorMessage,
  helperText,
  required = false,
  onChange,
  onBlur,
  className = '',
}: SelectFieldProps) {
  const baseClasses = `
    w-full border rounded-xl px-5 py-4 pr-12 bg-white text-black 
    focus:outline-none focus:ring-2 focus:ring-[#6f43d0] shadow-sm 
    transition-all text-base appearance-none cursor-pointer
  `;

  const errorClasses = hasError ? 'border-red-500' : 'border-gray-300';
  const valueClasses = !value ? 'text-gray-400' : '';

  const fullClassName = `${baseClasses} ${errorClasses} ${valueClasses} ${className}`.trim();

  return (
    <div className="flex flex-col">
      <div className="relative">
        <select
          data-testid={testId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={fullClassName}
        >
          <option value="" disabled>
            {placeholder}
            {required ? ' *' : ''}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Ícone de seta para dropdown */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="text-gray-400">
            <path
              d="M1 1.5L6 6.5L11 1.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {hasError && errorMessage && (
        <span className="text-red-500 text-xs mt-1">{errorMessage}</span>
      )}

      {!hasError && helperText && <span className="text-xs text-gray-400 mt-1">{helperText}</span>}
    </div>
  );
}
