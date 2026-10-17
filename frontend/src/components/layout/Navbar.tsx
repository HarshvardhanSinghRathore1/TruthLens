import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Video, Menu, X } from 'lucide-react';
import { apiService } from '@/services/api';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    apiService
      .checkHealth()
      .then(() => setApiStatus('online'))
      .catch(() => setApiStatus('offline'));
  }, []);

  // Close mobile menu upon route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Analyze Media', path: '/analyze' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Model Specs', path: '/models' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-forensic-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center space-x-3 group outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan rounded-lg"
          aria-label="TruthLens AI Home"
        >
          <div className="w-10 h-10 rounded-lg bg-background-card border border-forensic-border flex items-center justify-center group-hover:border-accent-cyan transition-colors shadow-glow-cyan shrink-0">
            <ShieldCheck className="w-6 h-6 text-accent-cyan" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-forensic-text">TruthLens</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-violet/15 text-accent-violet border border-accent-violet/30 font-mono font-semibold">
                AI
              </span>
            </div>
            <p className="text-[10px] text-forensic-muted hidden sm:block tracking-wider uppercase font-mono">
              Digital Media Forensics
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan ${
                  isActive
                    ? 'bg-background-card text-accent-cyan border border-forensic-border shadow-sm'
                    : 'text-forensic-muted hover:text-forensic-text hover:bg-background-secondary'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: System Indicator, Theme Toggle, Action */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Backend Health Pill */}
          <div
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-background-card border border-forensic-border text-xs"
            title={`Backend server status: ${apiStatus}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                apiStatus === 'online'
                  ? 'bg-forensic-success animate-pulse'
                  : apiStatus === 'offline'
                  ? 'bg-forensic-error'
                  : 'bg-forensic-warning'
              }`}
            />
            <span className="text-forensic-muted font-mono text-[11px] hidden lg:inline capitalize">
              {apiStatus}
            </span>
          </div>

          {/* Primary Action Button */}
          <Link
            to="/analyze"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-accent-cyan text-background font-bold text-xs hover:bg-accent-cyan/90 transition-all shadow-glow-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Scan Media</span>
          </Link>

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden p-2 rounded-lg bg-background-card border border-forensic-border text-forensic-muted hover:text-forensic-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-forensic-border bg-background-card/95 backdrop-blur-md px-4 pt-2 pb-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-background-secondary text-accent-cyan border border-forensic-border'
                      : 'text-forensic-muted hover:text-forensic-text hover:bg-background-secondary/60'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
          <div className="pt-2 border-t border-forensic-border">
            <Link
              to="/analyze"
              className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-accent-cyan text-background font-bold text-xs shadow-glow-cyan"
            >
              <Video className="w-4 h-4" />
              <span>Launch Media Scanner</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
