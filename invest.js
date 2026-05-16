/* ================================================================
   invest.js — 美股模拟交易引擎
   ================================================================ */

// ---- 股票数据 ----
const STOCK_POOL = [
  { symbol: 'AAPL',  name: 'Apple Inc.',       sector: '科技', basePrice: 195, vol: 0.015, pe: 31.2, pb: 45.8, mcap: '$3.0T' },
  { symbol: 'MSFT',  name: 'Microsoft Corp.',   sector: '科技', basePrice: 430, vol: 0.013, pe: 36.5, pb: 13.2, mcap: '$3.2T' },
  { symbol: 'NVDA',  name: 'NVIDIA Corp.',      sector: '芯片', basePrice: 920, vol: 0.028, pe: 52.1, pb: 42.6, mcap: '$2.3T' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.',     sector: '互联网', basePrice: 175, vol: 0.016, pe: 26.8, pb: 7.4, mcap: '$2.2T' },
  { symbol: 'AMZN',  name: 'Amazon.com Inc.',   sector: '电商', basePrice: 195, vol: 0.018, pe: 38.5, pb: 8.2, mcap: '$2.0T' },
  { symbol: 'META',  name: 'Meta Platforms',    sector: '社交', basePrice: 520, vol: 0.022, pe: 28.3, pb: 9.8, mcap: '$1.3T' },
  { symbol: 'TSLA',  name: 'Tesla Inc.',        sector: '电动车', basePrice: 250, vol: 0.030, pe: 62.0, pb: 16.5, mcap: '$800B' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway',sector: '综合', basePrice: 430, vol: 0.008, pe: 14.2, pb: 1.6, mcap: '$950B' },
  { symbol: 'JPM',   name: 'JPMorgan Chase',    sector: '金融', basePrice: 200, vol: 0.012, pe: 12.8, pb: 1.9, mcap: '$570B' },
  { symbol: 'V',     name: 'Visa Inc.',         sector: '金融', basePrice: 285, vol: 0.011, pe: 32.1, pb: 13.5, mcap: '$580B' },
  { symbol: 'JNJ',   name: 'Johnson & Johnson', sector: '医疗', basePrice: 158, vol: 0.009, pe: 16.5, pb: 5.4, mcap: '$380B' },
  { symbol: 'WMT',   name: 'Walmart Inc.',      sector: '零售', basePrice: 68,  vol: 0.010, pe: 28.6, pb: 5.8, mcap: '$550B' },
];

function generateHistory(base, days, v) {
  var h = [], p = base;
  for (var i = days; i >= 0; i--) {
    p = Math.max(p + (Math.random() - 0.48) * v * p, base * 0.5);
    var d = new Date(); d.setDate(d.getDate() - i);
    h.push({ date: d.toISOString().split('T')[0], price: +p.toFixed(2) });
  }
  return h;
}

function buildStocks() {
  return STOCK_POOL.map(function(s) {
    var history = generateHistory(s.basePrice, 90, s.vol);
    var latest = history[history.length - 1].price;
    var prev = history[history.length - 2].price;
    var chg = +(latest - prev).toFixed(2);
    return {
      symbol: s.symbol, name: s.name, sector: s.sector,
      price: latest, change: chg, changePercent: +((chg / prev) * 100).toFixed(2),
      high: +(latest * (1 + Math.random() * 0.03)).toFixed(2),
      low: +(latest * (1 - Math.random() * 0.03)).toFixed(2),
      open: +(latest * (1 + (Math.random() - 0.5) * 0.02)).toFixed(2),
      pe: s.pe, pb: s.pb, mcap: s.mcap,
      history: history
    };
  });
}

var stocks = buildStocks();
function findStock(sym) { return stocks.find(function(s) { return s.symbol === sym; }); }

// ---- 价格刷新 ----
function refreshPrices() {
  stocks.forEach(function(s) {
    var chg = (Math.random() - 0.48) * s.vol * s.price;
    var old = s.price;
    s.price = +Math.max(s.price + chg, s.price * 0.5).toFixed(2);
    s.change = +(s.price - old).toFixed(2);
    s.changePercent = +((s.change / old) * 100).toFixed(2);
    s.high = Math.max(s.high, s.price);
    s.low = Math.min(s.low, s.price);
    var today = new Date().toISOString().split('T')[0];
    var last = s.history[s.history.length - 1];
    if (last && last.date === today) { last.price = s.price; }
    else { s.history.push({ date: today, price: s.price }); if (s.history.length > 120) s.history.shift(); }
  });
}

// ---- 格式化 ----
function fmtPrice(n) { return '$' + n.toFixed(2); }
function fmtPercent(n) { return (n > 0 ? '+' : '') + n.toFixed(2) + '%'; }
function fmtMoney(n) { return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function clsUpDn(n) { return n >= 0 ? 'price-up' : 'price-down'; }

// ---- Toast ----
function showToast(msg, type) {
  var t = document.createElement('div');
  t.className = 'invest-toast invest-toast-' + (type || 'info');
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function() { t.classList.add('out'); setTimeout(function() { t.remove(); }, 300); }, 2500);
}

// ================================================================
//  账户管理
// ================================================================
var STORAGE_KEY = 'us_stock_invest_account';
var INITIAL_CASH = 100000;

function defaultAccount() {
  return { cash: INITIAL_CASH, holdings: [], trades: [], assetHistory: [] };
}

function loadAccount() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      var a = JSON.parse(raw);
      if (a.holdings === undefined) a.holdings = [];
      if (a.trades === undefined) a.trades = [];
      if (a.assetHistory === undefined) a.assetHistory = [];
      if (a.cash === undefined) a.cash = INITIAL_CASH;
      return a;
    }
  } catch(e) {}
  return defaultAccount();
}

function saveAccount() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(account)); } catch(e) {} }

var account = loadAccount();

function getCash() { return account.cash; }
function getHoldings() { return account.holdings; }
function getTrades() { return account.trades; }

function getHoldingsValue() {
  return account.holdings.reduce(function(total, h) {
    var s = findStock(h.symbol); return total + (s ? s.price * h.qty : 0);
  }, 0);
}
function getTotalAssets() { return account.cash + getHoldingsValue(); }

function getTotalReturn() {
  var hv = getHoldingsValue();
  var tc = account.holdings.reduce(function(sum, h) { return sum + h.avgCost * h.qty; }, 0);
  if (tc === 0) return { amount: 0, percent: 0 };
  return { amount: hv - tc, percent: ((hv - tc) / tc) * 100 };
}

function recordSnapshot() {
  var today = new Date().toISOString().split('T')[0];
  var total = getTotalAssets();
  var last = account.assetHistory[account.assetHistory.length - 1];
  if (last && last.date === today) { last.total = total; }
  else { account.assetHistory.push({ date: today, total: total }); if (account.assetHistory.length > 365) account.assetHistory.shift(); }
}

function buyStock(symbol, qty) {
  var stock = findStock(symbol);
  if (!stock) return { ok: false, msg: '未找到该股票' };
  var cost = stock.price * qty;
  if (cost > account.cash) return { ok: false, msg: '资金不足！需要 ' + fmtMoney(cost) + '，可用 ' + fmtMoney(account.cash) };
  account.cash -= cost;
  var ex = account.holdings.find(function(h) { return h.symbol === symbol; });
  if (ex) {
    var tq = ex.qty + qty, tcb = ex.avgCost * ex.qty + cost;
    ex.avgCost = +(tcb / tq).toFixed(2); ex.qty = tq;
  } else {
    account.holdings.push({ symbol: stock.symbol, name: stock.name, qty: qty, avgCost: +(cost / qty).toFixed(2) });
  }
  account.trades.unshift({ id: Date.now(), date: new Date().toLocaleString('zh-CN'), symbol: symbol, name: stock.name, type: 'buy', qty: qty, price: stock.price, amount: cost });
  recordSnapshot(); saveAccount();
  return { ok: true, msg: '买入 ' + stock.name + ' ' + qty + ' 股，花费 ' + fmtMoney(cost) };
}

function sellStock(symbol, qty) {
  var stock = findStock(symbol);
  if (!stock) return { ok: false, msg: '未找到该股票' };
  var h = account.holdings.find(function(h) { return h.symbol === symbol; });
  if (!h) return { ok: false, msg: '你没有持有该股票' };
  if (qty > h.qty) return { ok: false, msg: '持仓不足！你持有 ' + h.qty + ' 股' };
  var revenue = stock.price * qty;
  account.cash += revenue;
  h.qty -= qty;
  if (h.qty === 0) account.holdings = account.holdings.filter(function(hh) { return hh.symbol !== symbol; });
  account.trades.unshift({ id: Date.now(), date: new Date().toLocaleString('zh-CN'), symbol: symbol, name: stock.name, type: 'sell', qty: qty, price: stock.price, amount: revenue });
  recordSnapshot(); saveAccount();
  return { ok: true, msg: '卖出 ' + stock.name + ' ' + qty + ' 股，收入 ' + fmtMoney(revenue) };
}

function resetAccount() {
  account = defaultAccount();
  saveAccount();
  return { ok: true, msg: '账户已重置，资金恢复为 $100,000.00' };
}

if (account.assetHistory.length === 0) { recordSnapshot(); saveAccount(); }

// ================================================================
//  UI 渲染
// ================================================================
var activeTradeSymbol = null;

function renderStockTable(filter) {
  var term = (filter || '').toLowerCase();
  var tbody = document.getElementById('stockTableBody');
  var list = stocks.filter(function(s) {
    return s.symbol.toLowerCase().includes(term) || s.name.toLowerCase().includes(term);
  });
  tbody.innerHTML = list.map(function(s) {
    var cls = clsUpDn(s.changePercent);
    var sign = s.changePercent >= 0 ? '+' : '';
    return '<tr class="stock-row-click" data-sym="' + s.symbol + '">' +
      '<td><strong>' + s.symbol + '</strong></td>' +
      '<td>' + s.name + ' <span class="sector-tag">' + s.sector + '</span></td>' +
      '<td class="' + cls + '">' + fmtPrice(s.price) + '</td>' +
      '<td class="' + cls + '">' + sign + fmtPrice(s.change) + '</td>' +
      '<td class="' + cls + '">' + fmtPercent(s.changePercent) + '</td>' +
      '<td><button class="btn-trade-sm" data-sym="' + s.symbol + '">交易</button></td></tr>';
  }).join('');

  tbody.querySelectorAll('.stock-row-click, .btn-trade-sm').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      var sym = el.getAttribute('data-sym');
      showTradePanel(sym, 'buy');
    });
  });
}

var currentTradeTab = 'buy';
var currentTradeSymbol = null;

function showTradePanel(symbol, tab) {
  currentTradeSymbol = symbol;
  currentTradeTab = tab || 'buy';
  var stock = findStock(symbol);
  if (!stock) return;
  document.getElementById('tradePanel').style.display = 'block';
  document.getElementById('tradePanelTitle').textContent = '交易 ' + stock.name + ' (' + stock.symbol + ')';
  document.getElementById('buyStockDisplay').textContent = stock.name + ' (' + stock.symbol + ')';
  document.getElementById('buyPrice').textContent = fmtPrice(stock.price);
  document.getElementById('sellStockDisplay').textContent = stock.name + ' (' + stock.symbol + ')';
  document.getElementById('buyQty').value = 10;
  document.getElementById('sellQty').value = 10;
  switchTradeTab(currentTradeTab);
  updateBuyCost();
  updateSellInfo();
  document.getElementById('tradePanel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function switchTradeTab(tab) {
  currentTradeTab = tab;
  document.querySelectorAll('.trade-tab').forEach(function(t) { t.classList.toggle('active', t.getAttribute('data-trade') === tab); });
  document.getElementById('formBuy').style.display = tab === 'buy' ? 'block' : 'none';
  document.getElementById('formSell').style.display = tab === 'sell' ? 'block' : 'none';
  if (tab === 'sell') updateSellInfo();
  if (tab === 'buy') updateBuyCost();
}

function updateBuyCost() {
  var stock = currentTradeSymbol ? findStock(currentTradeSymbol) : null;
  var qty = parseInt(document.getElementById('buyQty').value) || 0;
  if (stock && qty > 0) {
    document.getElementById('buyCost').textContent = fmtMoney(stock.price * qty);
  } else { document.getElementById('buyCost').textContent = '--'; }
}

function updateSellInfo() {
  var stock = currentTradeSymbol ? findStock(currentTradeSymbol) : null;
  var h = account.holdings.find(function(hh) { return hh.symbol === currentTradeSymbol; });
  if (stock && h) {
    document.getElementById('sellInfo').textContent = fmtPrice(stock.price) + ' ｜ 持仓 ' + h.qty + ' 股 成本 ' + fmtPrice(h.avgCost);
    var qty = parseInt(document.getElementById('sellQty').value) || 0;
    document.getElementById('sellRevenue').textContent = qty > 0 ? fmtMoney(stock.price * qty) : '--';
  } else { document.getElementById('sellInfo').textContent = '--'; document.getElementById('sellRevenue').textContent = '--'; }
}

function renderHoldings() {
  var tbody = document.getElementById('holdingsBody');
  var holdings = account.holdings;
  if (holdings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">暂无持仓，去左侧开始模拟交易吧</td></tr>';
    return;
  }
  tbody.innerHTML = holdings.map(function(h) {
    var s = findStock(h.symbol); if (!s) return '';
    var pnl = (s.price - h.avgCost) * h.qty;
    var pnlPct = ((s.price - h.avgCost) / h.avgCost) * 100;
    var cls = pnl >= 0 ? 'price-up' : 'price-down';
    var sign = pnl >= 0 ? '+' : '';
    return '<tr>' +
      '<td><strong>' + h.symbol + '</strong></td><td>' + h.name + '</td><td>' + h.qty + ' 股</td>' +
      '<td>' + fmtPrice(h.avgCost) + '</td><td class="' + cls + '">' + fmtPrice(s.price) + '</td>' +
      '<td class="' + cls + '">' + sign + fmtPrice(pnl) + ' (' + sign + pnlPct.toFixed(2) + '%)</td></tr>';
  }).join('');
}

function renderTradeHistory() {
  var el = document.getElementById('tradeHistory');
  var trades = account.trades;
  if (trades.length === 0) { el.innerHTML = '<div class="empty-cell">暂无交易记录</div>'; return; }
  el.innerHTML = trades.map(function(t) {
    var cls = t.type === 'buy' ? 'tag-buy' : 'tag-sell';
    var label = t.type === 'buy' ? '买入' : '卖出';
    return '<div class="history-item"><span class="trade-tag ' + cls + '">' + label + '</span> ' +
      '<strong>' + t.name + '</strong> (' + t.symbol + ') ' + t.qty + ' 股 @ ' + fmtPrice(t.price) +
      ' ｜ ' + (t.type === 'buy' ? '-' : '+') + fmtPrice(t.amount) +
      '<div class="history-date">' + t.date + '</div></div>';
  }).join('');
}

function updateTopbar() {
  var hv = getHoldingsValue();
  var total = getTotalAssets();
  var ret = getTotalReturn();
  document.getElementById('invCash').textContent = fmtMoney(account.cash);
  document.getElementById('invHoldingsVal').textContent = fmtMoney(hv);
  document.getElementById('invTotal').textContent = fmtMoney(total);
  var retEl = document.getElementById('invReturn');
  if (account.holdings.length > 0 && ret.percent !== 0) {
    var cls = ret.percent >= 0 ? 'price-up' : 'price-down';
    var sign = ret.percent >= 0 ? '+' : '';
    retEl.textContent = sign + ret.percent.toFixed(2) + '%';
    retEl.className = 'inv-value ' + cls;
  } else { retEl.textContent = '--'; retEl.className = 'inv-value'; }
}

function refreshAll() {
  renderStockTable(document.getElementById('stockSearch').value);
  renderHoldings();
  renderTradeHistory();
  updateTopbar();
  if (currentTradeSymbol) {
    updateBuyCost();
    updateSellInfo();
  }
}

// ================================================================
//  事件绑定与初始化
// ================================================================
function initInvest() {
  renderStockTable('');
  renderHoldings();
  renderTradeHistory();
  updateTopbar();

  // 搜索
  document.getElementById('stockSearch').addEventListener('input', function() {
    renderStockTable(this.value);
  });

  // 关闭交易面板
  document.getElementById('btnCloseTrade').addEventListener('click', function() {
    document.getElementById('tradePanel').style.display = 'none';
    currentTradeSymbol = null;
  });

  // 交易标签切换
  document.querySelectorAll('.trade-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      switchTradeTab(tab.getAttribute('data-trade'));
    });
  });

  // 买入数量
  document.getElementById('buyQty').addEventListener('input', updateBuyCost);
  document.getElementById('sellQty').addEventListener('input', updateSellInfo);

  // 买入
  document.getElementById('btnBuy').addEventListener('click', function() {
    if (!currentTradeSymbol) return;
    var qty = parseInt(document.getElementById('buyQty').value) || 0;
    if (qty < 1) { showToast('请输入有效的购买数量', 'error'); return; }
    var r = buyStock(currentTradeSymbol, qty);
    showToast(r.msg, r.ok ? 'success' : 'error');
    if (r.ok) refreshAll();
  });

  // 卖出
  document.getElementById('btnSell').addEventListener('click', function() {
    if (!currentTradeSymbol) return;
    var qty = parseInt(document.getElementById('sellQty').value) || 0;
    if (qty < 1) { showToast('请输入有效的卖出数量', 'error'); return; }
    var r = sellStock(currentTradeSymbol, qty);
    showToast(r.msg, r.ok ? 'success' : 'error');
    if (r.ok) { refreshAll(); if (currentTradeTab === 'sell') updateSellInfo(); }
  });

  // 重置
  document.getElementById('btnReset').addEventListener('click', function() {
    if (confirm('确定要重置账户吗？所有持仓和交易记录将被清空，资金恢复为 $100,000.00。')) {
      resetAccount();
      refreshAll();
      showToast('账户已重置', 'info');
    }
  });

  // 移动端菜单
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function() { navLinks.classList.toggle('open'); });
    navLinks.querySelectorAll('a').forEach(function(l) { l.addEventListener('click', function() { navLinks.classList.remove('open'); }); });
  }
}

// 定时刷新价格
setInterval(function() { refreshPrices(); refreshAll(); }, 8000);

document.addEventListener('DOMContentLoaded', initInvest);
