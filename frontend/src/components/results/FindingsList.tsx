import React from 'react';
import { CheckCircle2, ShieldCheck, Search } from 'lucide-react';

interface FindingsListProps {
  findings: string[];
}

export const FindingsList: React.FC<FindingsListProps> = ({ findings }) => {
  if (!findings || findings.length === 0) {
    return (
      <div className="forensic-card p-6 border-forensic-border/60 text-center space-y-2">
        <Search className="w-6 h-6 text-forensic-muted mx-auto" />
        <p className="text-xs text-forensic-muted">
          No granular frame findings generated for this sample.
        </p>
      </div>
    );
  }

  return (
    <div className="forensic-card p-6 sm:p-7 space-y-4">
      <div className="flex items-center justify-between border-b border-forensic-border/60 pb-3">
        <h3 className="text-sm font-semibold text-forensic-text flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-accent-cyan" />
          <span>Detailed Forensic Observations</span>
        </h3>
        <span className="text-[11px] font-mono text-forensic-muted">
          {findings.length} points documented
        </span>
      </div>

      <ul className="space-y-2.5">
        {findings.map((finding, idx) => (
          <li
            key={idx}
            className="flex items-start space-x-3 bg-background-secondary/40 p-3 rounded-lg border border-forensic-border/40 text-xs text-forensic-text/90 leading-relaxed hover:border-accent-cyan/30 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
            <span className="flex-1">{finding}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
