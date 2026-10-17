import React from 'react';
import { CheckCircle2, ShieldCheck, Search } from 'lucide-react';

interface FindingsListProps {
  findings: string[];
}

export const FindingsList: React.FC<FindingsListProps> = ({ findings }) => {
  if (!findings || findings.length === 0) {
    return (
      <div className="forensic-card p-6 border-odoo-border bg-white text-center space-y-2 shadow-odoo-xs">
        <Search className="w-6 h-6 text-odoo-muted mx-auto" />
        <p className="text-xs text-odoo-muted">
          No granular frame findings generated for this sample.
        </p>
      </div>
    );
  }

  return (
    <div className="forensic-card p-6 sm:p-7 space-y-4 border-odoo-border bg-white shadow-odoo-xs">
      <div className="flex items-center justify-between border-b border-odoo-border pb-3">
        <h3 className="text-sm font-semibold text-odoo-text flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Detailed Forensic Observations</span>
        </h3>
        <span className="text-[11px] font-mono text-odoo-muted">
          {findings.length} points documented
        </span>
      </div>

      <ul className="space-y-2.5">
        {findings.map((finding, idx) => (
          <li
            key={idx}
            className="flex items-start space-x-3 bg-background-secondary p-3 rounded-lg border border-odoo-border text-xs text-odoo-text leading-relaxed hover:border-primary/40 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span className="flex-1">{finding}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
