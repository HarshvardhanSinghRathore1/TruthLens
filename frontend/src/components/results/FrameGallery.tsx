import React from 'react';
import { Film, UserCheck } from 'lucide-react';
import { FrameResult } from '@/types/analysis';

interface FrameGalleryProps {
  frames?: FrameResult[];
  framesAnalyzed: number;
}

export const FrameGallery: React.FC<FrameGalleryProps> = ({
  frames,
  framesAnalyzed,
}) => {
  if (!frames || frames.length === 0) {
    return (
      <div className="forensic-card p-6 border-odoo-border bg-white text-center space-y-2 shadow-odoo-xs">
        <Film className="w-6 h-6 text-odoo-muted mx-auto" />
        <p className="text-xs text-odoo-muted">
          Extracted {framesAnalyzed} frames for batch inference. Individual frame inspect-logs unavailable.
        </p>
      </div>
    );
  }

  return (
    <div className="forensic-card p-6 sm:p-7 space-y-4 border-odoo-border bg-white shadow-odoo-xs">
      <div className="flex items-center justify-between border-b border-odoo-border pb-3">
        <div>
          <h3 className="text-sm font-semibold text-odoo-text flex items-center space-x-2">
            <Film className="w-4 h-4 text-accent-violet" />
            <span>Sampled Frame Timeline & Inspection Logs</span>
          </h3>
          <p className="text-[11px] text-odoo-muted mt-0.5">
            Temporal keyframes evaluated by OpenCV facial detector and neural inference
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-primary-surface border border-primary/20 text-primary font-semibold">
          {frames.length} sampled
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {frames.map((frame) => {
          const scorePercent =
            frame.manipulation_score !== null && frame.manipulation_score !== undefined
              ? Math.round(frame.manipulation_score * 100)
              : null;

          return (
            <div
              key={frame.frame_index}
              className="p-3.5 rounded-lg bg-background-secondary border border-odoo-border space-y-2.5 hover:border-primary/40 transition-all text-xs font-mono shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-primary font-bold">
                  Frame #{frame.frame_index}
                </span>
                <span className="text-odoo-muted text-[10px]">
                  @{frame.timestamp_seconds.toFixed(2)}s
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px]">
                <div className="flex items-center space-x-1 text-odoo-text font-medium">
                  <UserCheck className="w-3.5 h-3.5 text-primary" />
                  <span>{frame.faces_detected} {frame.faces_detected === 1 ? 'face' : 'faces'}</span>
                </div>

                {scorePercent !== null ? (
                  <span
                    className={`font-bold ${
                      scorePercent >= 65
                        ? 'text-forensic-error'
                        : scorePercent >= 35
                        ? 'text-forensic-warning'
                        : 'text-forensic-success'
                    }`}
                  >
                    {scorePercent}% Anomaly
                  </span>
                ) : (
                  <span className="text-odoo-muted text-[10px]">Unscored</span>
                )}
              </div>

              {frame.notes && (
                <p className="text-[11px] text-odoo-muted font-sans line-clamp-2 leading-relaxed border-t border-odoo-border pt-1.5">
                  {frame.notes}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
