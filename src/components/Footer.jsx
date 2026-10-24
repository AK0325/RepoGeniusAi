export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-inner">
        <div className="footer-text">
          <strong>RepoGenius AI</strong> — Understand code. Contribute smarter. Powered by Google Gemma 4.
        </div>
        <div className="footer-links">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            GitHub
          </a>
          <span className="footer-dot">•</span>
          <a
            href="https://ai.google.dev/gemma"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Gemma 4 Docs
          </a>
          <span className="footer-dot">•</span>
          <span className="footer-muted">MIT License</span>
        </div>
      </div>
    </footer>
  );
}
