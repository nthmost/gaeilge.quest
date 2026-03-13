/* gaeilge.quest — main app JS */

let constructions = [];
let activeCategory = 'all';
let activeDialect = 'all';
let activeDifficulty = 'all';

// Load constructions — use server-injected data if available, else fetch
async function loadConstructions() {
  if (window.__CONSTRUCTIONS__) {
    constructions = window.__CONSTRUCTIONS__;
  } else {
    const resp = await fetch('/data/constructions.json');
    constructions = await resp.json();
  }

  // Pre-filter from URL param e.g. /?cat=verbs
  const params = new URLSearchParams(window.location.search);
  if (params.get('cat')) activeCategory = params.get('cat');

  renderCategories();
  renderDifficultyFilter();
  renderDialectFilter();
  applyFilters();
}

function renderCategories() {
  const cats = ['all', ...new Set(constructions.map(c => c.category))];
  const ul = document.getElementById('category-list');
  ul.innerHTML = cats.map(cat => `
    <li><a href="#" class="cat-link ${cat === activeCategory ? 'active' : ''}" data-cat="${cat}">
      ${cat === 'all' ? 'All topics' : capitalise(cat)}
    </a></li>
  `).join('');

  ul.querySelectorAll('.cat-link').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      activeCategory = a.dataset.cat;
      ul.querySelectorAll('.cat-link').forEach(x => x.classList.remove('active'));
      a.classList.add('active');
      applyFilters();
    });
  });
}

function renderDifficultyFilter() {
  const levels = ['all', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const labels = { all: 'All levels', A1: 'A1', A2: 'A2', B1: 'B1', B2: 'B2', C1: 'C1', C2: 'C2' };
  const ul = document.getElementById('difficulty-list');
  ul.innerHTML = levels.map(d => `
    <li><a href="#" class="cat-link ${d === activeDifficulty ? 'active' : ''}" data-diff="${d}">
      ${labels[d]}
    </a></li>
  `).join('');

  ul.querySelectorAll('.cat-link').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      activeDifficulty = a.dataset.diff;
      ul.querySelectorAll('.cat-link').forEach(x => x.classList.remove('active'));
      a.classList.add('active');
      applyFilters();
    });
  });
}

function renderDialectFilter() {
  const bar = document.getElementById('dialect-filter');
  if (!bar) return;
  const dialects = ['all', 'munster', 'connacht', 'ulster'];
  const labels = { all: 'All dialects', munster: 'Munster', connacht: 'Connacht', ulster: 'Ulster' };
  bar.innerHTML = dialects.map(d => `
    <button class="dialect-btn ${d === activeDialect ? 'active' : ''}" data-dialect="${d}">
      ${labels[d]}
    </button>
  `).join('');

  bar.querySelectorAll('.dialect-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeDialect = btn.dataset.dialect;
      bar.querySelectorAll('.dialect-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
  });
}

function renderConstructions(items) {
  const container = document.getElementById('constructions-container');
  if (!items.length) {
    container.innerHTML = '<div class="no-results">No constructions found.</div>';
    return;
  }
  container.innerHTML = items.map(c => constructionCard(c)).join('');

  container.querySelectorAll('.construction-card').forEach(card => {
    card.querySelector('.card-header').addEventListener('click', () => {
      card.querySelector('.card-body').classList.toggle('open');
    });
  });

  container.addEventListener('click', handleWordClick);
}

// Click on Irish text cell — open teanglann.ie for the clicked word
function handleWordClick(e) {
  const td = e.target.closest('td.irish-cell');
  if (!td) return;

  const selection = window.getSelection();
  let word = '';
  if (selection && selection.toString().trim()) {
    word = selection.toString().trim();
  } else {
    const range = document.caretRangeFromPoint
      ? document.caretRangeFromPoint(e.clientX, e.clientY)
      : null;
    if (range) {
      range.expand('word');
      word = range.toString().trim();
    }
  }
  word = word.replace(/[^a-záéíóúÁÉÍÓÚ]/gi, '');
  if (word.length > 1) {
    window.open(`https://www.teanglann.ie/en/fgb/${encodeURIComponent(word)}`, '_blank', 'noopener');
  }
}

const DIALECT_LABELS = {
  munster:  { label: 'Munster',  cls: 'dialect-munster' },
  connacht: { label: 'Connacht', cls: 'dialect-connacht' },
  ulster:   { label: 'Ulster',   cls: 'dialect-ulster' },
  standard: { label: 'Standard', cls: 'dialect-standard' },
};

const DIFFICULTY_LABELS = {
  'A1': { label: 'A1', cls: 'diff-A1' },
  'A2': { label: 'A2', cls: 'diff-A2' },
  'B1': { label: 'B1', cls: 'diff-B1' },
  'B2': { label: 'B2', cls: 'diff-B2' },
  'C1': { label: 'C1', cls: 'diff-C1' },
  'C2': { label: 'C2', cls: 'diff-C2' },
};

function constructionCard(c) {
  const examples = (c.examples || []).filter(ex => {
    if (activeDialect === 'all') return true;
    const d = (ex.dialect || 'standard').toLowerCase();
    return d === activeDialect || d === 'standard';
  });

  const examplesHtml = examples.map(ex => {
    const d = (ex.dialect || 'standard').toLowerCase();
    const dialectInfo = DIALECT_LABELS[d] || DIALECT_LABELS.standard;
    const showBadge = d !== 'standard';
    const noteHtml = ex.note ? `<span class="ex-note">${escHtml(ex.note)}</span>` : '';
    const dialectBadge = showBadge
      ? `<span class="dialect-badge ${dialectInfo.cls}">${dialectInfo.label}</span>`
      : '';
    return `
      <tr>
        <td class="irish-cell" title="Click a word to look it up on teanglann.ie">${escHtml(ex.irish)}${dialectBadge}</td>
        <td>${escHtml(ex.english)}${noteHtml}</td>
      </tr>
    `;
  }).join('');

  const diffInfo = DIFFICULTY_LABELS[c.difficulty] || null;
  const diffBadge = diffInfo
    ? `<span class="diff-badge ${diffInfo.cls}">${diffInfo.label}</span>`
    : '';

  const seeAlsoHtml = (c.see_also && c.see_also.length)
    ? `<div class="see-also">
        <span class="see-also-label">See also:</span>
        ${c.see_also.map(id => `<a href="#card-${id}" class="see-also-link" onclick="openCard('${id}')">${escHtml(titleForId(id))}</a>`).join('')}
       </div>`
    : '';

  return `
    <div class="construction-card" id="card-${c.id}">
      <div class="card-header">
        <div class="card-title-row">
          <span class="card-title">${escHtml(c.title)}</span>
          ${diffBadge}
        </div>
        <span class="card-category">${escHtml(c.category)}</span>
      </div>
      <div class="card-summary">${escHtml(c.summary)}</div>
      <div class="card-tags">${(c.tags || []).map(t => `<span class="tag">${escHtml(t)}</span>`).join('')}</div>
      <div class="card-body">
        <h4>Overview</h4>
        <div class="card-content-text">${escHtml(c.content)}</div>
        ${examplesHtml ? `
          <h4>Examples <span class="examples-hint">— click a word to look it up</span></h4>
          <table class="examples-table"><tbody>${examplesHtml}</tbody></table>
        ` : ''}
        ${c.notes ? `
          <h4>Notes</h4>
          <div class="notes-box">${escHtml(c.notes)}</div>
        ` : ''}
        ${seeAlsoHtml}
      </div>
    </div>
  `;
}

function openCard(id) {
  const card = document.getElementById('card-' + id);
  if (!card) return;
  const body = card.querySelector('.card-body');
  if (body && !body.classList.contains('open')) body.classList.add('open');
  setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
}

function titleForId(id) {
  const c = constructions.find(x => x.id === id);
  return c ? c.title : id;
}

function applyFilters() {
  const query = document.getElementById('search-input').value.toLowerCase().trim();
  let filtered = constructions;

  if (activeCategory !== 'all') {
    filtered = filtered.filter(c => c.category === activeCategory);
  }

  if (activeDifficulty !== 'all') {
    filtered = filtered.filter(c => (c.difficulty || '') === activeDifficulty);
  }

  if (query) {
    filtered = filtered.filter(c =>
      c.title.toLowerCase().includes(query) ||
      c.summary.toLowerCase().includes(query) ||
      c.content.toLowerCase().includes(query) ||
      (c.tags || []).some(t => t.toLowerCase().includes(query)) ||
      (c.examples || []).some(e =>
        e.irish.toLowerCase().includes(query) ||
        e.english.toLowerCase().includes(query)
      )
    );
  }

  renderConstructions(filtered);
}

// ── Ask Claude ─────────────────────────────────────────────────────────────

async function askClaude(question) {
  const panel = document.getElementById('answer-panel');
  const content = document.getElementById('answer-panel-content');
  const btn = document.getElementById('ask-btn-hero');

  btn.disabled = true;
  btn.textContent = 'Asking…';
  content.textContent = '';
  panel.classList.add('visible');
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });

  try {
    const resp = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || `Server error ${resp.status}`);
    }

    const data = await resp.json();
    content.textContent = data.answer;
  } catch (err) {
    content.textContent = `Couldn't get an answer: ${err.message}`;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Ask Claude';
  }
}

// ── Init ───────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  loadConstructions();

  const searchInput = document.getElementById('search-input');
  let searchTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(applyFilters, 200);
  });

  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = searchInput.value.trim();
      if (q) askClaude(q);
    }
  });

  document.getElementById('ask-btn-hero').addEventListener('click', () => {
    const q = searchInput.value.trim();
    if (q) askClaude(q);
  });

  document.getElementById('answer-panel-close').addEventListener('click', () => {
    document.getElementById('answer-panel').classList.remove('visible');
  });
});

// ── Utilities ──────────────────────────────────────────────────────────────

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
