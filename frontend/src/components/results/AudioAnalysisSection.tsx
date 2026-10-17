import React from 'react';
import { Mic, VolumeX, ShieldCheck, ShieldAlert, HelpCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AnalysisResponse, AudioOutcome } from '@/types/analysis';

interface AudioAnalysisSectionProps {
  analysis: AnalysisResponse;
}

export const AudioAnalysisSection: React.FC<AudioAnalysisSectionProps> = ({ analysis }) => {
  // Determine audio status
  const audioData = analysis.audio_analysis;
  const hasAudio = audioData ? audioData.has_audio : true;

  const audioOutcome: AudioOutcome = (() => {
    if (audioData?.outcome) {
      return audioData.outcome;
    }
    if (!hasAudio) {
      return 'audio_unavailable';
    }
    // Honest representation: If backend hasn't populated audio inference yet, show unable to assess
    return 'unable_to_assess';
  })();

  const renderBadge = (outcome: AudioOutcome) => {
    switch (outcome) {
      case 'potentially_spoofed_speech':
        return (
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-red-50 text-forensic-error border border-red-200 font-bold text-xs tracking-wide">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Potentially Spoofed Speech</span>
          </div>
        );
      case 'potentially_genuine_speech':
        return (
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-forensic-success border border-emerald-200 font-bold text-xs tracking-wide">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Potentially Genuine Speech</span>
          </div>
        );
      case 'audio_unavailable':
        return (
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-background-secondary text-odoo-muted border border-odoo-border font-bold text-xs tracking-wide">
            <VolumeX className="w-4 h-4 shrink-0" />
            <span>Audio Unavailable / Silent</span>
          </div>
        );
      case 'unable_to_assess':
      default:
        return (
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-amber-50 text-forensic-warning border border-amber-200 font-bold text-xs tracking-wide">
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>Unable to Assess</span>
          </div>
        );
    }
  };

  const modelName = audioData?.model_name || 'Spectrogram Acoustic Spoof Classifier (LFCC/MFCC)';

  return (
    <div className="forensic-card p-6 sm:p-7 space-y-5 border-l-4 border-l-accent-violet bg-white shadow-odoo-xs">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-odoo-border pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-primary-surface border border-accent-violet/20 flex items-center justify-center text-accent-violet shrink-0">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-odoo-text">Acoustic & Synthetic Speech Forensics</h3>
            <p className="text-xs text-odoo-muted font-mono">
              Demuxed Track: {modelName}
            </p>
          </div>
        </div>

        <div>{renderBadge(audioOutcome)}</div>
      </div>

      {audioOutcome === 'audio_unavailable' ? (
        <div className="p-4 rounded-lg bg-background-secondary border border-odoo-border text-xs text-odoo-muted space-y-1">
          <p className="font-semibold text-odoo-text">No Audio Stream Detected</p>
          <p>
            The submitted media contains no audio channels or silent audio frames. Visual analysis continues unaffected.
          </p>
        </div>
      ) : (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-lg bg-background-secondary border border-odoo-border">
              <span className="text-[11px] text-odoo-muted font-mono">Audio Stream</span>
              <p className="text-sm font-bold font-mono text-odoo-text mt-0.5">
                {audioData?.duration_seconds ? `${audioData.duration_seconds}s` : 'Demuxed PCM'}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-background-secondary border border-odoo-border">
              <span className="text-[11px] text-odoo-muted font-mono">Acoustic Spoof Index</span>
              <p className="text-sm font-bold font-mono text-accent-violet mt-0.5">
                {audioData?.risk_score !== null && audioData?.risk_score !== undefined
                  ? `${(audioData.risk_score * 100).toFixed(1)}%`
                  : 'Pending audio weights'}
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-lg bg-background-secondary border border-odoo-border">
              <span className="text-[11px] text-odoo-muted font-mono">Sampling Rate</span>
              <p className="text-sm font-bold font-mono text-odoo-text mt-0.5">
                16,000 Hz Mono
              </p>
            </div>
          </div>

          {/* Observations */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider font-mono text-odoo-muted">
              Acoustic Evidence & Observations
            </h4>
            <ul className="space-y-1.5 text-xs text-odoo-text">
              {audioData?.findings && audioData.findings.length > 0 ? (
                audioData.findings.map((f, i) => (
                  <li key={i} className="flex items-start space-x-2 bg-background-secondary p-2.5 rounded-md border border-odoo-border">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent-violet shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))
              ) : (
                <li className="flex items-start space-x-2 bg-background-secondary p-2.5 rounded-md border border-odoo-border text-odoo-muted">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-violet shrink-0 mt-0.5" />
                  <span>Audio track parsed via FFmpeg; acoustic spoof classifier ready for inference weights.</span>
                </li>
              )}
            </ul>
          </div>

          {/* Audio Limitations */}
          <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200 text-xs text-odoo-muted flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-forensic-warning shrink-0 mt-0.5" />
            <span className="text-[11px] leading-relaxed">
              Ambient background noise, low-quality microphone codecs, or music overlays may mask neural vocoder synthesis artifacts.
            </span>
          </div>
        </>
      )}
    </div>
  );
};
