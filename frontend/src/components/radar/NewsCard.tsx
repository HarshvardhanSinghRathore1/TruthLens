import React from 'react';
import {
  ExternalLink,
  Video,
  Calendar,
  Globe,
  Share2,
  DollarSign,
  UserCheck,
  Landmark,
  ShieldAlert,
} from 'lucide-react';
import { NewsStory, NewsCategory } from '@/types/news';
import { EvidenceBadge } from './EvidenceBadge';

interface NewsCardProps {
  story: NewsStory;
  onSelect: (story: NewsStory) => void;
  onAnalyze: (story: NewsStory) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ story, onSelect, onAnalyze }) => {
  const getCategoryIcon = (category: NewsCategory) => {
    switch (category) {
      case 'Politics':
        return <Landmark className="w-3 h-3 text-primary" />;
      case 'Celebrities':
        return <UserCheck className="w-3 h-3 text-accent-violet" />;
      case 'Scams':
        return <DollarSign className="w-3 h-3 text-forensic-warning" />;
      case 'Fact Checks':
        return <ShieldAlert className="w-3 h-3 text-forensic-success" />;
      case 'Social Media':
      default:
        return <Share2 className="w-3 h-3 text-primary" />;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <article
      onClick={() => onSelect(story)}
      className="forensic-card p-5 flex flex-col justify-between space-y-4 cursor-pointer hover:border-primary/50 transition-all duration-200 group bg-white border border-odoo-border shadow-odoo-xs"
    >
      <div className="space-y-3">
        {/* Top Badges: Category & Evidence Status */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-background-secondary border border-odoo-border text-[11px] font-mono text-odoo-muted">
            {getCategoryIcon(story.category)}
            <span>{story.category}</span>
          </div>
          <EvidenceBadge status={story.evidence_status} size="sm" />
        </div>

        {/* Headline */}
        <h3 className="text-base font-bold text-odoo-text group-hover:text-primary transition-colors line-clamp-2 leading-snug">
          {story.headline}
        </h3>

        {/* Short Summary */}
        <p className="text-xs text-odoo-muted leading-relaxed line-clamp-3">
          {story.summary}
        </p>
      </div>

      <div className="space-y-3 pt-2 border-t border-odoo-border">
        {/* Source & Timestamp */}
        <div className="flex items-center justify-between text-[11px] text-odoo-muted font-mono">
          <div className="flex items-center space-x-1.5 truncate max-w-[65%]">
            <Globe className="w-3 h-3 text-primary shrink-0" />
            <span className="truncate font-semibold text-odoo-text">{story.source}</span>
          </div>
          <div className="flex items-center space-x-1 shrink-0">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(story.published_at)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
          <a
            href={story.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 min-h-[34px] rounded-lg text-xs font-medium text-odoo-text hover:text-primary hover:bg-primary-surface active:bg-primary-surface-active transition-colors border border-transparent hover:border-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span>Read Article</span>
            <ExternalLink className="w-3 h-3 text-primary" />
          </a>

          <button
            type="button"
            onClick={() => onAnalyze(story)}
            className="btn-odoo-soft space-x-1.5 px-3 py-1.5 min-h-[34px] text-xs font-semibold"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Analyze Video</span>
          </button>
        </div>
      </div>
    </article>
  );
};
