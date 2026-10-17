import React, { useEffect, useState } from 'react';
import { FileVideo, Trash2, RefreshCw } from 'lucide-react';

interface VideoPreviewProps {
  file: File;
  onRemove: () => void;
  onReplace: () => void;
  disabled?: boolean;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  file,
  onRemove,
  onReplace,
  disabled = false,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const extension = file.name.split('.').pop()?.toUpperCase() || 'VIDEO';

  return (
    <div className="forensic-card p-5 space-y-4 border-forensic-border/80">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-10 h-10 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan shrink-0">
            <FileVideo className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-forensic-text truncate" title={file.name}>
              {file.name}
            </h4>
            <div className="flex items-center space-x-2 text-xs font-mono text-forensic-muted mt-0.5">
              <span>{formatFileSize(file.size)}</span>
              <span>&bull;</span>
              <span className="px-1.5 py-0.2 rounded bg-background-secondary border border-forensic-border text-[10px] text-accent-cyan">
                {extension}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            disabled={disabled}
            onClick={onReplace}
            className="p-2 rounded-lg bg-background-secondary border border-forensic-border text-forensic-muted hover:text-forensic-text hover:border-accent-cyan/50 text-xs transition-colors"
            title="Replace video"
            aria-label="Replace video"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={onRemove}
            className="p-2 rounded-lg bg-background-secondary border border-forensic-border text-forensic-muted hover:text-forensic-error hover:border-forensic-error/50 text-xs transition-colors"
            title="Remove video"
            aria-label="Remove video"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Video Player Preview */}
      {previewUrl && (
        <div className="relative rounded-lg overflow-hidden bg-black/60 border border-forensic-border aspect-video max-h-[320px] flex items-center justify-center">
          <video
            src={previewUrl}
            controls
            playsInline
            preload="metadata"
            className="w-full h-full object-contain"
          >
            Your browser does not support HTML5 video preview.
          </video>
        </div>
      )}
    </div>
  );
};
