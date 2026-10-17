import React from 'react';
import { Link } from 'react-router-dom';
import {
  Video,
  Mic,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-surface border border-primary/20 text-primary text-xs font-mono font-medium">
          <Layers className="w-3.5 h-3.5" />
          <span>Multimodal Digital Forensics Pipeline</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-odoo-text">
          How TruthLens AI Analyzes Media
        </h1>
        <p className="text-sm sm:text-base text-odoo-muted leading-relaxed">
          TruthLens AI combines computer vision, acoustic forensics, and cross-modal temporal consistency
          to detect synthetic manipulations without simulating confidence scores.
        </p>
      </div>

      {/* Step by Step Breakdown */}
      <div className="space-y-6">
        {/* Step 1 */}
        <div className="forensic-card p-6 sm:p-8 space-y-4 border-l-4 border-l-primary bg-white shadow-odoo-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-primary px-2.5 py-1 rounded bg-primary-surface border border-primary/20">
              STAGE 01
            </span>
            <span className="text-xs text-odoo-muted font-mono font-medium">Input Verification</span>
          </div>
          <h2 className="text-xl font-bold text-odoo-text">Media Decodability & Demuxing</h2>
          <p className="text-sm text-odoo-muted leading-relaxed">
            When you submit a video, the server buffers the media and validates container decodability,
            resolution, frame rate, and maximum file size limits (100MB). Using FFmpeg media demuxing, the
            audio stream is cleanly separated from visual frames for independent parallel evaluation.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3.5 rounded-lg bg-background-secondary border border-odoo-border flex items-center space-x-2.5">
              <Video className="w-4 h-4 text-primary shrink-0" />
              <span className="text-odoo-text font-medium">Video Stream: Sampled at uniform keyframe intervals</span>
            </div>
            <div className="p-3.5 rounded-lg bg-background-secondary border border-odoo-border flex items-center space-x-2.5">
              <Mic className="w-4 h-4 text-accent-violet shrink-0" />
              <span className="text-odoo-text font-medium">Audio Stream: Extracted to uncompressed 16kHz PCM</span>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="forensic-card p-6 sm:p-8 space-y-4 border-l-4 border-l-accent-violet bg-white shadow-odoo-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-accent-violet px-2.5 py-1 rounded bg-primary-surface border border-accent-violet/20">
              STAGE 02
            </span>
            <span className="text-xs text-odoo-muted font-mono font-medium">Computer Vision</span>
          </div>
          <h2 className="text-xl font-bold text-odoo-text">Facial Localization & Boundary Inspection</h2>
          <p className="text-sm text-odoo-muted leading-relaxed">
            OpenCV extracts facial bounding boxes across temporal keyframes. The facial regions are
            normalized and passed to pretrained deep neural detectors (ResNet / EfficientNet adapters). The model inspects facial blending boundaries, color gamut irregularities,
            and ocular frequency distortions.
          </p>
          <ul className="space-y-2 text-xs text-odoo-muted">
            <li className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-accent-violet" />
              <span>Detects seam artifacts created by facial swap reenactment models</span>
            </li>
            <li className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-accent-violet" />
              <span>Flags spatial inconsistencies between facial skin texture and background lighting</span>
            </li>
          </ul>
        </div>

        {/* Step 3 */}
        <div className="forensic-card p-6 sm:p-8 space-y-4 border-l-4 border-l-forensic-warning bg-white shadow-odoo-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-forensic-warning px-2.5 py-1 rounded bg-amber-50 border border-amber-200">
              STAGE 03
            </span>
            <span className="text-xs text-odoo-muted font-mono font-medium">Acoustic Forensics</span>
          </div>
          <h2 className="text-xl font-bold text-odoo-text">Acoustic Spoof & Synthetic Voice Detection</h2>
          <p className="text-sm text-odoo-muted leading-relaxed">
            The extracted audio is converted into high-resolution Mel-frequency spectrograms and linear
            frequency cepstral coefficients (LFCC). The audio detector scans for unnatural phase transitions,
            robotic frequency cutoffs, vocoder harmonics, and breath cycle inconsistencies characteristic of
            TTS (Text-to-Speech) and voice-conversion models.
          </p>
        </div>

        {/* Step 4 */}
        <div className="forensic-card p-6 sm:p-8 space-y-4 border-l-4 border-l-forensic-success bg-white shadow-odoo-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-forensic-success px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200">
              STAGE 04
            </span>
            <span className="text-xs text-odoo-muted font-mono font-medium">Multi-Modal Reporting</span>
          </div>
          <h2 className="text-xl font-bold text-odoo-text">Cross-Modal Synthesis & Ethical Reporting</h2>
          <p className="text-sm text-odoo-muted leading-relaxed">
            Rather than inventing a single opaque percentage, TruthLens AI presents the evidence transparently:
            individual video findings, audio findings, and audio-video temporal synchronization. If inference cannot
            run or audio is silent, the platform reports <code className="text-primary font-mono font-semibold px-1 py-0.5 rounded bg-primary-surface">Unable to Assess</code> rather than fabricating certainty.
          </p>
        </div>
      </div>

      {/* Limitations Callout */}
      <div className="forensic-card p-6 sm:p-8 border-amber-200 bg-amber-50/50 space-y-3 shadow-odoo-xs">
        <div className="flex items-center space-x-2 text-forensic-warning font-semibold text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Core Forensic Limitation</span>
        </div>
        <p className="text-xs sm:text-sm text-odoo-muted leading-relaxed">
          No automated deepfake detection tool can prove that a video is 100% authentic. Highly compressed
          media, low lighting, or modern generative diffusion models may yield false positives or false
          negatives. TruthLens AI findings are forensic risk indicators to guide human review, not mathematical
          proof of intent.
        </p>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link
          to="/analyze"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition-colors shadow-odoo-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Video className="w-4 h-4" />
          <span>Launch Scanner Terminal</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
