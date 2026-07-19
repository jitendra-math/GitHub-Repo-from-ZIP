const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'nvidia/nemotron-3-ultra-550b-a55b:free'

/**
 * Suggest a GitHub repository name based on extracted files
 * @param {Array<{path: string, content: string}>} files
 * @returns {Promise<string>} suggested repo name (kebab-case)
 */
export async function suggestRepoName(files) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OpenRouter API key missing. Set VITE_OPENROUTER_API_KEY in .env')
  }

  // Prepare file list with directory structure
  const fileList = files.map(f => f.path).slice(0, 100) // limit to 100 files
  const folderStructure = fileList.join('\n')

  // Try to detect if package.json exists, if yes, include its content
  const pkgFile = files.find(f => f.path.toLowerCase() === 'package.json')
  let pkgContent = null
  if (pkgFile) {
    try {
      const decoded = atob(pkgFile.content)
      pkgContent = JSON.parse(decoded)
    } catch (_) {
      // ignore parse errors
    }
  }

  // Tighter prompt – only output the name
  let userPrompt = `Files:\n${folderStructure}\n\n`
  if (pkgContent && pkgContent.name) {
    userPrompt += `package.json name: "${pkgContent.name}"\n`
  }
  userPrompt += `Based on the above, suggest a short GitHub repo name (kebab-case, max 30 chars). ONLY output the name, nothing else.`

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'GitHub Mobile Uploader'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { 
          role: 'system', 
          content: 'You are a concise AI that outputs ONLY kebab-case repo names. No explanations, no backticks, no extra text.' 
        },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 30,
      temperature: 0.3,
      stop: ['\n', '.', ' '] // stop at newline, period, or space
    })
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`OpenRouter API error (${response.status}): ${errText}`)
  }

  const data = await response.json()
  if (!data.choices || !data.choices.length) {
    throw new Error('No suggestion returned from AI')
  }

  let suggestion = data.choices[0].message.content.trim()
  
  // Clean: keep only valid kebab-case chars (alphanumeric + hyphen)
  suggestion = suggestion
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  
  // Fallback if suggestion is empty
  if (!suggestion || suggestion.length === 0) {
    // Extract first meaningful folder name
    const firstFolder = files.find(f => f.path.includes('/'))?.path.split('/')[0]
    if (firstFolder) {
      suggestion = firstFolder.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    } else {
      suggestion = 'my-project'
    }
  }
  
  return suggestion
}