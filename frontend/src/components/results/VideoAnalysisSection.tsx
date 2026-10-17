import React from 'react';
import { Video, ShieldCheck, ShieldAlert, HelpCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { AnalysisResponse, VideoOutcome } from '@/types/analysis';

interface VideoAnalysisSectionProps {
  analysis: AnalysisResponse;
}

export const VideoAnalysisSection: React.FC<VideoAnalysisSectionProps> = ({ analysis }) => {
  // Extract or derive video outcome
  const videoOutcome: VideoOutcome = (() => {
    if (analysis.video_analysis?.outcome) {
      return analysis.video_analysis.outcome;
    }
    if (analysis.result === 'potential_manipulation_detected') {
      return 'potentially_manipulated';
    }
    if (analysis.result === 'no_strong_signs_detected') {
      return 'potentially_genuine';
    }
    return 'unable_to_assess';
  })();

  const renderBadge = (outcome: VideoOutcome) => {
    switch (outcome) {
      case 'potentially_manipulated':
        return (
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-forensic-error/15 text-forensic-error border border-forensic-error/40 font-bold text-xs tracking-wide">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Potentially Manipulated</span>
          </div>
        );
      case 'potentially_genuine':
        return (
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-forensic-success/15 text-forensic-success border border-forensic-success/40 font-bold text-xs tracking-wide">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Potentially Genuine</span>
          </div>
        );
      case 'unable_to_assess':
      default:
        return (
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-forensic-warning/15 text-forensic-warning border border-forensic-warning/40 font-bold text-xs tracking-wide">
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>Unable to Assess</span>
          </div>
        );
    }
  };

  const framesCount = analysis.video_analysis?.frames_analyzed ?? analysis.frames_analyzed;
  const modelName = analysis.video_analysis?.model_name ?? analysis.model_name;
  const riskScore = analysis.video_analysis?.risk_score ?? analysis.risk_score;

  return (
    <div className="forensic-card p-6 sm:p-7 space-y-5 border-l-4 border-l-accent-cyan">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-forensic-border pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-forensic-text">Visual & Facial Frame Forensics</h3>
            <p className="text-xs text-forensic-muted font-mono">
              Detector: {modelName}
            </p>
          </div>
        </div>

        <div>{renderBadge(videoOutcome)}</div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-background-secondary/50 border border-forensic-border">
          <span className="text-[11px] text-forensic-muted font-mono">Sampled Frames</span>
          <p className="text-sm font-bold font-mono text-forensic-text mt-0.5">
            {framesCount} frames
          </p>
        </div>

        <div className="p-3 rounded-lg bg-background-secondary/50 border border-forensic-border">
          <span className="text-[11px] text-forensic-muted font-mono">Visual Anomaly Index</span>
          <p className="text-sm font-bold font-mono text-accent-cyan mt-0.5">
            {riskScore !== null && riskScore !== undefined ? `${(riskScore * 100).toFixed(1)}%` : 'Pending weights'}
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3 rounded-lg bg-background-secondary/50 border border-forensic-border">
          <span className="text-[11px] text-forensic-muted font-mono">Facial Boundaries</span>
          <p className="text-sm font-bold font-mono text-forensic-text mt-0.5">
            {analysis.frame_results?.reduce((acc, f) => acc + (f.faces_detected || 0), 0) ?? 0} localized
          </p>
        </div>
      </div>

      {/* Observations */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider font-mono text-forensic-muted">
          Visual Evidence & Findings
        </h4>
        <ul className="space-y-1.5 text-xs text-forensic-text/90">
          {(analysis.video_analysis?.findings ?? analysis.findings).slice(0, 3).map((f, i) => (
            <li key={i} className="flex items-start space-x-2 bg-background-secondary/30 p-2.5 rounded-md border border-forensic-border/50">
              <CheckCircle2 className="w-3.5 h-3.5 text-accent-cyan shrink-0 mt-0.5" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Video Limitations */}
      <div className="p-3 rounded-lg bg-background-secondary/30 border border-forensic-border/60 text-xs text-forensic-muted flex items-start space-x-2">
        <AlertTriangle className="w-4 h-4 text-forensic-warning shrink-0 mt-0.5" />
        <span className="text-[11px] leading-relaxed">
          Heavy H.264/H.265 compression artifacts, dynamic motion blur, and non-frontal angles reduce detection reliability.
        </span>
      </div>
    </div>
  );
};
