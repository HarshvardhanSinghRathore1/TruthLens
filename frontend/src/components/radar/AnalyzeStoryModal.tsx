import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Video,
  Upload,
  Link as LinkIcon,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { NewsStory } from '@/types/news';
import { apiService } from '@/services/api';

interface AnalyzeStoryModalProps {
  story: NewsStory | null;
  onClose: () => void;
}

export const AnalyzeStoryModal: React.FC<AnalyzeStoryModalProps> = ({ story, onClose }) => {
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!story) return null;

  const handleRemoteUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) {
      setErrorMessage('Please enter a valid HTTP or HTTPS video URL.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      // Call backend remote URL analysis endpoint
      const result = await apiService.analyzeRemoteVideo(videoUrl.trim(), story.id);

      // Successfully processed! Redirect to results page
      navigate('/results', { state: { result } });
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          'Failed to analyze video URL. Please verify that the link points directly to a public MP4/WebM file.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectUploadNavigate = () => {
    onClose();
    navigate('/analyze', {
      state: {
        referencedStory: {
          id: story.id,
          headline: story.headline,
          source: story.source,
        },
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="forensic-card max-w-xl w-full p-6 sm:p-7 space-y-6 shadow-odoo-lg border-odoo-border bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary-surface border border-primary/20 flex items-center justify-center text-primary">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-odoo-text">
                Forensic Video Inspection
              </h2>
              <p className="text-xs text-odoo-muted font-mono">
                Case: {story.source} &bull; {story.category}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-background-secondary border border-odoo-border text-odoo-muted hover:text-odoo-text transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Case Context Pill */}
        <div className="p-3 rounded-lg bg-background-secondary border border-odoo-border text-xs">
          <span className="text-odoo-muted font-mono uppercase tracking-wider block text-[10px] font-semibold">
            Target Story
          </span>
          <p className="font-semibold text-odoo-text truncate mt-0.5">
            {story.headline}
          </p>
        </div>

        {/* Technical Notice */}
        <div className="p-3.5 rounded-lg bg-primary-surface/60 border border-primary/20 flex items-start space-x-2.5 text-xs text-odoo-muted">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            News article links point to web pages, not direct video files. Due to copyright, authentication, and DRM restrictions, TruthLens AI analyzes video files directly through our neural detection models rather than scraping paywalled sites.
          </p>
        </div>

        {/* Option A: Direct File Upload (Recommended) */}
        <div className="p-4 rounded-xl bg-background-secondary border border-odoo-border hover:border-primary/40 transition-colors space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
              Option 1 &mdash; Upload Media File (Recommended)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-forensic-success border border-emerald-200 font-semibold">
              Direct Inference
            </span>
          </div>
          <p className="text-xs text-odoo-muted leading-relaxed">
            If you have a lawful copy, screen recording, or downloaded video clip (.mp4, .mov, .webm) from this news story, inspect it directly.
          </p>
          <button
            type="button"
            onClick={handleDirectUploadNavigate}
            className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-xs transition-colors shadow-odoo-sm"
          >
            <Upload className="w-4 h-4" />
            <span>Open Media Scanner with Target Case</span>
          </button>
        </div>

        {/* Option B: Direct URL Input */}
        <div className="p-4 rounded-xl bg-background-secondary border border-odoo-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-odoo-text uppercase tracking-wider">
              Option 2 &mdash; Direct Video Stream URL
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-odoo-muted border border-odoo-border font-semibold">
              Public .mp4 only
            </span>
          </div>

          <form onSubmit={handleRemoteUrlSubmit} className="space-y-3">
            <div className="relative">
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://example.com/direct_sample.mp4"
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 text-xs bg-white border border-odoo-border rounded-lg text-odoo-text placeholder-odoo-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start space-x-2 text-xs text-forensic-error">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !videoUrl.trim()}
              className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-white border border-odoo-border hover:bg-background-secondary text-odoo-text font-semibold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span>Validating & Running Model Inference...</span>
                </>
              ) : (
                <>
                  <LinkIcon className="w-3.5 h-3.5 text-primary" />
                  <span>Download & Inspect Remote Stream</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Forensic Disclaimer */}
        <div className="text-[11px] text-odoo-muted font-mono flex items-center space-x-1.5 justify-center">
          <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>Independent AI model evaluation &bull; Not legal proof</span>
        </div>
      </div>
    </div>
  );
};
