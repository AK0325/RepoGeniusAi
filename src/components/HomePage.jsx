import { Search, ArrowRight, Sparkles, ChevronDown } from 'lucide-react';
import HeroPreview from './HeroPreview';
import CoreFeatures from './CoreFeatures';
import HowItWorks from './HowItWorks';
import FinalCta from './FinalCta';

export default function HomePage({ onNavigateTool, onAnalyzeRepo, backendStatus }) {
  const isGemmaActive = backendStatus?.gemmaConfigured;

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="homepage-wrapper">
      {/* Background Ambient Orbs */}
      <div className="ambient-orb orb-primary" aria-hidden="true" />
      <div className="ambient-orb orb-secondary" aria-hidden="true" />

      {/* SECTION 2 & 3: HERO + INTERACTIVE PREVIEW */}
      <section className="hero-section">
        <div className="hero-grid">
          {/* Hero Left Content */}
          <div className="hero-text-col">
            {/* Eyebrow */}
            <div className="hero-eyebrow">
              <span className="eyebrow-dot" />
              <span>AI-POWERED OPEN SOURCE DEVELOPMENT</span>
            </div>

            {/* Headline with animated indigo-to-cyan gradient on "Something Better" */}
            <h1 className="hero-headline">
              Understand Any Codebase.{' '}
              <span className="gradient-text">Build Something Better.</span>
            </h1>

            {/* Description */}
            <p className="hero-description">
              Explore repositories, understand unfamiliar code, and debug faster with your AI-powered development companion.
            </p>

            {/* CTAs */}
            <div className="hero-cta-group">
              <button
                type="button"
                className="btn-hero-primary"
                onClick={() => onNavigateTool('analyzer')}
              >
                <Search size={16} />
                <span>Analyze a Repository</span>
                <ArrowRight size={16} className="btn-arrow" />
              </button>

              <button
                type="button"
                className="btn-hero-secondary"
                onClick={scrollToFeatures}
              >
                <span>Explore Features</span>
                <ChevronDown size={15} />
              </button>
            </div>

            {/* Honest Model Badge */}
            <div className="model-badge-wrapper">
              <div
                className={`model-badge ${isGemmaActive ? 'active' : 'in-progress'}`}
                title={
                  isGemmaActive
                    ? 'Gemma 4 model API is configured and operational'
                    : 'Gemma 4 API key pending in backend/.env'
                }
              >
                <span className="model-badge-indicator" />
                <span className="model-badge-text">
                  {isGemmaActive ? 'Powered by Gemma 4' : 'Gemma 4 integration in progress'}
                </span>
              </div>
            </div>
          </div>

          {/* Hero Right: Interactive Product Preview (Section 3) */}
          <div className="hero-preview-col">
            <HeroPreview onAnalyzeRepo={onAnalyzeRepo} />
          </div>
        </div>
      </section>

      {/* SECTION 4: CORE FEATURES */}
      <CoreFeatures onSelectTool={onNavigateTool} backendStatus={backendStatus} />

      {/* SECTION 5: HOW IT WORKS */}
      <HowItWorks />

      {/* SECTION 6: FINAL CTA */}
      <FinalCta onLaunchAnalyzer={() => onNavigateTool('analyzer')} />
    </div>
  );
}
