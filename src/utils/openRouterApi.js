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
  const fileList = files.map(f => f.path).slice(0, 150) // limit to avoid huge prompts
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

  const systemPrompt = `You are a helpful assistant that suggests short, meaningful, and unique GitHub repository names.

Given a list of files and folder structure from a project ZIP, suggest a suitable repo name.
- Use kebab-case (lowercase, hyphens only)
- Maximum 30 characters
- If package.json has a 'name' field, use that as base
- Otherwise, infer from folder structure or main files (e.g., index.html, main.py, etc.)
- Avoid generic names like 'project', 'my-app', 'test'
- Be creative but relevant`

  let userPrompt = `Folder structure:\n${folderStructure}\n\n`
  if (pkgContent && pkgContent.name) {
    userPrompt += `package.json name: "${pkgContent.name}"\n`
  }
  userPrompt += `Suggest exactly one repo name in kebab-case, with no extra explanation or backticks.`

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
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 20,
      temperature: 0.7
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
  // Clean: keep only valid kebab-case chars
  suggestion = suggestion.replace(/[^a-zA-Z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  return suggestion
}