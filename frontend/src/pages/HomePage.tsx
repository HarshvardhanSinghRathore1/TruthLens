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
} from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
        {/* Forensic Category Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Digital Media Forensics</span>
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            <span className="block text-forensic-text">TruthLens AI</span>
            <span className="block forensic-gradient-text mt-1">See Beyond the Fake.</span>
          </h1>
          <p className="text-base sm:text-lg text-forensic-muted max-w-2xl mx-auto leading-relaxed pt-2">
            Analyze video and audio for signs of AI-generated or manipulated media. Get clear results,
            understand the evidence, and explore the limitations.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/analyze"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-accent-cyan text-background font-bold text-sm hover:bg-accent-cyan/90 transition-all shadow-glow-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan"
          >
            <Video className="w-4 h-4" />
            <span>Analyze Media</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-background-card border border-forensic-border text-forensic-text font-semibold text-sm hover:bg-background-secondary transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan"
          >
            <Eye className="w-4 h-4 text-forensic-muted" />
            <span>How It Works</span>
          </Link>
        </div>

        {/* Tasteful Forensic Scanning Interactive Visual (SVG Waveform & Frame Strip) */}
        <div className="pt-6 max-w-3xl mx-auto">
          <div className="forensic-card p-4 sm:p-5 relative overflow-hidden border-accent-cyan/25 bg-background-card/80">
            {/* Ambient scanning line */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-accent-cyan to-transparent animate-pulse" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {/* Visual Track Preview */}
              <div className="space-y-2 p-3 rounded-lg bg-background-secondary/50 border border-forensic-border">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-forensic-text font-semibold flex items-center space-x-1.5">
                    <Video className="w-3.5 h-3.5 text-accent-cyan" />
                    <span>Visual Temporal Track</span>
                  </span>
                  <span className="text-[10px] text-accent-cyan font-bold">15 FPS &bull; OpenCV</span>
                </div>
                {/* SVG Visual Keyframe Sequence */}
                <div className="flex items-center space-x-1.5 h-10 overflow-hidden">
                  {[0.12, 0.15, 0.14, 0.18, 0.16, 0.13, 0.15].map((val, i) => (
                    <div
                      key={i}
                      className="flex-1 h-full rounded bg-background border border-forensic-border/70 flex flex-col justify-end p-0.5 group relative"
                    >
                      <div
                        className="w-full rounded-sm bg-accent-cyan/40 group-hover:bg-accent-cyan transition-all"
                        style={{ height: `${Math.round(val * 250)}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Acoustic Track Preview */}
              <div className="space-y-2 p-3 rounded-lg bg-background-secondary/50 border border-forensic-border">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-forensic-text font-semibold flex items-center space-x-1.5">
                    <Mic className="w-3.5 h-3.5 text-accent-violet" />
                    <span>Acoustic Waveform Track</span>
                  </span>
                  <span className="text-[10px] text-accent-violet font-bold">16 kHz PCM</span>
                </div>
                {/* SVG Waveform Simulation */}
                <svg className="w-full h-10 text-accent-violet/60" viewBox="0 0 200 40" fill="none">
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
                    strokeOpacity="0.4"
                  />
                </svg>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 text-[11px] font-mono text-forensic-muted border-t border-forensic-border/50 mt-3">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-forensic-success animate-ping" />
                <span>Dual Modality Synchronizer: Ready</span>
              </span>
              <span>Tamper Resistance Check Enabled</span>
            </div>
          </div>
        </div>
      </section>

      {/* Multimodal Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-forensic-text">
            Three Forensic Pillars
          </h2>
          <p className="text-xs sm:text-sm text-forensic-muted max-w-xl mx-auto">
            Deepfake manipulation rarely stays confined to pixels alone. TruthLens AI inspects visual,
            acoustic, and cross-modal indicators separately.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Video */}
          <div className="forensic-card forensic-card-hover p-6 sm:p-7 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan shadow-glow-cyan">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-forensic-text">1. Video Facial Analysis</h3>
            <p className="text-xs text-forensic-muted leading-relaxed">
              OpenCV extracts keyframe face crops, analyzing warping boundaries, color gradient blending,
              and frequency discrepancies characteristic of facial swaps and generative diffusion.
            </p>
            <div className="pt-2 text-xs font-mono text-accent-cyan flex items-center space-x-1">
              <span>FaceForensics++ benchmark</span>
            </div>
          </div>

          {/* Pillar 2: Audio */}
          <div className="forensic-card forensic-card-hover p-6 sm:p-7 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-accent-violet/10 border border-accent-violet/30 flex items-center justify-center text-accent-violet shadow-glow-violet">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-forensic-text">2. Audio Spoof Detection</h3>
            <p className="text-xs text-forensic-muted leading-relaxed">
              FFmpeg demuxes the speech channel into 16kHz audio. Mel-spectrogram classifiers inspect
              for robotic harmonics, phase irregularities, and neural vocoder artifacts.
            </p>
            <div className="pt-2 text-xs font-mono text-accent-violet flex items-center space-x-1">
              <span>ASVspoof acoustic baseline</span>
            </div>
          </div>

          {/* Pillar 3: Cross-Modal Sync */}
          <div className="forensic-card forensic-card-hover p-6 sm:p-7 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-forensic-success/10 border border-forensic-success/30 flex items-center justify-center text-forensic-success">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-forensic-text">3. Cross-Modal Consistency</h3>
            <p className="text-xs text-forensic-muted leading-relaxed">
              Correlates speech energy bursts with visual lip motion intervals, identifying temporal
              drift and desynchronization without claiming definitive proof.
            </p>
            <div className="pt-2 text-xs font-mono text-forensic-success flex items-center space-x-1">
              <span>Lip-sync temporal analysis</span>
            </div>
          </div>
        </div>
      </section>

      {/* Ethical Commitment Principle */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="forensic-card p-6 sm:p-7 border-accent-violet/30 bg-gradient-to-r from-background-card to-background-secondary space-y-3">
          <div className="flex items-center space-x-2 text-accent-violet font-semibold text-sm">
            <Lock className="w-4 h-4" />
            <span>Ethical Artificial Intelligence & Forensic Integrity</span>
          </div>
          <p className="text-xs sm:text-sm text-forensic-muted leading-relaxed">
            TruthLens AI strictly rejects the fabrication of detection scores or simulating certainty.
            If a video contains no faces, has no audio track, or detector inference is pending weights,
            the system transparently reports <code className="text-accent-cyan font-mono">Unable to Assess</code> rather
            than misleading researchers or juries.
          </p>
        </div>
      </section>
    </div>
  );
};
