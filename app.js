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

  const setup = { raw: text, source: 'kapps' };

  // First non-empty line = timestamp ID
  let idLine = '';
  let startIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t) { idLine = t; startIdx = i + 1; break; }
  }

  // Check if idLine looks like HH:MM:SS
  const timeRe = /^\d{1,2}:\d{2}(:\d{2})?$/;
  if (timeRe.test(idLine)) {
    setup.kappsId = idLine;
    setup.name = 'Kapps ' + idLine;
  } else {
    // Not a time ID – try to parse anyway
    setup.kappsId = idLine;
    setup.name = 'Kapps Setup';
    startIdx = 0; // reparse from beginning
  }

  setup.timestamp = new Date().toISOString();

  let section = '';    // Top-level section: tires, chassis, front, rear, aero, brakes, geometry
  let corner = '';     // Corner: leftfront, rightfront, leftrear, rightrear
  let subSection = ''; // Sub-section within chassis, etc.

  const cornerMap = {
    'leftfront': 'lf', 'rightfront': 'rf', 'leftrear': 'lr', 'rightrear': 'rr',
    'lf': 'lf', 'rf': 'rf', 'lr': 'lr', 'rr': 'rr',
    'front left': 'lf', 'front right': 'rf', 'rear left': 'lr', 'rear right': 'rr'
  };

  // Parse tire kPa → PSI conversion: 138 kPa ≈ 20.0 PSI (Kapps uses kPa? or raw PSI?)
  // The example shows 138" – in iRacing, tire pressures in setup files are in kPa
  // 138 kPa = 20.0 PSI. But wait – could be 138 = PSI*100? Let's check: 138/100 = 1.38? No.
  // Actually iRacing .sto files store pressure as kPa integer: 138 kPa ≈ 20.0 PSI
  // Kapps likely shows the same raw value. We'll store raw and also convert.
  // Common range: 130-200 kPa = 18.8-29.0 PSI
  const kpaToPsi = (v) => v > 50 ? Math.round((v / 6.89476) * 10) / 10 : v;

  for (let i = startIdx; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trimEnd();
    if (!line.trim()) continue;

    // Determine indentation level
    const indent = line.length - line.trimStart().length;
    const trimmed = line.trim();
    const lower = trimmed.toLowerCase();

    // --- Section headers (indent 0 or 1) ---
    if (indent <= 1 && trimmed && !/\t/.test(raw.replace(/^\s*/, ''))) {
      // Could be section header or corner header
      const noTab = !trimmed.includes('\t');

      if (noTab) {
        // Section or corner identifier
        if (lower === 'tires' || lower === 'tire') {
          section = 'tires'; corner = ''; subSection = '';
        } else if (lower === 'chassis') {
          section = 'chassis'; corner = ''; subSection = '';
        } else if (lower === 'front' && section !== 'tires') {
          section = 'chassis'; subSection = 'front'; corner = '';
        } else if (lower === 'rear' && section !== 'tires') {
          section = 'chassis'; subSection = 'rear'; corner = '';
        } else if (lower === 'aero' || lower === 'aerodynamics') {
          section = 'aero'; corner = ''; subSection = '';
        } else if (lower === 'brakes' || lower === 'brake') {
          section = 'brakes'; corner = ''; subSection = '';
        } else if (lower === 'geometry' || lower === 'suspension') {
          section = 'geometry'; corner = ''; subSection = '';
        } else if (lower === 'drivetrain' || lower === 'differential') {
          section = 'drivetrain'; corner = ''; subSection = '';
        } else if (lower === 'pitroad' || lower === 'pit road' || lower === 'pit') {
          section = 'pitroad'; corner = ''; subSection = '';
        } else if (lower === 'springs') {
          section = 'springs'; corner = ''; subSection = '';
        } else if (lower === 'shocks' || lower === 'dampers') {
          section = 'shocks'; corner = ''; subSection = '';
        } else if (lower === 'arb' || lower === 'antirollbar' || lower === 'anti-roll') {
          section = 'arb'; corner = ''; subSection = '';
        } else if (lower in cornerMap) {
          corner = cornerMap[lower];
        } else if (lower === 'leftfront' || lower === 'left front') {
          corner = 'lf';
        } else if (lower === 'rightfront' || lower === 'right front') {
          corner = 'rf';
        } else if (lower === 'leftrear' || lower === 'left rear') {
          corner = 'lr';
        } else if (lower === 'rightrear' || lower === 'right rear') {
          corner = 'rr';
        } else {
          // Unknown single-word line at low indent = new section/subsection
          subSection = lower;
        }
        continue;
      }
    }

    // --- Corner headers at any indent (no tab, looks like LeftFront etc) ---
    const cornerK = cornerMap[lower];
    if (cornerK && !trimmed.includes('\t') && !trimmed.includes('=')) {
      corner = cornerK;
      continue;
    }

    // --- Field = value line (contains TAB or multiple spaces between field and value) ---
    // Kapps format: "FieldName\tValue" or "FieldName   Value"
    let fieldName = '', fieldValue = '';

    if (trimmed.includes('\t')) {
      const tabIdx = trimmed.indexOf('\t');
      fieldName = trimmed.substring(0, tabIdx).trim();
      fieldValue = trimmed.substring(tabIdx + 1).trim();
    } else if (trimmed.includes('=')) {
      const eqIdx = trimmed.indexOf('=');
      fieldName = trimmed.substring(0, eqIdx).trim();
      fieldValue = trimmed.substring(eqIdx + 1).trim();
    } else {
      // Multi-space separation (3+ spaces)
      const multiSpaceMatch = trimmed.match(/^(\S.*?)\s{3,}(.+)$/);
      if (multiSpaceMatch) {
        fieldName = multiSpaceMatch[1].trim();
        fieldValue = multiSpaceMatch[2].trim();
      } else {
        // Single value line – could be subsection header
        if (trimmed in cornerMap) { corner = cornerMap[trimmed.toLowerCase()]; }
        continue;
      }
    }

    const fLower = fieldName.toLowerCase().replace(/\s+/g, '');
    const val = parseKappsValue(fieldValue);
    if (val === null && fieldValue !== '0') continue;

    const pfx = corner || ''; // e.g. 'lf', 'rf', etc.

    // ─── TIRES ───
    if (section === 'tires' && pfx) {
      if (fLower === 'coldpressure' || fLower === 'cold' || fLower === 'coldpsi') {
        const psi = kpaToPsi(val);
        setup[pfx + '_psi'] = psi;
        setup[pfx + '_cold_kpa'] = val > 50 ? val : null;
      } else if (fLower === 'hotpressure' || fLower === 'hot' || fLower === 'hotpsi') {
        setup[pfx + '_hot_psi'] = kpaToPsi(val);
        setup[pfx + '_hot_kpa'] = val > 50 ? val : null;
      } else if (fLower === 'lasthotpressure' || fLower === 'lasthot') {
        setup[pfx + '_lasthot_psi'] = kpaToPsi(val);
      } else if (fLower === 'tempoutside' || fLower === 'tempout' || fLower === 'outsidetemp') {
        setup[pfx + '_temp_out'] = val;
      } else if (fLower === 'tempmiddle' || fLower === 'tempmid' || fLower === 'middletemp') {
        setup[pfx + '_temp_mid'] = val;
      } else if (fLower === 'tempinside' || fLower === 'tempin' || fLower === 'insidetemp') {
        setup[pfx + '_temp_in'] = val;
      } else if (fLower === 'treadoutside' || fLower === 'treadout') {
        setup[pfx + '_tread_out'] = typeof val === 'string' ? parseFloat(val) : val;
      } else if (fLower === 'treadmiddle' || fLower === 'treadmid') {
        setup[pfx + '_tread_mid'] = typeof val === 'string' ? parseFloat(val) : val;
      } else if (fLower === 'treadinside' || fLower === 'treadin') {
        setup[pfx + '_tread_in'] = typeof val === 'string' ? parseFloat(val) : val;
      } else if (fLower === 'wear' || fLower === 'treadwear') {
        setup[pfx + '_tread_avg'] = typeof val === 'string' ? parseFloat(val) : val;
      }
    }

    // ─── SPRINGS ───
    if (section === 'springs' || (section === 'chassis' && fLower.includes('spring'))) {
      const sp = pfx || (fLower.includes('lf') || fLower.includes('leftfront') ? 'lf' :
                         fLower.includes('rf') || fLower.includes('rightfront') ? 'rf' :
                         fLower.includes('lr') || fLower.includes('leftrear') ? 'lr' :
                         fLower.includes('rr') || fLower.includes('rightrear') ? 'rr' : '');
      if (sp && (fLower === 'springrate' || fLower === 'spring' || fLower.includes('spring'))) {
        setup[sp + '_spring'] = val;
      }
    }
    if (pfx && (fLower === 'springrate' || fLower === 'spring' || fLower === 'springratein' || fLower === 'rate')) {
      setup[pfx + '_spring'] = val;
    }

    // ─── RIDE HEIGHTS ───
    if (pfx && (fLower === 'rideheight' || fLower === 'height' || fLower === 'ride')) {
      setup[pfx + '_rh'] = val;
    }

    // ─── SHOCKS ───
    if (pfx && (fLower === 'lowspeedcompression' || fLower === 'lscomp' || fLower === 'compressionlow' || fLower === 'lowcomp')) {
      setup[pfx + '_lsc'] = val;
    }
    if (pfx && (fLower === 'highspeedcompression' || fLower === 'hscomp' || fLower === 'compressionhigh' || fLower === 'highcomp')) {
      setup[pfx + '_hsc'] = val;
    }
    if (pfx && (fLower === 'lowspeedrebound' || fLower === 'lsreb' || fLower === 'reboundlow' || fLower === 'lowreb' || fLower === 'lowrebound')) {
      setup[pfx + '_lsr'] = val;
    }
    if (pfx && (fLower === 'highspeedrebound' || fLower === 'hsreb' || fLower === 'reboundhigh' || fLower === 'highreb' || fLower === 'highrebound')) {
      setup[pfx + '_hsr'] = val;
    }
    // Generic compression/rebound by corner
    if (pfx && fLower === 'compression') setup[pfx + '_lsc'] = val;
    if (pfx && fLower === 'rebound') setup[pfx + '_lsr'] = val;

    // ─── CAMBER / CASTER / TOE ───
    if (pfx && fLower === 'camber') setup[pfx + '_camber'] = val;
    if (pfx && fLower === 'caster') setup[pfx + '_caster'] = val;
    if (pfx && fLower === 'toe') setup[pfx + '_toe'] = val;

    // ─── CHASSIS WEIGHT ───
    if (section === 'chassis' || section === '') {
      if (fLower === 'crossweight' || fLower === 'crossweightpct' || fLower === 'cross') {
        const cw = typeof val === 'string' ? parseFloat(val) : val;
        setup.cross_weight = cw;
      } else if (fLower === 'frontweight' || fLower === 'frontweightpct' || fLower === 'noseweight' || fLower === 'nose') {
        // Could be raw weight (lbs) or percentage
        if (typeof val === 'number' && val > 100) {
          setup.front_weight_lbs = val;
        } else {
          setup.nose_weight = val;
        }
      } else if (fLower === 'rearweight' || fLower === 'rear') {
        if (typeof val === 'number' && val > 100) setup.rear_weight_lbs = val;
      } else if (fLower === 'leftweight' || fLower === 'left') {
        if (typeof val === 'number' && val > 100) setup.left_weight_lbs = val;
      } else if (fLower === 'rightweight' || fLower === 'right') {
        if (typeof val === 'number' && val > 100) setup.right_weight_lbs = val;
      } else if (fLower === 'lfweight' || fLower === 'leftfrontweight') {
        setup.lf_corner_weight = val;
      } else if (fLower === 'rfweight' || fLower === 'rightfrontweight') {
        setup.rf_corner_weight = val;
      } else if (fLower === 'lrweight' || fLower === 'leftrearweight') {
        setup.lr_corner_weight = val;
      } else if (fLower === 'rrweight' || fLower === 'rightrearweight') {
        setup.rr_corner_weight = val;
      } else if (fLower === 'totalweight' || fLower === 'total') {
        setup.total_weight = val;
      }
    }

    // ─── BRAKES ───
    if (section === 'brakes' || fLower.includes('brake')) {
      if (fLower === 'brakebias' || fLower === 'frontbrakebiaspct' || fLower === 'bias') {
        setup.brake_bias = val;
      } else if (fLower === 'frontmastercylinder' || fLower === 'frontmc' || fLower === 'mastercylinderleft') {
        setup.f_master_cyl = val;
      } else if (fLower === 'rearmastercylinder' || fLower === 'rearmc' || fLower === 'mastercylinderright') {
        setup.r_master_cyl = val;
      }
    }

    // ─── ARB ───
    if (section === 'arb' || fLower.includes('arb') || fLower.includes('antiroll')) {
      const isRear = fLower.includes('rear') || subSection === 'rear' || (pfx === 'lr' || pfx === 'rr');
      const isFront = fLower.includes('front') || subSection === 'front' || (pfx === 'lf' || pfx === 'rf');
      const side = isRear ? 'r' : isFront ? 'f' : (subSection === 'rear' ? 'r' : 'f');
      if (fLower === 'diameter' || fLower === 'arb' || fLower.includes('diam')) {
        setup[side + '_arb_diam'] = fieldValue.trim(); // Keep as string for display
      } else if (fLower === 'arm' || fLower === 'arbarm' || fLower.includes('arm')) {
        setup[side + '_arb_arm'] = val;
      } else if (fLower === 'preload' || fLower === 'arbpreload') {
        setup[side + '_arb_preload'] = val;
      }
    }

    // ─── AERO ───
    if (section === 'aero') {
      if (fLower === 'rearspoiler' || fLower === 'spoiler' || fLower === 'rearspoilerangle') {
        setup.rear_spoiler = val;
      } else if (fLower === 'frontsplitter' || fLower === 'splitter') {
        setup.front_splitter = val;
      } else if (fLower === 'trackbar' || fLower === 'trackbarheight') {
        setup.track_bar = val;
      }
    }

    // ─── DRIVETRAIN ───
    if (section === 'drivetrain') {
      if (fLower === 'finalratio' || fLower === 'finaldrive' || fLower === 'ratio') {
        setup.final_drive = val;
      } else if (fLower === 'diffpreload' || fLower === 'preload' || fLower === 'differential') {
        setup.diff_preload = val;
      }
    }

    // ─── PIT ROAD / PERCH ───
    if (section === 'pitroad' && pfx) {
      if (fLower === 'perch' || fLower === 'springperch' || fLower === 'perchoffset') {
        setup[pfx + '_perch'] = val;
      }
    }

    // ─── GEOMETRY (Generic) ───
    if (section === 'geometry') {
      if (pfx) {
        if (fLower === 'camber') setup[pfx + '_camber'] = val;
        if (fLower === 'caster') setup[pfx + '_caster'] = val;
        if (fLower === 'toe') setup[pfx + '_toe'] = val;
      }
      if (fLower === 'pinionangle' || fLower === 'pinion') setup.pinion_angle = val;
      if (fLower === 'steeroffset' || fLower === 'steer') setup.steer_offset = val;
    }
  }

  // Derive nose weight from front/total if not yet parsed
  if (!setup.nose_weight && setup.front_weight_lbs && setup.total_weight) {
    setup.nose_weight = Math.round((setup.front_weight_lbs / setup.total_weight) * 1000) / 10;
  }
  if (!setup.cross_weight && setup.lf_corner_weight && setup.rf_corner_weight && setup.lr_corner_weight && setup.rr_corner_weight) {
    const diag = setup.lf_corner_weight + setup.rr_corner_weight;
    const total = setup.lf_corner_weight + setup.rf_corner_weight + setup.lr_corner_weight + setup.rr_corner_weight;
    setup.cross_weight = Math.round((diag / total) * 1000) / 10;
    if (!setup.total_weight) setup.total_weight = total;
    if (!setup.nose_weight) {
      const front = setup.lf_corner_weight + setup.rf_corner_weight;
      setup.nose_weight = Math.round((front / total) * 1000) / 10;
    }
  }

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
  setup.source = 'manual';
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
    <div class="as-header">🛞 Pressões de Pneus – Fria (Cold PSI)</div>
    <div class="as-content">
      <div class="param-grid">
        ${pCell('LF Cold', setup.lf_psi, ' PSI', getPsiStatus(setup.lf_psi,'LF'))}
        ${pCell('RF Cold', setup.rf_psi, ' PSI', getPsiStatus(setup.rf_psi,'RF'))}
        ${pCell('LR Cold', setup.lr_psi, ' PSI', getPsiStatus(setup.lr_psi,'LR'))}
        ${pCell('RR Cold', setup.rr_psi, ' PSI', getPsiStatus(setup.rr_psi,'RR'))}
      </div>
      <div class="mt-1" style="font-size:0.78rem; color:var(--text-secondary)">${analyzePressures(setup)}</div>
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

  // ── SPRINGS ──
  const springsSection = `
  <div class="analysis-section">
    <div class="as-header">🌀 Molas</div>
    <div class="as-content">
      <div class="param-grid">
        ${pCell('LF Spring', setup.lf_spring, ' lbs')}
        ${pCell('RF Spring', setup.rf_spring, ' lbs')}
        ${pCell('LR Spring', setup.lr_spring, ' lbs')}
        ${pCell('RR Spring', setup.rr_spring, ' lbs')}
      </div>
      <div class="mt-1" style="font-size:0.78rem; color:var(--text-secondary)">${analyzeSprings(setup)}</div>
    </div>
  </div>`;

  // ── RIDE HEIGHTS ──
  const rhSection = (setup.lf_rh || setup.rf_rh || setup.lr_rh || setup.rr_rh) ? `
  <div class="analysis-section">
    <div class="as-header">📏 Ride Heights</div>
    <div class="as-content">
      <div class="param-grid">
        ${pCell('LF RH', setup.lf_rh, '"')}
        ${pCell('RF RH', setup.rf_rh, '"')}
        ${pCell('LR RH', setup.lr_rh, '"')}
        ${pCell('RR RH', setup.rr_rh, '"')}
      </div>
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
        <div style="font-size:0.75rem;color:var(--gold);font-weight:700;margin-bottom:0.4rem;text-transform:uppercase;letter-spacing:0.05em">Pesos por Canto (lbs) <span class="kapps-badge">KAPPS</span></div>
        <div class="param-grid">
          ${pCell('LF', setup.lf_corner_weight, ' lbs')}
          ${pCell('RF', setup.rf_corner_weight, ' lbs')}
          ${pCell('LR', setup.lr_corner_weight, ' lbs')}
          ${pCell('RR', setup.rr_corner_weight, ' lbs')}
        </div>
        ${total ? `<div style="font-size:0.75rem;color:var(--text-dim);margin-top:0.4rem">Peso Total: ${total} lbs · Frente: ${setup.front_weight_lbs||'—'} lbs · Traseira: ${setup.rear_weight_lbs||'—'} lbs · Esquerda: ${setup.left_weight_lbs||'—'} lbs</div>` : ''}
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
    arbSection = `
  <div class="analysis-section">
    <div class="as-header">🔗 Anti-Roll Bar (ARB)</div>
    <div class="as-content">
      <div class="param-grid">
        ${pCell('Front Diam', setup.f_arb_diam, '"')}
        ${pCell('Front Arm', setup.f_arb_arm ? 'P'+setup.f_arb_arm : null, '')}
        ${setup.f_arb_preload !== undefined ? pCell('Front Preload', setup.f_arb_preload, ' lbs') : ''}
        ${pCell('Rear Diam', setup.r_arb_diam, '"')}
        ${pCell('Rear Arm', setup.r_arb_arm ? 'P'+setup.r_arb_arm : null, '')}
        ${setup.r_arb_preload !== undefined ? pCell('Rear Preload', setup.r_arb_preload, ' lbs') : ''}
      </div>
    </div>
  </div>`;
  }

  // ── DRIVETRAIN ──
  let driveSection = '';
  if (setup.final_drive || setup.diff_preload) {
    driveSection = `
  <div class="analysis-section">
    <div class="as-header">⚙️ Drivetrain</div>
    <div class="as-content">
      <div class="param-grid">
        ${setup.final_drive ? pCell('Final Drive', setup.final_drive, '') : ''}
        ${setup.diff_preload !== undefined ? pCell('Diff Preload', setup.diff_preload, ' lbs') : ''}
        ${setup.f_master_cyl ? pCell('Front M.C.', setup.f_master_cyl, '"') : ''}
        ${setup.r_master_cyl ? pCell('Rear M.C.', setup.r_master_cyl, '"') : ''}
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

  result.innerHTML = tiresSection + springsSection + rhSection + weightSection + geoSection + shocksSection + arbSection + driveSection + aeroSection + diagSection;
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
