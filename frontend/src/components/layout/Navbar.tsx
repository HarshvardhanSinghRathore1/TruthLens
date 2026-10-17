import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Video, Menu, X, Radio } from 'lucide-react';
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
    { name: 'Deepfake Radar', path: '/radar', icon: Radio },
    { name: 'Analyze Media', path: '/analyze' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Model Specs', path: '/models' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-odoo-border shadow-odoo-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center space-x-3 group outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          aria-label="TruthLens AI Home"
        >
          <div className="w-10 h-10 rounded-lg bg-primary-surface border border-primary/20 flex items-center justify-center group-hover:border-primary transition-colors shrink-0 shadow-sm">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-odoo-text">TruthLens</span>
              <span className="text-[11px] px-2 py-0.5 rounded font-semibold bg-primary-surface text-primary border border-primary/20 font-mono">
                AI
              </span>
            </div>
            <p className="text-[10px] text-odoo-muted hidden sm:block tracking-wider uppercase font-medium">
              Digital Media Forensics
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary inline-flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-primary-surface text-primary border border-primary/30 shadow-odoo-xs'
                    : 'text-odoo-muted hover:text-odoo-text hover:bg-background-secondary'
                }`}
              >
                {Icon && <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-primary' : 'text-odoo-muted'}`} />}
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Section: System Indicator & Scan Action */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Backend Health Pill */}
          <div
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-background-secondary border border-odoo-border text-xs"
            title={`Backend server status: ${apiStatus}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                apiStatus === 'online'
                  ? 'bg-forensic-success'
                  : apiStatus === 'offline'
                  ? 'bg-forensic-error'
                  : 'bg-forensic-warning animate-pulse'
              }`}
            />
            <span className="text-odoo-muted font-mono text-[11px] hidden lg:inline capitalize">
              {apiStatus}
            </span>
          </div>

          {/* Primary Action Button (Odoo Purple) */}
          <Link
            to="/analyze"
            className="hidden sm:inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-xs transition-colors shadow-odoo-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
            className="md:hidden p-2 rounded-lg bg-background-secondary border border-odoo-border text-odoo-muted hover:text-odoo-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-odoo-border bg-white px-4 pt-3 pb-5 space-y-3 animate-in slide-in-from-top-2 duration-150 shadow-odoo-md">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center space-x-2.5 ${
                    isActive
                      ? 'bg-primary-surface text-primary border border-primary/20'
                      : 'text-odoo-muted hover:text-odoo-text hover:bg-background-secondary'
                  }`}
                >
                  {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-odoo-muted'}`} />}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
          <div className="pt-2 border-t border-odoo-border">
            <Link
              to="/analyze"
              className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-xs shadow-odoo-sm"
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
