import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface LimitationsNoticeProps {
  limitations: string[];
}

export const LimitationsNotice: React.FC<LimitationsNoticeProps> = ({ limitations }) => {
  return (
    <div className="forensic-card p-6 sm:p-7 space-y-4 border-amber-200 bg-amber-50/40 shadow-odoo-xs">
      <div className="flex items-center space-x-2.5 text-forensic-warning border-b border-amber-200/60 pb-3">
        <AlertTriangle className="w-5 h-5 shrink-0" />
        <h3 className="text-sm font-bold text-odoo-text">
          Forensic Scope, Disclaimers & Technical Limitations
        </h3>
      </div>

      <ul className="space-y-2">
        {limitations.map((lim, idx) => (
          <li key={idx} className="flex items-start space-x-2.5 text-xs text-odoo-muted leading-relaxed">
            <span className="text-forensic-warning font-mono font-bold mt-0.5">&mdash;</span>
            <span className="flex-1">{lim}</span>
          </li>
        ))}
      </ul>

      <div className="pt-2 text-[11px] text-odoo-muted border-t border-amber-200/60 space-y-1">
        <p>
          <strong className="text-odoo-text font-semibold">Integrity Notice:</strong> TruthLens AI does not claim mathematical certainty or establish the original source of a video. Results represent algorithmic consistency estimation.
        </p>
      </div>
    </div>
  );
};
