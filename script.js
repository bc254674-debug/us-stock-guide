/* ================================================================
   script.js — 首页交互
   ================================================================ */

/* ---- 新手入门弹窗 ---- */
(function() {
  const btnBeginnerNav = document.getElementById('btnBeginnerNav');
  const btnBeginnerCta = document.getElementById('btnBeginnerCta');
  const modal = document.getElementById('modalBeginner');
  const btnClose = document.getElementById('btnCloseModal');
  const optionCards = document.querySelectorAll('.modal-option-card');

  function openModal(e) {
    e.preventDefault();
    modal.style.display = 'flex';
  }

  if (modal) {
    if (btnBeginnerNav) btnBeginnerNav.addEventListener('click', openModal);
    if (btnBeginnerCta) btnBeginnerCta.addEventListener('click', openModal);

    btnClose.addEventListener('click', function() {
      modal.style.display = 'none';
    });

    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });

    optionCards.forEach(function(card) {
      card.addEventListener('click', function() {
        const option = card.getAttribute('data-option');
        modal.style.display = 'none';
        if (option === 'beginner') {
          window.location.href = 'teaching.html';
        } else if (option === 'experienced') {
          window.location.href = 'learn.html';
        }
      });
    });
  }
})();

/* ---- 移动端菜单 ---- */
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
  });
});

/* ---- 导航栏滚动效果 ---- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    navbar.style.borderBottomColor = '#282c35';
  } else {
    navbar.style.borderBottomColor = '';
  }
});

/* ---- FAQ 折叠面板 ---- */
(function() {
  var faqItems = document.querySelectorAll('.faq-item');
  document.querySelectorAll('.faq-question').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var item = btn.parentElement;
      var isOpen = item.classList.contains('active');
      faqItems.forEach(function(faq) { faq.classList.remove('active'); });
      if (!isOpen) item.classList.add('active');
    });
  });
})();

/* ---- 模拟实时指数数据 ---- */
const indexData = {
  nasdaq:  { base: 18350, name: '纳斯达克综合指数', prefix: '' },
  sp500:   { base:  5850, name: '标普500', prefix: '' },
  dowjones:{ base: 42200, name: '道琼斯工业平均', prefix: '' }
};

function formatNumber(num) {
  if (num >= 10000) {
    return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function updateTickers() {
  Object.keys(indexData).forEach(key => {
    const data = indexData[key];
    const changePct = (Math.random() - 0.5) * 1.2;
    const current = data.base * (1 + changePct / 100);
    const change = current - data.base;

    const valueEl = document.getElementById(
      key === 'nasdaq' ? 'nasdaqValue' : key === 'sp500' ? 'sp500Value' : 'dowValue'
    );
    const changeEl = document.getElementById(
      key === 'nasdaq' ? 'nasdaqChange' : key === 'sp500' ? 'sp500Change' : 'dowChange'
    );

    if (valueEl) {
      valueEl.textContent = data.prefix + formatNumber(current);
    }
    if (changeEl) {
      const sign = change >= 0 ? '+' : '';
      changeEl.textContent = `${sign}${formatNumber(change)} (${sign}${changePct.toFixed(2)}%)`;
      changeEl.className = 'ticker-change ' + (change >= 0 ? 'up' : 'down');
    }
  });
}

/* ---- 行情卡片涨跌脉冲 ---- */
const tickerIdMap = { nasdaq: 'nasdaqChange', sp500: 'sp500Change', dowjones: 'dowChange' };
let prevChanges = { nasdaq: 0, sp500: 0, dowjones: 0 };

const origUpdateTickers = updateTickers;
updateTickers = function() {
  origUpdateTickers();
  ['nasdaq', 'sp500', 'dowjones'].forEach(function(key) {
    var el = document.getElementById(tickerIdMap[key]);
    if (!el) return;
    var isUp = el.classList.contains('up');
    var card = document.getElementById('ticker-' + key);
    if (!card) return;
    if (isUp && prevChanges[key] <= 0) { card.classList.remove('pulse-down'); card.classList.add('pulse-up'); }
    else if (!isUp && prevChanges[key] >= 0) { card.classList.remove('pulse-up'); card.classList.add('pulse-down'); }
    prevChanges[key] = isUp ? 1 : -1;
  });
};

updateTickers();
setInterval(updateTickers, 3000);

/* ---- 高亮当前导航项 (节流 + 预计算) ---- */
var allSections = document.querySelectorAll('section[id], header[id]');
var allNavLinks = document.querySelectorAll('.nav-links a');
var sectionTops = [];
var scrollTicking = false;

function computeSectionTops() {
  sectionTops = [];
  allSections.forEach(function(section) {
    sectionTops.push({ id: section.getAttribute('id'), top: section.offsetTop - 80 });
  });
}
computeSectionTops();
window.addEventListener('resize', computeSectionTops);

window.addEventListener('scroll', function() {
  if (!scrollTicking) {
    requestAnimationFrame(function() {
      var current = '';
      var scrollY = window.scrollY;
      for (var i = 0; i < sectionTops.length; i++) {
        if (scrollY >= sectionTops[i].top) current = sectionTops[i].id;
      }
      allNavLinks.forEach(function(link) {
        link.classList.toggle('nav-active', link.getAttribute('href') === '#' + current);
      });
      scrollTicking = false;
    });
    scrollTicking = true;
  }
});

/* ---- 滚动入场动画 (使用 CSS class 避免逐个设置 style) ---- */
(function() {
  var animateCards = document.querySelectorAll(
    '.hero-title, .hero-subtitle, .hero-desc, .hero-btn, .hero-badge,' +
    '.ticker-card, .info-card, .stat-card, .step-content, .faq-item,' +
    '.section-title, .section-intro, .compare-table, .compare-highlight,' +
    '.summary-box, .warning-box, .myth-box, .qstep, .etf-item,' +
    '.cards-row, .compare-visuals, .interactive-steps, .istep,' +
    '.beginner-stepper, .faq-list, .steps, .quick-steps'
  );

  if (animateCards.length > 0 && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    animateCards.forEach(function(card, i) {
      card.classList.add('anim-in');
      card.style.transitionDelay = (i % 3) * 0.08 + 's';
      observer.observe(card);
    });
  }
})();

/* ---- 市场状态检测 ---- */
(function() {
  var statusEl = document.getElementById('marketStatus');
  var statusText = document.getElementById('marketStatusText');
  if (!statusEl || !statusText) return;
  function updateMarketStatus() {
    var now = new Date();
    var utcDay = now.getUTCDay();
    var utcHour = now.getUTCHours();
    var utcMin = now.getUTCMinutes();
    var totalMin = utcHour * 60 + utcMin;
    // 美股: 周一至周五 14:30-21:00 UTC (夏令时9:30am-4pm ET)
    var isWeekday = utcDay >= 1 && utcDay <= 5;
    var isOpen = isWeekday && totalMin >= 870 && totalMin < 1260; // 14:30-21:00 UTC
    statusEl.className = 'market-status ' + (isOpen ? 'open' : 'closed');
    var dot = statusEl.querySelector('.status-dot');
    statusText.textContent = isOpen ? '🟢 市场交易中' : '🔴 市场已收盘';
  }
  updateMarketStatus();
  setInterval(updateMarketStatus, 60000);
})();

/* ---- 迷你走势图 ---- */
(function() {
  var sparkContainers = {
    nasdaq: document.getElementById('sparkNasdaq'),
    sp500: document.getElementById('sparkSp500'),
    dow: document.getElementById('sparkDow')
  };
  var sparkPatterns = {
    nasdaq: { base: 16, noise: 12, trend: 0.35 },
    sp500:  { base: 12, noise: 8, trend: 0.25 },
    dow:    { base: 10, noise: 6, trend: 0.18 }
  };
  Object.keys(sparkContainers).forEach(function(key) {
    var container = sparkContainers[key];
    if (!container) return;
    var pattern = sparkPatterns[key];
    var heights = [];
    var n = 24;
    var val = pattern.base;
    for (var i = 0; i < n; i++) {
      val += (Math.random() - 0.5) * pattern.noise + pattern.trend;
      val = Math.max(3, Math.min(36, val));
      heights.push(val);
    }
    var cls = key === 'nasdaq' ? 'nasdaq' : key === 'sp500' ? 'sp500' : 'dow';
    container.innerHTML = heights.map(function(h) {
      return '<span class="spark-bar ' + cls + '" style="height:' + h + 'px"></span>';
    }).join('');
  });
})();

/* ---- 投资性格测试 ---- */
(function() {
  var quiz = document.getElementById('personalityQuiz');
  if (!quiz) return;
  var selections = { risk: null, horizon: null, tech: null };

  quiz.querySelectorAll('.pq-opt').forEach(function(opt) {
    opt.addEventListener('click', function() {
      var group = this.parentElement;
      var key = group.getAttribute('data-pq');
      group.querySelectorAll('.pq-opt').forEach(function(o) { o.classList.remove('selected'); });
      this.classList.add('selected');
      selections[key] = this.getAttribute('data-val');
      if (selections.risk && selections.horizon && selections.tech) showResult();
    });
  });

  document.getElementById('pqReset').addEventListener('click', function() {
    selections = { risk: null, horizon: null, tech: null };
    quiz.querySelectorAll('.pq-opt').forEach(function(o) { o.classList.remove('selected'); });
    document.getElementById('pqResult').classList.remove('show');
  });

  function showResult() {
    var r = selections;
    var typeEl = document.getElementById('pqResultType');
    var descEl = document.getElementById('pqResultDesc');
    var etfEl = document.getElementById('pqResultETF');
    var result = getPersonalityResult(r);
    typeEl.textContent = result.type;
    descEl.textContent = result.desc;
    etfEl.textContent = result.etf;
    document.getElementById('pqResult').classList.add('show');
  }

  function getPersonalityResult(r) {
    if (r.risk === 'high' && r.tech === 'bullish' && r.horizon === 'long') {
      return { type: '🚀 激进成长型', desc: '你追求高回报、能承受波动、看好科技未来。你在三大指数中最匹配的是纳斯达克——近10年年化15%+的回报正是你想要的。', etf: '推荐ETF：QQQ（纳斯达克100），搭配20% VOO作为安全垫' };
    } else if (r.risk === 'low' || r.horizon === 'short') {
      return { type: '🛡️ 稳健保守型', desc: '你偏好低波动、追求稳定。道琼斯或者更好的选择：标普500平衡了风险与回报，覆盖11个行业，是全天候的稳健之选。', etf: '推荐ETF：VOO / SPY（标普500），费用极低、波动可控' };
    } else if (r.tech === 'bullish') {
      return { type: '⚖️ 均衡进取型', desc: '你相信科技但不愿过度冒险。核心标普500 + 适量纳斯达克是最经典的美股配置——攻守兼备，70% VOO + 30% QQQ。', etf: '推荐组合：70% VOO + 30% QQQ' };
    } else {
      return { type: '🌐 理性分散型', desc: '你偏好传统行业、注重分散。标普500囊括11个行业，是理性投资者的首选。如果想要全球分散，VT覆盖全球股市。', etf: '推荐ETF：VOO / SPY 或 VT（全球股市ETF）' };
    }
  }
})();

/* ---- 你知道吗旋转卡片 ---- */
(function() {
  var cards = document.querySelectorAll('.fact-card');
  var dots = document.querySelectorAll('.fact-dot');
  if (cards.length === 0) return;
  var currentFact = 0;
  var totalFacts = cards.length;
  var autoTimer = null;

  function showFact(index) {
    if (index === currentFact) return;
    cards[currentFact].classList.remove('active');
    cards[currentFact].classList.add('exit');
    dots[currentFact].classList.remove('active');
    setTimeout(function() {
      cards[currentFact].classList.remove('exit');
    }, 600);
    currentFact = index;
    cards[currentFact].classList.add('active');
    dots[currentFact].classList.add('active');
    resetTimer();
  }

  function nextFact() {
    var next = (currentFact + 1) % totalFacts;
    showFact(next);
  }

  function resetTimer() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(nextFact, 5000);
  }

  dots.forEach(function(dot) {
    dot.addEventListener('click', function() {
      showFact(parseInt(this.getAttribute('data-dot')));
    });
  });

  resetTimer();
})();
