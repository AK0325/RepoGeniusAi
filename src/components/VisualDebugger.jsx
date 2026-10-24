import { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Sparkles,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { debugScreenshotWithAI } from '../utils/api';

export default function VisualDebugger({ backendStatus }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [question, setQuestion] = useState(
    'Diagnose the programming error in this screenshot, identify the root cause, and provide a suggested fix.'
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copiedFix, setCopiedFix] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileChange = (file) => {
    if (!file) return;

    // Validate format
    const validFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validFormats.includes(file.type)) {
      setError('Invalid format. Please upload a PNG, JPEG, or WebP image.');
      return;
    }

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit.');
      return;
    }

    setError('');
    setResult(null);
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleClearImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl('');
    setResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDiagnose = async (e) => {
    e?.preventDefault();
    if (!selectedFile) {
      setError('Please upload an error screenshot first.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const res = await debugScreenshotWithAI(selectedFile, question);
    setLoading(false);

    if (res.success && res.data) {
      setResult(res.data);
    } else {
      setError(res.error || 'Failed to diagnose screenshot.');
    }
  };

  const copyFix = () => {
    if (!result?.suggestedFix) return;
    navigator.clipboard.writeText(result.suggestedFix);
    setCopiedFix(true);
    setTimeout(() => setCopiedFix(false), 2000);
  };

  return (
    <div className="tool-workspace">
      <div className="workspace-header">
        <h1 className="workspace-title">Visual Debugger</h1>
        <p className="workspace-subtitle">
          Upload an error screenshot or terminal traceback for automated root-cause analysis using Gemma 4.
        </p>
      </div>

      {/* Input Area */}
      <div className="tool-input-card">
        <form onSubmit={handleDiagnose} className="debugger-form">
          <div className="debugger-inputs-grid">
            {/* Left: Upload Area */}
            <div className="upload-container">
              <label className="field-label">Error Screenshot (PNG, JPEG, WebP, max 10MB):</label>

              {!previewUrl ? (
                <div
                  className="upload-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) {
                      handleFileChange(e.dataTransfer.files[0]);
                    }
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="file-input-hidden"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) => handleFileChange(e.target.files?.[0])}
                  />
                  <div className="dropzone-center">
                    <Upload size={24} className="text-accent" />
                    <span className="dropzone-text">Click or drag error screenshot here</span>
                    <span className="dropzone-subtext">PNG, JPG, or WebP</span>
                  </div>
                </div>
              ) : (
                <div className="preview-container">
                  <div className="preview-image-box">
                    <img src={previewUrl} alt="Error screenshot" className="preview-image" />
                    <button
                      type="button"
                      className="btn-remove-image"
                      onClick={handleClearImage}
                      title="Remove image"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="preview-meta">
                    <div className="preview-filename">
                      <ImageIcon size={14} />
                      <span>{selectedFile?.name}</span>
                    </div>
                    <span className="preview-filesize">
                      {(selectedFile?.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Question Input */}
            <div className="question-container">
              <label htmlFor="question-input" className="field-label">Question or Context:</label>
              <textarea
                id="question-input"
                className="question-textarea"
                rows={5}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What error occurred or what behavior did you expect?"
                disabled={loading}
              />

              <div className="action-row">
                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={loading || !selectedFile}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      <span>Diagnosing with Gemma 4...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Diagnose Error</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-card">
          <Loader2 size={24} className="spin text-accent" />
          <span className="loading-text">Gemma 4 is analyzing the screenshot and error trace...</span>
        </div>
      )}

      {/* Configuration / Error Message */}
      {error && (
        <div className="config-help-card">
          <div className="config-help-header">
            <AlertCircle size={16} />
            <span>AI Service Configuration Notice</span>
          </div>
          <p className="config-help-text">{error}</p>
          <div className="config-help-step">
            To enable live Gemma 4 visual debugging:
            <ol>
              <li>Start the FastAPI backend: <code>uvicorn backend.main:app --reload --port 8000</code></li>
              <li>Set your <code>GEMMA_API_KEY</code> in <code>backend/.env</code></li>
            </ol>
          </div>
        </div>
      )}

      {/* Results Panel */}
      {!loading && result && (
        <div className="results-panel">
          <div className="content-card">
            <div className="content-card-header">
              <div className="content-card-title">
                <Sparkles size={16} />
                <span>Gemma 4 Diagnosis & Suggested Fix</span>
              </div>
              <span className="file-count-label">Model: {result.model || 'Gemma 4'}</span>
            </div>

            <div className="ai-explanation-body">
              <div className="ai-section">
                <h3 className="ai-section-title">
                  <AlertCircle size={15} />
                  <span>Diagnosis</span>
                </h3>
                <p className="ai-text">{result.diagnosis}</p>
              </div>

              {result.likelyCause && (
                <div className="ai-section">
                  <h3 className="ai-section-title">
                    <HelpCircle size={15} />
                    <span>Likely Cause</span>
                  </h3>
                  <p className="ai-text">{result.likelyCause}</p>
                </div>
              )}

              {result.suggestedFix && (
                <div className="ai-section">
                  <div className="section-title-with-action">
                    <h3 className="ai-section-title">
                      <CheckCircle2 size={15} />
                      <span>Suggested Fix</span>
                    </h3>
                    <button type="button" className="btn-copy" onClick={copyFix}>
                      {copiedFix ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedFix ? 'Copied' : 'Copy Fix'}</span>
                    </button>
                  </div>
                  <pre className="fix-code-block">
                    <code>{result.suggestedFix}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
