import React, { useEffect, useState } from 'react';
import {
  Radio,
  Search,
  RefreshCw,
  SlidersHorizontal,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  FileQuestion,
} from 'lucide-react';
import { apiService } from '@/services/api';
import { NewsStory, NewsCategory, EvidenceStatus } from '@/types/news';
import { NewsCard } from '@/components/radar/NewsCard';
import { NewsDetailModal } from '@/components/radar/NewsDetailModal';
import { AnalyzeStoryModal } from '@/components/radar/AnalyzeStoryModal';

const CATEGORIES: NewsCategory[] = [
  'All',
  'Politics',
  'Celebrities',
  'Social Media',
  'Scams',
  'Fact Checks',
];

const EVIDENCE_STATUSES: (EvidenceStatus | 'All')[] = [
  'All',
  'Confirmed Manipulation',
  'Under Investigation',
  'Unverified Claim',
  'Debunked Claim',
  'General Deepfake News',
];

export const RadarPage: React.FC = () => {
  const [stories, setStories] = useState<NewsStory[]>([]);
  const [totalStories, setTotalStories] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters and Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('All');
  const [selectedStatus, setSelectedStatus] = useState<EvidenceStatus | 'All'>('All');
  const [sortBy, setSortBy] = useState<'latest' | 'relevant'>('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Modals state
  const [activeStoryForDetail, setActiveStoryForDetail] = useState<NewsStory | null>(null);
  const [activeStoryForAnalyze, setActiveStoryForAnalyze] = useState<NewsStory | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load news data
  const loadNews = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await apiService.getNews({
        q: debouncedQuery.trim() || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        evidence_status: selectedStatus !== 'All' ? selectedStatus : undefined,
        sort: sortBy,
        page: currentPage,
        limit: pageSize,
      });

      setStories(response.items);
      setTotalStories(response.total);
      setLastRefreshed(response.last_refreshed);
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Unable to connect to Deepfake Radar feeds. Please verify backend connectivity.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadNews(true);
  }, [debouncedQuery, selectedCategory, selectedStatus, sortBy, currentPage]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await apiService.refreshNews(true);
      await loadNews(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Refresh limit reached or network error.');
      setIsRefreshing(false);
    }
  };

  const formatRelativeTime = (isoString: string | null) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Recent';
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalStories / pageSize));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-odoo-border">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-surface border border-primary/20 text-primary text-xs font-mono font-medium">
            <Radio className="w-3.5 h-3.5" />
            <span>LIVE INTELLIGENCE STREAM</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-odoo-text">
            Deepfake Radar
          </h1>
          <p className="text-sm sm:text-base text-odoo-muted max-w-2xl leading-relaxed">
            Track viral deepfake media. Explore the verified evidence. Stay informed.
          </p>
        </div>

        {/* Live Status & Refresh Button */}
        <div className="flex items-center space-x-3 self-start md:self-auto">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-odoo-border text-xs font-mono text-odoo-muted shadow-xs">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>Updated: {formatRelativeTime(lastRefreshed)}</span>
          </div>

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-background-secondary border border-odoo-border text-odoo-text text-xs font-mono transition-all hover:border-primary/40 disabled:opacity-50 shadow-xs"
            title="Ingest latest wire stories"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-primary' : 'text-primary'}`} />
            <span>{isRefreshing ? 'Scanning...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Controls Bar: Search, Category Pills, Sort, and Status */}
      <div className="space-y-4">
        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-odoo-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deepfake headlines, people, topics, or keywords..."
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-odoo-border rounded-xl text-xs sm:text-sm text-odoo-text placeholder-odoo-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-odoo-muted hover:text-odoo-text"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white border border-odoo-border text-xs text-odoo-muted w-full sm:w-auto shadow-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
              <span className="font-mono">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'latest' | 'relevant')}
                className="bg-transparent text-odoo-text font-semibold focus:outline-none cursor-pointer text-xs"
              >
                <option value="latest" className="bg-white text-odoo-text">
                  Latest First
                </option>
                <option value="relevant" className="bg-white text-odoo-text">
                  Most Relevant
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs font-mono text-odoo-muted shrink-0 mr-1 font-semibold">
            Topic:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-primary-surface text-primary border border-primary/30 font-bold shadow-xs'
                  : 'bg-white text-odoo-muted border border-odoo-border hover:text-odoo-text hover:bg-background-secondary shadow-xs'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Evidence Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs font-mono text-odoo-muted shrink-0 mr-1 font-semibold">
            Status:
          </span>
          {EVIDENCE_STATUSES.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setSelectedStatus(st);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors shrink-0 ${
                selectedStatus === st
                  ? 'bg-primary text-white font-bold shadow-xs'
                  : 'bg-white text-odoo-muted border border-odoo-border hover:text-odoo-text hover:bg-background-secondary shadow-xs'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Stories Count & Active Criteria Notice */}
      <div className="flex items-center justify-between text-xs font-mono text-odoo-muted">
        <div>
          <span>Found </span>
          <strong className="text-primary font-bold">{totalStories}</strong>
          <span> trending stories</span>
          {debouncedQuery && <span> for &ldquo;{debouncedQuery}&rdquo;</span>}
          {selectedCategory !== 'All' && <span> in {selectedCategory}</span>}
        </div>
        {totalStories > 0 && (
          <span>
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-xs text-forensic-error">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <strong className="font-bold block">Feed Communication Alert</strong>
            <p>{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => loadNews(true)}
            className="px-3 py-1 rounded bg-red-100 hover:bg-red-200 text-forensic-error font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Grid or Loading / Empty States */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="forensic-card p-5 space-y-4 animate-pulse min-h-[220px] flex flex-col justify-between border-odoo-border bg-white shadow-odoo-xs"
            >
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="w-20 h-5 bg-background-secondary rounded" />
                  <div className="w-28 h-5 bg-background-secondary rounded" />
                </div>
                <div className="w-full h-5 bg-background-secondary rounded" />
                <div className="w-3/4 h-5 bg-background-secondary rounded" />
                <div className="w-full h-12 bg-background-secondary rounded" />
              </div>
              <div className="w-full h-8 bg-background-secondary rounded" />
            </div>
          ))}
        </div>
      ) : stories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <NewsCard
              key={story.id}
              story={story}
              onSelect={(s) => setActiveStoryForDetail(s)}
              onAnalyze={(s) => setActiveStoryForAnalyze(s)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="forensic-card p-12 text-center max-w-lg mx-auto space-y-4 my-8 border-odoo-border bg-white shadow-odoo-xs">
          <div className="w-12 h-12 rounded-xl bg-background-secondary border border-odoo-border flex items-center justify-center mx-auto text-odoo-muted">
            <FileQuestion className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-odoo-text">
              No Deepfake Stories Found
            </h3>
            <p className="text-xs text-odoo-muted leading-relaxed">
              No recent news items match your current search terms or category filter. Try clearing filters or refreshing live wire services.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedStatus('All');
              setCurrentPage(1);
            }}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-xs shadow-odoo-sm"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && !isLoading && (
        <div className="flex items-center justify-center space-x-2 pt-6">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-2 rounded-lg bg-white border border-odoo-border text-odoo-muted hover:text-odoo-text disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-4 py-1.5 rounded-lg bg-white border border-odoo-border text-xs font-mono text-odoo-text shadow-xs">
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-2 rounded-lg bg-white border border-odoo-border text-odoo-muted hover:text-odoo-text disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modals */}
      <NewsDetailModal
        story={activeStoryForDetail}
        onClose={() => setActiveStoryForDetail(null)}
        onAnalyze={(s) => {
          setActiveStoryForDetail(null);
          setActiveStoryForAnalyze(s);
        }}
      />

      <AnalyzeStoryModal
        story={activeStoryForAnalyze}
        onClose={() => setActiveStoryForAnalyze(null)}
      />
    </div>
  );
};
