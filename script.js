const CSV_PATH = 'data/portfolio.csv';
const portfolioGrid = document.getElementById('portfolio-grid');
const feedback = document.getElementById('portfolio-feedback');
const portfolioCount = document.getElementById('portfolio-count');
const fileInput = document.getElementById('csv-upload');

if (feedback) {
  feedback.hidden = true;
}

function setFeedback(message = '', tone = 'info') {
  if (!feedback) {
    return;
  }

  if (!message) {
    feedback.textContent = '';
    feedback.hidden = true;
    delete feedback.dataset.tone;
    return;
  }

  feedback.textContent = message;
  feedback.dataset.tone = tone;
  feedback.hidden = false;
}

function normaliseStatus(status) {
  if (!status) return 'Unknown';
  const value = status.toString().trim().toLowerCase();
  if (value === 'invested') return 'Invested';
  if (value === 'exited') return 'Exited';
  if (['rip', 'inactive', 'closed'].includes(value)) return 'RIP';
  return status;
}

function statusClass(status) {
  switch (status) {
    case 'Invested':
      return 'status-badge status-invested';
    case 'Exited':
      return 'status-badge status-exited';
    case 'RIP':
      return 'status-badge status-rip';
    default:
      return 'status-badge status-rip';
  }
}

function createCard(entry) {
  const card = document.createElement('article');
  card.className = 'portfolio-card';

  const header = document.createElement('div');
  header.className = 'portfolio-card-header';

  const meta = document.createElement('div');
  const name = document.createElement('h3');
  name.textContent = entry.name || 'Untitled company';
  const industry = document.createElement('p');
  industry.className = 'industry';
  industry.textContent = entry.industry || '—';

  meta.appendChild(name);
  meta.appendChild(industry);

  const badge = document.createElement('span');
  badge.className = statusClass(entry.status);
  badge.textContent = entry.status;

  header.appendChild(meta);
  header.appendChild(badge);

  const footer = document.createElement('div');
  footer.className = 'portfolio-card-footer';

  if (entry.url) {
    const link = document.createElement('a');
    link.href = entry.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Visit Website';
    footer.appendChild(link);
  } else {
    footer.appendChild(document.createElement('span'));
  }

  const yearWrapper = document.createElement('div');
  yearWrapper.className = 'year';
  const yearLabel = document.createElement('span');
  yearLabel.textContent = entry.year || '—';
  const yearCaption = document.createElement('span');
  yearCaption.textContent = 'Year';
  yearCaption.className = 'year-caption';

  yearWrapper.appendChild(yearLabel);
  yearWrapper.appendChild(yearCaption);

  footer.appendChild(yearWrapper);

  card.appendChild(header);
  card.appendChild(footer);

  return card;
}

function renderPortfolio(entries, { showPlaceholder = true } = {}) {
  portfolioGrid.replaceChildren();
  portfolioCount.textContent = entries.length ? String(entries.length) : '0';

  if (!entries.length && showPlaceholder) {
    const placeholder = document.createElement('p');
    placeholder.className = 'portfolio-empty';
    placeholder.textContent = 'No portfolio entries yet.';
    portfolioGrid.appendChild(placeholder);
    return;
  }

  const fragment = document.createDocumentFragment();
  entries.forEach((entry) => {
    fragment.appendChild(createCard(entry));
  });

  portfolioGrid.appendChild(fragment);
}

function parseCSV(text) {
  const rows = [];
  let current = [];
  let value = '';
  let insideQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    const next = text[i + 1];

    if (insideQuotes) {
      if (char === '"' && next === '"') {
        value += '"';
        i += 2;
        continue;
      }
      if (char === '"') {
        insideQuotes = false;
        i += 1;
        continue;
      }
      value += char;
      i += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = true;
      i += 1;
      continue;
    }

    if (char === ',') {
      current.push(value.trim());
      value = '';
      i += 1;
      continue;
    }

    if (char === '\n') {
      current.push(value.trim());
      rows.push(current);
      current = [];
      value = '';
      i += 1;
      if (next === '\r') {
        i += 1;
      }
      continue;
    }

    if (char === '\r') {
      current.push(value.trim());
      rows.push(current);
      current = [];
      value = '';
      i += next === '\n' ? 2 : 1;
      continue;
    }

    value += char;
    i += 1;
  }

  if (value.length > 0 || current.length > 0) {
    current.push(value.trim());
    rows.push(current);
  }

  return rows.filter((row) => row.some((cell) => cell !== ''));
}

function mapRowsToEntries(rows) {
  if (!rows.length) return [];
  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map((value) => value.toLowerCase());

  const nameIndex = headers.indexOf('name');
  const industryIndex = headers.indexOf('industry');
  const statusIndex = headers.indexOf('status');
  const urlIndex = headers.indexOf('url');
  const yearIndex = headers.indexOf('year');

  return dataRows
    .map((row) => {
      const entry = {
        name: nameIndex > -1 ? row[nameIndex] : '',
        industry: industryIndex > -1 ? row[industryIndex] : '',
        status: normaliseStatus(statusIndex > -1 ? row[statusIndex] : ''),
        url: urlIndex > -1 ? row[urlIndex] : '',
        year: yearIndex > -1 ? row[yearIndex] : ''
      };

      if (entry.url && !/^https?:\/\//i.test(entry.url)) {
        entry.url = `https://${entry.url}`;
      }

      return entry;
    })
    .filter((entry) => entry.name);
}

async function loadDefaultPortfolio() {
  try {
    const response = await fetch(CSV_PATH, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV (status ${response.status})`);
    }
    const text = await response.text();
    const rows = parseCSV(text);
    const entries = mapRowsToEntries(rows);

    renderPortfolio(entries);

    if (!entries.length) {
      setFeedback('The default CSV is empty. Upload a file to populate the portfolio.', 'warning');
      return;
    }

    setFeedback('');
  } catch (error) {
    console.error(error);
    renderPortfolio([], { showPlaceholder: false });
    portfolioCount.textContent = '–';
    setFeedback('Unable to load the default CSV. Upload a file to get started.', 'error');
  }
}

function handleFileUpload(event) {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = (loadEvent) => {
    try {
      const text = loadEvent.target?.result;
      if (typeof text !== 'string') {
        throw new Error('Unsupported file format.');
      }
      const rows = parseCSV(text);
      const entries = mapRowsToEntries(rows);
      renderPortfolio(entries);

      if (!entries.length) {
        setFeedback('CSV parsed but no valid rows were found.', 'warning');
        return;
      }

      setFeedback(`Previewing ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} from ${file.name}.`, 'success');
    } catch (parseError) {
      console.error(parseError);
      setFeedback('Unable to parse that CSV file. Please check the format.', 'error');
    }
  };

  reader.onerror = () => {
    setFeedback('Could not read the selected file. Try again.', 'error');
  };

  reader.readAsText(file);
}

if (fileInput) {
  fileInput.addEventListener('change', handleFileUpload);
}

window.addEventListener('DOMContentLoaded', () => {
  renderPortfolio([], { showPlaceholder: false });
  loadDefaultPortfolio();
});
