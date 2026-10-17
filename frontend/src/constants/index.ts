export const APP_CONFIG = {
  name: 'TruthLens AI',
  tagline: 'See Beyond the Fake',
  maxFileSizeMB: Number(import.meta.env.VITE_MAX_FILE_SIZE_MB || 100),
  allowedExtensions: ['.mp4', '.avi', '.mov', '.webm', '.mkv'],
  allowedMimeTypes: [
    'video/mp4',
    'video/x-msvideo',
    'video/quicktime',
    'video/webm',
    'video/x-matroska',
  ],
};

export const COLOR_PALETTE = {
  background: '#0B1020',
  secondaryBackground: '#111A2E',
  card: '#151F35',
  accentCyan: '#38D9FF',
  accentViolet: '#8B5CF6',
  primaryText: '#F8FAFC',
  secondaryText: '#94A3B8',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  border: '#26334D',
} as const;
