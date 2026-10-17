import React from 'react';
import {
  X,
  ExternalLink,
  Video,
  Calendar,
  Globe,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { NewsStory } from '@/types/news';
import { EvidenceBadge } from './EvidenceBadge';

interface NewsDetailModalProps {
  story: NewsStory | null;
  onClose: () => void;
  onAnalyze: (story: NewsStory) => void;
}

export const NewsDetailModal: React.FC<NewsDetailModalProps> = ({
  story,
  onClose,
  onAnalyze,
}) => {
  if (!story) return null;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="forensic-card max-w-2xl w-full p-6 sm:p-7 space-y-6 shadow-odoo-lg border-odoo-border bg-white max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-primary tracking-wider uppercase font-semibold">
                {story.category} Case File
              </span>
              <span className="text-odoo-muted">&bull;</span>
              <span className="text-xs font-mono text-odoo-muted">
                ID: {story.id}
              </span>
            </div>
            <EvidenceBadge status={story.evidence_status} />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-background-secondary border border-odoo-border text-odoo-muted hover:text-odoo-text hover:bg-background-secondary/80 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Full Headline */}
        <h2 className="text-xl sm:text-2xl font-bold text-odoo-text leading-snug">
          {story.headline}
        </h2>

        {/* Metadata info */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-odoo-muted pb-3 border-b border-odoo-border">
          <div className="flex items-center space-x-1.5">
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span className="text-odoo-text font-semibold">{story.source}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(story.published_at)}</span>
          </div>
        </div>

        {/* Summary of what source reports */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-odoo-muted flex items-center space-x-1.5 font-semibold">
            <Info className="w-3.5 h-3.5 text-primary" />
            <span>Factual Reporting Summary</span>
          </h3>
          <p className="text-sm text-odoo-text leading-relaxed bg-background-secondary p-4 rounded-lg border border-odoo-border">
            {story.summary}
          </p>
        </div>

        {/* Verification Status & Reasoning */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-odoo-muted flex items-center space-x-1.5 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-forensic-success" />
            <span>Forensic Classification Rationale</span>
          </h3>
          <div className="p-3.5 rounded-lg bg-background-secondary border border-odoo-border text-xs text-odoo-muted leading-relaxed">
            <strong className="text-odoo-text font-medium block mb-1">
              Status: {story.evidence_status}
            </strong>
            {story.evidence_reason}
          </div>
        </div>

        {/* Unverified Aspects Note */}
        {story.unverified_aspects && (
          <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start space-x-2.5 text-xs text-odoo-muted">
            <AlertTriangle className="w-4 h-4 text-forensic-warning shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-800 font-semibold block mb-0.5">
                Technical Forensic Disclaimer:
              </strong>
              <span>{story.unverified_aspects}</span>
            </div>
          </div>
        )}

        {/* Supporting Sources */}
        {story.supporting_sources && story.supporting_sources.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-mono text-odoo-muted uppercase tracking-wider font-semibold">
              Referenced Reporting Wire:
            </h4>
            <div className="flex flex-wrap gap-2">
              {story.supporting_sources.map((src, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded bg-background-secondary border border-odoo-border text-xs font-mono text-odoo-text"
                >
                  {src}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="pt-4 border-t border-odoo-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href={story.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-white hover:bg-background-secondary border border-odoo-border text-odoo-text text-xs font-mono transition-colors shadow-xs"
          >
            <span>Read Original Article</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={() => {
              onClose();
              onAnalyze(story);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-xs transition-colors shadow-odoo-sm"
          >
            <Video className="w-4 h-4" />
            <span>Launch Video Forensic Analysis</span>
          </button>
        </div>
      </div>
    </div>
  );
};
