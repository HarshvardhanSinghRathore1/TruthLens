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
          <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-lg bg-red-50 text-forensic-error border border-red-200 font-bold text-sm tracking-wide shadow-xs">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>Potential Manipulation Detected</span>
          </div>
        );
      case 'no_strong_signs_detected':
        return (
          <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-lg bg-emerald-50 text-forensic-success border border-emerald-200 font-bold text-sm tracking-wide shadow-xs">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>No Strong Signs Detected</span>
          </div>
        );
      case 'unable_to_assess':
      default:
        return (
          <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-lg bg-amber-50 text-forensic-warning border border-amber-200 font-bold text-sm tracking-wide shadow-xs">
            <HelpCircle className="w-5 h-5 shrink-0" />
            <span>Unable to Assess</span>
          </div>
        );
    }
  };

  return (
    <div className="forensic-card p-6 sm:p-7 space-y-6 border-odoo-border bg-white shadow-odoo-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-odoo-border pb-6">
        <div className="space-y-2">
          <span className="text-[11px] font-mono text-odoo-muted uppercase tracking-wider font-semibold">
            Primary Forensic Classification
          </span>
          <div>{renderAssessmentBadge(analysis.result)}</div>
        </div>

        <div className="text-left sm:text-right font-mono text-xs text-odoo-muted space-y-1">
          <div>ID: <span className="text-primary font-bold">{analysis.analysis_id}</span></div>
          {analysis.created_at && (
            <div className="flex items-center sm:justify-end space-x-1 text-[11px]">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(analysis.created_at).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Plain Language Summary */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-odoo-muted uppercase tracking-wider font-mono">
          Executive Forensic Synopsis
        </h3>
        <p className="text-sm text-odoo-text leading-relaxed bg-background-secondary p-4 rounded-xl border border-odoo-border">
          {analysis.summary}
        </p>
      </div>

      {/* Metadata Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="p-3.5 rounded-lg bg-background-secondary border border-odoo-border">
          <span className="text-[11px] text-odoo-muted flex items-center space-x-1.5 font-medium">
            <FileVideo className="w-3.5 h-3.5 text-primary" />
            <span>Media Source</span>
          </span>
          <p className="text-xs font-mono font-semibold text-odoo-text truncate mt-1.5" title={analysis.filename}>
            {analysis.filename}
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-background-secondary border border-odoo-border">
          <span className="text-[11px] text-odoo-muted flex items-center space-x-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-accent-violet" />
            <span>Duration</span>
          </span>
          <p className="text-xs font-mono font-semibold text-odoo-text mt-1.5">
            {analysis.duration_seconds !== null ? `${analysis.duration_seconds} sec` : 'Unspecified'}
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-background-secondary border border-odoo-border">
          <span className="text-[11px] text-odoo-muted flex items-center space-x-1.5 font-medium">
            <Layers className="w-3.5 h-3.5 text-forensic-success" />
            <span>Analyzed Frames</span>
          </span>
          <p className="text-xs font-mono font-semibold text-odoo-text mt-1.5">
            {analysis.frames_analyzed} frames
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-background-secondary border border-odoo-border">
          <span className="text-[11px] text-odoo-muted flex items-center space-x-1.5 font-medium">
            <Cpu className="w-3.5 h-3.5 text-primary" />
            <span>Detector Adapter</span>
          </span>
          <p className="text-xs font-mono font-semibold text-odoo-text truncate mt-1.5" title={analysis.model_name}>
            {analysis.model_name}
          </p>
        </div>
      </div>
    </div>
  );
};
