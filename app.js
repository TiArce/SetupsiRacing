// =============================================
//  NASCAR Multi-Class – Main Application Logic
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

// ─── CLASS SELECTOR ──────────────────────────────────────────────
window.selectClass = function(cls) {
  window.AppClass = cls;
  localStorage.setItem('nascar_class', cls);

  const overlay = document.getElementById('class-selector-overlay');
  if (overlay) overlay.classList.add('hidden');

  applyClassTheme(cls);

  // Re-init with class context
  loadHistoryForClass(cls);
  updateDashboard();
  updateClassUI(cls);

  // Clear current setup when switching class
  AppState.currentSetup = null;
  updateSetupStatusUI();
  const analysisEmpty = document.getElementById('setup-analysis-empty');
  const analysisResult = document.getElementById('setup-analysis-result');
  const analysisBadge = document.getElementById('analysis-badge');
  if (analysisEmpty) analysisEmpty.style.display = '';
  if (analysisResult) { analysisResult.style.display = 'none'; analysisResult.innerHTML = ''; }
  if (analysisBadge) analysisBadge.style.display = 'none';

  // Re-render advanced simulator if on that page
  if (AppState.currentPage === 'advsim') {
    setTimeout(() => window.renderAdvancedSimulator && window.renderAdvancedSimulator(), 100);
  }

  showNotification(`Classe ${cls} selecionada: ${window.CLASS_CONFIGS?.[cls]?.name || cls}`, 'success');
};

window.showClassSelector = function() {
  const overlay = document.getElementById('class-selector-overlay');
  if (overlay) overlay.classList.remove('hidden');
};

function applyClassTheme(cls) {
  const body = document.body;
  body.classList.remove('class-a','class-b','class-c');
  body.classList.add('class-' + cls.toLowerCase());
  document.documentElement.setAttribute('data-class', cls);
}

function updateClassUI(cls) {
  const cfg = window.CLASS_CONFIGS ? window.CLASS_CONFIGS[cls] : null;
  if (!cfg) return;

  // Update header
  const nameEl = document.getElementById('header-car-name');
  const subEl  = document.getElementById('header-car-sub');
  const badgeEl= document.getElementById('header-class-badge');
  if (nameEl) nameEl.textContent = cfg.name;
  if (subEl)  subEl.textContent  = 'Engenheiro Virtual · iRacing ' + cfg.subtitle;
  if (badgeEl) {
    badgeEl.textContent = 'CLASS ' + cls;
    badgeEl.className = 'header-class-badge badge-' + cls.toLowerCase();
  }

  // Update dashboard hero text
  const heroPEl = document.querySelector('.hero-content p');
  if (heroPEl) heroPEl.textContent = 'Sistema avançado de engenharia de setups para ' + cfg.name + ' · iRacing ' + cfg.subtitle;

  // Update setup page title
  const setupTitleEl = document.querySelector('#page-setup .page-title-bar h2');
  if (setupTitleEl) setupTitleEl.textContent = '🔧 Setup Analyzer – ' + cfg.name;
  const setupSubEl = document.querySelector('#page-setup .page-title-bar p');
  if (setupSubEl) setupSubEl.textContent = 'Cole ou insira seu setup para análise automática · ' + cfg.subtitle;

  // Update advanced sim title
  const simTitle = document.getElementById('advsim-page-title');
  if (simTitle) simTitle.textContent = '🎮 Simulador Avançado de Setup – ' + cfg.name;

  // Rebuild manual form for new class
  renderManualForm(cls);

  // Update pitstop matrix for B/C
  renderPitstopMatrix(cls);

  // Update textarea placeholder for Kapps tab based on class
  const kappsInput = document.getElementById('kapps-input');
  if (kappsInput) {
    if (cls === 'B' || cls === 'C') {
      kappsInput.placeholder = [
        cls === 'B' ? '18:30:58' : '18:29:09',
        'Tires',
        'LeftFront',
        'ColdPressure\t' + (cls === 'B' ? '172 kPa' : '179 kPa'),
        'LastHotPressure\t' + (cls === 'B' ? '172 kPa' : '179 kPa'),
        'LastTempsOMI\t40C, 40C, 40C',
        'TreadRemaining\t100%, 100%, 100%',
        'RightFront',
        'ColdPressure\t310 kPa',
        '...',
        'Chassis',
        'Front',
        'NoseWeight\t' + (cls === 'B' ? '51.1%' : '50.1%'),
        'CrossWeight\t' + (cls === 'B' ? '52.0%' : '50.5%'),
        '...',
      ].join('\n');
    } else {
      kappsInput.placeholder = '22:07:21\nTires\nLeftFront\nColdPressure\t138"\nHotPressure\t152"\n...';
    }
  }
}

// ─── DYNAMIC MANUAL FORM RENDERER ────────────────────────────────
function renderManualForm(cls) {
  const container = document.getElementById('manual-form');
  if (!container) return;
  const isBorC = cls === 'B' || cls === 'C';

  if (!isBorC) {
    // Class A: restore static form (in case user was on B/C before)
    // Only rebuild if the form doesn't already have Class A fields
    if (!document.getElementById('mf-lf-psi') || container.querySelector('.class-b-form')) {
      container.innerHTML = `
      <div class="mf-section">
        <div class="mf-section-title">🛞 Pneus – Pressão Fria (PSI)</div>
        <div class="mf-grid-4">
          <div class="mf-field"><label>LF</label><input type="number" id="mf-lf-psi" value="28" step="0.5" min="15" max="45"/></div>
          <div class="mf-field"><label>RF</label><input type="number" id="mf-rf-psi" value="28" step="0.5" min="15" max="45"/></div>
          <div class="mf-field"><label>LR</label><input type="number" id="mf-lr-psi" value="22" step="0.5" min="15" max="45"/></div>
          <div class="mf-field"><label>RR</label><input type="number" id="mf-rr-psi" value="24" step="0.5" min="15" max="45"/></div>
        </div>
      </div>
      <div class="mf-section">
        <div class="mf-section-title">🌀 Molas (lbs/in)</div>
        <div class="mf-grid-4">
          <div class="mf-field"><label>LF Spring</label><input type="number" id="mf-lf-spring" value="550" step="25" min="150" max="2500"/></div>
          <div class="mf-field"><label>RF Spring</label><input type="number" id="mf-rf-spring" value="600" step="25" min="150" max="2500"/></div>
          <div class="mf-field"><label>LR Spring</label><input type="number" id="mf-lr-spring" value="200" step="25" min="100" max="2000"/></div>
          <div class="mf-field"><label>RR Spring</label><input type="number" id="mf-rr-spring" value="225" step="25" min="100" max="2000"/></div>
        </div>
      </div>
      <div class="mf-section">
        <div class="mf-section-title">📏 Ride Height (in)</div>
        <div class="mf-grid-4">
          <div class="mf-field"><label>LF RH</label><input type="number" id="mf-lf-rh" value="3.5" step="0.1" min="1" max="8"/></div>
          <div class="mf-field"><label>RF RH</label><input type="number" id="mf-rf-rh" value="3.2" step="0.1" min="1" max="8"/></div>
          <div class="mf-field"><label>LR RH</label><input type="number" id="mf-lr-rh" value="5.5" step="0.1" min="1" max="10"/></div>
          <div class="mf-field"><label>RR RH</label><input type="number" id="mf-rr-rh" value="4.8" step="0.1" min="1" max="10"/></div>
        </div>
      </div>
      <div class="mf-section">
        <div class="mf-section-title">⚖️ Peso & Geometria</div>
        <div class="mf-grid-3">
          <div class="mf-field"><label>Nose Weight %</label><input type="number" id="mf-nose" value="52.0" step="0.1" min="48" max="56"/></div>
          <div class="mf-field"><label>Cross Weight %</label><input type="number" id="mf-cross" value="50.0" step="0.1" min="46" max="54"/></div>
          <div class="mf-field"><label>Brake Bias %</label><input type="number" id="mf-bb" value="54.0" step="0.1" min="48" max="62"/></div>
        </div>
      </div>
      <div class="mf-section">
        <div class="mf-section-title">📐 Geometria – Câmbio/Caster/Toe</div>
        <div class="mf-grid-4">
          <div class="mf-field"><label>LF Camber</label><input type="number" id="mf-lf-camber" value="3.5" step="0.1" min="0" max="6"/></div>
          <div class="mf-field"><label>RF Camber</label><input type="number" id="mf-rf-camber" value="-4.5" step="0.1" min="-7" max="0"/></div>
          <div class="mf-field"><label>LF Caster</label><input type="number" id="mf-lf-caster" value="4.0" step="0.1" min="2" max="8"/></div>
          <div class="mf-field"><label>RF Caster</label><input type="number" id="mf-rf-caster" value="6.0" step="0.1" min="2" max="10"/></div>
          <div class="mf-field"><label>LF Toe</label><input type="number" id="mf-lf-toe" value="0.05" step="0.01" min="-0.2" max="0.2"/></div>
          <div class="mf-field"><label>RF Toe</label><input type="number" id="mf-rf-toe" value="-0.05" step="0.01" min="-0.2" max="0.2"/></div>
          <div class="mf-field"><label>LR Camber</label><input type="number" id="mf-lr-camber" value="0.5" step="0.1" min="-2" max="3"/></div>
          <div class="mf-field"><label>RR Camber</label><input type="number" id="mf-rr-camber" value="-3.0" step="0.1" min="-5" max="0"/></div>
        </div>
      </div>
      <div class="mf-section">
        <div class="mf-section-title">🔗 Anti-Roll Bar (ARB)</div>
        <div class="mf-grid-4">
          <div class="mf-field"><label>Front Diameter</label>
            <select id="mf-f-arb-diam">
              <option value="2.00">2.00" (Rígido)</option>
              <option value="1.375" selected>1.375" (Macio)</option>
            </select>
          </div>
          <div class="mf-field"><label>Front ARB Arm</label>
            <select id="mf-f-arb-arm">
              <option value="1">P1</option><option value="2">P2</option>
              <option value="3" selected>P3</option><option value="4">P4</option><option value="5">P5</option>
            </select>
          </div>
          <div class="mf-field"><label>Rear Diameter</label>
            <select id="mf-r-arb-diam">
              <option value="2.00">2.00" (Rígido)</option>
              <option value="1.375" selected>1.375" (Macio)</option>
            </select>
          </div>
          <div class="mf-field"><label>Rear ARB Arm</label>
            <select id="mf-r-arb-arm">
              <option value="1">P1</option><option value="2">P2</option>
              <option value="3" selected>P3</option><option value="4">P4</option><option value="5">P5</option>
            </select>
          </div>
        </div>
      </div>
      <div class="mf-section">
        <div class="mf-section-title">🔩 Amortecedores</div>
        <div class="shock-grid">
          ${['lf','rf','lr','rr'].map(c => `
          <div class="shock-corner">
            <div class="sc-label">${c.toUpperCase()}</div>
            <div class="sc-fields">
              <div class="mf-field"><label>LS Comp</label><input type="number" id="mf-${c}-lsc" value="5" step="1" min="1" max="12"/></div>
              <div class="mf-field"><label>HS Comp</label><input type="number" id="mf-${c}-hsc" value="4" step="1" min="1" max="12"/></div>
              <div class="mf-field"><label>LS Reb</label><input type="number" id="mf-${c}-lsr" value="6" step="1" min="1" max="12"/></div>
              <div class="mf-field"><label>HS Reb</label><input type="number" id="mf-${c}-hsr" value="5" step="1" min="1" max="12"/></div>
            </div>
          </div>`).join('')}
        </div>
      </div>
      <div class="mf-actions">
        <input type="text" id="setup-name-input" placeholder="Nome do setup (ex: Daytona_Q1)" class="setup-name-field"/>
        <button class="btn-primary" onclick="analyzeManualSetup()">🔍 Analisar Setup</button>
        <button class="btn-secondary" onclick="saveCurrentSetup()">💾 Salvar</button>
      </div>
      `;
    }
    return;
  }
  const cfg = window.CLASS_CONFIGS[cls];
  const sd = cfg.sim_defaults;
  const uPres = cfg.pressure_unit;
  const uSpring = cfg.spring_unit;
  const uHeight = cfg.height_unit;

  const frontSpringLabel = cls === 'C' ? `Mola Dianteira (${uSpring}) – Pigtail` : `Shock Spring Dianteira (${uSpring})`;
  const lf_shock_def = cls === 'B' ? 1575 : 1575;
  const rf_shock_def = cls === 'B' ? 1575 : 1575;

  container.innerHTML = `
    <!-- Pressures -->
    <div class="mf-section">
      <div class="mf-section-title">🛞 Pneus – Pressão Fria (${uPres})</div>
      <div class="mf-grid-4">
        <div class="mf-field"><label>LF</label><input type="number" id="mf-lf-psi" value="${cls==='B'?172:179}" step="1" min="100" max="400"/></div>
        <div class="mf-field"><label>RF</label><input type="number" id="mf-rf-psi" value="310" step="1" min="200" max="450"/></div>
        <div class="mf-field"><label>LR</label><input type="number" id="mf-lr-psi" value="${cls==='B'?172:179}" step="1" min="100" max="400"/></div>
        <div class="mf-field"><label>RR</label><input type="number" id="mf-rr-psi" value="310" step="1" min="200" max="450"/></div>
      </div>
    </div>

    <!-- Front Springs (Shock Spring or Pigtail) -->
    <div class="mf-section">
      <div class="mf-section-title">🌀 ${frontSpringLabel}</div>
      <div class="mf-grid-4">
        <div class="mf-field"><label>LF Shock Spring</label><input type="number" id="mf-lf-shock-spring" value="${lf_shock_def}" step="25" min="100" max="3000"/></div>
        <div class="mf-field"><label>RF Shock Spring</label><input type="number" id="mf-rf-shock-spring" value="${rf_shock_def}" step="25" min="100" max="3000"/></div>
        ${cls==='C' ? `
        <div class="mf-field"><label>LF Spring Angle °</label><input type="number" id="mf-lf-spring-angle" value="35" step="1" min="0" max="90"/></div>
        <div class="mf-field"><label>RF Spring Angle °</label><input type="number" id="mf-rf-spring-angle" value="5" step="1" min="0" max="90"/></div>
        ` : `
        <div class="mf-field"><label>LF Packer mm</label><input type="number" id="mf-lf-packer" value="12.7" step="1.27" min="0" max="50"/></div>
        <div class="mf-field"><label>RF Packer mm</label><input type="number" id="mf-rf-packer" value="25.4" step="1.27" min="0" max="50"/></div>
        `}
      </div>
      <!-- Also map to generic lf_spring / rf_spring for analysis -->
      <input type="hidden" id="mf-lf-spring" value="${lf_shock_def}"/>
      <input type="hidden" id="mf-rf-spring" value="${rf_shock_def}"/>
    </div>

    <!-- Rear Springs -->
    <div class="mf-section">
      <div class="mf-section-title">🌀 Molas Traseiras (${uSpring})</div>
      <div class="mf-grid-4">
        <div class="mf-field"><label>LR Spring</label><input type="number" id="mf-lr-spring" value="${cls==='B'?70:131}" step="5" min="5" max="500"/></div>
        <div class="mf-field"><label>RR Spring</label><input type="number" id="mf-rr-spring" value="${cls==='B'?35:236}" step="5" min="5" max="500"/></div>
      </div>
    </div>

    <!-- Ride Heights -->
    <div class="mf-section">
      <div class="mf-section-title">📏 Ride Heights (${uHeight})</div>
      <div class="mf-grid-4">
        <div class="mf-field"><label>LF RH</label><input type="number" id="mf-lf-rh" value="${sd.lf_rh||108}" step="1" min="50" max="300"/></div>
        <div class="mf-field"><label>RF RH</label><input type="number" id="mf-rf-rh" value="${sd.rf_rh||110}" step="1" min="50" max="300"/></div>
        <div class="mf-field"><label>LR RH</label><input type="number" id="mf-lr-rh" value="${sd.lr_rh||162}" step="1" min="50" max="350"/></div>
        <div class="mf-field"><label>RR RH</label><input type="number" id="mf-rr-rh" value="${sd.rr_rh||164}" step="1" min="50" max="350"/></div>
      </div>
    </div>

    <!-- Track Bar -->
    <div class="mf-section">
      <div class="mf-section-title">📏 Track Bar (mm)</div>
      <div class="mf-grid-4">
        <div class="mf-field"><label>LR Track Bar</label><input type="number" id="mf-lr-trackbar" value="${cls==='B'?159:222}" step="1" min="80" max="350"/></div>
        <div class="mf-field"><label>RR Track Bar</label><input type="number" id="mf-rr-trackbar" value="${cls==='B'?165:229}" step="1" min="80" max="350"/></div>
      </div>
    </div>

    <!-- Chassis / Weight -->
    <div class="mf-section">
      <div class="mf-section-title">⚖️ Chassi & Peso</div>
      <div class="mf-grid-3">
        <div class="mf-field"><label>Nose Weight %</label><input type="number" id="mf-nose" value="${sd.nose_weight||51.1}" step="0.1" min="47" max="56"/></div>
        <div class="mf-field"><label>Cross Weight %</label><input type="number" id="mf-cross" value="${sd.cross_weight||52.0}" step="0.1" min="46" max="56"/></div>
        <div class="mf-field"><label>Brake Bias %</label><input type="number" id="mf-bb" value="${sd.brake_bias||65.0}" step="0.1" min="55" max="75"/></div>
      </div>
      <div class="mf-grid-3" style="margin-top:0.5rem">
        <div class="mf-field"><label>Ballast Forward mm</label><input type="number" id="mf-ballast-forward" value="${cls==='B'?838:-559}" step="10" min="-1200" max="1200"/></div>
        <div class="mf-field"><label>Steering Ratio</label><input type="number" id="mf-steering-ratio" value="841" step="1" min="600" max="1200"/></div>
        <div class="mf-field"><label>Steering Offset °</label><input type="number" id="mf-steering-offset" value="${cls==='B'?14:3}" step="1" min="-30" max="30"/></div>
      </div>
    </div>

    <!-- Geometry -->
    <div class="mf-section">
      <div class="mf-section-title">📐 Geometria – Câmbio/Caster/Toe</div>
      <div class="mf-grid-4">
        <div class="mf-field"><label>LF Camber °</label><input type="number" id="mf-lf-camber" value="${sd.lf_camber||5.9}" step="0.1" min="0" max="9"/></div>
        <div class="mf-field"><label>RF Camber °</label><input type="number" id="mf-rf-camber" value="${sd.rf_camber||-3.3}" step="0.1" min="-7" max="0"/></div>
        <div class="mf-field"><label>LF Caster °</label><input type="number" id="mf-lf-caster" value="${cls==='B'?13.3:7.7}" step="0.1" min="3" max="20"/></div>
        <div class="mf-field"><label>RF Caster °</label><input type="number" id="mf-rf-caster" value="${cls==='B'?13.3:7.7}" step="0.1" min="3" max="20"/></div>
        <div class="mf-field"><label>LF Toe mm</label><input type="number" id="mf-lf-toe" value="-6" step="1" min="-15" max="10"/></div>
        <div class="mf-field"><label>RF Toe mm</label><input type="number" id="mf-rf-toe" value="-6" step="1" min="-15" max="10"/></div>
        <div class="mf-field"><label>LR Camber °</label><input type="number" id="mf-lr-camber" value="0" step="0.1" min="-3" max="3"/></div>
        <div class="mf-field"><label>RR Camber °</label><input type="number" id="mf-rr-camber" value="0" step="0.1" min="-3" max="3"/></div>
      </div>
    </div>

    <!-- ARB -->
    <div class="mf-section">
      <div class="mf-section-title">🔗 Anti-Roll Bar (ARB)</div>
      <div class="mf-grid-4">
        <div class="mf-field"><label>Front Diameter mm</label><input type="number" id="mf-f-arb-diam" value="${cls==='C'?64:51}" step="1" min="20" max="80"/></div>
        <div class="mf-field"><label>Front ARB Arm</label>
          <select id="mf-f-arb-arm">
            <option value="1">P1 (Mais macio)</option>
            <option value="2">P2</option>
            <option value="3">P3</option>
            <option value="4">P4</option>
            <option value="5" selected>P5 (Mais rígido)</option>
            ${cls==='C'?'<option value="6">Max</option>':''}
          </select>
        </div>
        <div class="mf-field"><label>ARB Link Slack mm</label><input type="number" id="mf-f-arb-link-slack" value="${cls==='B'?-1:19}" step="1" min="-15" max="60"/></div>
        <div class="mf-field"><label>ARB Preload Nm</label><input type="number" id="mf-f-arb-preload" value="${cls==='B'?-182.4:0}" step="10" min="-400" max="400"/></div>
        <input type="hidden" id="mf-r-arb-diam" value="0"/>
        <input type="hidden" id="mf-r-arb-arm" value="0"/>
      </div>
    </div>

    <!-- Truck Arm -->
    <div class="mf-section">
      <div class="mf-section-title">🔧 Truck Arm</div>
      <div class="mf-grid-3">
        <div class="mf-field"><label>Mount Position</label>
          <select id="mf-truck-arm-mount">
            <option value="bottom" selected>Bottom (mais grip)</option>
            <option value="top">Top (mais rotação)</option>
          </select>
        </div>
        <div class="mf-field"><label>Preload Nm</label><input type="number" id="mf-truck-arm-preload" value="${cls==='B'?0:-7.8}" step="1" min="-50" max="50"/></div>
        <div class="mf-field"><label>Rear End Ratio</label><input type="number" id="mf-rear-end-ratio" value="${cls==='B'?3.89:3.33}" step="0.01" min="2.5" max="5.5"/></div>
      </div>
    </div>

    <!-- Tape -->
    <div class="mf-section">
      <div class="mf-section-title">🏁 Configuração de Fita</div>
      <div class="mf-grid-3">
        <div class="mf-field"><label>Tape Configuration</label>
          <select id="mf-tape-config">
            <option value="Qual">Qual (mais velocidade)</option>
            <option value="Race" selected>Race (equilíbrio)</option>
            <option value="Open">Open (mais resfriamento)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Shocks -->
    <div class="mf-section">
      <div class="mf-section-title">🔩 Amortecedores</div>
      <div class="shock-grid">
        ${['lf','rf','lr','rr'].map(c => `
        <div class="shock-corner">
          <div class="sc-label">${c.toUpperCase()}</div>
          <div class="sc-fields">
            <div class="mf-field"><label>LS Comp</label><input type="number" id="mf-${c}-lsc" value="5" step="1" min="1" max="16"/></div>
            <div class="mf-field"><label>HS Comp</label><input type="number" id="mf-${c}-hsc" value="4" step="1" min="1" max="16"/></div>
            <div class="mf-field"><label>LS Reb</label><input type="number" id="mf-${c}-lsr" value="6" step="1" min="1" max="16"/></div>
            <div class="mf-field"><label>HS Reb</label><input type="number" id="mf-${c}-hsr" value="5" step="1" min="1" max="16"/></div>
          </div>
        </div>`).join('')}
      </div>
    </div>

    <div class="mf-actions">
      <input type="text" id="setup-name-input" placeholder="Nome do setup (ex: Charlotte_Race_${cls})" class="setup-name-field"/>
      <button class="btn-primary" onclick="analyzeManualSetup()">🔍 Analisar Setup</button>
      <button class="btn-secondary" onclick="saveCurrentSetup()">💾 Salvar</button>
    </div>
  `;

  // Sync hidden lf/rf spring with shock spring on input
  const syncHidden = (id, hiddenId) => {
    const el = document.getElementById(id);
    const hid = document.getElementById(hiddenId);
    if (el && hid) el.addEventListener('input', () => hid.value = el.value);
  };
  syncHidden('mf-lf-shock-spring', 'mf-lf-spring');
  syncHidden('mf-rf-shock-spring', 'mf-rf-spring');
}

// ─── INIT ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Check saved class preference
  const savedClass = localStorage.getItem('nascar_class') || 'A';

  // Show overlay if no saved class (first visit) OR always show on load
  const overlay = document.getElementById('class-selector-overlay');
  // If they have a saved class, auto-load it but still show overlay briefly for UX
  if (savedClass && savedClass !== 'A' || localStorage.getItem('nascar_class')) {
    // User has been here before — skip overlay, load directly
    window.AppClass = savedClass;
    if (overlay) overlay.classList.add('hidden');
    applyClassTheme(savedClass);
    updateClassUI(savedClass);
  }
  // else overlay stays visible (new user must pick a class)

  loadHistoryForClass(window.AppClass || 'A');
  setupNavigation();
  setupTabSwitching();
  initTracksList();
  initDynamics();
  initChat();
  updateDashboard();
  // Apply class-specific UI for the loaded/saved class
  updateClassUI(window.AppClass || 'A');
});

function loadHistoryForClass(cls) {
  try {
    const key = 'nascar_setups_' + cls;
    const saved = localStorage.getItem(key);
    AppState.setupHistory = saved ? JSON.parse(saved) : [];
    // Also check legacy key for Class A
    if (cls === 'A' && !saved) {
      const legacy = localStorage.getItem('nascar_setups');
      if (legacy) AppState.setupHistory = JSON.parse(legacy);
    }
  } catch(e) { AppState.setupHistory = []; }
  renderHistoryList();
}

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

  setup.source = 'iracing';
  AppState.currentSetup = setup;
  AppState.currentSetup.name = 'Setup Importado';
  AppState.currentSetup.timestamp = new Date().toISOString();
  renderSetupAnalysis(setup);
  updateDashboard();
  updateSetupStatusUI();
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

// ─── KAPPS FORMAT PARSER ─────────────────────────────────────────
// The Kapps app uses a hierarchical indented format:
//   22:07:21              <- first line = timestamp ID (HH:MM:SS)
//   Tires                 <- section (no brackets)
//   LeftFront             <- subsection / corner
//   ColdPressure   138"   <- field TAB value (TAB or spaces, value may have unit suffix)
//   ...
// Sections: Tires, Chassis, Front, Rear, LeftFront, RightFront, LeftRear, RightRear,
//           Crossweight, Aero, Brakes, Geometry, etc.

window.clearKappsInput = function() {
  document.getElementById('kapps-input').value = '';
  document.getElementById('kapps-setup-name').value = '';
  const bar = document.getElementById('kapps-status-bar');
  if (bar) { bar.style.display = 'none'; bar.innerHTML = ''; }
};

window.parseKappsSetup = function() {
  const text = document.getElementById('kapps-input').value.trim();
  if (!text) {
    showNotification('Cole o conteúdo do Kapps primeiro.', 'error');
    return;
  }

  const setup = parseKappsText(text);
  if (!setup) {
    showNotification('Formato Kapps não reconhecido. Verifique o conteúdo.', 'warn');
    return;
  }

  // Allow user to override the auto-name
  const userNameInput = document.getElementById('kapps-setup-name');
  const userName = userNameInput ? userNameInput.value.trim() : '';
  if (userName) setup.name = userName;

  AppState.currentSetup = setup;
  AppState.currentSetup.isActive = false; // not yet set active
  renderSetupAnalysis(setup);
  updateDashboard();
  updateSetupStatusUI();

  // Show status bar
  const bar = document.getElementById('kapps-status-bar');
  if (bar) {
    const fieldsCount = Object.keys(setup).filter(k => !['raw','name','timestamp','source','kappsId','isActive'].includes(k)).length;
    bar.style.display = 'flex';
    bar.innerHTML = `
      <span class="ksb-ok">✅ Setup Kapps importado</span>
      <span class="ksb-id">ID: ${setup.kappsId || '—'}</span>
      <span class="ksb-fields">${fieldsCount} parâmetros lidos</span>
    `;
  }

  showNotification(`Setup Kapps "${setup.name}" importado com sucesso!`, 'success');
};

function parseKappsValue(raw) {
  // Remove unit suffixes: 138" → 138, 50.1% → 50.1, 97% → 97, 152" → 152
  if (raw === undefined || raw === null) return null;
  const s = String(raw).trim();
  if (s === '' || s === '-' || s === 'N/A' || s === '--') return null;
  // Strip trailing " % degrees etc.
  const cleaned = s.replace(/["'°%#\s]+$/, '').replace(/,/g, '.').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? cleaned : num;
}

function parseKappsText(text) {
  const lines = text.split('\n');
  if (!lines.length) return null;

  const cls = window.AppClass || 'A';
  const setup = { raw: text, source: 'kapps', carClass: cls };

  // First non-empty line = timestamp ID
  let idLine = '';
  let startIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t) { idLine = t; startIdx = i + 1; break; }
  }
  const timeRe = /^\d{1,2}:\d{2}(:\d{2})?$/;
  if (timeRe.test(idLine)) {
    setup.kappsId = idLine;
    setup.name = 'Kapps ' + idLine;
  } else {
    setup.kappsId = idLine;
    setup.name = 'Kapps Setup';
    startIdx = 0;
  }
  setup.timestamp = new Date().toISOString();

  let section = '';
  let corner = '';
  let subSection = '';

  const cornerMap = {
    'leftfront': 'lf', 'rightfront': 'rf', 'leftrear': 'lr', 'rightrear': 'rr',
    'lf': 'lf', 'rf': 'rf', 'lr': 'lr', 'rr': 'rr',
  };

  // Pressure handling: Class A uses kPa→PSI, Class B/C keep raw kPa
  const isBorC = cls === 'B' || cls === 'C';
  const processPressure = (v) => {
    if (!v) return null;
    // "172 kPa" → strip "kPa" → 172
    const n = typeof v === 'string' ? parseFloat(v.replace(/[^\d.]/g,'')) : v;
    if (isBorC) return n; // keep kPa for B/C
    return n > 50 ? Math.round((n / 6.89476) * 10) / 10 : n; // kPa→PSI for A
  };

  // Parse comma-separated temps: "40C, 40C, 40C" or "183, 184, 182"
  const parseTriple = (s) => {
    const parts = String(s).split(',').map(p => parseFloat(p.replace(/[^\d.]/g,''))).filter(n => !isNaN(n));
    return parts.length >= 3 ? parts : null;
  };

  for (let i = startIdx; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trimEnd();
    if (!line.trim()) continue;

    const indent = line.length - line.trimStart().length;
    const trimmed = line.trim();
    const lower = trimmed.toLowerCase().replace(/\s+/g, '');

    // ── Section/corner headers (no tab separator) ──
    const hasSep = trimmed.includes('\t') || trimmed.match(/\s{3,}/);
    if (!hasSep) {
      switch (lower) {
        case 'tires': case 'tire':
          section = 'tires'; corner = ''; subSection = ''; continue;
        case 'chassis':
          section = 'chassis'; corner = ''; subSection = ''; continue;
        case 'front':
          if (section !== 'tires') { subSection = 'front'; corner = ''; } continue;
        case 'rear':
          if (section !== 'tires') { subSection = 'rear'; corner = ''; } continue;
        case 'frontarb': case 'arb': case 'antirollbar': case 'anti-roll':
          section = 'arb'; corner = ''; subSection = 'front'; continue;
        case 'reararb':
          section = 'arb'; corner = ''; subSection = 'rear'; continue;
        case 'aero': case 'aerodynamics':
          section = 'aero'; corner = ''; subSection = ''; continue;
        case 'brakes': case 'brake':
          section = 'brakes'; corner = ''; subSection = ''; continue;
        case 'geometry': case 'suspension':
          section = 'geometry'; corner = ''; subSection = ''; continue;
        case 'drivetrain': case 'differential':
          section = 'drivetrain'; corner = ''; subSection = ''; continue;
        case 'pitroad': case 'pit':
          section = 'pitroad'; corner = ''; subSection = ''; continue;
        case 'springs':
          section = 'springs'; corner = ''; subSection = ''; continue;
        case 'shocks': case 'dampers':
          section = 'shocks'; corner = ''; subSection = ''; continue;
        case 'leftfront': case 'left front':
          corner = 'lf'; continue;
        case 'rightfront': case 'right front':
          corner = 'rf'; continue;
        case 'leftrear': case 'left rear':
          corner = 'lr'; continue;
        case 'rightrear': case 'right rear':
          corner = 'rr'; continue;
        default:
          if (cornerMap[lower]) { corner = cornerMap[lower]; continue; }
      }
    }

    // ── Field–value parsing ──
    let fieldName = '', fieldValue = '';
    if (trimmed.includes('\t')) {
      const ti = trimmed.indexOf('\t');
      fieldName = trimmed.substring(0, ti).trim();
      fieldValue = trimmed.substring(ti + 1).trim();
    } else if (trimmed.includes('=')) {
      const ei = trimmed.indexOf('=');
      fieldName = trimmed.substring(0, ei).trim();
      fieldValue = trimmed.substring(ei + 1).trim();
    } else {
      const ms = trimmed.match(/^(\S.*?)\s{3,}(.+)$/);
      if (ms) { fieldName = ms[1].trim(); fieldValue = ms[2].trim(); }
      else continue;
    }

    const fLower = fieldName.toLowerCase().replace(/\s+/g, '');
    const val = parseKappsValue(fieldValue);
    const pfx = corner || '';

    // ─── TIRES ───
    if (section === 'tires' && pfx) {
      if (fLower === 'coldpressure' || fLower === 'cold' || fLower === 'coldpsi') {
        setup[pfx + '_psi'] = processPressure(fieldValue);
        setup[pfx + '_psi_raw'] = fieldValue.trim();
      } else if (fLower === 'hotpressure' || fLower === 'hot' || fLower === 'hotpsi') {
        setup[pfx + '_hot_psi'] = processPressure(fieldValue);
      } else if (fLower === 'lasthotpressure' || fLower === 'lasthot') {
        setup[pfx + '_lasthot_psi'] = processPressure(fieldValue);
      }
      // "LastTempsOMI" or "LastTempsIMO" → O=Outside, M=Middle, I=Inside
      else if (fLower === 'lasttempomi' || fLower === 'lasttempsomi') {
        const t = parseTriple(fieldValue);
        if (t) { setup[pfx+'_temp_out']=t[0]; setup[pfx+'_temp_mid']=t[1]; setup[pfx+'_temp_in']=t[2]; }
      } else if (fLower === 'lasttempimo' || fLower === 'lasttempsimo') {
        // IMO = Inside, Middle, Outside (reversed)
        const t = parseTriple(fieldValue);
        if (t) { setup[pfx+'_temp_in']=t[0]; setup[pfx+'_temp_mid']=t[1]; setup[pfx+'_temp_out']=t[2]; }
      }
      // "TreadRemaining 100%, 100%, 100%"
      else if (fLower === 'treadremaining' || fLower === 'tread') {
        const t = parseTriple(fieldValue);
        if (t) { setup[pfx+'_tread_out']=t[0]; setup[pfx+'_tread_mid']=t[1]; setup[pfx+'_tread_in']=t[2]; }
      }
      // Legacy individual fields
      else if (fLower === 'tempoutside' || fLower === 'tempout') setup[pfx+'_temp_out'] = val;
      else if (fLower === 'tempmiddle' || fLower === 'tempmid') setup[pfx+'_temp_mid'] = val;
      else if (fLower === 'tempinside'  || fLower === 'tempin')  setup[pfx+'_temp_in']  = val;
      else if (fLower === 'treadoutside' || fLower === 'treadout') setup[pfx+'_tread_out'] = val;
      else if (fLower === 'treadmiddle'  || fLower === 'treadmid') setup[pfx+'_tread_mid'] = val;
      else if (fLower === 'treadinside'  || fLower === 'treadin')  setup[pfx+'_tread_in']  = val;
    }

    // ─── SPRINGS ───
    if (pfx && (fLower === 'springrate' || fLower === 'spring' || fLower === 'rate')) {
      setup[pfx + '_spring'] = val;
    }
    if (pfx && fLower === 'shockspringrate') {
      // Class B/C: front pigtail / shock spring (N/mm)
      setup[pfx + '_shock_spring'] = val;
      if (!setup[pfx + '_spring']) setup[pfx + '_spring'] = val; // use as fallback
    }
    if (pfx && (fLower === 'springangle' || fLower === 'sprangle')) {
      setup[pfx + '_spring_angle'] = val;
    }
    if (pfx && fLower === 'springperchoffset') {
      setup[pfx + '_perch'] = val;
    }
    if (pfx && (fLower === 'packer' || fLower === 'packers')) {
      // "12.7 mm shim" or just "12.7"
      const packerVal = parseFloat(fieldValue);
      setup[pfx + '_packer'] = isNaN(packerVal) ? val : packerVal;
    }
    if (pfx && fLower === 'traveltocoilbind') {
      setup[pfx + '_coilbind'] = val;
    }

    // ─── RIDE HEIGHTS ───
    if (pfx && fLower === 'rideheight') {
      setup[pfx + '_rh'] = val;
    }

    // ─── SHOCKS ───
    if (pfx && (fLower === 'lscompression' || fLower === 'lowspeedcompression' || fLower === 'lscomp')) {
      setup[pfx + '_lsc'] = val;
    }
    if (pfx && (fLower === 'hscompression' || fLower === 'highspeedcompression' || fLower === 'hscomp')) {
      setup[pfx + '_hsc'] = val;
    }
    if (pfx && (fLower === 'hscompslope' || fLower === 'highspeedcompslope')) {
      setup[pfx + '_hsc_slope'] = val;
    }
    if (pfx && (fLower === 'lsrebound' || fLower === 'lowspeedrebound' || fLower === 'lsreb')) {
      setup[pfx + '_lsr'] = val;
    }
    if (pfx && (fLower === 'hsrebound' || fLower === 'highspeedrebound' || fLower === 'hsreb')) {
      setup[pfx + '_hsr'] = val;
    }
    if (pfx && (fLower === 'hsreboundslope' || fLower === 'highspeedreboundslope')) {
      setup[pfx + '_hsr_slope'] = val;
    }

    // ─── CAMBER / CASTER / TOE ───
    if (pfx && fLower === 'camber') setup[pfx + '_camber'] = val;
    if (pfx && fLower === 'caster') setup[pfx + '_caster'] = val;
    if (pfx && fLower === 'toein') setup[pfx + '_toe'] = val;
    if (fLower === 'leftreartoeintgt' || fLower === 'leftreartoe' || fLower === 'leftreartoin')
      setup['lr_toe'] = val;
    if (fLower === 'rightreartoeintgt' || fLower === 'rightreartoe' || fLower === 'rightreartoin')
      setup['rr_toe'] = val;

    // ─── TRACK BAR (on corner) ───
    if (pfx && (fLower === 'trackbarheight' || fLower === 'trackbar')) {
      setup[pfx + '_trackbar'] = val;
      if (pfx === 'lr' || pfx === 'rr') setup.track_bar = val; // generic
    }

    // ─── TRUCK ARM ───
    if (pfx && fLower === 'truckarmmount') {
      setup[pfx + '_truck_arm'] = fieldValue.trim();
      setup.truck_arm_mount = fieldValue.trim();
    }
    if (pfx && fLower === 'truckarmpreload') {
      setup[pfx + '_truck_arm_preload'] = val;
      setup.truck_arm_preload = val;
    }

    // ─── CORNER WEIGHT (in N for B/C, lbs for A) ───
    if (pfx && (fLower === 'cornerweight' || fLower === 'weight')) {
      setup[pfx + '_corner_weight'] = val;
    }

    // ─── CHASSIS FRONT SECTION ───
    if (subSection === 'front' || section === 'chassis') {
      if (fLower === 'noseweight' || fLower === 'frontweight') {
        setup.nose_weight = val;
      } else if (fLower === 'crossweight') {
        setup.cross_weight = val;
      } else if (fLower === 'frontbrakebiaspct' || fLower === 'frontbrakebias' || fLower === 'brakebias') {
        setup.brake_bias = val;
      } else if (fLower === 'ballastforward') {
        setup.ballast_forward = val;
      } else if (fLower === 'steeringratio') {
        setup.steering_ratio = val;
      } else if (fLower === 'steeringoffset') {
        setup.steering_offset = val;
      } else if (fLower === 'tapeconfiguration' || fLower === 'tape') {
        setup.tape_config = fieldValue.trim();
      }
    }

    // ─── ARB (FrontArb section) ───
    if (section === 'arb') {
      const side = subSection === 'rear' ? 'r' : 'f';
      if (fLower === 'diameter') setup[side + '_arb_diam'] = fieldValue.trim();
      else if (fLower === 'armasymmetry' || fLower === 'arm') setup[side + '_arb_arm'] = fieldValue.trim();
      else if (fLower === 'linkslack') setup[side + '_arb_link_slack'] = val;
      else if (fLower === 'preload') setup[side + '_arb_preload'] = val;
      else if (fLower === 'attach') setup[side + '_arb_attach'] = val;
    }

    // ─── REAR SECTION ───
    if (subSection === 'rear' || section === 'drivetrain') {
      if (fLower === 'rearendratio') setup.final_drive = val;
      if (fLower === 'diffpreload') setup.diff_preload = val;
    }

    // ─── AERO ───
    if (section === 'aero') {
      if (fLower === 'rearspoiler' || fLower === 'spoiler') setup.rear_spoiler = val;
      if (fLower === 'frontsplitter' || fLower === 'splitter') setup.front_splitter = val;
    }
  }

  // ── Post-processing ──
  // Derive nose weight from corner weights
  const cw_lf = setup.lf_corner_weight, cw_rf = setup.rf_corner_weight,
        cw_lr = setup.lr_corner_weight, cw_rr = setup.rr_corner_weight;
  if (!setup.nose_weight && cw_lf && cw_rf && cw_lr && cw_rr) {
    const total = cw_lf + cw_rf + cw_lr + cw_rr;
    setup.nose_weight = Math.round(((cw_lf + cw_rf) / total) * 1000) / 10;
    if (!setup.cross_weight) {
      setup.cross_weight = Math.round(((cw_lf + cw_rr) / total) * 1000) / 10;
    }
    setup.total_weight = total;
  }

  // Store class-specific unit labels for display
  setup.unit_pressure = isBorC ? 'kPa' : 'PSI';
  setup.unit_spring = isBorC ? 'N/mm' : 'lbs/in';
  setup.unit_height = isBorC ? 'mm' : 'in';
  setup.unit_weight = isBorC ? 'N' : 'lbs';

  return setup;
}

// ─── SETUP STATUS (active/naming) ────────────────────────────────
function updateSetupStatusUI() {
  const setup = AppState.currentSetup;
  const pill = document.getElementById('setup-status-pill');
  const nameBar = document.getElementById('setup-name-bar');
  const activePill = document.getElementById('setup-active-pill');

  if (!setup) {
    if (pill) pill.style.display = 'none';
    if (nameBar) nameBar.style.display = 'none';
    if (activePill) activePill.style.display = 'none';
    return;
  }

  // Show name bar
  if (nameBar) {
    nameBar.style.display = 'flex';
    const idEl = document.getElementById('snb-id');
    const srcEl = document.getElementById('snb-source');
    const nameIn = document.getElementById('snb-name-input');
    if (idEl) idEl.textContent = setup.kappsId ? '⏱ ' + setup.kappsId : '';
    if (srcEl) srcEl.textContent = setup.source === 'kapps' ? '📱 Kapps' : setup.source === 'iracing' ? '📄 iRacing' : '✏️ Manual';
    if (nameIn) nameIn.value = setup.name || '';
  }

  // Setup status pill
  if (pill) {
    if (setup.isActive) {
      pill.style.display = 'inline-flex';
      pill.innerHTML = '✅ Setup Ativo: ' + (setup.name || 'Sem nome');
      pill.className = 'setup-status-pill active';
    } else {
      pill.style.display = 'inline-flex';
      pill.innerHTML = '🔧 Setup Carregado: ' + (setup.name || 'Sem nome');
      pill.className = 'setup-status-pill loaded';
    }
  }

  // Active badge on analysis panel
  if (activePill) {
    activePill.style.display = setup.isActive ? 'inline-flex' : 'none';
  }
}

window.nameCurrentSetup = function() {
  if (!AppState.currentSetup) return;
  const nameIn = document.getElementById('snb-name-input');
  const newName = nameIn ? nameIn.value.trim() : '';
  if (!newName) { showNotification('Digite um nome para o acerto.', 'warn'); return; }
  AppState.currentSetup.name = newName;
  updateSetupStatusUI();
  updateDashboard();
  showNotification('Acerto nomeado: "' + newName + '"', 'success');
};

window.setSetupActive = function() {
  if (!AppState.currentSetup) return;
  // First name it if needed
  const nameIn = document.getElementById('snb-name-input');
  if (nameIn && nameIn.value.trim()) {
    AppState.currentSetup.name = nameIn.value.trim();
  }
  AppState.currentSetup.isActive = true;
  updateSetupStatusUI();
  updateDashboard();
  showNotification('✅ Setup "' + AppState.currentSetup.name + '" definido como ATIVO!', 'success');
};

window.analyzeManualSetup = function() {
  const cls = window.AppClass || 'A';
  const isBorC = cls === 'B' || cls === 'C';

  // Helper to safely read a number field
  const num = id => { const el = document.getElementById(id); return el ? parseFloat(el.value) : NaN; };
  const str = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };

  const setup = {
    name: str('setup-name-input') || 'Setup Manual',
    timestamp: new Date().toISOString(),
    source: 'manual',
    carClass: cls,
    unit_pressure: isBorC ? 'kPa' : 'PSI',
    unit_spring:   isBorC ? 'N/mm' : 'lbs/in',
    unit_height:   isBorC ? 'mm' : 'in',
    unit_weight:   isBorC ? 'N' : 'lbs',
    lf_psi: num('mf-lf-psi'),
    rf_psi: num('mf-rf-psi'),
    lr_psi: num('mf-lr-psi'),
    rr_psi: num('mf-rr-psi'),
    lf_spring: num('mf-lf-spring'),
    rf_spring: num('mf-rf-spring'),
    lr_spring: num('mf-lr-spring'),
    rr_spring: num('mf-rr-spring'),
    lf_rh: num('mf-lf-rh'),
    rf_rh: num('mf-rf-rh'),
    lr_rh: num('mf-lr-rh'),
    rr_rh: num('mf-rr-rh'),
    nose_weight: num('mf-nose'),
    cross_weight: num('mf-cross'),
    brake_bias: num('mf-bb'),
    lf_camber: num('mf-lf-camber'),
    rf_camber: num('mf-rf-camber'),
    lf_caster: num('mf-lf-caster'),
    rf_caster: num('mf-rf-caster'),
    lf_toe: num('mf-lf-toe'),
    rf_toe: num('mf-rf-toe'),
    lr_camber: num('mf-lr-camber'),
    rr_camber: num('mf-rr-camber'),
    f_arb_diam: str('mf-f-arb-diam'),
    f_arb_arm: parseInt(str('mf-f-arb-arm')) || undefined,
    r_arb_diam: str('mf-r-arb-diam'),
    r_arb_arm: parseInt(str('mf-r-arb-arm')) || undefined,
    lf_lsc: num('mf-lf-lsc'), rf_lsc: num('mf-rf-lsc'),
    lr_lsc: num('mf-lr-lsc'), rr_lsc: num('mf-rr-lsc'),
    lf_hsc: num('mf-lf-hsc'), rf_hsc: num('mf-rf-hsc'),
    lr_hsc: num('mf-lr-hsc'), rr_hsc: num('mf-rr-hsc'),
    lf_lsr: num('mf-lf-lsr'), rf_lsr: num('mf-rf-lsr'),
    lr_lsr: num('mf-lr-lsr'), rr_lsr: num('mf-rr-lsr'),
  };

  // B/C extra fields
  if (isBorC) {
    setup.lf_shock_spring = num('mf-lf-shock-spring') || undefined;
    setup.rf_shock_spring = num('mf-rf-shock-spring') || undefined;
    setup.lf_packer = num('mf-lf-packer') || undefined;
    setup.rf_packer = num('mf-rf-packer') || undefined;
    setup.lr_trackbar = num('mf-lr-trackbar') || undefined;
    setup.rr_trackbar = num('mf-rr-trackbar') || undefined;
    setup.truck_arm_mount = str('mf-truck-arm-mount') || undefined;
    setup.truck_arm_preload = num('mf-truck-arm-preload') || undefined;
    setup.ballast_forward = num('mf-ballast-forward') || undefined;
    setup.steering_ratio = num('mf-steering-ratio') || undefined;
    setup.steering_offset = num('mf-steering-offset') || undefined;
    setup.final_drive = num('mf-rear-end-ratio') || undefined;
    setup.f_arb_link_slack = num('mf-f-arb-link-slack') || undefined;
    setup.f_arb_preload = num('mf-f-arb-preload') || undefined;
    setup.tape_config = str('mf-tape-config') || undefined;
    if (cls === 'C') {
      setup.lf_spring_angle = num('mf-lf-spring-angle') || undefined;
      setup.rf_spring_angle = num('mf-rf-spring-angle') || undefined;
    }
  }

  AppState.currentSetup = setup;
  renderSetupAnalysis(setup);
  updateDashboard();
  updateSetupStatusUI();
  showNotification('Setup analisado com sucesso!', 'success');
};

// ─── SETUP ANALYSIS RENDERER ─────────────────────────────────────
function renderSetupAnalysis(setup) {
  document.getElementById('setup-analysis-empty').style.display = 'none';
  const result = document.getElementById('setup-analysis-result');
  result.style.display = 'block';
  document.getElementById('analysis-badge').style.display = 'inline';

  const hasKappsData = setup.source === 'kapps';
  const cls = setup.carClass || window.AppClass || 'A';
  const isBorC = cls === 'B' || cls === 'C';
  const uPres = isBorC ? 'kPa' : 'PSI';
  const uSpring = isBorC ? 'N/mm' : 'lbs/in';
  const uHeight = isBorC ? 'mm' : 'in';
  const uWeight = isBorC ? 'N' : 'lbs';

  // Class badge for analysis sections
  const classBadge = isBorC ? `<span class="class-badge-inline badge-${cls.toLowerCase()}">${cls}</span>` : '';

  // Helper: render a param cell
  const pCell = (label, value, unit, cssClass) => {
    const v = (value !== undefined && value !== null && !isNaN(value)) ? value : '—';
    return `<div class="param-item">
      <div class="pi-label">${label}</div>
      <div class="pi-value ${cssClass||''}">${v}${unit && v !== '—' ? `<small style="font-size:0.6rem;color:var(--text-dim)">${unit}</small>` : ''}</div>
    </div>`;
  };

  // ── TIRES: Cold Pressure ──
  let tiresSection = `
  <div class="analysis-section">
    <div class="as-header">🛞 Pressões de Pneus – Fria (Cold ${uPres}) ${classBadge}</div>
    <div class="as-content">
      <div class="param-grid">
        ${pCell('LF Cold', setup.lf_psi, ' '+uPres, getPsiStatus(setup.lf_psi,'LF',cls))}
        ${pCell('RF Cold', setup.rf_psi, ' '+uPres, getPsiStatus(setup.rf_psi,'RF',cls))}
        ${pCell('LR Cold', setup.lr_psi, ' '+uPres, getPsiStatus(setup.lr_psi,'LR',cls))}
        ${pCell('RR Cold', setup.rr_psi, ' '+uPres, getPsiStatus(setup.rr_psi,'RR',cls))}
      </div>
      <div class="mt-1" style="font-size:0.78rem; color:var(--text-secondary)">${analyzePressures(setup,cls)}</div>
    </div>
  </div>`;

  // ── TIRES: Hot Pressure (Kapps only) ──
  if (hasKappsData && (setup.lf_hot_psi || setup.rf_hot_psi || setup.lr_hot_psi || setup.rr_hot_psi)) {
    const hotDiff = (cold, hot) => {
      if (!cold || !hot) return '';
      const d = (hot - cold).toFixed(1);
      const color = Math.abs(d) > 5 ? 'var(--loose)' : Math.abs(d) > 3 ? 'var(--orange)' : 'var(--green)';
      return `<span style="color:${color};font-size:0.7rem;margin-left:4px">(+${d})</span>`;
    };
    tiresSection += `
  <div class="analysis-section">
    <div class="as-header">🌡️ Pressões Quentes (Hot PSI) <span class="kapps-badge">KAPPS</span></div>
    <div class="as-content">
      <div class="param-grid">
        <div class="param-item"><div class="pi-label">LF Hot</div><div class="pi-value">${setup.lf_hot_psi||'—'} PSI ${hotDiff(setup.lf_psi, setup.lf_hot_psi)}</div></div>
        <div class="param-item"><div class="pi-label">RF Hot</div><div class="pi-value">${setup.rf_hot_psi||'—'} PSI ${hotDiff(setup.rf_psi, setup.rf_hot_psi)}</div></div>
        <div class="param-item"><div class="pi-label">LR Hot</div><div class="pi-value">${setup.lr_hot_psi||'—'} PSI ${hotDiff(setup.lr_psi, setup.lr_hot_psi)}</div></div>
        <div class="param-item"><div class="pi-label">RR Hot</div><div class="pi-value">${setup.rr_hot_psi||'—'} PSI ${hotDiff(setup.rr_psi, setup.rr_hot_psi)}</div></div>
      </div>
      ${setup.lf_lasthot_psi ? `<div class="mt-1" style="font-size:0.75rem;color:var(--text-dim)">
        Última quente — LF: ${setup.lf_lasthot_psi} · RF: ${setup.rf_lasthot_psi||'—'} · LR: ${setup.lr_lasthot_psi||'—'} · RR: ${setup.rr_lasthot_psi||'—'}
      </div>` : ''}
    </div>
  </div>`;
  }

  // ── TIRES: Temperatures (Kapps) ──
  const hasTemps = setup.lf_temp_out || setup.rf_temp_out || setup.lr_temp_out || setup.rr_temp_out;
  if (hasKappsData && hasTemps) {
    const tempRow = (pfx, label) => {
      const o = setup[pfx+'_temp_out'], m = setup[pfx+'_temp_mid'], i = setup[pfx+'_temp_in'];
      if (!o && !m && !i) return '';
      const spread = (o && i) ? Math.abs(o - i) : null;
      const spreadColor = spread > 20 ? 'var(--loose)' : spread > 12 ? 'var(--orange)' : 'var(--green)';
      return `<div class="tire-temp-row">
        <div class="ttr-label">${label}</div>
        <div class="ttr-temps">
          <span class="ttr-out">${o||'—'}°</span>
          <span class="ttr-mid">${m||'—'}°</span>
          <span class="ttr-in">${i||'—'}°</span>
        </div>
        ${spread !== null ? `<div class="ttr-spread" style="color:${spreadColor}">Δ${spread.toFixed(0)}°</div>` : ''}
      </div>`;
    };
    tiresSection += `
  <div class="analysis-section">
    <div class="as-header">🌡️ Temperaturas dos Pneus (Out / Mid / In) <span class="kapps-badge">KAPPS</span></div>
    <div class="as-content">
      <div class="tire-temp-grid">
        <div class="ttr-header"><span></span><span>Out</span><span>Mid</span><span>In</span><span>Spread</span></div>
        ${tempRow('lf','LF')}${tempRow('rf','RF')}${tempRow('lr','LR')}${tempRow('rr','RR')}
      </div>
      <div class="mt-1" style="font-size:0.75rem;color:var(--text-dim)">Δ ideal &lt; 10°C. Acima de 20°C indica desalinhamento ou pressão incorreta.</div>
    </div>
  </div>`;
  }

  // ── TIRES: Tread Wear (Kapps) ──
  const hasTread = setup.lf_tread_out || setup.rf_tread_out || setup.lr_tread_out || setup.rr_tread_out;
  if (hasKappsData && hasTread) {
    const treadCell = (pfx, label) => {
      const o = setup[pfx+'_tread_out'], m = setup[pfx+'_tread_mid'], i = setup[pfx+'_tread_in'];
      const treadBar = (v) => {
        if (v === null || v === undefined) return '';
        const color = v < 20 ? '#e03030' : v < 50 ? '#e8a000' : '#00d26a';
        return `<div class="tread-bar-wrap"><div class="tread-bar-bg"><div class="tread-bar-fill" style="width:${v}%;background:${color}"></div></div><span>${v}%</span></div>`;
      };
      if (!o && !m && !i) return '';
      return `<div class="tread-row"><div class="tread-label">${label}</div>
        <div class="tread-bars">${treadBar(o)}${treadBar(m)}${treadBar(i)}</div>
        <div class="tread-tag" style="font-size:0.65rem;color:var(--text-dim)">Out/Mid/In</div>
      </div>`;
    };
    tiresSection += `
  <div class="analysis-section">
    <div class="as-header">🔍 Desgaste de Pneus (Tread %) <span class="kapps-badge">KAPPS</span></div>
    <div class="as-content">
      <div class="tread-grid">
        ${treadCell('lf','LF')}${treadCell('rf','RF')}${treadCell('lr','LR')}${treadCell('rr','RR')}
      </div>
    </div>
  </div>`;
  }

  // ── SPRINGS (handle B/C shock spring vs rear spring) ──
  const springLabelLF = (isBorC && setup.lf_shock_spring) ? 'LF Shock Spring' : 'LF Spring';
  const springLabelRF = (isBorC && setup.rf_shock_spring) ? 'RF Shock Spring' : 'RF Spring';
  const lf_s = setup.lf_shock_spring || setup.lf_spring;
  const rf_s = setup.rf_shock_spring || setup.rf_spring;
  let springsSection = `
  <div class="analysis-section">
    <div class="as-header">🌀 Molas ${classBadge}</div>
    <div class="as-content">
      <div class="param-grid">
        ${pCell(springLabelLF, lf_s, ' '+uSpring)}
        ${pCell(springLabelRF, rf_s, ' '+uSpring)}
        ${pCell('LR Spring', setup.lr_spring, ' '+uSpring)}
        ${pCell('RR Spring', setup.rr_spring, ' '+uSpring)}
        ${(isBorC && setup.lf_packer !== undefined) ? pCell('LF Packer', setup.lf_packer, ' mm') : ''}
        ${(isBorC && setup.rf_packer !== undefined) ? pCell('RF Packer', setup.rf_packer, ' mm') : ''}
        ${(isBorC && setup.lf_spring_angle !== undefined) ? pCell('LF Spring Angle', setup.lf_spring_angle, '°') : ''}
        ${(isBorC && setup.rf_spring_angle !== undefined) ? pCell('RF Spring Angle', setup.rf_spring_angle, '°') : ''}
      </div>
      <div class="mt-1" style="font-size:0.78rem; color:var(--text-secondary)">${analyzeSprings(setup,cls)}</div>
    </div>
  </div>`;

  // ── RIDE HEIGHTS ──
  const rhSection = (setup.lf_rh || setup.rf_rh || setup.lr_rh || setup.rr_rh) ? `
  <div class="analysis-section">
    <div class="as-header">📏 Ride Heights</div>
    <div class="as-content">
      <div class="param-grid">
        ${pCell('LF RH', setup.lf_rh, ' '+uHeight)}
        ${pCell('RF RH', setup.rf_rh, ' '+uHeight)}
        ${pCell('LR RH', setup.lr_rh, ' '+uHeight)}
        ${pCell('RR RH', setup.rr_rh, ' '+uHeight)}
      </div>
      ${isBorC && (setup.lr_trackbar || setup.rr_trackbar) ? `
      <div class="param-grid" style="margin-top:0.5rem">
        ${setup.lr_trackbar ? pCell('LR Track Bar', setup.lr_trackbar, ' mm') : ''}
        ${setup.rr_trackbar ? pCell('RR Track Bar', setup.rr_trackbar, ' mm') : ''}
      </div>` : ''}
    </div>
  </div>` : '';

  // ── WEIGHT DISTRIBUTION ──
  const cwColor = cw => (cw||50) > 50.5 ? 'var(--tight)' : (cw||50) < 49.5 ? 'var(--loose)' : 'var(--green)';
  const nwColor = nw => (nw||52) > 52.5 ? 'var(--tight)' : (nw||52) < 51.5 ? 'var(--loose)' : 'var(--green)';

  let weightSection = `
  <div class="analysis-section">
    <div class="as-header">⚖️ Distribuição de Peso</div>
    <div class="as-content">
      <div class="balance-indicator">
        <div class="bi-label">Nose Weight</div>
        <div class="bi-bar-container">
          <div class="bi-bar ${(setup.nose_weight||52) > 52.5 ? 'tight' : (setup.nose_weight||52) < 51.5 ? 'loose' : 'balanced'}" style="width:${setup.nose_weight ? Math.min(100,(setup.nose_weight - 48) * 20) : 50}%"></div>
        </div>
        <div class="bi-value" style="color:${nwColor(setup.nose_weight)}">${setup.nose_weight ? setup.nose_weight + '%' : '—'}</div>
      </div>
      <div class="balance-indicator">
        <div class="bi-label">Cross Weight</div>
        <div class="bi-bar-container">
          <div class="bi-bar ${(setup.cross_weight||50) > 50.5 ? 'tight' : (setup.cross_weight||50) < 49.5 ? 'loose' : 'balanced'}" style="width:${setup.cross_weight ? Math.min(100,(setup.cross_weight - 47) * 14) : 50}%"></div>
        </div>
        <div class="bi-value" style="color:${cwColor(setup.cross_weight)}">${setup.cross_weight ? setup.cross_weight + '%' : '—'}</div>
      </div>
      <div class="balance-indicator">
        <div class="bi-label">Brake Bias</div>
        <div class="bi-bar-container">
          <div class="bi-bar ${(setup.brake_bias||54) > 56 ? 'loose' : (setup.brake_bias||54) < 52 ? 'tight' : 'balanced'}" style="width:${setup.brake_bias ? Math.min(100,(setup.brake_bias - 48) * 7) : 42}%"></div>
        </div>
        <div class="bi-value">${setup.brake_bias ? setup.brake_bias + '%' : '—'}</div>
      </div>`;

  // Corner weights if available (Kapps)
  if (setup.lf_corner_weight || setup.rf_corner_weight) {
    const total = setup.total_weight || (
      (setup.lf_corner_weight||0) + (setup.rf_corner_weight||0) +
      (setup.lr_corner_weight||0) + (setup.rr_corner_weight||0)
    );
    weightSection += `
      <div style="margin-top:0.8rem">
        <div style="font-size:0.75rem;color:var(--gold);font-weight:700;margin-bottom:0.4rem;text-transform:uppercase;letter-spacing:0.05em">Pesos por Canto (${uWeight}) <span class="kapps-badge">KAPPS</span></div>
        <div class="param-grid">
          ${pCell('LF', setup.lf_corner_weight, ' '+uWeight)}
          ${pCell('RF', setup.rf_corner_weight, ' '+uWeight)}
          ${pCell('LR', setup.lr_corner_weight, ' '+uWeight)}
          ${pCell('RR', setup.rr_corner_weight, ' '+uWeight)}
        </div>
        ${total ? `<div style="font-size:0.75rem;color:var(--text-dim);margin-top:0.4rem">Peso Total: ${total} ${uWeight}</div>` : ''}
      </div>`;
  }
  weightSection += `</div></div>`;

  // ── GEOMETRY ──
  let geoSection = '';
  if (setup.lf_camber || setup.rf_camber || setup.lf_caster || setup.rf_caster) {
    geoSection = `
  <div class="analysis-section">
    <div class="as-header">📐 Geometria</div>
    <div class="as-content">
      <div class="param-grid">
        ${pCell('LF Camber', setup.lf_camber, '°')}
        ${pCell('RF Camber', setup.rf_camber, '°', setup.rf_camber && setup.rf_camber < -5.5 ? 'warn' : 'ok')}
        ${setup.lf_caster ? pCell('LF Caster', setup.lf_caster, '°') : ''}
        ${setup.rf_caster ? pCell('RF Caster', setup.rf_caster, '°') : ''}
        ${setup.lf_toe !== undefined ? pCell('LF Toe', setup.lf_toe, '"') : ''}
        ${setup.rf_toe !== undefined ? pCell('RF Toe', setup.rf_toe, '"') : ''}
        ${setup.lr_camber !== undefined ? pCell('LR Camber', setup.lr_camber, '°') : ''}
        ${setup.rr_camber !== undefined ? pCell('RR Camber', setup.rr_camber, '°') : ''}
        ${setup.pinion_angle !== undefined ? pCell('Pinion Angle', setup.pinion_angle, '°') : ''}
        ${setup.steer_offset !== undefined ? pCell('Steer Offset', setup.steer_offset, '') : ''}
      </div>
    </div>
  </div>`;
  }

  // ── SHOCKS ──
  let shocksSection = '';
  if (setup.lf_lsc || setup.rf_lsc || setup.lr_lsc || setup.rr_lsc) {
    shocksSection = `
  <div class="analysis-section">
    <div class="as-header">🔩 Amortecedores</div>
    <div class="as-content">
      <div class="shock-table">
        <div class="shock-table-head"><span></span><span>LS Comp</span><span>HS Comp</span><span>LS Reb</span><span>HS Reb</span></div>
        ${['lf','rf','lr','rr'].map(p => `<div class="shock-table-row">
          <span class="shock-corner-label">${p.toUpperCase()}</span>
          <span>${setup[p+'_lsc']||'—'}</span>
          <span>${setup[p+'_hsc']||'—'}</span>
          <span>${setup[p+'_lsr']||'—'}</span>
          <span>${setup[p+'_hsr']||'—'}</span>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
  }

  // ── ARB ──
  let arbSection = '';
  if (setup.f_arb_diam || setup.f_arb_arm || setup.r_arb_diam || setup.r_arb_arm) {
    const arbPreloadUnit = isBorC ? ' Nm' : ' lbs';
    const arbDiamUnit = isBorC ? ' mm' : '"';
    arbSection = `
  <div class="analysis-section">
    <div class="as-header">🔗 Anti-Roll Bar (ARB) ${classBadge}</div>
    <div class="as-content">
      <div class="param-grid">
        ${pCell('Front Diam', setup.f_arb_diam, arbDiamUnit)}
        ${pCell('Front Arm', setup.f_arb_arm ? 'P'+setup.f_arb_arm : null, '')}
        ${setup.f_arb_link_slack !== undefined ? pCell('Link Slack', setup.f_arb_link_slack, ' mm') : ''}
        ${setup.f_arb_preload !== undefined ? pCell('Front Preload', setup.f_arb_preload, arbPreloadUnit) : ''}
        ${setup.f_arb_attach !== undefined ? pCell('ARB Attach', setup.f_arb_attach, '') : ''}
        ${setup.r_arb_diam ? pCell('Rear Diam', setup.r_arb_diam, arbDiamUnit) : ''}
        ${setup.r_arb_arm ? pCell('Rear Arm', 'P'+setup.r_arb_arm, '') : ''}
        ${setup.r_arb_preload !== undefined ? pCell('Rear Preload', setup.r_arb_preload, arbPreloadUnit) : ''}
      </div>
    </div>
  </div>`;
  }

  // ── TRUCK ARM (B/C specific) ──
  let truckArmSection = '';
  if (isBorC && (setup.truck_arm_mount || setup.truck_arm_preload !== undefined)) {
    truckArmSection = `
  <div class="analysis-section">
    <div class="as-header">🔧 Truck Arm ${classBadge}</div>
    <div class="as-content">
      <div class="param-grid">
        ${setup.truck_arm_mount ? pCell('Mount Position', setup.truck_arm_mount, '') : ''}
        ${setup.truck_arm_preload !== undefined ? pCell('Preload', setup.truck_arm_preload, ' Nm') : ''}
      </div>
      <div style="font-size:0.75rem;color:var(--text-dim);margin-top:0.4rem">Mount Top = mais rotação, menos grip traseiro. Mount Bottom = mais grip, menos rotação.</div>
    </div>
  </div>`;
  }

  // ── DRIVETRAIN ──
  let driveSection = '';
  if (setup.final_drive || setup.diff_preload || setup.ballast_forward !== undefined || setup.steering_ratio) {
    driveSection = `
  <div class="analysis-section">
    <div class="as-header">⚙️ Drivetrain & Chassis ${classBadge}</div>
    <div class="as-content">
      <div class="param-grid">
        ${setup.final_drive ? pCell('Rear End Ratio', setup.final_drive, ':1') : ''}
        ${setup.diff_preload !== undefined ? pCell('Diff Preload', setup.diff_preload, isBorC ? ' Nm' : ' lbs') : ''}
        ${setup.ballast_forward !== undefined ? pCell('Ballast Forward', setup.ballast_forward, ' mm') : ''}
        ${setup.steering_ratio ? pCell('Steering Ratio', setup.steering_ratio, '') : ''}
        ${setup.steering_offset !== undefined ? pCell('Steering Offset', setup.steering_offset, '°') : ''}
        ${setup.tape_config ? pCell('Tape Config', setup.tape_config, '') : ''}
        ${setup.f_master_cyl ? pCell('Front M.C.', setup.f_master_cyl, isBorC ? ' mm' : '"') : ''}
        ${setup.r_master_cyl ? pCell('Rear M.C.', setup.r_master_cyl, isBorC ? ' mm' : '"') : ''}
      </div>
    </div>
  </div>`;
  }

  // ── AERO ──
  let aeroSection = '';
  if (setup.rear_spoiler || setup.front_splitter || setup.track_bar) {
    aeroSection = `
  <div class="analysis-section">
    <div class="as-header">🌬️ Aerodinâmica</div>
    <div class="as-content">
      <div class="param-grid">
        ${setup.rear_spoiler !== undefined ? pCell('Rear Spoiler', setup.rear_spoiler, '°') : ''}
        ${setup.front_splitter !== undefined ? pCell('Front Splitter', setup.front_splitter, '"') : ''}
        ${setup.track_bar !== undefined ? pCell('Track Bar', setup.track_bar, '"') : ''}
      </div>
    </div>
  </div>`;
  }

  // ── DIAGNOSIS ──
  const diagSection = `
  <div class="analysis-section">
    <div class="as-header">🧠 Diagnóstico Automático & Sugestões</div>
    <div class="as-content">
      ${generateAutoSuggestions(setup)}
    </div>
  </div>`;

  result.innerHTML = tiresSection + springsSection + rhSection + weightSection + geoSection + shocksSection + arbSection + truckArmSection + driveSection + aeroSection + diagSection;
}

function analyzeBalance(setup) {
  let score = 0;
  if (setup.rf_spring && setup.lf_spring) score += (setup.rf_spring - setup.lf_spring) / 100;
  if (setup.cross_weight) score += (setup.cross_weight - 50) * 2;
  if (setup.brake_bias) score += (setup.brake_bias - 54) / 2;
  return score;
}

function getPsiStatus(psi, corner, cls) {
  if (!psi) return '';
  cls = cls || window.AppClass || 'A';
  const isBorC = cls === 'B' || cls === 'C';
  let ranges;
  if (isBorC) {
    // B/C: values in kPa. LF/LR ~172-179 kPa, RF/RR ~310 kPa
    ranges = { LF:[150,215], RF:[280,345], LR:[150,215], RR:[280,345] };
  } else {
    ranges = { LF:[25,33], RF:[25,35], LR:[18,28], RR:[20,30] };
  }
  const [lo, hi] = ranges[corner] || [0, 9999];
  if (psi < lo) return 'warn';
  if (psi > hi) return 'warn';
  return 'ok';
}

function analyzePressures(setup, cls) {
  cls = cls || setup.carClass || window.AppClass || 'A';
  const isBorC = cls === 'B' || cls === 'C';
  const notes = [];
  if (isBorC) {
    // B/C: kPa values. RF/RR should be ~310, LF/LR ~172-179
    if (setup.rf_psi && setup.lf_psi) {
      if (setup.lf_psi > 220) notes.push('⚠️ LF muito alta para oval – verifique configuração');
      if (setup.rf_psi < 250) notes.push('⚠️ RF muito baixa – RF deve estar ~310 kPa em oval');
    }
    if (setup.rr_psi && setup.lr_psi) {
      const diff = Math.abs(setup.rr_psi - setup.rf_psi);
      if (diff > 30) notes.push('⚠️ Grande diferença RF/RR – verifique posição lateral do carro');
    }
    if (notes.length === 0) notes.push('✅ Pressões dentro de faixas normais para Classe ' + cls);
  } else {
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
  }
  return notes.join('<br>');
}

function analyzeSprings(setup, cls) {
  cls = cls || setup.carClass || window.AppClass || 'A';
  const isBorC = cls === 'B' || cls === 'C';
  const notes = [];
  const lf_s = setup.lf_shock_spring || setup.lf_spring;
  const rf_s = setup.rf_shock_spring || setup.rf_spring;
  if (isBorC) {
    // B/C: values in N/mm. Typical front ~1575 N/mm (pigtail), rear ~35-131 N/mm
    if (rf_s && lf_s) {
      if (rf_s < lf_s * 0.8) notes.push('⚠️ RF muito mais macia que LF (B/C) – pode causar loose severo');
    }
    if (setup.rr_spring && setup.lr_spring) {
      if (setup.rr_spring > setup.lr_spring * 3) notes.push('💡 RR muito mais rígida que LR – monitore tight exit');
      if (setup.lr_spring > setup.rr_spring) notes.push('💡 LR mais rígida que RR – aumenta tight center em B/C');
    }
    const physicsNote = cls === 'C'
      ? 'ℹ️ Classe C: molas pigtail de dois estágios. Spring Angle afeta taxa efetiva progressiva.'
      : 'ℹ️ Classe B: shock spring na frente (N/mm). Traseiras lineares afetam atitude da carroceria.';
    notes.push(physicsNote);
  } else {
    if (rf_s && lf_s) {
      if (rf_s < lf_s) notes.push('⚠️ RF macia que LF – incomum, pode causar loose severo');
      const diff = rf_s - lf_s;
      if (diff > 200) notes.push('💡 Grande diferença RF/LF – carro provavelmente tight');
    }
    if (setup.rr_spring && setup.lr_spring) {
      if (setup.rr_spring < setup.lr_spring) notes.push('💡 RR mais macia que LR – pode causar loose exit');
      const frontAvg = ((lf_s||550) + (rf_s||600)) / 2;
      const rearAvg = ((setup.lr_spring||175) + (setup.rr_spring||225)) / 2;
      if (rearAvg > frontAvg * 0.5) notes.push('⚠️ Molas traseiras relativamente rígidas – monitore loose');
    }
    if (notes.length === 0) notes.push('✅ Relação de molas dentro do esperado para oval');
  }
  return notes.join('<br>');
}

function generateAutoSuggestions(setup) {
  const suggestions = [];
  const cls = setup.carClass || window.AppClass || 'A';
  const isBorC = cls === 'B' || cls === 'C';
  const tips = window.CLASS_CONFIGS?.[cls]?.tips || {};

  if (isBorC) {
    // ─── B/C: kPa-based pressure checks ───
    if (setup.lf_psi && setup.rf_psi) {
      // In B/C, LF/LR should be ~172-179 kPa and RF/RR should be ~310 kPa
      if (setup.lf_psi > 240) {
        suggestions.push({ icon: '⚠️', title: 'LF PSI alta demais (B/C)',
          detail: `LF ${setup.lf_psi} kPa é inusualmente alta para lateral esquerda. Verifique se o valor está correto.` });
      }
      if (setup.rf_psi < 250 && setup.rf_psi > 0) {
        suggestions.push({ icon: '🔵', title: 'RF PSI baixa para oval (B/C)',
          detail: `RF ${setup.rf_psi} kPa abaixo do normal (~310 kPa). Dianteiro direito tende ao tight. Aumente RF para 290-320 kPa.` });
      }
    }

    // ─── B/C: Spring balance checks ───
    const lf_s = setup.lf_shock_spring || setup.lf_spring;
    const rf_s = setup.rf_shock_spring || setup.rf_spring;
    if (lf_s && rf_s && setup.lr_spring && setup.rr_spring) {
      if (setup.lr_spring > setup.rr_spring) {
        suggestions.push({ icon: '🔵', title: 'LR mais rígida que RR (B/C)',
          detail: `LR (${setup.lr_spring}) > RR (${setup.rr_spring}). Em ${cls}, LR rígida aumenta tight center. LR deve ser igual ou mais macia que RR.` });
      }
      if (setup.rr_spring > setup.lr_spring * 4) {
        suggestions.push({ icon: '🔴', title: 'RR muito rígida vs LR (B/C)',
          detail: `RR (${setup.rr_spring} N/mm) muito maior que LR (${setup.lr_spring} N/mm). Pode causar loose severo em aceleração.` });
      }
    }

    // ─── B/C: Brake bias ───
    if (setup.brake_bias) {
      const bbIdeal = tips.brake_bias?.ideal || [60, 67];
      if (setup.brake_bias > bbIdeal[1] + 2) {
        suggestions.push({ icon: '⚠️', title: 'Brake Bias muito alto (B/C)',
          detail: `${setup.brake_bias}% é alto para Classe ${cls}. Recomendado ${bbIdeal[0]}-${bbIdeal[1]}%. Risco de trava dianteira.` });
      }
      if (setup.brake_bias < bbIdeal[0] - 3) {
        suggestions.push({ icon: '⚠️', title: 'Brake Bias muito traseiro (B/C)',
          detail: `${setup.brake_bias}% é baixo para Classe ${cls}. Recomendado ${bbIdeal[0]}-${bbIdeal[1]}%. Risco de trava traseira.` });
      }
    }

    // ─── B/C: Cross weight ───
    if (setup.cross_weight) {
      const cwIdeal = tips.cross_weight?.ideal || [49.5, 52.5];
      if (setup.cross_weight < cwIdeal[0] - 1) {
        suggestions.push({ icon: '🔴', title: 'Cross Weight baixo (B/C)',
          detail: `${setup.cross_weight}% cross weight para Classe ${cls}. Ideal: ${cwIdeal[0]}-${cwIdeal[1]}%. Tendência de loose geral.` });
      }
      if (setup.cross_weight > cwIdeal[1] + 0.5) {
        suggestions.push({ icon: '🔵', title: 'Cross Weight alto (B/C)',
          detail: `${setup.cross_weight}% pode causar tight. Ideal para Classe ${cls}: ${cwIdeal[0]}-${cwIdeal[1]}%.` });
      }
    }

    // ─── B/C: Truck arm ───
    if (setup.truck_arm_mount === 'top') {
      suggestions.push({ icon: '🔴', title: 'Truck Arm no topo (B/C)',
        detail: 'Mount no topo reduz grip traseiro e aumenta anti-squat. Cuidado com loose em aceleração em pistas de médio/curto comprimento.' });
    }

    // ─── B/C: Track bar ───
    if (setup.lr_trackbar && setup.rr_trackbar) {
      const tbDiff = Math.abs(setup.lr_trackbar - setup.rr_trackbar);
      if (tbDiff > 25) {
        suggestions.push({ icon: '⚠️', title: 'Grande diferença Track Bar LR/RR',
          detail: `LR Track Bar: ${setup.lr_trackbar}mm vs RR: ${setup.rr_trackbar}mm (diferença ${tbDiff}mm). Verifique ângulo do track bar.` });
      }
    }

    // ─── B/C: RF Camber (oval: negative right side) ───
    if (setup.rf_camber) {
      if (setup.rf_camber > -1.5) {
        suggestions.push({ icon: '⚠️', title: 'RF Camber insuficiente (B/C oval)',
          detail: `RF Camber ${setup.rf_camber}° é muito positivo para oval. Recomendado: -2° a -5°. Desgaste excessivo no exterior do RF.` });
      }
    }
    // ─── LF Camber (B/C oval: positive left side) ───
    if (setup.lf_camber) {
      if (setup.lf_camber < 3) {
        suggestions.push({ icon: '⚠️', title: 'LF Camber baixo (B/C oval)',
          detail: `LF Camber ${setup.lf_camber}° é baixo para oval. Recomendado: +4° a +7°. Desgaste no exterior do LF.` });
      }
    }

  } else {
    // ─── CLASS A: original logic ───
    if (setup.rf_psi && setup.rr_psi) {
      if (setup.rf_psi < setup.rr_psi) {
        suggestions.push({ icon: '🔴', title: 'Alerta: RF PSI menor que RR PSI',
          detail: `RF (${setup.rf_psi}) < RR (${setup.rr_psi}): Configuração incomum. RR alto causa loose crônico. Considere aumentar RF ou reduzir RR.` });
      }
    }
    const lf_s = setup.lf_spring, rf_s = setup.rf_spring;
    if (lf_s && rf_s && setup.lr_spring && setup.rr_spring) {
      const springBalance = (rf_s - lf_s) / (lf_s + rf_s) * 100;
      if (springBalance > 10) {
        suggestions.push({ icon: '🔵', title: 'Tendência TIGHT: RF muito rígida vs LF',
          detail: `RF (${rf_s}) muito maior que LF (${lf_s}). Setup tende para tight geral. Reduza RF spring ou aumente LF spring.` });
      }
      const rearStiff = (setup.rr_spring + setup.lr_spring) / 2;
      const frontStiff = (rf_s + lf_s) / 2;
      if (rearStiff > frontStiff * 0.45) {
        suggestions.push({ icon: '🔴', title: 'Traseiras relativamente firmes',
          detail: `Média traseiras (${rearStiff.toFixed(0)}) vs dianteiras (${frontStiff.toFixed(0)}). Relação incomum – monitore loose em aceleração.` });
      }
    }
    if (setup.brake_bias) {
      if (setup.brake_bias > 58) suggestions.push({ icon: '⚠️', title: 'Brake Bias muito alto dianteiro',
        detail: `${setup.brake_bias}% dianteiro é muito alto. Risco de trava do dianteiro. Reduza para 54-57%.` });
      if (setup.brake_bias < 51) suggestions.push({ icon: '⚠️', title: 'Brake Bias muito traseiro',
        detail: `${setup.brake_bias}% é muito baixo para oval. Risco de travamento traseiro. Aumente para 53-56%.` });
    }
    if (setup.cross_weight) {
      if (setup.cross_weight < 48.5) suggestions.push({ icon: '🔴', title: 'Cross Weight muito baixo',
        detail: `${setup.cross_weight}% cross weight. Carro pode estar muito loose. Range ideal: 49.5-51.5%.` });
      if (setup.cross_weight > 52) suggestions.push({ icon: '🔵', title: 'Cross Weight alto',
        detail: `${setup.cross_weight}% pode causar tight crônico. Considere reduzir para 50-51%.` });
    }
    if (setup.rf_camber) {
      if (setup.rf_camber > -2) suggestions.push({ icon: '⚠️', title: 'RF Camber insuficiente',
        detail: `RF Camber de ${setup.rf_camber}° é muito pouco para oval. Recomendado: -3.5° a -6.0°.` });
      if (setup.rf_camber < -7) suggestions.push({ icon: '⚠️', title: 'RF Camber excessivo',
        detail: `RF Camber de ${setup.rf_camber}° é muito negativo. Desgaste no interior do pneu. Reduza para -4° a -6°.` });
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
    showNotification('Nenhum setup carregado para salvar.', 'warn');
    return;
  }
  // Prefer name from the snb-name-input or setup-name-input
  const snbIn = document.getElementById('snb-name-input');
  const nameIn = document.getElementById('setup-name-input');
  const name = (snbIn && snbIn.value.trim()) ||
               (nameIn && nameIn.value.trim()) ||
               AppState.currentSetup.name ||
               'Setup ' + (AppState.setupHistory.length + 1);
  AppState.currentSetup.name = name;
  const setupToSave = { ...AppState.currentSetup, name, savedAt: new Date().toLocaleString('pt-BR') };
  AppState.setupHistory.unshift(setupToSave);
  saveHistory();
  updateDashboard();
  updateSetupStatusUI();
  renderHistoryList();
  showNotification('Setup "' + name + '" salvo com sucesso!', 'success');
};

function saveHistory() {
  const cls = window.AppClass || 'A';
  const key = 'nascar_setups_' + cls;
  try {
    localStorage.setItem(key, JSON.stringify(AppState.setupHistory));
    // Also save to legacy key for Class A
    if (cls === 'A') localStorage.setItem('nascar_setups', JSON.stringify(AppState.setupHistory));
  } catch(e) {}
}

function loadHistory() {
  loadHistoryForClass(window.AppClass || 'A');
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
  updateSetupStatusUI();
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
  const cls = window.AppClass || 'A';
  const isBorC = cls === 'B' || cls === 'C';

  const templatesA = {
    superspeedway: { name: 'Superspeedway Base', lf_psi:26, rf_psi:26, lr_psi:24, rr_psi:24, lf_spring:600, rf_spring:600, lr_spring:200, rr_spring:225, nose_weight:52.5, cross_weight:50.2, brake_bias:54.0, lf_camber:3.8, rf_camber:-4.5, lf_caster:4.0, rf_caster:6.0, f_arb_diam:'1.375', f_arb_arm:3, r_arb_diam:'1.375', r_arb_arm:2, lf_lsc:4, rf_lsc:5, lr_lsc:4, rr_lsc:4, lf_hsc:3, rf_hsc:4, lr_hsc:3, rr_hsc:4 },
    intermediate: { name: 'Intermediate Base', lf_psi:28, rf_psi:30, lr_psi:22, rr_psi:26, lf_spring:550, rf_spring:650, lr_spring:175, rr_spring:250, nose_weight:52.2, cross_weight:50.5, brake_bias:54.5, lf_camber:4.0, rf_camber:-5.0, lf_caster:4.0, rf_caster:6.5, f_arb_diam:'1.375', f_arb_arm:3, r_arb_diam:'1.375', r_arb_arm:3, lf_lsc:5, rf_lsc:6, lr_lsc:4, rr_lsc:5, lf_hsc:4, rf_hsc:5, lr_hsc:4, rr_hsc:5 },
    shorttrack: { name: 'Short Track Base', lf_psi:30, rf_psi:35, lr_psi:24, rr_psi:30, lf_spring:800, rf_spring:900, lr_spring:250, rr_spring:350, nose_weight:51.5, cross_weight:51.0, brake_bias:56.0, lf_camber:4.5, rf_camber:-6.0, lf_caster:4.5, rf_caster:7.0, f_arb_diam:'2.00', f_arb_arm:5, r_arb_diam:'1.375', r_arb_arm:4, lf_lsc:7, rf_lsc:8, lr_lsc:5, rr_lsc:6, lf_hsc:6, rf_hsc:7, lr_hsc:5, rr_hsc:6 },
    flat: { name: 'Flat Track Base', lf_psi:31, rf_psi:37, lr_psi:23, rr_psi:31, lf_spring:800, rf_spring:900, lr_spring:250, rr_spring:325, nose_weight:51.5, cross_weight:51.2, brake_bias:56.5, lf_camber:5.0, rf_camber:-6.5, lf_caster:4.5, rf_caster:7.0, f_arb_diam:'2.00', f_arb_arm:5, r_arb_diam:'1.375', r_arb_arm:4, lf_lsc:7, rf_lsc:8, lr_lsc:5, rr_lsc:6, lf_hsc:6, rf_hsc:7, lr_hsc:5, rr_hsc:6 }
  };

  const templatesB = {
    superspeedway: { name: 'B – Superspeedway Base', lf_psi:172, rf_psi:310, lr_psi:172, rr_psi:310, lf_shock_spring:1575, rf_shock_spring:1575, lf_spring:1575, rf_spring:1575, lr_spring:60, rr_spring:30, lf_rh:102, rf_rh:105, lr_rh:155, rr_rh:158, nose_weight:51.0, cross_weight:50.0, brake_bias:64.0, lf_camber:5.5, rf_camber:-3.0, lf_caster:13.0, rf_caster:13.0, f_arb_diam:'51', f_arb_arm:5 },
    intermediate: { name: 'B – Intermediate Base', lf_psi:172, rf_psi:310, lr_psi:172, rr_psi:310, lf_shock_spring:1575, rf_shock_spring:1575, lf_spring:1575, rf_spring:1575, lr_spring:70, rr_spring:35, lf_rh:108, rf_rh:110, lr_rh:162, rr_rh:164, nose_weight:51.1, cross_weight:52.0, brake_bias:65.0, lf_camber:5.9, rf_camber:-3.3, lf_caster:13.3, rf_caster:13.3, f_arb_diam:'51', f_arb_arm:5 },
    shorttrack: { name: 'B – Short Track Base', lf_psi:180, rf_psi:320, lr_psi:180, rr_psi:320, lf_shock_spring:1750, rf_shock_spring:1750, lf_spring:1750, rf_spring:1750, lr_spring:90, rr_spring:45, lf_rh:112, rf_rh:115, lr_rh:165, rr_rh:168, nose_weight:51.5, cross_weight:52.5, brake_bias:66.0, lf_camber:6.5, rf_camber:-4.0, lf_caster:13.5, rf_caster:13.5, f_arb_diam:'54', f_arb_arm:6 },
    flat: { name: 'B – Flat Track Base', lf_psi:179, rf_psi:315, lr_psi:179, rr_psi:315, lf_shock_spring:1650, rf_shock_spring:1650, lf_spring:1650, rf_spring:1650, lr_spring:75, rr_spring:40, lf_rh:110, rf_rh:112, lr_rh:163, rr_rh:166, nose_weight:51.3, cross_weight:51.5, brake_bias:65.5, lf_camber:6.2, rf_camber:-3.5, lf_caster:13.2, rf_caster:13.2, f_arb_diam:'51', f_arb_arm:5 }
  };

  const templatesC = {
    superspeedway: { name: 'C – Superspeedway Base', lf_psi:179, rf_psi:310, lr_psi:179, rr_psi:310, lf_spring:1575, rf_spring:1575, lr_spring:110, rr_spring:200, lf_rh:110, rf_rh:108, lr_rh:122, rr_rh:120, nose_weight:49.5, cross_weight:50.0, brake_bias:61.0, lf_camber:5.5, rf_camber:-3.0, lf_caster:7.5, rf_caster:7.5, f_arb_diam:'60', f_arb_arm:5 },
    intermediate: { name: 'C – Intermediate Base', lf_psi:179, rf_psi:310, lr_psi:179, rr_psi:310, lf_spring:1575, rf_spring:1575, lr_spring:131, rr_spring:236, lf_rh:116, rf_rh:114, lr_rh:128, rr_rh:126, nose_weight:50.1, cross_weight:50.5, brake_bias:62.0, lf_camber:6.0, rf_camber:-3.0, lf_caster:7.7, rf_caster:7.7, f_arb_diam:'64', f_arb_arm:6 },
    shorttrack: { name: 'C – Short Track Base', lf_psi:185, rf_psi:320, lr_psi:185, rr_psi:320, lf_spring:1750, rf_spring:1750, lr_spring:150, rr_spring:280, lf_rh:120, rf_rh:118, lr_rh:132, rr_rh:130, nose_weight:50.5, cross_weight:51.0, brake_bias:63.0, lf_camber:6.5, rf_camber:-3.5, lf_caster:8.0, rf_caster:8.0, f_arb_diam:'64', f_arb_arm:6 },
    flat: { name: 'C – Flat Track Base', lf_psi:182, rf_psi:315, lr_psi:182, rr_psi:315, lf_spring:1650, rf_spring:1650, lr_spring:140, rr_spring:250, lf_rh:118, rf_rh:116, lr_rh:130, rr_rh:128, nose_weight:50.3, cross_weight:50.8, brake_bias:62.5, lf_camber:6.2, rf_camber:-3.2, lf_caster:7.8, rf_caster:7.8, f_arb_diam:'64', f_arb_arm:5 }
  };

  const allTemplates = { A: templatesA, B: templatesB, C: templatesC };
  const templates = allTemplates[cls] || templatesA;

  const tmpl = templates[type];
  if (!tmpl) return;

  if (isBorC) {
    // For B/C: rebuild form first then populate
    renderManualForm(cls);
    const fields = {
      'mf-lf-psi': tmpl.lf_psi, 'mf-rf-psi': tmpl.rf_psi, 'mf-lr-psi': tmpl.lr_psi, 'mf-rr-psi': tmpl.rr_psi,
      'mf-lf-shock-spring': tmpl.lf_shock_spring, 'mf-rf-shock-spring': tmpl.rf_shock_spring,
      'mf-lf-spring': tmpl.lf_spring, 'mf-rf-spring': tmpl.rf_spring,
      'mf-lr-spring': tmpl.lr_spring, 'mf-rr-spring': tmpl.rr_spring,
      'mf-lf-rh': tmpl.lf_rh, 'mf-rf-rh': tmpl.rf_rh, 'mf-lr-rh': tmpl.lr_rh, 'mf-rr-rh': tmpl.rr_rh,
      'mf-nose': tmpl.nose_weight, 'mf-cross': tmpl.cross_weight, 'mf-bb': tmpl.brake_bias,
      'mf-lf-camber': tmpl.lf_camber, 'mf-rf-camber': tmpl.rf_camber,
      'mf-lf-caster': tmpl.lf_caster || '', 'mf-rf-caster': tmpl.rf_caster || '',
      'mf-lf-lsc': tmpl.lf_lsc||5, 'mf-rf-lsc': tmpl.rf_lsc||5, 'mf-lr-lsc': tmpl.lr_lsc||4, 'mf-rr-lsc': tmpl.rr_lsc||4,
      'mf-lf-hsc': tmpl.lf_hsc||4, 'mf-rf-hsc': tmpl.rf_hsc||4, 'mf-lr-hsc': tmpl.lr_hsc||3, 'mf-rr-hsc': tmpl.rr_hsc||3,
      'mf-lf-lsr': tmpl.lf_lsr||6, 'mf-rf-lsr': tmpl.rf_lsr||6, 'mf-lr-lsr': tmpl.lr_lsr||5, 'mf-rr-lsr': tmpl.rr_lsr||5,
    };
    if (tmpl.f_arb_diam) fields['mf-f-arb-diam'] = tmpl.f_arb_diam;
    if (tmpl.f_arb_arm) fields['mf-f-arb-arm'] = tmpl.f_arb_arm;
    Object.entries(fields).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el && val !== undefined && val !== '') el.value = val;
    });
    const nameEl = document.getElementById('setup-name-input');
    if (nameEl) nameEl.value = tmpl.name;
  } else {
    // Class A: populate existing static form
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
    if (tmpl.f_arb_diam) { const el = document.getElementById('mf-f-arb-diam'); if(el) el.value = tmpl.f_arb_diam; }
    if (tmpl.f_arb_arm) { const el = document.getElementById('mf-f-arb-arm'); if(el) el.value = tmpl.f_arb_arm; }
    if (tmpl.r_arb_diam) { const el = document.getElementById('mf-r-arb-diam'); if(el) el.value = tmpl.r_arb_diam; }
    if (tmpl.r_arb_arm) { const el = document.getElementById('mf-r-arb-arm'); if(el) el.value = tmpl.r_arb_arm; }
  }

  // Switch to manual tab
  document.querySelectorAll('.itab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.itab-content').forEach(c => c.classList.remove('active'));
  document.querySelector('.itab[data-tab="manual"]').classList.add('active');
  document.getElementById('tab-manual').classList.add('active');

  AppState.currentSetup = { ...tmpl, source: 'manual', carClass: cls };
  analyzeManualSetup();
  showNotification('Template "' + tmpl.name + '" carregado!', 'success');
};

// ─── DYNAMIC PITSTOP MATRIX ──────────────────────────────────────
function renderPitstopMatrix(cls) {
  const container = document.querySelector('.pitstop-matrix');
  if (!container) return;
  const isBorC = cls === 'B' || cls === 'C';
  if (!isBorC) {
    // Class A: keep original static matrix (already in DOM from HTML)
    return;
  }
  // B/C specific pit stop matrix (track bar, spring perch, ARB instead of springs)
  container.innerHTML = `
    <div class="pm-header">
      <div>Problema de Handling</div>
      <div>Brake Bias</div>
      <div>LF ${cls==='B'?'kPa':'kPa'}</div>
      <div>RF kPa</div>
      <div>LR kPa</div>
      <div>RR kPa</div>
      <div>Track Bar</div>
      <div>Spring Perch / ARB</div>
    </div>
    <div class="pm-row loose">
      <div class="pm-label">🔴 Loose Entry</div>
      <div class="pm-val up">↑ Mais dianteiro</div>
      <div class="pm-val neg">-5</div>
      <div class="pm-val neu">0</div>
      <div class="pm-val neu">0</div>
      <div class="pm-val neg">-5</div>
      <div class="pm-val down">↓ Abaixar TB</div>
      <div class="pm-val">Soltar ARB Preload</div>
    </div>
    <div class="pm-row loose">
      <div class="pm-label">🔴 Loose Center</div>
      <div class="pm-val up">↑ Mais dianteiro</div>
      <div class="pm-val neg">-5</div>
      <div class="pm-val pos">+5</div>
      <div class="pm-val pos">+5</div>
      <div class="pm-val neg">-5</div>
      <div class="pm-val down">↓ Abaixar TB</div>
      <div class="pm-val">LR Perch ↑ (mais jato)</div>
    </div>
    <div class="pm-row loose">
      <div class="pm-label">🔴 Loose Exit</div>
      <div class="pm-val">Direção +</div>
      <div class="pm-val neu">0</div>
      <div class="pm-val pos">+5</div>
      <div class="pm-val pos">+5</div>
      <div class="pm-val neg">-5</div>
      <div class="pm-val down">↓ Abaixar TB</div>
      <div class="pm-val">Truck Arm → Bottom</div>
    </div>
    <div class="pm-row tight">
      <div class="pm-label">🔵 Tight Entry</div>
      <div class="pm-val down">↓ Mais traseiro</div>
      <div class="pm-val neu">0</div>
      <div class="pm-val neg">-5</div>
      <div class="pm-val neg">-5</div>
      <div class="pm-val pos">+5</div>
      <div class="pm-val up">↑ Subir TB</div>
      <div class="pm-val">Apertar ARB Preload</div>
    </div>
    <div class="pm-row tight">
      <div class="pm-label">🔵 Tight Center</div>
      <div class="pm-val down">↓ Mais traseiro</div>
      <div class="pm-val neu">0</div>
      <div class="pm-val neg">-5</div>
      <div class="pm-val neg">-5</div>
      <div class="pm-val pos">+5</div>
      <div class="pm-val up">↑ Subir TB</div>
      <div class="pm-val">RR Perch ↓ (menos jato)</div>
    </div>
    <div class="pm-row tight">
      <div class="pm-label">🔵 Tight Exit</div>
      <div class="pm-val down">↓ Mais traseiro</div>
      <div class="pm-val neu">0</div>
      <div class="pm-val neu">0</div>
      <div class="pm-val neg">-5</div>
      <div class="pm-val pos">+5</div>
      <div class="pm-val up">↑ Subir TB</div>
      <div class="pm-val">Truck Arm → Top (cuidado)</div>
    </div>
  `;
}

// ─── B/C DIAGNOSIS MATRIX ────────────────────────────────────────
window.DIAGNOSIS_MATRIX_BC = {
  'loose-entry': {
    type: 'loose', title: '🔴 Loose Entry – Classe B/C',
    physics: 'Na entrada da curva, a traseira perde aderência antes do dianteiro. Em B/C, o Truck Arm e o Track Bar têm grande influência. Ballast Forward alto também aumenta carga na frente, aliviando a traseira.',
    adjustments: [
      { priority: 1, component: 'Brake Bias', direction: '↑ Aumentar dianteiro', current_typical: '64%', values: { mild: '+0.5%', moderate: '+1.0%', aggressive: '+1.5%' }, reason: 'Mais frenagem dianteira atrasa a entrada da traseira', pitroad: true },
      { priority: 2, component: 'Track Bar Height', direction: '↓ Abaixar LR/RR', current_typical: '160mm', values: { mild: '-3mm', moderate: '-6mm', aggressive: '-10mm' }, reason: 'Track Bar mais baixo = carro mais tight entry', pitroad: false },
      { priority: 3, component: 'LF PSI', direction: '↓ Reduzir', current_typical: '172 kPa', values: { mild: '-5 kPa', moderate: '-10 kPa', aggressive: '-15 kPa' }, reason: 'Mais carga no LF aumenta estabilidade de entrada', pitroad: true },
      { priority: 4, component: 'Truck Arm Preload', direction: '↑ Aumentar', current_typical: '0 Nm', values: { mild: '+2 Nm', moderate: '+4 Nm', aggressive: '+6 Nm' }, reason: 'Mais preload = mais anti-squat = mais grip traseiro', pitroad: false },
      { priority: 5, component: 'ARB Front Preload', direction: 'Afrouxar (menos negativo)', current_typical: '-182 Nm', values: { mild: '+20 Nm', moderate: '+40 Nm', aggressive: '+60 Nm' }, reason: 'ARB mais solto reduz roll stiffness frontal = mais rotação', pitroad: false },
    ],
    pitstop_summary: '↑ Brake Bias +0.5-1%. ↓ LF PSI -5-10 kPa. ↑ RR PSI +5 kPa se disponível.'
  },
  'loose-center': {
    type: 'loose', title: '🔴 Loose Center – Classe B/C',
    physics: 'No meio da curva (steady-state cornering), a traseira escorrega continuamente. Em B/C, LR Spring muito macia ou Track Bar alto causam isso. Truck Arm Mount no topo amplia o problema.',
    adjustments: [
      { priority: 1, component: 'LR Spring', direction: '↑ Aumentar rigidez', current_typical: '70 N/mm', values: { mild: '+5 N/mm', moderate: '+10 N/mm', aggressive: '+15 N/mm' }, reason: 'LR mais rígida aumenta carga traseira esquerda = mais tight center', pitroad: false },
      { priority: 2, component: 'Track Bar Height', direction: '↓ Abaixar LR/RR', current_typical: '160mm', values: { mild: '-3mm', moderate: '-6mm', aggressive: '-10mm' }, reason: 'TB mais baixo = mais carga traseira = menos loose center', pitroad: false },
      { priority: 3, component: 'Cross Weight', direction: '↑ Aumentar', current_typical: '51.5%', values: { mild: '+0.2%', moderate: '+0.4%', aggressive: '+0.7%' }, reason: 'Mais cross weight estabiliza o carro no centro da curva', pitroad: false },
      { priority: 4, component: 'Truck Arm Mount', direction: 'Mudar para Bottom', current_typical: 'top', values: { mild: '→ bottom', moderate: '→ bottom', aggressive: '→ bottom' }, reason: 'Bottom = mais anti-squat = mais grip traseiro center', pitroad: false },
      { priority: 5, component: 'LR PSI', direction: '↑ Aumentar', current_typical: '172 kPa', values: { mild: '+5 kPa', moderate: '+10 kPa', aggressive: '+15 kPa' }, reason: 'Mais pressão LR = mais carga LR = mais tight center', pitroad: true },
    ],
    pitstop_summary: '↑ LR PSI +5-10 kPa. ↑ Cross Weight via ajuste de jato LR. ↑ Brake Bias +0.5% se necessário.'
  },
  'loose-exit': {
    type: 'loose', title: '🔴 Loose Exit – Classe B/C',
    physics: 'Na aceleração à saída da curva, a traseira perde tração. Em B/C, RR Spring macia, Truck Arm no topo e Track Bar alto são causas principais.',
    adjustments: [
      { priority: 1, component: 'RR Spring', direction: '↑ Aumentar rigidez', current_typical: '35 N/mm', values: { mild: '+5 N/mm', moderate: '+10 N/mm', aggressive: '+20 N/mm' }, reason: 'RR mais rígida sustenta o carro na saída = menos loose', pitroad: false },
      { priority: 2, component: 'Truck Arm Mount', direction: 'Mudar para Bottom', current_typical: 'top', values: { mild: '→ bottom', moderate: '→ bottom', aggressive: '→ bottom' }, reason: 'Bottom = mais grip traseiro em aceleração', pitroad: false },
      { priority: 3, component: 'Track Bar Height', direction: '↓ Abaixar', current_typical: '160mm', values: { mild: '-3mm', moderate: '-6mm', aggressive: '-10mm' }, reason: 'TB baixo = carro mais tight = menos loose exit', pitroad: false },
      { priority: 4, component: 'Truck Arm Preload', direction: '↑ Aumentar', current_typical: '0 Nm', values: { mild: '+2 Nm', moderate: '+4 Nm', aggressive: '+7 Nm' }, reason: 'Mais preload = mais anti-squat = melhor saída de curva', pitroad: false },
      { priority: 5, component: 'RR PSI', direction: '↓ Reduzir', current_typical: '310 kPa', values: { mild: '-5 kPa', moderate: '-10 kPa', aggressive: '-15 kPa' }, reason: 'Menos PSI no RR = mais borracha em contato = mais grip de tração', pitroad: true },
    ],
    pitstop_summary: '↓ RR PSI -5-10 kPa. ↑ LR PSI +5 kPa. Truck Arm → Bottom se possível.'
  },
  'tight-entry': {
    type: 'tight', title: '🔵 Tight Entry – Classe B/C',
    physics: 'O dianteiro não gira na entrada da curva (understeer). Em B/C, ARB dianteiro muito rígido, Cross Weight alto ou Nose Weight alto são causas comuns.',
    adjustments: [
      { priority: 1, component: 'Brake Bias', direction: '↓ Reduzir dianteiro', current_typical: '65%', values: { mild: '-0.5%', moderate: '-1.0%', aggressive: '-1.5%' }, reason: 'Menos frenagem dianteira = menos load transfer = dianteiro mais livre', pitroad: true },
      { priority: 2, component: 'Cross Weight', direction: '↓ Reduzir', current_typical: '52%', values: { mild: '-0.2%', moderate: '-0.4%', aggressive: '-0.7%' }, reason: 'Menos cross weight libera a entrada do carro', pitroad: false },
      { priority: 3, component: 'ARB Front Preload', direction: '↓ Reduzir (mais negativo)', current_typical: '-182 Nm', values: { mild: '-20 Nm', moderate: '-40 Nm', aggressive: '-60 Nm' }, reason: 'ARB mais solto = mais compressão dianteira = mais rotação', pitroad: false },
      { priority: 4, component: 'Track Bar Height', direction: '↑ Subir LR/RR', current_typical: '160mm', values: { mild: '+3mm', moderate: '+6mm', aggressive: '+10mm' }, reason: 'TB alto = transfere carga para fora = dianteiro mais livre', pitroad: false },
      { priority: 5, component: 'RF PSI', direction: '↓ Reduzir', current_typical: '310 kPa', values: { mild: '-5 kPa', moderate: '-10 kPa', aggressive: '-15 kPa' }, reason: 'Menos pressão RF = mais área de contato = mais rotação', pitroad: true },
    ],
    pitstop_summary: '↓ Brake Bias -0.5-1%. ↓ RF PSI -5-10 kPa. ↑ RR PSI +5 kPa.'
  },
  'tight-center': {
    type: 'tight', title: '🔵 Tight Center – Classe B/C',
    physics: 'No meio da curva, o carro não gira (understeer). LR Spring rígida, ARB dianteiro rígido e Nose Weight alto causam tight center em B/C.',
    adjustments: [
      { priority: 1, component: 'LR Spring', direction: '↓ Reduzir rigidez', current_typical: '70 N/mm', values: { mild: '-5 N/mm', moderate: '-10 N/mm', aggressive: '-15 N/mm' }, reason: 'LR mais macia libera a traseira esquerda = mais rotação center', pitroad: false },
      { priority: 2, component: 'Cross Weight', direction: '↓ Reduzir', current_typical: '52%', values: { mild: '-0.2%', moderate: '-0.4%', aggressive: '-0.7%' }, reason: 'Menos cross weight reduz tight center', pitroad: false },
      { priority: 3, component: 'ARB Front Arm', direction: 'Mudar para posição mais macia', current_typical: 'P5', values: { mild: 'P4', moderate: 'P3', aggressive: 'P2' }, reason: 'ARB mais macio = menos roll stiffness = mais rotação', pitroad: false },
      { priority: 4, component: 'Ballast Forward', direction: '↓ Mover para trás', current_typical: '838mm', values: { mild: '-50mm', moderate: '-100mm', aggressive: '-150mm' }, reason: 'Menos ballast forward = menos nose weight = menos tight', pitroad: false },
      { priority: 5, component: 'LF PSI', direction: '↑ Aumentar', current_typical: '172 kPa', values: { mild: '+5 kPa', moderate: '+10 kPa', aggressive: '+15 kPa' }, reason: 'LF alto = menos carga LF = libera rotação', pitroad: true },
    ],
    pitstop_summary: '↑ LF PSI +5-10 kPa. ↓ RF PSI -5 kPa. ↓ Brake Bias -0.5%.'
  },
  'tight-exit': {
    type: 'tight', title: '🔵 Tight Exit – Classe B/C',
    physics: 'Na aceleração, o carro empurra para fora (push). Em B/C, Cross Weight alto, ARB muito rígido ou RR muito macia causam tight exit.',
    adjustments: [
      { priority: 1, component: 'Cross Weight', direction: '↓ Reduzir', current_typical: '52%', values: { mild: '-0.2%', moderate: '-0.5%', aggressive: '-0.8%' }, reason: 'Menos cross weight libera a saída', pitroad: false },
      { priority: 2, component: 'Track Bar Height', direction: '↑ Subir LR/RR', current_typical: '160mm', values: { mild: '+3mm', moderate: '+6mm', aggressive: '+10mm' }, reason: 'TB alto = mais carga traseira externa = melhor saída', pitroad: false },
      { priority: 3, component: 'RR Spring', direction: '↓ Reduzir rigidez', current_typical: '35 N/mm', values: { mild: '-5 N/mm', moderate: '-10 N/mm', aggressive: '-15 N/mm' }, reason: 'RR mais macia libera a saída', pitroad: false },
      { priority: 4, component: 'Truck Arm Mount', direction: 'Mudar para Top', current_typical: 'bottom', values: { mild: '→ top', moderate: '→ top', aggressive: '→ top' }, reason: 'Top = menos anti-squat = mais transferência traseira = mais rotação exit (cuidado com loose)', pitroad: false },
      { priority: 5, component: 'RF PSI', direction: '↓ Reduzir', current_typical: '310 kPa', values: { mild: '-5 kPa', moderate: '-10 kPa', aggressive: '-15 kPa' }, reason: 'Menos RF PSI = mais rotação exit', pitroad: true },
    ],
    pitstop_summary: '↑ RF PSI... mas ↓ pode ajudar tight exit. ↑ RR PSI +5 kPa. Ajustar track bar.'
  },
};


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

  const cls = window.AppClass || 'A';
  const isBorC = cls === 'B' || cls === 'C';
  // Use B/C matrix if on those classes, else standard
  const diag = (isBorC && window.DIAGNOSIS_MATRIX_BC) ? window.DIAGNOSIS_MATRIX_BC : window.DIAGNOSIS_MATRIX;
  let html = '';

  AppState.activeIssues.forEach(issue => {
    const d = diag[issue] || window.DIAGNOSIS_MATRIX?.[issue]; // fallback to standard
    if (!d) return;

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

  if (!html) {
    html = '<div class="analysis-empty"><div class="ae-icon">⚡</div><div class="ae-text">Nenhum diagnóstico disponível para os problemas selecionados nesta classe.</div></div>';
  }

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
