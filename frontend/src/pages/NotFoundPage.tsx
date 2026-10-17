import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto py-24 text-center px-4 space-y-6">
      <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-forensic-warning shadow-xs">
        <AlertCircle className="w-8 h-8" />
      </div>
      <div>
        <h1 className="text-3xl font-extrabold text-odoo-text">404</h1>
        <p className="text-sm text-odoo-muted mt-2">
          The requested forensic resource or page does not exist.
        </p>
      </div>
      <div>
        <Link
          to="/"
          className="btn-odoo-primary space-x-2 px-5 py-2.5 min-h-[42px] text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};
