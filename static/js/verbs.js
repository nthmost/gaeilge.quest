/* gaeilge.quest — Verb conjugation page */

const data = window.__VERBS__;
const meta = data.meta;
const verbs = data.verbs;

let activeVerbId = verbs[0]?.id || null;
let activeMode = 'verb'; // 'verb' or 'tense'
let activeTenses = new Set(meta.tenses.filter(t => t.default).map(t => t.id));
let showAnalytic = false;

// ── Sidebar ────────────────────────────────────────────────────────────────

function renderSidebar() {
  const container = document.getElementById('verb-groups');
  const groups = meta.groups;

  container.innerHTML = groups.map(group => {
    const groupVerbs = verbs.filter(v => v.group === group.id);
    if (!groupVerbs.length) return '';
    return `
      <div class="verb-group-label">${group.label}</div>
      ${groupVerbs.map(v => `
        <button class="verb-btn ${v.id === activeVerbId ? 'active' : ''}"
                data-verb="${v.id}">
          <span>${v.irish}</span>
          <span class="verb-english">${v.english}</span>
        </button>
      `).join('')}
    `;
  }).join('');

  container.querySelectorAll('.verb-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeVerbId = btn.dataset.verb;
      container.querySelectorAll('.verb-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (activeMode === 'tense') {
        // In by-tense mode, selecting a verb switches to by-verb mode
        setMode('verb');
      } else {
        renderTable();
      }
    });
  });
}

// ── Controls ───────────────────────────────────────────────────────────────

function renderTenseToggles() {
  const bar = document.getElementById('tense-toggles');
  bar.innerHTML = meta.tenses.map(t => `
    <button class="tense-btn ${t.default ? '' : 'optional'} ${activeTenses.has(t.id) ? 'active' : ''}"
            data-tense="${t.id}" title="${t.irish}">
      ${t.english}
    </button>
  `).join('');

  bar.querySelectorAll('.tense-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tid = btn.dataset.tense;
      if (activeTenses.has(tid)) {
        if (activeTenses.size > 1) {
          activeTenses.delete(tid);
          btn.classList.remove('active');
        }
      } else {
        activeTenses.add(tid);
        btn.classList.add('active');
      }
      renderTable();
    });
  });
}

function setMode(mode) {
  activeMode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === mode);
  });
  renderTable();
}

// ── Table rendering ────────────────────────────────────────────────────────

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function teanglannUrl(word) {
  const clean = word.replace(/[^a-záéíóúÁÉÍÓÚ]/gi, '');
  return clean.length > 1
    ? `https://www.teanglann.ie/en/fgb/${encodeURIComponent(clean)}`
    : null;
}

function renderFormCell(cell) {
  if (!cell) return '<span class="form-primary empty">—</span>';

  const words = cell.f ? cell.f.split(/\s+/) : [];
  const primaryHtml = cell.f
    ? words.map(w => {
        const url = teanglannUrl(w);
        return url
          ? `<a href="${url}" target="_blank" rel="noopener" class="form-primary">${escHtml(w)}</a>`
          : escHtml(w);
      }).join(' ')
    : '<span class="form-primary empty">—</span>';

  let out = `<span class="form-spoken">${primaryHtml}</span>`;

  if (cell.m) {
    out += `<span class="form-munster">${escHtml(cell.m)}</span>`;
  }

  if (showAnalytic && cell.s) {
    out += `<span class="form-analytic">${escHtml(cell.s)}</span>`;
  }

  return out;
}

function renderByVerb() {
  const verb = verbs.find(v => v.id === activeVerbId);
  if (!verb) return '<p>Select a verb.</p>';

  const visibleTenses = meta.tenses.filter(t => activeTenses.has(t.id));

  const headerCols = visibleTenses.map(t =>
    `<th class="tense-col">${escHtml(t.english)}<br><small style="font-weight:normal;opacity:.7">${escHtml(t.irish)}</small></th>`
  ).join('');

  const rows = meta.persons.map(p => {
    const cells = visibleTenses.map(t => {
      const cell = verb.forms?.[t.id]?.[p.id];
      return `<td>${renderFormCell(cell)}</td>`;
    }).join('');

    return `
      <tr>
        <td class="person-cell">
          <span class="pronoun">${escHtml(p.pronoun)}</span><br>
          <small>${escHtml(p.english)}</small>
        </td>
        ${cells}
      </tr>
    `;
  }).join('');

  const metaItems = [];
  if (verb.verbal_noun) metaItems.push(`<span class="verb-meta-item"><strong>VN:</strong> ${escHtml(verb.verbal_noun)}</span>`);
  if (verb.verbal_adjective) metaItems.push(`<span class="verb-meta-item"><strong>VA:</strong> ${escHtml(verb.verbal_adjective)}</span>`);
  const groupLabel = meta.groups.find(g => g.id === verb.group)?.label || verb.group;
  metaItems.push(`<span class="verb-meta-item"><strong>Group:</strong> ${escHtml(groupLabel)}</span>`);

  return `
    <div class="verb-header">
      <div class="verb-title">
        ${escHtml(verb.irish)}
        <span class="verb-title-english">— ${escHtml(verb.english)}</span>
      </div>
      <div class="verb-meta">${metaItems.join('')}</div>
      ${verb.notes ? `<div class="verb-notes">${escHtml(verb.notes)}</div>` : ''}
    </div>
    <div class="conj-table-wrap">
      <table class="conj-table">
        <thead>
          <tr>
            <th class="person-col">Person</th>
            ${headerCols}
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderByTense() {
  const visibleTenses = meta.tenses.filter(t => activeTenses.has(t.id));

  return visibleTenses.map(t => {
    const headerCols = meta.persons.map(p =>
      `<th class="tense-col">${escHtml(p.pronoun)}<br><small style="font-weight:normal;opacity:.7">${escHtml(p.english)}</small></th>`
    ).join('');

    const rows = verbs.map(v => {
      const cells = meta.persons.map(p => {
        const cell = v.forms?.[t.id]?.[p.id];
        return `<td>${renderFormCell(cell)}</td>`;
      }).join('');

      return `
        <tr>
          <td class="verb-label-cell">
            <span>${escHtml(v.irish)}</span>
            <span class="verb-english-label">${escHtml(v.english)}</span>
          </td>
          ${cells}
        </tr>
      `;
    }).join('');

    return `
      <div class="tense-section">
        <div class="tense-section-title">
          ${escHtml(t.english)}
          <span class="tense-section-irish">${escHtml(t.irish)}</span>
        </div>
        <div class="conj-table-wrap">
          <table class="conj-table">
            <thead>
              <tr>
                <th class="person-col">Verb</th>
                ${headerCols}
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  }).join('');
}

function renderTable() {
  const container = document.getElementById('verb-table-container');
  container.innerHTML = activeMode === 'verb' ? renderByVerb() : renderByTense();
}

// ── Init ───────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  renderSidebar();
  renderTenseToggles();
  renderTable();

  document.getElementById('mode-by-verb').addEventListener('click', () => setMode('verb'));
  document.getElementById('mode-by-tense').addEventListener('click', () => setMode('tense'));

  document.getElementById('show-analytic').addEventListener('change', e => {
    showAnalytic = e.target.checked;
    renderTable();
  });
});
