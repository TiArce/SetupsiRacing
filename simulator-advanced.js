// =============================================
//  NASCAR Next Gen – Advanced Setup Simulator
//  simulator-advanced.js  (Full Rewrite)
//  All parameters, real-time multi-axis feedback
//  Groups: tires, springs, shocks_comp, shocks_reb,
//          arb, weight, brakes, geometry, ride_height,
//          aero, drivetrain, perch
// =============================================

// ─── HELPER: linear map ─────────────────────────────────────────
function map(v, inMin, inMax, outMin, outMax) {
  if (typeof v !== 'number') return 0;
  const t = Math.max(0, Math.min(1, (v - inMin) / (inMax - inMin)));
  return outMin + t * (outMax - outMin);
}

// ─── PARAMETER DEFINITIONS ──────────────────────────────────────
window.ADV_SIM_PARAMS = {

  // ════════════════════════════════════════════
  //  TIRES – PRESSÃO FRIA
  // ════════════════════════════════════════════
  lf_psi: {
    id:'lf_psi', label:'LF PSI', unit:'PSI', min:18, max:42, def:28, step:0.5,
    group:'tires', icon:'🛞', grpFilter:['tires'],
    desc:'Pressão fria pneu dianteiro esquerdo. Maior PSI = área de contato menor = mais tight. Em oval LF alto aumenta subesterçamento na entrada.',
    tips: ['↑ PSI = Tight Entry/Center','↓ PSI = Loose, mais desgaste'],
    fn: v => ({
      entry:    map(v,18,42,+15,-5),  center:   map(v,18,42,+10,-5),
      exit:     map(v,18,42,+8, -3),  rotation: map(v,18,42,-8, +5),
      stability:map(v,18,42,-5,+10),  tire_wear:map(v,18,42,+20,-15),
      aero:0,
    })
  },
  rf_psi: {
    id:'rf_psi', label:'RF PSI', unit:'PSI', min:18, max:42, def:28, step:0.5,
    group:'tires', icon:'🛞', grpFilter:['tires'],
    desc:'Pressão fria pneu dianteiro direito. RF é o pneu mais carregado no oval. RF alto = reduz grip = mais loose. RF baixo = mais grip = mais tight.',
    tips: ['↑ PSI = Loose (RF perde grip)','↓ PSI = Tight Entry/Center'],
    fn: v => ({
      entry:    map(v,18,42,-10,+18), center:   map(v,18,42,-8, +15),
      exit:     map(v,18,42,-5, +8),  rotation: map(v,18,42,+10,-10),
      stability:map(v,18,42,-8, +8),  tire_wear:map(v,18,42,+18,-12),
      aero:0,
    })
  },
  lr_psi: {
    id:'lr_psi', label:'LR PSI', unit:'PSI', min:18, max:42, def:22, step:0.5,
    group:'tires', icon:'🛞', grpFilter:['tires'],
    desc:'Pressão fria pneu traseiro esquerdo. LR alto = mais carga diagonal LR-RF = mais tight center. Ajuste sutil mas efetivo no balanço geral.',
    tips: ['↑ PSI = Tight Center/Exit','↓ PSI = Loose Center'],
    fn: v => ({
      entry:    map(v,18,42,+5,-12),  center:   map(v,18,42,+8,-15),
      exit:     map(v,18,42,-5,+10),  rotation: map(v,18,42,-6, +5),
      stability:map(v,18,42,-5, +8),  tire_wear:map(v,18,42,+12,-10),
      aero:0,
    })
  },
  rr_psi: {
    id:'rr_psi', label:'RR PSI', unit:'PSI', min:18, max:42, def:24, step:0.5,
    group:'tires', icon:'🛞', grpFilter:['tires'],
    desc:'Pressão fria pneu traseiro direito. RR é o pneu traseiro mais carregado no oval. RR alto = perda de grip = mais loose center/exit.',
    tips: ['↑ PSI = Loose Center/Exit','↓ PSI = Tight, mais desgaste'],
    fn: v => ({
      entry:    map(v,18,42,-8, +12), center:   map(v,18,42,-15,+18),
      exit:     map(v,18,42,-12,+20), rotation: map(v,18,42,+8, -8),
      stability:map(v,18,42,-8, +6),  tire_wear:map(v,18,42,+15,-12),
      aero:0,
    })
  },

  // ════════════════════════════════════════════
  //  SPRINGS – MOLAS
  // ════════════════════════════════════════════
  lf_spring: {
    id:'lf_spring', label:'LF Spring', unit:'lbs', min:300, max:1600, def:550, step:25,
    group:'springs', icon:'🌀', grpFilter:['springs'],
    desc:'Mola dianteira esquerda. LF mais rígida = alivia peso no LF = carro tende ao loose. LF mais macia = mais carga LF = mais tight entry.',
    tips: ['↑ Taxa = Loose Entry','↓ Taxa = Tight Entry'],
    fn: v => ({
      entry:    map(v,300,1600,-12,+18), center:   map(v,300,1600,-8, +12),
      exit:     map(v,300,1600,-5, +8),  rotation: map(v,300,1600,+10,-12),
      stability:map(v,300,1600,-10,+15), tire_wear:map(v,300,1600,-5, +15),
      aero:     map(v,300,1600,-5,+10),
    })
  },
  rf_spring: {
    id:'rf_spring', label:'RF Spring', unit:'lbs', min:300, max:1600, def:600, step:25,
    group:'springs', icon:'🌀', grpFilter:['springs'],
    desc:'Mola dianteira direita. RF mais rígida = mantém mais carga no RF = mais tight. Mola mais macia = RF comprime mais na curva = mais loose/rotação.',
    tips: ['↑ Taxa = Tight Entry/Center','↓ Taxa = Loose/Rotação'],
    fn: v => ({
      entry:    map(v,300,1600,+15,-10), center:   map(v,300,1600,+18,-15),
      exit:     map(v,300,1600,+8, -5),  rotation: map(v,300,1600,-15,+10),
      stability:map(v,300,1600,+15,-10), tire_wear:map(v,300,1600,+8, -5),
      aero:     map(v,300,1600,+8,-5),
    })
  },
  lr_spring: {
    id:'lr_spring', label:'LR Spring', unit:'lbs', min:100, max:800, def:175, step:25,
    group:'springs', icon:'🌀', grpFilter:['springs'],
    desc:'Mola traseira esquerda. LR mais rígida = mais carga no LR = mais tight center/exit. LR mais macia = alivia LR na curva = mais loose. Afeta cross weight dinâmico.',
    tips: ['↑ Taxa = Tight Center/Exit','↓ Taxa = Loose Exit'],
    fn: v => ({
      entry:    map(v,100,800,+5, -8),  center:   map(v,100,800,+10,-12),
      exit:     map(v,100,800,+15,-18), rotation: map(v,100,800,-8, +10),
      stability:map(v,100,800,+8, -5),  tire_wear:map(v,100,800,+5, -8),
      aero:0,
    })
  },
  rr_spring: {
    id:'rr_spring', label:'RR Spring', unit:'lbs', min:100, max:800, def:225, step:25,
    group:'springs', icon:'🌀', grpFilter:['springs'],
    desc:'Mola traseira direita. RR mais rígida = transfere carga do RR = mais loose center/exit. RR mais macia = mantém RR plantado = mais tight. Fundamental para tração.',
    tips: ['↑ Taxa = Loose Center/Exit','↓ Taxa = Tight, mais tração'],
    fn: v => ({
      entry:    map(v,100,800,-8, +15), center:   map(v,100,800,-15,+18),
      exit:     map(v,100,800,-18,+20), rotation: map(v,100,800,+10,-10),
      stability:map(v,100,800,-8, +10), tire_wear:map(v,100,800,-10,+18),
      aero:0,
    })
  },

  // ════════════════════════════════════════════
  //  SHOCKS – LS COMPRESSION
  // ════════════════════════════════════════════
  lf_ls_comp: {
    id:'lf_ls_comp', label:'LF LS Comp', unit:'', min:1, max:12, def:5, step:1,
    group:'shocks_comp', icon:'🔩', grpFilter:['shocks'],
    desc:'Compressão baixa velocidade LF. Controla o mergulho na frenagem. Alto = resiste à compressão = Tight Entry. Baixo = mergulho rápido = Loose Entry.',
    tips: ['↑ = Tight Entry (resistência ao mergulho)','↓ = Loose Entry (mergulho rápido)'],
    fn: v => ({
      entry:    map(v,1,12,+20,-15), center:   map(v,1,12,+8, -5),
      exit:     map(v,1,12,+5, -3),  rotation: map(v,1,12,-10,+8),
      stability:map(v,1,12,+12,-8),  tire_wear:map(v,1,12,+5, -5),
      aero:     map(v,1,12,+5,-3),
    })
  },
  rf_ls_comp: {
    id:'rf_ls_comp', label:'RF LS Comp', unit:'', min:1, max:12, def:6, step:1,
    group:'shocks_comp', icon:'🔩', grpFilter:['shocks'],
    desc:'Compressão baixa velocidade RF. Principal controle de Tight Entry. Alto = RF resiste forte à frenagem = muito tight. Baixo = RF mergulha = loose entry.',
    tips: ['↑ = Tight Entry (principal)','↓ = Loose Entry'],
    fn: v => ({
      entry:    map(v,1,12,+22,-18), center:   map(v,1,12,+10,-8),
      exit:     map(v,1,12,+5, -3),  rotation: map(v,1,12,-12,+10),
      stability:map(v,1,12,+15,-10), tire_wear:map(v,1,12,+5, -5),
      aero:     map(v,1,12,+6,-4),
    })
  },
  lr_ls_comp: {
    id:'lr_ls_comp', label:'LR LS Comp', unit:'', min:1, max:12, def:4, step:1,
    group:'shocks_comp', icon:'🔩', grpFilter:['shocks'],
    desc:'Compressão baixa velocidade LR. Controla agachamento na aceleração. Alto = LR resiste ao agachamento = Loose Exit (traseira "salta"). Baixo = absorve = mais tração.',
    tips: ['↑ = Loose Exit (LR salta sob aceleração)','↓ = Melhor tração saída'],
    fn: v => ({
      entry:    map(v,1,12,-3, +5),  center:   map(v,1,12,-3, +5),
      exit:     map(v,1,12,+15,-20), rotation: map(v,1,12,+5, -8),
      stability:map(v,1,12,-5, +8),  tire_wear:map(v,1,12,-3, +8),
      aero:0,
    })
  },
  rr_ls_comp: {
    id:'rr_ls_comp', label:'RR LS Comp', unit:'', min:1, max:12, def:5, step:1,
    group:'shocks_comp', icon:'🔩', grpFilter:['shocks'],
    desc:'Compressão baixa velocidade RR. Mais alto = RR mais rígido na aceleração = Loose Exit. Menos = RR mais complacente = Tight Exit / melhor tração.',
    tips: ['↑ = Loose Exit (RR rígido)','↓ = Tight Exit / Tração'],
    fn: v => ({
      entry:    map(v,1,12,-3, +5),  center:   map(v,1,12,-5, +8),
      exit:     map(v,1,12,+18,-22), rotation: map(v,1,12,+5, -8),
      stability:map(v,1,12,-8, +10), tire_wear:map(v,1,12,-5, +10),
      aero:0,
    })
  },

  // ════════════════════════════════════════════
  //  SHOCKS – HS COMPRESSION
  // ════════════════════════════════════════════
  lf_hs_comp: {
    id:'lf_hs_comp', label:'LF HS Comp', unit:'', min:1, max:12, def:4, step:1,
    group:'shocks_comp', icon:'🔩', grpFilter:['shocks'],
    desc:'Compressão alta velocidade LF. Controla impactos rápidos e bumps. Pista rugosa: baixo para absorver. Pista lisa: mais alto para estabilidade aero.',
    tips: ['↑ = Tight Entry em bumps','↓ = Absorção de bumps (pistas rugosas)'],
    fn: v => ({
      entry:    map(v,1,12,+12,-8),  center:   map(v,1,12,+5, -3),
      exit:     map(v,1,12,+3, -2),  rotation: map(v,1,12,-5, +3),
      stability:map(v,1,12,+8,-10),  tire_wear:map(v,1,12,+8, -8),
      aero:     map(v,1,12,+4,-4),
    })
  },
  rf_hs_comp: {
    id:'rf_hs_comp', label:'RF HS Comp', unit:'', min:1, max:12, def:5, step:1,
    group:'shocks_comp', icon:'🔩', grpFilter:['shocks'],
    desc:'Compressão alta velocidade RF. Importante em pistas com bumps na entrada (Texas T1, Dover). Alto = carro rejeita bump = instabilidade. Baixo = absorve melhor.',
    tips: ['↑ = Rejeita bumps (instável em pistas rugosas)','↓ = Absorção de bump (grip em curvas rugosas)'],
    fn: v => ({
      entry:    map(v,1,12,+15,-10), center:   map(v,1,12,+6, -4),
      exit:     map(v,1,12,+3, -2),  rotation: map(v,1,12,-8, +5),
      stability:map(v,1,12,+6,-12),  tire_wear:map(v,1,12,+10,-10),
      aero:     map(v,1,12,+5,-5),
    })
  },
  lr_hs_comp: {
    id:'lr_hs_comp', label:'LR HS Comp', unit:'', min:1, max:12, def:4, step:1,
    group:'shocks_comp', icon:'🔩', grpFilter:['shocks'],
    desc:'Compressão alta velocidade LR. Pistas rugosas traseiras (Charlotte T3/T4). Alto = traseira salta sobre bumps = Loose Exit. Baixo = absorve = mais tração.',
    tips: ['↑ = Loose Exit em pistas rugosas','↓ = Absorção / Tração (pistas com bumps traseiros)'],
    fn: v => ({
      entry:    map(v,1,12,0,0),     center:   map(v,1,12,-2, +3),
      exit:     map(v,1,12,+8,-12),  rotation: map(v,1,12,+3, -5),
      stability:map(v,1,12,-5, +5),  tire_wear:map(v,1,12,-5, +10),
      aero:0,
    })
  },
  rr_hs_comp: {
    id:'rr_hs_comp', label:'RR HS Comp', unit:'', min:1, max:12, def:5, step:1,
    group:'shocks_comp', icon:'🔩', grpFilter:['shocks'],
    desc:'Compressão alta velocidade RR. Pista rugosa: baixo para melhor tração. Pista lisa: médio-alto para estabilidade aerodinâmica na saída da curva.',
    tips: ['↑ = Loose Exit (RR salta)','↓ = Estabilidade / Tração saída'],
    fn: v => ({
      entry:    map(v,1,12,0,0),     center:   map(v,1,12,-3, +5),
      exit:     map(v,1,12,+10,-15), rotation: map(v,1,12,+3, -5),
      stability:map(v,1,12,-8, +8),  tire_wear:map(v,1,12,-8, +12),
      aero:0,
    })
  },

  // ════════════════════════════════════════════
  //  SHOCKS – LS REBOUND
  // ════════════════════════════════════════════
  lf_ls_reb: {
    id:'lf_ls_reb', label:'LF LS Reb', unit:'', min:1, max:12, def:6, step:1,
    group:'shocks_reb', icon:'🔩', grpFilter:['shocks'],
    desc:'Rebound baixa velocidade LF. Alto = LF lento para estender após frenagem = carro mantém dianteiro baixo na saída = Tight Exit. Baixo = extensão rápida = Loose Exit.',
    tips: ['↑ = Tight Exit (LF permanece baixo)','↓ = Loose Exit (LF estende rápido)'],
    fn: v => ({
      entry:    map(v,1,12,+5, -3),  center:   map(v,1,12,+8, -5),
      exit:     map(v,1,12,+18,-15), rotation: map(v,1,12,-10,+8),
      stability:map(v,1,12,+10,-8),  tire_wear:map(v,1,12,+5, -5),
      aero:     map(v,1,12,+5,-3),
    })
  },
  rf_ls_reb: {
    id:'rf_ls_reb', label:'RF LS Reb', unit:'', min:1, max:12, def:7, step:1,
    group:'shocks_reb', icon:'🔩', grpFilter:['shocks'],
    desc:'Rebound baixa velocidade RF. Principal controle de Tight/Loose Exit. Alto = RF se estende lento = mantém carga no dianteiro = Tight Exit. Principal ajuste para saída.',
    tips: ['↑ = Tight Exit (RF lento para estender)','↓ = Loose Exit'],
    fn: v => ({
      entry:    map(v,1,12,+5, -3),  center:   map(v,1,12,+10,-8),
      exit:     map(v,1,12,+20,-18), rotation: map(v,1,12,-12,+10),
      stability:map(v,1,12,+12,-10), tire_wear:map(v,1,12,+5, -5),
      aero:     map(v,1,12,+6,-4),
    })
  },
  lr_ls_reb: {
    id:'lr_ls_reb', label:'LR LS Reb', unit:'', min:1, max:12, def:5, step:1,
    group:'shocks_reb', icon:'🔩', grpFilter:['shocks'],
    desc:'Rebound baixa velocidade LR. Alto = LR lento para estender após a curva = traseira oscila ao entrar na próxima = Loose Entry. Menos = mais controle na entrada.',
    tips: ['↑ = Loose Entry próxima curva (LR oscila)','↓ = Controle na entrada'],
    fn: v => ({
      entry:    map(v,1,12,+15,-12), center:   map(v,1,12,+5, -3),
      exit:     map(v,1,12,-3, +5),  rotation: map(v,1,12,+8, -8),
      stability:map(v,1,12,-10,+8),  tire_wear:map(v,1,12,+5, -5),
      aero:0,
    })
  },
  rr_ls_reb: {
    id:'rr_ls_reb', label:'RR LS Reb', unit:'', min:1, max:12, def:6, step:1,
    group:'shocks_reb', icon:'🔩', grpFilter:['shocks'],
    desc:'Rebound baixa velocidade RR. Alto = RR oscila muito ao entrar na curva = Loose Entry ("rabo solto"). Principal causa de instabilidade na frenagem em oval.',
    tips: ['↑ = Loose Entry (RR oscila – "rabo solto")','↓ = Estabilidade na frenagem'],
    fn: v => ({
      entry:    map(v,1,12,+18,-15), center:   map(v,1,12,+5, -3),
      exit:     map(v,1,12,-5, +8),  rotation: map(v,1,12,+10,-10),
      stability:map(v,1,12,-12,+10), tire_wear:map(v,1,12,+8, -5),
      aero:0,
    })
  },

  // ════════════════════════════════════════════
  //  SHOCKS – HS REBOUND
  // ════════════════════════════════════════════
  lf_hs_reb: {
    id:'lf_hs_reb', label:'LF HS Reb', unit:'', min:1, max:12, def:5, step:1,
    group:'shocks_reb', icon:'🔩', grpFilter:['shocks'],
    desc:'Rebound alta velocidade LF. Controla recuperação após bumps e guias. Alto = LF lento para estender após impacto = mantém grip mas pode "travar" em bumps sequenciais.',
    tips: ['↑ = Grip pós-bump mas pode travar','↓ = Recuperação rápida após bumps'],
    fn: v => ({
      entry:    map(v,1,12,+8, -5),  center:   map(v,1,12,+5, -3),
      exit:     map(v,1,12,+12,-8),  rotation: map(v,1,12,-6, +5),
      stability:map(v,1,12,+8, -8),  tire_wear:map(v,1,12,+4, -4),
      aero:     map(v,1,12,+4,-3),
    })
  },
  rf_hs_reb: {
    id:'rf_hs_reb', label:'RF HS Reb', unit:'', min:1, max:12, def:6, step:1,
    group:'shocks_reb', icon:'🔩', grpFilter:['shocks'],
    desc:'Rebound alta velocidade RF. Crucial em curvas com bumps (Pocono, Dover). Alto = RF "gruda" após bump = mais grip, mas pode instabilizar em bumps sequenciais.',
    tips: ['↑ = RF gruda após bump (mais grip)','↓ = RF salta após bump (mais instável)'],
    fn: v => ({
      entry:    map(v,1,12,+10,-6),  center:   map(v,1,12,+8, -5),
      exit:     map(v,1,12,+15,-10), rotation: map(v,1,12,-8, +6),
      stability:map(v,1,12,+8,-10),  tire_wear:map(v,1,12,+6, -6),
      aero:     map(v,1,12,+5,-4),
    })
  },
  lr_hs_reb: {
    id:'lr_hs_reb', label:'LR HS Reb', unit:'', min:1, max:12, def:5, step:1,
    group:'shocks_reb', icon:'🔩', grpFilter:['shocks'],
    desc:'Rebound alta velocidade LR. Controla recuperação da traseira esquerda após bumps. Alto = LR demora para estender = pode criar instabilidade intermitente na entrada.',
    tips: ['↑ = LR lento após bump = instabilidade entrada','↓ = Recuperação rápida LR'],
    fn: v => ({
      entry:    map(v,1,12,+10,-8),  center:   map(v,1,12,+3, -2),
      exit:     map(v,1,12,-2, +4),  rotation: map(v,1,12,+5, -5),
      stability:map(v,1,12,-6, +6),  tire_wear:map(v,1,12,+3, -4),
      aero:0,
    })
  },
  rr_hs_reb: {
    id:'rr_hs_reb', label:'RR HS Reb', unit:'', min:1, max:12, def:6, step:1,
    group:'shocks_reb', icon:'🔩', grpFilter:['shocks'],
    desc:'Rebound alta velocidade RR. Controla recuperação do pneu mais carregado. Alto = RR gruda bem após bump na saída = mais tração mas pode criar bounce em sequências.',
    tips: ['↑ = RR gruda após bump (tração saída)','↓ = RR salta em bumps (instável saída)'],
    fn: v => ({
      entry:    map(v,1,12,+8, -5),  center:   map(v,1,12,+3, -3),
      exit:     map(v,1,12,-5, +10), rotation: map(v,1,12,+5, -5),
      stability:map(v,1,12,-8, +8),  tire_wear:map(v,1,12,-4, +10),
      aero:0,
    })
  },

  // ════════════════════════════════════════════
  //  SHOCKS – LS COMP SLOPE
  // ════════════════════════════════════════════
  lf_lsc_slope: {
    id:'lf_lsc_slope', label:'LF LS Comp Slope', unit:'', min:1, max:10, def:5, step:1,
    group:'shocks_slope', icon:'📈', grpFilter:['shocks'],
    desc:'Inclinação da curva LS Compression LF. Slope alto = a resistência cresce mais rápido com a velocidade do pistão. Útil para pistas com variação de bump.',
    tips: ['↑ Slope = Crescimento mais agressivo da resistência','Ajustar para característica da pista'],
    fn: v => ({
      entry:    map(v,1,10,+5,-3), center:   map(v,1,10,+3,-2),
      exit:     map(v,1,10,+2,-1), rotation: map(v,1,10,-3,+2),
      stability:map(v,1,10,+5,-4), tire_wear:map(v,1,10,+3,-3),
      aero:     map(v,1,10,+2,-1),
    })
  },
  rf_lsc_slope: {
    id:'rf_lsc_slope', label:'RF LS Comp Slope', unit:'', min:1, max:10, def:5, step:1,
    group:'shocks_slope', icon:'📈', grpFilter:['shocks'],
    desc:'Inclinação da curva LS Compression RF. Controla quão rapidamente o RF aumenta resistência. Alta slope = comportamento mais progressivo na frenagem.',
    tips: ['↑ Slope = Progressivo (bom para pistas variadas)','↓ Slope = Linear (pistas uniformes)'],
    fn: v => ({
      entry:    map(v,1,10,+6,-4), center:   map(v,1,10,+3,-2),
      exit:     map(v,1,10,+2,-1), rotation: map(v,1,10,-4,+3),
      stability:map(v,1,10,+6,-5), tire_wear:map(v,1,10,+3,-3),
      aero:     map(v,1,10,+2,-1),
    })
  },
  rr_lsc_slope: {
    id:'rr_lsc_slope', label:'RR LS Comp Slope', unit:'', min:1, max:10, def:4, step:1,
    group:'shocks_slope', icon:'📈', grpFilter:['shocks'],
    desc:'Inclinação da curva LS Compression RR. Slope alto = traseira direita aumenta resistência muito rápido = pode criar loose exit súbito. Baixo = mais linear.',
    tips: ['↑ Slope = Loose Exit mais brusco','↓ Slope = Comportamento linear na saída'],
    fn: v => ({
      entry:    map(v,1,10,-2,+3), center:   map(v,1,10,-3,+5),
      exit:     map(v,1,10,+5,-8), rotation: map(v,1,10,+3,-4),
      stability:map(v,1,10,-4,+5), tire_wear:map(v,1,10,-3,+5),
      aero:0,
    })
  },
  rf_lsr_slope: {
    id:'rf_lsr_slope', label:'RF LS Reb Slope', unit:'', min:1, max:10, def:5, step:1,
    group:'shocks_slope', icon:'📈', grpFilter:['shocks'],
    desc:'Inclinação da curva LS Rebound RF. Alto = extensão do RF fica cada vez mais lenta com a velocidade = efeito de "prender" o dianteiro progressivamente na saída.',
    tips: ['↑ Slope = Dianteiro "prende" progressivamente','Calibrar junto com RF LS Reb'],
    fn: v => ({
      entry:    map(v,1,10,+3,-2), center:   map(v,1,10,+5,-4),
      exit:     map(v,1,10,+8,-6), rotation: map(v,1,10,-5,+4),
      stability:map(v,1,10,+6,-5), tire_wear:map(v,1,10,+3,-3),
      aero:     map(v,1,10,+3,-2),
    })
  },
  rr_lsr_slope: {
    id:'rr_lsr_slope', label:'RR LS Reb Slope', unit:'', min:1, max:10, def:4, step:1,
    group:'shocks_slope', icon:'📈', grpFilter:['shocks'],
    desc:'Inclinação da curva LS Rebound RR. Alto = RR trava progressivamente na entrada = loose entry mais brusco. Baixo = comportamento mais suave e previsível.',
    tips: ['↑ Slope = Loose Entry mais brusco','↓ Slope = Comportamento suave e previsível'],
    fn: v => ({
      entry:    map(v,1,10,+8,-6), center:   map(v,1,10,+3,-2),
      exit:     map(v,1,10,-2,+3), rotation: map(v,1,10,+5,-4),
      stability:map(v,1,10,-6,+5), tire_wear:map(v,1,10,+4,-3),
      aero:0,
    })
  },

  // ════════════════════════════════════════════
  //  ARB – ANTI-ROLL BARS
  // ════════════════════════════════════════════
  f_arb: {
    id:'f_arb', label:'Front ARB', unit:'(1=macio…10=rígido)', min:1, max:10, def:5, step:1,
    group:'arb', icon:'🔗', grpFilter:['arb'],
    desc:'Anti-roll bar dianteiro. Rígido = menos body roll dianteiro = menos carga dinâmica no RF = Tight center/exit. Macio = mais roll = mais carga RF = melhor rotação = Loose.',
    tips: ['↑ Rígido = Tight Center/Exit (menos rotação)','↓ Macio = Loose, mais rotação (short tracks)'],
    fn: v => ({
      entry:    map(v,1,10,+10,-15), center:   map(v,1,10,+15,-20),
      exit:     map(v,1,10,+8, -10), rotation: map(v,1,10,-20,+15),
      stability:map(v,1,10,+20,-15), tire_wear:map(v,1,10,+8, -5),
      aero:     map(v,1,10,+10,-5),
    })
  },
  r_arb: {
    id:'r_arb', label:'Rear ARB', unit:'(1=macio…10=rígido)', min:1, max:10, def:4, step:1,
    group:'arb', icon:'🔗', grpFilter:['arb'],
    desc:'Anti-roll bar traseiro. Rígido = menos roll traseiro = transfere carga para RR = mais Loose (RR sobrecarregado). Macio = traseiro mais complacente = mais Tight center.',
    tips: ['↑ Rígido = Loose Center/Exit (RR sobrecarregado)','↓ Macio = Tight center (traseira complacente)'],
    fn: v => ({
      entry:    map(v,1,10,-5, +8),  center:   map(v,1,10,-12,+18),
      exit:     map(v,1,10,-10,+15), rotation: map(v,1,10,+12,-10),
      stability:map(v,1,10,-8, +12), tire_wear:map(v,1,10,-5, +10),
      aero:0,
    })
  },
  f_arb_preload: {
    id:'f_arb_preload', label:'Front ARB Preload', unit:'ft-lbs', min:0, max:50, def:10, step:2,
    group:'arb', icon:'🔗', grpFilter:['arb'],
    desc:'Preload do anti-roll bar dianteiro. Adiciona tensão inicial no ARB independente do roll. Preload positivo tende ao lado esquerdo levantado = mais loose. Neutro = sem viés.',
    tips: ['↑ = Viés loose no dianteiro','↓ = Neutro ou tight'],
    fn: v => ({
      entry:    map(v,0,50,-5,+8),   center:   map(v,0,50,-8,+12),
      exit:     map(v,0,50,-3,+5),   rotation: map(v,0,50,+8,-6),
      stability:map(v,0,50,-5,+8),   tire_wear:map(v,0,50,-3,+5),
      aero:0,
    })
  },
  r_arb_preload: {
    id:'r_arb_preload', label:'Rear ARB Preload', unit:'ft-lbs', min:0, max:50, def:5, step:2,
    group:'arb', icon:'🔗', grpFilter:['arb'],
    desc:'Preload do anti-roll bar traseiro. Tensão inicial no ARB traseiro. Afeta o balanço lateral traseiro. Alto = mais tensão = RR mais carregado = tendência ao loose.',
    tips: ['↑ = Tendência loose traseiro','Calibrar em conjunto com ARB arm'],
    fn: v => ({
      entry:    map(v,0,50,-3,+5),   center:   map(v,0,50,-6,+10),
      exit:     map(v,0,50,-8,+12),  rotation: map(v,0,50,+6,-5),
      stability:map(v,0,50,-5,+8),   tire_wear:map(v,0,50,-4,+6),
      aero:0,
    })
  },

  // ════════════════════════════════════════════
  //  WEIGHT DISTRIBUTION
  // ════════════════════════════════════════════
  cross_weight: {
    id:'cross_weight', label:'Cross Weight', unit:'%', min:47, max:54, def:50, step:0.25,
    group:'weight', icon:'⚖️', grpFilter:['weight'],
    desc:'Percentual de peso no diagonal LR+RF. Alto = mais carga LR e RF = mais tight. Baixo = mais carga LF e RR = mais loose. Ajustado via Spring Collar (wedge). EFEITO FORTE.',
    tips: ['↑ % = Tight em todas as fases','↓ % = Loose (pit road: +/- 0.031 perch)'],
    fn: v => ({
      entry:    map(v,47,54,+10,-12), center:   map(v,47,54,+20,-22),
      exit:     map(v,47,54,+12,-15), rotation: map(v,47,54,-18,+15),
      stability:map(v,47,54,+12,-10), tire_wear:map(v,47,54,+8, -5),
      aero:0,
    })
  },
  nose_weight: {
    id:'nose_weight', label:'Nose Weight', unit:'%', min:49, max:55, def:52, step:0.1,
    group:'weight', icon:'⚖️', grpFilter:['weight'],
    desc:'Percentual do peso total nos eixos dianteiros. Alto = mais estabilidade direcional. Baixo = mais rotação. Alta velocidade: alto. Short track: baixo para rotação.',
    tips: ['↑ % = Estabilidade (superspeedways)','↓ % = Rotação (short tracks)'],
    fn: v => ({
      entry:    map(v,49,55,+5, -8),  center:   map(v,49,55,+8,-10),
      exit:     map(v,49,55,+3, -5),  rotation: map(v,49,55,-12,+15),
      stability:map(v,49,55,+20,-15), tire_wear:map(v,49,55,+5, -3),
      aero:     map(v,49,55,+15,-8),
    })
  },
  lf_corner_weight: {
    id:'lf_corner_weight', label:'LF Corner Weight', unit:'lbs', min:300, max:700, def:475, step:5,
    group:'weight', icon:'⚖️', grpFilter:['weight'],
    desc:'Peso de canto do LF. Diretamente relacionado ao cross weight e nose weight. Mais carga LF = mais tight entry. Usado para balancear o corner weight geral.',
    tips: ['↑ = Tight Entry (mais carga LF)','↓ = Loose Entry'],
    fn: v => ({
      entry:    map(v,300,700,+8,-10), center:   map(v,300,700,+5,-8),
      exit:     map(v,300,700,+3,-5),  rotation: map(v,300,700,-6,+8),
      stability:map(v,300,700,-3,+5),  tire_wear:map(v,300,700,+5,-8),
      aero:0,
    })
  },
  rf_corner_weight: {
    id:'rf_corner_weight', label:'RF Corner Weight', unit:'lbs', min:350, max:750, def:525, step:5,
    group:'weight', icon:'⚖️', grpFilter:['weight'],
    desc:'Peso de canto do RF. RF é o pneu mais carregado no oval. Mais carga RF = mais grip RF = mais tight. Menos carga = RF "libera" = mais loose.',
    tips: ['↑ = Tight (mais grip RF)','↓ = Loose (RF aliviado)'],
    fn: v => ({
      entry:    map(v,350,750,+10,-12), center:   map(v,350,750,+15,-18),
      exit:     map(v,350,750,+8,-10),  rotation: map(v,350,750,-12,+10),
      stability:map(v,350,750,+10,-8),  tire_wear:map(v,350,750,+8,-5),
      aero:0,
    })
  },

  // ════════════════════════════════════════════
  //  BRAKES
  // ════════════════════════════════════════════
  brake_bias: {
    id:'brake_bias', label:'Brake Bias', unit:'%', min:49, max:62, def:54, step:0.5,
    group:'brakes', icon:'🛑', grpFilter:['weight'],
    desc:'Percentual de frenagem dianteira. Alto = mais frenagem frente = Tight Entry (dianteiros bloqueiam). Baixo = mais frenagem traseira = Loose Entry. Ajuste in-car durante corrida.',
    tips: ['↑ % = Tight Entry (frenagem dianteira forte)','↓ % = Loose Entry (traseiros freiam mais)'],
    fn: v => ({
      entry:    map(v,49,62,+25,-20), center:   map(v,49,62,+5, -3),
      exit:     map(v,49,62,+2, -2),  rotation: map(v,49,62,-15,+12),
      stability:map(v,49,62,+8,-10),  tire_wear:map(v,49,62,+10,-8),
      aero:0,
    })
  },
  front_mc: {
    id:'front_mc', label:'Front Master Cylinder', unit:'mm', min:20, max:28, def:23, step:1,
    group:'brakes', icon:'🛑', grpFilter:['weight'],
    desc:'Tamanho do cilindro mestre dianteiro. Maior MC = mais força de frenagem com mesmo pedal = eficiência de frenagem. Afeta sensibilidade de modulação do pedal.',
    tips: ['↑ mm = Mais força / Menos modulação','↓ mm = Menos força / Mais modulação'],
    fn: v => ({
      entry:    map(v,20,28,+8,-5),  center:   map(v,20,28,+3,-2),
      exit:     map(v,20,28,+2,-1),  rotation: map(v,20,28,-5,+3),
      stability:map(v,20,28,+3,-3),  tire_wear:map(v,20,28,+5,-3),
      aero:0,
    })
  },
  rear_mc: {
    id:'rear_mc', label:'Rear Master Cylinder', unit:'mm', min:20, max:28, def:23, step:1,
    group:'brakes', icon:'🛑', grpFilter:['weight'],
    desc:'Tamanho do cilindro mestre traseiro. Maior = mais força nos freios traseiros com mesmo pedal. Em conjunto com brake bias define o perfil de frenagem.',
    tips: ['↑ mm = Mais força traseira (loose entry com bias baixo)','↓ mm = Menos força traseira'],
    fn: v => ({
      entry:    map(v,20,28,-5,+8),  center:   map(v,20,28,-2,+3),
      exit:     map(v,20,28,-1,+2),  rotation: map(v,20,28,+3,-5),
      stability:map(v,20,28,-3,+3),  tire_wear:map(v,20,28,-3,+5),
      aero:0,
    })
  },

  // ════════════════════════════════════════════
  //  GEOMETRY – CAMBER
  // ════════════════════════════════════════════
  rf_camber: {
    id:'rf_camber', label:'RF Camber', unit:'°', min:-8, max:-1, def:-4.5, step:0.1,
    group:'geometry', icon:'📐', grpFilter:['geometry'],
    desc:'Câmbio pneu dianteiro direito (negativo = topo inclinado para dentro). Mais negativo = mais área de contato sob carga lateral = mais grip RF = mais Loose/rotação.',
    tips: ['Mais negativo = Loose/Rotação (mais grip RF)','Menos negativo = Tight (menos grip RF)'],
    fn: v => ({
      entry:    map(v,-8,-1,-15,+10), center:   map(v,-8,-1,-20,+15),
      exit:     map(v,-8,-1,-8, +5),  rotation: map(v,-8,-1,+20,-15),
      stability:map(v,-8,-1,-12,+10), tire_wear:map(v,-8,-1,-8, +20),
      aero:0,
    })
  },
  lf_camber: {
    id:'lf_camber', label:'LF Camber', unit:'°', min:0, max:7, def:3.5, step:0.1,
    group:'geometry', icon:'📐', grpFilter:['geometry'],
    desc:'Câmbio pneu dianteiro esquerdo (positivo em oval). Mais positivo = mais força lateral LF na curva = tendência ao loose. Menos = pneu mais em pé = mais tight.',
    tips: ['↑ Positivo = Loose (mais força lateral LF)','↓ = Tight Entry'],
    fn: v => ({
      entry:    map(v,0,7,-10,+8),  center:   map(v,0,7,-12,+10),
      exit:     map(v,0,7,-5, +3),  rotation: map(v,0,7,+12,-10),
      stability:map(v,0,7,-8, +8),  tire_wear:map(v,0,7,-5, +15),
      aero:0,
    })
  },
  rr_camber: {
    id:'rr_camber', label:'RR Camber', unit:'°', min:-6, max:1, def:-3.0, step:0.1,
    group:'geometry', icon:'📐', grpFilter:['geometry'],
    desc:'Câmbio pneu traseiro direito. Mais negativo = mais grip lateral RR = mais tight center/saída. Menos negativo = RR "abre" = mais loose. Afeta desgaste RR fortemente.',
    tips: ['Mais negativo = Tight Center/Exit (mais grip RR)','Menos negativo = Loose'],
    fn: v => ({
      entry:    map(v,-6,1,+5,-8),   center:   map(v,-6,1,-15,+12),
      exit:     map(v,-6,1,-12,+10), rotation: map(v,-6,1,+10,-12),
      stability:map(v,-6,1,-10,+8),  tire_wear:map(v,-6,1,-10,+20),
      aero:0,
    })
  },
  lr_camber: {
    id:'lr_camber', label:'LR Camber', unit:'°', min:-2, max:4, def:0.5, step:0.1,
    group:'geometry', icon:'📐', grpFilter:['geometry'],
    desc:'Câmbio pneu traseiro esquerdo. Positivo em oval. Mais positivo = mais grip LR na saída = mais tight exit. Menos = LR "abre" = mais loose exit.',
    tips: ['↑ Positivo = Tight Exit (mais grip LR)','↓ = Loose Exit'],
    fn: v => ({
      entry:    map(v,-2,4,+3,-5),   center:   map(v,-2,4,+5,-8),
      exit:     map(v,-2,4,+10,-15), rotation: map(v,-2,4,-8,+10),
      stability:map(v,-2,4,+5,-5),   tire_wear:map(v,-2,4,-5,+15),
      aero:0,
    })
  },

  // ════════════════════════════════════════════
  //  GEOMETRY – CASTER
  // ════════════════════════════════════════════
  rf_caster: {
    id:'rf_caster', label:'RF Caster', unit:'°', min:2, max:10, def:6.0, step:0.1,
    group:'geometry', icon:'📐', grpFilter:['geometry'],
    desc:'Caster pneu dianteiro direito. Mais alto = câmbio dinâmico RF maior ao virar volante = mais grip lateral RF na curva = mais rotação/loose. Melhora recuperação de slides.',
    tips: ['↑ = Mais rotação/Loose (câmbio dinâmico RF)','↓ = Mais tight/Estável'],
    fn: v => ({
      entry:    map(v,2,10,-8, +5),  center:   map(v,2,10,-15,+10),
      exit:     map(v,2,10,-5, +3),  rotation: map(v,2,10,+20,-12),
      stability:map(v,2,10,-12,+10), tire_wear:map(v,2,10,-5, +8),
      aero:0,
    })
  },
  lf_caster: {
    id:'lf_caster', label:'LF Caster', unit:'°', min:1, max:8, def:4.0, step:0.1,
    group:'geometry', icon:'📐', grpFilter:['geometry'],
    desc:'Caster pneu dianteiro esquerdo. Em oval: caster split (RF maior que LF) é fundamental. LF menor = carro tende naturalmente para esquerda = menos esforço no volante.',
    tips: ['Split RF-LF ideal: 1.5°–2.5°','↑ LF = Reduz caster split = mais esforço no volante'],
    fn: v => ({
      entry:    map(v,1,8,-3,+3),  center:   map(v,1,8,-5,+5),
      exit:     map(v,1,8,-2,+2),  rotation: map(v,1,8,+5,-5),
      stability:map(v,1,8,-5,+5),  tire_wear:map(v,1,8,-2,+5),
      aero:0,
    })
  },

  // ════════════════════════════════════════════
  //  GEOMETRY – TOE
  // ════════════════════════════════════════════
  lf_toe: {
    id:'lf_toe', label:'LF Toe', unit:'pol', min:-0.25, max:0.25, def:0.05, step:0.01,
    group:'geometry', icon:'📐', grpFilter:['geometry'],
    desc:'Toe pneu dianteiro esquerdo. Positivo = toe-in = pneu converge = mais estabilidade. Negativo = toe-out = pneu diverge = mais rotação. Afeta desgaste do pneu.',
    tips: ['↑ Toe-in = Estabilidade (menos desgaste)','↓ Toe-out = Rotação (mais desgaste LF)'],
    fn: v => ({
      entry:    map(v,-0.25,0.25,-8,+10),  center:   map(v,-0.25,0.25,-5,+8),
      exit:     map(v,-0.25,0.25,-3,+5),   rotation: map(v,-0.25,0.25,+10,-8),
      stability:map(v,-0.25,0.25,+12,-8),  tire_wear:map(v,-0.25,0.25,-5,+15),
      aero:0,
    })
  },
  rf_toe: {
    id:'rf_toe', label:'RF Toe', unit:'pol', min:-0.25, max:0.25, def:-0.05, step:0.01,
    group:'geometry', icon:'📐', grpFilter:['geometry'],
    desc:'Toe pneu dianteiro direito. RF toe-out negativo = ajuda a "puxar" o carro para a curva esquerda. Muito negativo = instável em retas. Balance com LF toe.',
    tips: ['↑ Toe-out = Puxada natural para esquerda (oval)','↓ Toe-in = Mais estabilidade em reta'],
    fn: v => ({
      entry:    map(v,-0.25,0.25,-10,+8),  center:   map(v,-0.25,0.25,-8,+6),
      exit:     map(v,-0.25,0.25,-3,+4),   rotation: map(v,-0.25,0.25,+8,-5),
      stability:map(v,-0.25,0.25,+10,-12), tire_wear:map(v,-0.25,0.25,-5,+18),
      aero:0,
    })
  },
  rr_toe: {
    id:'rr_toe', label:'RR Toe', unit:'pol', min:-0.15, max:0.15, def:0.05, step:0.01,
    group:'geometry', icon:'📐', grpFilter:['geometry'],
    desc:'Toe pneu traseiro direito. Positivo = convergente = RR aponta para dentro = endireita carro na saída = menos Loose exit. Negativo = divergente = mais Loose exit.',
    tips: ['↑ Toe-in = Estabilidade saída (menos loose exit)','↓ Toe-out = Mais loose exit'],
    fn: v => ({
      entry:    map(v,-0.15,0.15,+3,-5),   center:   map(v,-0.15,0.15,+5,-8),
      exit:     map(v,-0.15,0.15,+15,-18), rotation: map(v,-0.15,0.15,-10,+12),
      stability:map(v,-0.15,0.15,+12,-10), tire_wear:map(v,-0.15,0.15,-5,+18),
      aero:0,
    })
  },
  lr_toe: {
    id:'lr_toe', label:'LR Toe', unit:'pol', min:-0.15, max:0.15, def:0.02, step:0.01,
    group:'geometry', icon:'📐', grpFilter:['geometry'],
    desc:'Toe pneu traseiro esquerdo. Em oval geralmente mínimo (quase zero). Ajuste sutil para distribuição de desgaste traseiro e estabilidade em reta.',
    tips: ['Normalmente próximo de zero em oval','Toe-in sutil = mais estabilidade em reta'],
    fn: v => ({
      entry:    map(v,-0.15,0.15,+2,-3),  center:   map(v,-0.15,0.15,+3,-5),
      exit:     map(v,-0.15,0.15,+5,-8),  rotation: map(v,-0.15,0.15,-5,+6),
      stability:map(v,-0.15,0.15,+8,-6),  tire_wear:map(v,-0.15,0.15,-3,+10),
      aero:0,
    })
  },

  // ════════════════════════════════════════════
  //  STEERING
  // ════════════════════════════════════════════
  pinion_size: {
    id:'pinion_size', label:'Pinion Size', unit:'mm', min:48, max:72, def:60, step:2,
    group:'geometry', icon:'🎯', grpFilter:['geometry'],
    desc:'Tamanho do pinhão de direção. Menor pinhão = menos mm por volta = direção mais rápida / pesada. Maior pinhão = mais mm por volta = direção mais indireta / leve.',
    tips: ['↓ mm = Direção rápida/pesada (short tracks)','↑ mm = Direção indireta/leve (superspeedways)'],
    fn: v => ({
      entry:    map(v,48,72,+5,-5), center:   map(v,48,72,+3,-3),
      exit:     map(v,48,72,+2,-2), rotation: map(v,48,72,-5,+5),
      stability:map(v,48,72,-3,+5), tire_wear:map(v,48,72,+2,-2),
      aero:0,
    })
  },
  steer_offset: {
    id:'steer_offset', label:'Steer Offset Angle', unit:'°', min:-5, max:5, def:0, step:0.5,
    group:'geometry', icon:'🎯', grpFilter:['geometry'],
    desc:'Ângulo de offset da direção. Ajusta o alinhamento neutro do volante. Positivo = volante aponta ligeiramente para esquerda em neutro. Usado para reduzir esforço em oval.',
    tips: ['Negativo = viés para esquerda (oval)','Positivo = correção de viés para direita'],
    fn: v => ({
      entry:    map(v,-5,5,-3,+3), center:   map(v,-5,5,-2,+2),
      exit:     map(v,-5,5,-2,+2), rotation: map(v,-5,5,+3,-3),
      stability:map(v,-5,5,+3,-3), tire_wear:map(v,-5,5,-2,+2),
      aero:0,
    })
  },

  // ════════════════════════════════════════════
  //  RIDE HEIGHTS
  // ════════════════════════════════════════════
  lf_ride_height: {
    id:'lf_ride_height', label:'LF Ride Height', unit:'in', min:1.5, max:7, def:3.5, step:0.1,
    group:'ride_height', icon:'📏', grpFilter:['aero'],
    desc:'Altura de marcha dianteira esquerda. Mais alto = plataforma aero menos eficiente. Mais baixo = melhor aero mas limita suspensão. Afeta o centro de rolamento dianteiro.',
    tips: ['↓ = Melhor aero (pistas rápidas)','↑ = Mais clearance (bumps/short tracks)'],
    fn: v => ({
      entry:    map(v,1.5,7,-5,+8),  center:   map(v,1.5,7,-3,+5),
      exit:     map(v,1.5,7,-2,+3),  rotation: map(v,1.5,7,+5,-5),
      stability:map(v,1.5,7,+5,-8),  tire_wear:map(v,1.5,7,-2,+5),
      aero:     map(v,1.5,7,+8,-10),
    })
  },
  rf_ride_height: {
    id:'rf_ride_height', label:'RF Ride Height', unit:'in', min:1.5, max:7, def:3.2, step:0.1,
    group:'ride_height', icon:'📏', grpFilter:['aero'],
    desc:'Altura de marcha dianteira direita. RF mais baixo que LF = rake dianteiro lateral = ajusta cross weight dinâmico. Crítico para plataforma aero dianteira.',
    tips: ['↓ RF = Melhora aero dianteiro + cross weight','LF-RF diferença afeta balanço lateral'],
    fn: v => ({
      entry:    map(v,1.5,7,-3,+5),  center:   map(v,1.5,7,-5,+8),
      exit:     map(v,1.5,7,-2,+3),  rotation: map(v,1.5,7,+5,-8),
      stability:map(v,1.5,7,+5,-5),  tire_wear:map(v,1.5,7,-2,+5),
      aero:     map(v,1.5,7,+10,-12),
    })
  },
  lr_ride_height: {
    id:'lr_ride_height', label:'LR Ride Height', unit:'in', min:3, max:9, def:5.5, step:0.1,
    group:'ride_height', icon:'📏', grpFilter:['aero'],
    desc:'Altura de marcha traseira esquerda. Mais alto = menos cross weight dinâmico = mais loose. Baixo = mais cross weight = mais tight. Afeta rake traseiro e difusor.',
    tips: ['↑ = Loose (menos cross weight)','↓ = Tight (mais cross weight) + melhor difusor'],
    fn: v => ({
      entry:    map(v,3,9,-15,+18), center:   map(v,3,9,-8,+10),
      exit:     map(v,3,9,-5, +8),  rotation: map(v,3,9,+12,-10),
      stability:map(v,3,9,-8,+10),  tire_wear:map(v,3,9,-3, +5),
      aero:     map(v,3,9,-8,+10),
    })
  },
  rr_ride_height: {
    id:'rr_ride_height', label:'RR Ride Height', unit:'in', min:3, max:9, def:4.8, step:0.1,
    group:'ride_height', icon:'📏', grpFilter:['aero'],
    desc:'⚠️ CRÍTICO Next Gen: difusor traseiro gera downforce do underbody. RR muito baixo = difusor toca asfalto = catastrófico. Diferença LR-RR define rake traseiro = downforce.',
    tips: ['⚠️ Manter clearance mínimo!','Rake traseiro (LR>RR) = mais downforce difusor'],
    fn: v => ({
      entry:    map(v,3,9,-5, +8),  center:   map(v,3,9,-8,+10),
      exit:     map(v,3,9,-8,+10),  rotation: map(v,3,9,+8, -8),
      stability:map(v,3,9,-15,+20), tire_wear:map(v,3,9,-5, +8),
      aero:     map(v,3,9,-25,+30),
    })
  },

  // ════════════════════════════════════════════
  //  AERODYNAMICS (TRACK-BAR / SPOILER / SPLITTER)
  // ════════════════════════════════════════════
  rear_spoiler: {
    id:'rear_spoiler', label:'Rear Spoiler', unit:'°', min:0, max:25, def:12, step:1,
    group:'aero', icon:'🌬️', grpFilter:['aero'],
    desc:'Ângulo do spoiler traseiro. Mais alto = mais downforce traseiro = mais estabilidade. Mais baixo = menos drag = mais velocidade em reta mas menos tração na saída.',
    tips: ['↑ = Mais estabilidade/tração (+ drag)','↓ = Mais velocidade reta (- downforce traseiro)'],
    fn: v => ({
      entry:    map(v,0,25,-3,+5),   center:   map(v,0,25,-5,+8),
      exit:     map(v,0,25,-8,+12),  rotation: map(v,0,25,+5,-8),
      stability:map(v,0,25,-10,+20), tire_wear:map(v,0,25,-5,+8),
      aero:     map(v,0,25,-15,+25),
    })
  },
  front_splitter: {
    id:'front_splitter', label:'Front Splitter', unit:'in', min:0, max:4, def:2, step:0.5,
    group:'aero', icon:'🌬️', grpFilter:['aero'],
    desc:'Extensão do splitter dianteiro. Mais comprido = mais downforce dianteiro = mais grip na entrada. Mais curto = menos drag = mais velocidade mas dianteiro leve.',
    tips: ['↑ = Mais grip dianteiro (tight entry)','↓ = Dianteiro leve (loose entry + velocidade)'],
    fn: v => ({
      entry:    map(v,0,4,+8,-10),   center:   map(v,0,4,+5,-8),
      exit:     map(v,0,4,+3,-5),    rotation: map(v,0,4,-8,+10),
      stability:map(v,0,4,+5,-8),    tire_wear:map(v,0,4,+5,-5),
      aero:     map(v,0,4,-12,+15),
    })
  },
  track_bar_height: {
    id:'track_bar_height', label:'Track Bar Height (RR)', unit:'in', min:6, max:14, def:10, step:0.5,
    group:'aero', icon:'📏', grpFilter:['aero'],
    desc:'Altura da track bar (barra Panhard) no lado direito traseiro. Mais alto = centro de rolamento traseiro mais alto = mais body roll traseiro = mais loose. Baixo = Tight traseiro.',
    tips: ['↑ = Mais roll traseiro = Loose','↓ = Menos roll traseiro = Tight'],
    fn: v => ({
      entry:    map(v,6,14,-5,+8),   center:   map(v,6,14,-8,+12),
      exit:     map(v,6,14,-10,+15), rotation: map(v,6,14,+10,-8),
      stability:map(v,6,14,-10,+15), tire_wear:map(v,6,14,-5,+8),
      aero:     map(v,6,14,-8,+5),
    })
  },

  // ════════════════════════════════════════════
  //  DRIVETRAIN – DIFFERENTIAL
  // ════════════════════════════════════════════
  diff_preload: {
    id:'diff_preload', label:'Diff Preload', unit:'ft-lbs', min:0, max:200, def:60, step:5,
    group:'drivetrain', icon:'⚙️', grpFilter:['drivetrain'],
    desc:'Preload do diferencial traseiro. Alto = diferencial mais "travado" = mais estabilidade na aceleração mas menos rotação. Baixo = diferencial livre = mais rotação mas instável.',
    tips: ['↑ = Estabilidade saída (diff travado)','↓ = Rotação / instabilidade saída (diff livre)'],
    fn: v => ({
      entry:    map(v,0,200,-2,+3),   center:   map(v,0,200,-5, +8),
      exit:     map(v,0,200,+12,-15), rotation: map(v,0,200,-8,+10),
      stability:map(v,0,200,+15,-10), tire_wear:map(v,0,200,+5, -5),
      aero:0,
    })
  },
  final_drive: {
    id:'final_drive', label:'Final Drive Ratio', unit:':1', min:2.5, max:4.5, def:3.5, step:0.05,
    group:'drivetrain', icon:'⚙️', grpFilter:['drivetrain'],
    desc:'Relação de transmissão final. Mais alto = aceleração mais forte mas velocidade máxima menor. Mais baixo = alta velocidade mas saída de curva mais lenta. Calibrar por tipo de pista.',
    tips: ['↑ Relação = Aceleração forte (short tracks)','↓ Relação = Alta velocidade (superspeedways)'],
    fn: v => ({
      entry:    map(v,2.5,4.5,0,0),  center:   map(v,2.5,4.5,0,0),
      exit:     map(v,2.5,4.5,-8,+10), rotation: map(v,2.5,4.5,-3,+3),
      stability:map(v,2.5,4.5,-3,+5), tire_wear:map(v,2.5,4.5,-8,+12),
      aero:0,
    })
  },

  // ════════════════════════════════════════════
  //  SPRING PERCH (PIT ROAD ADJUSTMENTS)
  // ════════════════════════════════════════════
  lr_perch: {
    id:'lr_perch', label:'LR Spring Perch', unit:'in', min:-0.5, max:0.5, def:0, step:0.031,
    group:'perch', icon:'🔄', grpFilter:['pitstop'],
    desc:'Ajuste do Spring Perch/Collar traseiro esquerdo (pit road). Positivo = sobe o LR = aumenta cross weight = mais Tight. Negativo = abaixa = reduz cross weight = mais Loose. AJUSTE CHAVE no pit!',
    tips: ['+0.031 = +~15lbs cross weight = mais Tight','-0.031 = -~15lbs cross weight = mais Loose'],
    fn: v => ({
      entry:    map(v,-0.5,0.5,-12,+15), center:   map(v,-0.5,0.5,-18,+20),
      exit:     map(v,-0.5,0.5,-10,+12), rotation: map(v,-0.5,0.5,+15,-12),
      stability:map(v,-0.5,0.5,-10,+12), tire_wear:map(v,-0.5,0.5,-5, +8),
      aero:0,
    })
  },
  rr_perch: {
    id:'rr_perch', label:'RR Spring Perch', unit:'in', min:-0.5, max:0.5, def:0, step:0.031,
    group:'perch', icon:'🔄', grpFilter:['pitstop'],
    desc:'Ajuste do Spring Perch/Collar traseiro direito (pit road). Positivo = sobe RR = aumenta ride height RR = reduz cross weight = mais Loose. Negativo = mais Tight.',
    tips: ['+0.031 = Sobe RR = mais Loose','-0.031 = Abaixa RR = mais Tight'],
    fn: v => ({
      entry:    map(v,-0.5,0.5,-8, +10), center:   map(v,-0.5,0.5,-10,+15),
      exit:     map(v,-0.5,0.5,-15,+18), rotation: map(v,-0.5,0.5,+12,-10),
      stability:map(v,-0.5,0.5,-12,+15), tire_wear:map(v,-0.5,0.5,-8, +10),
      aero:     map(v,-0.5,0.5,-5,+8),
    })
  },
  lf_perch: {
    id:'lf_perch', label:'LF Spring Perch', unit:'in', min:-0.5, max:0.5, def:0, step:0.031,
    group:'perch', icon:'🔄', grpFilter:['pitstop'],
    desc:'Ajuste do Spring Perch/Collar dianteiro esquerdo (pit road). Sobe ou abaixa o LF. Sobe LF = reduz carga LF = mais Loose entry. Abaixa = mais Tight entry.',
    tips: ['+0.031 = Sobe LF = mais Loose Entry','-0.031 = Abaixa LF = mais Tight Entry'],
    fn: v => ({
      entry:    map(v,-0.5,0.5,-8,+10), center:   map(v,-0.5,0.5,-5,+8),
      exit:     map(v,-0.5,0.5,-3,+5),  rotation: map(v,-0.5,0.5,+8,-6),
      stability:map(v,-0.5,0.5,-5,+8),  tire_wear:map(v,-0.5,0.5,-3,+6),
      aero:0,
    })
  },
  rf_perch: {
    id:'rf_perch', label:'RF Spring Perch', unit:'in', min:-0.5, max:0.5, def:0, step:0.031,
    group:'perch', icon:'🔄', grpFilter:['pitstop'],
    desc:'Ajuste do Spring Perch/Collar dianteiro direito (pit road). Sobe RF = alivia carga RF = mais Loose. Abaixa RF = mais carga RF = mais Tight.',
    tips: ['+0.031 = Sobe RF = mais Loose entry/center','-0.031 = Abaixa RF = mais Tight'],
    fn: v => ({
      entry:    map(v,-0.5,0.5,-10,+12), center:   map(v,-0.5,0.5,-12,+15),
      exit:     map(v,-0.5,0.5,-5, +8),  rotation: map(v,-0.5,0.5,+10,-8),
      stability:map(v,-0.5,0.5,-8,+10),  tire_wear:map(v,-0.5,0.5,-5,+8),
      aero:0,
    })
  },
};

// ─── GROUPS ─────────────────────────────────────────────────────
window.ADV_SIM_GROUPS = {
  tires:        { label: '🛞 Pressão dos Pneus',              color: '#e8a000' },
  springs:      { label: '🌀 Molas (Spring Rates)',            color: '#3a8dff' },
  shocks_comp:  { label: '🔩 Amortecedores – Compressão',      color: '#ff8c00' },
  shocks_reb:   { label: '🔩 Amortecedores – Rebound',         color: '#9b59b6' },
  shocks_slope: { label: '📈 Choques – Slopes (Inclinação)',   color: '#6c757d' },
  arb:          { label: '🔗 Anti-Roll Bar (ARB)',             color: '#00d26a' },
  weight:       { label: '⚖️ Peso & Freios',                   color: '#ffd700' },
  brakes:       { label: '🛑 Freios Detalhado',                color: '#ff4444' },
  geometry:     { label: '📐 Geometria (Câmbio/Caster/Toe/Direção)', color: '#00b4d8' },
  ride_height:  { label: '📏 Ride Heights',                   color: '#06d6a0' },
  aero:         { label: '🌬️ Aerodinâmica & Track Bar',        color: '#48cae4' },
  drivetrain:   { label: '⚙️ Diferencial & Transmissão',      color: '#adb5bd' },
  perch:        { label: '🔄 Spring Perch (Pit Road)',         color: '#e63946' },
};

// ─── AXES ────────────────────────────────────────────────────────
window.ADV_SIM_AXES = [
  { key:'entry',    label:'Entrada',     icon:'↙️',  looseLabel:'Loose Entry',  tightLabel:'Tight Entry'  },
  { key:'center',   label:'Centro',      icon:'⬅️',  looseLabel:'Loose Center', tightLabel:'Tight Center' },
  { key:'exit',     label:'Saída',       icon:'↖️',  looseLabel:'Loose Exit',   tightLabel:'Tight Exit'   },
  { key:'rotation', label:'Rotação',     icon:'🔄',  looseLabel:'Mais Rotação', tightLabel:'Menos Rotação'},
  { key:'stability',label:'Estabilidade',icon:'🏁',  looseLabel:'Instável',     tightLabel:'Estável'      },
  { key:'tire_wear',label:'Desgaste',    icon:'🌡️',  looseLabel:'Baixo Desg.',  tightLabel:'Alto Desg.'   },
  { key:'aero',     label:'Aero',        icon:'🌬️',  looseLabel:'Aero Ruim',    tightLabel:'Aero Bom'     },
];

// ─── CURRENT VALUES STATE ────────────────────────────────────────
window.ADV_SIM_STATE = {};
Object.values(window.ADV_SIM_PARAMS).forEach(p => {
  window.ADV_SIM_STATE[p.id] = p.def;
});

// ─── ACTIVE FILTER ───────────────────────────────────────────────
window.ADV_SIM_FILTER = 'all';

// ─── FORMAT VALUE ────────────────────────────────────────────────
function formatParamValue(v, p) {
  if (!p) return v;
  if (p.step <= 0.001) return parseFloat(v).toFixed(3);
  if (p.step < 0.1)    return parseFloat(v).toFixed(2);
  if (p.step < 1)      return parseFloat(v).toFixed(1);
  return parseFloat(v).toFixed(0);
}

// ─── RENDER ADVANCED SIMULATOR ──────────────────────────────────
window.renderAdvancedSimulator = function() {
  const container = document.getElementById('adv-sim-root');
  if (!container) return;

  const params = window.ADV_SIM_PARAMS;
  const groups = window.ADV_SIM_GROUPS;

  // Build group HTML
  let groupsHtml = '';
  Object.entries(groups).forEach(([gKey, gDef]) => {
    const paramsInGroup = Object.values(params).filter(p => p.group === gKey);
    if (!paramsInGroup.length) return;

    groupsHtml += `
    <div class="adv-group" id="grp-${gKey}" data-group="${gKey}">
      <div class="adv-group-header" onclick="toggleAdvGroup('${gKey}')" style="border-left-color:${gDef.color}">
        <span style="color:${gDef.color}">${gDef.label}</span>
        <div style="display:flex;align-items:center;gap:0.5rem">
          <span class="grp-count" style="font-size:0.68rem;color:var(--text-dim)">${paramsInGroup.length} params</span>
          <span class="adv-group-toggle" id="grp-toggle-${gKey}">▼</span>
        </div>
      </div>
      <div class="adv-group-body" id="grp-body-${gKey}">
        ${paramsInGroup.map(p => renderParamSlider(p, gDef.color)).join('')}
      </div>
    </div>`;
  });

  container.innerHTML = `
  <div class="adv-sim-layout">
    <!-- LEFT: Controls -->
    <div class="adv-sim-controls" id="adv-controls-scroll">
      <div class="adv-sim-controls-header">
        <div style="display:flex;align-items:center;gap:0.5rem">
          <span style="font-family:'Orbitron',sans-serif;font-size:0.82rem;color:var(--gold)">⚙️ Parâmetros</span>
          <span class="param-total-badge">${Object.keys(params).length} total</span>
        </div>
        <div style="display:flex;gap:0.3rem;flex-wrap:wrap">
          <button class="btn-ghost" style="padding:0.25rem 0.6rem;font-size:0.7rem" onclick="expandAllAdvGroups()">▼ Todos</button>
          <button class="btn-ghost" style="padding:0.25rem 0.6rem;font-size:0.7rem" onclick="collapseAllAdvGroups()">▶ Fechar</button>
        </div>
      </div>
      <div class="adv-search-wrap">
        <input type="text" id="adv-search-input" class="adv-search-input" placeholder="🔍 Buscar parâmetro..." oninput="filterAdvParams(this.value)"/>
      </div>
      <div class="adv-group-list" id="adv-group-list">
        ${groupsHtml}
      </div>
    </div>

    <!-- RIGHT: Output -->
    <div class="adv-sim-output">

      <!-- Overall balance -->
      <div class="adv-output-top">
        <div class="adv-balance-card">
          <div class="abc-title">🏎️ EQUILÍBRIO GERAL DO CARRO</div>
          <div class="abc-balance-row" id="adv-overall-balance"></div>
          <div class="abc-label-row">
            <span class="abc-label-loose">← LOOSE (Oversteer)</span>
            <span class="abc-label-center" id="adv-balance-text">NEUTRO</span>
            <span class="abc-label-tight">TIGHT (Understeer) →</span>
          </div>
        </div>
      </div>

      <!-- Phase scores summary -->
      <div class="adv-phase-summary" id="adv-phase-summary">
        <!-- filled by JS -->
      </div>

      <!-- Per-phase axes grid -->
      <div class="adv-axes-grid" id="adv-axes-grid">
        <!-- filled by JS -->
      </div>

      <!-- Active param info box -->
      <div class="adv-active-param" id="adv-active-param">
        <div style="display:flex;align-items:center;gap:0.5rem;color:var(--text-dim);font-size:0.8rem">
          <span style="font-size:1.2rem">💡</span>
          <span>Clique em um parâmetro ou mova um slider para ver o efeito detalhado neste painel</span>
        </div>
      </div>

      <!-- Dominant effects -->
      <div class="adv-effects-panel" id="adv-effects-panel" style="display:none">
        <div class="aep-title">📊 Contribuição do Parâmetro Selecionado</div>
        <div id="adv-effects-list"></div>
      </div>

      <!-- Setup profile -->
      <div class="adv-profile-panel">
        <div class="app-title">🎯 Perfil do Setup Atual</div>
        <div class="app-grid" id="adv-profile-grid"></div>
      </div>

      <!-- Recommendations box -->
      <div class="adv-reco-panel" id="adv-reco-panel">
        <div class="arp-title">🔧 Recomendações Automáticas</div>
        <div class="arp-subtitle">Com base no balanço atual detectado:</div>
        <div id="adv-reco-list"><!-- filled by JS --></div>
      </div>
    </div>
  </div>`;

  // Wire group tab filter (they exist in the HTML outside the container)
  document.querySelectorAll('.agt-btn').forEach(btn => {
    // Remove old listeners by cloning
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', () => {
      document.querySelectorAll('.agt-btn').forEach(b => b.classList.remove('active'));
      newBtn.classList.add('active');
      filterAdvGroups(newBtn.dataset.grptab);
    });
  });

  // Initial render – use requestAnimationFrame to ensure DOM is painted
  requestAnimationFrame(function() {
    try {
      updateAdvSim(null);
      filterAdvGroups('all');
    } catch(e) {
      console.error('updateAdvSim error:', e);
    }
  });
};

// ─── RENDER PARAM SLIDER ─────────────────────────────────────────
function renderParamSlider(p, groupColor) {
  const val  = window.ADV_SIM_STATE[p.id] !== undefined ? window.ADV_SIM_STATE[p.id] : p.def;
  const pct  = ((val - p.min) / (p.max - p.min)) * 100;
  const col  = groupColor || 'var(--gold)';
  const tip  = (p.tips && p.tips.length) ? p.tips.map(t=>`<div class="apr-tip">• ${t}</div>`).join('') : '';

  return `
  <div class="adv-param-row" id="param-row-${p.id}" data-id="${p.id}"
       onclick="highlightParam('${p.id}')">
    <div class="apr-header">
      <span class="apr-icon">${p.icon}</span>
      <span class="apr-label">${p.label}</span>
      <span class="apr-unit">${p.unit}</span>
      <span class="apr-value" id="apv-${p.id}" style="color:${col}">${formatParamValue(val,p)}</span>
    </div>
    <div class="apr-slider-wrap">
      <input type="range" class="adv-slider" id="slider-${p.id}"
        min="${p.min}" max="${p.max}" step="${p.step}" value="${val}"
        oninput="onAdvSlider('${p.id}', this.value)"
        style="--pct:${pct}%;--col:${col}"
      />
      <div class="apr-minmax">
        <span>${p.min}${p.unit && p.unit.length<5?p.unit:''}</span>
        <span>${p.max}${p.unit && p.unit.length<5?p.unit:''}</span>
      </div>
    </div>
    ${tip ? `<div class="apr-tips">${tip}</div>` : ''}
    <div class="apr-mini-axes" id="mini-axes-${p.id}"></div>
  </div>`;
}

// ─── FILTER GROUPS BY TAB ────────────────────────────────────────
window.filterAdvGroups = function(filter) {
  window.ADV_SIM_FILTER = filter;
  const params = window.ADV_SIM_PARAMS;

  document.querySelectorAll('.adv-group').forEach(grpEl => {
    const gKey = grpEl.dataset.group;
    if (filter === 'all') {
      grpEl.style.display = 'block';
      return;
    }
    // Check if any param in this group matches the filter
    const hasMatch = Object.values(params).some(p =>
      p.group === gKey && p.grpFilter && p.grpFilter.includes(filter)
    );
    grpEl.style.display = hasMatch ? 'block' : 'none';
  });
};

// ─── SEARCH ──────────────────────────────────────────────────────
window.filterAdvParams = function(query) {
  const q = query.toLowerCase().trim();
  document.querySelectorAll('.adv-param-row').forEach(row => {
    const id = row.dataset.id;
    const p  = window.ADV_SIM_PARAMS[id];
    if (!p) return;
    const text = (p.label + ' ' + p.desc + ' ' + (p.tips||[]).join(' ')).toLowerCase();
    row.style.display = (!q || text.includes(q)) ? '' : 'none';
  });
  // Show/hide group headers based on visible params
  document.querySelectorAll('.adv-group').forEach(grpEl => {
    const visible = grpEl.querySelectorAll('.adv-param-row:not([style*="none"])').length;
    grpEl.style.display = visible > 0 ? 'block' : 'none';
  });
};

// ─── TOGGLE GROUP ────────────────────────────────────────────────
window.toggleAdvGroup = function(gKey) {
  const body   = document.getElementById('grp-body-' + gKey);
  const toggle = document.getElementById('grp-toggle-' + gKey);
  if (!body) return;
  const isOpen = body.style.display !== 'none';
  body.style.display = isOpen ? 'none' : 'block';
  if (toggle) toggle.textContent = isOpen ? '▶' : '▼';
};

window.expandAllAdvGroups = function() {
  Object.keys(window.ADV_SIM_GROUPS).forEach(gKey => {
    const b = document.getElementById('grp-body-' + gKey);
    const t = document.getElementById('grp-toggle-' + gKey);
    if (b) b.style.display = 'block';
    if (t) t.textContent = '▼';
  });
};

window.collapseAllAdvGroups = function() {
  Object.keys(window.ADV_SIM_GROUPS).forEach(gKey => {
    const b = document.getElementById('grp-body-' + gKey);
    const t = document.getElementById('grp-toggle-' + gKey);
    if (b) b.style.display = 'none';
    if (t) t.textContent = '▶';
  });
};

// ─── SLIDER INTERACTION ──────────────────────────────────────────
window.onAdvSlider = function(id, rawVal) {
  const p = window.ADV_SIM_PARAMS[id];
  if (!p) return;
  const val = parseFloat(rawVal);
  window.ADV_SIM_STATE[id] = val;

  const valEl  = document.getElementById('apv-' + id);
  const slider = document.getElementById('slider-' + id);
  if (valEl)  valEl.textContent = formatParamValue(val, p);
  if (slider) {
    const pct = ((val - p.min) / (p.max - p.min)) * 100;
    slider.style.setProperty('--pct', pct + '%');
  }

  updateAdvSim(id);
  highlightParam(id);
};

// ─── HIGHLIGHT PARAM ────────────────────────────────────────────
window.highlightParam = function(id) {
  document.querySelectorAll('.adv-param-row.highlighted').forEach(r => r.classList.remove('highlighted'));
  const row = document.getElementById('param-row-' + id);
  if (row) row.classList.add('highlighted');
  showParamDetail(id);
};

// ─── SHOW PARAM DETAIL ───────────────────────────────────────────
function showParamDetail(id) {
  const p   = window.ADV_SIM_PARAMS[id];
  if (!p) return;
  const val = window.ADV_SIM_STATE[id];
  const efx = p.fn(val);
  const panel = document.getElementById('adv-active-param');
  if (!panel) return;

  const col = window.ADV_SIM_GROUPS[p.group]?.color || 'var(--gold)';

  const axesBars = window.ADV_SIM_AXES.map(ax => {
    const v   = efx[ax.key] || 0;
    const abs = Math.abs(v);
    const isLoose = v < 0;
    const color   = abs < 3 ? 'var(--green)' : isLoose ? 'var(--loose)' : 'var(--tight)';
    const label   = abs < 3 ? 'Neutro' : isLoose ? ax.looseLabel : ax.tightLabel;
    const pct     = Math.min(100, abs / 0.2);
    return `
    <div class="detail-axis-row">
      <span class="dar-icon">${ax.icon}</span>
      <span class="dar-label">${ax.label}</span>
      <div class="dar-bar-wrap"><div class="dar-bar" style="width:${pct}%;background:${color}"></div></div>
      <span class="dar-effect" style="color:${color}">${label}</span>
    </div>`;
  }).join('');

  panel.innerHTML = `
  <div class="aap-detail">
    <div class="aap-detail-header" style="border-left:3px solid ${col}">
      <span style="font-size:1.5rem">${p.icon}</span>
      <div>
        <div style="font-family:'Rajdhani',sans-serif;font-weight:700;font-size:1rem;color:${col}">
          ${p.label} = <span style="font-family:'Orbitron',sans-serif">${formatParamValue(val,p)} ${p.unit}</span>
        </div>
        <div style="font-size:0.77rem;color:var(--text-secondary);margin-top:0.2rem;line-height:1.4">${p.desc}</div>
        ${p.tips ? `<div style="margin-top:0.4rem">${p.tips.map(t=>`<span class="detail-tip">${t}</span>`).join('')}</div>` : ''}
      </div>
    </div>
    <div class="aap-detail-axes">${axesBars}</div>
  </div>`;
}

// ─── MAIN UPDATE ──────────────────────────────────────────────────
window.updateAdvSim = function(changedId) {
  const params = window.ADV_SIM_PARAMS;
  const state  = window.ADV_SIM_STATE;

  // Sum contributions
  const totals = {};
  window.ADV_SIM_AXES.forEach(ax => totals[ax.key] = 0);
  Object.values(params).forEach(p => {
    const v   = state[p.id] !== undefined ? state[p.id] : p.def;
    const efx = p.fn(v);
    window.ADV_SIM_AXES.forEach(ax => {
      totals[ax.key] = (totals[ax.key] || 0) + (efx[ax.key] || 0);
    });
  });
  window.ADV_SIM_AXES.forEach(ax => {
    totals[ax.key] = Math.max(-100, Math.min(100, totals[ax.key]));
  });

  const balanceScore = (totals.entry + totals.center + totals.exit) / 3;

  renderOverallBalance(balanceScore);
  renderPhaseSummary(totals);
  renderAxesGrid(totals);
  if (changedId) renderEffectsList(changedId, totals);
  renderSetupProfile(totals);
  renderRecommendations(totals);

  // Refresh highlighted detail
  const highlighted = document.querySelector('.adv-param-row.highlighted');
  if (highlighted) {
    const hId = highlighted.dataset.id;
    if (hId) showParamDetail(hId);
  }
};

// ─── RENDER OVERALL BALANCE ──────────────────────────────────────
function renderOverallBalance(score) {
  const el  = document.getElementById('adv-overall-balance');
  const txt = document.getElementById('adv-balance-text');
  if (!el || !txt) return;

  const abs    = Math.abs(score);
  const isLoose = score < -3;
  const isTight = score > 3;
  const color = isLoose ? 'var(--loose)' : isTight ? 'var(--tight)' : 'var(--green)';
  const label = abs < 3   ? '✅ BALANCEADO' :
                score < -50 ? '🔴 EXTREMAMENTE LOOSE' :
                score < -30 ? '🔴 MUITO LOOSE' :
                score < -10 ? '🔴 LOOSE' :
                score < -3  ? '🟡 LEVEMENTE LOOSE' :
                score > 50  ? '🔵 EXTREMAMENTE TIGHT' :
                score > 30  ? '🔵 MUITO TIGHT' :
                score > 10  ? '🔵 TIGHT' : '🟡 LEVEMENTE TIGHT';

  txt.textContent  = label;
  txt.style.color  = color;

  const clamped  = Math.max(-100, Math.min(100, score));
  const barLeft  = clamped < 0 ? (50 + clamped / 2) : 50;
  const barWidth = Math.abs(clamped) / 2;

  el.innerHTML = `
  <div class="abc-bar-bg">
    <div class="abc-bar-fill" style="left:${barLeft}%;width:${barWidth}%;background:${color}"></div>
    <div class="abc-center-mark"></div>
  </div>`;
}

// ─── RENDER PHASE SUMMARY ────────────────────────────────────────
function renderPhaseSummary(totals) {
  const el = document.getElementById('adv-phase-summary');
  if (!el) return;
  const phases = [
    { key:'entry',  label:'Entrada', icon:'↙️' },
    { key:'center', label:'Centro',  icon:'⬅️' },
    { key:'exit',   label:'Saída',   icon:'↖️' },
  ];
  el.innerHTML = phases.map(ph => {
    const v   = totals[ph.key] || 0;
    const abs = Math.abs(v);
    const col = abs < 5 ? 'var(--green)' : v < 0 ? 'var(--loose)' : 'var(--tight)';
    const lbl = abs < 5 ? 'OK' : v < 0 ? 'LOOSE' : 'TIGHT';
    const intensity = abs < 5 ? '' : abs < 20 ? 'Leve' : abs < 45 ? 'Mod.' : 'Forte';
    return `
    <div class="phase-summary-card" style="border-color:${col}">
      <div class="psc-icon">${ph.icon}</div>
      <div class="psc-label">${ph.label}</div>
      <div class="psc-value" style="color:${col}">${lbl}</div>
      <div class="psc-intensity" style="color:${col}">${intensity}</div>
      <div class="psc-score" style="color:${col}">${v > 0 ? '+' : ''}${v.toFixed(0)}</div>
    </div>`;
  }).join('');
}

// ─── RENDER AXES GRID ────────────────────────────────────────────
function renderAxesGrid(totals) {
  const el = document.getElementById('adv-axes-grid');
  if (!el) return;
  el.innerHTML = window.ADV_SIM_AXES.map(ax => {
    const v   = totals[ax.key] || 0;
    const abs = Math.abs(v);
    const isLoose = v < -3;
    const isTight = v > 3;
    const color = isLoose ? 'var(--loose)' : isTight ? 'var(--tight)' : 'var(--green)';
    const label = abs < 3 ? 'Neutro' : isLoose ? ax.looseLabel : ax.tightLabel;
    const intensity = abs < 5 ? '' : abs < 15 ? 'Leve' : abs < 35 ? 'Moderado' : abs < 60 ? 'Forte' : 'Extremo';

    const barLeftPct  = v < 0 ? Math.max(0, 50 - abs / 2) : 50;
    const barWidthPct = Math.min(50, abs / 2);

    return `
    <div class="axis-card" id="axis-card-${ax.key}">
      <div class="ac-header">
        <span class="ac-icon">${ax.icon}</span>
        <span class="ac-label">${ax.label}</span>
        <span class="ac-intensity" style="color:${color}">${intensity}</span>
      </div>
      <div class="ac-bar-bg">
        <div class="ac-bar-fill" style="left:${barLeftPct}%;width:${barWidthPct}%;background:${color}"></div>
        <div class="ac-center-mark"></div>
      </div>
      <div class="ac-labels">
        <span style="color:var(--loose);font-size:0.62rem">${ax.looseLabel}</span>
        <span style="color:${color};font-size:0.72rem;font-weight:700">${label}</span>
        <span style="color:var(--tight);font-size:0.62rem">${ax.tightLabel}</span>
      </div>
      <div style="text-align:center;font-family:'Orbitron',sans-serif;font-size:0.68rem;color:${color};margin-top:2px">
        ${v > 0 ? '+' : ''}${v.toFixed(1)}
      </div>
    </div>`;
  }).join('');
}

// ─── RENDER EFFECTS LIST ─────────────────────────────────────────
function renderEffectsList(changedId, totals) {
  const panel = document.getElementById('adv-effects-panel');
  const list  = document.getElementById('adv-effects-list');
  if (!panel || !list) return;
  panel.style.display = 'block';

  const p   = window.ADV_SIM_PARAMS[changedId];
  const val = window.ADV_SIM_STATE[changedId];
  if (!p) return;
  const efx = p.fn(val);
  const col = window.ADV_SIM_GROUPS[p.group]?.color || 'var(--gold)';

  const significant = window.ADV_SIM_AXES
    .filter(ax => Math.abs(efx[ax.key] || 0) > 1.5)
    .sort((a, b) => Math.abs(efx[b.key] || 0) - Math.abs(efx[a.key] || 0));

  if (!significant.length) {
    list.innerHTML = '<div style="font-size:0.78rem;color:var(--text-dim);padding:0.4rem">Efeito neutro neste valor.</div>';
    return;
  }

  list.innerHTML = `
  <div style="font-size:0.73rem;color:var(--text-dim);margin-bottom:0.6rem;padding:0.3rem 0.5rem;background:rgba(255,255,255,0.03);border-radius:4px">
    Contribuição de <strong style="color:${col}">${p.label}</strong> = <span style="font-family:'Orbitron',sans-serif;color:${col}">${formatParamValue(val,p)} ${p.unit}</span>
  </div>
  ${significant.map(ax => {
    const v = efx[ax.key] || 0;
    const axColor = v < -1.5 ? 'var(--loose)' : v > 1.5 ? 'var(--tight)' : 'var(--green)';
    const dir  = v < 0 ? ax.looseLabel : ax.tightLabel;
    const mag  = Math.abs(v);
    const wPx  = Math.min(120, mag * 1.8);
    return `<div class="eff-item">
      <span class="eff-axis">${ax.icon} ${ax.label}</span>
      <div class="eff-bar-mini" style="background:${axColor};width:${wPx}px"></div>
      <span class="eff-label" style="color:${axColor}">${dir}</span>
      <span style="font-family:'Orbitron',sans-serif;font-size:0.65rem;color:${axColor};margin-left:auto">${v>0?'+':''}${v.toFixed(1)}</span>
    </div>`;
  }).join('')}`;
}

// ─── RENDER SETUP PROFILE ────────────────────────────────────────
function renderSetupProfile(totals) {
  const el = document.getElementById('adv-profile-grid');
  if (!el) return;
  const score = (totals.entry + totals.center + totals.exit) / 3;

  const profiles = [
    { label:'Quali.',       icon:'🏆', score:20,  desc:'Rígido, pressões altas, ARB forte' },
    { label:'Corrida Curta',icon:'⚡', score:8,   desc:'Leve tight, bom para stints rápidos' },
    { label:'Neutro Ideal', icon:'✅', score:0,   desc:'Equilíbrio entry/center/exit' },
    { label:'Corrida Longa',icon:'🔋', score:-8,  desc:'Leve loose, melhora com desgaste' },
    { label:'Low Grip',     icon:'🌧️', score:-20, desc:'Loose, pressões baixas, ARB macio' },
  ];

  el.innerHTML = profiles.map(pf => {
    const dist  = Math.abs(score - pf.score);
    const match = Math.max(0, 100 - dist * 2.5);
    const color = match > 70 ? 'var(--green)' : match > 40 ? 'var(--gold)' : 'var(--text-dim)';
    const glow  = match > 70 ? `box-shadow:0 0 8px ${color}40` : '';
    return `
    <div class="profile-item" style="${glow}">
      <div style="font-size:1.1rem">${pf.icon}</div>
      <div class="pi2-label" style="color:${color}">${pf.label}</div>
      <div class="pi2-bar-bg"><div class="pi2-bar-fill" style="width:${match}%;background:${color}"></div></div>
      <div class="pi2-score" style="color:${color}">${Math.round(match)}%</div>
      <div class="pi2-desc">${pf.desc}</div>
    </div>`;
  }).join('');
}

// ─── RENDER RECOMMENDATIONS ──────────────────────────────────────
function renderRecommendations(totals) {
  const el = document.getElementById('adv-reco-list');
  if (!el) return;

  const score = (totals.entry + totals.center + totals.exit) / 3;
  const items = [];

  if (totals.entry > 15) {
    items.push({ icon:'🔵', text:'<strong>Tight Entry:</strong> Reduza Brake Bias (-1 a -2%), aumente RF PSI +0.5, reduza LR PSI -0.5, aumente LR LS Rebound.' });
  } else if (totals.entry < -15) {
    items.push({ icon:'🔴', text:'<strong>Loose Entry:</strong> Aumente Brake Bias (+1 a +2%), aumente LF LS Comp, aumente Front ARB, reduza RR LS Rebound.' });
  }

  if (totals.center > 15) {
    items.push({ icon:'🔵', text:'<strong>Tight Center:</strong> Reduza Cross Weight -0.25%, aumente Rear ARB, aumente RF Camber mais negativo, reduza LR Spring.' });
  } else if (totals.center < -15) {
    items.push({ icon:'🔴', text:'<strong>Loose Center:</strong> Aumente Cross Weight +0.25%, reduza Rear ARB, aumenta RR Spring, reduza RF Camber.' });
  }

  if (totals.exit > 15) {
    items.push({ icon:'🔵', text:'<strong>Tight Exit:</strong> Aumente RR Spring, reduza RF LS Rebound, reduza LR LS Comp, aumente Diff Preload.' });
  } else if (totals.exit < -15) {
    items.push({ icon:'🔴', text:'<strong>Loose Exit:</strong> Reduza RR Spring, aumente RF LS Rebound, reduza RR LS Comp, aumente RR Toe (toe-in).' });
  }

  if (totals.tire_wear > 40) {
    items.push({ icon:'🌡️', text:'<strong>Desgaste Alto:</strong> Verifique pressões (podem estar altas), calibre câmbio RF, reduza rigidez ARB dianteiro.' });
  }

  if (totals.aero < -20) {
    items.push({ icon:'🌬️', text:'<strong>Plataforma Aero Ruim:</strong> Verifique ride heights (especialmente RR), certifique rake traseiro correto (LR > RR).' });
  }

  if (!items.length) {
    const abs = Math.abs(score);
    if (abs < 5) {
      el.innerHTML = `<div class="reco-ok">✅ Setup bem balanceado! Continue refinando com pequenos ajustes e coleta de feedback de pilotagem.</div>`;
    } else {
      el.innerHTML = `<div class="reco-ok" style="color:var(--gold)">⚠️ Desequilíbrio moderado detectado. Ajuste os parâmetros mais influentes usando os sliders acima.</div>`;
    }
    return;
  }

  el.innerHTML = items.map(item => `
    <div class="reco-item">
      <span class="reco-icon">${item.icon}</span>
      <div class="reco-text">${item.text}</div>
    </div>`).join('');
}

// ─── RESET ────────────────────────────────────────────────────────
window.resetAdvSim = function() {
  Object.values(window.ADV_SIM_PARAMS).forEach(p => {
    window.ADV_SIM_STATE[p.id] = p.def;
    const slider = document.getElementById('slider-' + p.id);
    const valEl  = document.getElementById('apv-' + p.id);
    if (slider) {
      slider.value = p.def;
      const pct = ((p.def - p.min) / (p.max - p.min)) * 100;
      slider.style.setProperty('--pct', pct + '%');
    }
    if (valEl) valEl.textContent = formatParamValue(p.def, p);
  });
  updateAdvSim(null);
  showNotif('↺ Setup resetado para valores padrão', 'var(--gold)');
};

// ─── LOAD CURRENT SETUP ──────────────────────────────────────────
window.loadCurrentSetupIntoSim = function() {
  const setup = window.AppState?.currentSetup;
  if (!setup) {
    showNotif('⚠️ Nenhum setup carregado. Vá em Setup Analyzer primeiro.', 'var(--loose)');
    return;
  }
  const map2 = {
    lf_psi:'lf_psi', rf_psi:'rf_psi', lr_psi:'lr_psi', rr_psi:'rr_psi',
    lf_spring:'lf_spring', rf_spring:'rf_spring', lr_spring:'lr_spring', rr_spring:'rr_spring',
    cross_weight:'cross_weight', nose_weight:'nose_weight', brake_bias:'brake_bias',
    lf_camber:'lf_camber', rf_camber:'rf_camber', lr_camber:'lr_camber', rr_camber:'rr_camber',
    lf_caster:'lf_caster', rf_caster:'rf_caster',
    lf_rh:'lf_ride_height', rf_rh:'rf_ride_height', lr_rh:'lr_ride_height', rr_rh:'rr_ride_height',
    lf_lsc:'lf_ls_comp', rf_lsc:'rf_ls_comp', lr_lsc:'lr_ls_comp', rr_lsc:'rr_ls_comp',
    lf_hsc:'lf_hs_comp', rf_hsc:'rf_hs_comp', lr_hsc:'lr_hs_comp', rr_hsc:'rr_hs_comp',
    lf_lsr:'lf_ls_reb', rf_lsr:'rf_ls_reb', lr_lsr:'lr_ls_reb', rr_lsr:'rr_ls_reb',
  };

  let loaded = 0;
  Object.entries(map2).forEach(([setupKey, simKey]) => {
    if (setup[setupKey] !== undefined && setup[setupKey] !== null) {
      const p       = window.ADV_SIM_PARAMS[simKey];
      if (!p) return;
      const clamped = Math.max(p.min, Math.min(p.max, parseFloat(setup[setupKey])));
      window.ADV_SIM_STATE[simKey] = clamped;
      const slider  = document.getElementById('slider-' + simKey);
      const valEl   = document.getElementById('apv-' + simKey);
      if (slider) {
        slider.value = clamped;
        const pct = ((clamped - p.min) / (p.max - p.min)) * 100;
        slider.style.setProperty('--pct', pct + '%');
      }
      if (valEl) valEl.textContent = formatParamValue(clamped, p);
      loaded++;
    }
  });

  updateAdvSim(null);
  showNotif(`✅ ${loaded} parâmetros importados do setup!`, 'var(--green)');
};

// ─── EXPORT ──────────────────────────────────────────────────────
window.exportAdvSimSetup = function() {
  const state = window.ADV_SIM_STATE;
  const params = window.ADV_SIM_PARAMS;
  let out = '=== NASCAR Next Gen – Simulador Avançado Export ===\n\n';
  Object.entries(window.ADV_SIM_GROUPS).forEach(([gKey, gDef]) => {
    const inGroup = Object.values(params).filter(p => p.group === gKey);
    if (!inGroup.length) return;
    out += `--- ${gDef.label} ---\n`;
    inGroup.forEach(p => {
      const v = state[p.id] !== undefined ? state[p.id] : p.def;
      out += `${p.label}: ${formatParamValue(v,p)} ${p.unit}\n`;
    });
    out += '\n';
  });

  const blob = new Blob([out], { type:'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'nascar-nextgen-setup.txt';
  a.click(); URL.revokeObjectURL(url);
  showNotif('📤 Setup exportado!', 'var(--green)');
};

// ─── NOTIFICATION HELPER ─────────────────────────────────────────
function showNotif(msg, color) {
  const n = document.createElement('div');
  n.style.cssText = `position:fixed;top:70px;right:20px;z-index:9999;
    background:var(--bg-card);border:1px solid ${color};color:${color};
    padding:0.7rem 1.2rem;border-radius:6px;font-family:Rajdhani,sans-serif;
    font-weight:700;font-size:0.85rem;box-shadow:0 4px 20px rgba(0,0,0,0.4);
    animation:slideInRight 0.3s ease;`;
  n.textContent = msg;
  document.body.appendChild(n);
  setTimeout(() => { n.style.opacity = '0'; n.style.transition = 'opacity 0.5s'; setTimeout(() => n.remove(), 500); }, 2800);
}
