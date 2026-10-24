import { useState, useEffect } from 'react';
import { Cpu, Search, Code, Image as ImageIcon, ExternalLink, Menu, X, ArrowRight } from 'lucide-react';
import GitHubIcon from './GitHubIcon';

export default function Navbar({ activeTab, setActiveTab, onNavigateTool, backendStatus }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (target) => {
    setMobileMenuOpen(false);
    if (target === 'features') {
      if (activeTab !== 'home') {
        setActiveTab('home');
        setTimeout(() => {
          document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (target === 'how-it-works') {
      if (activeTab !== 'home') {
        setActiveTab('home');
        setTimeout(() => {
          document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setActiveTab(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className={`navbar-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Brand */}
        <button
          type="button"
          className="brand-link"
          onClick={() => handleLinkClick('home')}
          aria-label="RepoGenius AI Home"
        >
          <div className="brand-icon-box">
            <Cpu size={18} className="brand-icon" />
          </div>
          <span className="brand-text">
            RepoGenius <span className="brand-accent">AI</span>
          </span>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          <button
            type="button"
            className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => handleLinkClick('home')}
          >
            Home
          </button>
          <button
            type="button"
            className="nav-link"
            onClick={() => handleLinkClick('features')}
          >
            Features
          </button>
          <button
            type="button"
            className="nav-link"
            onClick={() => handleLinkClick('how-it-works')}
          >
            How It Works
          </button>
          <button
            type="button"
            className={`nav-link ${activeTab === 'explainer' ? 'active' : ''}`}
            onClick={() => handleLinkClick('explainer')}
          >
            Code Explainer
          </button>
          <button
            type="button"
            className={`nav-link ${activeTab === 'debugger' ? 'active' : ''}`}
            onClick={() => handleLinkClick('debugger')}
          >
            Visual Debugger
          </button>
        </nav>

        {/* Right Actions */}
        <div className="navbar-actions">
          {/* GitHub Repo Link */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="icon-link"
            title="GitHub Repository"
            aria-label="GitHub Repository"
          >
            <GitHubIcon size={18} />
          </a>

          {/* Primary CTA */}
          <button
            type="button"
            className="btn-nav-primary"
            onClick={() => handleLinkClick('analyzer')}
          >
            <Search size={14} />
            <span>Analyze Repository</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-menu-card" onClick={(e) => e.stopPropagation()}>
            <nav className="mobile-nav-list">
              <button
                type="button"
                className={`mobile-nav-item ${activeTab === 'home' ? 'active' : ''}`}
                onClick={() => handleLinkClick('home')}
              >
                <span>Home</span>
              </button>
              <button
                type="button"
                className="mobile-nav-item"
                onClick={() => handleLinkClick('features')}
              >
                <span>Features</span>
              </button>
              <button
                type="button"
                className="mobile-nav-item"
                onClick={() => handleLinkClick('how-it-works')}
              >
                <span>How It Works</span>
              </button>
              <button
                type="button"
                className={`mobile-nav-item ${activeTab === 'analyzer' ? 'active' : ''}`}
                onClick={() => handleLinkClick('analyzer')}
              >
                <span>Repository Analyzer</span>
              </button>
              <button
                type="button"
                className={`mobile-nav-item ${activeTab === 'explainer' ? 'active' : ''}`}
                onClick={() => handleLinkClick('explainer')}
              >
                <span>AI Code Explainer</span>
              </button>
              <button
                type="button"
                className={`mobile-nav-item ${activeTab === 'debugger' ? 'active' : ''}`}
                onClick={() => handleLinkClick('debugger')}
              >
                <span>Visual Debugger</span>
              </button>
            </nav>

            <div className="mobile-menu-footer">
              <button
                type="button"
                className="btn-mobile-primary"
                onClick={() => handleLinkClick('analyzer')}
              >
                <span>Analyze Repository</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
