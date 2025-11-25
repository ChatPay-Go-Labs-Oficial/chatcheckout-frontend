import React, { useCallback, useRef } from 'react';

interface FileUploadFieldProps {
  label: string;
  accept: string;
  maxSize: number; // em bytes
  required?: boolean;
  file: File | null;
  preview?: string | null;
  error?: string | null;
  isUploading?: boolean;
  currentFileUrl?: string; // Para edição - arquivo já existente
  helpText?: string;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
}

/**
 * Componente de upload de arquivo com drag & drop
 * Suporta preview de imagens e feedback visual
 */
export function FileUploadField({
  label,
  accept,
  maxSize,
  required = false,
  file,
  preview,
  error,
  isUploading = false,
  currentFileUrl,
  helpText,
  onFileSelect,
  onFileRemove,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        onFileSelect(droppedFile);
      }
    },
    [onFileSelect],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        onFileSelect(selectedFile);
      }
    },
    [onFileSelect],
  );

  const handleClick = () => {
    inputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);

  // Estado: arquivo selecionado
  const hasFile = file || currentFileUrl;
  const fileName = file?.name || currentFileUrl?.split('/').pop() || '';
  const fileSize = file ? formatFileSize(file.size) : '';

  return (
    <div className="flex flex-col">
      {/* Label */}
      <label className="text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Upload Area ou Preview */}
      {!hasFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`
            border-2 border-dashed rounded-xl p-4 text-center cursor-pointer
            transition-all duration-200 min-h-[120px] flex items-center justify-center
            ${isDragging ? 'border-[#6f43d0] bg-purple-50' : 'border-gray-300 hover:border-[#6fdcff]'}
            ${error ? 'border-red-500 bg-red-50' : ''}
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-2">
            {/* Ícone de upload */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6fdcff] to-[#6f43d0] flex items-center justify-center">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path
                  d="M12 4v13m0-13l-4 4m4-4l4 4M5 20h14"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-700">
                Arraste e solte ou <span className="text-[#6f43d0]">clique para selecionar</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {helpText || `Formatos aceitos • Máx. ${maxSizeMB}MB`}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-xl p-3 bg-white">
          {/* Preview de imagem */}
          {preview && (
            <div className="mb-2 relative w-full h-24">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" className="w-full h-24 object-cover rounded-lg" />
            </div>
          )}

          {/* Informações do arquivo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6fdcff] to-[#6f43d0] flex items-center justify-center">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-700 truncate max-w-xs">{fileName}</p>
                {fileSize && <p className="text-xs text-gray-400">{fileSize}</p>}
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex items-center gap-2">
              {!isUploading && (
                <>
                  <button
                    type="button"
                    onClick={handleClick}
                    className="px-3 py-1.5 text-xs font-medium text-[#6f43d0] hover:bg-purple-50 rounded-lg transition"
                  >
                    Substituir
                  </button>
                  <button
                    type="button"
                    onClick={onFileRemove}
                    className="px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    Remover
                  </button>
                </>
              )}

              {isUploading && (
                <div className="flex items-center gap-2 text-[#6f43d0]">
                  <div className="w-4 h-4 border-2 border-[#6f43d0] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-medium">Enviando...</span>
                </div>
              )}
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {/* Mensagem de erro */}
      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  );
}
