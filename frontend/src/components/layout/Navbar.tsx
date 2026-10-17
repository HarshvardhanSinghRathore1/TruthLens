import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Video } from 'lucide-react';
import { apiService } from '@/services/api';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    apiService
      .checkHealth()
      .then(() => setApiStatus('online'))
      .catch(() => setApiStatus('offline'));
  }, []);

  const navLinks = [
    { name: 'Overview', path: '/' },
    { name: 'Analyze Video', path: '/analyze' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-forensic-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-lg bg-background-card border border-forensic-border flex items-center justify-center group-hover:border-accent-cyan transition-colors shadow-glow-cyan">
            <ShieldCheck className="w-6 h-6 text-accent-cyan" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-forensic-text">TruthLens</span>
              <span className="text-xs px-2 py-0.5 rounded bg-accent-violet/20 text-accent-violet border border-accent-violet/30 font-mono">
                AI
              </span>
            </div>
            <p className="text-[10px] text-forensic-muted hidden sm:block tracking-wider uppercase font-mono">
              Digital Forensics
            </p>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="flex items-center space-x-1 sm:space-x-4">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-background-card text-accent-cyan border border-forensic-border'
                    : 'text-forensic-muted hover:text-forensic-text hover:bg-background-secondary'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* System Indicator */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-background-card border border-forensic-border">
            <span
              className={`w-2 h-2 rounded-full ${
                apiStatus === 'online'
                  ? 'bg-forensic-success animate-pulse'
                  : apiStatus === 'offline'
                  ? 'bg-forensic-error'
                  : 'bg-forensic-warning'
              }`}
            />
            <span className="text-forensic-muted font-mono hidden md:inline">
              Backend: {apiStatus}
            </span>
          </div>

          <Link
            to="/analyze"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-accent-cyan text-background font-semibold text-xs hover:bg-accent-cyan/90 transition-all shadow-glow-cyan"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Launch Scanner</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
