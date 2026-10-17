import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, HelpCircle, Newspaper } from 'lucide-react';
import { EvidenceStatus } from '@/types/news';

interface EvidenceBadgeProps {
  status: EvidenceStatus;
  size?: 'sm' | 'md';
}

export const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({ status, size = 'md' }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'Confirmed Manipulation':
        return {
          icon: ShieldAlert,
          bg: 'bg-red-50',
          text: 'text-forensic-error',
          border: 'border-red-200',
        };
      case 'Debunked Claim':
        return {
          icon: ShieldCheck,
          bg: 'bg-emerald-50',
          text: 'text-forensic-success',
          border: 'border-emerald-200',
        };
      case 'Under Investigation':
        return {
          icon: AlertTriangle,
          bg: 'bg-amber-50',
          text: 'text-forensic-warning',
          border: 'border-amber-200',
        };
      case 'Unverified Claim':
        return {
          icon: HelpCircle,
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
        };
      case 'General Deepfake News':
      default:
        return {
          icon: Newspaper,
          bg: 'bg-primary-surface',
          text: 'text-primary',
          border: 'border-primary/20',
        };
    }
  };

  const { icon: Icon, bg, text, border } = getBadgeConfig();
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px] space-x-1'
      : 'px-2.5 py-1 text-xs space-x-1.5';

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded-full border ${bg} ${text} ${border} ${sizeClasses}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{status}</span>
    </span>
  );
};
