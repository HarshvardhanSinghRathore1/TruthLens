import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  HelpCircle,
  FileVideo,
  Clock,
  Layers,
  Cpu,
  Calendar,
} from 'lucide-react';
import { AnalysisResponse, DetectionOutcome } from '@/types/analysis';

interface ResultSummaryProps {
  analysis: AnalysisResponse;
}

export const ResultSummary: React.FC<ResultSummaryProps> = ({ analysis }) => {
  const renderAssessmentBadge = (outcome: DetectionOutcome) => {
    switch (outcome) {
      case 'potential_manipulation_detected':
        return (
          <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-xl bg-forensic-error/15 text-forensic-error border border-forensic-error/40 font-bold text-sm tracking-wide shadow-[0_0_20px_-3px_rgba(239,68,68,0.3)]">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>Potential Manipulation Detected</span>
          </div>
        );
      case 'no_strong_signs_detected':
        return (
          <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-xl bg-forensic-success/15 text-forensic-success border border-forensic-success/40 font-bold text-sm tracking-wide shadow-[0_0_20px_-3px_rgba(34,197,94,0.3)]">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>No Strong Signs Detected</span>
          </div>
        );
      case 'unable_to_assess':
      default:
        return (
          <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-xl bg-forensic-warning/15 text-forensic-warning border border-forensic-warning/40 font-bold text-sm tracking-wide shadow-[0_0_20px_-3px_rgba(245,158,11,0.3)]">
            <HelpCircle className="w-5 h-5 shrink-0" />
            <span>Unable to Assess</span>
          </div>
        );
    }
  };

  return (
    <div className="forensic-card p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forensic-border/60 pb-6">
        <div className="space-y-2">
          <span className="text-[11px] font-mono text-forensic-muted uppercase tracking-wider">
            Primary Forensic Classification
          </span>
          <div>{renderAssessmentBadge(analysis.result)}</div>
        </div>

        <div className="text-left sm:text-right font-mono text-xs text-forensic-muted space-y-1">
          <div>ID: <span className="text-accent-cyan font-bold">{analysis.analysis_id}</span></div>
          {analysis.created_at && (
            <div className="flex items-center sm:justify-end space-x-1 text-[11px]">
              <Calendar className="w-3 h-3" />
              <span>{new Date(analysis.created_at).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Plain Language Summary */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-forensic-muted uppercase tracking-wider font-mono">
          Executive Forensic Synopsis
        </h3>
        <p className="text-sm text-forensic-text/95 leading-relaxed bg-background-secondary/60 p-4 rounded-xl border border-forensic-border/60">
          {analysis.summary}
        </p>
      </div>

      {/* Metadata Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="p-3 rounded-lg bg-background-secondary/40 border border-forensic-border/50">
          <span className="text-[11px] text-forensic-muted flex items-center space-x-1.5 font-mono">
            <FileVideo className="w-3.5 h-3.5 text-accent-cyan" />
            <span>Media Source</span>
          </span>
          <p className="text-xs font-mono font-semibold text-forensic-text truncate mt-1" title={analysis.filename}>
            {analysis.filename}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-background-secondary/40 border border-forensic-border/50">
          <span className="text-[11px] text-forensic-muted flex items-center space-x-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-accent-violet" />
            <span>Duration</span>
          </span>
          <p className="text-xs font-mono font-semibold text-forensic-text mt-1">
            {analysis.duration_seconds !== null ? `${analysis.duration_seconds} sec` : 'Unspecified'}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-background-secondary/40 border border-forensic-border/50">
          <span className="text-[11px] text-forensic-muted flex items-center space-x-1.5 font-mono">
            <Layers className="w-3.5 h-3.5 text-forensic-success" />
            <span>Analyzed Frames</span>
          </span>
          <p className="text-xs font-mono font-semibold text-forensic-text mt-1">
            {analysis.frames_analyzed} frames
          </p>
        </div>

        <div className="p-3 rounded-lg bg-background-secondary/40 border border-forensic-border/50">
          <span className="text-[11px] text-forensic-muted flex items-center space-x-1.5 font-mono">
            <Cpu className="w-3.5 h-3.5 text-accent-cyan" />
            <span>Detector Adapter</span>
          </span>
          <p className="text-xs font-mono font-semibold text-forensic-text truncate mt-1" title={analysis.model_name}>
            {analysis.model_name}
          </p>
        </div>
      </div>
    </div>
  );
};
