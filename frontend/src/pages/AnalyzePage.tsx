import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileVideo, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import { apiService } from '@/services/api';
import { APP_CONFIG } from '@/constants';
import { AnalysisResponse } from '@/types/analysis';

export const AnalyzePage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const handleFileSelection = (file: File) => {
    setError(null);

    // Validate size
    const maxBytes = APP_CONFIG.maxFileSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`File exceeds the maximum limit of ${APP_CONFIG.maxFileSizeMB}MB.`);
      return;
    }

    // Validate extension
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!APP_CONFIG.allowedExtensions.includes(ext)) {
      setError(`Unsupported format (${ext}). Allowed: ${APP_CONFIG.allowedExtensions.join(', ')}`);
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const response: AnalysisResponse = await apiService.analyzeVideo(
        selectedFile,
        (progress) => setUploadProgress(progress)
      );

      // Store in session storage for refreshing results page
      sessionStorage.setItem('latest_analysis', JSON.stringify(response));

      // Navigate to results page with response state
      navigate('/results', { state: { analysis: response } });
    } catch (err: any) {
      setError(err.message || 'An error occurred while uploading and analyzing the video.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-forensic-text">
          Forensic Video Scanner
        </h1>
        <p className="text-sm text-forensic-muted mt-1">
          Upload an MP4, WebM, or MOV video to inspect facial frames for deepfake synthesis.
        </p>
      </div>

      {/* Upload Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`forensic-card p-10 text-center cursor-pointer transition-all border-dashed ${
          isDragOver
            ? 'border-accent-cyan bg-accent-cyan/5 shadow-glow-cyan'
            : 'border-forensic-border hover:border-accent-cyan/60 hover:bg-background-secondary/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={APP_CONFIG.allowedExtensions.join(',')}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileSelection(e.target.files[0]);
            }
          }}
        />

        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <div>
            <p className="text-base font-semibold text-forensic-text">
              {selectedFile ? selectedFile.name : 'Click to select or drag video here'}
            </p>
            <p className="text-xs text-forensic-muted mt-1">
              Supports MP4, AVI, MOV, WebM &bull; Maximum file size: {APP_CONFIG.maxFileSizeMB}MB
            </p>
          </div>

          {selectedFile && !isUploading && (
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-background-secondary border border-forensic-border text-xs font-mono text-accent-cyan">
              <FileVideo className="w-4 h-4" />
              <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
          )}
        </div>
      </div>

      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="forensic-card p-4 space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-forensic-muted">Uploading and dispatching to OpenCV backend...</span>
            <span className="text-accent-cyan font-bold">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-background-secondary rounded-full h-2 overflow-hidden border border-forensic-border">
            <div
              className="bg-accent-cyan h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-lg bg-forensic-error/10 border border-forensic-error/30 flex items-start space-x-3 text-forensic-error text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-4">
        {selectedFile && !isUploading && (
          <button
            type="button"
            onClick={() => setSelectedFile(null)}
            className="px-4 py-2 rounded-lg text-xs font-medium text-forensic-muted hover:text-forensic-text"
          >
            Clear Selection
          </button>
        )}

        <button
          type="button"
          disabled={!selectedFile || isUploading}
          onClick={handleStartAnalysis}
          className={`inline-flex items-center space-x-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${
            !selectedFile || isUploading
              ? 'bg-background-card border border-forensic-border text-forensic-muted cursor-not-allowed opacity-50'
              : 'bg-accent-cyan text-background hover:bg-accent-cyan/90 shadow-glow-cyan'
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Forensic Engine Running...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Run Deepfake Analysis</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
