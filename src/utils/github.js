/**
 * GitHub API utilities for RepoGenius AI.
 * Retrieves real repository metadata, README, and directory contents.
 * No mock data or fake statistics.
 */

/**
 * Validates and extracts owner and repository name from various GitHub URL formats.
 * Supports:
 * - https://github.com/owner/repo
 * - http://github.com/owner/repo
 * - github.com/owner/repo
 * - owner/repo
 * - https://github.com/owner/repo.git
 * - git@github.com:owner/repo.git
 *
 * @param {string} input
 * @returns {{ owner: string, repo: string, fullName: string } | null}
 */
export function parseGitHubUrl(input) {
  if (!input || typeof input !== 'string') return null;

  const trimmed = input.trim();
  if (!trimmed) return null;

  // Format 1: Shorthand "owner/repo"
  const shorthandMatch = trimmed.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (shorthandMatch) {
    const owner = shorthandMatch[1];
    let repo = shorthandMatch[2];
    if (repo.endsWith('.git')) repo = repo.slice(0, -4);
    return { owner, repo, fullName: `${owner}/${repo}` };
  }

  // Format 2: SSH URL "git@github.com:owner/repo.git"
  const sshMatch = trimmed.match(/^git@github\.com:([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:\.git)?$/);
  if (sshMatch) {
    return { owner: sshMatch[1], repo: sshMatch[2], fullName: `${sshMatch[1]}/${sshMatch[2]}` };
  }

  // Format 3: HTTP / HTTPS URL
  try {
    let urlString = trimmed;
    if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
      urlString = `https://${urlString}`;
    }
    const url = new URL(urlString);
    if (!url.hostname.includes('github.com')) {
      return null;
    }

    const segments = url.pathname.split('/').filter(Boolean);
    if (segments.length >= 2) {
      const owner = segments[0];
      let repo = segments[1];
      if (repo.endsWith('.git')) repo = repo.slice(0, -4);
      return { owner, repo, fullName: `${owner}/${repo}` };
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Fetches real repository metadata, README, and directory structure from the public GitHub REST API.
 *
 * @param {string} owner
 * @param {string} repo
 * @returns {Promise<{ success: boolean, data?: object, error?: string, status?: number }>}
 */
export async function fetchGitHubRepo(owner, repo) {
  const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const readmeUrl = `https://api.github.com/repos/${owner}/${repo}/readme`;
  const contentsUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;

  try {
    // 1. Fetch Repository Metadata
    const repoRes = await fetch(repoUrl, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (repoRes.status === 404) {
      return {
        success: false,
        status: 404,
        error: `Repository "${owner}/${repo}" was not found or is private on GitHub.`,
      };
    }

    if (repoRes.status === 403) {
      const resetHeader = repoRes.headers.get('x-ratelimit-reset');
      let resetMsg = '';
      if (resetHeader) {
        const resetTime = new Date(Number(resetHeader) * 1000).toLocaleTimeString();
        resetMsg = ` Limit resets at ${resetTime}.`;
      }
      return {
        success: false,
        status: 403,
        error: `GitHub API rate limit reached.${resetMsg} Please wait a short while.`,
      };
    }

    if (!repoRes.ok) {
      return {
        success: false,
        status: repoRes.status,
        error: `GitHub API request failed with HTTP ${repoRes.status}.`,
      };
    }

    const repoData = await repoRes.json();

    // 2. Fetch README
    let readmeText = '';
    try {
      const readmeRes = await fetch(readmeUrl, {
        headers: { Accept: 'application/vnd.github.v3.raw' },
      });
      if (readmeRes.ok) {
        readmeText = await readmeRes.text();
      }
    } catch {
      readmeText = '';
    }

    // 3. Fetch Root Directory Contents
    let directoryItems = [];
    try {
      const contentsRes = await fetch(contentsUrl, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });
      if (contentsRes.ok) {
        const rawItems = await contentsRes.json();
        if (Array.isArray(rawItems)) {
          directoryItems = rawItems.map((item) => ({
            name: item.name,
            path: item.path,
            type: item.type, // 'file' | 'dir'
            size: item.size,
            html_url: item.html_url,
          }));
        }
      }
    } catch {
      directoryItems = [];
    }

    return {
      success: true,
      data: {
        name: repoData.name,
        full_name: repoData.full_name,
        description: repoData.description || 'No description provided.',
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        language: repoData.language || 'Plain Text',
        license: repoData.license?.name || repoData.license?.spdx_id || 'No license specified',
        default_branch: repoData.default_branch,
        html_url: repoData.html_url,
        readme: readmeText,
        contents: directoryItems,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: `Network error connecting to GitHub: ${err.message || 'Check your internet connection.'}`,
    };
  }
}
