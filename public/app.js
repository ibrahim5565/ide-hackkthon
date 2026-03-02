/**
 * Proposal Auto-Generator – Frontend Logic
 * Handles tag inputs, dynamic gap builder, API submission, and result display.
 */

'use strict';

// ─────────────────────────────────────────
// TAG INPUT (Departments)
// ─────────────────────────────────────────
const departments = [];

const deptWrapper = document.getElementById('dept-wrapper');
const deptInput = document.getElementById('dept-input');

function renderTags() {
    // Remove existing tags (keep input)
    deptWrapper.querySelectorAll('.tag').forEach(t => t.remove());
    departments.forEach((dept, idx) => {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.innerHTML = `${dept}<button type="button" aria-label="Remove">×</button>`;
        tag.querySelector('button').addEventListener('click', () => {
            departments.splice(idx, 1);
            renderTags();
        });
        deptWrapper.insertBefore(tag, deptInput);
    });
}

function addDept(value) {
    const trimmed = value.trim().replace(/,$/, '');
    if (trimmed && !departments.includes(trimmed)) {
        departments.push(trimmed);
        renderTags();
    }
    deptInput.value = '';
}

deptInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        addDept(deptInput.value);
    }
    if (e.key === 'Backspace' && deptInput.value === '' && departments.length) {
        departments.pop();
        renderTags();
    }
});

deptInput.addEventListener('blur', () => {
    if (deptInput.value.trim()) addDept(deptInput.value);
});

deptWrapper.addEventListener('click', () => deptInput.focus());

// ─────────────────────────────────────────
// DYNAMIC GAP ITEMS
// ─────────────────────────────────────────
const gapContainer = document.getElementById('gaps-container');
const addGapBtn = document.getElementById('add-gap-btn');
let gapCount = 0;

// Affected-department tags per gap item
const gapAffectedDepts = {};

function createGapItem() {
    gapCount++;
    const id = gapCount;
    gapAffectedDepts[id] = [];

    const div = document.createElement('div');
    div.className = 'gap-item';
    div.dataset.gapId = id;
    div.innerHTML = `
    <div class="gap-item-header">
      <span class="gap-num">Gap #${id}</span>
      ${id > 1 ? `<button type="button" class="btn-remove-gap" data-id="${id}">Remove</button>` : ''}
    </div>
    <div class="form-row single">
      <div class="field">
        <label>Gap Title <span class="req">*</span></label>
        <input type="text" data-gap="${id}" data-field="title"
          placeholder="e.g. Lack of practical AI/ML exposure among students" />
      </div>
    </div>
    <div class="form-row single">
      <div class="field">
        <label>Description <span class="req">*</span></label>
        <textarea data-gap="${id}" data-field="description" rows="3"
          placeholder="Describe the gap in detail…"></textarea>
      </div>
    </div>
    <div class="form-row">
      <div class="field">
        <label>Category <span class="req">*</span></label>
        <select data-gap="${id}" data-field="category">
          <option value="">— choose —</option>
          <option value="skill_gap">Skill Gap</option>
          <option value="infrastructure">Infrastructure</option>
          <option value="curriculum">Curriculum</option>
          <option value="industry_alignment">Industry Alignment</option>
          <option value="research">Research</option>
          <option value="technology">Technology</option>
          <option value="collaboration">Collaboration</option>
          <option value="funding">Funding</option>
        </select>
      </div>
      <div class="field">
        <label>Severity <span class="req">*</span></label>
        <select data-gap="${id}" data-field="severity">
          <option value="">— choose —</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>
    </div>
    <div class="field">
      <label>Affected Departments <span class="req">*</span></label>
      <div class="tag-input-wrapper" id="aff-wrapper-${id}">
        <input class="tag-real-input" id="aff-input-${id}" type="text"
          placeholder="Type department name and press Enter…" />
      </div>
      <div class="helper">Press <strong>Enter</strong> after each department</div>
    </div>
    <div class="form-row single">
      <div class="field">
        <label>Estimated Impact (optional)</label>
        <textarea data-gap="${id}" data-field="estimatedImpact" rows="2"
          placeholder="e.g. Affects 60% of final-year students in placement rounds"></textarea>
      </div>
    </div>
  `;

    // Remove button handler
    const removeBtn = div.querySelector('.btn-remove-gap');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            div.remove();
            delete gapAffectedDepts[id];
        });
    }

    gapContainer.appendChild(div);

    // Wire tag-input for affected departments
    const affWrapper = document.getElementById(`aff-wrapper-${id}`);
    const affInput = document.getElementById(`aff-input-${id}`);

    function renderAffTags() {
        affWrapper.querySelectorAll('.tag').forEach(t => t.remove());
        gapAffectedDepts[id].forEach((dept, idx) => {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.innerHTML = `${dept}<button type="button" aria-label="Remove">×</button>`;
            tag.querySelector('button').addEventListener('click', () => {
                gapAffectedDepts[id].splice(idx, 1);
                renderAffTags();
            });
            affWrapper.insertBefore(tag, affInput);
        });
    }

    function addAffDept(value) {
        const trimmed = value.trim().replace(/,$/, '');
        if (trimmed && !gapAffectedDepts[id].includes(trimmed)) {
            gapAffectedDepts[id].push(trimmed);
            renderAffTags();
        }
        affInput.value = '';
    }

    affInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addAffDept(affInput.value); }
        if (e.key === 'Backspace' && affInput.value === '' && gapAffectedDepts[id].length) {
            gapAffectedDepts[id].pop();
            renderAffTags();
        }
    });
    affInput.addEventListener('blur', () => { if (affInput.value.trim()) addAffDept(affInput.value); });
    affWrapper.addEventListener('click', () => affInput.focus());
}

addGapBtn.addEventListener('click', createGapItem);

// Start with one gap item pre-populated
createGapItem();

// ─────────────────────────────────────────
// PROGRESS SIMULATION
// ─────────────────────────────────────────
let progressInterval = null;

function startProgress() {
    const bar = document.getElementById('progress-bar');
    const wrap = document.getElementById('progress-wrap');
    wrap.style.display = 'block';
    bar.style.width = '0%';
    let pct = 0;
    progressInterval = setInterval(() => {
        // Simulate slower as it approaches 90%
        const step = pct < 40 ? 3 : pct < 70 ? 1.5 : pct < 88 ? 0.5 : 0;
        pct = Math.min(pct + step, 90);
        bar.style.width = pct + '%';
    }, 300);
}

function finishProgress(success) {
    clearInterval(progressInterval);
    const bar = document.getElementById('progress-bar');
    bar.style.width = '100%';
    bar.style.background = success
        ? 'linear-gradient(90deg,#238636,#4ade80)'
        : 'linear-gradient(90deg,#da3633,#f87171)';
    setTimeout(() => {
        document.getElementById('progress-wrap').style.display = 'none';
        bar.style.background = '';
        bar.style.width = '0%';
    }, 1800);
}

function setStatus(msg) {
    document.getElementById('status-log').textContent = msg;
}

// ─────────────────────────────────────────
// BUILD PAYLOAD
// ─────────────────────────────────────────
function buildPayload() {
    const proposalType = document.getElementById('proposalType').value;

    const institutionProfile = {
        name: document.getElementById('instName').value.trim(),
        type: document.getElementById('instType').value,
        location: document.getElementById('instLocation').value.trim(),
        departments: [...departments],
    };

    // Optional fields – only include if filled
    const email = document.getElementById('instEmail').value.trim();
    const estab = document.getElementById('instEstablished').value.trim();
    const students = document.getElementById('instStudents').value.trim();
    const accred = document.getElementById('instAccreditation').value.trim();
    const website = document.getElementById('instWebsite').value.trim();
    const vision = document.getElementById('instVision').value.trim();
    const mission = document.getElementById('instMission').value.trim();

    if (email) institutionProfile.contactEmail = email;
    if (estab) institutionProfile.established = parseInt(estab, 10);
    if (students) institutionProfile.studentCount = parseInt(students, 10);
    if (accred) institutionProfile.accreditation = accred;
    if (website) institutionProfile.website = website;
    if (vision) institutionProfile.vision = vision;
    if (mission) institutionProfile.mission = mission;

    // Collect gap items
    const gapItems = [];
    gapContainer.querySelectorAll('.gap-item').forEach(gapEl => {
        const gid = parseInt(gapEl.dataset.gapId, 10);
        const get = field => {
            const el = gapEl.querySelector(`[data-field="${field}"]`);
            return el ? el.value.trim() : '';
        };

        const gap = {
            title: get('title'),
            description: get('description'),
            category: get('category'),
            severity: get('severity'),
            affectedDepartments: gapAffectedDepts[gid] ? [...gapAffectedDepts[gid]] : [],
        };

        const impact = get('estimatedImpact');
        if (impact) gap.estimatedImpact = impact;

        gapItems.push(gap);
    });

    return { proposalType, institutionProfile, gapAnalysis: gapItems };
}

// ─────────────────────────────────────────
// CLIENT-SIDE VALIDATION
// ─────────────────────────────────────────
function validateForm(payload) {
    const errors = [];

    if (!payload.proposalType)
        errors.push('Please select a Proposal Type.');
    if (!payload.institutionProfile.name)
        errors.push('Institution Name is required.');
    if (!payload.institutionProfile.type)
        errors.push('Institution Type is required.');
    if (!payload.institutionProfile.location)
        errors.push('Institution Location is required.');
    if (payload.institutionProfile.departments.length === 0)
        errors.push('At least one Department is required (press Enter to add).');

    if (payload.gapAnalysis.length === 0)
        errors.push('At least one Gap item is required.');

    payload.gapAnalysis.forEach((g, i) => {
        const n = i + 1;
        if (!g.title) errors.push(`Gap #${n}: Title is required.`);
        if (!g.description) errors.push(`Gap #${n}: Description is required.`);
        if (!g.category) errors.push(`Gap #${n}: Category is required.`);
        if (!g.severity) errors.push(`Gap #${n}: Severity is required.`);
        if (g.affectedDepartments.length === 0)
            errors.push(`Gap #${n}: At least one Affected Department is required.`);
    });

    return errors;
}

// ─────────────────────────────────────────
// SHOW RESULT
// ─────────────────────────────────────────
function showSuccess(data) {
    const resultDiv = document.getElementById('result');
    const fullUrl = `http://127.0.0.1:3000${data.downloadUrl}`;
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
    <div class="result-success">
      <div class="checkmark">✅</div>
      <h3>Proposal Generated Successfully!</h3>
      <p>Your <strong>${(data.proposalType || '').toUpperCase()}</strong> proposal for
         <strong>${data.institutionName || ''}</strong> is ready.</p>
      <div class="download-actions">
        <a class="btn-download primary" href="${fullUrl}" download target="_blank" rel="noopener">
          ⬇ Download PDF
        </a>
        <a class="btn-download secondary" href="${fullUrl}" target="_blank" rel="noopener">
          🔗 Open in New Tab
        </a>
      </div>
      <p style="margin-top:14px; font-size:0.73rem; color:var(--muted);">
        File: <code style="color:var(--accent-lt);">${data.downloadUrl}</code>
      </p>
    </div>
  `;
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showError(message, detail) {
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
    <div class="result-error">
      <h3>⚠ Generation Failed</h3>
      <pre>${escapeHtml(message)}${detail ? '\n\nDetail: ' + escapeHtml(detail) : ''}</pre>
    </div>
  `;
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showValidationErrors(errors) {
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
    <div class="result-error">
      <h3>⚠ Please fix the following before generating:</h3>
      <pre>${errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}</pre>
    </div>
  `;
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─────────────────────────────────────────
// FORM SUBMIT
// ─────────────────────────────────────────
document.getElementById('proposal-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    document.getElementById('result').style.display = 'none';

    const payload = buildPayload();

    // Client-side pre-validation
    const errors = validateForm(payload);
    if (errors.length) {
        showValidationErrors(errors);
        return;
    }

    // Disable UI
    const submitBtn = document.getElementById('submit-btn');
    const btnText = document.getElementById('btn-text');
    const spinner = document.getElementById('spinner');
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    spinner.style.display = 'block';
    startProgress();
    setStatus('Sending request to server…');

    try {
        setStatus('Generating proposal content…');
        const res = await fetch('/api/generate-proposal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        setStatus('Rendering PDF — this may take 10–30 seconds…');
        const data = await res.json();

        if (res.ok && data.status === 'success') {
            finishProgress(true);
            setStatus('');
            showSuccess(data);
        } else {
            finishProgress(false);
            setStatus('');
            showError(
                data.message || 'Server returned an error.',
                data.detail || (data.errors ? data.errors.join('\n') : null)
            );
        }
    } catch (err) {
        finishProgress(false);
        setStatus('');
        showError('Network error — could not reach the server.', err.message);
    } finally {
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        spinner.style.display = 'none';
    }
});
