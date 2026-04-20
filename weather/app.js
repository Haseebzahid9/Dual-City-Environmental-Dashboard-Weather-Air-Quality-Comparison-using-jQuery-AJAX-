const API_KEY  = '58c06e087241fb33d906d938affb26a9';
const GEO_URL  = 'https://api.openweathermap.org/geo/1.0/direct';
const AIR_URL  = 'http://api.openweathermap.org/data/2.5/air_pollution';
const WX_URL   = 'https://api.openweathermap.org/data/2.5/weather';
const FORE_URL = 'https://api.openweathermap.org/data/2.5/forecast';

let useCelsius = true;
const cityData = { 1: null, 2: null };
const charts   = { 1: null, 2: null };

function mapWeatherIcon(id) {
  if (id >= 200 && id < 300) return { icon: '⛈️', label: 'Thunderstorm' };
  if (id >= 300 && id < 400) return { icon: '🌦️', label: 'Drizzle' };
  if (id >= 500 && id < 600) return { icon: '🌧️', label: 'Rain' };
  if (id >= 600 && id < 700) return { icon: '❄️', label: 'Snow' };
  if (id >= 700 && id < 800) return { icon: '🌫️', label: 'Fog / Mist' };
  if (id === 800)             return { icon: '☀️', label: 'Clear Sky' };
  if (id === 801)             return { icon: '🌤️', label: 'Few Clouds' };
  if (id === 802)             return { icon: '⛅', label: 'Scattered Clouds' };
  if (id >= 803)              return { icon: '☁️', label: 'Overcast' };
  return { icon: '🌡️', label: 'Unknown' };
}

function aqiInfo(aqi) {
  const levels = {
    1: { cls: 'aqi-good',     band: 'band-good',     label: 'Good' },
    2: { cls: 'aqi-fair',     band: 'band-fair',     label: 'Fair' },
    3: { cls: 'aqi-moderate', band: 'band-moderate', label: 'Moderate' },
    4: { cls: 'aqi-poor',     band: 'band-poor',     label: 'Poor' },
    5: { cls: 'aqi-very-poor',band: 'band-very-poor',label: 'Very Poor' },
  };
  return levels[aqi] || levels[3];
}

function kelvinTo(k) {
  return useCelsius
    ? (k - 273.15).toFixed(1) + '°C'
    : ((k - 273.15) * 9 / 5 + 32).toFixed(1) + '°F';
}

function kelvinVal(k) {
  return useCelsius
    ? (k - 273.15).toFixed(1)
    : ((k - 273.15) * 9 / 5 + 32).toFixed(1);
}

function pollWidth(val, max) {
  return Math.min((val / max) * 100, 100).toFixed(1) + '%';
}

function pollColor(val, good, moderate) {
  if (val <= good)    return '#22c55e';
  if (val <= moderate) return '#eab308';
  return '#ef4444';
}

function showAlert(slot, msg) {
  $(`#alert${slot}`)
    .html(`<div class="custom-alert"><i class="bi bi-exclamation-triangle-fill"></i> ${msg}</div>`)
    .hide()
    .fadeIn(300);
  setTimeout(() => $(`#alert${slot}`).fadeOut(400), 5000);
}

function buildCard(slot, geo, wx, air, forecast) {
  const aqi    = air.list[0].main.aqi;
  const comps  = air.list[0].components;
  const info   = aqiInfo(aqi);
  const wxIcon = mapWeatherIcon(wx.weather[0].id);
  const unit   = useCelsius ? '°C' : '°F';

  const foreTemps = forecast.list
    .slice(0, 40)
    .filter((_, i) => i % 8 === 0)
    .map(f => ({
      label: new Date(f.dt * 1000).toLocaleDateString('en', { weekday: 'short' }),
      temp : parseFloat(kelvinVal(f.main.temp))
    }));

  const pollutants = [
    { name: 'PM2.5', val: comps.pm2_5, max: 300,   good: 12,   mod: 35.4 },
    { name: 'PM10',  val: comps.pm10,  max: 600,   good: 54,   mod: 154  },
    { name: 'O₃',   val: comps.o3,    max: 400,   good: 54,   mod: 124  },
    { name: 'NO₂',  val: comps.no2,   max: 400,   good: 53,   mod: 100  },
    { name: 'SO₂',  val: comps.so2,   max: 350,   good: 35,   mod: 75   },
    { name: 'CO',   val: comps.co,    max: 15400, good: 4400, mod: 9400 },
  ];

  const pollRows = pollutants.map(p => `
    <div class="poll-row">
      <span class="poll-name">${p.name}</span>
      <div class="poll-bar-wrap">
        <div class="poll-bar" style="width:${pollWidth(p.val, p.max)};background:${pollColor(p.val, p.good, p.mod)}"></div>
      </div>
      <span class="poll-val">${p.val.toFixed(1)} μg</span>
    </div>`).join('');

  const canvasId = `chart${slot}`;

  const html = `
    <div class="card-header-band ${info.band}">
      <div class="city-name-display">${geo.name}</div>
      <div class="city-country">${geo.state ? geo.state + ', ' : ''}${geo.country}</div>
      <div class="weather-icon-large">${wxIcon.icon}</div>
      <div class="temp-huge">${kelvinVal(wx.main.temp)}<sup style="font-size:1.8rem">${unit}</sup></div>
      <div class="weather-desc">${wxIcon.label} · feels like ${kelvinTo(wx.main.feels_like)}</div>
      <div class="aqi-badge ${info.cls}"><i class="bi bi-wind"></i> AQI ${aqi} — ${info.label}</div>
    </div>

    <div class="stats-grid">
      <div class="stat-block">
        <div class="stat-val">${wx.main.humidity}%</div>
        <div class="stat-key">Humidity</div>
      </div>
      <div class="stat-block">
        <div class="stat-val">${wx.wind.speed} m/s</div>
        <div class="stat-key">Wind</div>
      </div>
      <div class="stat-block">
        <div class="stat-val">${wx.main.pressure} hPa</div>
        <div class="stat-key">Pressure</div>
      </div>
      <div class="stat-block">
        <div class="stat-val">${kelvinTo(wx.main.temp_min)}</div>
        <div class="stat-key">Min Temp</div>
      </div>
      <div class="stat-block">
        <div class="stat-val">${kelvinTo(wx.main.temp_max)}</div>
        <div class="stat-key">Max Temp</div>
      </div>
      <div class="stat-block">
        <div class="stat-val">${wx.visibility ? (wx.visibility / 1000).toFixed(1) + ' km' : 'N/A'}</div>
        <div class="stat-key">Visibility</div>
      </div>
    </div>

    <div class="pollutants-section">
      <div class="section-title"><i class="bi bi-lungs"></i> Air Pollutants</div>
      ${pollRows}
    </div>

    <div class="chart-section">
      <div class="section-title"><i class="bi bi-graph-up"></i> 5-Day Temperature Forecast</div>
      <div class="chart-wrap">
        <canvas id="${canvasId}" height="140"></canvas>
      </div>
    </div>`;

  $(`#card${slot}`).html(html).addClass('visible fade-in');

  if (charts[slot]) charts[slot].destroy();

  const ctx = document.getElementById(canvasId).getContext('2d');
  charts[slot] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: foreTemps.map(f => f.label),
      datasets: [{
        label: `Temp (${unit})`,
        data: foreTemps.map(f => f.temp),
        borderColor: slot === 1 ? '#38bdf8' : '#a78bfa',
        backgroundColor: slot === 1 ? 'rgba(56,189,248,0.12)' : 'rgba(167,139,250,0.12)',
        tension: 0.45,
        fill: true,
        pointRadius: 5,
        pointBackgroundColor: slot === 1 ? '#38bdf8' : '#a78bfa',
        pointBorderColor: '#060d1a',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: { color: '#7bafd4', font: { family: 'Space Grotesk', size: 11 } }
        }
      },
      scales: {
        x: {
          ticks: { color: '#7bafd4', font: { family: 'Space Grotesk', size: 10 } },
          grid:  { color: 'rgba(255,255,255,0.04)' }
        },
        y: {
          ticks: { color: '#7bafd4', font: { family: 'Space Grotesk', size: 10 } },
          grid:  { color: 'rgba(255,255,255,0.04)' }
        }
      }
    }
  });

  cityData[slot] = { geo, wx, air, forecast, aqi, comps };
  updateComparison();
}

function fetchCity(slot) {
  const cityName = $(`#city${slot}Input`).val().trim();
  if (!cityName) {
    showAlert(slot, 'Please enter a city name.');
    return;
  }

  $(`#alert${slot}`).html('');
  $(`#card${slot}`).removeClass('visible').html('');
  $(`#skel${slot}`).addClass('visible');

  $.ajax({
    url: GEO_URL,
    method: 'GET',
    data: { q: cityName, limit: 1, appid: API_KEY },
    beforeSend: () => {
      $(`#fetchBtn${slot}`).prop('disabled', true).html('<i class="bi bi-hourglass-split"></i>');
    }
  })
  .done(function(geoData) {
    if (!geoData || geoData.length === 0) {
      $(`#skel${slot}`).removeClass('visible');
      showAlert(slot, `City "${cityName}" not found. Try adding a country code like "Paris, FR".`);
      $(`#fetchBtn${slot}`).prop('disabled', false).html('<i class="bi bi-search"></i> Fetch');
      return;
    }

    const geo = geoData[0];
    const lat = geo.lat;
    const lon = geo.lon;

    const wxReq  = $.ajax({ url: WX_URL,   method: 'GET', data: { lat, lon, appid: API_KEY } });
    const airReq = $.ajax({ url: AIR_URL,  method: 'GET', data: { lat, lon, appid: API_KEY } });
    const fReq   = $.ajax({ url: FORE_URL, method: 'GET', data: { lat, lon, appid: API_KEY } });

    $.when(wxReq, airReq, fReq)
      .done(function(wxRes, airRes, foreRes) {
        const wx       = wxRes[0];
        const air      = airRes[0];
        const forecast = foreRes[0];
        $(`#skel${slot}`).removeClass('visible');
        buildCard(slot, geo, wx, air, forecast);
        saveHistory(cityName, slot);
        renderHistory();
      })
      .fail(function(jqXHR) {
        $(`#skel${slot}`).removeClass('visible');
        const msg = jqXHR.responseJSON?.message || 'Could not retrieve data for this city.';
        showAlert(slot, `API Error: ${msg}`);
      });
  })
  .fail(function(jqXHR) {
    $(`#skel${slot}`).removeClass('visible');
    if (jqXHR.status === 401) {
      showAlert(slot, 'Invalid API key. Please check your key in app.js.');
    } else if (jqXHR.status === 0) {
      showAlert(slot, 'Network error. Make sure your API key is set and you are online.');
    } else {
      showAlert(slot, `Error ${jqXHR.status}: ${jqXHR.responseJSON?.message || 'Something went wrong.'}`);
    }
  })
  .always(function() {
    $(`#fetchBtn${slot}`).prop('disabled', false).html('<i class="bi bi-search"></i> Fetch');
  });
}

function updateComparison() {
  if (!cityData[1] || !cityData[2]) return;

  const d1 = cityData[1];
  const d2 = cityData[2];
  const n1 = d1.geo.name;
  const n2 = d2.geo.name;

  const rows = [
    { label: 'Temperature',   v1: kelvinTo(d1.wx.main.temp),    v2: kelvinTo(d2.wx.main.temp),    betterFn: (a, b) => a > b ? 2 : 1 },
    { label: 'Humidity',      v1: d1.wx.main.humidity + '%',    v2: d2.wx.main.humidity + '%',    betterFn: (a, b) => a < b ? 1 : 2 },
    { label: 'Wind Speed',    v1: d1.wx.wind.speed + ' m/s',    v2: d2.wx.wind.speed + ' m/s',    betterFn: null },
    { label: 'AQI',           v1: d1.aqi + ' (' + aqiInfo(d1.aqi).label + ')', v2: d2.aqi + ' (' + aqiInfo(d2.aqi).label + ')', betterFn: (a, b) => a < b ? 1 : 2 },
    { label: 'PM2.5 (μg/m³)',v1: d1.comps.pm2_5.toFixed(2),   v2: d2.comps.pm2_5.toFixed(2),   betterFn: (a, b) => a < b ? 1 : 2 },
    { label: 'PM10 (μg/m³)', v1: d1.comps.pm10.toFixed(2),    v2: d2.comps.pm10.toFixed(2),    betterFn: (a, b) => a < b ? 1 : 2 },
    { label: 'Pressure',      v1: d1.wx.main.pressure + ' hPa',v2: d2.wx.main.pressure + ' hPa',betterFn: null },
    { label: 'Visibility',    v1: (d1.wx.visibility / 1000).toFixed(1) + ' km', v2: (d2.wx.visibility / 1000).toFixed(1) + ' km', betterFn: (a, b) => a > b ? 1 : 2 },
  ];

  let html = `<thead><tr>
    <th>Metric</th>
    <th style="color:var(--accent-blue)">${n1}</th>
    <th style="color:var(--accent-purple)">${n2}</th>
  </tr></thead><tbody>`;

  rows.forEach(r => {
    let c1 = '', c2 = '';
    if (r.betterFn) {
      const v1n    = parseFloat(r.v1);
      const v2n    = parseFloat(r.v2);
      const better = r.betterFn(v1n, v2n);
      if (better === 1) c1 = 'winner';
      else if (better === 2) c2 = 'winner';
    }
    html += `<tr>
      <td>${r.label}</td>
      <td class="${c1}">${r.v1}${c1 ? ' ✓' : ''}</td>
      <td class="${c2}">${r.v2}${c2 ? ' ✓' : ''}</td>
    </tr>`;
  });

  html += '</tbody>';
  $('#compareTable').html(html);
  $('#compareSection').addClass('visible fade-in');
}

$('#unitToggle').on('click', function() {
  useCelsius = !useCelsius;
  $(this).text(useCelsius ? '°C → °F' : '°F → °C');
  $('#unitDisplay').text(useCelsius ? 'Celsius' : 'Fahrenheit');

  [1, 2].forEach(slot => {
    if (cityData[slot]) {
      const { geo, wx, air, forecast } = cityData[slot];
      buildCard(slot, geo, wx, air, forecast);
    }
  });
});

$('#fetchBtn1').on('click', () => fetchCity(1));
$('#fetchBtn2').on('click', () => fetchCity(2));

$('#city1Input').on('keydown', e => { if (e.key === 'Enter') fetchCity(1); });
$('#city2Input').on('keydown', e => { if (e.key === 'Enter') fetchCity(2); });

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem('atmo_history') || '[]');
  } catch {
    return [];
  }
}

function saveHistory(cityName, slot) {
  const hist  = getHistory();
  const entry = { city: cityName, slot, time: new Date().toLocaleTimeString() };
  hist.unshift(entry);
  localStorage.setItem('atmo_history', JSON.stringify(hist.slice(0, 15)));
}

function renderHistory() {
  const hist = getHistory();
  if (!hist.length) {
    $('#historyList').html('<div class="no-history"><i class="bi bi-inbox"></i><br>No searches yet</div>');
    return;
  }
  let html = '';
  hist.forEach((h, i) => {
    html += `<div class="history-item" data-city="${h.city}" data-slot="${h.slot}">
      <div>
        <div class="hist-cities"><i class="bi bi-geo-alt-fill" style="color:var(--accent-blue);margin-right:4px"></i>${h.city}</div>
        <div class="hist-time">Slot ${h.slot} · ${h.time}</div>
      </div>
      <button class="hist-del" data-idx="${i}" title="Remove"><i class="bi bi-x"></i></button>
    </div>`;
  });
  $('#historyList').html(html);
}

$(document).on('click', '.history-item', function(e) {
  if ($(e.target).closest('.hist-del').length) return;
  const city = $(this).data('city');
  const slot = $(this).data('slot');
  $(`#city${slot}Input`).val(city);
  fetchCity(slot);
  $('#historySidebar').removeClass('open');
});

$(document).on('click', '.hist-del', function(e) {
  e.stopPropagation();
  const idx  = parseInt($(this).data('idx'));
  const hist = getHistory();
  hist.splice(idx, 1);
  localStorage.setItem('atmo_history', JSON.stringify(hist));
  renderHistory();
});

$('#sidebarToggle').on('click', () => {
  renderHistory();
  $('#historySidebar').addClass('open');
});

$('#closeSidebar').on('click', () => $('#historySidebar').removeClass('open'));

$(document).on('click', e => {
  if (!$(e.target).closest('#historySidebar, #sidebarToggle').length) {
    $('#historySidebar').removeClass('open');
  }
});

$(document).ready(() => renderHistory());
