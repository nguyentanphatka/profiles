/**
 * home-extras.js
 * Injects decorative UI blocks into the home section:
 *  1. Typewriter role cycling on the subtitle
 *  2. "Open to opportunities" floating badge
 *  3. Floating code card (≥1600 px only)
 *  4. Tech stack keyword grid
 *  5. Home layout restructure (intro + seek text)
 *  6. Mouse-proximity text spotlight effect
 *
 * Runs after a 900ms delay to let React hydrate first.
 */
(function () {
  'use strict';

  /* ── helpers ─────────────────────────────────────── */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function make(tag, cls, html) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (html) el.innerHTML = html;
    return el;
  }

  /* ═══════════════════════════════════════════════════
     1. TYPEWRITER — cycles role titles in the <span>
        inside the h1 on the home section
     ═══════════════════════════════════════════════════ */
  function initTypewriter() {
    var span = $('#home h1 span.block');
    if (!span) return;

    var _jh = (window.__portfolioJSON && window.__portfolioJSON.home) || {};
    var roles = _jh.roles || [
      '.NET Web Developer',
      'Full Stack Engineer',
      'C# & ASP.NET Specialist',
      'Azure Cloud Practitioner',
      'Open to Freelance'
    ];
    var idx = 0;
    var charIdx = 0;
    var deleting = false;
    var pause = false;

    /* Wrap span content in a typewriter shell */
    span.innerHTML =
      '<span class="he-typewriter-text"></span>' +
      '<span class="he-typewriter-cursor">|</span>';

    var textEl = span.querySelector('.he-typewriter-text');

    function tick() {
      if (pause) return;
      var current = roles[idx];

      if (!deleting) {
        charIdx++;
        textEl.textContent = current.substring(0, charIdx);
        if (charIdx === current.length) {
          // finished typing — hold then delete
          pause = true;
          setTimeout(function () { deleting = true; pause = false; tick(); }, 2200);
          return;
        }
        setTimeout(tick, 68);
      } else {
        charIdx--;
        textEl.textContent = current.substring(0, charIdx);
        if (charIdx === 0) {
          deleting = false;
          idx = (idx + 1) % roles.length;
          setTimeout(tick, 420);
          return;
        }
        setTimeout(tick, 38);
      }
    }

    /* Pre-fill the first role, then start cycling after 2.8s */
    charIdx = roles[0].length;
    textEl.textContent = roles[0];
    setTimeout(function () { deleting = true; tick(); }, 2800);
  }

  /* ═══════════════════════════════════════════════════
     3. "OPEN TO OPPORTUNITIES" FLOATING BADGE
     ═══════════════════════════════════════════════════ */
  function initAvailableBadge() {
    var badge = make('div', 'he-available-badge',
      '<span class="he-avail-dot"></span>' +
      '<span class="he-avail-text">Open to Opportunities</span>'
    );
    document.body.appendChild(badge);

    /* Click → navigate to Contact section */
    badge.addEventListener('click', function () {
      var contactNav = document.querySelectorAll('.desktop-nav-element')[3];
      if (contactNav) { contactNav.click(); return; }
      /* mobile fallback — find contact link in mobile nav */
      var mobileContact = document.querySelector('a[href="#contact"], [data-section="contact"]');
      if (mobileContact) mobileContact.click();
    });

    /* Fade in after 1.6s */
    setTimeout(function () { badge.classList.add('he-available-badge--visible'); }, 1600);
  }

  /* ═══════════════════════════════════════════════════
     4. FLOATING CODE CARD (≥1280px only)
     ═══════════════════════════════════════════════════ */
  function initCodeCard() {
    if (window.innerWidth < 1600) return;

    var _jh = (window.__portfolioJSON && window.__portfolioJSON.home) || {};
    var lines = [
      { type: 'kw',   txt: 'var' },
      { type: 'name', txt: ' developer' },
      { type: 'op',   txt: ' = new ' },
      { type: 'type', txt: 'Developer' },
      { type: 'op',   txt: ' {' },
      null,
      { type: 'prop', txt: '  Name',        val: '"' + (_jh.name || 'Phat Nguyen Tan') + '"' },
      { type: 'prop', txt: '  Alias',        val: '"' + (_jh.alias || 'seeZ') + '"' },
      { type: 'prop', txt: '  Role',         val: '"' + (_jh.role || '.NET Web Developer') + '"' },
      { type: 'prop', txt: '  Experience',   val: '"' + (_jh.experience || '5.5 years') + '"' },
      { type: 'prop', txt: '  Stack',        val: JSON.stringify(_jh.stack || ['C#', 'ASP.NET', 'React']) },
      { type: 'prop', txt: '  Location',     val: '"' + (_jh.location || 'Ho Chi Minh City') + '"' },
      { type: 'prop', txt: '  Available',    val: String(_jh.available !== undefined ? _jh.available : true), last: true },
      null,
      { type: 'op',   txt: (_jh.codeCardFilename ? '/* ' + _jh.codeCardFilename + ' */' : '') + '};' }
    ];

    function buildLine(item) {
      if (!item) return '<div class="he-code-empty"></div>';
      if (item.type === 'prop') {
        return '<div class="he-code-line">' +
          '<span class="he-c-prop">' + item.txt + '</span>' +
          '<span class="he-c-op"> = </span>' +
          '<span class="he-c-val">' + item.val + '</span>' +
          (item.last ? '' : '<span class="he-c-op">,</span>') +
          '</div>';
      }
      var map = { kw: 'he-c-kw', name: 'he-c-name', op: 'he-c-op', type: 'he-c-type' };
      return '<div class="he-code-line"><span class="' + (map[item.type] || '') + '">' + item.txt + '</span></div>';
    }

    var bodyHtml = lines.map(buildLine).join('');

    var card = make('div', 'he-code-card',
      '<div class="he-code-titlebar">' +
        '<span class="he-dot he-dot--red"></span>' +
        '<span class="he-dot he-dot--yellow"></span>' +
        '<span class="he-dot he-dot--green"></span>' +
        '<span class="he-code-filename">developer.cs</span>' +
      '</div>' +
      '<div class="he-code-body">' + bodyHtml + '</div>'
    );

    document.body.appendChild(card);

    /* ── Minimize / restore on yellow dot click ── */
    /* ── Titlebar: click = minimize/restore · drag = reposition ── */
    var titlebar = card.querySelector('.he-code-titlebar');
    titlebar.style.cursor = 'pointer';

    var dragging = false, didDrag = false;
    var startX, startY, origLeft, origTop;

    /* Resolve initial CSS position to px so we can offset from it */
    function resolveInitialPos() {
      var r = card.getBoundingClientRect();
      card.style.animation  = 'none';
      card.style.transform  = 'none';
      card.style.right      = 'auto';
      card.style.bottom     = 'auto';
      card.style.left       = r.left + 'px';
      card.style.top        = r.top  + 'px';
    }
    var posResolved = false;

    titlebar.addEventListener('mousedown', function (e) {
      if (!posResolved) { resolveInitialPos(); posResolved = true; }
      dragging  = true;
      didDrag   = false;
      startX    = e.clientX;
      startY    = e.clientY;
      origLeft  = parseFloat(card.style.left);
      origTop   = parseFloat(card.style.top);
      card.style.userSelect = 'none';
      card.style.animation  = 'none';
      e.preventDefault();
    });

    document.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      if (!didDrag && Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
      didDrag = true;
      titlebar.style.cursor = 'grabbing';
      var newLeft = origLeft + dx;
      var newTop  = origTop  + dy;
      /* Clamp inside viewport */
      newLeft = Math.max(0, Math.min(newLeft, window.innerWidth  - card.offsetWidth));
      newTop  = Math.max(0, Math.min(newTop,  window.innerHeight - card.offsetHeight));
      card.style.left = newLeft + 'px';
      card.style.top  = newTop  + 'px';
    });

    document.addEventListener('mouseup', function () {
      if (!dragging) return;
      dragging = false;
      titlebar.style.cursor = 'pointer';
      card.style.userSelect = '';
      /* Pure click (no drag) → toggle minimize */
      if (!didDrag) {
        var isMini = card.classList.toggle('he-code-card--minimized');
        if (isMini) {
          /* Snap to bottom-left when minimizing */
          card.style.animation = 'none';
          card.style.transform = 'none';
          card.style.right  = 'auto';
          card.style.bottom = 'auto';
          card.style.left   = '32px';
          card.style.top    = (window.innerHeight - card.offsetHeight - 90) + 'px';
          posResolved = true;
        } else {
          /* Restore: reset to CSS default (bottom-right) */
          card.style.left = ''; card.style.top = '';
          card.style.right = ''; card.style.bottom = '';
          card.style.animation = ''; card.style.transform = '';
          posResolved = false;
        }
      }
    });

    /* Show only on Home section; hide on all other pages */
    function updateCardVisibility() {
      var homePage = document.querySelector('#home');
      var isHome   = homePage && homePage.classList.contains('page--current');
      if (isHome && window.innerWidth >= 1600) {
        /* Reset dragged position back to CSS default when returning to Home */
        if (card.style.left) {
          card.style.left = ''; card.style.top = ''; card.style.right = ''; card.style.bottom = '';
          card.style.animation = ''; card.style.transform = '';
          posResolved = false;
        }
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    }

    var pageObserver = new MutationObserver(updateCardVisibility);
    document.querySelectorAll('.page').forEach(function (p) {
      pageObserver.observe(p, { attributes: true, attributeFilter: ['class'] });
    });
    window.addEventListener('resize', updateCardVisibility);
    updateCardVisibility();
  }

  /* ═══════════════════════════════════════════════════
     5. TECH STACK HIGHLIGHT — categorized keyword grid
     ═══════════════════════════════════════════════════ */
  function initTechStack() {
    /* Find the button — insert the grid just before it */
    var btn = $('#link-about');
    if (!btn) return;

    var _jd = window.__portfolioJSON;
    var categories = (_jd && _jd.homeTechStack) || [
      {
        color: 'blue',
        techs: [
          { name: '.NET 8',           primary: true  },
          { name: 'C#',               primary: true  },
          { name: 'ASP.NET Core',     primary: true  },
          { name: 'Web API',          primary: false },
          { name: 'Entity Framework', primary: false },
          { name: 'SignalR',          primary: false },
          { name: 'Microservices',    primary: false },
          { name: 'gRPC',             primary: false },
          { name: 'MediatR',          primary: false },
          { name: 'AutoMapper',       primary: false }
        ]
      },
      {
        color: 'sky',
        techs: [
          { name: 'ReactJS',      primary: true  },
          { name: 'Redux',        primary: false },
          { name: 'TypeScript',   primary: true  },
          { name: 'JavaScript',   primary: false },
          { name: 'Next.js',      primary: false },
          { name: 'Tailwind CSS', primary: false },
          { name: 'HTML5',        primary: false },
          { name: 'CSS3',         primary: false }
        ]
      },
      {
        color: 'purple',
        techs: [
          { name: 'MS SQL',       primary: true  },
          { name: 'PostgreSQL',   primary: true  },
          { name: 'MongoDB',      primary: true  },
          { name: 'Redis',        primary: false },
          { name: 'Elasticsearch',primary: false },
          { name: 'SQLite',       primary: false }
        ]
      }
    ];

    function buildRow(cat) {
      var pills = cat.techs.map(function (t) {
        var cls = 'he-ts-pill he-ts-pill--' + cat.color + (t.primary ? ' he-ts-pill--primary' : '');
        return '<span class="' + cls + '">' + t.name + '</span>';
      }).join('');

      return '<div class="he-ts-row"><span class="he-ts-pills">' + pills + '</span></div>';
    }

    var html = categories.map(buildRow).join('');
    var wrap = make('div', 'he-tech-stack', html);

    btn.parentNode.insertBefore(wrap, btn);

    /* Drag-to-scroll on each pills row */
    wrap.querySelectorAll('.he-ts-pills').forEach(function (el) {
      var isDown = false, startX, scrollLeft;
      el.style.cursor = 'grab';
      el.addEventListener('mousedown', function (e) {
        isDown    = true;
        startX    = e.clientX;
        scrollLeft = el.scrollLeft;
        el.style.cursor = 'grabbing';
        el.classList.add('is-dragging');
        e.preventDefault();
      });
      document.addEventListener('mouseup', function () {
        if (!isDown) return;
        isDown = false;
        el.style.cursor = 'grab';
        el.classList.remove('is-dragging');
      });
      document.addEventListener('mousemove', function (e) {
        if (!isDown) return;
        el.scrollLeft = scrollLeft - (e.clientX - startX);
      });
    });
  }

  /* ═══════════════════════════════════════════════════
     6. HOME LAYOUT RESTRUCTURE
        - Replace 3 long paragraphs with 1 short intro
        - Insert "seeking" line after tech stack
        - Wrap all prose words in .he-word spans (for FX)
     ═══════════════════════════════════════════════════ */
  function initHomeLayout() {
    var contentWrap = $('#home .mx-auto.max-w-550, #home .mx-auto.max-w-450');
    if (!contentWrap) return;

    /* Capture old paragraph texts BEFORE removing them */
    var savedParaTexts = [];
    var paras = contentWrap.querySelectorAll('p');
    paras.forEach(function (p) {
      savedParaTexts.push(p.innerHTML);
      p.parentNode.removeChild(p);
    });

    var h1 = contentWrap.querySelector('h1');
    var techStack = contentWrap.querySelector('.he-tech-stack');
    var btn = $('#link-about');
    if (!h1 || !techStack || !btn) return;

    /* ── Short intro paragraph ── */
    var _homeData = (window.__portfolioJSON && window.__portfolioJSON.home) || {};
    var introText = _homeData.intro || '.NET developer · 5 years building web systems with C#, ASP.NET Core, ReactJS and cloud-native tools. I write clean APIs, ship real products, and care about maintainable code.';
    var intro = make('p', 'he-intro');
    intro.setAttribute('data-fx', 'words');
    intro.innerHTML = wrapWords(introText);

    /* ── Seeking line ── */
    var seekText = _homeData.seek || 'Open to full-time & freelance roles — .NET / Full-Stack / Remote';
    var seek = make('p', 'he-seek');
    seek.setAttribute('data-fx', 'words');
    seek.innerHTML = '<span class="he-seek-dot"></span>' + wrapWords(seekText);

    /* Drag-to-scroll on seek line */
    (function (el) {
      var isDown = false, startX, scrollLeft;
      el.addEventListener('mousedown', function (e) {
        isDown = true; startX = e.clientX; scrollLeft = el.scrollLeft;
        el.classList.add('is-dragging'); e.preventDefault();
      });
      document.addEventListener('mouseup', function () {
        if (!isDown) return; isDown = false; el.classList.remove('is-dragging');
      });
      document.addEventListener('mousemove', function (e) {
        if (!isDown) return; el.scrollLeft = scrollLeft - (e.clientX - startX);
      });
    }(seek));

    /* Insert: intro after h1, seek after tech stack, before button */
    h1.parentNode.insertBefore(intro, h1.nextSibling);

    /* Move tech stack immediately after intro (it may already be before btn) */
    intro.parentNode.insertBefore(techStack, intro.nextSibling);

    /* Seek goes between tech stack and button */
    btn.parentNode.insertBefore(seek, btn);

    return savedParaTexts;
  }

  /* Wrap each word in a <span class="he-word"> */
  function wrapWords(text) {
    return text.split(/(\s+)/).map(function (chunk) {
      if (/^\s+$/.test(chunk)) return chunk;
      return '<span class="he-word">' + chunk + '</span>';
    }).join('');
  }

  /* ═══════════════════════════════════════════════════
     6b. ABOUT BIO — inject old home paragraphs after CV button
     ═══════════════════════════════════════════════════ */
  function initAboutBio(texts) {
    if (!texts || !texts.length) return;
    var about = $('#about');
    if (!about) return;

    var cvBtn = about.querySelector('a[href*="cv-dev.pdf"]');
    if (!cvBtn) return;

    var bio = make('div', 'he-about-bio');
    texts.forEach(function (html) {
      var p = make('p', 'he-about-para');
      p.innerHTML = html;
      bio.appendChild(p);
    });

    /* Insert BEFORE the CV button so bio appears above download */
    cvBtn.parentNode.insertBefore(bio, cvBtn);
  }

  /* ═══════════════════════════════════════════════════
     7. TITLE SPLIT — separate "Phat Nguyen" and "seeZ"
        so each can have its own neon hover effect
     ═══════════════════════════════════════════════════ */
  function initTitleSplit() {
    var h1 = $('#home h1');
    if (!h1) return;

    /* The raw text node is the first child: "Phat Nguyen - seeZ" */
    var textNode = null;
    h1.childNodes.forEach(function (n) {
      if (n.nodeType === 3 && n.textContent.trim().length > 0) textNode = n;
    });
    if (!textNode) return;

    var raw = textNode.textContent; /* "Phat Nguyen - seeZ" */
    /* Split on " - " or " — " */
    var parts = raw.split(/ [-—] /);
    if (parts.length < 2) return;

    var _jh = (window.__portfolioJSON && window.__portfolioJSON.home) || {};
    var frag = document.createDocumentFragment();
    var nameSpan  = make('span', 'he-name',  _jh.name  || parts[0].trim());
    var sepSpan   = make('span', 'he-sep',   ' — ');
    var aliasSpan = make('span', 'he-alias', _jh.alias || parts[1].trim());
    frag.appendChild(nameSpan);
    frag.appendChild(sepSpan);
    frag.appendChild(aliasSpan);

    h1.replaceChild(frag, textNode);
  }

  /* ═══════════════════════════════════════════════════
     8. MOUSE-PROXIMITY TEXT NEON GLOW
        - Words always stay bright (no dimming)
        - Words near cursor get additive neon text-shadow
        - Soft spotlight follows cursor
        - Disabled on touch devices
     ═══════════════════════════════════════════════════ */
  function initTextMouseFX() {
    /* Skip on touch-only devices */
    if (window.matchMedia('(pointer: coarse)').matches) return;

    var home = $('#home');
    if (!home) return;

    /* Create spotlight overlay */
    var spotlight = make('div', 'he-spotlight');
    home.appendChild(spotlight);

    var RADIUS = 140;   /* px — words within this radius get neon */
    var active = false;
    var rafId  = null;
    var mouseX = -9999;
    var mouseY = -9999;

    function getWords() {
      return home.querySelectorAll('.he-word');
    }

    function applyFX(mx, my) {
      spotlight.style.left = mx + 'px';
      spotlight.style.top  = my + 'px';

      var words = getWords();
      words.forEach(function (w) {
        var r  = w.getBoundingClientRect();
        var cx = r.left + r.width  / 2;
        var cy = r.top  + r.height / 2;
        var dist = Math.sqrt((cx - mx) * (cx - mx) + (cy - my) * (cy - my));
        var t = Math.max(0, Math.min(1, 1 - dist / RADIUS));

        if (t > 0.05) {
          var intensity = t * 14;
          var alpha     = (t * 0.65).toFixed(2);
          w.style.textShadow =
            '0 0 ' + Math.round(intensity) + 'px rgba(0,170,255,' + alpha + '),' +
            '0 0 ' + Math.round(intensity * 2) + 'px rgba(0,87,184,' + (t * 0.30).toFixed(2) + ')';
          w.style.color = 'rgba(255,255,255,' + Math.min(1, 0.88 + t * 0.12).toFixed(2) + ')';
        } else {
          w.style.textShadow = '';
          w.style.color      = '';
        }
      });
    }

    function resetFX() {
      spotlight.style.opacity = '0';
      var words = getWords();
      words.forEach(function (w) {
        w.style.textShadow = '';
        w.style.color      = '';
      });
    }

    home.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!active) {
        active = true;
        spotlight.style.opacity = '1';
      }
      if (!rafId) {
        rafId = requestAnimationFrame(function () {
          rafId = null;
          applyFX(mouseX, mouseY);
        });
      }
    });

    home.addEventListener('mouseleave', function () {
      active = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      resetFX();
    });
  }

  /* ═══════════════════════════════════════════════════
     9. ABOUT INFO FIELD EFFECTS
        - Tag each info row with .he-info-row
        - Tag label/value spans
        - Stagger entrance animation
     ═══════════════════════════════════════════════════ */
  function initAboutInfoFX() {
    var about = $('#about');
    if (!about) return;

    /* Find the flex wrapper holding the two info columns */
    var infoWrap = about.querySelector('.flex.justify-between');
    if (!infoWrap) return;
    var cols = infoWrap.querySelectorAll(':scope > div');
    if (!cols.length) return;

    var delay = 0;
    cols.forEach(function (col) {
      /* Each direct child div is one info row */
      var rows = col.querySelectorAll(':scope > div');
      rows.forEach(function (row) {
        row.classList.add('he-info-row');
        var spans = row.querySelectorAll('span');
        /* Tag label — first span */
        if (spans.length >= 1) spans[0].classList.add('he-info-label');
        /* Tag value — last span */
        if (spans.length >= 2) spans[spans.length - 1].classList.add('he-info-val');
        /* Staggered entrance */
        row.style.animationDelay = delay + 'ms';
        row.classList.add('he-info-row--anim');
        delay += 55;
      });
    });
  }

  /* ═══════════════════════════════════════════════════
     10. ABOUT SECTION DIVIDERS — neon gradient lines
         between: heading/info · info/bio · bio/cv-btn
     ═══════════════════════════════════════════════════ */
  function initAboutDividers() {
    var about = $('#about');
    if (!about) return;
    var leftCol = about.querySelector('.xl\\:basis-1\\/2, [class*="basis-5/12"]');
    if (!leftCol) return;

    function neonLine() { return make('hr', 'he-neon-line'); }

    /* 1. Between H3 title and info grid */
    var infoGrid = leftCol.querySelector('.flex.justify-between');
    if (infoGrid) leftCol.insertBefore(neonLine(), infoGrid);

    /* 2. Between info grid and bio description */
    var bio = leftCol.querySelector('.he-about-bio');
    if (bio) leftCol.insertBefore(neonLine(), bio);

    /* 3. Between bio and CV download button */
    var cvBtn = leftCol.querySelector('a[href*="cv-dev.pdf"]');
    if (cvBtn) leftCol.insertBefore(neonLine(), cvBtn);
  }

  /* ═══════════════════════════════════════════════════
     11. SECTION TITLE WORD SPLIT
         Wraps each text-node word in the section h2s
         in a <span class="he-h2-word"> so CSS :hover
         can light individual words instead of the whole line.
         The .text-accent span (coloured word) is left intact.
     ═══════════════════════════════════════════════════ */
  function initSectionTitleWords() {
    var sections = ['about', 'portfolio', 'contact'];
    sections.forEach(function (id) {
      var h2 = document.querySelector('#' + id + ' h2.text-fs-56');
      if (!h2) return;

      /* Collect child nodes: mix of text nodes and the .text-accent span */
      var nodes = Array.prototype.slice.call(h2.childNodes);
      /* Clear h2, re-insert with text-node words wrapped */
      h2.innerHTML = '';
      nodes.forEach(function (node) {
        if (node.nodeType === 3) {
          /* Text node — split into words */
          var raw = node.textContent;
          raw.split(/( +)/).forEach(function (chunk) {
            if (/^ +$/.test(chunk)) {
              h2.appendChild(document.createTextNode(chunk));
            } else if (chunk.length) {
              var span = document.createElement('span');
              span.className = 'he-h2-word';
              span.textContent = chunk;
              h2.appendChild(span);
            }
          });
        } else {
          /* Element node (.text-accent etc.) — re-append as-is */
          var clone = node.cloneNode(true);
          /* Add he-h2-word class to the accent span too so it gets the same hover base */
          if (clone.nodeType === 1) clone.classList.add('he-h2-word', 'he-h2-word--accent');
          h2.appendChild(clone);
        }
      });
    });
  }

  /* ═══════════════════════════════════════════════════
     12. WORK EXPERIENCE TIMELINE
         Two tabbed panels (Work / Education) injected
         below the "my skills" section in #about.
         IntersectionObserver scroll-reveal per panel.
         Hover → card highlight glow.
     ═══════════════════════════════════════════════════ */
  function initWorkTimeline() {
    var about = $('#about');
    if (!about) return;

    var mainContainer = about.querySelector('[class*="max-w-1140"], [class*="max-w-960"]');
    if (!mainContainer) return;

    /* Remove any previously injected timeline (idempotent) */
    var existing = mainContainer.querySelector('.he-tl-tabbed, .he-timeline');
    if (existing) existing.parentNode.removeChild(existing);

    /* ── Build from JSON ── */
    var _jd = window.__portfolioJSON;
    var _defColors = ['blue', 'teal', 'purple', 'sky', 'orange', 'red'];

    function makeJobEntries(expArr) {
      return expArr.map(function (e, i) {
        var pts = (e.points && e.points.length) ? e.points : [];
        if (!pts.length) pts.push('See About section for full details');
        var feVal = (e.fe && e.fe.trim() && e.fe.trim().toLowerCase() !== 'none') ? e.fe.trim() : '';
        return {
          period:  e.date,
          company: e.title,    /* title   = company name */
          role:    e.company,  /* company = job role     */
          color:   e.color || _defColors[i % _defColors.length],
          project: e.projectName || '',
          summary: e.desc || '',
          be:      e.be    ? e.be.trim()    : '',
          fe:      feVal,
          db:      e.db    ? e.db.trim()    : '',
          cloud:   e.clound ? e.clound.trim() : '',
          desc:    pts
        };
      });
    }

    function makeEduEntries(eduArr) {
      return eduArr.map(function (e, i) {
        var pts = (e.points && e.points.length) ? e.points : (e.desc ? [e.desc] : ['—']);
        return {
          period:  e.date,
          company: e.title,
          role:    e.unv || '',
          color:   e.color || _defColors[i % _defColors.length],
          desc:    pts
        };
      });
    }

    var jobs = (_jd && _jd.experience && _jd.experience.length)
      ? makeJobEntries(_jd.experience)
      : [
          { period: '2025 – Now',  company: 'VIB',                         role: '.NET Developer', color: 'blue',   desc: ['Senior .NET developer'] },
          { period: '2024 – 2025', company: 'iZOTA',                        role: '.NET Developer', color: 'teal',   desc: ['Microservice .NET 8 development'] },
          { period: '2024',        company: 'Freelancer',                    role: '.NET Developer', color: 'purple', desc: ['Freelance .NET Web API project'] },
          { period: '2022 – 2023', company: 'Stepmedia Software',            role: '.NET Developer', color: 'sky',    desc: ['Deloitte Levvia application'] },
          { period: '2020 – 2022', company: 'Global Vertical Innovations',   role: '.NET Developer', color: 'orange', desc: ['RIVIR E-Commerce platform'] },
          { period: '2018 – 2020', company: 'FPT Software HCM',              role: '.NET Developer', color: 'red',    desc: ['M35 Web ERP project'] }
        ];

    var edu = (_jd && _jd.education && _jd.education.length)
      ? makeEduEntries(_jd.education)
      : [
          { period: '2015 – 2020',       company: 'UIT — University of Information Technology', role: 'Bachelor of Software Engineering', color: 'blue',  desc: ['Vietnam National University (VNU-HCM)'] },
          { period: 'Jun – Oct 2018',    company: 'FPT Software Academy',                        role: 'Fresher .NET Certificate (C135)',  color: 'teal',  desc: ['Intensive .NET development training'] }
        ];

    /* ── Build tabbed wrapper ── */
    var wrapper = make('div', 'he-tl-tabbed');

    /* Tab bar */
    var tabBar = make('div', 'he-tl-tabbar');
    var btnWork = make('button', 'he-tl-tab he-tl-tab--active');
    btnWork.setAttribute('data-tab', 'work');
    btnWork.innerHTML = '<span class="he-tl-tab-icon">&#9674;</span> Work Experience';
    var btnEdu = make('button', 'he-tl-tab');
    btnEdu.setAttribute('data-tab', 'edu');
    btnEdu.innerHTML = '<span class="he-tl-tab-icon">&#9675;</span> Education';
    tabBar.appendChild(btnWork);
    tabBar.appendChild(btnEdu);
    wrapper.appendChild(tabBar);

    /* Build one timeline panel */
    function buildPanel(panelId, entries, active) {
      var panel = make('div', 'he-tl-panel' + (active ? ' he-tl-panel--active' : ''));
      panel.setAttribute('data-panel', panelId);
      var tl = make('div', 'he-timeline');
      entries.forEach(function (entry, i) {
        var item = make('div', 'he-tl-item');
        item.setAttribute('data-tl-index', String(i));
        item.innerHTML = buildTlItemHTML(entry);
        tl.appendChild(item);
      });
      panel.appendChild(tl);
      return panel;
    }

    var workPanel = buildPanel('work', jobs, true);
    var eduPanel  = buildPanel('edu',  edu,  false);
    wrapper.appendChild(workPanel);
    wrapper.appendChild(eduPanel);

    /* Tab switching */
    function activateTab(tabName) {
      tabBar.querySelectorAll('.he-tl-tab').forEach(function (btn) {
        btn.classList.toggle('he-tl-tab--active', btn.getAttribute('data-tab') === tabName);
      });
      wrapper.querySelectorAll('.he-tl-panel').forEach(function (panel) {
        var isActive = panel.getAttribute('data-panel') === tabName;
        panel.classList.toggle('he-tl-panel--active', isActive);
        /* Reveal items in newly shown panel */
        if (isActive) {
          panel.querySelectorAll('.he-tl-item:not(.he-tl-item--visible)').forEach(function (el, idx) {
            setTimeout(function () { el.classList.add('he-tl-item--visible'); }, idx * 130);
          });
        }
      });
    }

    tabBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.he-tl-tab');
      if (btn) activateTab(btn.getAttribute('data-tab'));
    });

    /* ── Insert after "my skills" section ── */
    var skillsH3 = null;
    Array.from(mainContainer.children).forEach(function (el) {
      if (el.tagName === 'H3' && /my skills/i.test(el.textContent)) skillsH3 = el;
    });

    var anchor = (skillsH3 && skillsH3.nextElementSibling) ? skillsH3.nextElementSibling : null;
    var hr = document.createElement('hr');
    hr.className = 'border-t border-solid border-t-black-3 mx-auto max-w-40prcent mt-35 mb-55';

    if (anchor && anchor.nextSibling) {
      mainContainer.insertBefore(hr, anchor.nextSibling);
      mainContainer.insertBefore(wrapper, hr.nextSibling);
    } else {
      mainContainer.appendChild(hr);
      mainContainer.appendChild(wrapper);
    }

    /* ── Remove old "experience & education" template section ── */
    Array.prototype.slice.call(mainContainer.children).forEach(function (el) {
      if (el.tagName === 'H3' && /experience|education/i.test(el.textContent)) {
        var prev = el.previousElementSibling;
        var next = el.nextElementSibling;
        if (prev && prev.tagName === 'HR') prev.parentNode.removeChild(prev);
        if (next && next.tagName === 'DIV') next.parentNode.removeChild(next);
        el.parentNode.removeChild(el);
      }
    });

    /* ── IntersectionObserver for the default (work) panel ── */
    setupTlObserver(workPanel.querySelectorAll('.he-tl-item'));
  }

  function setupTlObserver(items) {
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('he-tl-item--visible'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var idx = parseInt(entry.target.getAttribute('data-tl-index') || '0', 10);
        setTimeout(function () { entry.target.classList.add('he-tl-item--visible'); }, idx * 130);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.10 });
    items.forEach(function (el) { obs.observe(el); });
  }

  /* Helper: build the inner HTML for a timeline item */
  function buildTlItemHTML(entry) {
    var descItems = entry.desc.map(function (d) { return '<li>' + d + '</li>'; }).join('');

    /* Project name row */
    var projectHtml = entry.project
      ? '<div class="he-tl-project"><span class="he-tl-project-icon">&#9670;</span>' + entry.project + '</div>'
      : '';

    /* Summary paragraph */
    var summaryHtml = entry.summary
      ? '<div class="he-tl-summary">' + entry.summary + '</div>'
      : '';

    /* Tech stack — one line per category, rendered as chip pills */
    function techLine(raw) {
      if (!raw) return '';
      return raw.split(/[,，]/).map(function (t) {
        var s = t.trim();
        return s ? '<span class="he-tl-chip">' + s + '</span>' : '';
      }).join('');
    }
    var techLines = '';
    if (entry.be)    techLines += '<div class="he-tl-tech-line">' + techLine(entry.be)    + '</div>';
    if (entry.fe)    techLines += '<div class="he-tl-tech-line">' + techLine(entry.fe)    + '</div>';
    if (entry.db)    techLines += '<div class="he-tl-tech-line">' + techLine(entry.db)    + '</div>';
    if (entry.cloud) techLines += '<div class="he-tl-tech-line">' + techLine(entry.cloud) + '</div>';
    var techHtml = techLines ? '<div class="he-tl-tech">' + techLines + '</div>' : '';

    return '<div class="he-tl-dot he-tl-dot--' + entry.color + '"></div>' +
      '<div class="he-tl-card">' +
        '<div class="he-tl-top">' +
          '<span class="he-tl-period">' + entry.period + '</span>' +
          '<span class="he-tl-company he-tl-company--' + entry.color + '">' + entry.company + '</span>' +
        '</div>' +
        '<div class="he-tl-role">' + entry.role + '</div>' +
        projectHtml +
        summaryHtml +
        techHtml +
        '<ul class="he-tl-desc">' + descItems + '</ul>' +
      '</div>';
  }

  /* ═══════════════════════════════════════════════════
     PROFILE PHOTOS — swap all <img> that use the old
     fallback names with the JSON-specified paths.
     Convention: photo = "profile-<slug>.jpg"
                 photoMobile = "profile-mobile-<slug>.jpg"
     ═══════════════════════════════════════════════════ */
  function initProfilePhotos() {
    var _jd = window.__portfolioJSON;
    if (!_jd || !_jd.home) return;
    var desktop = _jd.home.photo       || '';
    var mobile  = _jd.home.photoMobile || '';
    if (!desktop && !mobile) return;
    document.querySelectorAll('img').forEach(function (img) {
      var src = img.getAttribute('src') || '';
      if (desktop && /dark\.jpg$/i.test(src))           img.src = desktop;
      if (mobile  && /dark-img-mobile\.jpg$/i.test(src)) img.src = mobile;
    });
  }

  /* ═══════════════════════════════════════════════════
     13. CONTACT ME BUTTON — beside Download CV in About
         Clicking navigates to the Contact page
     ═══════════════════════════════════════════════════ */
  function initContactMeBtn() {
    var about = $('#about');
    if (!about) return;
    var cvBtn = about.querySelector('a[href*="cv-dev.pdf"]');
    if (!cvBtn) return;

    /* Mirror the exact DOM structure of the home "more about me" button */
    var btn = make('div',
      'he-contact-btn button group cursor-pointer overflow-hidden inline-block leading-lh-1.4 rounded-30 ' +
      'text-ellipsis text-center align-middle select-none transition-all duration-250 ease-in-out uppercase ' +
      'no-underline relative z-10 py-16 pr-70 pl-35 text-fs-15 font-semibold text-white bg-transparent outline-0 ' +
      'before:absolute before:-z-10 before:left-0 before:right-0 before:top-0 before:bottom-0 ' +
      'before:translate-x-full hover:before:translate-x-0 before:transition before:duration-300 before:ease-out');
    btn.innerHTML =
      '<span class="relative z-20 text-white">contact me</span>' +
      '<span class="absolute -right-px bottom-0 w-55 h-55 flex items-center justify-center rounded-full text-white text-fs-19 fa fa-arrow-right bg-accent"></span>';

    btn.addEventListener('click', function () {
      var contactNav = document.querySelectorAll('.desktop-nav-element')[3];
      if (contactNav) contactNav.click();
    });

    /* Wrap cvBtn + contactBtn in a flex row so they sit on the same baseline */
    var row = make('div', 'he-btn-row');
    cvBtn.parentNode.insertBefore(row, cvBtn);
    row.appendChild(cvBtn);
    row.appendChild(btn);
  }

  /* ── About image layout ─────────────────────────────
     Large viewport  : photo sits LEFT of the info grid
     Narrow viewport : photo stacks above the info grid
     Threshold controlled by CSS (.he-about-imgrow breakpoint)
  ─────────────────────────────────────────────────── */
  function initAboutImageLayout() {
    var about = $('#about');
    if (!about) return;

    var leftCol = about.querySelector('.xl\\:basis-1\\/2');
    if (!leftCol) return;

    var img = leftCol.querySelector('img');
    var infoGrid = leftCol.querySelector('.flex.justify-between');
    if (!img || !infoGrid) return;

    /* Remove Tailwind sizing / centering classes — CSS will handle it */
    ['w-230', 'h-230', 'mb-25', 'mx-auto', 'rounded-full',
     'border-4', 'border-solid', 'border-black-3', 'hidden', 'xs:block']
      .forEach(function (cls) { img.classList.remove(cls); });

    /* Wrap image + infoGrid in a single flex container */
    var wrapper = make('div', 'he-about-imgrow');
    infoGrid.parentNode.insertBefore(wrapper, infoGrid);
    wrapper.appendChild(img);
    wrapper.appendChild(infoGrid);
  }

  /* ── Hobbies section ─────────────────────────────────
     Injected after the .he-tl-tabbed block at the bottom
     of the About left column.
  ─────────────────────────────────────────────────── */
  function initHobbies() {
    var tl = document.querySelector('.he-tl-tabbed');
    if (!tl) return;

    var _jd = window.__portfolioJSON;
    var hobbies = (_jd && _jd.hobbies) || [
      { icon: '⚽', label: 'Football',  desc: 'Weekend 5-a-side & watching Premier League' },
      { icon: '🎮', label: 'Gaming',    desc: 'Strategy & open-world RPGs on PC' },
      { icon: '🥊', label: 'Boxing',    desc: 'Bag work & shadow boxing for fitness' }
    ];

    var cards = hobbies.map(function (h) {
      return (
        '<div class="he-hobby-card">' +
          '<span class="he-hobby-icon">' + h.icon + '</span>' +
          '<span class="he-hobby-label">' + h.label + '</span>' +
          '<span class="he-hobby-desc">' + h.desc + '</span>' +
        '</div>'
      );
    }).join('');

    var section = make('div', 'he-hobbies');
    section.innerHTML =
      '<div class="he-hobbies-header">' +
        '<span class="he-hobbies-title">Hobbies &amp; Interests</span>' +
      '</div>' +
      '<div class="he-hobbies-grid">' + cards + '</div>';

    tl.parentNode.insertBefore(section, tl.nextSibling);
  }

  /* ── boot ─────────────────────────────────────────── */
  function boot() {
    /* Load portfolio.json once, then run all inits */
    fetch('assets/data/portfolio.json')
      .then(function (res) { return res.json(); })
      .then(function (data) { window.__portfolioJSON = data; bootInits(); })
      .catch(function () { bootInits(); });
  }

  function bootInits() {
    initTypewriter();
    initAvailableBadge();
    initCodeCard();
    initTechStack();
    var oldParaTexts = initHomeLayout();
    initAboutBio(oldParaTexts);
    initAboutDividers();
    initTitleSplit();
    initTextMouseFX();
    initAboutInfoFX();
    initSectionTitleWords();
    initAboutImageLayout();
    initContactMeBtn();
    initContactNeon();
    initWorkTimeline();
    initHobbies();
    initFooter();
    initProfilePhotos();
  }

  /* ═══════════════════════════════════════════════════
     Contact neon hover — tag each "via" item
     ═══════════════════════════════════════════════════ */
  function initContactNeon() {
    var heading = Array.from(document.querySelectorAll('#contact h3'))
      .find(function (h) { return h.textContent.includes('Contact to me'); });
    if (!heading) return;
    var el = heading.nextElementSibling;
    while (el && el.tagName !== 'UL') {
      el.classList.add('he-contact-item');
      el = el.nextElementSibling;
    }
  }

  /* ═══════════════════════════════════════════════════
     14. FOOTER — injected into all pages except #home
         Contains: name, tagline, contact info, socials,
         copyright line
     ═══════════════════════════════════════════════════ */
  function initFooter() {
    var pages = document.querySelectorAll('.page:not(#home)');
    if (!pages.length) return;

    var _jd  = window.__portfolioJSON || {};
    var _jft = _jd.footer || {};
    var _ftName  = _jft.name      || 'Phat Nguyen Tan';
    var _ftTag   = _jft.tagline   || '.NET Web Developer — Ho Chi Minh City';
    var _ftEmail = _jft.email     || 'nguyentanphatuit@mail.com';
    var _ftPhone = _jft.phone     || '(+84) 869 164 648';
    var _ftCopy  = _jft.copyright || '2026 Phat Nguyen Tan. All rights reserved.';

    var _rawSocials = _jd.socialLinks || [
      { icon: 'fa fa-facebook', link: 'https://www.facebook.com/nguyentanphatuit/' },
      { icon: 'fa fa-linkedin', link: 'https://www.linkedin.com/in/seeZ/' },
      { icon: 'fa fa-github',   link: 'https://github.com/nguyentanphataka' }
    ];
    var socials = _rawSocials.map(function (s) {
      var raw = s.icon.replace('fa fa-', '');
      var label = raw.charAt(0).toUpperCase() + raw.slice(1);
      return { href: s.link, icon: s.icon, label: label };
    });

    var socialHtml = socials.map(function (s) {
      return '<a href="' + s.href + '" target="_blank" rel="noopener noreferrer" ' +
             'class="he-ft-social" aria-label="' + s.label + '">' +
             '<i class="' + s.icon + '"></i></a>';
    }).join('');

    var _ftPhoneTel = _ftPhone.replace(/[^+\d]/g, '');
    var html =
      '<div class="he-ft-inner">' +
        '<div class="he-ft-left">' +
          '<span class="he-ft-name">' + _ftName + '</span>' +
          '<span class="he-ft-tagline">' + _ftTag + '</span>' +
        '</div>' +
        '<div class="he-ft-mid">' +
          '<a href="mailto:' + _ftEmail + '" class="he-ft-link">' +
            '<i class="fa fa-envelope-o"></i>' + _ftEmail + '</a>' +
          '<a href="tel:' + _ftPhoneTel + '" class="he-ft-link">' +
            '<i class="fa fa-phone"></i>' + _ftPhone + '</a>' +
        '</div>' +
        '<div class="he-ft-right">' +
          '<div class="he-ft-socials">' + socialHtml + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="he-ft-bottom">' +
        '<span>&copy; ' + _ftCopy + '</span>' +
      '</div>';

    pages.forEach(function (page) {
      /* Remove any previously injected footer (idempotent) */
      var old = page.querySelector('.he-footer');
      if (old) old.parentNode.removeChild(old);

      var footer = make('footer', 'he-footer', html);
      page.appendChild(footer);
    });
  }

  /* Wait for React to finish mounting (hydration = ~800ms) */
  if (document.readyState === 'complete') {
    setTimeout(boot, 900);
  } else {
    window.addEventListener('load', function () { setTimeout(boot, 900); });
  }
})();
