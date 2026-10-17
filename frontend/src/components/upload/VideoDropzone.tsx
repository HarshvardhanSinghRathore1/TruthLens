import React, { useRef, useState } from 'react';
import { UploadCloud, FolderOpen, AlertCircle, Video, Mic } from 'lucide-react';
import { APP_CONFIG } from '@/constants';

interface VideoDropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export const VideoDropzone: React.FC<VideoDropzoneProps> = ({ onFileSelect, disabled = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessFile = (file: File) => {
    setValidationError(null);

    // Size check
    const maxBytes = APP_CONFIG.maxFileSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setValidationError(`File exceeds maximum size of ${APP_CONFIG.maxFileSizeMB}MB.`);
      return;
    }

    if (file.size === 0) {
      setValidationError('Uploaded file is empty (0 bytes).');
      return;
    }

    // Extension check
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!APP_CONFIG.allowedExtensions.includes(ext)) {
      setValidationError(
        `Unsupported video format (${ext}). Supported formats: ${APP_CONFIG.allowedExtensions.join(', ')}`
      );
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload video file for dual video and audio deepfake analysis"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={`p-8 sm:p-12 text-center cursor-pointer border-2 border-dashed rounded-xl transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-background-secondary border-odoo-border'
            : isDragOver
            ? 'border-primary bg-primary-surface/70 shadow-odoo-sm'
            : 'border-odoo-border bg-white hover:border-primary/50 hover:bg-primary-surface/20 shadow-odoo-xs'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={APP_CONFIG.allowedExtensions.join(',')}
          className="hidden"
          disabled={disabled}
          onChange={handleInputChange}
        />

        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-surface border border-primary/20 flex items-center justify-center text-primary shadow-xs">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <p className="text-base sm:text-lg font-semibold text-odoo-text">
              Drop media file here, or <span className="text-primary underline font-bold">browse</span>
            </p>
            <p className="text-xs text-odoo-muted leading-relaxed">
              Supports {APP_CONFIG.allowedExtensions.join(', ')} &bull; Up to {APP_CONFIG.maxFileSizeMB}MB
            </p>
          </div>

          {/* Dual-Modality Notice */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-background-secondary border border-odoo-border text-[11px] text-odoo-muted">
            <span className="flex items-center space-x-1 text-odoo-text font-medium">
              <Video className="w-3.5 h-3.5 text-primary" />
              <span>Facial Video Frames</span>
            </span>
            <span className="text-odoo-muted font-bold">&bull;</span>
            <span className="flex items-center space-x-1 text-odoo-text font-medium">
              <Mic className="w-3.5 h-3.5 text-accent-violet" />
              <span>Extracted Audio Track</span>
            </span>
          </div>

          <div>
            <button
              type="button"
              disabled={disabled}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-white border border-odoo-border text-xs font-semibold text-odoo-text hover:bg-background-secondary hover:border-primary/40 transition-colors shadow-odoo-xs"
            >
              <FolderOpen className="w-3.5 h-3.5 text-primary" />
              <span>Select File from Device</span>
            </button>
          </div>
        </div>
      </div>

      {validationError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center space-x-2 text-forensic-error text-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
};
