/**
 * API client communicating with RepoGenius AI FastAPI backend.
 * Never fakes or simulates AI results.
 */

const API_BASE_URL = '';

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    if (res.ok) {
      const data = await res.json();
      return {
        isOnline: true,
        gemmaConfigured: Boolean(data.gemma_configured),
        model: data.model || 'Gemma 4',
      };
    }
    return { isOnline: false, gemmaConfigured: false, error: `HTTP ${res.status}` };
  } catch {
    return { isOnline: false, gemmaConfigured: false, error: 'Backend offline' };
  }
}

export async function explainRepoWithAI(repoData) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/explain-repo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repo_name: repoData.full_name,
        description: repoData.description || '',
        language: repoData.language || '',
        stars: repoData.stars || 0,
        readme_excerpt: (repoData.readme || '').slice(0, 4000),
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data.detail || `Server error (HTTP ${res.status}).` };
    }
    return { success: true, data };
  } catch (err) {
    return { success: false, error: `Backend connection failed: ${err.message}` };
  }
}

export async function explainCodeWithAI(code, language = '', context = '') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/explain-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language, context }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data.detail || `Server error (HTTP ${res.status}).` };
    }
    return { success: true, data };
  } catch (err) {
    return { success: false, error: `Backend connection failed: ${err.message}` };
  }
}

export async function debugScreenshotWithAI(imageFile, question) {
  if (!imageFile) {
    return { success: false, error: 'Please select an image file first.' };
  }

  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('question', question || 'Diagnose the programming error in this screenshot.');

  try {
    const res = await fetch(`${API_BASE_URL}/api/debug-screenshot`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data.detail || `Server error (HTTP ${res.status}).` };
    }
    return {
      success: true,
      data: {
        diagnosis: data.diagnosis,
        likelyCause: data.likely_cause,
        suggestedFix: data.suggested_fix,
        model: data.model || 'Gemma 4',
      },
    };
  } catch (err) {
    return { success: false, error: `Backend connection failed: ${err.message}` };
  }
}
