/**
 * Full SPA for the mcp-new web wizard.
 * Structured as composable functions to keep the file manageable.
 * Design system matches the docs-server: dark sidebar, cyan accent, light content.
 */

function renderCSS(): string {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --sidebar-bg: #1a1a2e;
      --sidebar-w: 260px;
      --accent: #4fc3f7;
      --accent-hover: #81d4fa;
      --bg: #f5f5f5;
      --card: #fff;
      --text: #333;
      --text-muted: #78909c;
      --border: #e0e0e0;
      --danger: #ef5350;
      --success: #66bb6a;
      --code-bg: #1a1a2e;
      --code-fg: #f0f0f0;
      --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      --mono: 'Fira Code', 'Monaco', 'Consolas', monospace;
      --radius: 6px;
    }

    body { font-family: var(--font); line-height: 1.6; color: var(--text); background: var(--bg); }

    /* Layout */
    .app { display: flex; min-height: 100vh; }

    .sidebar {
      width: var(--sidebar-w); background: var(--sidebar-bg); color: #fff;
      padding: 24px 16px; position: fixed; height: 100vh; overflow-y: auto;
      display: flex; flex-direction: column;
    }
    .sidebar h1 { font-size: 1.4rem; color: var(--accent); margin-bottom: 8px; }
    .sidebar p { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 28px; }

    .steps { list-style: none; flex: 1; }
    .steps li {
      padding: 10px 14px; border-radius: var(--radius); margin-bottom: 4px;
      cursor: pointer; font-size: 0.9rem; color: #b0bec5;
      display: flex; align-items: center; gap: 10px;
      transition: background 0.2s, color 0.2s;
    }
    .steps li:hover { background: rgba(79,195,247,0.1); color: #fff; }
    .steps li.active { background: rgba(79,195,247,0.15); color: var(--accent); font-weight: 600; }
    .steps li.done { color: var(--success); }
    .steps li .num {
      width: 24px; height: 24px; border-radius: 50%; font-size: 0.75rem;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid currentColor; flex-shrink: 0;
    }
    .steps li.active .num { background: var(--accent); color: var(--sidebar-bg); border-color: var(--accent); }
    .steps li.done .num { background: var(--success); color: #fff; border-color: var(--success); }

    .main { margin-left: var(--sidebar-w); flex: 1; padding: 32px 40px; max-width: 960px; }

    /* Cards */
    .card {
      background: var(--card); border-radius: 8px; padding: 32px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08); margin-bottom: 24px;
    }
    .card h2 { font-size: 1.5rem; color: var(--sidebar-bg); margin-bottom: 6px; }
    .card .subtitle { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 24px; }

    /* Form elements */
    label { display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 4px; color: var(--text); }
    input[type="text"], select, textarea {
      width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius);
      font-size: 0.9rem; font-family: var(--font); background: #fff; color: var(--text);
      transition: border-color 0.2s;
    }
    input:focus, select:focus, textarea:focus { outline: none; border-color: var(--accent); }
    .field { margin-bottom: 18px; }
    .field-row { display: flex; gap: 16px; }
    .field-row .field { flex: 1; }
    .field .error { color: var(--danger); font-size: 0.8rem; margin-top: 2px; }

    /* Radio group */
    .radio-group { display: flex; gap: 12px; flex-wrap: wrap; }
    .radio-group label {
      display: flex; align-items: center; gap: 6px; font-weight: 400; cursor: pointer;
      padding: 8px 14px; border: 1px solid var(--border); border-radius: var(--radius);
      transition: border-color 0.2s, background 0.2s;
    }
    .radio-group label:hover { border-color: var(--accent); }
    .radio-group input:checked + span { color: var(--accent); font-weight: 600; }
    .radio-group label:has(input:checked) { border-color: var(--accent); background: rgba(79,195,247,0.06); }

    /* Buttons */
    .btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 10px 20px; border: none; border-radius: var(--radius);
      font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: background 0.2s, opacity 0.2s;
    }
    .btn-primary { background: var(--accent); color: var(--sidebar-bg); }
    .btn-primary:hover { background: var(--accent-hover); }
    .btn-secondary { background: transparent; color: var(--accent); border: 1px solid var(--accent); }
    .btn-secondary:hover { background: rgba(79,195,247,0.08); }
    .btn-danger { background: transparent; color: var(--danger); border: 1px solid var(--danger); }
    .btn-danger:hover { background: rgba(239,83,80,0.08); }
    .btn-sm { padding: 6px 12px; font-size: 0.8rem; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-row { display: flex; gap: 12px; margin-top: 28px; justify-content: flex-end; }

    /* Item list (tools/resources) */
    .item-list { margin-bottom: 16px; }
    .item-card {
      border: 1px solid var(--border); border-radius: var(--radius); padding: 16px;
      margin-bottom: 10px; position: relative;
    }
    .item-card .item-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;
    }
    .item-card .item-header h4 { font-size: 0.95rem; color: var(--sidebar-bg); }
    .item-card .item-desc { font-size: 0.85rem; color: var(--text-muted); }
    .item-actions { display: flex; gap: 8px; }

    /* Parameter pills */
    .params { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .param-pill {
      font-size: 0.75rem; padding: 3px 8px; border-radius: 10px;
      background: rgba(79,195,247,0.1); color: var(--accent);
    }

    /* Expandable param editor */
    .param-editor { margin-top: 12px; border-top: 1px solid var(--border); padding-top: 12px; }
    .param-row {
      display: flex; gap: 8px; align-items: flex-start; margin-bottom: 8px;
    }
    .param-row input, .param-row select { font-size: 0.82rem; padding: 6px 8px; }
    .param-row .param-name { flex: 2; }
    .param-row .param-type { flex: 1; }
    .param-row .param-desc { flex: 3; }
    .param-row .param-req { flex: 0 0 auto; display: flex; align-items: center; gap: 4px; font-size: 0.8rem; }

    /* Preview */
    .preview-layout { display: flex; gap: 0; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; min-height: 500px; }
    .file-tree {
      width: 240px; background: var(--sidebar-bg); color: #b0bec5; overflow-y: auto;
      font-size: 0.82rem; flex-shrink: 0;
    }
    .file-tree .tree-item {
      padding: 6px 12px; cursor: pointer; white-space: nowrap; overflow: hidden;
      text-overflow: ellipsis; transition: background 0.15s;
    }
    .file-tree .tree-item:hover { background: rgba(79,195,247,0.1); }
    .file-tree .tree-item.active { background: rgba(79,195,247,0.2); color: var(--accent); }
    .code-viewer {
      flex: 1; background: var(--code-bg); color: var(--code-fg); padding: 16px;
      overflow: auto; font-family: var(--mono); font-size: 0.82rem; line-height: 1.7;
      white-space: pre-wrap; word-break: break-word;
    }
    .code-viewer .line-num { display: inline-block; width: 3.5em; color: #555; user-select: none; text-align: right; padding-right: 1em; }

    /* Syntax highlighting (basic) */
    .hl-keyword { color: #c792ea; }
    .hl-string { color: #c3e88d; }
    .hl-comment { color: #546e7a; font-style: italic; }
    .hl-number { color: #f78c6c; }
    .hl-type { color: #ffcb6b; }

    /* Preset quick-fill */
    .preset-btns { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
    .preset-btn {
      padding: 8px 16px; border-radius: var(--radius); border: 1px solid var(--border);
      background: var(--card); cursor: pointer; font-size: 0.85rem; transition: all 0.2s;
    }
    .preset-btn:hover { border-color: var(--accent); color: var(--accent); }
    .preset-btn.active { border-color: var(--accent); background: rgba(79,195,247,0.08); color: var(--accent); font-weight: 600; }

    /* Download section */
    .download-section { text-align: center; padding: 40px 0; }
    .download-section .big-btn {
      padding: 16px 40px; font-size: 1.1rem; border-radius: 8px;
      background: var(--accent); color: var(--sidebar-bg); border: none;
      cursor: pointer; font-weight: 700; transition: background 0.2s;
    }
    .download-section .big-btn:hover { background: var(--accent-hover); }
    .download-section .big-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .cli-command {
      margin-top: 28px; background: var(--code-bg); color: var(--code-fg);
      padding: 16px 20px; border-radius: var(--radius); font-family: var(--mono);
      font-size: 0.9rem; display: flex; align-items: center; justify-content: space-between;
      max-width: 600px; margin-left: auto; margin-right: auto;
    }
    .cli-command .copy-btn {
      background: transparent; border: 1px solid rgba(255,255,255,0.2);
      color: #b0bec5; padding: 4px 10px; border-radius: 4px; cursor: pointer;
      font-size: 0.78rem; transition: all 0.2s; flex-shrink: 0; margin-left: 12px;
    }
    .cli-command .copy-btn:hover { border-color: var(--accent); color: var(--accent); }

    /* Toggle */
    .toggle { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .toggle input[type="checkbox"] { width: 18px; height: 18px; accent-color: var(--accent); }
    .toggle label { font-weight: 400; margin: 0; cursor: pointer; }

    /* Summary list */
    .summary-list { margin: 16px 0; }
    .summary-row { display: flex; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 0.9rem; }
    .summary-row .label { width: 140px; color: var(--text-muted); flex-shrink: 0; }
    .summary-row .value { color: var(--text); font-weight: 500; }

    /* Spinner overlay */
    .spinner-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.3); display: flex;
      align-items: center; justify-content: center; z-index: 100;
    }
    .spinner-overlay .spinner {
      width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.3);
      border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .hidden { display: none !important; }

    /* Responsive */
    @media (max-width: 768px) {
      .sidebar { display: none; }
      .main { margin-left: 0; padding: 16px; }
      .field-row { flex-direction: column; }
      .preview-layout { flex-direction: column; }
      .file-tree { width: 100%; max-height: 180px; }
    }
  `;
}

function renderSidebarHTML(): string {
  const stepLabels = ['Project', 'Tools', 'Resources', 'Review', 'Preview', 'Download'];
  const items = stepLabels
    .map(
      (label, i) =>
        `<li data-step="${i}" class="${i === 0 ? 'active' : ''}" onclick="goToStep(${i})">
          <span class="num">${i + 1}</span> ${label}
        </li>`
    )
    .join('\n');

  return `
    <aside class="sidebar">
      <h1>mcp-new</h1>
      <p>Web Project Generator</p>
      <ul class="steps" id="stepList">${items}</ul>
    </aside>
  `;
}

function renderStepProjectHTML(): string {
  return `
    <div class="step" id="step-0">
      <div class="card">
        <h2>Project Configuration</h2>
        <p class="subtitle">Set up the basics for your MCP server project.</p>

        <div class="field">
          <label for="projectName">Project Name</label>
          <input type="text" id="projectName" placeholder="my-mcp-server" oninput="onProjectNameInput(this.value)">
          <div class="error hidden" id="projectNameError"></div>
        </div>

        <div class="field">
          <label for="projectDesc">Description</label>
          <input type="text" id="projectDesc" placeholder="A Model Context Protocol server">
        </div>

        <div class="field">
          <label for="language">Language</label>
          <select id="language" onchange="onLanguageChange(this.value)">
            <option value="">Loading...</option>
          </select>
        </div>

        <div class="field">
          <label>Transport</label>
          <div class="radio-group">
            <label><input type="radio" name="transport" value="stdio" checked><span>stdio</span></label>
            <label><input type="radio" name="transport" value="sse"><span>SSE</span></label>
          </div>
        </div>

        <div class="field hidden" id="javaBuildToolField">
          <label>Build Tool</label>
          <div class="radio-group">
            <label><input type="radio" name="javaBuildTool" value="maven" checked><span>Maven</span></label>
            <label><input type="radio" name="javaBuildTool" value="gradle"><span>Gradle</span></label>
          </div>
        </div>

        <div class="btn-row">
          <button class="btn btn-primary" onclick="goToStep(1)">Next</button>
        </div>
      </div>
    </div>
  `;
}

function renderStepToolsHTML(): string {
  return `
    <div class="step hidden" id="step-1">
      <div class="card">
        <h2>Tools</h2>
        <p class="subtitle">Define the tools your MCP server will expose.</p>

        <div class="item-list" id="toolList"></div>

        <button class="btn btn-secondary btn-sm" onclick="addTool()">+ Add Tool</button>

        <div class="btn-row">
          <button class="btn btn-secondary" onclick="goToStep(0)">Back</button>
          <button class="btn btn-primary" onclick="goToStep(2)">Next</button>
        </div>
      </div>
    </div>
  `;
}

function renderStepResourcesHTML(): string {
  return `
    <div class="step hidden" id="step-2">
      <div class="card">
        <h2>Resources</h2>
        <p class="subtitle">Define the resources your MCP server will expose (optional).</p>

        <div class="item-list" id="resourceList"></div>

        <button class="btn btn-secondary btn-sm" onclick="addResource()">+ Add Resource</button>

        <div class="btn-row">
          <button class="btn btn-secondary" onclick="goToStep(1)">Back</button>
          <button class="btn btn-primary" onclick="goToStep(3)">Next</button>
        </div>
      </div>
    </div>
  `;
}

function renderStepReviewHTML(): string {
  return `
    <div class="step hidden" id="step-3">
      <div class="card">
        <h2>Review</h2>
        <p class="subtitle">Quick-fill from a preset or review your configuration.</p>

        <label style="margin-bottom:8px;">Apply Preset</label>
        <div class="preset-btns" id="presetBtns">Loading...</div>

        <div class="toggle">
          <input type="checkbox" id="includeExample" checked>
          <label for="includeExample">Include example tool</label>
        </div>

        <div class="summary-list" id="summaryList"></div>

        <div class="btn-row">
          <button class="btn btn-secondary" onclick="goToStep(2)">Back</button>
          <button class="btn btn-primary" onclick="goToStep(4)">Preview Files</button>
        </div>
      </div>
    </div>
  `;
}

function renderStepPreviewHTML(): string {
  return `
    <div class="step hidden" id="step-4">
      <div class="card" style="padding:0;overflow:hidden;">
        <div style="padding:20px 24px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between;">
          <div>
            <h2 style="margin-bottom:0">File Preview</h2>
            <p class="subtitle" style="margin-bottom:0">Generated project files</p>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="loadPreview()" id="refreshPreviewBtn">Refresh</button>
        </div>
        <div class="preview-layout" id="previewLayout">
          <div class="file-tree" id="fileTree"><div style="padding:20px;color:#546e7a;">Loading...</div></div>
          <div class="code-viewer" id="codeViewer">Select a file to view its contents.</div>
        </div>
      </div>

      <div class="btn-row" style="margin-top:16px;">
        <button class="btn btn-secondary" onclick="goToStep(3)">Back</button>
        <button class="btn btn-primary" onclick="goToStep(5)">Download</button>
      </div>
    </div>
  `;
}

function renderStepDownloadHTML(): string {
  return `
    <div class="step hidden" id="step-5">
      <div class="card">
        <h2>Download</h2>
        <p class="subtitle">Download your generated MCP server project.</p>

        <div class="download-section">
          <button class="big-btn" id="downloadBtn" onclick="downloadProject()">Download .tar.gz</button>
          <p style="margin-top:12px;color:var(--text-muted);font-size:0.85rem;" id="downloadStatus"></p>
        </div>

        <div style="margin-top:32px;">
          <label>Or create via CLI</label>
          <div class="cli-command" id="cliCommand">
            <code id="cliCommandText"></code>
            <button class="copy-btn" onclick="copyCliCommand()">Copy</button>
          </div>
        </div>

        <div class="btn-row">
          <button class="btn btn-secondary" onclick="goToStep(4)">Back</button>
          <button class="btn btn-secondary" onclick="startOver()">Start Over</button>
        </div>
      </div>
    </div>
  `;
}

function renderSpinnerHTML(): string {
  return `<div class="spinner-overlay hidden" id="spinner"><div class="spinner"></div></div>`;
}

function renderJS(): string {
  return `
    // ── State ──────────────────────────────────────────────────
    let currentStep = 0;
    let tools = [];
    let resources = [];
    let presets = [];
    let previewFiles = [];
    let languages = [];
    let selectedPreset = null;

    // ── Init ──────────────────────────────────────────────────
    async function init() {
      try {
        const [langRes, presetRes] = await Promise.all([
          fetch('/api/languages').then(r => r.json()),
          fetch('/api/presets').then(r => r.json()),
        ]);
        languages = langRes.languages;
        presets = presetRes.presets;

        // Populate language dropdown
        const langEl = document.getElementById('language');
        langEl.innerHTML = languages.map(l =>
          '<option value="' + l.id + '">' + l.label + '</option>'
        ).join('');
        langEl.value = 'typescript';
        onLanguageChange('typescript');

        // Populate preset buttons
        const presetBtns = document.getElementById('presetBtns');
        presetBtns.innerHTML = '<button class="preset-btn" onclick="clearPreset()">None</button>' +
          presets.map(p =>
            '<button class="preset-btn" data-preset="' + p.id + '" onclick="applyPreset(\\'' + p.id + '\\')">' +
            p.name + '</button>'
          ).join('');
      } catch (e) {
        console.error('Init failed:', e);
      }
    }

    // ── Navigation ────────────────────────────────────────────
    function goToStep(n) {
      document.querySelectorAll('.step').forEach(el => el.classList.add('hidden'));
      document.getElementById('step-' + n).classList.remove('hidden');

      document.querySelectorAll('.steps li').forEach((li, i) => {
        li.classList.remove('active');
        if (i < n) li.classList.add('done');
        else li.classList.remove('done');
        if (i === n) li.classList.add('active');
      });

      currentStep = n;

      // Trigger side-effects
      if (n === 3) renderSummary();
      if (n === 4) loadPreview();
      if (n === 5) renderDownloadStep();
    }

    // ── Step 0: Project ───────────────────────────────────────
    let nameTimer = null;
    function onProjectNameInput(value) {
      clearTimeout(nameTimer);
      nameTimer = setTimeout(async () => {
        const errEl = document.getElementById('projectNameError');
        if (!value.trim()) { errEl.classList.add('hidden'); return; }
        try {
          const res = await fetch('/api/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ field: 'projectName', value }),
          });
          const data = await res.json();
          if (!data.valid) {
            errEl.textContent = data.error;
            errEl.classList.remove('hidden');
          } else {
            errEl.classList.add('hidden');
          }
        } catch (e) { /* ignore */ }
      }, 300);
    }

    function onLanguageChange(lang) {
      const jf = document.getElementById('javaBuildToolField');
      if (lang === 'java' || lang === 'kotlin') jf.classList.remove('hidden');
      else jf.classList.add('hidden');
    }

    // ── Step 1: Tools ─────────────────────────────────────────
    function addTool() {
      tools.push({ name: '', description: '', parameters: [] });
      renderTools();
    }

    function removeTool(idx) {
      tools.splice(idx, 1);
      renderTools();
    }

    function renderTools() {
      const el = document.getElementById('toolList');
      if (tools.length === 0) {
        el.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;">No tools defined yet.</p>';
        return;
      }
      el.innerHTML = tools.map((t, i) => {
        const paramHtml = t.parameters.map((p, pi) =>
          '<div class="param-row">' +
            '<input class="param-name" placeholder="name" value="' + esc(p.name) + '" onchange="updateParam(' + i + ',' + pi + ',\\'name\\',this.value)">' +
            '<select class="param-type" onchange="updateParam(' + i + ',' + pi + ',\\'type\\',this.value)">' +
              ['string','number','boolean','object','array'].map(tp =>
                '<option' + (tp === p.type ? ' selected' : '') + '>' + tp + '</option>'
              ).join('') +
            '</select>' +
            '<input class="param-desc" placeholder="description" value="' + esc(p.description) + '" onchange="updateParam(' + i + ',' + pi + ',\\'description\\',this.value)">' +
            '<span class="param-req"><input type="checkbox"' + (p.required ? ' checked' : '') + ' onchange="updateParam(' + i + ',' + pi + ',\\'required\\',this.checked)"> req</span>' +
            '<button class="btn btn-danger btn-sm" onclick="removeParam(' + i + ',' + pi + ')" style="padding:4px 8px;">x</button>' +
          '</div>'
        ).join('');

        return '<div class="item-card">' +
          '<div class="item-header">' +
            '<div style="flex:1;display:flex;gap:8px;">' +
              '<input type="text" placeholder="tool_name" value="' + esc(t.name) + '" style="flex:1;font-weight:600;" onchange="tools[' + i + '].name=this.value">' +
            '</div>' +
            '<div class="item-actions">' +
              '<button class="btn btn-danger btn-sm" onclick="removeTool(' + i + ')">Remove</button>' +
            '</div>' +
          '</div>' +
          '<input type="text" placeholder="Tool description" value="' + esc(t.description) + '" style="margin-bottom:8px;" onchange="tools[' + i + '].description=this.value">' +
          '<div class="param-editor">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
              '<span style="font-size:0.82rem;font-weight:600;">Parameters</span>' +
              '<button class="btn btn-secondary btn-sm" onclick="addParam(' + i + ')">+ Param</button>' +
            '</div>' +
            paramHtml +
          '</div>' +
        '</div>';
      }).join('');
    }

    function addParam(toolIdx) {
      tools[toolIdx].parameters.push({ name: '', type: 'string', description: '', required: true });
      renderTools();
    }

    function removeParam(toolIdx, paramIdx) {
      tools[toolIdx].parameters.splice(paramIdx, 1);
      renderTools();
    }

    function updateParam(toolIdx, paramIdx, field, value) {
      tools[toolIdx].parameters[paramIdx][field] = value;
    }

    // ── Step 2: Resources ─────────────────────────────────────
    function addResource() {
      resources.push({ name: '', uri: '', description: '', mimeType: '' });
      renderResources();
    }

    function removeResource(idx) {
      resources.splice(idx, 1);
      renderResources();
    }

    function renderResources() {
      const el = document.getElementById('resourceList');
      if (resources.length === 0) {
        el.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;">No resources defined yet.</p>';
        return;
      }
      el.innerHTML = resources.map((r, i) =>
        '<div class="item-card">' +
          '<div class="item-header">' +
            '<div style="flex:1;display:flex;gap:8px;">' +
              '<input type="text" placeholder="resource-name" value="' + esc(r.name) + '" style="flex:1;font-weight:600;" onchange="resources[' + i + '].name=this.value">' +
            '</div>' +
            '<div class="item-actions">' +
              '<button class="btn btn-danger btn-sm" onclick="removeResource(' + i + ')">Remove</button>' +
            '</div>' +
          '</div>' +
          '<div class="field-row">' +
            '<div class="field"><input type="text" placeholder="resource://uri" value="' + esc(r.uri) + '" onchange="resources[' + i + '].uri=this.value"></div>' +
            '<div class="field"><input type="text" placeholder="mime type (optional)" value="' + esc(r.mimeType || '') + '" onchange="resources[' + i + '].mimeType=this.value"></div>' +
          '</div>' +
          '<input type="text" placeholder="Resource description" value="' + esc(r.description) + '" style="margin-top:8px;" onchange="resources[' + i + '].description=this.value">' +
        '</div>'
      ).join('');
    }

    // ── Step 3: Review / Presets ──────────────────────────────
    function applyPreset(id) {
      const preset = presets.find(p => p.id === id);
      if (!preset) return;
      selectedPreset = id;

      tools = JSON.parse(JSON.stringify(preset.tools));
      resources = preset.resources ? JSON.parse(JSON.stringify(preset.resources)) : [];

      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('[data-preset="' + id + '"]').classList.add('active');

      renderTools();
      renderResources();
      renderSummary();
    }

    function clearPreset() {
      selectedPreset = null;
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('.preset-btn:first-child').classList.add('active');
      renderSummary();
    }

    function getConfig() {
      const lang = document.getElementById('language').value;
      const transport = document.querySelector('input[name="transport"]:checked').value;
      const javaBuildToolEl = document.querySelector('input[name="javaBuildTool"]:checked');
      const includeExample = document.getElementById('includeExample').checked;

      const config = {
        name: document.getElementById('projectName').value || 'my-mcp-server',
        description: document.getElementById('projectDesc').value || '',
        language: lang,
        transport: transport,
        tools: tools.filter(t => t.name.trim()),
        resources: resources.filter(r => r.name.trim()),
        prompts: [],
        sampling: { enabled: false },
        includeExampleTool: includeExample,
        skipInstall: true,
        initGit: false,
      };

      if ((lang === 'java' || lang === 'kotlin') && javaBuildToolEl) {
        config.javaBuildTool = javaBuildToolEl.value;
      }

      return config;
    }

    function renderSummary() {
      const config = getConfig();
      const el = document.getElementById('summaryList');
      const rows = [
        ['Name', config.name],
        ['Description', config.description || '(none)'],
        ['Language', config.language],
        ['Transport', config.transport],
        ['Tools', config.tools.length + ' defined'],
        ['Resources', config.resources.length + ' defined'],
        ['Example Tool', config.includeExampleTool ? 'Yes' : 'No'],
      ];
      if (config.javaBuildTool) rows.push(['Build Tool', config.javaBuildTool]);
      if (selectedPreset) rows.push(['Preset', selectedPreset]);

      el.innerHTML = rows.map(([label, value]) =>
        '<div class="summary-row"><span class="label">' + label + '</span><span class="value">' + esc(String(value)) + '</span></div>'
      ).join('');
    }

    // ── Step 4: Preview ───────────────────────────────────────
    async function loadPreview() {
      const btn = document.getElementById('refreshPreviewBtn');
      btn.disabled = true;
      btn.textContent = 'Loading...';

      try {
        const res = await fetch('/api/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(getConfig()),
        });
        const data = await res.json();

        if (data.error) {
          document.getElementById('fileTree').innerHTML = '<div style="padding:20px;color:var(--danger);">' + esc(data.error) + '</div>';
          return;
        }

        previewFiles = data.files;
        renderFileTree();
        if (previewFiles.length > 0) selectFile(0);
      } catch (e) {
        document.getElementById('fileTree').innerHTML = '<div style="padding:20px;color:var(--danger);">Failed to load preview</div>';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Refresh';
      }
    }

    function renderFileTree() {
      const el = document.getElementById('fileTree');
      el.innerHTML = previewFiles.map((f, i) =>
        '<div class="tree-item" data-idx="' + i + '" onclick="selectFile(' + i + ')">' + esc(f.path) + '</div>'
      ).join('');
    }

    function selectFile(idx) {
      document.querySelectorAll('.tree-item').forEach(el => el.classList.remove('active'));
      const item = document.querySelector('.tree-item[data-idx="' + idx + '"]');
      if (item) item.classList.add('active');

      const file = previewFiles[idx];
      const viewer = document.getElementById('codeViewer');
      viewer.innerHTML = highlightCode(file.content, file.language);
    }

    function highlightCode(code, lang) {
      const lines = code.split('\\n');
      return lines.map((line, i) => {
        const num = '<span class="line-num">' + (i + 1) + '</span>';
        return num + highlightLine(escHtml(line), lang);
      }).join('\\n');
    }

    function highlightLine(line, lang) {
      // Comment detection
      const commentPatterns = {
        typescript: /(\\/\\/.*$)/,
        javascript: /(\\/\\/.*$)/,
        python: /(#.*$)/,
        go: /(\\/\\/.*$)/,
        rust: /(\\/\\/.*$)/,
        java: /(\\/\\/.*$)/,
        kotlin: /(\\/\\/.*$)/,
        csharp: /(\\/\\/.*$)/,
        elixir: /(#.*$)/,
        toml: /(#.*$)/,
        yaml: /(#.*$)/,
      };

      const cp = commentPatterns[lang];
      if (cp) {
        line = line.replace(cp, '<span class="hl-comment">$1</span>');
      }

      // Strings (double and single quoted)
      line = line.replace(/(?<!hl-comment[^<]*?)(&quot;[^&]*?&quot;|&#39;[^&]*?&#39;|"[^"]*?"|'[^']*?')/g, function(match) {
        if (match.includes('hl-comment')) return match;
        return '<span class="hl-string">' + match + '</span>';
      });

      // Keywords
      const keywords = ['import','export','from','const','let','var','function','class','return',
        'if','else','for','while','async','await','new','type','interface','enum',
        'def','self','True','False','None','func','struct','pub','fn','use','mod',
        'package','public','private','static','void','final','override','val',
        'using','namespace','defmodule','do','end','require'];

      keywords.forEach(kw => {
        const re = new RegExp('\\\\b(' + kw + ')\\\\b', 'g');
        line = line.replace(re, function(m, g1, offset, str) {
          // Skip if inside a tag
          const before = str.substring(0, offset);
          const opens = (before.match(/</g) || []).length;
          const closes = (before.match(/>/g) || []).length;
          if (opens > closes) return m;
          return '<span class="hl-keyword">' + g1 + '</span>';
        });
      });

      // Numbers
      line = line.replace(/\\b(\\d+\\.?\\d*)\\b/g, function(m, g1, offset, str) {
        const before = str.substring(0, offset);
        const opens = (before.match(/</g) || []).length;
        const closes = (before.match(/>/g) || []).length;
        if (opens > closes) return m;
        return '<span class="hl-number">' + g1 + '</span>';
      });

      return line;
    }

    // ── Step 5: Download ──────────────────────────────────────
    function renderDownloadStep() {
      const config = getConfig();
      const cliParts = ['npx mcp-new', config.name];

      const langFlags = {
        typescript: '-t', python: '-p', go: '-g', rust: '-r',
        java: '-j', kotlin: '-k', csharp: '-c', elixir: '-e',
      };
      if (langFlags[config.language]) cliParts.push(langFlags[config.language]);

      if (config.javaBuildTool === 'gradle') cliParts.push('--gradle');

      document.getElementById('cliCommandText').textContent = cliParts.join(' ');
    }

    async function downloadProject() {
      const btn = document.getElementById('downloadBtn');
      const status = document.getElementById('downloadStatus');
      btn.disabled = true;
      status.textContent = 'Generating...';

      try {
        const res = await fetch('/api/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(getConfig()),
        });

        if (!res.ok) {
          const err = await res.json();
          status.textContent = 'Error: ' + (err.error || 'Download failed');
          return;
        }

        const blob = await res.blob();
        const config = getConfig();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = config.name + '.tar.gz';
        a.click();
        URL.revokeObjectURL(url);
        status.textContent = 'Downloaded!';
      } catch (e) {
        status.textContent = 'Error: ' + e.message;
      } finally {
        btn.disabled = false;
      }
    }

    function copyCliCommand() {
      const text = document.getElementById('cliCommandText').textContent;
      navigator.clipboard.writeText(text).then(() => {
        const btn = event.target;
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 1500);
      });
    }

    function startOver() {
      tools = [];
      resources = [];
      selectedPreset = null;
      previewFiles = [];
      document.getElementById('projectName').value = '';
      document.getElementById('projectDesc').value = '';
      document.getElementById('language').value = 'typescript';
      onLanguageChange('typescript');
      document.querySelector('input[name="transport"][value="stdio"]').checked = true;
      document.getElementById('includeExample').checked = true;
      renderTools();
      renderResources();
      goToStep(0);
    }

    // ── Helpers ───────────────────────────────────────────────
    function esc(s) {
      const div = document.createElement('div');
      div.textContent = s;
      return div.innerHTML;
    }

    function escHtml(s) {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // ── Boot ──────────────────────────────────────────────────
    init();
    renderTools();
    renderResources();
  `;
}

/**
 * Render the full SPA HTML page.
 */
export function renderSPA(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>mcp-new — Web Generator</title>
  <style>${renderCSS()}</style>
</head>
<body>
  <div class="app">
    ${renderSidebarHTML()}
    <main class="main">
      ${renderStepProjectHTML()}
      ${renderStepToolsHTML()}
      ${renderStepResourcesHTML()}
      ${renderStepReviewHTML()}
      ${renderStepPreviewHTML()}
      ${renderStepDownloadHTML()}
    </main>
  </div>
  ${renderSpinnerHTML()}
  <script>${renderJS()}</script>
</body>
</html>`;
}
