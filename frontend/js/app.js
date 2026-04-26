/* ═══════════════════ LifeLink app.js ═══════════════════ */
const API = 'http://localhost:5000/api';

/* ── State → City ── */
const STATE_CITIES = {
  "Andhra Pradesh":    ["Visakhapatnam","Vijayawada","Guntur","Nellore","Kurnool"],
  "Assam":             ["Guwahati","Silchar","Dibrugarh","Jorhat"],
  "Bihar":             ["Patna","Gaya","Bhagalpur","Muzaffarpur","Darbhanga"],
  "Chhattisgarh":      ["Raipur","Bhilai","Bilaspur","Korba"],
  "Goa":               ["Panaji","Margao","Vasco da Gama"],
  "Gujarat":           ["Ahmedabad","Surat","Vadodara","Rajkot","Gandhinagar"],
  "Haryana":           ["Gurugram","Faridabad","Panipat","Ambala","Hisar"],
  "Himachal Pradesh":  ["Shimla","Dharamsala","Solan","Mandi"],
  "Jharkhand":         ["Ranchi","Jamshedpur","Dhanbad","Bokaro"],
  "Karnataka":         ["Bengaluru","Mysuru","Hubballi","Mangaluru","Belagavi"],
  "Kerala":            ["Kochi","Thiruvananthapuram","Kozhikode","Thrissur","Kollam"],
  "Madhya Pradesh":    ["Bhopal","Indore","Gwalior","Jabalpur","Ujjain"],
  "Maharashtra":       ["Mumbai","Pune","Nagpur","Nashik","Aurangabad","Thane"],
  "Odisha":            ["Bhubaneswar","Cuttack","Rourkela","Berhampur"],
  "Punjab":            ["Ludhiana","Amritsar","Jalandhar","Patiala","Chandigarh"],
  "Rajasthan":         ["Jaipur","Jodhpur","Udaipur","Kota","Ajmer"],
  "Tamil Nadu":        ["Chennai","Coimbatore","Madurai","Salem","Tiruchirappalli"],
  "Telangana":         ["Hyderabad","Warangal","Nizamabad","Karimnagar"],
  "Uttar Pradesh":     ["Lucknow","Kanpur","Agra","Varanasi","Prayagraj","Noida"],
  "Uttarakhand":       ["Dehradun","Haridwar","Roorkee","Haldwani"],
  "West Bengal":       ["Kolkata","Howrah","Durgapur","Asansol","Siliguri"]
};

/* ── Helpers ── */
const daysSince  = d => Math.floor((Date.now() - new Date(d)) / 86400000);
const isEligible = d => d.gender === 'Female' ? daysSince(d.lastDonationDate) >= 120 : daysSince(d.lastDonationDate) >= 90;
const initials   = n => n.split(' ').slice(0,2).map(x=>x[0]).join('').toUpperCase();
const getToken   = ()  => localStorage.getItem('ll_token');
const getUser    = ()  => { try { return JSON.parse(localStorage.getItem('ll_user')); } catch { return null; } };
const setAuth    = (token, donor) => { localStorage.setItem('ll_token', token); localStorage.setItem('ll_user', JSON.stringify(donor)); };
const clearAuth  = ()  => { localStorage.removeItem('ll_token'); localStorage.removeItem('ll_user'); };

async function apiFetch(path, opts = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res  = await fetch(API + path, { ...opts, headers });
  const data = await res.json();
  return { ok: res.ok, data };
}

/* ── Toast ── */
let _tt;
function showToast(msg, type = 'success') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.innerHTML = '';
  const ico = { success:'✅', error:'❌', info:'ℹ️' }[type] || '📢';
  el.innerHTML = `<span>${ico}</span><span>${msg}</span>`;
  el.className = `toast-${type} show`;
  clearTimeout(_tt);
  _tt = setTimeout(() => el.classList.remove('show'), 3800);
}

/* ── State dropdowns ── */
function populateStates() {
  document.querySelectorAll('.state-sel').forEach(sel => {
    const ph = sel.querySelector('option')?.textContent || 'Select State';
    sel.innerHTML = `<option value="">${ph}</option>`;
    Object.keys(STATE_CITIES).sort().forEach(s => {
      const o = document.createElement('option');
      o.value = s; o.textContent = s; sel.appendChild(o);
    });
    sel.addEventListener('change', function() {
      const cEl = document.getElementById(this.dataset.cityTarget);
      if (!cEl) return;
      const cities = STATE_CITIES[this.value] || [];
      cEl.innerHTML = '<option value="">Select City</option>';
      cities.forEach(c => { const o=document.createElement('option'); o.value=c; o.textContent=c; cEl.appendChild(o); });
      cEl.disabled = !cities.length;
    });
  });
}

/* ── Navbar ── */
function initNav() {
  const nav = document.querySelector('nav');
  if (nav) window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40));
  const ham = document.querySelector('.ham');
  const mob = document.querySelector('.mob-menu');
  if (ham && mob) ham.addEventListener('click', () => mob.classList.toggle('open'));

  // Active link
  document.querySelectorAll('.nav-links a, .mob-menu a').forEach(a => {
    if (location.pathname.endsWith(a.getAttribute('href') || '')) a.classList.add('active');
  });

  // Update nav based on login state
  updateNavAuth();
}

function updateNavAuth() {
  const user = getUser();
  const loginBtn      = document.querySelector('[data-modal="login"]');
  const logoutBtn     = document.querySelector('[data-action="logout"]');
  const registerBtns  = document.querySelectorAll('a[href="register.html"]');
  if (!loginBtn) return;

  if (user) {
    // Show user first name instead of Login
    loginBtn.textContent = user.name.split(' ')[0];
    loginBtn.style.background   = 'var(--green-bg)';
    loginBtn.style.color        = 'var(--green)';
    loginBtn.style.borderColor  = 'var(--green)';
    loginBtn.onclick = () => { window.location.href = user.isAdmin ? 'admin.html' : 'dashboard.html'; };
    if (logoutBtn) logoutBtn.style.display = 'flex';

    // Hide ALL Register buttons / links when logged in
    registerBtns.forEach(el => { el.style.display = 'none'; });

    // Show Admin Panel link for admins
    if (user.isAdmin) {
      const navLinks = document.querySelector('.nav-links');
      const mobMenu  = document.querySelector('.mob-menu');
      if (navLinks && !navLinks.querySelector('.admin-nav-link')) {
        const a = document.createElement('a');
        a.href = 'admin.html'; a.textContent = '⚙️ Admin'; a.className = 'admin-nav-link';
        navLinks.appendChild(a);
      }
      if (mobMenu && !mobMenu.querySelector('.admin-nav-link')) {
        const a = document.createElement('a');
        a.href = 'admin.html'; a.textContent = '⚙️ Admin Panel'; a.className = 'admin-nav-link';
        mobMenu.appendChild(a);
      }
    }
  } else {
    // Not logged in — restore Register button visibility
    registerBtns.forEach(el => { el.style.display = ''; });
  }
}

/* ── Modal (Login / Register tabs) ── */
function initModal() {
  const overlay = document.getElementById('authModal');
  if (!overlay) return;

  document.querySelectorAll('[data-modal="login"]').forEach(btn => {
    btn.addEventListener('click', () => { openModal('login'); });
  });
  document.querySelectorAll('[data-modal="register"]').forEach(btn => {
    btn.addEventListener('click', () => { openModal('register'); });
  });
  document.querySelector('[data-action="logout"]')?.addEventListener('click', () => {
    clearAuth(); showToast('Logged out.', 'info'); updateNavAuth();
    setTimeout(() => { window.location.href = 'index.html'; }, 800);
  });

  overlay.querySelector('.modal-close')?.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // Tabs
  document.querySelectorAll('.modal-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.modal-pane').forEach(p => p.style.display = 'none');
      document.getElementById(tab.dataset.pane).style.display = 'block';
    });
  });

  // Login form
  document.getElementById('loginForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = e.target.querySelector('.btn-submit');
    btn.textContent = 'Logging in...'; btn.disabled = true;
    const { ok, data } = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: e.target.email.value, password: e.target.password.value })
    }).catch(() => ({ ok: false, data: { message: 'Cannot connect to server.' } }));
    if (ok) {
      setAuth(data.token, data.donor);
      showToast(data.message);
      closeModal();
      updateNavAuth();
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 600);
    } else {
      showToast(data.message, 'error');
      btn.textContent = 'Log In'; btn.disabled = false;
    }
  });
}

function openModal(tab = 'login') {
  const overlay = document.getElementById('authModal');
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.querySelectorAll('.modal-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.pane === tab + 'Pane');
  });
  document.querySelectorAll('.modal-pane').forEach(p => {
    p.style.display = p.id === tab + 'Pane' ? 'block' : 'none';
  });
}
function closeModal() {
  document.getElementById('authModal')?.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Counters ── */
function initCounters() {
  const obs = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, target = +el.dataset.count, suf = el.dataset.suffix || '';
    let cur = 0; const step = target / (1600 / 16);
    const t = setInterval(() => { cur = Math.min(cur+step,target); el.textContent=Math.floor(cur).toLocaleString()+suf; if(cur>=target)clearInterval(t); }, 16);
    obs.unobserve(el);
  }), { threshold: .6 });
  document.querySelectorAll('[data-count]').forEach(el => obs.observe(el));
}

/* ── Field validation helper ── */
function setField(inp, msg, ok) {
  let h = inp.parentElement.querySelector('.fhint');
  if (!h) { h = document.createElement('span'); h.className='fhint'; inp.parentElement.appendChild(h); }
  h.textContent = msg; h.className = 'fhint ' + (msg ? (ok?'ok':'err') : '');
  inp.classList.toggle('ok', ok && !!msg);
  inp.classList.toggle('err', !ok && !!msg);
}

/* ════════════════════════════════════════════
   REGISTER PAGE
════════════════════════════════════════════ */
function initRegister() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  const F = {
    name:    form.querySelector('#rName'),
    age:     form.querySelector('#rAge'),
    gender:  form.querySelector('#rGender'),
    blood:   form.querySelector('#rBlood'),
    lastDon: form.querySelector('#rLastDon'),
    contact: form.querySelector('#rContact'),
    email:   form.querySelector('#rEmail'),
    pass:    form.querySelector('#rPass'),
  };
  const eligBox = document.getElementById('eligBox');
  const sub     = form.querySelector('.btn-submit');

  function checkElig() {
    const age = +F.age.value, gender = F.gender.value, date = F.lastDon.value;
    if (!age || !gender || !date) {
      eligBox.className = 'elig-box';
      eligBox.querySelector('.elig-title').textContent  = 'Fill in details to check eligibility';
      eligBox.querySelector('.elig-detail').textContent = 'Age, gender and last donation date needed.';
      return;
    }
    const days = daysSince(date), min = gender === 'Female' ? 120 : 90;
    const ageOk = age >= 18 && age <= 65, donOk = days >= min;
    if (ageOk && donOk) {
      eligBox.className = 'elig-box ok';
      eligBox.querySelector('.elig-title').textContent  = '✅ Eligible to donate';
      eligBox.querySelector('.elig-detail').textContent = `${days} days since last donation — ${min} days required. You're clear!`;
    } else if (!ageOk) {
      eligBox.className = 'elig-box no';
      eligBox.querySelector('.elig-title').textContent  = '❌ Age requirement not met';
      eligBox.querySelector('.elig-detail').textContent = 'Donors must be between 18 and 65.';
    } else {
      eligBox.className = 'elig-box no';
      eligBox.querySelector('.elig-title').textContent  = '❌ Too soon to donate again';
      eligBox.querySelector('.elig-detail').textContent = `Wait ${min - days} more days. (${min} days required for ${gender.toLowerCase()} donors)`;
    }
    checkSub();
  }

  function checkSub() {
    const age = +F.age.value, gender = F.gender.value, date = F.lastDon.value;
    const days = date ? daysSince(date) : 0, min = gender === 'Female' ? 120 : 90;
    const all  = Object.values(F).every(f => f.value.trim());
    sub.disabled = !(all && age >= 18 && age <= 65 && days >= min);
  }

  F.name.addEventListener('input',   () => { setField(F.name,  F.name.value.trim().length>=2?'✔ Valid':'✖ Min 2 chars', F.name.value.trim().length>=2); checkSub(); });
  F.age.addEventListener('input',    () => { const ok=+F.age.value>=18&&+F.age.value<=65; setField(F.age,ok?'✔ Valid age':'✖ Must be 18–65',ok); checkElig(); });
  F.contact.addEventListener('input',() => { const ok=/^[6-9]\d{9}$/.test(F.contact.value); setField(F.contact,ok?'✔ Valid':'✖ 10-digit Indian number',ok); checkSub(); });
  F.email.addEventListener('input',  () => { const ok=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(F.email.value); setField(F.email,ok?'✔ Valid':'✖ Invalid email',ok); checkSub(); });
  F.pass.addEventListener('input',   () => { const ok=F.pass.value.length>=6; setField(F.pass,ok?'✔ Strong enough':'✖ Min 6 characters',ok); checkSub(); });
  F.gender.addEventListener('change', checkElig);
  F.lastDon.addEventListener('change', checkElig);
  F.blood.addEventListener('change', checkSub);

  form.addEventListener('submit', async e => {
    e.preventDefault();
    sub.textContent = 'Registering...'; sub.disabled = true;
    const body = {
      name: F.name.value.trim(), age: +F.age.value, gender: F.gender.value,
      bloodGroup: F.blood.value, state: form.querySelector('#rState').value,
      city: form.querySelector('#rCity').value, lastDonationDate: F.lastDon.value,
      contact: F.contact.value, email: F.email.value, password: F.pass.value
    };
    const { ok, data } = await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) })
      .catch(() => ({ ok: false, data: { message: 'Cannot connect to server.' } }));
    if (ok) {
      setAuth(data.token, data.donor);
      form.style.display = 'none';
      document.getElementById('regSuccess').style.display = 'block';
      showToast(data.message);
    } else {
      showToast(data.message, 'error');
      sub.textContent = 'Complete Registration'; sub.disabled = false;
    }
  });
}

/* ════════════════════════════════════════════
   SEARCH PAGE
════════════════════════════════════════════ */
let allDonors = [];

function renderDonors(list) {
  const grid = document.getElementById('donorsGrid');
  const meta = document.getElementById('resultsMeta');
  if (!grid) return;
  if (meta) meta.innerHTML = `Found <strong>${list.length}</strong> eligible available donor${list.length!==1?'s':''}`;
  if (!list.length) {
    grid.innerHTML = '<div class="empty"><span class="ei">🩸</span><h3>No donors found</h3><p>Try adjusting your filters.</p></div>';
    return;
  }
  grid.innerHTML = list.map(d => {
    const elig  = d.isEligible ?? isEligible(d);
    const days  = daysSince(d.lastDonationDate);
    const phone = d.contact || '';
    const waMsg = encodeURIComponent(`Hi ${d.name}, I found your profile on LifeLink. I urgently need ${d.bloodGroup} blood in ${d.city}. Can you help?`);
    return `
    <div class="donor-card">
      <div class="dc-head">
        <div class="dc-ava">${initials(d.name)}</div>
        <div><span class="dc-name">${d.name}</span><span class="dc-loc">📍 ${d.city}, ${d.state}</span></div>
        <span class="blood-badge">${d.bloodGroup}</span>
      </div>
      <div class="dc-row"><span class="dc-key">Age / Gender</span><span class="dc-val">${d.age} yrs · ${d.gender}</span></div>
      <div class="dc-row"><span class="dc-key">Last Donated</span><span class="dc-val">${days} days ago</span></div>
      <div class="dc-row"><span class="dc-key">Eligibility</span><span class="dc-val"><span class="badge ${elig?'badge-green':'badge-red'}">${elig?'✅ Eligible':'❌ Not Eligible'}</span></span></div>
      ${phone ? `
      <div class="contact-box">
        <div class="contact-phone"><span>📞</span><span>+91 ${phone}</span></div>
        <div class="contact-btns">
          <a href="tel:+91${phone}" class="btn-call">📞 Call</a>
          <a href="https://wa.me/91${phone}?text=${waMsg}" target="_blank" class="btn-wa">💬 WhatsApp</a>
        </div>
      </div>` : '<div class="no-contact">📵 Contact not available</div>'}
    </div>`;
  }).join('');
}

function applyFilters() {
  const blood = document.getElementById('fBlood')?.value || '';
  const state = document.getElementById('fState')?.value || '';
  const city  = document.getElementById('fCity')?.value  || '';
  const eligOnly = document.getElementById('fElig')?.checked ?? true;
  const filtered = allDonors.filter(d => {
    if (!d.isAvailable) return false;
    if (blood && d.bloodGroup !== blood) return false;
    if (state && d.state !== state)      return false;
    if (city  && d.city  !== city)       return false;
    if (eligOnly && !isEligible(d))      return false;
    return true;
  });
  renderDonors(filtered);
}

async function loadDonors() {
  const grid = document.getElementById('donorsGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="loading"><div class="spinner"></div><p style="color:var(--muted);font-size:.85rem">Loading donors...</p></div>';
  const { ok, data } = await apiFetch('/donors').catch(() => ({ ok: false, data: {} }));
  allDonors = ok ? (data.donors || []) : [];
  applyFilters();
}

function initSearch() {
  if (!document.getElementById('donorsGrid')) return;
  loadDonors();
  ['fBlood','fState','fCity','fElig'].forEach(id => document.getElementById(id)?.addEventListener('change', applyFilters));
  document.getElementById('fState')?.addEventListener('change', function() {
    const cEl = document.getElementById('fCity');
    if (!cEl) return;
    cEl.innerHTML = '<option value="">All Cities</option>';
    (STATE_CITIES[this.value] || []).forEach(c => { const o=document.createElement('option'); o.value=c; o.textContent=c; cEl.appendChild(o); });
  });
  document.getElementById('resetFilters')?.addEventListener('click', () => {
    ['fBlood','fState'].forEach(id => { const el=document.getElementById(id); if(el)el.value=''; });
    const fc=document.getElementById('fCity'); if(fc)fc.innerHTML='<option value="">All Cities</option>';
    const fe=document.getElementById('fElig'); if(fe)fe.checked=true;
    applyFilters();
  });
}

/* ════════════════════════════════════════════
   EMERGENCY PAGE
════════════════════════════════════════════ */
function initEmergency() {
  const form = document.getElementById('emergencyForm');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit');
    btn.textContent = '🚨 Sending alerts...'; btn.disabled = true;
    const body = {
      bloodGroup: form.querySelector('#eBlood').value,
      state:      form.querySelector('#eState').value,
      city:       document.getElementById('eCity')?.value || '',
      message:    form.querySelector('#eMsg')?.value || ''
    };
    const { ok, data } = await apiFetch('/donors/emergency', { method:'POST', body: JSON.stringify(body) })
      .catch(() => ({ ok: false, data: { message: 'Server offline.' } }));
    showAlertResult(ok ? data : { alertedCount: 0, message: data.message, donors: [] });
    btn.textContent = '🚨 Send Emergency Alert'; btn.disabled = false;
  });
}

function showAlertResult(data) {
  const el = document.getElementById('alertResult');
  if (!el) return;
  const empty = data.alertedCount === 0;
  el.className = 'alert-result show' + (empty ? ' empty' : '');
  el.querySelector('.ar-icon').textContent  = empty ? '⚠️' : '🚨';
  el.querySelector('.ar-title').textContent = data.message || (empty ? 'No donors found.' : `Alert sent to ${data.alertedCount} donors!`);
  el.querySelector('.ar-sub').textContent   = empty ? 'Try a different blood group or broader location.' : `Top ${data.donors?.length || 0} nearest donors alerted via SMS simulation.`;
  const list = el.querySelector('.sms-list');
  list.innerHTML = (data.donors || []).map(d => {
    const waMsg = encodeURIComponent(`Hi ${d.name}, EMERGENCY! Urgent ${d.bloodGroup} blood needed in ${d.city}. Please contact immediately. - LifeLink`);
    return `
    <div class="sms-item">
      <div class="sms-info">
        <strong>${d.name}</strong>
        <span class="sms-blood">${d.bloodGroup}</span>
        <span class="sms-city">📍 ${d.city}</span>
      </div>
      <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap">
        <span class="sms-status">📱 SMS Sent</span>
        ${d.contact ? `
        <div class="sms-btns">
          <a href="tel:+91${d.contact}" class="sms-call">📞 Call</a>
          <a href="https://wa.me/91${d.contact}?text=${waMsg}" target="_blank" class="sms-wa">💬 WA</a>
        </div>` : ''}
      </div>
    </div>`;
  }).join('');
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ════════════════════════════════════════════
   DASHBOARD PAGE
════════════════════════════════════════════ */
async function initDashboard() {
  if (!document.getElementById('dashName')) return;

  // Check auth
  if (!getToken()) {
    showToast('Please login first.', 'info');
    setTimeout(() => { window.location.href = 'index.html'; }, 1000);
    return;
  }

  // Load fresh profile from API
  const { ok, data } = await apiFetch('/auth/me').catch(() => ({ ok: false, data: {} }));
  if (!ok) {
    showToast('Session expired. Please login again.', 'error');
    clearAuth();
    setTimeout(() => { window.location.href = 'index.html'; }, 1200);
    return;
  }

  const d = data.donor;
  setAuth(getToken(), d); // refresh local storage

  // Fill profile UI
  const ava = initials(d.name);
  document.getElementById('dashAva').textContent   = ava;
  document.getElementById('dashName').textContent  = d.name;
  document.getElementById('dashLoc').textContent   = `${d.city}, ${d.state}`;
  document.getElementById('dashBlood').textContent = d.bloodGroup;

  // Stats
  document.getElementById('dsDays').textContent  = d.daysSinceLastDonation;
  document.getElementById('dsBlood').textContent = d.bloodGroup;
  document.getElementById('dsCity').textContent  = d.city;

  // Eligibility
  const eligBanner = document.getElementById('eligBanner');
  const eligTitle  = document.getElementById('eligTitle');
  const eligDetail = document.getElementById('eligDetail');
  if (d.isEligible) {
    eligBanner.className = 'elig-box ok';
    eligTitle.textContent  = '✅ You are eligible to donate blood';
    eligDetail.textContent = `${d.daysSinceLastDonation} days since last donation — you're ready!`;
  } else {
    eligBanner.className = 'elig-box no';
    eligTitle.textContent  = '⏳ Not yet eligible';
    eligDetail.textContent = `Donate again in ${d.daysUntilEligible} more days.`;
  }

  // Availability toggle
  renderAvailBanner(d.isAvailable);
  document.getElementById('availBtn')?.addEventListener('click', async () => {
    const btn = document.getElementById('availBtn');
    btn.textContent = '...'; btn.disabled = true;
    const { ok: aok, data: adata } = await apiFetch('/donors/availability', { method: 'PATCH' })
      .catch(() => ({ ok: false, data: { message: 'Server offline.' } }));
    if (aok) {
      renderAvailBanner(adata.isAvailable);
      showToast(adata.message);
      // Update local storage
      const u = getUser(); if (u) { u.isAvailable = adata.isAvailable; setAuth(getToken(), u); }
    } else {
      showToast(adata.message, 'error');
    }
    btn.disabled = false;
  });
}

function renderAvailBanner(isAvailable) {
  const banner = document.getElementById('availBanner');
  const label  = document.getElementById('availLabel');
  const sub    = document.getElementById('availSub');
  const btn    = document.getElementById('availBtn');
  if (!banner) return;
  if (isAvailable) {
    banner.className     = 'avail-banner yes';
    label.textContent    = '🟢 Currently Available';
    label.style.color    = 'var(--green)';
    sub.textContent      = 'You are visible in donor searches.';
    btn.textContent      = '🔴 Mark Unavailable';
    btn.style.background = 'var(--red-dark)';
  } else {
    banner.className     = 'avail-banner no';
    label.textContent    = '🔴 Currently Unavailable';
    label.style.color    = 'var(--red)';
    sub.textContent      = 'You are hidden from donor searches.';
    btn.textContent      = '🟢 Mark Available';
    btn.style.background = 'var(--green)';
  }
}

/* ── API status bar ── */
async function checkAPI() {
  const bar = document.getElementById('apiBar');
  if (!bar) return;
  try {
    const r = await fetch('http://localhost:5000/', { signal: AbortSignal.timeout(2000) });
    if (r.ok) { bar.textContent = '🟢 Connected to LifeLink server'; bar.className = 'api-bar ok'; }
  } catch {
    bar.textContent = '🟡 Server offline — showing demo data';
  }
}

/* ── Init all ── */
document.addEventListener('DOMContentLoaded', () => {
  checkAPI();
  initNav();
  initModal();
  populateStates();
  initCounters();
  initRegister();
  initSearch();
  initEmergency();
  initDashboard();
});
