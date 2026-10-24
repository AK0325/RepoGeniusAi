import { useState, useEffect } from 'react';
import {
  Search,
  Loader2,
  AlertCircle,
  ExternalLink,
  Star,
  Code,
  FileText,
  Folder,
  File,
  Sparkles,
  Copy,
  Check,
  Shield,
  GitBranch,
} from 'lucide-react';
import { parseGitHubUrl, fetchGitHubRepo } from '../utils/github';
import { explainRepoWithAI } from '../utils/api';
import GitHubIcon from './GitHubIcon';

export default function RepoAnalyzer({ backendStatus, initialUrl = '' }) {
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [repoData, setRepoData] = useState(null);
  const [activeTab, setActiveTab] = useState('readme'); // 'readme' | 'files' | 'ai'
  const [copiedReadme, setCopiedReadme] = useState(false);

  // AI explanation state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState('');

  const quickSamples = ['facebook/react', 'fastapi/fastapi', 'pallets/flask'];

  useEffect(() => {
    if (initialUrl && initialUrl.trim()) {
      handleAnalyze(initialUrl.trim());
    }
  }, [initialUrl]);

  const handleAnalyze = async (targetUrl = inputUrl) => {

    setError('');
    const trimmed = (targetUrl || '').trim();
    if (!trimmed) {
      setError('Please enter a GitHub repository URL or "owner/repo"');
      return;
    }

    const parsed = parseGitHubUrl(trimmed);
    if (!parsed) {
      setError('Invalid format. Please use "owner/repo" or "https://github.com/owner/repo"');
      return;
    }

    setLoading(true);
    setAiResult(null);
    setAiError('');

    const res = await fetchGitHubRepo(parsed.owner, parsed.repo);
    setLoading(false);

    if (res.success && res.data) {
      setRepoData(res.data);
      setActiveTab('readme');
    } else {
      setRepoData(null);
      setError(res.error || 'Failed to retrieve repository from GitHub.');
    }
  };

  const handleExplainAI = async () => {
    if (!repoData) return;
    setAiLoading(true);
    setAiError('');
    setAiResult(null);

    const res = await explainRepoWithAI(repoData);
    setAiLoading(false);

    if (res.success && res.data) {
      setAiResult(res.data);
    } else {
      setAiError(res.error || 'AI explanation service unavailable.');
    }
  };

  const copyReadmeText = () => {
    if (!repoData?.readme) return;
    navigator.clipboard.writeText(repoData.readme);
    setCopiedReadme(true);
    setTimeout(() => setCopiedReadme(false), 2000);
  };

  return (
    <div className="tool-workspace">
      <div className="workspace-header">
        <h1 className="workspace-title">Repository Analyzer</h1>
        <p className="workspace-subtitle">
          Retrieve live GitHub repository metadata, directory structure, and README documentation.
        </p>
      </div>

      {/* Input Area */}
      <div className="tool-input-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAnalyze();
          }}
          className="search-input-row"
        >
          <div className="input-with-icon">
            <GitHubIcon size={18} className="field-icon" />
            <input
              type="text"
              className="text-input"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Enter repository URL (e.g., https://github.com/facebook/react or facebook/react)..."
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !inputUrl.trim()}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Search size={16} />
                <span>Analyze</span>
              </>
            )}
          </button>
        </form>

        <div className="quick-presets-row">
          <span className="presets-label">Examples:</span>
          {quickSamples.map((sample) => (
            <button
              key={sample}
              type="button"
              className="preset-btn"
              onClick={() => {
                setInputUrl(sample);
                handleAnalyze(sample);
              }}
              disabled={loading}
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="alert-box alert-error">
          <AlertCircle size={18} className="alert-icon" />
          <div className="alert-text">{error}</div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-card">
          <Loader2 size={24} className="spin text-accent" />
          <span className="loading-text">Retrieving repository data from GitHub REST API...</span>
        </div>
      )}

      {/* Results Panel */}
      {!loading && repoData && (
        <div className="results-panel">
          {/* Metadata Card */}
          <div className="repo-meta-card">
            <div className="repo-meta-top">
              <div>
                <div className="repo-title-row">
                  <h2 className="repo-name">{repoData.full_name}</h2>
                  <a
                    href={repoData.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="repo-ext-link"
                    title="View on GitHub"
                  >
                    <span>GitHub</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
                <p className="repo-desc">{repoData.description}</p>
              </div>

              <div className="badges-row">
                <span className="meta-badge">
                  <Star size={13} className="text-amber" />
                  <span>{repoData.stars.toLocaleString()} stars</span>
                </span>
                <span className="meta-badge">
                  <Code size={13} />
                  <span>{repoData.language}</span>
                </span>
                <span className="meta-badge">
                  <GitBranch size={13} />
                  <span>{repoData.default_branch}</span>
                </span>
                <span className="meta-badge">
                  <Shield size={13} />
                  <span>{repoData.license}</span>
                </span>
              </div>
            </div>

            {/* View Selector Tabs */}
            <div className="panel-tabs">
              <button
                type="button"
                className={`panel-tab ${activeTab === 'readme' ? 'active' : ''}`}
                onClick={() => setActiveTab('readme')}
              >
                <FileText size={15} />
                <span>README.md</span>
              </button>
              <button
                type="button"
                className={`panel-tab ${activeTab === 'files' ? 'active' : ''}`}
                onClick={() => setActiveTab('files')}
              >
                <Folder size={15} />
                <span>Files & Structure ({repoData.contents?.length || 0})</span>
              </button>
              <button
                type="button"
                className={`panel-tab ${activeTab === 'ai' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('ai');
                  if (!aiResult && !aiLoading && !aiError) {
                    handleExplainAI();
                  }
                }}
              >
                <Sparkles size={15} />
                <span>Gemma 4 Explanation</span>
              </button>
            </div>
          </div>

          {/* Tab 1: README Viewer */}
          {activeTab === 'readme' && (
            <div className="content-card">
              <div className="content-card-header">
                <div className="content-card-title">
                  <FileText size={16} />
                  <span>Repository README</span>
                </div>
                {repoData.readme && (
                  <button
                    type="button"
                    className="btn-copy"
                    onClick={copyReadmeText}
                  >
                    {copiedReadme ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedReadme ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>

              {repoData.readme ? (
                <div className="code-viewer">
                  <pre className="code-content">
                    <code>{repoData.readme}</code>
                  </pre>
                </div>
              ) : (
                <div className="empty-content-box">
                  No README file found in the root of this repository.
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Directory Contents */}
          {activeTab === 'files' && (
            <div className="content-card">
              <div className="content-card-header">
                <div className="content-card-title">
                  <Folder size={16} />
                  <span>Root Directory Contents</span>
                </div>
                <span className="file-count-label">
                  {repoData.contents?.length || 0} items
                </span>
              </div>

              {repoData.contents && repoData.contents.length > 0 ? (
                <div className="directory-list">
                  {repoData.contents.map((item) => (
                    <div key={item.path} className="directory-item">
                      <div className="dir-item-left">
                        {item.type === 'dir' ? (
                          <Folder size={16} className="item-icon-folder" />
                        ) : (
                          <File size={16} className="item-icon-file" />
                        )}
                        <span className="item-name">{item.name}</span>
                      </div>
                      <div className="dir-item-right">
                        {item.size ? (
                          <span className="item-size">
                            {(item.size / 1024).toFixed(1)} KB
                          </span>
                        ) : null}
                        <a
                          href={item.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="item-link"
                          title="Open on GitHub"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-content-box">
                  No directory items could be retrieved via GitHub REST API.
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Gemma 4 AI Explanation */}
          {activeTab === 'ai' && (
            <div className="content-card">
              <div className="content-card-header">
                <div className="content-card-title">
                  <Sparkles size={16} />
                  <span>Gemma 4 Architectural Explanation</span>
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleExplainAI}
                  disabled={aiLoading}
                >
                  {aiLoading ? (
                    <>
                      <Loader2 size={13} className="spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <span>Regenerate</span>
                  )}
                </button>
              </div>

              {aiLoading && (
                <div className="loading-card">
                  <Loader2 size={20} className="spin text-accent" />
                  <span className="loading-text">Gemma 4 is synthesizing repository architecture...</span>
                </div>
              )}

              {aiError && (
                <div className="config-help-card">
                  <div className="config-help-header">
                    <AlertCircle size={16} />
                    <span>AI Backend Service Status</span>
                  </div>
                  <p className="config-help-text">{aiError}</p>
                  <div className="config-help-step">
                    To enable live Gemma 4 responses:
                    <ol>
                      <li>Start the FastAPI server: <code>uvicorn backend.main:app --reload --port 8000</code></li>
                      <li>Set your <code>GEMMA_API_KEY</code> in <code>backend/.env</code></li>
                    </ol>
                  </div>
                </div>
              )}

              {aiResult && (
                <div className="ai-explanation-body">
                  <div className="ai-section">
                    <h3 className="ai-section-title">Overview</h3>
                    <p className="ai-text">{aiResult.summary}</p>
                  </div>
                  {aiResult.architecture_notes && (
                    <div className="ai-section">
                      <h3 className="ai-section-title">Architectural Notes & Patterns</h3>
                      <p className="ai-text">{aiResult.architecture_notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
