import { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import RepoAnalyzer from './components/RepoAnalyzer';
import CodeExplainer from './components/CodeExplainer';
import VisualDebugger from './components/VisualDebugger';
import Footer from './components/Footer';
import { checkBackendHealth } from './utils/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'analyzer' | 'explainer' | 'debugger'
  const [initialRepoUrl, setInitialRepoUrl] = useState('');
  const [backendStatus, setBackendStatus] = useState({
    isOnline: false,
    gemmaConfigured: false,
    model: 'Gemma 4',
  });

  useEffect(() => {
    checkBackendHealth().then((status) => {
      setBackendStatus(status);
    });
  }, []);

  const handleNavigateTool = (toolId) => {
    setActiveTab(toolId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalyzeRepo = (repoUrl) => {
    setInitialRepoUrl(repoUrl);
    setActiveTab('analyzer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-wrapper">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNavigateTool={handleNavigateTool}
        backendStatus={backendStatus}
      />

      <main className="main-content">
        {activeTab === 'home' && (
          <HomePage
            onNavigateTool={handleNavigateTool}
            onAnalyzeRepo={handleAnalyzeRepo}
            backendStatus={backendStatus}
          />
        )}
        {activeTab === 'analyzer' && (
          <RepoAnalyzer
            backendStatus={backendStatus}
            initialUrl={initialRepoUrl}
          />
        )}
        {activeTab === 'explainer' && (
          <CodeExplainer backendStatus={backendStatus} />
        )}
        {activeTab === 'debugger' && (
          <VisualDebugger backendStatus={backendStatus} />
        )}
      </main>

      <Footer />
    </div>
  );
}
