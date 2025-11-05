import React from 'react';

interface TextAreaFieldProps {
  name: string;
  placeholder: string;
  value: string;
  rows?: number;
  testId?: string;
  hasError?: boolean;
  errorMessage?: string | null;
  helperText?: string;
  required?: boolean;
  maxLength?: number;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  className?: string;
}

/**
 * Componente reutilizável para campos textarea
 * Padroniza aparência e comportamento de validação
 */
export function TextAreaField({
  name,
  placeholder,
  value,
  rows = 4,
  testId,
  hasError = false,
  errorMessage,
  helperText,
  required = false,
  maxLength,
  onChange,
  onBlur,
  className = '',
}: TextAreaFieldProps) {
  const baseClasses = `
    border rounded-xl px-5 py-4 bg-white text-black placeholder-gray-400 
    focus:outline-none focus:ring-2 focus:ring-[#6f43d0] shadow-sm 
    transition-all text-base resize-none
  `;

  const errorClasses = hasError ? 'border-red-500' : 'border-gray-300';

  const fullClassName = `${baseClasses} ${errorClasses} ${className}`.trim();

  const showCharCount = maxLength && maxLength > 0;
  const charCount = value.length;
  const charCountColor = maxLength && charCount > maxLength ? 'text-red-500' : 'text-gray-400';

  return (
    <div className="flex flex-col">
      <textarea
        data-testid={testId}
        name={name}
        placeholder={`${placeholder}${required ? ' *' : ''}`}
        value={value}
        rows={rows}
        maxLength={maxLength}
        onChange={onChange}
        onBlur={onBlur}
        className={fullClassName}
      />

      <div className="flex justify-between items-center mt-1">
        <div className="flex-1">
          {hasError && errorMessage && <span className="text-red-500 text-xs">{errorMessage}</span>}
          {!hasError && helperText && <span className="text-xs text-gray-400">{helperText}</span>}
        </div>

        {showCharCount && (
          <span className={`text-xs ${charCountColor} ml-2`}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
