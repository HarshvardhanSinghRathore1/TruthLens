import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto py-24 text-center px-4 space-y-6">
      <div className="w-16 h-16 mx-auto rounded-full bg-forensic-warning/10 border border-forensic-warning/30 flex items-center justify-center text-forensic-warning">
        <AlertCircle className="w-8 h-8" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-forensic-text">404</h1>
        <p className="text-sm text-forensic-muted mt-2">
          The requested forensic resource or page does not exist.
        </p>
      </div>
      <div>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-accent-cyan text-background font-semibold text-xs hover:bg-accent-cyan/90 transition-all shadow-glow-cyan"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Headquarters</span>
        </Link>
      </div>
    </div>
  );
};
