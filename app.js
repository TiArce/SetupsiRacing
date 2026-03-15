// =============================================
//  NASCAR Next Gen – Main Application Logic
//  app.js
// =============================================

// ─── STATE ──────────────────────────────────────────────────────
const AppState = {
  currentPage: 'dashboard',
  currentSetup: null,
  currentTrack: null,
  setupHistory: [],
  activeIssues: new Set(),
  diagnosisCount: 0,
  chatHistory: []
};
// Make globally accessible for simulator-advanced.js
window.AppState = AppState;

// ─── INIT ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadHistory();
  setupNavigation();
  setupTabSwitching();
  initTracksList();
  initDynamics();
  initChat();
  updateDashboard();
});

// ─── NAVIGATION ──────────────────────────────────────────────────
function setupNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      navigateTo(btn.dataset.page);
    });
  });
}

window.navigateTo = function(page) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.page === page));
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === 'page-' + page));
  AppState.currentPage = page;
  if (page === 'dynamics') refreshDynamicsContent();
  if (page === 'engineer') updateEngineerContext();
  if (page === 'advsim')   initAdvSimPage();
};

// ─── ADVANCED SIMULATOR PAGE INIT ────────────────────────────────
function initAdvSimPage() {
  // Use a small timeout to ensure the page's display:block is applied first
  // (navigateTo toggles .active which sets display:block via CSS)
  setTimeout(function() {
    try {
      if (typeof window.renderAdvancedSimulator === 'function') {
        window.renderAdvancedSimulator();
      } else {
        // Script not loaded yet - retry once more
        setTimeout(function() {
          if (typeof window.renderAdvancedSimulator === 'function') {
            window.renderAdvancedSimulator();
          }
        }, 300);
      }
    } catch(e) {
      console.error('Advanced Simulator init error:', e);
      const root = document.getElementById('adv-sim-root');
      if (root) root.innerHTML = '<div style="color:var(--loose);padding:2rem;text-align:center">Erro ao carregar simulador: ' + e.message + '</div>';
    }
  }, 50);
}

// ─── TAB SWITCHING ────────────────────────────────────────────────
function setupTabSwitching() {
  // Setup input tabs
  document.querySelectorAll('.itab').forEach(tab => {
    tab.addEventListener('click', () => {
      const parent = tab.closest('.setup-input-panel');
      parent.querySelectorAll('.itab').forEach(t => t.classList.remove('active'));
      parent.querySelectorAll('.itab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      parent.querySelector('#tab-' + tab.dataset.tab).classList.add('active');
    });
  });

  // Track type filter
  document.querySelectorAll('.tf-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTracksList(btn.dataset.filter);
    });
  });

  // Dynamics tabs
  document.querySelectorAll('.dyn-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.dyn-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      refreshDynamicsContent(tab.dataset.dyntab);
    });
  });
}

// ─── DASHBOARD ───────────────────────────────────────────────────
function updateDashboard() {
  const track = AppState.currentTrack;
  const setup = AppState.currentSetup;
  document.getElementById('dc-track').textContent = track ? track.name : 'Nenhuma selecionada';
  document.getElementById('dc-setup').textContent = setup ? (setup.name || 'Setup carregado') : 'Aguardando...';
  document.getElementById('dc-history').textContent = AppState.setupHistory.length;
  document.getElementById('dc-diagnosis').textContent = AppState.diagnosisCount + ' realizados';

  const eng = AppState.currentTrack;
  document.getElementById('eng-track').textContent = eng ? eng.name : '—';
  document.getElementById('eng-setup').textContent = AppState.currentSetup ? (AppState.currentSetup.name || 'Setup ativo') : '—';
  document.getElementById('eng-type').textContent = AppState.currentTrack ? AppState.currentTrack.type.toUpperCase() : '—';
}

// ─── SETUP PARSER ────────────────────────────────────────────────
window.parseSetupText = function() {
  const text = document.getElementById('setup-input').value.trim();
  if (!text) {
    showNotification('Por favor, cole o conteúdo do setup primeiro.', 'error');
    return;
  }

  const setup = parseIRacingSetup(text);
  if (!setup || Object.keys(setup).length < 3) {
    showNotification('Formato não reconhecido. Tente o formato [TIRE] ou [CHASSIS] do iRacing.', 'warn');
    // Try to analyze whatever was pasted
  }

  AppState.currentSetup = setup;
  AppState.currentSetup.name = 'Setup Importado';
  AppState.currentSetup.timestamp = new Date().toISOString();
  renderSetupAnalysis(setup);
  updateDashboard();
};

function parseIRacingSetup(text) {
  const setup = { raw: text };
  const lines = text.split('\n');
  let section = '';

  lines.forEach(line => {
    line = line.trim();
    if (line.startsWith('[') && line.endsWith(']')) {
      section = line.slice(1, -1).toUpperCase();
      return;
    }
    if (line.includes('=')) {
      const [key, val] = line.split('=');
      const k = key.trim().toLowerCase();
      const v = parseFloat(val) || val.trim();

      if (section === 'TIRE' || k.includes('pressure') || k.includes('psi') || k.includes('cold')) {
        if (k.includes('leftfront') || k === 'lfcoldpressure') setup.lf_psi = v;
        else if (k.includes('rightfront') || k === 'rfcoldpressure') setup.rf_psi = v;
        else if (k.includes('leftrear') || k === 'lrcoldpressure') setup.lr_psi = v;
        else if (k.includes('rightrear') || k === 'rrcoldpressure') setup.rr_psi = v;
        else if (k.includes('leftfrontcold')) setup.lf_psi = v;
        else if (k.includes('rightfrontcold')) setup.rf_psi = v;
        else if (k.includes('leftrearcold')) setup.lr_psi = v;
        else if (k.includes('rightrearcold')) setup.rr_psi = v;
      }

      if (section === 'CHASSIS' || section === 'FRONTEND' || section === 'REAREND') {
        if (k === 'frontbrakebiaspct' || k.includes('brakebias')) setup.brake_bias = v;
        if (k === 'noseweightpct' || k.includes('noseweight')) setup.nose_weight = v;
        if (k === 'crossweightpct' || k.includes('crossweight')) setup.cross_weight = v;
      }

      // Springs
      if (k.includes('springrate') || k.includes('spring_rate')) {
        if (k.includes('leftfront') || k.startsWith('lf')) setup.lf_spring = v;
        else if (k.includes('rightfront') || k.startsWith('rf')) setup.rf_spring = v;
        else if (k.includes('leftrear') || k.startsWith('lr')) setup.lr_spring = v;
        else if (k.includes('rightrear') || k.startsWith('rr')) setup.rr_spring = v;
      }

      // Ride Heights
      if (k.includes('rideheight') || k.includes('ride_height')) {
        if (k.includes('leftfront') || k.startsWith('lf')) setup.lf_rh = v;
        else if (k.includes('rightfront') || k.startsWith('rf')) setup.rf_rh = v;
        else if (k.includes('leftrear') || k.startsWith('lr')) setup.lr_rh = v;
        else if (k.includes('rightrear') || k.startsWith('rr')) setup.rr_rh = v;
      }

      // Camber
      if (k.includes('camber')) {
        if (k.includes('leftfront') || k.startsWith('lf')) setup.lf_camber = v;
        else if (k.includes('rightfront') || k.startsWith('rf')) setup.rf_camber = v;
        else if (k.includes('leftrear') || k.startsWith('lr')) setup.lr_camber = v;
        else if (k.includes('rightrear') || k.startsWith('rr')) setup.rr_camber = v;
      }

      // Shocks
      if (k.includes('lscomp') || k.includes('lowspeedcomp')) {
        if (k.startsWith('lf')) setup.lf_lsc = v;
        else if (k.startsWith('rf')) setup.rf_lsc = v;
        else if (k.startsWith('lr')) setup.lr_lsc = v;
        else if (k.startsWith('rr')) setup.rr_lsc = v;
      }
    }
  });

  return setup;
}

window.analyzeManualSetup = function() {
  const setup = {
    name: document.getElementById('setup-name-input').value || 'Setup Manual',
    timestamp: new Date().toISOString(),
    lf_psi: parseFloat(document.getElementById('mf-lf-psi').value),
    rf_psi: parseFloat(document.getElementById('mf-rf-psi').value),
    lr_psi: parseFloat(document.getElementById('mf-lr-psi').value),
    rr_psi: parseFloat(document.getElementById('mf-rr-psi').value),
    lf_spring: parseFloat(document.getElementById('mf-lf-spring').value),
    rf_spring: parseFloat(document.getElementById('mf-rf-spring').value),
    lr_spring: parseFloat(document.getElementById('mf-lr-spring').value),
    rr_spring: parseFloat(document.getElementById('mf-rr-spring').value),
    lf_rh: parseFloat(document.getElementById('mf-lf-rh').value),
    rf_rh: parseFloat(document.getElementById('mf-rf-rh').value),
    lr_rh: parseFloat(document.getElementById('mf-lr-rh').value),
    rr_rh: parseFloat(document.getElementById('mf-rr-rh').value),
    nose_weight: parseFloat(document.getElementById('mf-nose').value),
    cross_weight: parseFloat(document.getElementById('mf-cross').value),
    brake_bias: parseFloat(document.getElementById('mf-bb').value),
    lf_camber: parseFloat(document.getElementById('mf-lf-camber').value),
    rf_camber: parseFloat(document.getElementById('mf-rf-camber').value),
    lf_caster: parseFloat(document.getElementById('mf-lf-caster').value),
    rf_caster: parseFloat(document.getElementById('mf-rf-caster').value),
    lf_toe: parseFloat(document.getElementById('mf-lf-toe').value),
    rf_toe: parseFloat(document.getElementById('mf-rf-toe').value),
    lr_camber: parseFloat(document.getElementById('mf-lr-camber').value),
    rr_camber: parseFloat(document.getElementById('mf-rr-camber').value),
    f_arb_diam: document.getElementById('mf-f-arb-diam').value,
    f_arb_arm: parseInt(document.getElementById('mf-f-arb-arm').value),
    r_arb_diam: document.getElementById('mf-r-arb-diam').value,
    r_arb_arm: parseInt(document.getElementById('mf-r-arb-arm').value),
    lf_lsc: parseFloat(document.getElementById('mf-lf-lsc').value),
    rf_lsc: parseFloat(document.getElementById('mf-rf-lsc').value),
    lr_lsc: parseFloat(document.getElementById('mf-lr-lsc').value),
    rr_lsc: parseFloat(document.getElementById('mf-rr-lsc').value),
    lf_hsc: parseFloat(document.getElementById('mf-lf-hsc').value),
    rf_hsc: parseFloat(document.getElementById('mf-rf-hsc').value),
    lr_hsc: parseFloat(document.getElementById('mf-lr-hsc').value),
    rr_hsc: parseFloat(document.getElementById('mf-rr-hsc').value),
    lf_lsr: parseFloat(document.getElementById('mf-lf-lsr').value),
    rf_lsr: parseFloat(document.getElementById('mf-rf-lsr').value),
    lr_lsr: parseFloat(document.getElementById('mf-lr-lsr').value),
    rr_lsr: parseFloat(document.getElementById('mf-rr-lsr').value),
  };

  AppState.currentSetup = setup;
  renderSetupAnalysis(setup);
  updateDashboard();
  showNotification('Setup analisado com sucesso!', 'success');
};

// ─── SETUP ANALYSIS RENDERER ─────────────────────────────────────
function renderSetupAnalysis(setup) {
  document.getElementById('setup-analysis-empty').style.display = 'none';
  const result = document.getElementById('setup-analysis-result');
  result.style.display = 'block';
  document.getElementById('analysis-badge').style.display = 'inline';

  // Calculate balance indicators
  const balance = analyzeBalance(setup);

  let html = `
  <div class="analysis-section">
    <div class="as-header">🛞 Pressões de Pneus</div>
    <div class="as-content">
      <div class="param-grid">
        <div class="param-item">
          <div class="pi-label">LF PSI</div>
          <div class="pi-value ${getPsiStatus(setup.lf_psi, 'LF')}">${setup.lf_psi || '—'}</div>
        </div>
        <div class="param-item">
          <div class="pi-label">RF PSI</div>
          <div class="pi-value ${getPsiStatus(setup.rf_psi, 'RF')}">${setup.rf_psi || '—'}</div>
        </div>
        <div class="param-item">
          <div class="pi-label">LR PSI</div>
          <div class="pi-value ${getPsiStatus(setup.lr_psi, 'LR')}">${setup.lr_psi || '—'}</div>
        </div>
        <div class="param-item">
          <div class="pi-label">RR PSI</div>
          <div class="pi-value ${getPsiStatus(setup.rr_psi, 'RR')}">${setup.rr_psi || '—'}</div>
        </div>
      </div>
      <div class="mt-1" style="font-size:0.78rem; color:var(--text-secondary)">${analyzePressures(setup)}</div>
    </div>
  </div>

  <div class="analysis-section">
    <div class="as-header">🌀 Molas</div>
    <div class="as-content">
      <div class="param-grid">
        <div class="param-item">
          <div class="pi-label">LF Spring</div>
          <div class="pi-value">${setup.lf_spring || '—'} <small style="font-size:0.6rem; color:var(--text-dim)">lbs</small></div>
        </div>
        <div class="param-item">
          <div class="pi-label">RF Spring</div>
          <div class="pi-value">${setup.rf_spring || '—'} <small style="font-size:0.6rem; color:var(--text-dim)">lbs</small></div>
        </div>
        <div class="param-item">
          <div class="pi-label">LR Spring</div>
          <div class="pi-value">${setup.lr_spring || '—'} <small style="font-size:0.6rem; color:var(--text-dim)">lbs</small></div>
        </div>
        <div class="param-item">
          <div class="pi-label">RR Spring</div>
          <div class="pi-value">${setup.rr_spring || '—'} <small style="font-size:0.6rem; color:var(--text-dim)">lbs</small></div>
        </div>
      </div>
      <div class="mt-1" style="font-size:0.78rem; color:var(--text-secondary)">${analyzeSprings(setup)}</div>
    </div>
  </div>

  <div class="analysis-section">
    <div class="as-header">⚖️ Distribuição de Peso</div>
    <div class="as-content">
      <div class="balance-indicator">
        <div class="bi-label">Nose Weight</div>
        <div class="bi-bar-container">
          <div class="bi-bar ${(setup.nose_weight||52) > 52.5 ? 'tight' : (setup.nose_weight||52) < 51.5 ? 'loose' : 'balanced'}" style="width:${setup.nose_weight ? (setup.nose_weight - 48) * 20 : 50}%"></div>
        </div>
        <div class="bi-value" style="color:${(setup.nose_weight||52) > 52.5 ? 'var(--tight)' : (setup.nose_weight||52) < 51.5 ? 'var(--loose)' : 'var(--green)'}">${setup.nose_weight || '—'}%</div>
      </div>
      <div class="balance-indicator">
        <div class="bi-label">Cross Weight</div>
        <div class="bi-bar-container">
          <div class="bi-bar ${(setup.cross_weight||50) > 50.5 ? 'tight' : (setup.cross_weight||50) < 49.5 ? 'loose' : 'balanced'}" style="width:${setup.cross_weight ? (setup.cross_weight - 47) * 14 : 50}%"></div>
        </div>
        <div class="bi-value" style="color:${(setup.cross_weight||50) > 50.5 ? 'var(--tight)' : (setup.cross_weight||50) < 49.5 ? 'var(--loose)' : 'var(--green)'}">${setup.cross_weight || '—'}%</div>
      </div>
      <div class="balance-indicator">
        <div class="bi-label">Brake Bias</div>
        <div class="bi-bar-container">
          <div class="bi-bar ${(setup.brake_bias||54) > 56 ? 'loose' : (setup.brake_bias||54) < 52 ? 'tight' : 'balanced'}" style="width:${setup.brake_bias ? (setup.brake_bias - 48) * 7 : 42}%"></div>
        </div>
        <div class="bi-value">${setup.brake_bias || '—'}%</div>
      </div>
    </div>
  </div>

  ${setup.lf_camber || setup.rf_camber ? `
  <div class="analysis-section">
    <div class="as-header">📐 Geometria</div>
    <div class="as-content">
      <div class="param-grid">
        <div class="param-item">
          <div class="pi-label">LF Camber</div>
          <div class="pi-value">${setup.lf_camber || '—'}°</div>
        </div>
        <div class="param-item">
          <div class="pi-label">RF Camber</div>
          <div class="pi-value ${setup.rf_camber && setup.rf_camber < -5.5 ? 'warn' : 'ok'}">${setup.rf_camber || '—'}°</div>
        </div>
        ${setup.lf_caster ? `
        <div class="param-item">
          <div class="pi-label">LF Caster</div>
          <div class="pi-value">${setup.lf_caster}°</div>
        </div>
        <div class="param-item">
          <div class="pi-label">RF Caster</div>
          <div class="pi-value ok">${setup.rf_caster || '—'}°</div>
        </div>
        ` : ''}
      </div>
    </div>
  </div>` : ''}

  <div class="analysis-section">
    <div class="as-header">🧠 Diagnóstico Automático & Sugestões</div>
    <div class="as-content">
      ${generateAutoSuggestions(setup)}
    </div>
  </div>
  `;

  result.innerHTML = html;
}

function analyzeBalance(setup) {
  let score = 0;
  if (setup.rf_spring && setup.lf_spring) score += (setup.rf_spring - setup.lf_spring) / 100;
  if (setup.cross_weight) score += (setup.cross_weight - 50) * 2;
  if (setup.brake_bias) score += (setup.brake_bias - 54) / 2;
  return score;
}

function getPsiStatus(psi, corner) {
  if (!psi) return '';
  const ranges = { LF: [25, 33], RF: [25, 35], LR: [18, 28], RR: [20, 30] };
  const [lo, hi] = ranges[corner];
  if (psi < lo) return 'warn';
  if (psi > hi) return 'warn';
  return 'ok';
}

function analyzePressures(setup) {
  const notes = [];
  if (setup.rf_psi && setup.lf_psi) {
    const diff = setup.rf_psi - setup.lf_psi;
    if (diff > 4) notes.push('⚠️ RF muito maior que LF – pode induzir loose');
    if (diff < 0) notes.push('⚠️ LF maior que RF – incomum em oval, verificar');
  }
  if (setup.rr_psi && setup.rf_psi) {
    const diff = setup.rf_psi - setup.rr_psi;
    if (diff < 2) notes.push('💡 RF e RR similares – RF geralmente deve ser 2-4 PSI maior no equilíbrio');
  }
  if (notes.length === 0) notes.push('✅ Pressões dentro de faixas normais para oval');
  return notes.join('<br>');
}

function analyzeSprings(setup) {
  const notes = [];
  if (setup.rf_spring && setup.lf_spring) {
    if (setup.rf_spring < setup.lf_spring) notes.push('⚠️ RF macia que LF – incomum, pode causar loose severo');
    const diff = setup.rf_spring - setup.lf_spring;
    if (diff > 200) notes.push('💡 Grande diferença RF/LF – carro provavelmente tight');
  }
  if (setup.rr_spring && setup.lr_spring) {
    if (setup.rr_spring < setup.lr_spring) notes.push('💡 RR mais macia que LR – pode causar loose exit');
    const frontAvg = ((setup.lf_spring||550) + (setup.rf_spring||600)) / 2;
    const rearAvg = ((setup.lr_spring||175) + (setup.rr_spring||225)) / 2;
    if (rearAvg > frontAvg * 0.5) notes.push('⚠️ Molas traseiras relativamente rígidas – monitore loose');
  }
  if (notes.length === 0) notes.push('✅ Relação de molas dentro do esperado para oval');
  return notes.join('<br>');
}

function generateAutoSuggestions(setup) {
  const suggestions = [];

  // Analyze tire pressures balance
  if (setup.rf_psi && setup.rr_psi) {
    const rfPsi = setup.rf_psi, rrPsi = setup.rr_psi;
    if (rfPsi < rrPsi) {
      suggestions.push({
        icon: '🔴', title: 'Alerta: RF PSI menor que RR PSI',
        detail: `RF (${rfPsi}) < RR (${rrPsi}): Configuração incomum. RR alto causa loose crônico. Considere aumentar RF ou reduzir RR.`
      });
    }
  }

  // Analyze spring balance
  if (setup.lf_spring && setup.rf_spring && setup.lr_spring && setup.rr_spring) {
    const springBalance = (setup.rf_spring - setup.lf_spring) / (setup.lf_spring + setup.rf_spring) * 100;
    if (springBalance > 10) {
      suggestions.push({
        icon: '🔵', title: 'Tendência TIGHT: RF muito rígida vs LF',
        detail: `RF (${setup.rf_spring}) muito maior que LF (${setup.lf_spring}). Setup tende para tight geral. Reduza RF spring ou aumente LF spring.`
      });
    }

    const rearStiff = (setup.rr_spring + setup.lr_spring) / 2;
    const frontStiff = (setup.rf_spring + setup.lf_spring) / 2;
    if (rearStiff > frontStiff * 0.45) {
      suggestions.push({
        icon: '🔴', title: 'Traseiras relativamente firmes',
        detail: `Média traseiras (${rearStiff.toFixed(0)}) vs dianteiras (${frontStiff.toFixed(0)}). Relação incomum – monitore loose em aceleração.`
      });
    }
  }

  // Brake bias
  if (setup.brake_bias) {
    if (setup.brake_bias > 58) {
      suggestions.push({
        icon: '⚠️', title: 'Brake Bias muito alto dianteiro',
        detail: `${setup.brake_bias}% dianteiro é muito alto. Risco de trava do dianteiro. Reduza para 54-57%.`
      });
    }
    if (setup.brake_bias < 51) {
      suggestions.push({
        icon: '⚠️', title: 'Brake Bias muito traseiro',
        detail: `${setup.brake_bias}% é muito baixo para oval. Risco de travamento traseiro e instabilidade. Aumente para 53-56%.`
      });
    }
  }

  // Cross weight
  if (setup.cross_weight) {
    if (setup.cross_weight < 48.5) {
      suggestions.push({
        icon: '🔴', title: 'Cross Weight muito baixo',
        detail: `${setup.cross_weight}% cross weight. Carro pode estar muito loose. Range ideal: 49.5-51.5% para intermediates.`
      });
    }
    if (setup.cross_weight > 52) {
      suggestions.push({
        icon: '🔵', title: 'Cross Weight alto',
        detail: `${setup.cross_weight}% pode causar tight crônico em intermediates. Considere reduzir para 50-51%.`
      });
    }
  }

  // RF camber
  if (setup.rf_camber) {
    if (setup.rf_camber > -2) {
      suggestions.push({
        icon: '⚠️', title: 'RF Camber insuficiente',
        detail: `RF Camber de ${setup.rf_camber}° é muito pouco para oval. Recomendado: -3.5° a -6.0°. Sem câmbio adequado, desgaste no exterior do RF.`
      });
    }
    if (setup.rf_camber < -7) {
      suggestions.push({
        icon: '⚠️', title: 'RF Camber excessivo',
        detail: `RF Camber de ${setup.rf_camber}° é muito negativo. Desgaste no interior do pneu. Reduza para -4° a -6°.`
      });
    }
  }

  if (suggestions.length === 0) {
    return `<div style="padding:0.8rem; background:var(--green-bg); border:1px solid rgba(0,210,106,0.3); border-radius:4px; font-size:0.82rem; color:var(--text-secondary)">
      ✅ <strong style="color:var(--green)">Setup dentro de parâmetros normais!</strong> Nenhuma anomalia detectada automaticamente. Para diagnóstico específico, use a aba "Diagnóstico" e descreva o comportamento em pista.
    </div>`;
  }

  return suggestions.map(s => `
    <div class="suggestion-item" style="border-left-color: ${s.icon.includes('🔵') ? 'var(--tight)' : s.icon.includes('🔴') ? 'var(--loose)' : 'var(--orange)'}">
      <div class="si-title">${s.icon} ${s.title}</div>
      <div class="si-detail">${s.detail}</div>
    </div>
  `).join('');
}

// ─── SETUP SAVE/HISTORY ──────────────────────────────────────────
window.saveCurrentSetup = function() {
  if (!AppState.currentSetup) {
    analyzeManualSetup();
  }
  const name = document.getElementById('setup-name-input').value || 'Setup ' + (AppState.setupHistory.length + 1);
  const setupToSave = { ...AppState.currentSetup, name, savedAt: new Date().toLocaleString('pt-BR') };
  AppState.setupHistory.unshift(setupToSave);
  saveHistory();
  updateDashboard();
  renderHistoryList();
  showNotification('Setup "' + name + '" salvo com sucesso!', 'success');
};

function saveHistory() {
  try { localStorage.setItem('nascar_setups', JSON.stringify(AppState.setupHistory)); } catch(e) {}
}

function loadHistory() {
  try {
    const saved = localStorage.getItem('nascar_setups');
    if (saved) AppState.setupHistory = JSON.parse(saved);
  } catch(e) {}
  renderHistoryList();
}

function renderHistoryList() {
  const empty = document.getElementById('history-empty');
  const list = document.getElementById('history-list');

  if (!AppState.setupHistory.length) {
    empty.style.display = 'flex';
    list.style.display = 'none';
    return;
  }

  empty.style.display = 'none';
  list.style.display = 'block';
  list.innerHTML = AppState.setupHistory.map((s, i) => `
    <div class="history-card">
      <div class="hc-info">
        <div class="hc-name">🔧 ${s.name || 'Setup ' + (i+1)}</div>
        <div class="hc-meta">
          ${s.savedAt || s.timestamp || '—'} &nbsp;|&nbsp;
          RF: ${s.rf_psi||'?'} PSI &nbsp;|&nbsp;
          BB: ${s.brake_bias||'?'}% &nbsp;|&nbsp;
          Cross: ${s.cross_weight||'?'}%
        </div>
      </div>
      <div class="hc-actions">
        <button class="btn-secondary" style="padding:0.35rem 0.7rem; font-size:0.8rem" onclick="loadSetupFromHistory(${i})">📂 Carregar</button>
        <button class="btn-secondary" style="padding:0.35rem 0.7rem; font-size:0.8rem" onclick="compareSetups(${i})">🔍 Comparar</button>
        <button class="btn-ghost" style="padding:0.35rem 0.7rem; font-size:0.8rem" onclick="deleteSetup(${i})">🗑️</button>
      </div>
    </div>
  `).join('');
}

window.loadSetupFromHistory = function(idx) {
  AppState.currentSetup = { ...AppState.setupHistory[idx] };
  renderSetupAnalysis(AppState.currentSetup);
  updateDashboard();
  navigateTo('setup');
  showNotification('Setup carregado: ' + AppState.currentSetup.name, 'success');
};

window.deleteSetup = function(idx) {
  AppState.setupHistory.splice(idx, 1);
  saveHistory();
  renderHistoryList();
  updateDashboard();
};

window.clearHistory = function() {
  if (confirm('Limpar todo o histórico de setups?')) {
    AppState.setupHistory = [];
    saveHistory();
    renderHistoryList();
    updateDashboard();
  }
};

window.exportHistory = function() {
  const data = JSON.stringify(AppState.setupHistory, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'nascar_setups_' + Date.now() + '.json';
  a.click();
};

window.compareSetups = function(idx) {
  if (AppState.setupHistory.length < 2) {
    showNotification('Precisa de pelo menos 2 setups para comparar', 'warn');
    return;
  }
  const base = AppState.setupHistory[0];
  const comp = AppState.setupHistory[idx];
  const container = document.getElementById('history-comparison');
  container.style.display = 'block';

  const params = ['rf_psi','lf_psi','rr_psi','lr_psi','rf_spring','lf_spring','rr_spring','lr_spring','brake_bias','cross_weight','nose_weight'];
  const labels = ['RF PSI','LF PSI','RR PSI','LR PSI','RF Spring','LF Spring','RR Spring','LR Spring','Brake Bias','Cross Weight','Nose Weight'];

  let rows = params.map((p,i) => {
    const v1 = base[p] || '—';
    const v2 = comp[p] || '—';
    const diff = (v1 !== '—' && v2 !== '—') ? (parseFloat(v2) - parseFloat(v1)).toFixed(2) : '—';
    const diffColor = diff > 0 ? 'var(--green)' : diff < 0 ? 'var(--loose)' : 'var(--text-dim)';
    return `<tr style="border-bottom:1px solid var(--border)">
      <td style="padding:0.4rem 0.8rem; color:var(--text-secondary)">${labels[i]}</td>
      <td style="padding:0.4rem 0.8rem; font-family:'Orbitron',sans-serif; font-size:0.8rem">${v1}</td>
      <td style="padding:0.4rem 0.8rem; font-family:'Orbitron',sans-serif; font-size:0.8rem; color:var(--gold)">${v2}</td>
      <td style="padding:0.4rem 0.8rem; font-family:'Orbitron',sans-serif; font-size:0.8rem; color:${diffColor}">${diff > 0 ? '+' : ''}${diff}</td>
    </tr>`;
  }).join('');

  container.innerHTML = `
  <div class="analysis-section" style="margin-top:1.5rem">
    <div class="as-header">🔍 Comparação: "${base.name}" vs "${comp.name}"</div>
    <div class="as-content">
      <table style="width:100%; border-collapse:collapse; font-size:0.82rem">
        <thead>
          <tr style="background:#1a1a28; color:var(--gold)">
            <th style="padding:0.4rem 0.8rem; text-align:left">Parâmetro</th>
            <th style="padding:0.4rem 0.8rem">${base.name}</th>
            <th style="padding:0.4rem 0.8rem">${comp.name}</th>
            <th style="padding:0.4rem 0.8rem">Diferença</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>`;
};

// ─── TEMPLATES ────────────────────────────────────────────────────
window.loadTemplate = function(type) {
  const templates = {
    superspeedway: { name: 'Superspeedway Base', lf_psi:26, rf_psi:26, lr_psi:24, rr_psi:24, lf_spring:600, rf_spring:600, lr_spring:200, rr_spring:225, nose_weight:52.5, cross_weight:50.2, brake_bias:54.0, lf_camber:3.8, rf_camber:-4.5, lf_caster:4.0, rf_caster:6.0, f_arb_diam:'1.375', f_arb_arm:3, r_arb_diam:'1.375', r_arb_arm:2, lf_lsc:4, rf_lsc:5, lr_lsc:4, rr_lsc:4, lf_hsc:3, rf_hsc:4, lr_hsc:3, rr_hsc:4 },
    intermediate: { name: 'Intermediate Base', lf_psi:28, rf_psi:30, lr_psi:22, rr_psi:26, lf_spring:550, rf_spring:650, lr_spring:175, rr_spring:250, nose_weight:52.2, cross_weight:50.5, brake_bias:54.5, lf_camber:4.0, rf_camber:-5.0, lf_caster:4.0, rf_caster:6.5, f_arb_diam:'1.375', f_arb_arm:3, r_arb_diam:'1.375', r_arb_arm:3, lf_lsc:5, rf_lsc:6, lr_lsc:4, rr_lsc:5, lf_hsc:4, rf_hsc:5, lr_hsc:4, rr_hsc:5 },
    shorttrack: { name: 'Short Track Base', lf_psi:30, rf_psi:35, lr_psi:24, rr_psi:30, lf_spring:800, rf_spring:900, lr_spring:250, rr_spring:350, nose_weight:51.5, cross_weight:51.0, brake_bias:56.0, lf_camber:4.5, rf_camber:-6.0, lf_caster:4.5, rf_caster:7.0, f_arb_diam:'2.00', f_arb_arm:5, r_arb_diam:'1.375', r_arb_arm:4, lf_lsc:7, rf_lsc:8, lr_lsc:5, rr_lsc:6, lf_hsc:6, rf_hsc:7, lr_hsc:5, rr_hsc:6 },
    flat: { name: 'Flat Track Base', lf_psi:31, rf_psi:37, lr_psi:23, rr_psi:31, lf_spring:800, rf_spring:900, lr_spring:250, rr_spring:325, nose_weight:51.5, cross_weight:51.2, brake_bias:56.5, lf_camber:5.0, rf_camber:-6.5, lf_caster:4.5, rf_caster:7.0, f_arb_diam:'2.00', f_arb_arm:5, r_arb_diam:'1.375', r_arb_arm:4, lf_lsc:7, rf_lsc:8, lr_lsc:5, rr_lsc:6, lf_hsc:6, rf_hsc:7, lr_hsc:5, rr_hsc:6 }
  };

  const tmpl = templates[type];
  if (!tmpl) return;

  // Populate manual form
  document.getElementById('setup-name-input').value = tmpl.name;
  const fields = {
    'mf-lf-psi': tmpl.lf_psi, 'mf-rf-psi': tmpl.rf_psi, 'mf-lr-psi': tmpl.lr_psi, 'mf-rr-psi': tmpl.rr_psi,
    'mf-lf-spring': tmpl.lf_spring, 'mf-rf-spring': tmpl.rf_spring, 'mf-lr-spring': tmpl.lr_spring, 'mf-rr-spring': tmpl.rr_spring,
    'mf-nose': tmpl.nose_weight, 'mf-cross': tmpl.cross_weight, 'mf-bb': tmpl.brake_bias,
    'mf-lf-camber': tmpl.lf_camber, 'mf-rf-camber': tmpl.rf_camber, 'mf-lf-caster': tmpl.lf_caster, 'mf-rf-caster': tmpl.rf_caster,
    'mf-lf-lsc': tmpl.lf_lsc, 'mf-rf-lsc': tmpl.rf_lsc, 'mf-lr-lsc': tmpl.lr_lsc, 'mf-rr-lsc': tmpl.rr_lsc,
    'mf-lf-hsc': tmpl.lf_hsc, 'mf-rf-hsc': tmpl.rf_hsc, 'mf-lr-hsc': tmpl.lr_hsc, 'mf-rr-hsc': tmpl.rr_hsc,
  };
  Object.entries(fields).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  });
  if (tmpl.f_arb_diam) document.getElementById('mf-f-arb-diam').value = tmpl.f_arb_diam;
  if (tmpl.f_arb_arm) document.getElementById('mf-f-arb-arm').value = tmpl.f_arb_arm;
  if (tmpl.r_arb_diam) document.getElementById('mf-r-arb-diam').value = tmpl.r_arb_diam;
  if (tmpl.r_arb_arm) document.getElementById('mf-r-arb-arm').value = tmpl.r_arb_arm;

  // Switch to manual tab
  document.querySelectorAll('.itab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.itab-content').forEach(c => c.classList.remove('active'));
  document.querySelector('.itab[data-tab="manual"]').classList.add('active');
  document.getElementById('tab-manual').classList.add('active');

  AppState.currentSetup = { ...tmpl };
  analyzeManualSetup();
  showNotification('Template "' + tmpl.name + '" carregado!', 'success');
};

// ─── DIAGNOSIS ────────────────────────────────────────────────────
window.toggleIssue = function(btn) {
  const issue = btn.dataset.issue;
  btn.classList.toggle('active');
  if (AppState.activeIssues.has(issue)) {
    AppState.activeIssues.delete(issue);
  } else {
    AppState.activeIssues.add(issue);
  }
};

window.clearDiagnosis = function() {
  AppState.activeIssues.clear();
  document.querySelectorAll('.diag-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('nl-feedback').value = '';
  document.getElementById('diag-empty').style.display = 'flex';
  document.getElementById('diag-results').style.display = 'none';
};

window.analyzeNaturalLanguage = function() {
  const text = document.getElementById('nl-feedback').value.toLowerCase();
  if (!text) return;

  const detected = [];
  const kw = window.NL_KEYWORDS;

  const isLoose = kw.loose.some(k => text.includes(k));
  const isTight = kw.tight.some(k => text.includes(k));
  const isEntry = kw.entry.some(k => text.includes(k));
  const isCenter = kw.center.some(k => text.includes(k));
  const isExit = kw.exit.some(k => text.includes(k));
  const isTire = kw.tire.some(k => text.includes(k));
  const isRotation = kw.rotation.some(k => text.includes(k));
  const isThermal = kw.thermal.some(k => text.includes(k));

  if (isLoose && isEntry) detected.push('loose-entry');
  if (isLoose && isCenter) detected.push('loose-center');
  if (isLoose && isExit) detected.push('loose-exit');
  if (isTight && isEntry) detected.push('tight-entry');
  if (isTight && isCenter) detected.push('tight-center');
  if (isTight && isExit) detected.push('tight-exit');
  if (isLoose && !isEntry && !isCenter && !isExit) detected.push('loose-entry', 'loose-center');
  if (isTight && !isEntry && !isCenter && !isExit) detected.push('tight-entry', 'tight-center');
  if (isTire) detected.push('tire-wear');
  if (isRotation) detected.push('no-rotation');
  if (isThermal) detected.push('thermal-fade');

  if (detected.length === 0) {
    showNotification('Não consegui identificar o problema. Seja mais específico (ex: "loose na entrada", "tight no centro").', 'warn');
    return;
  }

  // Activate detected issues
  detected.forEach(issue => {
    AppState.activeIssues.add(issue);
    const btn = document.querySelector(`[data-issue="${issue}"]`);
    if (btn) btn.classList.add('active');
  });

  showNotification('Detectei: ' + detected.join(', '), 'success');
  runDiagnosis();
};

window.runDiagnosis = function() {
  if (AppState.activeIssues.size === 0) {
    showNotification('Selecione pelo menos um problema de handling.', 'warn');
    return;
  }

  AppState.diagnosisCount++;
  updateDashboard();

  const diag = window.DIAGNOSIS_MATRIX;
  let html = '';

  AppState.activeIssues.forEach(issue => {
    if (!diag[issue]) return;
    const d = diag[issue];

    html += `
    <div class="diag-result-block">
      <div class="drb-header ${d.type}">${d.type === 'loose' ? '🔴' : d.type === 'tight' ? '🔵' : '⚡'} ${d.title}</div>
      <div class="drb-content">
        <div style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:0.8rem; padding:0.6rem; background:var(--bg-primary); border-radius:4px; border-left:3px solid ${d.type==='loose'?'var(--loose)':d.type==='tight'?'var(--tight)':'var(--yellow)'}">
          <strong>📐 Física:</strong> ${d.physics}
        </div>
        <div style="font-size:0.78rem; font-weight:700; color:var(--gold); margin-bottom:0.5rem; text-transform:uppercase; letter-spacing:0.05em">
          Sequência de Ajustes (por prioridade):
        </div>
        ${d.adjustments.map((adj, i) => `
          <div class="adj-priority">
            <div class="adj-num">${adj.priority}</div>
            <div class="adj-body">
              <div class="adj-title">${adj.component} → ${adj.direction} ${adj.pitroad ? '<span class="badge badge-gold" style="font-size:0.6rem">🔄 PIT ROAD</span>' : ''}</div>
              <div class="adj-values">
                <span class="adj-from">Atual: ${adj.current_typical}</span>
                <span class="adj-arrow">→</span>
                <span class="adj-to-mild">Leve: ${adj.values.mild}</span>
                <span class="adj-to-mod">Mod: ${adj.values.moderate}</span>
                <span class="adj-to-agg">Agressivo: ${adj.values.aggressive}</span>
              </div>
              <div class="adj-reason">💡 ${adj.reason}</div>
            </div>
          </div>
        `).join('')}

        <div style="margin-top:0.8rem; padding:0.6rem 0.8rem; background:var(--bg-primary); border-radius:4px; border-left:3px solid var(--gold); font-size:0.78rem; color:var(--text-secondary)">
          <strong style="color:var(--gold)">🔄 Ajuste de Pit Road:</strong> ${d.pitstop_summary}
        </div>
      </div>
    </div>`;
  });

  document.getElementById('diag-empty').style.display = 'none';
  const results = document.getElementById('diag-results');
  results.style.display = 'block';
  results.innerHTML = html;
};

// ─── TRACKS ────────────────────────────────────────────────────────
window.initTracksList = function() {
  renderTracksList('all');
};

function renderTracksList(filter) {
  const tracks = window.getTracksByType(filter);
  const container = document.getElementById('tracks-list');
  container.innerHTML = tracks.map(t => `
    <div class="track-list-item ${AppState.currentTrack?.id === t.id ? 'active' : ''}" onclick="selectTrack('${t.id}')">
      <div class="tli-icon">${t.icon}</div>
      <div>
        <div class="tli-name">${t.short}</div>
        <div class="tli-sub">${t.length} mi · ${t.banking_turns}° banking</div>
      </div>
      <div class="track-type-badge tb-${t.type}">${t.type.toUpperCase().slice(0,5)}</div>
    </div>
  `).join('');
}

window.selectTrack = function(id) {
  const track = window.getTrackById(id);
  if (!track) return;

  AppState.currentTrack = track;
  updateDashboard();

  // Mark active
  document.querySelectorAll('.track-list-item').forEach(el => {
    el.classList.toggle('active', el.onclick?.toString().includes(id));
  });

  renderTrackDetail(track);
};

function renderTrackDetail(track) {
  document.getElementById('track-empty').style.display = 'none';
  const detail = document.getElementById('track-detail');
  detail.style.display = 'block';

  const typeColors = { superspeedway: 'var(--loose)', intermediate: 'var(--gold)', short: 'var(--green)', flat: 'var(--tight)' };
  const color = typeColors[track.type] || 'var(--gold)';

  const rec = track.setup_recommendations;

  detail.innerHTML = `
  <div class="track-hero">
    <div>
      <div class="th-name">${track.icon} ${track.name}</div>
      <div class="th-meta">📍 ${track.location} &nbsp;|&nbsp; ${track.length} milhas &nbsp;|&nbsp; Superfície: ${track.surface}</div>
      <div style="margin-top:0.5rem">
        <span class="badge badge-gold">${track.type.toUpperCase()}</span>
        <span class="badge" style="background:rgba(0,210,106,0.1); color:var(--green); border:1px solid rgba(0,210,106,0.3); margin-left:0.3rem">Desgaste: ${track.tire_wear.toUpperCase()}</span>
      </div>
    </div>
  </div>

  <div class="track-stats-grid">
    <div class="tsg-item">
      <div class="tsg-label">Banking Curvas</div>
      <div class="tsg-value">${track.banking_turns}°</div>
    </div>
    <div class="tsg-item">
      <div class="tsg-label">Banking Reta</div>
      <div class="tsg-value">${track.banking_straight}°</div>
    </div>
    <div class="tsg-item">
      <div class="tsg-label">Linhas</div>
      <div class="tsg-value">${track.lines}</div>
    </div>
    <div class="tsg-item">
      <div class="tsg-label">Abrasividade</div>
      <div class="tsg-value">${track.abrasiveness}</div>
    </div>
  </div>

  <div style="background:var(--bg-secondary); border:1px solid var(--border); border-radius:var(--radius-sm); padding:0.8rem; margin-bottom:1rem; font-size:0.82rem; color:var(--text-secondary); line-height:1.5">
    ${track.description}
  </div>

  <div style="background:var(--bg-secondary); border:1px solid var(--border); border-radius:var(--radius-sm); padding:0.8rem; margin-bottom:1rem">
    <div class="tsr-title">🎯 Características da Pista</div>
    ${track.characteristics.map(c => `<div style="font-size:0.8rem; padding:0.3rem 0; color:var(--text-secondary)">${c}</div>`).join('')}
  </div>

  <div class="track-setup-recs">
    <div class="tsr-title">🔧 Setup Recomendado</div>
    <div class="tsr-item"><span class="tsr-param">🛞 PSI (LF/RF/LR/RR)</span><span class="tsr-val">${rec.tire_psi.LF} / ${rec.tire_psi.RF} / ${rec.tire_psi.LR} / ${rec.tire_psi.RR}</span></div>
    <div class="tsr-item"><span class="tsr-param">🌀 Springs (LF/RF/LR/RR)</span><span class="tsr-val">${rec.springs.LF} / ${rec.springs.RF} / ${rec.springs.LR} / ${rec.springs.RR} lbs</span></div>
    <div class="tsr-item"><span class="tsr-param">⚖️ Nose Weight</span><span class="tsr-val">${rec.nose_weight}%</span></div>
    <div class="tsr-item"><span class="tsr-param">⚖️ Cross Weight</span><span class="tsr-val">${rec.cross_weight}%</span></div>
    <div class="tsr-item"><span class="tsr-param">🛑 Brake Bias</span><span class="tsr-val">${rec.brake_bias}% dianteiro</span></div>
    <div class="tsr-item"><span class="tsr-param">🔗 Front ARB</span><span class="tsr-val">${rec.arb_front}</span></div>
    <div class="tsr-item"><span class="tsr-param">🔗 Rear ARB</span><span class="tsr-val">${rec.arb_rear}</span></div>
    <div class="tsr-item"><span class="tsr-param">📐 RF Camber</span><span class="tsr-val">${rec.rf_camber}°</span></div>
    <div class="tsr-item"><span class="tsr-param">📐 LF Camber</span><span class="tsr-val">+${rec.lf_camber}°</span></div>
  </div>

  ${rec.notes ? `
  <div style="background:var(--bg-secondary); border:1px solid var(--border); border-radius:var(--radius-sm); padding:0.8rem; margin-bottom:1rem">
    <div class="tsr-title">📝 Notas de Engenharia</div>
    ${rec.notes.map(n => `<div style="font-size:0.8rem; padding:0.3rem 0; color:var(--text-secondary); border-left:3px solid var(--gold); padding-left:0.6rem; margin-bottom:0.3rem">${n}</div>`).join('')}
  </div>` : ''}

  <div style="background:var(--bg-secondary); border:1px solid var(--border); border-radius:var(--radius-sm); padding:0.8rem; margin-bottom:1rem">
    <div class="tsr-title">🏁 Estratégia de Corrida</div>
    <p style="font-size:0.82rem; color:var(--text-secondary); line-height:1.6">${track.strategy}</p>
  </div>

  ${track.key_challenges ? `
  <div style="background:var(--bg-secondary); border:1px solid var(--border); border-radius:var(--radius-sm); padding:0.8rem">
    <div class="tsr-title">⚠️ Principais Desafios</div>
    ${track.key_challenges.map(c => `<div style="display:flex; align-items:center; gap:0.5rem; font-size:0.8rem; padding:0.3rem 0; color:var(--text-secondary)"><span style="color:var(--gold)">▸</span>${c}</div>`).join('')}
  </div>` : ''}

  <div style="margin-top:1rem; display:flex; gap:0.5rem">
    <button class="btn-primary" onclick="loadTrackSetup('${track.id}')">🔧 Carregar Setup da Pista</button>
    <button class="btn-secondary" onclick="diagnoseForTrack('${track.id}')">🎯 Diagnóstico para esta Pista</button>
  </div>
  `;
}

window.loadTrackSetup = function(trackId) {
  const track = window.getTrackById(trackId);
  if (!track) return;
  const rec = track.setup_recommendations;
  AppState.currentSetup = {
    name: track.short + ' Base Setup',
    timestamp: new Date().toISOString(),
    lf_psi: rec.tire_psi.LF,
    rf_psi: rec.tire_psi.RF,
    lr_psi: rec.tire_psi.LR,
    rr_psi: rec.tire_psi.RR,
    lf_spring: rec.springs.LF,
    rf_spring: rec.springs.RF,
    lr_spring: rec.springs.LR,
    rr_spring: rec.springs.RR,
    nose_weight: rec.nose_weight,
    cross_weight: rec.cross_weight,
    brake_bias: rec.brake_bias,
    rf_camber: rec.rf_camber,
    lf_camber: rec.lf_camber
  };
  navigateTo('setup');
  renderSetupAnalysis(AppState.currentSetup);
  updateDashboard();
  showNotification('Setup base de ' + track.short + ' carregado!', 'success');
};

window.diagnoseForTrack = function(trackId) {
  navigateTo('diagnosis');
  showNotification('Descreva o problema que está sentindo em ' + window.getTrackById(trackId)?.short, 'info');
};

// ─── DYNAMICS ─────────────────────────────────────────────────────
function initDynamics() {
  refreshDynamicsContent('weight');
}

function refreshDynamicsContent(tab) {
  const activeTab = tab || document.querySelector('.dyn-tab.active')?.dataset?.dyntab || 'weight';
  const content = document.getElementById('dynamics-content');
  if (window.DYNAMICS_CONTENT && window.DYNAMICS_CONTENT[activeTab]) {
    content.innerHTML = window.DYNAMICS_CONTENT[activeTab];
    if (activeTab === 'simulator') {
      setTimeout(() => window.updateSimulator && window.updateSimulator(), 100);
    }
  }
}

// ─── CHAT / ENGINEER ──────────────────────────────────────────────
function initChat() {
  const messages = document.getElementById('chat-messages');
  addEngineerMessage(window.ENGINEER_RESPONSES?.greeting || 'Olá! Sou seu engenheiro virtual.');

  // Enter key send
  document.getElementById('chat-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  });
}

window.sendChatMessage = function() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';

  addUserMessage(text);
  AppState.chatHistory.push({ role: 'user', content: text });

  // Show typing
  const typingId = showTyping();

  setTimeout(() => {
    removeTyping(typingId);
    const response = generateEngineerResponse(text);
    addEngineerMessage(response);
    AppState.chatHistory.push({ role: 'engineer', content: response });
  }, 800 + Math.random() * 600);
};

window.sendQuickMessage = function(text) {
  document.getElementById('chat-input').value = text;
  sendChatMessage();
};

function addUserMessage(text) {
  const messages = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'chat-msg user';
  div.innerHTML = `
    <div class="msg-avatar usr">👤</div>
    <div>
      <div class="msg-bubble">${escapeHtml(text)}</div>
      <div class="msg-time">${getCurrentTime()}</div>
    </div>`;
  messages.appendChild(div);
  scrollChat();
}

function addEngineerMessage(text) {
  const messages = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'chat-msg engineer';
  div.innerHTML = `
    <div class="msg-avatar eng">🏁</div>
    <div>
      <div class="msg-bubble">${formatChatText(text)}</div>
      <div class="msg-time">${getCurrentTime()}</div>
    </div>`;
  messages.appendChild(div);
  scrollChat();
}

function showTyping() {
  const messages = document.getElementById('chat-messages');
  const id = 'typing-' + Date.now();
  const div = document.createElement('div');
  div.className = 'chat-msg engineer';
  div.id = id;
  div.innerHTML = `
    <div class="msg-avatar eng">🏁</div>
    <div>
      <div class="msg-bubble">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    </div>`;
  messages.appendChild(div);
  scrollChat();
  return id;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function scrollChat() {
  const msgs = document.getElementById('chat-messages');
  msgs.scrollTop = msgs.scrollHeight;
}

function generateEngineerResponse(text) {
  const lower = text.toLowerCase();

  // Check quick refs
  const refMap = { 'mola': 'springs', 'spring': 'springs', 'amortecedor': 'shocks', 'choque': 'shocks', 'shock': 'shocks', 'pressão': 'tires', 'psi': 'tires', 'pneu': 'tires', 'arb': 'arb', 'sway': 'arb', 'câmbio': 'geometry', 'camber': 'geometry', 'caster': 'geometry', 'pit stop': 'pitstop', 'pitstop': 'pitstop' };
  for (const [kw, ref] of Object.entries(refMap)) {
    if (lower.includes(kw)) {
      const refData = window.QUICK_REFS?.[ref];
      if (refData) return refData;
    }
  }

  // Natural language diagnosis
  const kw = window.NL_KEYWORDS || {};
  const isLoose = (kw.loose||[]).some(k => lower.includes(k));
  const isTight = (kw.tight||[]).some(k => lower.includes(k));
  const isEntry = (kw.entry||[]).some(k => lower.includes(k));
  const isCenter = (kw.center||[]).some(k => lower.includes(k));
  const isExit = (kw.exit||[]).some(k => lower.includes(k));

  if (isLoose || isTight) {
    let key = '';
    if (isLoose && isEntry) key = 'loose-entry';
    else if (isLoose && isCenter) key = 'loose-center';
    else if (isLoose && isExit) key = 'loose-exit';
    else if (isTight && isEntry) key = 'tight-entry';
    else if (isTight && isCenter) key = 'tight-center';
    else if (isTight && isExit) key = 'tight-exit';
    else if (isLoose) key = 'loose-entry';
    else if (isTight) key = 'tight-entry';

    const diag = window.DIAGNOSIS_MATRIX?.[key];
    if (diag) {
      const topAdjs = diag.adjustments.slice(0, 3);
      return `**${diag.title}**\n\n${diag.physics}\n\n**Top 3 ajustes recomendados:**\n${topAdjs.map((a, i) => `${i+1}. **${a.component}** → ${a.direction}\n   Leve: ${a.values.mild} | Mod: ${a.values.moderate}\n   _${a.reason}_`).join('\n\n')}\n\n**Pit Road:** ${diag.pitstop_summary}`;
    }
  }

  // Track-specific questions
  const trackKws = [
    ['daytona', 'daytona'], ['talladega', 'talladega'], ['charlotte', 'charlotte'],
    ['bristol', 'bristol'], ['martinsville', 'martinsville'], ['pocono', 'pocono'],
    ['michigan', 'michigan'], ['homestead', 'homestead'], ['texas', 'texas'],
    ['phoenix', 'phoenix'], ['iowa', 'iowa']
  ];
  for (const [kw, id] of trackKws) {
    if (lower.includes(kw)) {
      const track = window.getTrackById?.(id);
      if (track) {
        const rec = track.setup_recommendations;
        return `**${track.name} – Recomendações de Setup:**\n\n${track.description}\n\n**Setup Base:**\n• Pressões: LF:${rec.tire_psi.LF} RF:${rec.tire_psi.RF} LR:${rec.tire_psi.LR} RR:${rec.tire_psi.RR} PSI\n• Molas: LF:${rec.springs.LF} RF:${rec.springs.RF} LR:${rec.springs.LR} RR:${rec.springs.RR} lbs\n• Nose Weight: ${rec.nose_weight}% | Cross: ${rec.cross_weight}%\n• Brake Bias: ${rec.brake_bias}%\n\n**Estratégia:** ${track.strategy}`;
      }
    }
  }

  // Qualificação
  if (lower.includes('qualifica') || lower.includes('quali')) {
    return `**Setup de Qualificação – NASCAR Next Gen:**\n\nPara qualificação (1 volta rápida), o foco muda completamente:\n\n🎯 **Prioridades:**\n• **Pressão de pneus:** 1-2 PSI acima do setup de corrida (pneus mais frios = mais grip na volta fria)\n• **Molas mais firmes:** Melhor controle aerodinâmico na plataforma do chassis\n• **Nose weight levemente maior:** Mais estabilidade em velocidade máxima\n• **ARB mais rígido:** Menos body roll = melhor plataforma aero\n• **Brake bias:** Pode ser mais dianteiro (sem preocupação com desgaste)\n\n⚡ **Diferença para corrida:** Setup de quali é otimizado para 1 volta, pode ser extremamente tight ou instável em voltas longas. Sempre tenha um setup de corrida separado!\n\n**Ajuste típico de quali vs corrida:**\n• RF PSI: +1.5 / RR PSI: +1.0\n• RF Spring: +50 lbs\n• Nose Weight: +0.3%\n• ARB: +1 posição`;
  }

  // Desgaste de pneus
  if (lower.includes('desgaste') || lower.includes('tire wear') || lower.includes('pneu quente')) {
    return `**Gerenciamento de Desgaste – NASCAR Next Gen:**\n\n${window.DIAGNOSIS_MATRIX?.['tire-wear']?.physics || 'Desgaste excessivo requer análise cuidadosa.'}\n\n**Causas comuns:**\n1. Pressão muito baixa → temperatura alta → desgaste acelerado\n2. Câmbio incorreto → desgaste desigual (interno ou externo)\n3. Setup muito tight → dianteiros escorregam → desgaste RF\n4. Driving agressivo na entrada → alto slip angle\n\n**Soluções imediatas (pit road):**\n• Aumentar todas as pressões +0.5-1.0 PSI\n• Ajustar spring perches para melhor equilíbrio\n\n**Soluções de setup:**\n• RF Camber: ajuste para desgaste uniforme\n• Pressões: RF deve estar 2-4 PSI acima de LF no equilíbrio\n• Dirigir: frenagem mais suave reduz 15-20% do desgaste dianteiro`;
  }

  // Generic responses
  const unknownResponses = window.ENGINEER_RESPONSES?.unknown || [];
  if (unknownResponses.length > 0) {
    return unknownResponses[Math.floor(Math.random() * unknownResponses.length)];
  }

  return 'Interessante questão! Pode detalhar mais sobre o comportamento do carro? Em qual fase da curva ocorre o problema?';
}

window.insertRef = function(refKey) {
  const ref = window.QUICK_REFS?.[refKey];
  if (ref) {
    document.getElementById('chat-input').value = 'Me explique sobre: ' + refKey;
    sendChatMessage();
  }
};

function updateEngineerContext() {
  const track = AppState.currentTrack;
  const setup = AppState.currentSetup;
  document.getElementById('eng-track').textContent = track ? track.name : '—';
  document.getElementById('eng-setup').textContent = setup ? (setup.name || 'Setup ativo') : '—';
  document.getElementById('eng-type').textContent = track ? track.type.toUpperCase() : '—';
}

// ─── UTILITIES ────────────────────────────────────────────────────
function formatChatText(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em class="highlight">$1</em>')
    .replace(/•\s/g, '• ')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

function getCurrentTime() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function showNotification(msg, type = 'info') {
  const el = document.createElement('div');
  const colors = { success: '#00d26a', error: '#ff4444', warn: '#ffd700', info: '#3a8dff' };
  el.style.cssText = `position:fixed;top:70px;right:20px;z-index:9999;background:var(--bg-card);border:1px solid ${colors[type]};color:${colors[type]};padding:0.7rem 1.2rem;border-radius:var(--radius-sm);font-size:0.82rem;font-family:'Rajdhani',sans-serif;font-weight:700;max-width:350px;box-shadow:0 4px 20px rgba(0,0,0,0.5);animation:fadeIn 0.3s ease`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}
