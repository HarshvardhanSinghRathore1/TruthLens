import React from 'react';
import { Shield, AlertCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-forensic-border bg-background-secondary/60 py-8 text-xs text-forensic-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-accent-cyan" />
            <span className="font-semibold text-forensic-text">TruthLens AI</span>
            <span>&bull;</span>
            <span className="font-mono">Cyber Samvad Hackathon 2026</span>
          </div>

          <p className="text-center sm:text-right font-mono">
            &copy; {new Date().getFullYear()} TruthLens AI Team. All rights reserved.
          </p>
        </div>

        <div className="p-3 rounded-lg bg-background-card border border-forensic-border/70 flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 text-forensic-warning shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong className="text-forensic-text font-medium">Forensic Notice:</strong> TruthLens AI provides probabilistic risk indicators based on computational facial and temporal feature inspection. Model inference is not mathematical or legal proof of authenticity. Never use detection scores in isolation to make defamatory claims.
          </p>
        </div>
      </div>
    </footer>
  );
};
