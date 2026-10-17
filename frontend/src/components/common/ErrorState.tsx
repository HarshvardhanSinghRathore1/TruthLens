import React from 'react';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showBackHome?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'System Warning',
  message,
  onRetry,
  showBackHome = true,
}) => {
  return (
    <div className="forensic-card p-6 border-forensic-error/30 bg-forensic-error/5 max-w-xl mx-auto space-y-4">
      <div className="flex items-start space-x-3 text-forensic-error">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="font-semibold text-sm text-forensic-text">{title}</h3>
          <p className="text-xs text-forensic-muted leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="flex items-center space-x-3 pt-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-background-card border border-forensic-border hover:border-accent-cyan text-xs font-semibold text-forensic-text transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}
        {showBackHome && (
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-background-secondary border border-forensic-border hover:bg-background-card text-xs text-forensic-muted hover:text-forensic-text transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Safety</span>
          </Link>
        )}
      </div>
    </div>
  );
};
