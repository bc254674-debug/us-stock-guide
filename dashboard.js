/* ================================================================
   dashboard.js — 美股三大指数实时看板
   K线图 · 成交量 · 历史统计 · 成分股
   ================================================================ */

// ---- 配置 ----
const INDEX_CONFIG = {
  nasdaq: {
    name: '纳斯达克综合指数',
    symbol: 'NASDAQ',
    basePrice: 15500,
    currentPrice: 18520,
    volatility: 0.014,       // 日波动率
    volumeBase: 4.8e9,       // 基础成交量
  },
  sp500: {
    name: '标普500指数',
    symbol: 'S&P 500',
    basePrice: 5100,
    currentPrice: 5870,
    volatility: 0.009,
    volumeBase: 3.8e9,
  },
  dowjones: {
    name: '道琼斯工业平均指数',
    symbol: 'DJIA',
    basePrice: 38000,
    currentPrice: 42350,
    volatility: 0.007,
    volumeBase: 320e6,
  },
};

// 成分股数据
const CONSTITUENTS = {
  nasdaq: [
    { ticker: 'AAPL',  name: '苹果 Apple',        price: 198.50, mcap: '3.05T' },
    { ticker: 'MSFT',  name: '微软 Microsoft',     price: 432.80, mcap: '3.21T' },
    { ticker: 'NVDA',  name: '英伟达 NVIDIA',      price: 880.50, mcap: '2.18T' },
    { ticker: 'AMZN',  name: '亚马逊 Amazon',      price: 188.30, mcap: '1.96T' },
    { ticker: 'GOOGL', name: '谷歌 Alphabet',      price: 157.80, mcap: '1.95T' },
    { ticker: 'META',  name: '元宇宙 Meta',        price: 510.20, mcap: '1.30T' },
    { ticker: 'TSLA',  name: '特斯拉 Tesla',       price: 245.60, mcap: '0.78T' },
    { ticker: 'AVGO',  name: '博通 Broadcom',      price: 1340.0, mcap: '0.62T' },
    { ticker: 'COST',  name: '好市多 Costco',      price: 760.40, mcap: '0.34T' },
    { ticker: 'NFLX',  name: '奈飞 Netflix',       price: 630.20, mcap: '0.27T' },
    { ticker: 'ADBE',  name: 'Adobe',              price: 540.30, mcap: '0.24T' },
    { ticker: 'PEP',   name: '百事可乐 PepsiCo',   price: 178.20, mcap: '0.24T' },
    { ticker: 'AMD',   name: '超威 AMD',           price: 175.80, mcap: '0.28T' },
    { ticker: 'INTC',  name: '英特尔 Intel',       price: 42.50,  mcap: '0.18T' },
    { ticker: 'TMUS',  name: 'T-Mobile US',        price: 165.30, mcap: '0.19T' },
  ],
  sp500: [
    { ticker: 'AAPL',  name: '苹果 Apple',        price: 198.50, mcap: '3.05T' },
    { ticker: 'MSFT',  name: '微软 Microsoft',     price: 432.80, mcap: '3.21T' },
    { ticker: 'NVDA',  name: '英伟达 NVIDIA',      price: 880.50, mcap: '2.18T' },
    { ticker: 'AMZN',  name: '亚马逊 Amazon',      price: 188.30, mcap: '1.96T' },
    { ticker: 'BRK.B', name: '伯克希尔 Berkshire', price: 418.60, mcap: '0.90T' },
    { ticker: 'JPM',   name: '摩根大通 JPMorgan',  price: 202.40, mcap: '0.58T' },
    { ticker: 'XOM',   name: '埃克森美孚 Exxon',   price: 112.30, mcap: '0.50T' },
    { ticker: 'JNJ',   name: '强生 J&J',           price: 156.80, mcap: '0.38T' },
    { ticker: 'WMT',   name: '沃尔玛 Walmart',     price: 68.50,  mcap: '0.55T' },
    { ticker: 'V',     name: '维萨 Visa',          price: 285.20, mcap: '0.58T' },
    { ticker: 'PG',    name: '宝洁 P&G',           price: 170.30, mcap: '0.40T' },
    { ticker: 'HD',    name: '家得宝 Home Depot',  price: 370.60, mcap: '0.37T' },
    { ticker: 'UNH',   name: '联合健康 UnitedHealth', price: 540.20, mcap: '0.50T' },
    { ticker: 'BAC',   name: '美国银行 BofA',      price: 39.80,  mcap: '0.31T' },
    { ticker: 'KO',    name: '可口可乐 Coca-Cola',  price: 63.20,  mcap: '0.27T' },
  ],
  dowjones: [
    { ticker: 'AAPL',  name: '苹果 Apple',          price: 198.50, mcap: '3.05T' },
    { ticker: 'MSFT',  name: '微软 Microsoft',       price: 432.80, mcap: '3.21T' },
    { ticker: 'GS',    name: '高盛 Goldman Sachs',   price: 420.50, mcap: '0.14T' },
    { ticker: 'JPM',   name: '摩根大通 JPMorgan',    price: 202.40, mcap: '0.58T' },
    { ticker: 'BA',    name: '波音 Boeing',          price: 210.30, mcap: '0.13T' },
    { ticker: 'UNH',   name: '联合健康 UnitedHealth', price: 540.20, mcap: '0.50T' },
    { ticker: 'HD',    name: '家得宝 Home Depot',    price: 370.60, mcap: '0.37T' },
    { ticker: 'MCD',   name: '麦当劳 McDonald\'s',   price: 295.40, mcap: '0.21T' },
    { ticker: 'V',     name: '维萨 Visa',            price: 285.20, mcap: '0.58T' },
    { ticker: 'JNJ',   name: '强生 J&J',             price: 156.80, mcap: '0.38T' },
    { ticker: 'PG',    name: '宝洁 P&G',             price: 170.30, mcap: '0.40T' },
    { ticker: 'KO',    name: '可口可乐 Coca-Cola',   price: 63.20,  mcap: '0.27T' },
    { ticker: 'DIS',   name: '迪士尼 Disney',        price: 105.60, mcap: '0.19T' },
    { ticker: 'NKE',   name: '耐克 Nike',            price: 98.40,  mcap: '0.15T' },
    { ticker: 'WMT',   name: '沃尔玛 Walmart',       price: 68.50,  mcap: '0.55T' },
  ],
};

// ---- 全局状态 ----
// 从URL参数读取目标指数: ?index=nasdaq | ?index=sp500 | ?index=dowjones
const urlParams = new URLSearchParams(window.location.search);
const targetIndex = urlParams.get('index') || 'nasdaq';
let currentIndex = ['nasdaq', 'sp500', 'dowjones'].includes(targetIndex) ? targetIndex : 'nasdaq';
let currentDays = 252;  // 默认1年
let allData = {};       // { nasdaq: [...], sp500: [...], dowjones: [...] }
let klineChart, volumeChart;

// ---- 工具函数 ----
function fmtNum(n, decimals = 0) {
  if (n == null) return '--';
  if (Math.abs(n) >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (Math.abs(n) >= 1e9)  return (n / 1e9).toFixed(2) + 'B';
  if (Math.abs(n) >= 1e6)  return (n / 1e6).toFixed(2) + 'M';
  if (Math.abs(n) >= 1e4)  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(v) {
  if (v == null) return '--';
  const sign = v >= 0 ? '+' : '';
  return sign + v.toFixed(2) + '%';
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// ---- 生成K线数据 ----
function generateOHLCV(config) {
  const totalDays = 504; // 2年
  const data = [];
  let price = config.basePrice;

  // 倒推：从2年前开始
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 2);

  let currentDate = new Date(startDate);

  for (let i = 0; i < totalDays; i++) {
    // 跳过周末
    while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const dateStr = currentDate.toISOString().split('T')[0];
    const dayOfYear = i / totalDays;

    // 趋势：有漂移的随机游走，加上一些周期性
    const trendDrift = (config.currentPrice - config.basePrice) / config.basePrice / totalDays;
    const seasonality = Math.sin(dayOfYear * Math.PI * 2) * 0.0003;

    // 随机日收益率（正态分布近似）
    let r1 = Math.random(), r2 = Math.random();
    let dailyReturn = Math.sqrt(-2 * Math.log(Math.max(r1, 0.0001)))
      * Math.cos(2 * Math.PI * r2)
      * config.volatility
      + trendDrift
      + seasonality;

    // 偶尔的大波动（模拟财报季、宏观事件）
    if (Math.random() < 0.03) {
      dailyReturn += (Math.random() - 0.5) * config.volatility * 3;
    }

    const open = price;
    const close = open * (1 + dailyReturn);
    const intradayRange = Math.abs(close - open) + open * config.volatility * Math.random();
    const high = Math.max(open, close) + intradayRange * Math.random() * 0.6;
    const low  = Math.min(open, close) - intradayRange * Math.random() * 0.6;

    // 成交量：基础量 + 波动（大波动日成交量大）
    const volMultiplier = 1 + Math.abs(dailyReturn) / config.volatility * 0.8 + (Math.random() - 0.5) * 0.6;
    const volume = Math.round(config.volumeBase * Math.max(volMultiplier, 0.3));

    data.push({
      date: dateStr,
      open:  Math.round(open  * 100) / 100,
      close: Math.round(close * 100) / 100,
      high:  Math.round(high  * 100) / 100,
      low:   Math.round(low   * 100) / 100,
      volume: volume,
    });

    price = close;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
}

// ---- 生成所有数据 ----
function generateAllData() {
  Object.keys(INDEX_CONFIG).forEach(key => {
    allData[key] = generateOHLCV(INDEX_CONFIG[key]);
  });
}

// ---- 计算统计信息 ----
function computeStats(rawData) {
  const len = rawData.length;

  // 最近252天 (52周)
  const recent = rawData.slice(-252);

  let maxHigh = -Infinity, minLow = Infinity;
  let maxHighDate = '', minLowDate = '';
  let maxVol = -Infinity, minVol = Infinity;
  let maxVolDate = '', minVolDate = '';
  let upDays = 0, downDays = 0;
  let totalRange = 0;

  recent.forEach(d => {
    if (d.high > maxHigh) { maxHigh = d.high; maxHighDate = d.date; }
    if (d.low < minLow)   { minLow = d.low;   minLowDate = d.date; }
    if (d.volume > maxVol) { maxVol = d.volume; maxVolDate = d.date; }
    if (d.volume < minVol) { minVol = d.volume; minVolDate = d.date; }
    if (d.close >= d.open) upDays++;
    else downDays++;
    totalRange += (d.high - d.low) / d.open;
  });

  const avgRange = (totalRange / 252) * 100;

  return {
    high52: maxHigh,
    high52Date: maxHighDate,
    low52: minLow,
    low52Date: minLowDate,
    maxVol,
    maxVolDate,
    minVol,
    minVolDate,
    upDays,
    downDays,
    avgRange,
  };
}

// ---- 获取当前数据切片 ----
function getVisibleData() {
  const full = allData[currentIndex];
  return full.slice(-currentDays);
}

// ---- 更新报价条 ----
function updatePriceStrip() {
  const data = allData[currentIndex];
  const latest = data[data.length - 1];
  const prev = data[data.length - 2];
  const change = latest.close - prev.close;
  const changePct = (change / prev.close) * 100;

  const isUp = change >= 0;

  document.getElementById('priceCurrent').textContent = fmtNum(latest.close, 2);
  const changeEl = document.getElementById('priceChange');
  changeEl.textContent = (isUp ? '+' : '') + fmtNum(change, 2);
  changeEl.className = 'price-change ' + (isUp ? 'up' : 'down');
  const pctEl = document.getElementById('priceChangePct');
  pctEl.textContent = '(' + (isUp ? '+' : '') + changePct.toFixed(2) + '%)';
  pctEl.className = 'price-change-pct ' + (isUp ? 'up' : 'down');

  document.getElementById('priceOpen').textContent = fmtNum(latest.open, 2);
  document.getElementById('priceHigh').textContent = fmtNum(latest.high, 2);
  document.getElementById('priceLow').textContent = fmtNum(latest.low, 2);
  document.getElementById('pricePrev').textContent = fmtNum(prev.close, 2);
  document.getElementById('priceVolume').textContent = fmtNum(latest.volume);
  document.getElementById('priceTurnover').textContent = fmtNum(latest.volume * latest.close * 0.5);

  document.getElementById('updateTime').textContent =
    '数据更新: ' + new Date().toLocaleTimeString('zh-CN');
}

// ---- 更新统计卡片 ----
function updateStats() {
  const stats = computeStats(allData[currentIndex]);

  document.getElementById('stat52High').textContent = fmtNum(stats.high52, 2);
  document.getElementById('stat52HighDate').textContent = formatDate(stats.high52Date);
  document.getElementById('stat52Low').textContent = fmtNum(stats.low52, 2);
  document.getElementById('stat52LowDate').textContent = formatDate(stats.low52Date);
  document.getElementById('statMaxVol').textContent = fmtNum(stats.maxVol);
  document.getElementById('statMaxVolDate').textContent = formatDate(stats.maxVolDate);
  document.getElementById('statMinVol').textContent = fmtNum(stats.minVol);
  document.getElementById('statMinVolDate').textContent = formatDate(stats.minVolDate);
  document.getElementById('statAvgRange').textContent = stats.avgRange.toFixed(2) + '%';
  document.getElementById('statUpDown').textContent = `${stats.upDays} / ${stats.downDays}`;
  document.getElementById('statUpDownPct').textContent =
    `涨 ${((stats.upDays/252)*100).toFixed(0)}% / 跌 ${((stats.downDays/252)*100).toFixed(0)}%`;
}

// ---- 计算移动均线 ----
function calcMA(data, period) {
  const result = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += data[j].close;
    }
    result.push([data[i].date, +(sum / period).toFixed(2)]);
  }
  return result;
}

// ---- 更新成分股表 ----
function updateConstituents() {
  const stocks = CONSTITUENTS[currentIndex];
  const tbody = document.querySelector('#constituentsTable tbody');
  tbody.innerHTML = stocks.map(s => {
    const change = (Math.random() - 0.45) * 6;
    const vol = Math.round((Math.random() * 0.7 + 0.3) * 50e6);
    const isUp = change >= 0;
    return `
      <tr>
        <td class="ct-ticker">${s.ticker}</td>
        <td>${s.name}</td>
        <td>$${s.price.toFixed(2)}</td>
        <td class="${isUp ? 'up' : 'down'}">${isUp ? '+' : ''}${change.toFixed(2)}%</td>
        <td>${fmtNum(vol)}</td>
        <td>${s.mcap}</td>
      </tr>
    `;
  }).join('');
}

// ---- K线图 ----
function initKlineChart() {
  const dom = document.getElementById('klineChart');
  klineChart = echarts.init(dom, 'dark');
  window.addEventListener('resize', () => klineChart.resize());
}

function renderKlineChart() {
  const rawData = getVisibleData();
  const dates = rawData.map(d => d.date);
  const ohlc = rawData.map(d => [d.open, d.close, d.low, d.high]);

  const showMA5  = document.getElementById('ma5').checked;
  const showMA10 = document.getElementById('ma10').checked;
  const showMA20 = document.getElementById('ma20').checked;
  const showMA60 = document.getElementById('ma60').checked;

  const series = [
    {
      name: 'K线',
      type: 'candlestick',
      data: ohlc,
      itemStyle: {
        color: '#00c853',
        color0: '#ff1744',
        borderColor: '#00e676',
        borderColor0: '#ff5252',
      },
      markPoint: {
        data: [
          { type: 'max', name: '最高', symbolSize: 50 },
          { type: 'min', name: '最低', symbolSize: 50 },
        ],
        label: { fontSize: 11 },
      },
    },
  ];

  const maColors = ['#ffb74d', '#4fc3f7', '#ce93d8', '#80cbc4'];
  const maConfigs = [
    { period: 5,  show: showMA5 },
    { period: 10, show: showMA10 },
    { period: 20, show: showMA20 },
    { period: 60, show: showMA60 },
  ];

  maConfigs.forEach((cfg, idx) => {
    if (cfg.show && rawData.length >= cfg.period) {
      const maData = calcMA(rawData, cfg.period);
      // MA日期索引对齐到K线日期
      const maMap = {};
      maData.forEach(d => { maMap[d[0]] = d[1]; });
      const alignedMA = dates.map(date => maMap[date] || null);

      series.push({
        name: `MA${cfg.period}`,
        type: 'line',
        data: alignedMA,
        smooth: true,
        lineStyle: { width: 1.5, color: maColors[idx] },
        itemStyle: { color: maColors[idx] },
        symbol: 'none',
      });
    }
  });

  // 成交量标记：最高和最低
  const volumes = rawData.map(d => d.volume);
  const maxVolIdx = volumes.indexOf(Math.max(...volumes));
  const minVolIdx = volumes.indexOf(Math.min(...volumes));

  const option = {
    backgroundColor: '#1a1d23',
    grid: [
      { left: 70, right: 30, top: 20, bottom: 40 },
    ],
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#333' } },
      axisLabel: {
        color: '#888',
        formatter: value => {
          const d = new Date(value);
          return `${d.getMonth()+1}/${d.getDate()}`;
        },
        interval: Math.floor(rawData.length / 8),
      },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      scale: true,
      axisLine: { lineStyle: { color: '#333' } },
      axisLabel: { color: '#888', formatter: v => fmtNum(v) },
      splitLine: { lineStyle: { color: '#222' } },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      backgroundColor: 'rgba(30,32,38,0.95)',
      borderColor: '#444',
      textStyle: { color: '#ddd', fontSize: 12 },
      formatter: params => {
        const date = params[0].axisValue;
        let html = `<strong>${formatDate(date)}</strong><br/>`;
        params.forEach(p => {
          if (p.seriesName === 'K线') {
            const [open, close, low, high] = p.data;
            const color = close >= open ? '#00c853' : '#ff1744';
            html += `<span style="color:${color}">━━</span> `;
            html += `开: ${fmtNum(open, 2)} &nbsp; 收: ${fmtNum(close, 2)}<br/>`;
            html += `&nbsp;&nbsp;&nbsp;高: ${fmtNum(high, 2)} &nbsp; 低: ${fmtNum(low, 2)}<br/>`;
          } else if (p.seriesName.startsWith('MA')) {
            html += `<span style="color:${p.color}">● ${p.seriesName}: ${fmtNum(p.data, 2)}</span><br/>`;
          }
        });
        return html;
      },
    },
    series: series,
  };

  klineChart.setOption(option, true);
}

// ---- 成交量图 ----
function initVolumeChart() {
  const dom = document.getElementById('volumeChart');
  volumeChart = echarts.init(dom, 'dark');
  window.addEventListener('resize', () => volumeChart.resize());
}

function renderVolumeChart() {
  const rawData = getVisibleData();
  const dates = rawData.map(d => d.date);
  const volumes = rawData.map(d => d.volume);

  // 涨跌颜色
  const volColors = rawData.map(d => d.close >= d.open ? '#00c853' : '#ff1744');
  // 标记最高最低
  const maxVol = Math.max(...volumes);
  const minVol = Math.min(...volumes);

  const option = {
    backgroundColor: '#1a1d23',
    grid: { left: 70, right: 30, top: 10, bottom: 30 },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#333' } },
      axisLabel: {
        color: '#888',
        formatter: value => {
          const d = new Date(value);
          return `${d.getMonth()+1}/${d.getDate()}`;
        },
        interval: Math.floor(rawData.length / 8),
      },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#333' } },
      axisLabel: { color: '#888', formatter: v => fmtNum(v) },
      splitLine: { lineStyle: { color: '#222' } },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(30,32,38,0.95)',
      borderColor: '#444',
      textStyle: { color: '#ddd', fontSize: 12 },
      formatter: params => {
        const p = params[0];
        const idx = p.dataIndex;
        const d = rawData[idx];
        const isUp = d.close >= d.open;
        return `<strong>${formatDate(d.date)}</strong><br/>
          <span style="color:${isUp ? '#00c853' : '#ff1744'}">成交量: ${fmtNum(d.volume)}</span><br/>
          收: ${fmtNum(d.close, 2)} | ${isUp ? '上涨' : '下跌'}`;
      },
    },
    series: [{
      type: 'bar',
      data: volumes.map((v, i) => ({
        value: v,
        itemStyle: {
          color: volColors[i],
          borderColor: volColors[i],
          borderWidth: 0.5,
          opacity: 0.85,
        },
      })),
      markPoint: {
        data: [
          {
            name: '成交量最高',
            type: 'max',
            symbol: 'pin',
            symbolSize: 48,
            itemStyle: { color: '#ffb74d' },
            label: { fontSize: 10, color: '#000' },
          },
          {
            name: '成交量最低',
            type: 'min',
            symbol: 'pin',
            symbolSize: 36,
            itemStyle: { color: '#4fc3f7' },
            label: { fontSize: 10, color: '#000' },
          },
        ],
      },
    }],
  };

  volumeChart.setOption(option, true);
}

// ---- 刷新全部 ----
function refreshAll() {
  updatePriceStrip();
  updateStats();
  renderKlineChart();
  renderVolumeChart();
  updateConstituents();
}

// ---- 事件绑定 ----
function bindEvents() {
  // 时间周期
  document.querySelectorAll('.tf-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDays = parseInt(btn.dataset.days);
      refreshAll();
    });
  });

  // MA切换
  ['ma5', 'ma10', 'ma20', 'ma60'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      renderKlineChart();
    });
  });
}

// ---- 定时刷新成分股 ----
function startAutoRefresh() {
  setInterval(() => {
    updateConstituents();
    document.getElementById('updateTime').textContent =
      '数据更新: ' + new Date().toLocaleTimeString('zh-CN');
  }, 5000);
}

// ---- 启动 ----
function init() {
  generateAllData();

  // 返回按钮：从首页进入则回到对应卡片位置，否则回到上一页
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    if (document.referrer && document.referrer.includes('index.html')) {
      backBtn.href = 'index.html#ticker-' + currentIndex;
    } else if (document.referrer && !document.referrer.includes('dashboard.html')) {
      backBtn.href = document.referrer;
    }
  }

  // 根据URL参数设置页面标题
  const cfg = INDEX_CONFIG[currentIndex];
  document.title = cfg.name + ' — 详细行情';
  const titleEl = document.getElementById('dashTitle');
  if (titleEl) titleEl.textContent = cfg.name + ' (' + cfg.symbol + ')';

  initKlineChart();
  initVolumeChart();
  bindEvents();
  refreshAll();
  startAutoRefresh();
}

document.addEventListener('DOMContentLoaded', init);
