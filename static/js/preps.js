/* gaeilge.quest — Prepositional pronouns page */

const data = window.__PREPS__;
const meta = data.meta;
const preps = data.prepositions;

let activeMode = 'prep';
let activePrepId = preps[0]?.id || null;
let activePersonId = meta.persons[0]?.id || null;
let showUsage = true;

// ── Helpers ────────────────────────────────────────────────────────────────

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function teanglannLink(word) {
  const clean = word.replace(/[^a-záéíóúÁÉÍÓÚ]/gi, '');
  return clean.length > 1
    ? `<a href="https://www.teanglann.ie/en/fgb/${encodeURIComponent(clean)}" target="_blank" rel="noopener" class="form-primary">${esc(word)}</a>`
    : esc(word);
}

function linkedForm(str) {
  if (!str) return '<span class="form-primary empty">—</span>';
  return str.split(/\s+/).map(teanglannLink).join(' ');
}

function usageBlock(prep) {
  if (!showUsage || !prep.usage?.length) return '';
  const rows = prep.usage.map(u => `
    <tr class="usage-row">
      <td class="usage-irish">${esc(u.irish)}</td>
      <td class="usage-english">${esc(u.english)}</td>
    </tr>
  `).join('');
  return `
    <table class="usage-table">
      <tbody>${rows}</tbody>
    </table>
  `;
}

// ── Sidebar ────────────────────────────────────────────────────────────────

function renderSidebar() {
  const container = document.getElementById('prep-groups');
  container.innerHTML = meta.groups.map(g => {
    const groupPreps = preps.filter(p => p.group === g.id);
    if (!groupPreps.length) return '';
    return `
      <div class="verb-group-label">${esc(g.label)}</div>
      ${groupPreps.map(p => `
        <button class="verb-btn ${p.id === activePrepId ? 'active' : ''}" data-prep="${p.id}">
          <span>${esc(p.irish)}</span>
          <span class="verb-english">${esc(p.english.split(';')[0])}</span>
        </button>
      `).join('')}
    `;
  }).join('');

  container.querySelectorAll('.verb-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activePrepId = btn.dataset.prep;
      container.querySelectorAll('.verb-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (activeMode !== 'prep') setMode('prep');
      else renderTable();
    });
  });
}

// ── Controls ───────────────────────────────────────────────────────────────

function renderPersonPicker() {
  const picker = document.getElementById('person-picker');
  picker.innerHTML = meta.persons.map(p => `
    <button class="tense-btn ${p.id === activePersonId ? 'active' : ''}" data-person="${p.id}">
      ${esc(p.pronoun)}
    </button>
  `).join('');

  picker.querySelectorAll('.tense-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activePersonId = btn.dataset.person;
      picker.querySelectorAll('.tense-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTable();
    });
  });
}

function setMode(mode) {
  activeMode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === mode);
  });
  const personGroup = document.getElementById('person-picker-group');
  personGroup.style.display = mode === 'person' ? '' : 'none';
  renderTable();
}

// ── Table rendering ────────────────────────────────────────────────────────

function renderByPrep() {
  const prep = preps.find(p => p.id === activePrepId);
  if (!prep) return '<p>Select a preposition.</p>';

  const rows = meta.persons.map(person => {
    const cell = prep.forms[person.id];
    const formHtml = cell ? linkedForm(cell.f) : '<span class="form-primary empty">—</span>';
    return `
      <tr>
        <td class="person-cell">
          <span class="pronoun">${esc(person.pronoun)}</span><br>
          <small>${esc(person.english)}</small>
        </td>
        <td class="prep-form-cell">${formHtml}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="verb-header">
      <div class="verb-title">
        ${esc(prep.irish)}
        <span class="verb-title-english">— ${esc(prep.english)}</span>
      </div>
      ${prep.notes ? `<div class="verb-notes">${esc(prep.notes)}</div>` : ''}
    </div>
    <div class="conj-table-wrap" style="margin-bottom:1.5rem">
      <table class="conj-table">
        <thead>
          <tr>
            <th class="person-col">Person</th>
            <th>Prepositional pronoun</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    ${showUsage && prep.usage?.length ? `
      <div class="usage-section-title">Usage examples</div>
      ${usageBlock(prep)}
    ` : ''}
  `;
}

function renderByPerson() {
  const person = meta.persons.find(p => p.id === activePersonId);
  if (!person) return '';

  const rows = preps.map(prep => {
    const cell = prep.forms[person.id];
    const formHtml = cell ? linkedForm(cell.f) : '<span class="form-primary empty">—</span>';
    return `
      <tr>
        <td class="verb-label-cell">
          <span>${esc(prep.irish)}</span>
          <span class="verb-english-label">${esc(prep.english.split(';')[0])}</span>
        </td>
        <td class="prep-form-cell">${formHtml}</td>
        ${showUsage && prep.usage?.length ? `
          <td class="usage-inline-cell">
            <span class="usage-first-irish">${esc(prep.usage[0].irish)}</span>
            <span class="usage-first-english">${esc(prep.usage[0].english)}</span>
          </td>
        ` : ''}
      </tr>
    `;
  }).join('');

  const usageCols = showUsage ? '<th>Example</th>' : '';
  return `
    <div class="verb-header">
      <div class="verb-title">
        ${esc(person.pronoun)}
        <span class="verb-title-english">— ${esc(person.english)}</span>
      </div>
    </div>
    <div class="conj-table-wrap">
      <table class="conj-table">
        <thead>
          <tr>
            <th class="person-col">Preposition</th>
            <th>Form</th>
            ${usageCols}
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderMatrix() {
  const headerCols = meta.persons.map(p =>
    `<th class="tense-col">${esc(p.pronoun)}<br><small style="font-weight:normal;opacity:.7">${esc(p.english)}</small></th>`
  ).join('');

  const rows = preps.map(prep => {
    const cells = meta.persons.map(person => {
      const cell = prep.forms[person.id];
      return `<td class="prep-form-cell">${cell ? linkedForm(cell.f) : '<span class="form-primary empty">—</span>'}</td>`;
    }).join('');
    return `
      <tr>
        <td class="verb-label-cell">
          <span>${esc(prep.irish)}</span>
          <span class="verb-english-label">${esc(prep.english.split(';')[0])}</span>
        </td>
        ${cells}
      </tr>
    `;
  }).join('');

  return `
    <div class="verb-header">
      <div class="verb-title">All prepositional pronouns</div>
    </div>
    <div class="conj-table-wrap">
      <table class="conj-table matrix-table">
        <thead>
          <tr>
            <th class="person-col">Preposition</th>
            ${headerCols}
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderTable() {
  const container = document.getElementById('prep-table-container');
  if (activeMode === 'prep') container.innerHTML = renderByPrep();
  else if (activeMode === 'person') container.innerHTML = renderByPerson();
  else container.innerHTML = renderMatrix();
}

// ── Init ───────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  renderSidebar();
  renderPersonPicker();
  renderTable();

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode));
  });

  document.getElementById('show-usage').addEventListener('change', e => {
    showUsage = e.target.checked;
    renderTable();
  });
});
