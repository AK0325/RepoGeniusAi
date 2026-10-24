import { useState } from 'react';
import {
  Folder,
  FileCode,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Terminal,
  ShieldAlert,
} from 'lucide-react';
import GitHubIcon from './GitHubIcon';

export default function HeroPreview({ onAnalyzeRepo }) {
  const [previewInput, setPreviewInput] = useState('fastapi/fastapi');
  const [activeFile, setActiveFile] = useState('main.py');

  const fileTree = [
    { name: 'src/core/main.py', label: 'main.py', type: 'file', lang: 'python' },
    { name: 'src/routers/api.py', label: 'api.py', type: 'file', lang: 'python' },
    { name: 'README.md', label: 'README.md', type: 'doc', lang: 'markdown' },
    { name: 'pyproject.toml', label: 'pyproject.toml', type: 'config', lang: 'toml' },
  ];

  const codeSnippets = {
    'main.py': `@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str | None = None):
    # Retrieve item record asynchronously
    item = await db.fetch_one(item_id)
    if not item:
        raise HTTPException(status_code=404)
    return {"item": item, "query": q}`,
    'api.py': `from fastapi import APIRouter, Depends
router = APIRouter(prefix="/v1")

@router.post("/analyze")
async def analyze_repo(req: RepoRequest, user=Depends(auth)):
    return await analyzer.process(req.url)`,
    'README.md': `# FastAPI Framework
High performance, easy to learn, fast to code.
Key Features:
- Fast: Very high performance on par with NodeJS and Go.
- Intuitive: Great editor support. Completion everywhere.`,
    'pyproject.toml': `[project]
name = "fastapi"
version = "0.115.0"
dependencies = [
    "pydantic>=2.7.0",
    "starlette>=0.37.0"
]`,
  };

  const handleLaunchLive = (e) => {
    e.preventDefault();
    if (onAnalyzeRepo && previewInput.trim()) {
      onAnalyzeRepo(previewInput.trim());
    }
  };

  return (
    <div className="hero-preview-wrapper">
      {/* Background Ambient Glow */}
      <div className="preview-ambient-glow" aria-hidden="true" />

      {/* Floating Accent Tag */}
      <div className="floating-accent-tag">
        <Sparkles size={13} className="text-secondary" />
        <span>Live Workspace Preview</span>
      </div>

      {/* Main Terminal / Workbench Card */}
      <div className="preview-card">
        {/* Top Control Bar */}
        <div className="preview-top-bar">
          <div className="preview-mac-dots" aria-hidden="true">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
          </div>

          {/* Interactive Repo URL Input Bar */}
          <form onSubmit={handleLaunchLive} className="preview-url-form">
            <div className="preview-url-input-wrap">
              <GitHubIcon size={14} className="preview-gh-icon" />
              <input
                type="text"
                className="preview-url-field"
                value={previewInput}
                onChange={(e) => setPreviewInput(e.target.value)}
                placeholder="github.com/owner/repo"
                aria-label="Repository URL preview input"
              />
            </div>
            <button
              type="submit"
              className="btn-preview-launch"
              title="Analyze this repository live with real GitHub REST API"
            >
              <span>Try Live</span>
              <ArrowRight size={13} />
            </button>
          </form>
        </div>

        {/* 3-Pane Developer Workspace Layout */}
        <div className="preview-workspace-panes">
          {/* Pane 1: File Tree */}
          <div className="pane-filetree">
            <div className="pane-header">
              <Folder size={13} className="text-amber" />
              <span>Explorer</span>
            </div>
            <div className="filetree-list">
              <div className="filetree-folder">▾ fastapi/</div>
              {fileTree.map((f) => (
                <button
                  key={f.name}
                  type="button"
                  className={`filetree-item ${activeFile === f.label ? 'active' : ''}`}
                  onClick={() => setActiveFile(f.label)}
                >
                  {f.type === 'file' ? (
                    <FileCode size={13} className="file-icon code" />
                  ) : (
                    <FileText size={13} className="file-icon doc" />
                  )}
                  <span className="file-label">{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pane 2: Code Editor */}
          <div className="pane-code">
            <div className="pane-header">
              <FileCode size={13} className="text-primary" />
              <span>{activeFile}</span>
            </div>
            <div className="code-editor-body">
              <pre className="code-pre">
                <code>
                  {codeSnippets[activeFile]}
                  <span className="terminal-cursor" aria-hidden="true">
                    |
                  </span>
                </code>
              </pre>
            </div>
          </div>

          {/* Pane 3: AI Explanation */}
          <div className="pane-ai">
            <div className="pane-header">
              <Sparkles size={13} className="text-secondary" />
              <span>AI Analysis</span>
            </div>
            <div className="ai-explanation-box">
              <div className="ai-badge-row">
                <span className="ai-badge-pill">Gemma 4</span>
                <span className="ai-badge-status">Architecture Verified</span>
              </div>
              <p className="ai-summary-text">
                Asynchronous handler with automatic request parsing, declarative validation, and error propagation.
              </p>
              <div className="ai-insight-item">
                <CheckCircle2 size={13} className="text-success" />
                <span>Zero boilerplate parameter injection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Honest Sample Label at Bottom */}
        <div className="preview-footer-disclaimer">
          <ShieldAlert size={12} className="disclaimer-icon" />
          <span>
            Demonstration preview. Click <strong>Try Live</strong> or search above to retrieve authentic data via the GitHub REST API.
          </span>
        </div>
      </div>
    </div>
  );
}
