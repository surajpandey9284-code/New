const $ = (s) => document.querySelector(s);
const esc = (v='') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon = { whatsapp:'◔', instagram:'◎', linkedin:'in', github:'⌘', email:'✉' };
let portfolio = null;

$('#year').textContent = new Date().getFullYear();

async function loadData(){try{const r=await fetch('/api/data');if(!r.ok)throw new Error('data');portfolio=await r.json();render(portfolio)}catch(e){console.error(e)}}
function wa(v){return `https://wa.me/${String(v||'').replace(/\D/g,'')}`}

function render(data){
 const p=data.profile||{}; const social=p.social||{};
 document.title=`${p.name||'Suraj Pandey'} — ${p.title||'Data Analyst'}`;
 $('#heroName').textContent=p.name||'Suraj Pandey'; $('#cardName').textContent=p.name||'Suraj Pandey'; $('#cardTitle').textContent=p.title||'Data Analyst'; $('#cardLocation').textContent=`📍 ${p.location||''}`;
 $('#heroTagline').textContent=p.tagline||''; $('#heroBio').textContent=p.bio||''; $('#bioText').textContent=p.bio||'';
 const roles=['Data Analyst','Business Analyst','Financial Analytics','Business Intelligence'];let i=0,ri=0;
 clearInterval(window.roleTimer); window.roleTimer=setInterval(()=>{const el=$('#typedRole');el.style.opacity=0;setTimeout(()=>{el.textContent=roles[i++%roles.length];el.style.opacity=1},220)},2600);
 $('#kpiStrip').innerHTML=(p.stats||[]).map(s=>`<div class="kpi-tile"><div class="kpi-value">${esc(s.value)}</div><div class="kpi-label">${esc(s.label)}</div></div>`).join('');
 $('#expList').innerHTML=(data.experience||[]).map((e,n)=>`<article class="exp-item reveal"><div class="exp-period">${esc(e.period)}</div><div><div class="exp-role">${esc(e.role)}</div><div class="exp-org">${esc(e.org)}</div><ul class="exp-points">${(e.points||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></article>`).join('');
 $('#projectsList').innerHTML=(data.projects||[]).map((x,n)=>`<article class="project-card reveal"><div class="project-number">PROJECT 0${n+1}</div><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p><div class="tag-row">${(x.tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div><div class="project-bottom"><span class="period">Business impact</span>${x.link?`<a class="project-link" href="${esc(x.link)}" target="_blank" rel="noopener">View project ↗</a>`:'<span class="project-link">Portfolio case study</span>'}</div></article>`).join('');
 $('#skillsList').innerHTML=Object.entries(data.skills||{}).map(([g,items])=>`<div class="skill-group reveal"><h4>${esc(g)}</h4><div class="skill-chips">${items.map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</div></div>`).join('');
 $('#eduList').innerHTML=(data.education||[]).map(e=>`<article class="edu-item reveal"><div class="degree">${esc(e.degree)}</div><div class="school">${esc(e.school)}</div><div class="period">${esc(e.period)}</div></article>`).join('');
 $('#certList').innerHTML=(data.certifications||[]).map((c,n)=>`<article class="cert-card reveal"><span>Credential 0${n+1}</span><h4>${esc(c)}</h4><span>Professional learning</span></article>`).join('');
 const socialLinks=[];
 if(social.whatsapp)socialLinks.push(`<a href="${wa(social.whatsapp)}" target="_blank" rel="noopener">${icon.whatsapp} WhatsApp</a>`);
 if(social.linkedin)socialLinks.push(`<a href="${esc(social.linkedin)}" target="_blank" rel="noopener">${icon.linkedin} LinkedIn</a>`);
 if(social.github)socialLinks.push(`<a href="${esc(social.github)}" target="_blank" rel="noopener">${icon.github} GitHub</a>`);
 if(social.instagram)socialLinks.push(`<a href="${esc(social.instagram)}" target="_blank" rel="noopener">${icon.instagram} Instagram</a>`);
 $('#heroSocial').innerHTML=socialLinks.join(' · ');
 $('#contactInfo').innerHTML=`<div class="contact-info-row"><strong>Email</strong> <a href="mailto:${esc(p.email)}">${esc(p.email)}</a></div><div class="contact-info-row"><strong>Phone</strong> <a href="tel:${esc(p.phone)}">${esc(p.phone)}</a></div><div class="contact-info-row"><strong>Location</strong> ${esc(p.location)}</div>`;
 const actions=[];
 if(social.whatsapp)actions.push(`<a class="contact-action" href="${wa(social.whatsapp)}" target="_blank" rel="noopener"><span class="action-icon">${icon.whatsapp}</span><b>WhatsApp</b><small>Chat directly</small></a>`);
 if(social.instagram)actions.push(`<a class="contact-action" href="${esc(social.instagram)}" target="_blank" rel="noopener"><span class="action-icon">${icon.instagram}</span><b>Instagram</b><small>Follow / connect</small></a>`);
 if(social.linkedin)actions.push(`<a class="contact-action" href="${esc(social.linkedin)}" target="_blank" rel="noopener"><span class="action-icon">${icon.linkedin}</span><b>LinkedIn</b><small>Professional network</small></a>`);
 $('#contactActions').innerHTML=actions.join('');
 $('#footerLinks').innerHTML=[social.github&&`<a href="${esc(social.github)}" target="_blank">GitHub</a>`,social.linkedin&&`<a href="${esc(social.linkedin)}" target="_blank">LinkedIn</a>`,p.email&&`<a href="mailto:${esc(p.email)}">Email</a>`].filter(Boolean).join('');
 const fab=$('#fabWhatsapp'); if(social.whatsapp)fab.href=wa(social.whatsapp);else fab.style.display='none';
 buildResume(data); initReveal();
}

function buildResume(d){const p=d.profile||{};$('#resumeContent').innerHTML=`<h1>${esc(p.name)}</h1><p><b>${esc(p.title)}</b> · ${esc(p.email)} · ${esc(p.phone)} · ${esc(p.location)}</p><h2>PROFILE</h2><p>${esc(p.bio)}</p><h2>EXPERIENCE</h2>${(d.experience||[]).map(e=>`<div><b>${esc(e.role)}</b> — ${esc(e.org)} <small>(${esc(e.period)})</small><ul>${(e.points||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}<h2>PROJECTS</h2>${(d.projects||[]).map(x=>`<div><b>${esc(x.title)}</b><p>${esc(x.description)}</p><p><b>Tools:</b> ${(x.tags||[]).map(esc).join(' · ')}</p></div>`).join('')}<h2>SKILLS</h2><p>${Object.values(d.skills||{}).flat().map(esc).join(' · ')}</p><h2>EDUCATION</h2>${(d.education||[]).map(e=>`<p><b>${esc(e.degree)}</b><br>${esc(e.school)} · ${esc(e.period)}</p>`).join('')}<h2>CERTIFICATIONS</h2><ul>${(d.certifications||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`}

function initReveal(){const els=document.querySelectorAll('.reveal:not(.active-now), .kpi-strip, .projects-grid, .skills-grid, .edu-grid, .cert-grid');if(!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('in-view'));return}const ob=new IntersectionObserver(entries=>entries.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in-view');ob.unobserve(en.target)}}),{threshold:.1,rootMargin:'0px 0px -35px'});els.forEach(e=>ob.observe(e))}

$('#contactForm').addEventListener('submit',async e=>{e.preventDefault();const f=e.target,m=$('#formMsg');m.textContent='Sending…';try{const r=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:f.name.value,email:f.email.value,subject:f.subject.value,message:f.message.value})});const d=await r.json();if(!r.ok)throw new Error(d.error);m.textContent='Message received — thank you!';m.className='form-msg ok';f.reset()}catch(err){m.textContent=err.message||'Network error — please try again.';m.className='form-msg err'}});

const modal=$('#loginModal');$('#loginBtn').addEventListener('click',()=>modal.classList.add('open'));$('#closeModal').addEventListener('click',()=>modal.classList.remove('open'));modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('open')});
$('#loginForm').addEventListener('submit',async e=>{e.preventDefault();const f=e.target,m=$('#loginMsg');m.textContent='Checking…';try{const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:f.username.value,password:f.password.value})});const d=await r.json();if(!r.ok)throw new Error(d.error);location.href='/admin.html'}catch(err){m.textContent=err.message||'Login failed.';m.className='form-msg err'}});

$('#menuBtn').addEventListener('click',()=>$('#navLinks').classList.toggle('open'));document.querySelectorAll('#navLinks a').forEach(a=>a.addEventListener('click',()=>$('#navLinks').classList.remove('open')));
window.addEventListener('scroll',()=>{$('#topbar').classList.toggle('scrolled',scrollY>20);$('#backTop').classList.toggle('show',scrollY>600)});
$('#resumeBtn').addEventListener('click',()=>{$('#resumeSheet').classList.add('open');$('#resumeSheet').setAttribute('aria-hidden','false')});$('#closeResume').addEventListener('click',()=>{$('#resumeSheet').classList.remove('open');$('#resumeSheet').setAttribute('aria-hidden','true')});$('#printResume').addEventListener('click',()=>window.print());
window.addEventListener('mousemove',e=>{const g=$('#cursorGlow');if(g){g.style.left=e.clientX+'px';g.style.top=e.clientY+'px'}});
fetch('/api/track',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({page:location.pathname||'/'})}).catch(()=>{});
fetch('/api/admin/session').then(r=>r.json()).then(d=>{if(d.isAdmin){const old=$('#loginBtn'),b=old.cloneNode(true);old.replaceWith(b);b.textContent='Admin Panel';b.addEventListener('click',()=>location.href='/admin.html')}}).catch(()=>{});
loadData();
