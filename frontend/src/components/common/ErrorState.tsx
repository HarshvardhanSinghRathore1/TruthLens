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
    <div className="forensic-card p-6 border-red-200 bg-red-50/50 max-w-xl mx-auto space-y-4 shadow-odoo-xs">
      <div className="flex items-start space-x-3 text-forensic-error">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="font-semibold text-sm text-odoo-text">{title}</h3>
          <p className="text-xs text-odoo-muted leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="flex items-center space-x-3 pt-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-odoo-border hover:border-primary/40 text-xs font-semibold text-odoo-text transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-primary" />
            <span>Try Again</span>
          </button>
        )}
        {showBackHome && (
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-odoo-border hover:bg-background-secondary text-xs text-odoo-muted hover:text-odoo-text transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        )}
      </div>
    </div>
  );
};
