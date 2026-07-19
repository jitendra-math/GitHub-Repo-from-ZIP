// GitHub API ke initial setup ke liye chota sa wait
const wait = (ms) => new Promise(res => setTimeout(res, ms));

// Helper: Get authenticated user info
const getAuthenticatedUser = async (token, headers) => {
  const userRes = await fetch('https://api.github.com/user', { headers });
  if (!userRes.ok) throw new Error('Invalid Token! Please check permissions.');
  return userRes.json();
};

// Helper: Upload blobs and build tree items from files
const createBlobsAndTreeItems = async (owner, repo, files, headers, onProgress) => {
  const treeItems = [];
  const safeFiles = files.filter(f => {
    const p = f.path.toLowerCase();
    return p && !p.includes('.git/') && !p.includes('.ds_store') && !p.includes('__macosx');
  });

  for (let i = 0; i < safeFiles.length; i++) {
    const file = safeFiles[i];
    onProgress(`Uploading files (${i + 1}/${safeFiles.length})...`);
    const cleanPath = file.path.split('/').filter(Boolean).join('/');

    const blobRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ content: file.content || "", encoding: 'base64' }),
    });
    if (!blobRes.ok) {
      const blobErr = await blobRes.json();
      throw new Error(`Blob failed for ${cleanPath}: ${blobErr.message}`);
    }
    const blobData = await blobRes.json();
    treeItems.push({
      path: cleanPath,
      mode: '100644',
      type: 'blob',
      sha: blobData.sha,
    });
  }
  return treeItems;
};

// Helper: Create a tree (no base tree = fresh tree)
const createTree = async (owner, repo, treeItems, headers, onProgress) => {
  onProgress('Building fresh folder structure...');
  const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ tree: treeItems }),
  });
  if (!treeRes.ok) {
    const treeErr = await treeRes.json();
    throw new Error(`Tree creation failed: ${treeErr.message}`);
  }
  const treeData = await treeRes.json();
  return treeData.sha;
};

// Helper: Create commit (with or without parents)
const createCommit = async (owner, repo, treeSha, message, parentSha, headers, onProgress) => {
  onProgress('Committing code...');
  const body = { message, tree: treeSha };
  if (parentSha) body.parents = [parentSha];
  const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!commitRes.ok) {
    const commitErr = await commitRes.json();
    throw new Error(`Commit failed: ${commitErr.message}`);
  }
  const commitData = await commitRes.json();
  return commitData.sha;
};

// Helper: Update branch reference (force push or create)
const updateBranchRef = async (owner, repo, branch, commitSha, headers, onProgress) => {
  onProgress('Finalizing force push...');
  // Try to update existing branch
  let pushRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ sha: commitSha, force: true }),
  });
  // If branch doesn't exist, create it
  if (!pushRes.ok) {
    pushRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: commitSha }),
    });
    if (!pushRes.ok) {
      const pushErr = await pushRes.json();
      throw new Error(`Final push failed: ${pushErr.message}`);
    }
  }
};

// ------------------- Original function (unchanged logic, but refactored slightly) -------------------
export const createGithubRepoAndPush = async (token, repoName, files, onProgress) => {
  const baseUrl = 'https://api.github.com';
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  try {
    onProgress('Verifying account...');
    const userData = await getAuthenticatedUser(token, headers);
    const owner = userData.login;

    onProgress('Creating repository...');
    const repoRes = await fetch(`${baseUrl}/user/repos`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: repoName,
        private: true,
        auto_init: true
      }),
    });
    if (!repoRes.ok) {
      const errorData = await repoRes.json();
      throw new Error(`Repo creation failed: ${errorData.message}`);
    }
    const repoData = await repoRes.json();
    const branch = repoData.default_branch || 'main';

    onProgress('Warming up GitHub database...');
    await wait(3000);

    const treeItems = await createBlobsAndTreeItems(owner, repoName, files, headers, onProgress);
    const treeSha = await createTree(owner, repoName, treeItems, headers, onProgress);
    const commitSha = await createCommit(owner, repoName, treeSha, '🚀 Initial project upload via JSS Mobile Uploader', null, headers, onProgress);
    await updateBranchRef(owner, repoName, branch, commitSha, headers, onProgress);

    return `https://github.com/${owner}/${repoName}`;
  } catch (error) {
    console.error("GitHub API Error:", error);
    throw error;
  }
};

// ------------------- NEW FUNCTION: Push to existing repo branch -------------------
export const pushToExistingRepoBranch = async (token, repoFullName, branchName, files, onProgress) => {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  try {
    // Validate repoFullName format
    if (!repoFullName.includes('/')) {
      throw new Error('Repository must be in format "owner/repo"');
    }
    const [owner, repo] = repoFullName.split('/');

    // Step 1: Verify token and repo access
    onProgress('Verifying access...');
    const userRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!userRes.ok) {
      if (userRes.status === 404) throw new Error(`Repository "${repoFullName}" not found or you don't have access.`);
      throw new Error(`Cannot access repository: ${userRes.statusText}`);
    }
    const repoData = await userRes.json();
    const defaultBranch = repoData.default_branch || 'main';

    // Step 2: Get the SHA of the default branch (to create new branch if needed)
    let baseSha = null;
    onProgress(`Checking branch "${branchName}"...`);
    const branchRefUrl = `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branchName}`;
    let branchRes = await fetch(branchRefUrl, { headers });
    
    if (branchRes.ok) {
      // Branch exists – we will force update it later
      onProgress(`Branch "${branchName}" exists. Will replace its content.`);
      const branchData = await branchRes.json();
      baseSha = branchData.object.sha;
    } else if (branchRes.status === 404) {
      // Branch does not exist – create from default branch
      onProgress(`Branch "${branchName}" not found. Creating from "${defaultBranch}"...`);
      const defaultBranchRefUrl = `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${defaultBranch}`;
      const defaultBranchRes = await fetch(defaultBranchRefUrl, { headers });
      if (!defaultBranchRes.ok) throw new Error(`Default branch "${defaultBranch}" not found.`);
      const defaultBranchData = await defaultBranchRes.json();
      baseSha = defaultBranchData.object.sha;
    } else {
      const err = await branchRes.json();
      throw new Error(`Failed to check branch: ${err.message}`);
    }

    // Step 3: Upload files as blobs and build tree items
    const treeItems = await createBlobsAndTreeItems(owner, repo, files, headers, onProgress);
    
    // Step 4: Create a new tree (no base tree = fresh tree that will replace branch content)
    const treeSha = await createTree(owner, repo, treeItems, headers, onProgress);
    
    // Step 5: Create commit with parent = current branch head (baseSha)
    const commitMessage = `📦 Upload from ZIP via JSS Mobile Uploader to branch ${branchName}`;
    const commitSha = await createCommit(owner, repo, treeSha, commitMessage, baseSha, headers, onProgress);
    
    // Step 6: Force push the commit to the branch (replaces entire content)
    await updateBranchRef(owner, repo, branchName, commitSha, headers, onProgress);
    
    // Return URL to the branch
    return `https://github.com/${owner}/${repo}/tree/${branchName}`;
    
  } catch (error) {
    console.error("Existing Repo Push Error:", error);
    throw error;
  }
};

// ==================== NEW FUNCTIONS FOR DROPDOWN ====================

/**
 * Fetch all repositories for the authenticated user
 * @param {string} token - GitHub Personal Access Token
 * @returns {Promise<Array<{full_name: string, name: string, default_branch: string}>>}
 */
export const fetchUserRepos = async (token) => {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
  }

  try {
    const response = await fetch(
      'https://api.github.com/user/repos?per_page=100&sort=updated&type=all&affiliation=owner,collaborator,organization_member',
      { headers }
    )

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid token or token expired')
      }
      if (response.status === 403) {
        throw new Error('Rate limit exceeded. Please try again later.')
      }
      const errorData = await response.json()
      throw new Error(`Failed to fetch repositories: ${errorData.message || response.statusText}`)
    }

    const repos = await response.json()
    
    // Return only required fields
    return repos.map(repo => ({
      full_name: repo.full_name,
      name: repo.name,
      default_branch: repo.default_branch || 'main',
      private: repo.private,
      updated_at: repo.updated_at
    }))
  } catch (error) {
    console.error('Fetch repos error:', error)
    throw error
  }
}

/**
 * Fetch all branches for a specific repository
 * @param {string} token - GitHub Personal Access Token
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Array<{name: string, default: boolean}>>}
 */
export const fetchRepoBranches = async (token, owner, repo) => {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
  }

  try {
    // First, get the default branch
    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    )

    if (!repoResponse.ok) {
      if (repoResponse.status === 404) {
        throw new Error(`Repository "${owner}/${repo}" not found or you don't have access`)
      }
      const errorData = await repoResponse.json()
      throw new Error(`Failed to fetch repository info: ${errorData.message || repoResponse.statusText}`)
    }

    const repoData = await repoResponse.json()
    const defaultBranch = repoData.default_branch || 'main'

    // Now fetch all branches
    const branchesResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`,
      { headers }
    )

    if (!branchesResponse.ok) {
      const errorData = await branchesResponse.json()
      throw new Error(`Failed to fetch branches: ${errorData.message || branchesResponse.statusText}`)
    }

    const branches = await branchesResponse.json()
    
    // Mark default branch
    return branches.map(branch => ({
      name: branch.name,
      default: branch.name === defaultBranch
    }))
  } catch (error) {
    console.error('Fetch branches error:', error)
    throw error
  }
}