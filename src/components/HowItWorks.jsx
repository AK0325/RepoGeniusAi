import { useEffect, useRef, useState } from 'react';
import { GitPullRequest, Search, CheckCircle } from 'lucide-react';

export default function HowItWorks() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      step: '01',
      title: 'Connect a Repository',
      description: 'Paste a public GitHub URL.',
      detail: 'Instantly validate and retrieve real repository metadata, stars, license, and directory hierarchy.',
      icon: Search,
    },
    {
      step: '02',
      title: 'Understand the Code',
      description: 'Inspect project information and request an AI explanation.',
      detail: 'Browse the README, review architecture summaries, and decipher complex code snippets with Gemma 4.',
      icon: GitPullRequest,
    },
    {
      step: '03',
      title: 'Build with Confidence',
      description: 'Use the findings to explore and contribute to the project.',
      detail: 'Diagnose runtime errors, understand conventions, and craft verified pull requests.',
      icon: CheckCircle,
    },
  ];

  return (
    <section id="how-it-works" ref={sectionRef} className="section-how-it-works">
      <div className="section-header-centered">
        <span className="section-eyebrow">SIMPLE WORKFLOW</span>
        <h2 className="section-title">How RepoGenius Works</h2>
        <p className="section-description">
          From unfamiliar repository to confident contributor in three streamlined steps.
        </p>
      </div>

      <div className={`steps-horizontal-grid ${isVisible ? 'in-view' : ''}`}>
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="step-card"
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              <div className="step-card-header">
                <span className="step-number">{item.step}</span>
                <div className="step-icon-wrap">
                  <Icon size={16} className="step-icon" />
                </div>
              </div>

              <h3 className="step-title">{item.title}</h3>
              <p className="step-headline">{item.description}</p>
              <p className="step-detail">{item.detail}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
