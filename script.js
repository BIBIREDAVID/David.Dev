const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- nav active-state (page-based) ---------------- */
document.querySelectorAll('nav a[data-page]').forEach(link => {
  if (link.dataset.page === document.body.dataset.page) link.classList.add('active');
});
document.querySelectorAll('.mobile-menu a[data-page]').forEach(link => {
  if (link.dataset.page === document.body.dataset.page) link.classList.add('active');
});

/* ---------------- hero deploy sequence (home page only) ---------------- */
const termBody = document.getElementById('termBody');
if (termBody) {
  function addLine(html, opts = {}) {
    return new Promise(resolve => {
      const div = document.createElement('div');
      div.className = 'line';
      div.innerHTML = html;
      termBody.appendChild(div);
      setTimeout(resolve, opts.hold ?? 260);
    });
  }

  function typeLine(prefix, text, cursorId) {
    return new Promise(resolve => {
      const div = document.createElement('div');
      div.className = 'line';
      div.innerHTML = prefix + `<span id="${cursorId}"></span>`;
      termBody.appendChild(div);
      const el = document.getElementById(cursorId);
      el.style.borderRight = '2px solid var(--amber)';
      if (reduceMotion) { el.textContent = text; el.style.borderRight = 'none'; resolve(); return; }
      let i = 0;
      (function tick(){
        el.textContent = text.slice(0, i);
        i++;
        if (i <= text.length) { setTimeout(tick, 22); }
        else { el.style.borderRight = 'none'; setTimeout(resolve, 300); }
      })();
    });
  }

  (async function runDeploySequence() {
    await typeLine('<span class="prompt">david@lasu</span>:<span class="path">~/nacos-voting</span>$ ', 'git push origin main', 'typed1');
    await addLine('<span style="color:var(--slate)">Enumerating objects, compressing, pushing to origin...</span>', {hold: 380});
    await addLine('<span class="ok">✓</span> build compiled <span style="color:var(--slate)">in 1.2s</span>', {hold: 260});
    await addLine('<span class="ok">✓</span> tests passed <span style="color:var(--slate)">(14/14)</span>', {hold: 260});
    await addLine('<span class="ok">✓</span> deployed to <span class="path">vercel.app</span>', {hold: 320});
    await addLine('<span class="term-live"><span class="livedot"></span>LIVE — 0 downtime since deploy</span>', {hold: 100});
  })();
}

/* ---------------- scroll reveal ---------------- */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
revealEls.forEach(el => io.observe(el));

document.querySelectorAll('.reveal-stagger .stagger-child').forEach((el, i) => {
  el.style.transitionDelay = (i * 55) + 'ms';
});

/* ---------------- mobile menu ---------------- */
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
if (navToggle && mobileMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
}

/* ---------------- copy email ---------------- */
const copyEmailBtn = document.getElementById('copyEmail');
if (copyEmailBtn) {
  copyEmailBtn.addEventListener('click', async () => {
    const email = copyEmailBtn.dataset.email;
    const original = copyEmailBtn.textContent;
    try {
      await navigator.clipboard.writeText(email);
      copyEmailBtn.textContent = 'copied to clipboard ✓';
    } catch {
      copyEmailBtn.textContent = email;
      window.location.href = `mailto:${email}`;
    }
    setTimeout(() => { copyEmailBtn.textContent = original; }, 1800);
  });
}

/* ---------------- keyboard chord navigation (g then h/w/a/c) ---------------- */
let awaitingChord = false;
let chordTimer = null;
const chordMap = { h: 'index.html', w: 'work.html', a: 'about.html', c: 'contact.html' };
document.addEventListener('keydown', (e) => {
  const tag = document.activeElement.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  if (e.key === 'g' && !awaitingChord) {
    awaitingChord = true;
    clearTimeout(chordTimer);
    chordTimer = setTimeout(() => { awaitingChord = false; }, 1200);
    return;
  }
  if (awaitingChord && chordMap[e.key]) {
    awaitingChord = false;
    clearTimeout(chordTimer);
    window.location.href = chordMap[e.key];
  }
});

/* ---------------- ambient cursor glow ---------------- */
const glow = document.getElementById('glow');
if (glow && !reduceMotion && window.matchMedia('(pointer:fine)').matches) {
  let gx = window.innerWidth/2, gy = window.innerHeight/2, cx = gx, cy = gy;
  document.addEventListener('mousemove', e => {
    gx = e.clientX; gy = e.clientY;
    glow.style.opacity = 1;
  });
  document.addEventListener('mouseleave', () => glow.style.opacity = 0);
  (function loop(){
    cx += (gx - cx) * 0.12;
    cy += (gy - cy) * 0.12;
    glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();
}

/* ---------------- project card tilt ---------------- */
if (!reduceMotion && window.matchMedia('(pointer:fine)').matches) {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(700px) rotateY(${px * 4}deg) rotateX(${-py * 4}deg) translateY(-2px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(700px) rotateY(0) rotateX(0) translateY(0)';
    });
  });
}

/* ---------------- session uptime ticker ---------------- */
const uptimeText = document.getElementById('uptimeText');
if (uptimeText) {
  const start = Date.now();
  function pad(n){ return n.toString().padStart(2,'0'); }
  setInterval(() => {
    const s = Math.floor((Date.now() - start) / 1000);
    const hh = Math.floor(s/3600), mm = Math.floor((s%3600)/60), ss = s%60;
    uptimeText.textContent = `session uptime ${pad(hh)}:${pad(mm)}:${pad(ss)}`;
  }, 1000);
}