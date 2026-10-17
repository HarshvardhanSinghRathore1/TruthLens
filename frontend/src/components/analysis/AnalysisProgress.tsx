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
    <div className="forensic-card p-6 sm:p-10 max-w-xl mx-auto space-y-6 text-center border-accent-cyan/30 shadow-glow-cyan">
      {/* Animated Circular Scanning Core */}
      <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-accent-cyan/20 animate-ping" />
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-accent-cyan animate-spin duration-700" />
        <div className="w-14 h-14 rounded-full bg-background-card border border-accent-cyan/40 flex items-center justify-center text-accent-cyan">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
      </div>

      <div className="space-y-1.5">
        <h3 className="text-xl font-bold text-forensic-text">
          Forensic Inspection In Progress
        </h3>
        <p className="text-xs text-forensic-muted font-mono truncate max-w-sm mx-auto">
          Media: <span className="text-accent-cyan font-semibold">{filename}</span>
        </p>
      </div>

      {/* Upload Transfer Progress */}
      {uploadPercent < 100 && (
        <div className="space-y-1.5 text-left bg-background-secondary/60 p-3 rounded-lg border border-forensic-border">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-forensic-muted">Media Upload Stream</span>
            <span className="text-accent-cyan font-bold">{uploadPercent}%</span>
          </div>
          <div className="w-full bg-background rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-accent-cyan h-1.5 rounded-full transition-all duration-200"
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
                  ? 'bg-accent-cyan/10 border-accent-cyan/40 shadow-glow-cyan'
                  : isDone
                  ? 'bg-background-secondary/40 border-forensic-border/40 opacity-75'
                  : 'bg-background-secondary/20 border-transparent opacity-40'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  isCurrent
                    ? 'bg-accent-cyan text-background'
                    : isDone
                    ? 'bg-forensic-success/20 text-forensic-success'
                    : 'bg-background-secondary text-forensic-muted'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${isCurrent ? 'text-accent-cyan' : 'text-forensic-text'}`}>
                    {stage.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] text-accent-cyan font-mono animate-pulse">
                      Processing...
                    </span>
                  )}
                  {isDone && (
                    <span className="text-[10px] text-forensic-success font-mono">
                      Completed
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-forensic-muted truncate mt-0.5">
                  {stage.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-forensic-border">
        <p className="text-[11px] text-forensic-muted italic">
          Dual video + audio analysis takes ~10–15 seconds. Please do not close this window.
        </p>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center space-x-1 text-xs text-forensic-muted hover:text-forensic-error transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        )}
      </div>
    </div>
  );
};
