import React from 'react';
import { ShieldAlert, ShieldCheck, HelpCircle, Info } from 'lucide-react';
import { DetectionOutcome } from '@/types/analysis';

interface RiskIndicatorProps {
  score: number | null | undefined;
  outcome: DetectionOutcome;
  scoreType?: string | null;
  scoreExplanation?: string | null;
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({
  score,
  outcome: _outcome,
  scoreType,
  scoreExplanation,
}) => {
  if (score === null || score === undefined) {
    return (
      <div className="forensic-card p-5 space-y-3 border-odoo-border bg-white shadow-odoo-xs">
        <div className="flex items-center space-x-2 text-odoo-muted text-xs font-mono uppercase tracking-wider font-semibold">
          <HelpCircle className="w-4 h-4 text-forensic-warning" />
          <span>Forensic Score Metric</span>
        </div>
        <p className="text-xs text-odoo-muted leading-relaxed">
          No numerical risk score was calculated for this evaluation. This occurs when inference is pending model weights or when the media does not contain sufficient detectable facial frames.
        </p>
      </div>
    );
  }

  const percentage = Math.round(score * 100);

  // Determine severity tier
  let tierColor = 'text-forensic-success';
  let tierBg = 'bg-forensic-success';
  let tierBorder = 'border-emerald-200';
  let tierSurface = 'bg-emerald-50';
  let tierLabel = 'Low Anomaly';

  if (score >= 0.50) {
    tierColor = 'text-forensic-error';
    tierBg = 'bg-forensic-error';
    tierBorder = 'border-red-200';
    tierSurface = 'bg-red-50';
    tierLabel = 'Elevated Risk';
  } else if (score >= 0.25) {
    tierColor = 'text-forensic-warning';
    tierBg = 'bg-forensic-warning';
    tierBorder = 'border-amber-200';
    tierSurface = 'bg-amber-50';
    tierLabel = 'Moderate / Inconclusive';
  }

  return (
    <div className={`forensic-card p-6 space-y-5 border ${tierBorder} bg-white shadow-odoo-xs`}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-odoo-muted font-mono uppercase tracking-wider font-semibold">
            Model Risk Index
          </span>
          <div className="flex items-baseline space-x-2 mt-0.5">
            <span className={`text-3xl font-extrabold font-mono tracking-tight ${tierColor}`}>
              {percentage}%
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold ${tierSurface} ${tierColor} border ${tierBorder}`}>
              {tierLabel}
            </span>
          </div>
        </div>

        <div className={`w-12 h-12 rounded-xl ${tierSurface} border ${tierBorder} flex items-center justify-center`}>
          {score >= 0.65 ? (
            <ShieldAlert className="w-6 h-6 text-forensic-error" />
          ) : (
            <ShieldCheck className="w-6 h-6 text-forensic-success" />
          )}
        </div>
      </div>

      {/* Visual Level Bar */}
      <div className="space-y-1.5">
        <div className="w-full bg-background-secondary h-2.5 rounded-full overflow-hidden border border-odoo-border">
          <div
            className={`h-full rounded-full transition-all duration-500 ${tierBg}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-odoo-muted font-mono">
          <span>0% (Natural)</span>
          <span>50% (Ambiguous)</span>
          <span>100% (High Anomaly)</span>
        </div>
      </div>

      {/* Plain Language Interpretation */}
      <div className="p-3.5 rounded-lg bg-background-secondary border border-odoo-border text-xs text-odoo-muted leading-relaxed space-y-1">
        <div className="flex items-center space-x-1.5 text-odoo-text font-medium text-[11px]">
          <Info className="w-3.5 h-3.5 text-primary" />
          <span>Metric: {scoreType || 'Aggregated Facial Inconsistency Score'}</span>
        </div>
        <p>
          {scoreExplanation ||
            'Calculated from statistical aggregation across localized face crops. Higher indices reflect spatial boundary seams and frequency anomalies.'}
        </p>
      </div>
    </div>
  );
};
