export type EvidenceStatus =
  | 'Confirmed Manipulation'
  | 'Under Investigation'
  | 'Unverified Claim'
  | 'Debunked Claim'
  | 'General Deepfake News';

export type NewsCategory =
  | 'All'
  | 'Politics'
  | 'Celebrities'
  | 'Social Media'
  | 'Scams'
  | 'Fact Checks';

export interface NewsStory {
  id: string;
  headline: string;
  summary: string;
  source: string;
  source_url: string;
  published_at: string;
  evidence_status: EvidenceStatus;
  evidence_reason: string;
  category: NewsCategory;
  thumbnail_url?: string | null;
  video_url?: string | null;
  has_direct_video: boolean;
  supporting_sources: string[];
  unverified_aspects?: string | null;
}

export interface NewsResponse {
  items: NewsStory[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  last_refreshed: string | null;
  active_sources: string[];
  provider_status: string;
  configuration_notice?: string | null;
}

export interface NewsStatusResponse {
  last_refreshed: string | null;
  total_stories: number;
  cache_age_seconds: number;
  active_sources: string[];
  status: string;
  provider: string;
}

export interface NewsQueryParams {
  q?: string;
  category?: NewsCategory | string;
  evidence_status?: EvidenceStatus | string;
  sort?: 'latest' | 'relevant';
  page?: number;
  limit?: number;
}
