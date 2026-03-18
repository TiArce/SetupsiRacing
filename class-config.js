// =============================================
//  NASCAR Multi-Class Configuration
//  class-config.js
//  Defines parameters, labels, and physics for
//  Class A (Next Gen Cup), B (O'Reilly/Xfinity),
//  C (Trucks)
// =============================================

window.CLASS_CONFIGS = {

  // ─── CLASS A – NASCAR Next Gen Cup ───────────────────────────────
  A: {
    id: 'A',
    name: 'NASCAR Next Gen',
    subtitle: 'Cup Series – Class A',
    emoji: '🏆',
    color: '#e8a000',
    colorDim: 'rgba(232,160,0,0.15)',
    border: 'rgba(232,160,0,0.4)',
    badge: 'CUP',
    badgeColor: '#e8a000',
    description: 'Mais avançado. Motor V8 de alta performance, aerodinâmica geração atual, pneus Goodyear de alta aderência.',
    weight_unit: 'lbs',
    pressure_unit: 'PSI',
    spring_unit: 'lbs/in',
    height_unit: 'in',
    corner_weight_unit: 'lbs',
    // Default pressure ranges for PSI validation
    pressure_ranges: { LF:[25,33], RF:[25,35], LR:[18,28], RR:[20,30] },
    // Converts raw Kapps value to display unit (Class A uses imperial)
    convertPressure: (v) => v > 50 ? Math.round((v / 6.89476) * 10) / 10 : v,
    convertSpring: (v) => v, // already lbs/in
    convertHeight: (v) => v, // already inches
    convertWeight: (v) => v, // already lbs
    // Setup tips specific to this class
    tips: {
      nose_weight: { ideal: [51.5, 52.5], unit: '%', label: 'Nose Weight' },
      cross_weight: { ideal: [49.5, 51.5], unit: '%', label: 'Cross Weight' },
      brake_bias:   { ideal: [53, 57], unit: '%', label: 'Brake Bias' },
    },
    // Diagnosis matrix keys (same as existing)
    diagnosis: 'standard',
    // Simulator preset defaults
    sim_defaults: {
      lf_psi: 28, rf_psi: 30, lr_psi: 22, rr_psi: 26,
      lf_spring: 550, rf_spring: 650, lr_spring: 175, rr_spring: 250,
    }
  },

  // ─── CLASS B – NASCAR O'Reilly / Xfinity ─────────────────────────
  B: {
    id: 'B',
    name: 'NASCAR O\'Reilly',
    subtitle: 'Xfinity Series – Class B',
    emoji: '🥈',
    color: '#5c9fe8',
    colorDim: 'rgba(92,159,232,0.15)',
    border: 'rgba(92,159,232,0.4)',
    badge: 'XFINITY',
    badgeColor: '#5c9fe8',
    description: 'V8 de 675 bhp, menos downforce que o Cup. Requer mais grip mecânico, configurações mais firmes.',
    weight_unit: 'N',
    pressure_unit: 'kPa',
    spring_unit: 'N/mm',
    height_unit: 'mm',
    corner_weight_unit: 'N',
    // Pressure in kPa – Class B reference: LF/LR ~172 kPa (25 PSI), RF/RR ~310 kPa (45 PSI)
    pressure_ranges: { LF:[150,210], RF:[280,350], LR:[150,210], RR:[280,350] },
    // Converts kPa to display (keep kPa for B/C)
    convertPressure: (v) => v, // keep raw kPa
    convertSpring: (v) => v,   // N/mm
    convertHeight: (v) => v,   // mm
    convertWeight: (v) => v,   // N
    tips: {
      nose_weight: { ideal: [50.5, 52.0], unit: '%', label: 'Nose Weight' },
      cross_weight: { ideal: [49.5, 52.5], unit: '%', label: 'Cross Weight' },
      brake_bias:   { ideal: [62, 67], unit: '%', label: 'Brake Bias' },
    },
    diagnosis: 'truck_style', // B uses truck arm rear like C
    // Car-specific parameters
    params: {
      ballast_forward: { label: 'Ballast Forward', unit: 'mm', range: [-1000, 1000], default: 0 },
      steering_ratio:  { label: 'Steering Ratio', unit: '', range: [700, 1000], default: 841 },
      steering_offset: { label: 'Steering Offset', unit: '°', range: [-30, 30], default: 0 },
      tape_config:     { label: 'Tape Configuration', unit: '', options: ['Qual', 'Race', 'Open'] },
      // Springs: Shock Spring Rate (N/mm) for front, linear spring for rear
      lf_shock_spring: { label: 'LF Shock Spring', unit: 'N/mm', range: [100, 3000], default: 1575 },
      rf_shock_spring: { label: 'RF Shock Spring', unit: 'N/mm', range: [100, 3000], default: 1575 },
      lf_packer:       { label: 'LF Packer', unit: 'mm', range: [0, 50], default: 12.7 },
      rf_packer:       { label: 'RF Packer', unit: 'mm', range: [0, 50], default: 25.4 },
      lr_spring:       { label: 'LR Spring', unit: 'N/mm', range: [5, 200], default: 70 },
      rr_spring:       { label: 'RR Spring', unit: 'N/mm', range: [5, 200], default: 35 },
      track_bar_lr:    { label: 'LR Track Bar', unit: 'mm', range: [100, 300], default: 159 },
      track_bar_rr:    { label: 'RR Track Bar', unit: 'mm', range: [100, 300], default: 165 },
      truck_arm_mount: { label: 'Truck Arm Mount', unit: '', options: ['bottom','top'] },
      truck_arm_preload:{ label: 'Truck Arm Preload', unit: 'Nm', range: [-20, 20], default: 0 },
      rear_end_ratio:  { label: 'Rear End Ratio', unit: ':1', range: [3.0, 5.0], default: 3.89 },
      // Front ARB
      arb_diameter:    { label: 'ARB Diameter', unit: 'mm', range: [25, 64], default: 51 },
      arb_arm_asym:    { label: 'ARB Arm Asymmetry', unit: '', range: [1, 7], default: 5 },
      arb_link_slack:  { label: 'ARB Link Slack', unit: 'mm', range: [-10, 30], default: -1 },
      arb_preload:     { label: 'ARB Preload', unit: 'Nm', range: [-400, 400], default: -182.4 },
      arb_attach:      { label: 'ARB Attach', unit: '', range: [1, 3], default: 1 },
    },
    sim_defaults: {
      lf_psi: 172, rf_psi: 310, lr_psi: 172, rr_psi: 310,
      lf_spring: 1575, rf_spring: 1575, lr_spring: 70, rr_spring: 35,
      lf_rh: 108, rf_rh: 110, lr_rh: 162, rr_rh: 164,
      cross_weight: 52.0, nose_weight: 51.1, brake_bias: 65.0,
      lf_camber: 5.9, rf_camber: -3.3,
    }
  },

  // ─── CLASS C – NASCAR Trucks ─────────────────────────────────────
  C: {
    id: 'C',
    name: 'NASCAR Trucks',
    subtitle: 'Camping World Truck – Class C',
    emoji: '🚚',
    color: '#e85c5c',
    colorDim: 'rgba(232,92,92,0.15)',
    border: 'rgba(232,92,92,0.4)',
    badge: 'TRUCKS',
    badgeColor: '#e85c5c',
    description: 'Pick-up NASCAR. Maior altura, menos aerodinâmico. Grip mecânico é fundamental. ARB grande, molas pigtail na frente.',
    weight_unit: 'N',
    pressure_unit: 'kPa',
    spring_unit: 'N/mm',
    height_unit: 'mm',
    corner_weight_unit: 'N',
    // Pressure in kPa – Class C reference: LF/LR ~179 kPa (26 PSI), RF/RR ~310 kPa (45 PSI)
    pressure_ranges: { LF:[155,215], RF:[285,345], LR:[155,215], RR:[285,345] },
    convertPressure: (v) => v,
    convertSpring: (v) => v,
    convertHeight: (v) => v,
    convertWeight: (v) => v,
    tips: {
      nose_weight: { ideal: [49.5, 51.5], unit: '%', label: 'Nose Weight' },
      cross_weight: { ideal: [49.0, 52.0], unit: '%', label: 'Cross Weight' },
      brake_bias:   { ideal: [60, 66], unit: '%', label: 'Brake Bias' },
    },
    diagnosis: 'truck_style',
    params: {
      ballast_forward: { label: 'Ballast Forward', unit: 'mm', range: [-1000, 1000], default: -559 },
      steering_ratio:  { label: 'Steering Ratio', unit: '', range: [700, 1000], default: 841 },
      steering_offset: { label: 'Steering Offset', unit: '°', range: [-30, 30], default: 3 },
      tape_config:     { label: 'Tape Configuration', unit: '', options: ['Qual', 'Race', 'Open'] },
      // Pigtail springs (two-stage progressive)
      lf_spring:       { label: 'LF Spring Rate', unit: 'N/mm', range: [50, 3000], default: 1575 },
      rf_spring:       { label: 'RF Spring Rate', unit: 'N/mm', range: [50, 3000], default: 1575 },
      lf_spring_angle: { label: 'LF Spring Angle', unit: '°', range: [0, 90], default: 35 },
      rf_spring_angle: { label: 'RF Spring Angle', unit: '°', range: [0, 90], default: 5 },
      lr_spring:       { label: 'LR Spring Rate', unit: 'N/mm', range: [20, 500], default: 131 },
      rr_spring:       { label: 'RR Spring Rate', unit: 'N/mm', range: [20, 500], default: 236 },
      track_bar_lr:    { label: 'LR Track Bar', unit: 'mm', range: [150, 350], default: 222 },
      track_bar_rr:    { label: 'RR Track Bar', unit: 'mm', range: [150, 350], default: 229 },
      truck_arm_mount: { label: 'Truck Arm Mount', unit: '', options: ['bottom','top'] },
      truck_arm_preload:{ label: 'Truck Arm Preload', unit: 'Nm', range: [-20, 20], default: -7.8 },
      rear_end_ratio:  { label: 'Rear End Ratio', unit: ':1', range: [2.5, 5.0], default: 3.33 },
      // Front ARB – large diameter pigtail style
      arb_diameter:    { label: 'ARB Diameter', unit: 'mm', range: [25, 76], default: 64 },
      arb_arm_asym:    { label: 'ARB Arm Asymmetry', unit: '', options: ['1','2','3','4','5','Max'], default: 'Max' },
      arb_link_slack:  { label: 'ARB Link Slack', unit: 'mm', range: [-5, 50], default: 19 },
      arb_preload:     { label: 'ARB Preload', unit: 'Nm', range: [-400, 400], default: 0 },
      arb_attach:      { label: 'ARB Attach', unit: '', range: [1, 3], default: 1 },
    },
    sim_defaults: {
      lf_psi: 179, rf_psi: 310, lr_psi: 179, rr_psi: 310,
      lf_spring: 1575, rf_spring: 1575, lr_spring: 131, rr_spring: 236,
      lf_rh: 116, rf_rh: 114, lr_rh: 128, rr_rh: 126,
      cross_weight: 50.5, nose_weight: 50.1, brake_bias: 62.0,
      lf_camber: 6.0, rf_camber: -3.0,
    }
  }
};

// Active class – defaults to A on first load
window.AppClass = window.AppClass || 'A';

// Helper to get current class config
window.getClassConfig = function() {
  return window.CLASS_CONFIGS[window.AppClass] || window.CLASS_CONFIGS.A;
};

// Car labels per class
window.CLASS_LABELS = {
  A: {
    car_name: 'NASCAR Next Gen Cup',
    car_short: 'Cup Car',
    car_number: '#18',
    nav_setup: '🔧 Setup Analyzer',
    unit_pressure: 'PSI',
    unit_spring: 'lbs/in',
    unit_height: 'in',
    unit_weight: 'lbs',
  },
  B: {
    car_name: 'NASCAR O\'Reilly (Xfinity)',
    car_short: 'Xfinity Car',
    car_number: '#5',
    nav_setup: '🔧 Setup Analyzer',
    unit_pressure: 'kPa',
    unit_spring: 'N/mm',
    unit_height: 'mm',
    unit_weight: 'N',
  },
  C: {
    car_name: 'NASCAR Camping World Truck',
    car_short: 'Truck',
    car_number: '#88',
    nav_setup: '🔧 Setup Analyzer',
    unit_pressure: 'kPa',
    unit_spring: 'N/mm',
    unit_height: 'mm',
    unit_weight: 'N',
  },
};

// Physics/handling tips per class for the diagnosis
window.CLASS_PHYSICS = {
  B: {
    tight_causes: [
      'Cross Weight alto (>52.5%)',
      'Track Bar muito baixo',
      'Nose Weight alto (>52%)',
      'ARB dianteiro muito rígido (diâmetro grande)',
      'LR Spring muito rígida',
      'Brake Bias muito traseiro (<60%)',
    ],
    loose_causes: [
      'Cross Weight baixo (<49%)',
      'Track Bar muito alto',
      'Nose Weight baixo (<50%)',
      'ARB dianteiro fraco',
      'RR Spring muito macia',
      'Truck Arm Mount no topo (menos grip traseiro)',
    ],
    ride_height_targets: {
      front_splitter: '~6mm (~0.25")',
      rear: '114-127mm (4.5-5.0")',
    },
    notes: 'Menos downforce que o Cup. Setup mais firme necessário para manter a atitude aerodinâmica. LR macia libera o carro; LR rígida tightens.',
  },
  C: {
    tight_causes: [
      'Cross Weight alto (>52%)',
      'Track Bar baixo',
      'Nose Weight alto (>51.5%)',
      'ARB muito rígido',
      'LR Spring rígida demais',
    ],
    loose_causes: [
      'Cross Weight baixo (<48.5%)',
      'Track Bar alto',
      'Nose Weight baixo (<49%)',
      'Truck Arm Mount no topo',
      'RR Spring muito macia',
      'ARB link slack positivo excessivo',
    ],
    ride_height_targets: {
      front_splitter: '~0.25" (6mm)',
      rear: '100-110mm (3.9-4.3")',
    },
    notes: 'Menor downforce que Xfinity. Molas pigtail de dois estágios na frente. ARB grande padrão. Truck Arm Mount influencia muito o grip traseiro.',
  }
};
