import React from 'react';
import { Cpu, Video, Mic, ShieldAlert, Sparkles } from 'lucide-react';

export const ModelInfoPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent-violet/10 border border-accent-violet/30 text-accent-violet text-xs font-mono">
          <Cpu className="w-3.5 h-3.5" />
          <span>Neural Architecture & Model Specifications</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-forensic-text">
          Forensic Models & Benchmark Metrics
        </h1>
        <p className="text-sm sm:text-base text-forensic-muted leading-relaxed">
          Detailed technical specifications of deep learning architectures, dataset training provenance,
          and operational boundaries.
        </p>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model 1: Video Detector */}
        <div className="forensic-card p-6 sm:p-7 space-y-5 border-t-4 border-t-accent-cyan">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
              <Video className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-forensic-success/20 text-forensic-success border border-forensic-success/30 font-semibold">
              ACTIVE DETECTOR
            </span>
          </div>

          <div>
            <h2 className="text-lg font-bold text-forensic-text">
              Facial Artifact CNN Adapter (ResNet/EfficientNet)
            </h2>
            <p className="text-xs text-forensic-muted font-mono mt-0.5">
              Input: 224x224 RGB Facial Crops &bull; PyTorch Backend
            </p>
          </div>

          <p className="text-xs text-forensic-muted leading-relaxed">
            Specialized deep convolutional network optimized for detecting boundary seam artifacts,
            gradient discontinuities, and blending inconsistencies produced by generative autoencoders
            and GANs (e.g. DeepFaceLab, FaceSwap).
          </p>

          <div className="space-y-2 text-xs border-t border-forensic-border pt-4">
            <div className="flex justify-between">
              <span className="text-forensic-muted font-mono">Target Tasks:</span>
              <span className="text-forensic-text font-medium">Face Swap, Neural Reenactment</span>
            </div>
            <div className="flex justify-between">
              <span className="text-forensic-muted font-mono">Benchmark Baseline:</span>
              <span className="text-forensic-text font-medium">FaceForensics++ (c23/c40), DFDC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-forensic-muted font-mono">Extraction:</span>
              <span className="text-forensic-text font-medium">Haar Cascade / OpenCV Keyframe</span>
            </div>
          </div>
        </div>

        {/* Model 2: Audio Spoof Detector */}
        <div className="forensic-card p-6 sm:p-7 space-y-5 border-t-4 border-t-accent-violet">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-lg bg-accent-violet/10 border border-accent-violet/30 flex items-center justify-center text-accent-violet">
              <Mic className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-violet/20 text-accent-violet border border-accent-violet/30 font-semibold">
              AUDIO MODULE
            </span>
          </div>

          <div>
            <h2 className="text-lg font-bold text-forensic-text">
              Spectrogram Acoustic Spoof Classifier
            </h2>
            <p className="text-xs text-forensic-muted font-mono mt-0.5">
              Input: 16kHz PCM Audio &bull; Mel-Spectrogram + LFCC
            </p>
          </div>

          <p className="text-xs text-forensic-muted leading-relaxed">
            Evaluates high-frequency spectral rolloff, harmonic distortion, and temporal phase
            coherence to separate authentic human vocal cord acoustics from neural vocoder synthesis (e.g.
            HiFi-GAN, WaveNet, ElevenLabs clones).
          </p>

          <div className="space-y-2 text-xs border-t border-forensic-border pt-4">
            <div className="flex justify-between">
              <span className="text-forensic-muted font-mono">Target Tasks:</span>
              <span className="text-forensic-text font-medium">Voice Cloning, TTS Synthesis</span>
            </div>
            <div className="flex justify-between">
              <span className="text-forensic-muted font-mono">Benchmark Baseline:</span>
              <span className="text-forensic-text font-medium">ASVspoof 2019 / 2021 Logical Access</span>
            </div>
            <div className="flex justify-between">
              <span className="text-forensic-muted font-mono">Demux Engine:</span>
              <span className="text-forensic-text font-medium">FFmpeg Subprocess Extraction</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Modal Consistency Section */}
      <div className="forensic-card p-6 sm:p-8 space-y-4 border-accent-cyan/20">
        <div className="flex items-center space-x-2.5 text-accent-cyan">
          <Sparkles className="w-5 h-5" />
          <h2 className="text-base font-bold text-forensic-text">
            Cross-Modal Audio-Video Consistency Engine
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-forensic-muted leading-relaxed">
          Evaluates temporal correlation between acoustic speech energy (RMS amplitude and voice activity)
          and visual facial lip motion. Significant temporal desynchronization (e.g. speech continuing
          while lips remain completely static for over 1.5s) is documented as a forensic risk indicator.
        </p>
        <div className="p-3.5 rounded-lg bg-background-secondary/50 border border-forensic-border text-xs text-forensic-muted flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 text-forensic-warning shrink-0 mt-0.5" />
          <span>
            <strong>Scientific Caution:</strong> Lip synchronization variance frequently occurs in legitimate videos due to Bluetooth latency, streaming jitter, or re-encoding. It is marked as an auxiliary risk indicator, never absolute proof of a deepfake.
          </span>
        </div>
      </div>

      {/* Reference Benchmark Citations */}
      <div className="forensic-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-forensic-text">
          Verified Academic Literature & Benchmark Citations
        </h3>
        <ul className="space-y-2 text-xs text-forensic-muted">
          <li className="flex items-center justify-between p-2.5 rounded bg-background-secondary/40 border border-forensic-border/50">
            <span>Rössler et al. &mdash; <em>FaceForensics++: Learning to Detect Manipulated Facial Images</em> (ICCV 2019)</span>
            <span className="text-[11px] font-mono text-accent-cyan">Benchmark</span>
          </li>
          <li className="flex items-center justify-between p-2.5 rounded bg-background-secondary/40 border border-forensic-border/50">
            <span>Yamagishi et al. &mdash; <em>ASVspoof: Automatic Speaker Verification Spoofing and Countermeasures</em></span>
            <span className="text-[11px] font-mono text-accent-violet">Benchmark</span>
          </li>
          <li className="flex items-center justify-between p-2.5 rounded bg-background-secondary/40 border border-forensic-border/50">
            <span>Afchar et al. &mdash; <em>MesoNet: a Compact Facial Video Forgery Detection Network</em></span>
            <span className="text-[11px] font-mono text-accent-cyan">Architecture</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
