import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Video } from 'lucide-react';
import { apiService } from '@/services/api';
import { VideoDropzone } from '@/components/upload/VideoDropzone';
import { VideoPreview } from '@/components/upload/VideoPreview';
import { AnalysisProgress } from '@/components/analysis/AnalysisProgress';
import { ErrorState } from '@/components/common/ErrorState';
import { AnalysisResponse } from '@/types/analysis';

export const AnalyzePage: React.FC = () => {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [consentAcknowledged, setConsentAcknowledged] = useState<boolean>(true);

  const handleFileSelect = (file: File) => {
    setError(null);
    setSelectedFile(file);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  const handleCancelAnalysis = () => {
    setIsAnalyzing(false);
    setUploadProgress(0);
    setError('Analysis cancelled by user.');
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile || isAnalyzing) return;

    if (!consentAcknowledged) {
      setError('Please acknowledge the responsible forensic use guidelines before proceeding.');
      return;
    }

    setIsAnalyzing(true);
    setUploadProgress(0);
    setError(null);

    try {
      const response: AnalysisResponse = await apiService.analyzeVideo(
        selectedFile,
        (percent) => setUploadProgress(percent)
      );

      // Persist in session storage for refreshing or direct navigation
      sessionStorage.setItem('latest_analysis', JSON.stringify(response));

      // Navigate to results screen with payload
      navigate('/results', { state: { analysis: response } });
    } catch (err: any) {
      const msg =
        err?.message ||
        'Could not complete forensic analysis. Ensure backend is running and reachable.';
      setError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center space-x-2 text-xs font-medium text-primary uppercase tracking-wider">
          <Video className="w-3.5 h-3.5" />
          <span>Forensic Laboratory Terminal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-odoo-text">
          Video & Audio Deepfake Scanner
        </h1>
        <p className="text-sm text-odoo-muted leading-relaxed max-w-2xl">
          Upload media to execute parallel facial boundary inspection, acoustic vocoder artifact analysis, and cross-modal temporal consistency checks.
        </p>
      </div>

      {/* Main Upload / Progress Work Area */}
      {isAnalyzing ? (
        <AnalysisProgress
          uploadPercent={uploadProgress}
          filename={selectedFile?.name || 'video_stream.mp4'}
          onCancel={handleCancelAnalysis}
        />
      ) : (
        <div className="space-y-6">
          {!selectedFile ? (
            <VideoDropzone onFileSelect={handleFileSelect} disabled={isAnalyzing} />
          ) : (
            <VideoPreview
              file={selectedFile}
              onRemove={handleClearFile}
              onReplace={handleClearFile}
              disabled={isAnalyzing}
            />
          )}

          {/* Consent and Responsible Use Box */}
          <div className="forensic-card p-4 space-y-2 border-odoo-border bg-white shadow-odoo-xs">
            <label className="flex items-start space-x-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consentAcknowledged}
                onChange={(e) => setConsentAcknowledged(e.target.checked)}
                className="mt-1 rounded border-odoo-border text-primary focus:ring-primary shrink-0"
              />
              <span className="text-xs text-odoo-muted leading-relaxed">
                <strong className="text-odoo-text font-semibold">Responsible Use & Forensic Ethics:</strong> I confirm I have the right to analyze this media. I understand TruthLens AI provides probabilistic forensic assessment, not mathematical or legal proof of guilt or innocence.
              </span>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <ErrorState
              title="Analysis Error"
              message={error}
              onRetry={handleStartAnalysis}
              showBackHome={false}
            />
          )}

          {/* Submission Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-odoo-muted font-mono hidden sm:block">
              {selectedFile ? `Ready: ${selectedFile.name}` : 'Awaiting video input'}
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              {selectedFile && (
                <button
                  type="button"
                  onClick={handleClearFile}
                  disabled={isAnalyzing}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-odoo-border bg-white text-xs font-semibold text-odoo-muted hover:text-odoo-text hover:bg-background-secondary transition-colors focus-visible:ring-2 focus-visible:ring-primary shadow-xs"
                >
                  Clear
                </button>
              )}

              <button
                type="button"
                disabled={!selectedFile || isAnalyzing || !consentAcknowledged}
                onClick={handleStartAnalysis}
                className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-primary ${
                  !selectedFile || isAnalyzing || !consentAcknowledged
                    ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary-hover text-white shadow-odoo-sm'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Execute Deepfake Inspection</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
