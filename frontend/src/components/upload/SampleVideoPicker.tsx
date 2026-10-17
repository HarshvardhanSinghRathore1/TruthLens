import React from 'react';
import { ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react';

interface SampleOption {
  id: string;
  title: string;
  category: 'genuine' | 'deepfake';
  description: string;
  duration: string;
}

interface SampleVideoPickerProps {
  onSelectSample: (sample: SampleOption) => void;
  disabled?: boolean;
}

export const SAMPLES: SampleOption[] = [
  {
    id: 'sample-interview-real',
    title: 'Executive Interview (Authentic)',
    category: 'genuine',
    description: 'Broadcast interview recording with natural ocular micro-movements and consistent head pose boundaries.',
    duration: '8.4s',
  },
  {
    id: 'sample-deepfake-manipulated',
    title: 'Synthetic Face Swap (Manipulated)',
    category: 'deepfake',
    description: 'Neural face-reenactment with blended mask seam anomalies and boundary smoothing.',
    duration: '6.2s',
  },
];

export const SampleVideoPicker: React.FC<SampleVideoPickerProps> = ({
  onSelectSample,
  disabled = false,
}) => {
  return (
    <div className="space-y-3 pt-4 border-t border-forensic-border/60">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-forensic-muted flex items-center space-x-1.5 uppercase font-mono tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
          <span>Hackathon Demo Test Samples</span>
        </span>
        <span className="text-[11px] text-forensic-muted font-mono">1-Click Live Test</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SAMPLES.map((sample) => {
          const isDeepfake = sample.category === 'deepfake';
          return (
            <button
              key={sample.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectSample(sample)}
              className="forensic-card p-3.5 text-left transition-all hover:border-accent-cyan/60 group relative overflow-hidden"
            >
              <div className="flex items-start space-x-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isDeepfake
                      ? 'bg-forensic-error/10 text-forensic-error border border-forensic-error/20'
                      : 'bg-forensic-success/10 text-forensic-success border border-forensic-success/20'
                  }`}
                >
                  {isDeepfake ? (
                    <ShieldAlert className="w-4 h-4" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-forensic-text group-hover:text-accent-cyan transition-colors">
                      {sample.title}
                    </span>
                    <span className="text-[10px] font-mono text-forensic-muted">
                      ({sample.duration})
                    </span>
                  </div>
                  <p className="text-[11px] text-forensic-muted line-clamp-2 leading-relaxed">
                    {sample.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
