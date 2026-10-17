import React, { useEffect, useState, useRef } from 'react';
import { FileVideo, Trash2, RefreshCw, Volume2, Clock, Check } from 'lucide-react';

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
  const [duration, setDuration] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setDimensions({
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDuration = (sec: number): string => {
    const mins = Math.floor(sec / 60);
    const remainder = Math.floor(sec % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const extension = file.name.split('.').pop()?.toUpperCase() || 'VIDEO';

  return (
    <div className="forensic-card p-5 space-y-4 border-forensic-border/80">
      {/* Header Info Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-10 h-10 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan shrink-0">
            <FileVideo className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-forensic-text truncate" title={file.name}>
              {file.name}
            </h4>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-forensic-muted mt-0.5">
              <span>{formatFileSize(file.size)}</span>
              <span>&bull;</span>
              <span className="px-1.5 py-0.2 rounded bg-background-secondary border border-forensic-border text-[10px] text-accent-cyan font-bold">
                {extension}
              </span>
              {duration !== null && (
                <>
                  <span>&bull;</span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-forensic-muted" />
                    <span>{formatDuration(duration)}</span>
                  </span>
                </>
              )}
              {dimensions && (
                <>
                  <span>&bull;</span>
                  <span>{dimensions.width}x{dimensions.height}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            disabled={disabled}
            onClick={onReplace}
            className="p-2 rounded-lg bg-background-secondary border border-forensic-border text-forensic-muted hover:text-forensic-text hover:border-accent-cyan/50 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-accent-cyan"
            title="Replace video"
            aria-label="Replace video"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={onRemove}
            className="p-2 rounded-lg bg-background-secondary border border-forensic-border text-forensic-muted hover:text-forensic-error hover:border-forensic-error/50 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-forensic-error"
            title="Remove video"
            aria-label="Remove video"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Video Preview Player */}
      {previewUrl && (
        <div className="relative rounded-lg overflow-hidden bg-black/80 border border-forensic-border aspect-video max-h-[340px] flex items-center justify-center">
          <video
            ref={videoRef}
            src={previewUrl}
            controls
            playsInline
            preload="metadata"
            onLoadedMetadata={handleLoadedMetadata}
            className="w-full h-full object-contain"
          >
            Your browser does not support HTML5 video preview.
          </video>
        </div>
      )}

      {/* Extraction Readiness Notice */}
      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-background-secondary/50 border border-forensic-border text-xs text-forensic-muted">
        <span className="flex items-center space-x-1.5 font-mono text-[11px]">
          <Volume2 className="w-3.5 h-3.5 text-accent-violet" />
          <span>Audio track extraction configured via FFmpeg</span>
        </span>
        <span className="text-forensic-success font-mono font-semibold flex items-center space-x-1 text-[11px]">
          <Check className="w-3 h-3" />
          <span>Ready for Inspection</span>
        </span>
      </div>
    </div>
  );
};
