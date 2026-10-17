import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-forensic-border bg-background-secondary/70 py-8 text-xs text-forensic-muted transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-accent-cyan" />
            <span className="font-semibold text-forensic-text">TruthLens AI</span>
            <span>&bull;</span>
            <span className="font-mono">Cyber Samvad Hackathon 2026</span>
          </div>

          <div className="flex items-center space-x-4 text-xs font-medium">
            <Link to="/how-it-works" className="hover:text-accent-cyan transition-colors">
              How It Works
            </Link>
            <Link to="/models" className="hover:text-accent-cyan transition-colors">
              Model Specs
            </Link>
            <Link to="/analyze" className="hover:text-accent-cyan transition-colors">
              Analyze Media
            </Link>
          </div>

          <p className="text-center sm:text-right font-mono text-[11px]">
            &copy; {new Date().getFullYear()} TruthLens AI Team.
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-background-card border border-forensic-border flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 text-forensic-warning shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong className="text-forensic-text font-semibold">Forensic Ethics Notice:</strong> TruthLens AI provides probabilistic risk indicators based on computational facial, acoustic, and temporal consistency inspection. Model inference does not constitute mathematical or legal proof of authenticity. Never use algorithmic scores in isolation to make defamatory claims.
          </p>
        </div>
      </div>
    </footer>
  );
};
