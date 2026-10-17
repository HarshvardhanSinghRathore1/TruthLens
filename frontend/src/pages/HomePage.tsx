import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Video,
  Mic,
  ArrowRight,
  Eye,
  Layers,
  Lock,
  Radio,
  CheckCircle2,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
        {/* Category Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary-surface border border-primary/20 text-primary text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Digital Media Forensics</span>
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-odoo-text leading-tight">
            <span>See Beyond the Fake with </span>
            <span className="text-primary">TruthLens AI</span>
          </h1>
          <p className="text-base sm:text-lg text-odoo-muted max-w-2xl mx-auto leading-relaxed">
            Verify video and audio for signs of generative manipulation and synthetic speech. Inspect real evidence, explore technical limits, and protect information integrity.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/analyze"
            className="btn-odoo-primary w-full sm:w-auto space-x-2 px-6 py-3 min-h-[46px] text-sm font-semibold"
          >
            <Video className="w-4 h-4" />
            <span>Analyze Media</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/radar"
            className="btn-odoo-soft w-full sm:w-auto space-x-2 px-6 py-3 min-h-[46px] text-sm font-semibold"
          >
            <Radio className="w-4 h-4 text-inherit" />
            <span>Deepfake Radar</span>
          </Link>

          <Link
            to="/how-it-works"
            className="btn-odoo-secondary w-full sm:w-auto space-x-2 px-6 py-3 min-h-[46px] text-sm font-semibold"
          >
            <Eye className="w-4 h-4 text-primary" />
            <span>How It Works</span>
          </Link>
        </div>

        {/* Forensics Inspection Visual Box */}
        <div className="pt-6 max-w-3xl mx-auto">
          <div className="forensic-card p-5 sm:p-6 text-left border-odoo-border bg-white shadow-odoo-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Visual Track Preview */}
              <div className="space-y-2 p-3.5 rounded-lg bg-background-secondary border border-odoo-border">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-odoo-text font-semibold flex items-center space-x-1.5">
                    <Video className="w-3.5 h-3.5 text-primary" />
                    <span>Visual Temporal Track</span>
                  </span>
                  <span className="text-[11px] font-mono text-primary font-semibold">15 FPS &bull; OpenCV</span>
                </div>
                {/* SVG Visual Keyframe Sequence */}
                <div className="flex items-center space-x-1.5 h-10 overflow-hidden">
                  {[0.12, 0.15, 0.14, 0.18, 0.16, 0.13, 0.15].map((val, i) => (
                    <div
                      key={i}
                      className="flex-1 h-full rounded bg-white border border-odoo-border flex flex-col justify-end p-0.5 group relative"
                    >
                      <div
                        className="w-full rounded-sm bg-primary/30 group-hover:bg-primary transition-all"
                        style={{ height: `${Math.round(val * 250)}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Acoustic Track Preview */}
              <div className="space-y-2 p-3.5 rounded-lg bg-background-secondary border border-odoo-border">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-odoo-text font-semibold flex items-center space-x-1.5">
                    <Mic className="w-3.5 h-3.5 text-accent-violet" />
                    <span>Acoustic Waveform Track</span>
                  </span>
                  <span className="text-[11px] font-mono text-accent-violet font-semibold">16 kHz PCM</span>
                </div>
                {/* SVG Waveform Simulation */}
                <svg className="w-full h-10 text-primary/70" viewBox="0 0 200 40" fill="none">
                  <path
                    d="M0 20 Q10 5, 20 20 T40 20 T60 8 T80 32 T100 15 T120 25 T140 10 T160 30 T180 18 T200 20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M0 20 Q10 12, 20 20 T40 20 T60 14 T80 26 T100 18 T120 22 T140 16 T160 24 T180 19 T200 20"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeOpacity="0.3"
                  />
                </svg>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 text-[11px] font-medium text-odoo-muted border-t border-odoo-border mt-3">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-forensic-success" />
                <span>Dual Modality Synchronizer: Ready</span>
              </span>
              <span>Integrity Verification Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* Multimodal Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-odoo-text">
            Three Forensic Pillars
          </h2>
          <p className="text-sm text-odoo-muted max-w-xl mx-auto">
            Deepfake manipulation rarely stays confined to pixels alone. TruthLens AI evaluates visual, acoustic, and temporal synchronization indicators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Video */}
          <div className="forensic-card forensic-card-hover p-6 sm:p-7 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary-surface border border-primary/20 flex items-center justify-center text-primary shadow-xs">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-odoo-text">1. Video Facial Analysis</h3>
            <p className="text-sm text-odoo-muted leading-relaxed">
              OpenCV extracts keyframe face crops, analyzing warping boundaries, color gradient blending, and frequency discrepancies characteristic of facial swaps and generative diffusion.
            </p>
            <div className="pt-2 text-xs font-medium text-primary flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>FaceForensics++ baseline</span>
            </div>
          </div>

          {/* Pillar 2: Audio */}
          <div className="forensic-card forensic-card-hover p-6 sm:p-7 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary-surface border border-primary/20 flex items-center justify-center text-accent-violet shadow-xs">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-odoo-text">2. Audio Spoof Detection</h3>
            <p className="text-sm text-odoo-muted leading-relaxed">
              FFmpeg demuxes the speech channel into 16kHz audio. Mel-spectrogram classifiers inspect for robotic harmonics, phase irregularities, and neural vocoder artifacts.
            </p>
            <div className="pt-2 text-xs font-medium text-accent-violet flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ASVspoof acoustic baseline</span>
            </div>
          </div>

          {/* Pillar 3: Cross-Modal Sync */}
          <div className="forensic-card forensic-card-hover p-6 sm:p-7 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-forensic-success shadow-xs">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-odoo-text">3. Cross-Modal Consistency</h3>
            <p className="text-sm text-odoo-muted leading-relaxed">
              Correlates speech energy bursts with visual lip motion intervals, identifying temporal drift and desynchronization without claiming definitive proof.
            </p>
            <div className="pt-2 text-xs font-medium text-forensic-success flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Lip-sync temporal analysis</span>
            </div>
          </div>
        </div>
      </section>

      {/* Ethical Commitment Principle */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="forensic-card p-6 sm:p-7 border-odoo-border bg-white shadow-odoo-xs space-y-3">
          <div className="flex items-center space-x-2 text-primary font-semibold text-sm">
            <Lock className="w-4 h-4" />
            <span>Ethical Artificial Intelligence & Forensic Integrity</span>
          </div>
          <p className="text-xs sm:text-sm text-odoo-muted leading-relaxed">
            TruthLens AI strictly rejects the fabrication of detection scores or simulating certainty. If a video contains no faces, has no audio track, or detector inference is pending weights, the system transparently reports <code className="text-primary font-mono font-semibold px-1 py-0.5 rounded bg-primary-surface">Unable to Assess</code> rather than misleading investigators or researchers.
          </p>
        </div>
      </section>
    </div>
  );
};
