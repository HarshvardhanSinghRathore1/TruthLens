import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-odoo-border bg-white py-8 text-xs text-odoo-muted transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-md bg-primary-surface flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-semibold text-odoo-text">TruthLens AI</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-odoo-text">
            <Link to="/radar" className="hover:text-primary transition-colors py-1">
              Deepfake Radar
            </Link>
            <Link to="/how-it-works" className="hover:text-primary transition-colors py-1">
              How It Works
            </Link>
            <Link to="/models" className="hover:text-primary transition-colors py-1">
              Model Specs
            </Link>
            <Link to="/analyze" className="hover:text-primary transition-colors py-1">
              Analyze Media
            </Link>
          </div>

          <p className="text-center sm:text-right font-mono text-[11px] text-odoo-muted">
            &copy; {new Date().getFullYear()} TruthLens AI. All rights reserved.
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-background-secondary border border-odoo-border flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 text-forensic-warning shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-odoo-muted">
            <strong className="text-odoo-text font-semibold">Forensic Ethics Notice:</strong> TruthLens AI provides probabilistic risk indicators based on computational facial, acoustic, and temporal consistency inspection. Model inference does not constitute mathematical or legal proof of authenticity. Never use algorithmic scores in isolation to make defamatory claims.
          </p>
        </div>
      </div>
    </footer>
  );
};
