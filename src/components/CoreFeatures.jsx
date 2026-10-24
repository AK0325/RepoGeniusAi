import { Search, Code, Image as ImageIcon, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CoreFeatures({ onSelectTool, backendStatus }) {
  const isAiActive = backendStatus?.gemmaConfigured;

  const features = [
    {
      id: 'analyzer',
      number: '01',
      title: 'Repository Intelligence',
      description: 'Understand project structure, README content, and repository metadata.',
      icon: Search,
      actionText: 'Launch Analyzer',
      status: 'Live & Active',
      statusType: 'active',
      note: 'Direct GitHub REST API integration',
    },
    {
      id: 'explainer',
      number: '02',
      title: 'AI Code Explainer',
      description: 'Turn unfamiliar code into clear, beginner-friendly explanations.',
      icon: Code,
      actionText: 'Open Explainer',
      status: isAiActive ? 'Gemma 4 Active' : 'Setup Required (.env)',
      statusType: isAiActive ? 'active' : 'pending',
      note: isAiActive ? 'FastAPI & Gemma 4 ready' : 'Configure GEMMA_API_KEY in backend/.env',
    },
    {
      id: 'debugger',
      number: '03',
      title: 'Visual Debugger',
      description: 'Analyze screenshots of programming errors and explore possible fixes.',
      icon: ImageIcon,
      actionText: 'Open Debugger',
      status: isAiActive ? 'Vision AI Ready' : 'Setup Required (.env)',
      statusType: isAiActive ? 'active' : 'pending',
      note: isAiActive ? 'Multimodal tensor diagnosis' : 'Configure GEMMA_API_KEY in backend/.env',
    },
  ];

  return (
    <section id="features" className="section-features">
      <div className="section-header-centered">
        <span className="section-eyebrow">CORE CAPABILITIES</span>
        <h2 className="section-title">Built for Modern Open-Source Development</h2>
        <p className="section-description">
          Three focused tools designed to accelerate comprehension and eliminate friction.
        </p>
      </div>

      <div className="features-grid">
        {features.map((feat) => {
          const Icon = feat.icon;
          return (
            <div key={feat.id} className="feature-card">
              <div className="feature-card-top">
                <div className="feature-icon-box">
                  <Icon size={20} className="feature-icon" />
                </div>
                <span className={`feature-status-pill ${feat.statusType}`}>
                  {feat.statusType === 'active' ? (
                    <CheckCircle2 size={12} />
                  ) : (
                    <AlertCircle size={12} />
                  )}
                  <span>{feat.status}</span>
                </span>
              </div>

              <div className="feature-card-content">
                <span className="feature-number">{feat.number}</span>
                <h3 className="feature-title">{feat.title}</h3>
                <p className="feature-desc">{feat.description}</p>
                <div className="feature-note">{feat.note}</div>
              </div>

              <div className="feature-card-footer">
                <button
                  type="button"
                  className="btn-feature-action"
                  onClick={() => onSelectTool(feat.id)}
                >
                  <span>{feat.actionText}</span>
                  <ArrowRight size={14} className="feature-arrow" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
