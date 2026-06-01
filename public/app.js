let settings = {};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 4500);
}

function showView(name) {
  $$('[data-view]').forEach((view) => view.classList.toggle('hidden', view.dataset.view !== name));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function callLink(phone) {
  return `tel:${phone}`;
}

function smsLink(phone, body = '') {
  return `sms:${phone}${body ? `?&body=${encodeURIComponent(body)}` : ''}`;
}

function createActionLink(item) {
  const a = document.createElement('a');
  a.className = 'action-link';
  a.href = item.phone ? callLink(item.phone) : item.url;
  a.target = item.url ? '_blank' : '_self';
  a.rel = item.url ? 'noopener' : '';
  a.innerHTML = `<strong>${item.name}</strong><span>${item.description || formatPhone(item.phone) || ''}</span>`;
  return a;
}

function createResourceCard(item, buttonText = 'Open') {
  const a = document.createElement('a');
  a.className = 'resource-card';
  a.href = item.url || (item.phone ? callLink(item.phone) : '#');
  a.target = item.url ? '_blank' : '_self';
  a.rel = item.url ? 'noopener' : '';
  a.innerHTML = `<strong>${item.name}</strong><span>${item.description || item.role || ''}</span><br><span>${buttonText}</span>`;
  return a;
}

function formatPhone(phone) {
  if (!phone) return '';
  if (phone === '911') return '911';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    return `(${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  return phone;
}

function render() {
  const crisisButtons = $('#crisisButtons');
  crisisButtons.innerHTML = '';
  settings.crisis.forEach((item) => crisisButtons.appendChild(createActionLink(item)));

  const meetingLinks = $('#meetingLinks');
  meetingLinks.innerHTML = '';
  settings.meetings.forEach((item) => meetingLinks.appendChild(createResourceCard(item, 'Open meeting finder')));
  $('#meetingFrame').src = settings.meetingEmbedUrl || 'about:blank';

  const readingLinks = $('#readingLinks');
  readingLinks.innerHTML = '';
  settings.readings.forEach((item, index) => {
    const button = document.createElement('button');
    button.className = 'read-button';
    button.innerHTML = `<strong>${item.name}</strong><span>${item.description}</span>`;
    button.addEventListener('click', () => {
      $('#readingFrame').src = item.url;
      showToast(`Opening ${item.name}`);
    });
    readingLinks.appendChild(button);
    if (index === 0) $('#readingFrame').src = item.url;
  });

  const literatureLinks = $('#literatureLinks');
  literatureLinks.innerHTML = '';
  settings.literature.forEach((item) => literatureLinks.appendChild(createResourceCard(item, 'Open resource')));

  const contactLinks = $('#contactLinks');
  contactLinks.innerHTML = '';
  settings.contacts.forEach((item) => {
    const wrap = document.createElement('div');
    wrap.className = 'resource-card';
    const phoneText = item.phone ? formatPhone(item.phone) : 'Add phone number in data/settings.json';
    wrap.innerHTML = `<strong>${item.name}</strong><span>${item.role || ''}</span><br><span>${phoneText}</span>`;
    if (item.phone) {
      const calls = document.createElement('div');
      calls.style.marginTop = '12px';
      calls.innerHTML = `<a class="primary mini" href="${callLink(item.phone)}">Call</a> <a class="primary mini" href="${smsLink(item.phone, 'I need support from Crossroads leadership.')}">Text</a>`;
      wrap.appendChild(calls);
    }
    contactLinks.appendChild(wrap);
  });
}

async function submitForm(form, endpoint, type) {
  const data = new FormData(form);
  data.append('type', type);
  data.append('submittedAt', new Date().toISOString());

  if (!endpoint || endpoint.includes('REPLACE_WITH_YOUR_FORM_ID')) {
    const subject = encodeURIComponent(`Crossroads ${type} submission`);
    const body = encodeURIComponent([...data.entries()].map(([k, v]) => `${k}: ${v}`).join('\n'));
    window.location.href = `mailto:${settings.forms.fallbackEmail}?subject=${subject}&body=${body}`;
    showToast('Opening email because the form endpoint has not been set yet.');
    return;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    body: data,
    headers: { Accept: 'application/json' }
  });

  if (!response.ok) throw new Error('Form submission failed');
  form.reset();
  showToast('Submitted. Leadership has received it.');
}

function bindEvents() {
  $$('[data-go]').forEach((el) => el.addEventListener('click', () => showView(el.dataset.go)));
  $('#homeButton').addEventListener('click', () => showView('home'));
  $('#menuButton').addEventListener('click', () => showView('home'));

  $('#concernForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try { await submitForm(event.target, settings.forms.concernEndpoint, 'anonymous concern'); }
    catch { showToast('Something went wrong. Please call or text leadership.'); }
  });

  $('#relapseForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try { await submitForm(event.target, settings.forms.relapseEndpoint, 'relapse help request'); }
    catch { showToast('Something went wrong. Please call ACCESS, FAN, or leadership.'); }
  });
}

async function init() {
  const response = await fetch('/data/settings.json');
  settings = await response.json();
  render();
  bindEvents();
  showView('home');
}

init();


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
