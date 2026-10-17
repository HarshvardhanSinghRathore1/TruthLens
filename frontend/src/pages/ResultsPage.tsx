import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, RefreshCw } from 'lucide-react';
import { AnalysisResponse } from '@/types/analysis';
import { ResultSummary } from '@/components/results/ResultSummary';
import { RiskIndicator } from '@/components/results/RiskIndicator';
import { VideoAnalysisSection } from '@/components/results/VideoAnalysisSection';
import { AudioAnalysisSection } from '@/components/results/AudioAnalysisSection';
import { AVConsistencySection } from '@/components/results/AVConsistencySection';
import { FindingsList } from '@/components/results/FindingsList';
import { FrameGallery } from '@/components/results/FrameGallery';
import { LimitationsNotice } from '@/components/results/LimitationsNotice';

export const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);

  useEffect(() => {
    // 1. Check router state
    if (location.state?.analysis) {
      setAnalysis(location.state.analysis);
      return;
    }

    // 2. Check session storage fallback
    const cached = sessionStorage.getItem('latest_analysis');
    if (cached) {
      try {
        setAnalysis(JSON.parse(cached));
        return;
      } catch (e) {
        // invalid JSON
      }
    }

    // 3. Fallback to analysis page if no dossier exists
    navigate('/analyze');
  }, [location, navigate]);

  const handleDownloadReportJSON = () => {
    if (!analysis) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(analysis, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `truthlens_${analysis.analysis_id}_dossier.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  if (!analysis) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
        <p className="text-xs text-odoo-muted font-mono">Loading forensic dossier...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-odoo-border pb-6">
        <div className="space-y-1">
          <Link
            to="/analyze"
            className="inline-flex items-center space-x-1.5 text-xs text-odoo-muted hover:text-primary transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Video Scanner</span>
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-odoo-text">
              Forensic Inspection Dossier
            </h1>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-primary-surface text-primary border border-primary/20 font-semibold">
              DUAL MODAL
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={handleDownloadReportJSON}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white border border-odoo-border text-xs font-semibold text-odoo-text hover:bg-background-secondary hover:border-primary/40 transition-colors shadow-odoo-xs focus-visible:ring-2 focus-visible:ring-primary"
            title="Download JSON Evidence"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white border border-odoo-border text-xs font-semibold text-odoo-text hover:bg-background-secondary transition-colors shadow-odoo-xs focus-visible:ring-2 focus-visible:ring-primary"
            title="Print Forensics Report"
          >
            <Printer className="w-3.5 h-3.5 text-accent-violet" />
            <span className="hidden sm:inline">Print Dossier</span>
          </button>

          <Link
            to="/analyze"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors shadow-odoo-sm focus-visible:ring-2 focus-visible:ring-primary"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Scan</span>
          </Link>
        </div>
      </div>

      {/* Primary Executive Synopsis & Metadata Summary */}
      <ResultSummary analysis={analysis} />

      {/* Multimodal Sections: Video vs Audio vs Consistency */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-odoo-border pb-2">
          <h2 className="text-sm font-bold text-odoo-text uppercase tracking-wider font-mono">
            Multimodal Forensic Breakdown
          </h2>
          <span className="text-xs text-odoo-muted font-mono">
            Video &bull; Audio &bull; Synchronization
          </span>
        </div>

        {/* Section A: Video Facial Analysis */}
        <VideoAnalysisSection analysis={analysis} />

        {/* Section B: Audio Spoof Analysis */}
        <AudioAnalysisSection analysis={analysis} />

        {/* Section C: Audio-Video Temporal Consistency */}
        <AVConsistencySection analysis={analysis} />
      </div>

      {/* Numerical Risk Gauge (when available) */}
      <RiskIndicator
        score={analysis.risk_score}
        outcome={analysis.result}
        scoreType={analysis.score_type}
        scoreExplanation={analysis.score_explanation}
      />

      {/* Sampled Frame Timeline Gallery */}
      <FrameGallery
        frames={analysis.frame_results}
        framesAnalyzed={analysis.frames_analyzed}
      />

      {/* Detailed Forensic Observations */}
      <FindingsList findings={analysis.findings} />

      {/* Scope, Caveats & Integrity Limitations */}
      <LimitationsNotice limitations={analysis.limitations} />

      {/* Bottom Navigation */}
      <div className="flex justify-center pt-4">
        <Link
          to="/analyze"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg bg-white border border-odoo-border hover:border-primary/40 text-xs font-semibold text-odoo-text hover:bg-background-secondary transition-all shadow-odoo-xs"
        >
          <ArrowLeft className="w-4 h-4 text-primary" />
          <span>Upload Another Media File for Forensics</span>
        </Link>
      </div>
    </div>
  );
};
