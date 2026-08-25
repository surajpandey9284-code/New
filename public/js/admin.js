let state = null;

async function checkSession() {
  const res = await fetch('/api/admin/session');
  const { isAdmin } = await res.json();
  if (!isAdmin) {
    window.location.href = '/';
    return;
  }
  document.getElementById('adminApp').style.display = 'block';
  loadData();
}

async function loadData() {
  const res = await fetch('/api/admin/data');
  state = await res.json();
  renderProfile();
  renderExperience();
  renderProjects();
  renderSkills();
  renderEducation();
  loadMessages();
  renderManagement();
}

function markDirty() {
  document.getElementById('saveStatus').textContent = 'Unsaved changes';
  document.getElementById('saveStatus').style.color = 'var(--amber)';
}

// ---------- Tabs ----------
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// ---------- Profile ----------
function renderProfile() {
  const p = state.profile;
  const el = document.getElementById('tab-profile');
  el.innerHTML = `
    <div class="admin-card">
      <label>Name</label><input data-bind="profile.name" value="${esc(p.name)}">
      <label>Title</label><input data-bind="profile.title" value="${esc(p.title)}">
      <label>Tagline</label><input data-bind="profile.tagline" value="${esc(p.tagline)}">
      <label>Bio</label><textarea data-bind="profile.bio">${esc(p.bio)}</textarea>
      <label>Location</label><input data-bind="profile.location" value="${esc(p.location)}">
      <label>Phone</label><input data-bind="profile.phone" value="${esc(p.phone)}">
      <label>Email</label><input data-bind="profile.email" value="${esc(p.email)}">
      <label>LinkedIn URL</label><input data-bind="profile.linkedin" value="${esc(p.linkedin)}">
    </div>
    <div class="admin-card">
      <div class="section-label">Contact buttons (WhatsApp / Instagram / LinkedIn) — also editable in Management tab</div>
      <label>WhatsApp number (with country code, digits only, e.g. 919876543210)</label>
      <input data-bind="profile.social.whatsapp" value="${esc((p.social && p.social.whatsapp) || '')}">
      <label>Instagram URL</label>
      <input data-bind="profile.social.instagram" value="${esc((p.social && p.social.instagram) || '')}">
      <label>LinkedIn URL</label>
      <input data-bind="profile.social.linkedin" value="${esc((p.social && p.social.linkedin) || '')}">
    </div>
    <div class="admin-card">
      <div style="font-family:var(--font-mono); color:var(--amber); font-size:12px; margin-bottom:8px;">DASHBOARD STATS (KPI strip)</div>
      <div id="statsList"></div>
      <button class="add-btn" id="addStat">+ Add stat</button>
    </div>
  `;
  renderStats();
  bindInputs(el);
  document.getElementById('addStat').onclick = () => {
    state.profile.stats.push({ value: '0', label: 'New stat' });
    renderStats();
    markDirty();
  };
}

function renderStats() {
  const wrap = document.getElementById('statsList');
  wrap.innerHTML = state.profile.stats.map((s, i) => `
    <div style="display:flex; gap:10px; margin-bottom:10px; align-items:flex-end;">
      <div style="flex:0 0 90px;"><label>Value</label><input data-stat="${i}" data-field="value" value="${esc(s.value)}"></div>
      <div style="flex:1;"><label>Label</label><input data-stat="${i}" data-field="label" value="${esc(s.label)}"></div>
      <button class="remove-btn" data-remove-stat="${i}">Remove</button>
    </div>
  `).join('');
  wrap.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('input', () => {
      state.profile.stats[inp.dataset.stat][inp.dataset.field] = inp.value;
      markDirty();
    });
  });
  wrap.querySelectorAll('[data-remove-stat]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.profile.stats.splice(btn.dataset.removeStat, 1);
      renderStats();
      markDirty();
    });
  });
}

// ---------- Experience ----------
function renderExperience() {
  const el = document.getElementById('tab-experience');
  el.innerHTML = state.experience.map((e, i) => `
    <div class="admin-card">
      <label>Role</label><input data-exp="${i}" data-field="role" value="${esc(e.role)}">
      <label>Organization</label><input data-exp="${i}" data-field="org" value="${esc(e.org)}">
      <label>Period</label><input data-exp="${i}" data-field="period" value="${esc(e.period)}">
      <label>Points (one per line)</label><textarea data-exp="${i}" data-field="points" style="min-height:110px;">${esc(e.points.join('\n'))}</textarea>
      <div class="row-actions"><button class="remove-btn" data-remove-exp="${i}">Remove entry</button></div>
    </div>
  `).join('') + `<button class="add-btn" id="addExp">+ Add experience</button>`;

  el.querySelectorAll('input, textarea').forEach(inp => {
    inp.addEventListener('input', () => {
      const i = inp.dataset.exp, f = inp.dataset.field;
      state.experience[i][f] = f === 'points' ? inp.value.split('\n').filter(Boolean) : inp.value;
      markDirty();
    });
  });
  el.querySelectorAll('[data-remove-exp]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.experience.splice(btn.dataset.removeExp, 1);
      renderExperience();
      markDirty();
    });
  });
  document.getElementById('addExp').onclick = () => {
    state.experience.push({ id: 'exp' + Date.now(), role: 'New role', org: 'Company', period: '2026', points: [] });
    renderExperience();
    markDirty();
  };
}

// ---------- Projects ----------
function renderProjects() {
  const el = document.getElementById('tab-projects');
  el.innerHTML = state.projects.map((p, i) => `
    <div class="admin-card">
      <label>Title</label><input data-proj="${i}" data-field="title" value="${esc(p.title)}">
      <label>Description</label><textarea data-proj="${i}" data-field="description">${esc(p.description)}</textarea>
      <label>Tags (comma separated)</label><input data-proj="${i}" data-field="tags" value="${esc(p.tags.join(', '))}">
      <label>Link (optional)</label><input data-proj="${i}" data-field="link" value="${esc(p.link || '')}">
      <div class="row-actions"><button class="remove-btn" data-remove-proj="${i}">Remove project</button></div>
    </div>
  `).join('') + `<button class="add-btn" id="addProj">+ Add project</button>`;

  el.querySelectorAll('input, textarea').forEach(inp => {
    inp.addEventListener('input', () => {
      const i = inp.dataset.proj, f = inp.dataset.field;
      state.projects[i][f] = f === 'tags' ? inp.value.split(',').map(t => t.trim()).filter(Boolean) : inp.value;
      markDirty();
    });
  });
  el.querySelectorAll('[data-remove-proj]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.projects.splice(btn.dataset.removeProj, 1);
      renderProjects();
      markDirty();
    });
  });
  document.getElementById('addProj').onclick = () => {
    state.projects.push({ id: 'proj' + Date.now(), title: 'New project', description: '', tags: [], link: '' });
    renderProjects();
    markDirty();
  };
}

// ---------- Skills ----------
function renderSkills() {
  const el = document.getElementById('tab-skills');
  const groups = Object.entries(state.skills);
  el.innerHTML = groups.map(([group, items], i) => `
    <div class="admin-card">
      <label>Group name</label><input data-skillgroup="${i}" data-field="name" value="${esc(group)}">
      <label>Skills (comma separated)</label><input data-skillgroup="${i}" data-field="items" value="${esc(items.join(', '))}">
      <div class="row-actions"><button class="remove-btn" data-remove-group="${i}">Remove group</button></div>
    </div>
  `).join('') + `<button class="add-btn" id="addGroup">+ Add skill group</button>`;

  el.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('input', () => {
      const groupsArr = Object.entries(state.skills);
      const idx = Number(inp.dataset.skillgroup);
      const [oldName, oldItems] = groupsArr[idx];
      if (inp.dataset.field === 'name') {
        const newSkills = {};
        groupsArr.forEach(([g, it], gi) => { newSkills[gi === idx ? inp.value : g] = it; });
        state.skills = newSkills;
      } else {
        state.skills[oldName] = inp.value.split(',').map(s => s.trim()).filter(Boolean);
      }
      markDirty();
    });
  });
  el.querySelectorAll('[data-remove-group]').forEach(btn => {
    btn.addEventListener('click', () => {
      const groupsArr = Object.entries(state.skills);
      const idx = Number(btn.dataset.removeGroup);
      groupsArr.splice(idx, 1);
      state.skills = Object.fromEntries(groupsArr);
      renderSkills();
      markDirty();
    });
  });
  document.getElementById('addGroup').onclick = () => {
    state.skills['New group'] = [];
    renderSkills();
    markDirty();
  };
}

// ---------- Education ----------
function renderEducation() {
  const el = document.getElementById('tab-education');
  el.innerHTML = `<div class="admin-card"><div style="font-family:var(--font-mono); color:var(--amber); font-size:12px; margin-bottom:8px;">EDUCATION</div>` +
    state.education.map((e, i) => `
      <div style="border-top:1px solid var(--border); padding-top:14px; margin-top:14px;">
        <label>Degree</label><input data-edu="${i}" data-field="degree" value="${esc(e.degree)}">
        <label>School</label><input data-edu="${i}" data-field="school" value="${esc(e.school)}">
        <label>Period</label><input data-edu="${i}" data-field="period" value="${esc(e.period)}">
        <div class="row-actions"><button class="remove-btn" data-remove-edu="${i}">Remove</button></div>
      </div>
    `).join('') + `</div><button class="add-btn" id="addEdu">+ Add education</button>
    <div class="admin-card" style="margin-top:16px;">
      <div style="font-family:var(--font-mono); color:var(--amber); font-size:12px; margin-bottom:8px;">CERTIFICATIONS</div>
      <label>One per line</label>
      <textarea id="certsField" style="min-height:100px;">${esc(state.certifications.join('\n'))}</textarea>
    </div>`;

  el.querySelectorAll('[data-edu]').forEach(inp => {
    inp.addEventListener('input', () => {
      state.education[inp.dataset.edu][inp.dataset.field] = inp.value;
      markDirty();
    });
  });
  el.querySelectorAll('[data-remove-edu]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.education.splice(btn.dataset.removeEdu, 1);
      renderEducation();
      markDirty();
    });
  });
  document.getElementById('addEdu').onclick = () => {
    state.education.push({ degree: 'New degree', school: 'School', period: '2026' });
    renderEducation();
    markDirty();
  };
  document.getElementById('certsField').addEventListener('input', (e) => {
    state.certifications = e.target.value.split('\n').filter(Boolean);
    markDirty();
  });
}

// ---------- Messages ----------
async function loadMessages() {
  const res = await fetch('/api/admin/messages');
  const messages = await res.json();
  const el = document.getElementById('tab-messages');
  if (!messages.length) {
    el.innerHTML = `<div class="admin-card" style="color:var(--muted);">No messages yet.</div>`;
    return;
  }
  el.innerHTML = `<div class="admin-card">` + messages.map((m, i) => `
    <div class="msg-item">
      <div class="msg-top">
        <strong>${esc(m.name)} — ${esc(m.email)}</strong>
        <span class="msg-time">${new Date(m.receivedAt).toLocaleString()}</span>
      </div>
      <div class="msg-body">${esc(m.message)}</div>
      <div class="row-actions"><button class="remove-btn" data-del-msg="${i}">Delete</button></div>
    </div>
  `).join('') + `</div>`;

  el.querySelectorAll('[data-del-msg]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await fetch('/api/admin/messages/' + btn.dataset.delMsg, { method: 'DELETE' });
      loadMessages();
    });
  });
}

// ---------- Management (launch checklist + social + analytics) ----------
async function renderManagement() {
  const el = document.getElementById('tab-management');
  el.innerHTML = `
    <div class="admin-card">
      <div class="section-label">Analytics</div>
      <div class="mgmt-stats" id="mgmtStats"><div class="mgmt-stat"><div class="val">…</div><div class="lbl">Loading</div></div></div>
    </div>
    <div class="admin-card">
      <div class="section-label">Before you launch</div>
      <div id="checklistWrap"></div>
    </div>
  `;
  renderChecklist();

  const res = await fetch('/api/admin/analytics');
  const a = await res.json();
  const today = new Date().toISOString().slice(0, 10);
  const topPage = Object.entries(a.byPage || {}).sort((x, y) => y[1] - x[1])[0];
  document.getElementById('mgmtStats').innerHTML = `
    <div class="mgmt-stat"><div class="val">${a.totalVisits || 0}</div><div class="lbl">Total visits (all time)</div></div>
    <div class="mgmt-stat"><div class="val">${(a.byDate && a.byDate[today]) || 0}</div><div class="lbl">Visits today</div></div>
    <div class="mgmt-stat"><div class="val">${topPage ? topPage[0] : '—'}</div><div class="lbl">Most visited page</div></div>
  `;
}

function renderChecklist() {
  const wrap = document.getElementById('checklistWrap');
  const items = state.launchChecklist || [];
  wrap.innerHTML = items.map((item, i) => `
    <div class="checklist-item">
      <input type="checkbox" data-check="${i}" ${item.done ? 'checked' : ''}>
      <div>
        <div class="checklist-label ${item.done ? 'done' : ''}">${esc(item.label)}</div>
        <div class="checklist-note">${esc(item.note)}</div>
      </div>
    </div>
  `).join('');
  wrap.querySelectorAll('[data-check]').forEach(cb => {
    cb.addEventListener('change', () => {
      state.launchChecklist[cb.dataset.check].done = cb.checked;
      renderChecklist();
      markDirty();
    });
  });
}

// ---------- Generic bind for profile fields ----------
function bindInputs(container) {
  container.querySelectorAll('[data-bind]').forEach(inp => {
    inp.addEventListener('input', () => {
      const path = inp.dataset.bind.split('.');
      let obj = state;
      for (let i = 0; i < path.length - 1; i++) {
        if (!obj[path[i]]) obj[path[i]] = {};
        obj = obj[path[i]];
      }
      obj[path[path.length - 1]] = inp.value;
      markDirty();
    });
  });
}

function esc(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ---------- Save ----------
document.getElementById('saveBtn').addEventListener('click', async () => {
  const status = document.getElementById('saveStatus');
  status.textContent = 'Saving…';
  status.style.color = 'var(--muted)';
  const res = await fetch('/api/admin/data', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state)
  });
  if (res.ok) {
    status.textContent = 'All changes saved';
    status.style.color = 'var(--green)';
  } else {
    status.textContent = 'Save failed — try again';
    status.style.color = '#e2665a';
  }
});

// ---------- Logout ----------
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await fetch('/api/admin/logout', { method: 'POST' });
  window.location.href = '/';
});

checkSession();
