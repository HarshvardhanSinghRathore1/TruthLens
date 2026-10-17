import React, { useEffect, useState } from 'react';
import { Loader2, Video, Mic, Search, Cpu, FileCheck2, XCircle, Layers } from 'lucide-react';

interface AnalysisProgressProps {
  uploadPercent?: number;
  filename: string;
  onCancel?: () => void;
}

const STAGES = [
  { id: 'upload', label: 'Streaming Media Payload', icon: Video, desc: 'Buffering video and verifying container decodability' },
  { id: 'extract', label: 'Facial Keyframe Extraction', icon: Search, desc: 'OpenCV extracting and normalizing face bounding crops' },
  { id: 'video_model', label: 'Video Facial Neural Inference', icon: Cpu, desc: 'Classifying facial boundary seams and warping artifacts' },
  { id: 'audio_demux', label: 'Audio Demuxing & Spoof Detection', icon: Mic, desc: 'FFmpeg extracting 16kHz audio for acoustic spectral analysis' },
  { id: 'av_sync', label: 'Audio-Video Temporal Alignment', icon: Layers, desc: 'Evaluating speech energy against facial articulation' },
  { id: 'report', label: 'Compiling Forensics Dossier', icon: FileCheck2, desc: 'Aggregating multimodal risk indices and limitations' },
];

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  uploadPercent = 0,
  filename,
  onCancel,
}) => {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    // Progressively step through realistic forensic stages
    const timer = setInterval(() => {
      setActiveStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 2800);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="forensic-card p-6 sm:p-10 max-w-xl mx-auto space-y-6 text-center border-odoo-border bg-white shadow-odoo-md">
      {/* Animated Circular Scanning Core */}
      <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary animate-spin duration-700" />
        <div className="w-14 h-14 rounded-full bg-primary-surface border border-primary/30 flex items-center justify-center text-primary">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
      </div>

      <div className="space-y-1.5">
        <h3 className="text-xl font-bold text-odoo-text">
          Forensic Inspection In Progress
        </h3>
        <p className="text-xs text-odoo-muted font-mono truncate max-w-sm mx-auto">
          Media: <span className="text-primary font-semibold">{filename}</span>
        </p>
      </div>

      {/* Upload Transfer Progress */}
      {uploadPercent < 100 && (
        <div className="space-y-1.5 text-left bg-background-secondary p-3.5 rounded-lg border border-odoo-border">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-odoo-muted">Media Upload Stream</span>
            <span className="text-primary font-bold">{uploadPercent}%</span>
          </div>
          <div className="w-full bg-white border border-odoo-border rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-200"
              style={{ width: `${uploadPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Forensic Stages Stepper */}
      <div className="space-y-2.5 text-left">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = idx < activeStage;
          const isCurrent = idx === activeStage;

          return (
            <div
              key={stage.id}
              className={`p-3 rounded-lg border transition-all flex items-start space-x-3 ${
                isCurrent
                  ? 'bg-primary-surface border-primary/40 shadow-xs'
                  : isDone
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-background-secondary/60 border-odoo-border/60 opacity-60'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  isCurrent
                    ? 'bg-primary text-white'
                    : isDone
                    ? 'bg-emerald-100 text-forensic-success'
                    : 'bg-white border border-odoo-border text-odoo-muted'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${isCurrent ? 'text-primary' : 'text-odoo-text'}`}>
                    {stage.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] text-primary font-medium animate-pulse">
                      Processing...
                    </span>
                  )}
                  {isDone && (
                    <span className="text-[10px] text-forensic-success font-medium">
                      Completed
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-odoo-muted truncate mt-0.5">
                  {stage.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-forensic-border">
        <p className="text-[11px] text-forensic-muted italic">
          Forensic inference runs locally on CPU/GPU. High-resolution media may take 30–60 seconds. Please do not close this window.
        </p>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center space-x-1 text-xs text-odoo-muted hover:text-forensic-error transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        )}
      </div>
    </div>
  );
};
