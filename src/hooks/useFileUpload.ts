import { useState, useCallback } from 'react';

/**
 * Tipo de arquivo para upload
 */
export type FileUploadType = 'image' | 'product';

/**
 * Configuração de validação para o upload
 */
export interface FileValidationConfig {
  maxSize: number;
  acceptedTypes: readonly string[];
  acceptedExtensions: readonly string[];
}

/**
 * Estado do hook de upload (apenas validação e seleção - upload é feito pelo backend)
 */
export interface FileUploadState {
  file: File | null;
  preview: string | null;
  error: string | null;
}

/**
 * Hook customizado para gerenciar seleção e validação de arquivos
 * NOTA: O upload real é feito pelo backend quando o produto é criado
 *
 * @param type - Tipo de arquivo (image ou product)
 * @param validation - Configuração de validação
 * @returns Estado e métodos para gerenciar seleção de arquivo
 */
export function useFileUpload(type: FileUploadType, validation: FileValidationConfig) {
  const [state, setState] = useState<FileUploadState>({
    file: null,
    preview: null,
    error: null,
  });

  /**
   * Valida o arquivo selecionado
   */
  const validateFile = useCallback(
    (file: File): string | null => {
      // Validar tamanho
      if (file.size > validation.maxSize) {
        const maxSizeMB = (validation.maxSize / (1024 * 1024)).toFixed(0);
        return `O arquivo deve ter no máximo ${maxSizeMB}MB`;
      }

      // Validar tipo MIME
      if (!validation.acceptedTypes.includes(file.type)) {
        return `Tipo de arquivo não suportado. Tipos aceitos: ${validation.acceptedExtensions.join(', ')}`;
      }

      // Validar extensão
      const fileName = file.name.toLowerCase();
      const hasValidExtension = validation.acceptedExtensions.some((ext) =>
        fileName.endsWith(ext.toLowerCase()),
      );

      if (!hasValidExtension) {
        return `Extensão de arquivo não suportada. Extensões aceitas: ${validation.acceptedExtensions.join(', ')}`;
      }

      return null;
    },
    [validation],
  );

  /**
   * Gera preview para imagens
   */
  const generatePreview = useCallback((file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        resolve(null);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  /**
   * Seleciona um arquivo e valida
   */
  const selectFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);

      if (validationError) {
        setState({
          file: null,
          preview: null,
          error: validationError,
        });
        return;
      }

      const preview = await generatePreview(file);

      setState({
        file,
        preview,
        error: null,
      });
    },
    [validateFile, generatePreview],
  );

  /**
   * Remove o arquivo selecionado
   */
  const removeFile = useCallback(() => {
    setState({
      file: null,
      preview: null,
      error: null,
    });
  }, []);

  /**
   * Reseta o estado do upload
   */
  const reset = useCallback(() => {
    setState({
      file: null,
      preview: null,
      error: null,
    });
  }, []);

  return {
    file: state.file,
    preview: state.preview,
    error: state.error,
    selectFile,
    removeFile,
    reset,
  };
}
