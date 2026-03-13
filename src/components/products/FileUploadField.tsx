import React, { useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, X, FileText, Image as ImageIcon, RefreshCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

  const hasFile = file || currentFileUrl;
  const fileName = file?.name || currentFileUrl?.split('/').pop() || '';
  const fileSize = file ? formatFileSize(file.size) : '';
  const isImage = accept.includes('image');

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold tracking-tight text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
        {hasFile && !isUploading && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-xs text-muted-foreground hover:text-destructive"
            onClick={onFileRemove}
          >
            <X className="w-3 h-3 mr-1" />
            Remover
          </Button>
        )}
      </div>

      {!hasFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`
            relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer
            transition-all duration-200 min-h-[110px] flex flex-col items-center justify-center gap-2
            ${isDragging ? 'border-primary bg-primary/5 ring-4 ring-primary/5' : 'border-muted hover:border-primary/50 hover:bg-muted/30'}
            ${error ? 'border-destructive bg-destructive/5' : ''}
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <UploadCloud className={`w-5 h-5 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>

          <div className="space-y-0.5">
            <p className="text-xs font-semibold">
              Clique ou arraste o arquivo
            </p>
            <p className="text-[10px] text-muted-foreground">
              {helpText || `Até ${maxSizeMB}MB`}
            </p>
          </div>
        </div>
      ) : (
        <div className="relative border rounded-xl overflow-hidden bg-muted/20 border-muted">
          <div className="flex items-center p-2.5 gap-3">
            <div className="w-10 h-10 rounded-lg bg-background border flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : isImage && currentFileUrl ? (
                <img src={currentFileUrl} alt="Atual" className="w-full h-full object-cover" />
              ) : (
                <FileText className="w-5 h-5 text-muted-foreground" />
              )}
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium truncate text-foreground pr-12">
                {fileName}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                {fileSize && <span className="text-xs text-muted-foreground font-mono">{fileSize}</span>}
                <Badge variant="secondary" className="text-[10px] h-4 px-1 leading-none uppercase tracking-wider">
                  {accept.includes('image') ? 'IMAGEM' : 'DIGITAL'}
                </Badge>
              </div>
            </div>

            <div className="flex-shrink-0">
               {isUploading ? (
                  <div className="p-2">
                    <RefreshCcw className="w-4 h-4 text-primary animate-spin" />
                  </div>
               ) : (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-full shadow-sm"
                    onClick={handleClick}
                    title="Substituir arquivo"
                  >
                    <RefreshCcw className="w-3.5 h-3.5" />
                  </Button>
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

      {error && (
        <p className="text-[11px] font-medium text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
          <span className="h-1 w-1 rounded-full bg-destructive" />
          {error}
        </p>
      )}
    </div>
  );
}
