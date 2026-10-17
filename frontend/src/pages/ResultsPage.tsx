import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, RefreshCw } from 'lucide-react';
import { AnalysisResponse } from '@/types/analysis';
import { ResultSummary } from '@/components/results/ResultSummary';
import { RiskIndicator } from '@/components/results/RiskIndicator';
import { FindingsList } from '@/components/results/FindingsList';
import { FrameGallery } from '@/components/results/FrameGallery';
import { LimitationsNotice } from '@/components/results/LimitationsNotice';

export const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);

  useEffect(() => {
    // 1. Try location router state
    if (location.state?.analysis) {
      setAnalysis(location.state.analysis);
      return;
    }

    // 2. Try session storage
    const cached = sessionStorage.getItem('latest_analysis');
    if (cached) {
      try {
        setAnalysis(JSON.parse(cached));
        return;
      } catch (e) {
        // invalid JSON
      }
    }

    // 3. Fallback to analysis page if no report is loaded
    navigate('/analyze');
  }, [location, navigate]);

  const handleDownloadReportJSON = () => {
    if (!analysis) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(analysis, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `truthlens_${analysis.analysis_id}_report.json`);
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
        <RefreshCw className="w-8 h-8 text-accent-cyan animate-spin mx-auto" />
        <p className="text-xs text-forensic-muted font-mono">Loading forensic report...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forensic-border/70 pb-6">
        <div className="space-y-1">
          <Link
            to="/analyze"
            className="inline-flex items-center space-x-1.5 text-xs text-forensic-muted hover:text-accent-cyan transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Video Scanner</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-forensic-text">
            Forensic Inspection Dossier
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleDownloadReportJSON}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-background-card border border-forensic-border text-xs font-semibold text-forensic-text hover:bg-background-secondary transition-colors"
            title="Download JSON Evidence"
          >
            <Download className="w-3.5 h-3.5 text-accent-cyan" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-background-card border border-forensic-border text-xs font-semibold text-forensic-text hover:bg-background-secondary transition-colors"
            title="Print Forensics Report"
          >
            <Printer className="w-3.5 h-3.5 text-accent-violet" />
            <span className="hidden sm:inline">Print Dossier</span>
          </button>

          <Link
            to="/analyze"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-accent-cyan text-background text-xs font-bold hover:bg-accent-cyan/90 transition-all shadow-glow-cyan"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Scan</span>
          </Link>
        </div>
      </div>

      {/* Primary Result Summary */}
      <ResultSummary analysis={analysis} />

      {/* Risk Gauge Indicator */}
      <RiskIndicator
        score={analysis.risk_score}
        outcome={analysis.result}
        scoreType={analysis.score_type}
        scoreExplanation={analysis.score_explanation}
      />

      {/* Frame Gallery Timeline */}
      <FrameGallery
        frames={analysis.frame_results}
        framesAnalyzed={analysis.frames_analyzed}
      />

      {/* Granular Forensic Findings */}
      <FindingsList findings={analysis.findings} />

      {/* Methodological Scope and Limitations */}
      <LimitationsNotice limitations={analysis.limitations} />

      {/* Bottom Navigation */}
      <div className="flex justify-center pt-4">
        <Link
          to="/analyze"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-background-card border border-forensic-border hover:border-accent-cyan text-xs font-bold text-forensic-text hover:shadow-glow-cyan transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Upload Another Video for Forensics</span>
        </Link>
      </div>
    </div>
  );
};
