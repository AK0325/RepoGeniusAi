import { Search, ArrowRight } from 'lucide-react';

export default function FinalCta({ onLaunchAnalyzer }) {
  return (
    <section className="section-final-cta">
      <div className="final-cta-card">
        {/* Ambient Subtle Glow */}
        <div className="final-cta-glow" aria-hidden="true" />

        <div className="final-cta-content">
          <h2 className="final-cta-headline">Your Next Contribution Starts Here.</h2>
          <p className="final-cta-description">
            Choose a repository, understand how it works, and start building.
          </p>

          <div className="final-cta-actions">
            <button
              type="button"
              className="btn-final-primary"
              onClick={onLaunchAnalyzer}
            >
              <Search size={16} />
              <span>Analyze Your First Repository</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
