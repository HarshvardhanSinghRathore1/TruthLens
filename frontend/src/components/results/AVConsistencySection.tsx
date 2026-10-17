import React from 'react';
import { Layers, ShieldCheck, HelpCircle, Info } from 'lucide-react';
import { AnalysisResponse } from '@/types/analysis';

interface AVConsistencySectionProps {
  analysis: AnalysisResponse;
}

export const AVConsistencySection: React.FC<AVConsistencySectionProps> = ({ analysis }) => {
  const consistency = analysis.av_consistency;
  const isChecked = consistency && consistency.status === 'completed';

  return (
    <div className="forensic-card p-6 sm:p-7 space-y-5 border-l-4 border-l-forensic-success bg-white shadow-odoo-xs">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-odoo-border pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-forensic-success shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-odoo-text">Cross-Modal Audio-Video Consistency</h3>
            <p className="text-xs text-odoo-muted font-mono">
              Temporal Lip-Sync & Acoustic Voice Alignment
            </p>
          </div>
        </div>

        <div>
          {isChecked ? (
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-forensic-success border border-emerald-200 font-bold text-xs tracking-wide">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Consistent Temporal Sync</span>
            </div>
          ) : (
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-background-secondary text-odoo-muted border border-odoo-border font-bold text-xs tracking-wide">
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>Auxiliary Check Awaiting Inference</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs text-odoo-text leading-relaxed bg-background-secondary p-3.5 rounded-lg border border-odoo-border">
          {isChecked && consistency?.findings?.length
            ? consistency.findings.join(' ')
            : 'Cross-modal synchronization correlates visual facial articulation against acoustic speech energy bursts. Tested across sampled frames to detect dubbing latency or voice-replacement desynchronization.'}
        </p>

        {/* Scientific Caution Alert */}
        <div className="p-3.5 rounded-lg bg-background-secondary border border-odoo-border flex items-start space-x-2.5 text-xs text-odoo-muted">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong className="text-odoo-text">Scientific Caution:</strong> Desynchronization frequently occurs in authentic videos due to Bluetooth audio latency, network jitter, or variable video encoding frame-rates. A sync anomaly is an auxiliary observation, never conclusive proof of a deepfake.
          </p>
        </div>
      </div>
    </div>
  );
};
