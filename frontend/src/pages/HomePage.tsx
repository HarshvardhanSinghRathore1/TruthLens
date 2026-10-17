import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Video, Cpu, FileSearch, ArrowRight, Eye, CheckCircle2 } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-xs font-mono">
          <Shield className="w-3.5 h-3.5" />
          <span>Cyber Samvad Hackathon 2026</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          <span className="block text-forensic-text">TruthLens AI</span>
          <span className="block forensic-gradient-text mt-1">See Beyond the Fake.</span>
        </h1>

        <p className="text-base sm:text-lg text-forensic-muted max-w-2xl mx-auto leading-relaxed">
          Inspect digital video media for facial manipulation and synthetic anomalies using
          multiframe computer vision extraction and deep learning forensic classification.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/analyze"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg bg-accent-cyan text-background font-bold text-sm hover:bg-accent-cyan/90 transition-all shadow-glow-cyan"
          >
            <Video className="w-4 h-4" />
            <span>Start Video Forensics</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg bg-background-card border border-forensic-border text-forensic-text font-medium text-sm hover:bg-background-secondary transition-all"
          >
            <Eye className="w-4 h-4 text-forensic-muted" />
            <span>Forensic Pipeline</span>
          </a>
        </div>
      </section>

      {/* Pipeline Pillars */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-forensic-text">
            Three-Stage Forensics Engine
          </h2>
          <p className="text-sm text-forensic-muted">
            Engineered with strict separation between extraction, inference, and human interpretation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="forensic-card forensic-card-hover p-6 space-y-4">
            <div className="w-12 h-12 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-forensic-text">1. Frame Sampling & Face Crop</h3>
            <p className="text-xs text-forensic-muted leading-relaxed">
              OpenCV decodes video streams at uniform intervals, localizing frontal facial boundaries
              with bounding margin normalization.
            </p>
          </div>

          <div className="forensic-card forensic-card-hover p-6 space-y-4">
            <div className="w-12 h-12 rounded-lg bg-accent-violet/10 border border-accent-violet/30 flex items-center justify-center text-accent-violet">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-forensic-text">2. Pretrained Model Inference</h3>
            <p className="text-xs text-forensic-muted leading-relaxed">
              PyTorch deepfake detectors examine facial texture anomalies, boundary blending,
              and frequency distortions without simulated randomness.
            </p>
          </div>

          <div className="forensic-card forensic-card-hover p-6 space-y-4">
            <div className="w-12 h-12 rounded-lg bg-forensic-success/10 border border-forensic-success/30 flex items-center justify-center text-forensic-success">
              <FileSearch className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-forensic-text">3. Transparent Reporting</h3>
            <p className="text-xs text-forensic-muted leading-relaxed">
              Aggregate frame scores map to three transparent states: Potential Manipulation,
              No Strong Signs, or Unable to Assess, alongside critical disclaimers.
            </p>
          </div>
        </div>
      </section>

      {/* Ethical Commitment Callout */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="forensic-card p-6 border-accent-violet/30 bg-gradient-to-r from-background-card to-background-secondary space-y-3">
          <div className="flex items-center space-x-2 text-accent-violet font-semibold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Verifiable AI Ethics Principle</span>
          </div>
          <p className="text-xs text-forensic-muted leading-relaxed">
            TruthLens AI strictly prohibits fabricating scores or hallucinating certainty. If a video
            cannot be parsed, has no faces, or model weights are missing, the system transparently
            reports <code className="text-accent-cyan font-mono">unable_to_assess</code> rather than
            misleading investigators.
          </p>
        </div>
      </section>
    </div>
  );
};
