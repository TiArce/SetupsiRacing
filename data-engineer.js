// =============================================
//  NASCAR Next Gen – Engineer Knowledge Base
//  data-engineer.js
// =============================================

// ─── HANDLING DIAGNOSIS MATRIX ─────────────────────────────────
window.DIAGNOSIS_MATRIX = {

  'loose-entry': {
    title: 'Loose Entry (Traseira Solta na Entrada)',
    type: 'loose',
    description: 'O carro perde tração traseira ao entrar na curva, geralmente na frenagem ou no início da curva.',
    physics: 'Na entrada da curva, a transferência de peso longitudinal (para frente durante a frenagem) alivia a carga dos pneus traseiros. Se o carro tende a soltar traseira nessa fase, precisamos de mais carga ou aderência nos traseiros.',
    adjustments: [
      {
        priority: 1,
        component: 'Brake Bias',
        direction: 'Increase (mais dianteiro)',
        reason: 'Aumentar o brake bias para frente reduz a carga de frenagem nos freios traseiros, aliviando a tendência da traseira de travar/soltar na entrada.',
        values: { mild: '+0.5%', moderate: '+1.0%', aggressive: '+1.5%', extreme: '+2.0%' },
        current_typical: '54.0%',
        pitroad: true
      },
      {
        priority: 2,
        component: 'RF Spring Rate',
        direction: 'Stiffer (mais rígido)',
        reason: 'Uma mola RF mais rígida transfere mais carga para o RF durante a entrada, liberando o traseiro de absorver toda a carga de frenagem.',
        values: { mild: '+25 lbs', moderate: '+50 lbs', aggressive: '+75 lbs', extreme: '+100 lbs' },
        current_typical: '600 lbs',
        pitroad: false
      },
      {
        priority: 3,
        component: 'LF Bump (LS Compression)',
        direction: 'Stiffer (mais rígido)',
        reason: 'Amortecedor LF mais firme na compressão desacelera a transferência de peso para a frente, estabilizando a entrada.',
        values: { mild: '+1 click', moderate: '+2 clicks', aggressive: '+3 clicks', extreme: '+4 clicks' },
        current_typical: '5',
        pitroad: false
      },
      {
        priority: 4,
        component: 'RF PSI',
        direction: 'Lower (reduzir pressão)',
        reason: 'Pressão menor no RF aumenta a área de contato do pneu dianteiro direito, melhorando o grip na entrada e reduzindo understeer que força a traseira a compensar.',
        values: { mild: '-0.5 PSI', moderate: '-1.0 PSI', aggressive: '-1.5 PSI', extreme: '-2.0 PSI' },
        current_typical: '28 PSI',
        pitroad: true
      },
      {
        priority: 5,
        component: 'LR Ride Height',
        direction: 'Lower (reduzir altura)',
        reason: 'Reduzir a altura do LR aumenta a carga estática no LR, melhorando a aderência traseira esquerda na entrada.',
        values: { mild: '-0.1"', moderate: '-0.2"', aggressive: '-0.3"', extreme: '-0.4"' },
        current_typical: '5.5"',
        pitroad: false
      },
      {
        priority: 6,
        component: 'RF Camber',
        direction: 'Less negative (reduzir câmbio negativo)',
        reason: 'Câmbio RF excessivamente negativo pode reduzir o grip do RF na entrada, causando que o carro rotacione excessivamente.',
        values: { mild: '+0.3°', moderate: '+0.5°', aggressive: '+0.8°', extreme: '+1.0°' },
        current_typical: '-4.5°',
        pitroad: false
      },
      {
        priority: 7,
        component: 'Front ARB',
        direction: 'Stiffer',
        reason: 'ARB dianteiro mais rígido aumenta a rigidez ao rolamento, transferindo mais carga para o exterior na curva e reduzindo a soltura traseira.',
        values: { mild: '+1 position (ex: P3→P4)', moderate: '+1 arm position', aggressive: 'Larger diameter', extreme: '2.00" + P5' },
        current_typical: 'P3 – 1.375"',
        pitroad: false
      }
    ],
    spring_synopsis: 'RF mais rígido → Tight. LR mais macio → Loose. Para corrigir: RF+, ou LR stiffer',
    pitstop_summary: 'Brake bias +1.0% dianteiro; RF PSI -1; LF PSI -1; Spring Perch LR +0.031; Spring Perch RR +0.031'
  },

  'loose-center': {
    title: 'Loose Center (Traseira Solta no Centro)',
    type: 'loose',
    description: 'O carro perde tração traseira no centro (ápice) da curva, quando o volante está mais virado e a aceleração começa.',
    physics: 'No centro da curva, a carga lateral é máxima. O equilíbrio entre molas/ARB é crítico para distribuir carga entre os quatro pneus uniformemente.',
    adjustments: [
      {
        priority: 1,
        component: 'Cross Weight (Wedge)',
        direction: 'Increase (mais wedge)',
        reason: 'Aumentar o cross weight adiciona carga ao LR e RF (par diagonalmente), melhorando a tração traseira esquerda no centro da curva onde a força centrífuga é máxima.',
        values: { mild: '+0.25%', moderate: '+0.5%', aggressive: '+0.75%', extreme: '+1.0%' },
        current_typical: '50.0%',
        pitroad: false
      },
      {
        priority: 2,
        component: 'RF Spring Rate',
        direction: 'Stiffer',
        reason: 'RF mais rígido distribui mais carga para o RF no apice, equilibrando a carga e melhorando a tração central.',
        values: { mild: '+25 lbs', moderate: '+50 lbs', aggressive: '+75 lbs', extreme: '+100 lbs' },
        current_typical: '600 lbs',
        pitroad: false
      },
      {
        priority: 3,
        component: 'RR Spring Rate',
        direction: 'Softer (mais macio)',
        reason: 'RR mais macio permite que o pneu RR mantenha mais contato com a pista, melhorando a tração no centro.',
        values: { mild: '-25 lbs', moderate: '-50 lbs', aggressive: '-75 lbs', extreme: '-100 lbs' },
        current_typical: '225 lbs',
        pitroad: false
      },
      {
        priority: 4,
        component: 'Front ARB',
        direction: 'Stiffer',
        reason: 'ARB dianteiro mais rígido aumenta a carga no RF no ápice da curva, equilibrando a distribuição e reduzindo a tendência solta.',
        values: { mild: '+1 ARM position', moderate: '+2 ARM positions', aggressive: 'Larger diameter bar', extreme: '2.00" stiff bar' },
        current_typical: 'P3',
        pitroad: false
      },
      {
        priority: 5,
        component: 'RR PSI',
        direction: 'Lower',
        reason: 'Menor pressão RR aumenta a área de contato traseira direita, melhorando o grip no ápice.',
        values: { mild: '-0.5 PSI', moderate: '-1.0 PSI', aggressive: '-1.5 PSI', extreme: '-2.0 PSI' },
        current_typical: '24 PSI',
        pitroad: true
      },
      {
        priority: 6,
        component: 'Spring Perch LR',
        direction: 'Lower (reduzir perch)',
        reason: 'Reduzir o perch LR aumenta o preload no LR, adicionando cross weight e melhorando tração no centro.',
        values: { mild: '-0.031"', moderate: '-0.062"', aggressive: '-0.093"', extreme: '-0.125"' },
        current_typical: '0.000',
        pitroad: true
      }
    ],
    spring_synopsis: 'RF mais rígido → Tight. RR mais macio → Tight (ajuda). Para corrigir loose center: RF+, RR-, ARB+, Wedge+',
    pitstop_summary: 'Brake bias +1.0% dianteiro; RF PSI +1; RR PSI -1; Spring Perch LR -0.031; Spring Perch RR +0.031'
  },

  'loose-exit': {
    title: 'Loose Exit (Traseira Solta na Saída)',
    type: 'loose',
    description: 'O carro perde tração traseira ao sair da curva com aceleração, geralmente com excesso de wheelspin ou oversteer.',
    physics: 'Na saída da curva, a força motriz precisa transferir peso para trás. Se a traseira está solta, falta aderência nos pneus traseiros sob aceleração.',
    adjustments: [
      {
        priority: 1,
        component: 'LR Spring Rate',
        direction: 'Stiffer (mais rígido)',
        reason: 'LR mais rígido transfere mais carga para o LR na aceleração, melhorando a tração de saída.',
        values: { mild: '+25 lbs', moderate: '+50 lbs', aggressive: '+75 lbs', extreme: '+100 lbs' },
        current_typical: '175 lbs',
        pitroad: false
      },
      {
        priority: 2,
        component: 'RR Spring Rate',
        direction: 'Softer',
        reason: 'RR mais macio mantém o RR plantado na pista durante a aceleração de saída.',
        values: { mild: '-25 lbs', moderate: '-50 lbs', aggressive: '-75 lbs', extreme: '-100 lbs' },
        current_typical: '225 lbs',
        pitroad: false
      },
      {
        priority: 3,
        component: 'RR PSI',
        direction: 'Lower',
        reason: 'Menor pressão RR fornece mais grip na saída da curva sob aceleração.',
        values: { mild: '-0.5 PSI', moderate: '-1.0 PSI', aggressive: '-1.5 PSI', extreme: '-2.0 PSI' },
        current_typical: '24 PSI',
        pitroad: true
      },
      {
        priority: 4,
        component: 'LR PSI',
        direction: 'Higher (aumentar)',
        reason: 'Pressão mais alta no LR reduz a deformação do pneu e transfere mais carga para o pneu, ajudando na tração.',
        values: { mild: '+0.5 PSI', moderate: '+1.0 PSI', aggressive: '+1.5 PSI', extreme: '+2.0 PSI' },
        current_typical: '22 PSI',
        pitroad: true
      },
      {
        priority: 5,
        component: 'Spring Perch (ambos traseiros)',
        direction: 'Higher (aumentar)',
        reason: 'Aumentar os perches traseiros eleva a ride height traseira, reduzindo o roll na saída.',
        values: { mild: '+0.031"', moderate: '+0.062"', aggressive: '+0.093"', extreme: '+0.125"' },
        current_typical: '0.000',
        pitroad: true
      },
      {
        priority: 6,
        component: 'Front ARB',
        direction: 'Stiffer',
        reason: 'ARB dianteiro mais rígido melhora a estabilidade na saída distribuindo melhor a carga.',
        values: { mild: '+1 position', moderate: '+2 positions', aggressive: 'Stiff bar', extreme: '2.00" + P5' },
        current_typical: 'P3',
        pitroad: false
      }
    ],
    spring_synopsis: 'LR mais rígido → Tight (na saída ajuda). RR mais macio → Loose se excessivo. Para corrigir: LR+, RR-',
    pitstop_summary: 'Direção + (LF-side steering); LR PSI +1; RF PSI +1; RR PSI -1; Spring Perch LR +0.031; Spring Perch RR +0.031'
  },

  'tight-entry': {
    title: 'Tight Entry (Understerr na Entrada)',
    type: 'tight',
    description: 'O carro empurra para fora (understeer/push) na entrada da curva, dificultando o giro do carro.',
    physics: 'Na entrada, os pneus dianteiros atingem o limite de aderência antes dos traseiros, causando push. Precisamos mais grip dianteiro ou menos rigidez dianteira.',
    adjustments: [
      {
        priority: 1,
        component: 'Brake Bias',
        direction: 'Decrease (mais traseiro)',
        reason: 'Reduzir o brake bias (mais frenagem traseira) força a traseira a se comprometer mais na frenagem, ajudando a girar o carro na entrada.',
        values: { mild: '-0.5%', moderate: '-1.0%', aggressive: '-1.5%', extreme: '-2.0%' },
        current_typical: '54.0%',
        pitroad: true
      },
      {
        priority: 2,
        component: 'Front Sway Bar',
        direction: 'Softer',
        reason: 'ARB dianteiro mais macio aumenta a rolagem dianteira na entrada, permitindo que o dianteiro carregue mais peso e melhore o grip.',
        values: { mild: '-1 ARM position', moderate: '-2 ARM positions', aggressive: 'Smaller diameter', extreme: '1.375" + P1' },
        current_typical: 'P3',
        pitroad: false
      },
      {
        priority: 3,
        component: 'LF Spring Rate',
        direction: 'Softer',
        reason: 'LF mais macio permite mais carga no LF durante a entrada da curva (à esquerda de um oval), melhorando o grip dianteiro.',
        values: { mild: '-25 lbs', moderate: '-50 lbs', aggressive: '-75 lbs', extreme: '-100 lbs' },
        current_typical: '550 lbs',
        pitroad: false
      },
      {
        priority: 4,
        component: 'LR Ride Height',
        direction: 'Higher',
        reason: 'Aumentar o LR ride height aumenta a carga dinâmica no RR na entrada, ajudando a girar o carro.',
        values: { mild: '+0.1"', moderate: '+0.2"', aggressive: '+0.3"', extreme: '+0.4"' },
        current_typical: '5.5"',
        pitroad: false
      },
      {
        priority: 5,
        component: 'RF PSI',
        direction: 'Higher',
        reason: 'Mais pressão no RF reduz a área de contato lateral, reduzindo o grip dianteiro e equilibrando com o traseiro.',
        values: { mild: '+0.5 PSI', moderate: '+1.0 PSI', aggressive: '+1.5 PSI', extreme: '+2.0 PSI' },
        current_typical: '28 PSI',
        pitroad: true
      },
      {
        priority: 6,
        component: 'Spring Perch Traseiro',
        direction: 'Lower (ambos)',
        reason: 'Reduzir perches traseiros aumenta cross weight, que aumenta carga no RR na entrada, ajudando no giro.',
        values: { mild: '-0.031"', moderate: '-0.062"', aggressive: '-0.093"', extreme: '-0.125"' },
        current_typical: '0.000',
        pitroad: true
      }
    ],
    spring_synopsis: 'LF mais macio → Tight. Para corrigir tight entry: LF soften, ARB soften, brake bias traseiro',
    pitstop_summary: 'Brake bias -1.0% (mais traseiro); RF PSI +1; RR PSI +1; LR PSI -1; Spring Perch LR -0.031; Spring Perch RR -0.031'
  },

  'tight-center': {
    title: 'Tight Center (Understeer no Centro)',
    type: 'tight',
    description: 'O carro empurra no centro da curva, dificultando manter a linha desejada no ápice.',
    physics: 'No ápice, o grip dianteiro é insuficiente para a trajetória desejada. Os dianteiros escorregam para fora enquanto a traseira está equilibrada.',
    adjustments: [
      {
        priority: 1,
        component: 'Cross Weight (Wedge)',
        direction: 'Decrease (menos wedge)',
        reason: 'Menos cross weight reduz a carga no LR/RF e adiciona no LF/RR, liberando o dianteiro para girar melhor no ápice.',
        values: { mild: '-0.25%', moderate: '-0.5%', aggressive: '-0.75%', extreme: '-1.0%' },
        current_typical: '50.0%',
        pitroad: false
      },
      {
        priority: 2,
        component: 'RF Spring Rate',
        direction: 'Softer',
        reason: 'RF mais macio permite mais flexão do dianteiro no ápice, distribuindo melhor a carga e melhorando o grip dianteiro.',
        values: { mild: '-25 lbs', moderate: '-50 lbs', aggressive: '-75 lbs', extreme: '-100 lbs' },
        current_typical: '600 lbs',
        pitroad: false
      },
      {
        priority: 3,
        component: 'RR Spring Rate',
        direction: 'Stiffer',
        reason: 'RR mais rígido transfere carga de volta ao RR no ápice, equilibrando e liberando o dianteiro.',
        values: { mild: '+25 lbs', moderate: '+50 lbs', aggressive: '+75 lbs', extreme: '+100 lbs' },
        current_typical: '225 lbs',
        pitroad: false
      },
      {
        priority: 4,
        component: 'RR PSI',
        direction: 'Higher',
        reason: 'Mais pressão RR reduz o grip RR no ápice, equilibrando com o dianteiro.',
        values: { mild: '+0.5 PSI', moderate: '+1.0 PSI', aggressive: '+1.5 PSI', extreme: '+2.0 PSI' },
        current_typical: '24 PSI',
        pitroad: true
      },
      {
        priority: 5,
        component: 'Front ARB',
        direction: 'Softer',
        reason: 'ARB dianteiro mais macio permite rolagem que aumenta carga no dianteiro externo, melhorando grip.',
        values: { mild: '-1 ARM position', moderate: '-2 ARM positions', aggressive: 'Smaller bar', extreme: '1.375" P1' },
        current_typical: 'P3',
        pitroad: false
      },
      {
        priority: 6,
        component: 'Spring Perch LR',
        direction: 'Higher (aumentar)',
        reason: 'Aumentar perch LR reduz cross weight, liberando o dianteiro.',
        values: { mild: '+0.031"', moderate: '+0.062"', aggressive: '+0.093"', extreme: '+0.125"' },
        current_typical: '0.000',
        pitroad: true
      }
    ],
    spring_synopsis: 'RF mais macio → Loose. RR mais rígido → Loose. Para corrigir tight center: RF-, RR+, Wedge-',
    pitstop_summary: 'Brake bias -1.0%; RF PSI -1; RR PSI +1; Spring Perch LR +0.031; Spring Perch RR -0.031'
  },

  'tight-exit': {
    title: 'Tight Exit (Understeer na Saída)',
    type: 'tight',
    description: 'O carro empurra na saída da curva, dificultando aceleração e saída eficiente.',
    physics: 'Na saída, a força motriz precisa direcionar o carro para a reta. Se o dianteiro push, os dianteiros não seguem o arco necessário.',
    adjustments: [
      {
        priority: 1,
        component: 'LR Spring Rate',
        direction: 'Softer',
        reason: 'LR mais macio permite que o LR absorva mais carga na saída, equilibrando e liberando o dianteiro.',
        values: { mild: '-25 lbs', moderate: '-50 lbs', aggressive: '-75 lbs', extreme: '-100 lbs' },
        current_typical: '175 lbs',
        pitroad: false
      },
      {
        priority: 2,
        component: 'RR Spring Rate',
        direction: 'Stiffer',
        reason: 'RR mais rígido aumenta a carga no RR na saída, transferindo o equilíbrio para trás e liberando o dianteiro.',
        values: { mild: '+25 lbs', moderate: '+50 lbs', aggressive: '+75 lbs', extreme: '+100 lbs' },
        current_typical: '225 lbs',
        pitroad: false
      },
      {
        priority: 3,
        component: 'RR PSI',
        direction: 'Higher',
        reason: 'Maior pressão RR reduz o grip do RR, mas aumenta a carga e a direcionabilidade na saída.',
        values: { mild: '+0.5 PSI', moderate: '+1.0 PSI', aggressive: '+1.5 PSI', extreme: '+2.0 PSI' },
        current_typical: '24 PSI',
        pitroad: true
      },
      {
        priority: 4,
        component: 'LR PSI',
        direction: 'Lower',
        reason: 'Menos pressão LR aumenta o grip LR na saída da curva, ajudando a impulsionar o carro.',
        values: { mild: '-0.5 PSI', moderate: '-1.0 PSI', aggressive: '-1.5 PSI', extreme: '-2.0 PSI' },
        current_typical: '22 PSI',
        pitroad: true
      },
      {
        priority: 5,
        component: 'Cross Weight',
        direction: 'Decrease',
        reason: 'Menos wedge libera o dianteiro na saída, melhorando a rotação e saída da curva.',
        values: { mild: '-0.25%', moderate: '-0.5%', aggressive: '-0.75%', extreme: '-1.0%' },
        current_typical: '50.0%',
        pitroad: false
      },
      {
        priority: 6,
        component: 'Spring Perch RR',
        direction: 'Lower',
        reason: 'Reduzir perch RR aumenta carga no RR, transferindo equilíbrio.',
        values: { mild: '-0.031"', moderate: '-0.062"', aggressive: '-0.093"', extreme: '-0.125"' },
        current_typical: '0.000',
        pitroad: true
      }
    ],
    spring_synopsis: 'LR mais macio → Loose. RR mais rígido → Loose. Para corrigir tight exit: LR-, RR+, wedge-',
    pitstop_summary: 'Brake bias -1.0%; RR PSI +1; LR PSI -1; Spring Perch RR -0.031; Spring Perch LR 0.000'
  },

  'tire-wear': {
    title: 'Desgaste Excessivo de Pneus',
    type: 'other',
    description: 'Pneus degradam muito rápido, perdendo grip ao longo do stint.',
    physics: 'Desgaste excessivo é causado por escorregamento excessivo do pneu (slip angle muito alto), temperatura elevada, ou pressão incorreta.',
    adjustments: [
      {
        priority: 1,
        component: 'Tire PSI (geral)',
        direction: 'Increase (aumentar pressão)',
        reason: 'Pressão mais alta reduz a temperatura de trabalho do pneu e diminui o calor gerado pelo desgaste.',
        values: { mild: '+0.5 PSI todos', moderate: '+1.0 PSI todos', aggressive: '+1.5 PSI todos', extreme: '+2.0 PSI todos' },
        current_typical: 'Variado',
        pitroad: true
      },
      {
        priority: 2,
        component: 'RF Camber',
        direction: 'Less negative',
        reason: 'Câmbio RF muito negativo desgasta o interior do pneu. Ajuste para distribuir o desgaste melhor.',
        values: { mild: '+0.3°', moderate: '+0.5°', aggressive: '+0.8°', extreme: '+1.0°' },
        current_typical: '-4.5°',
        pitroad: false
      },
      {
        priority: 3,
        component: 'Driving Style',
        direction: 'Mais suave nas entradas',
        reason: 'Frenagem tardia e entrada agressiva geram alto slip angle nos dianteiros. Frenagem mais suave reduz desgaste em 15-20%.',
        values: { mild: 'Brake 5% earlier', moderate: 'Brake 10% earlier', aggressive: 'Smooth early apex', extreme: 'Full conservation mode' },
        current_typical: 'N/A',
        pitroad: false
      },
      {
        priority: 4,
        component: 'Front Spring Rate',
        direction: 'Stiffer (levemente)',
        reason: 'Molas dianteiras um pouco mais firmes reduzem o movimento do chassis e diminuem o slip angle.',
        values: { mild: '+25 lbs ambos', moderate: '+50 lbs ambos', aggressive: '+75 lbs', extreme: '+100 lbs' },
        current_typical: '575 lbs',
        pitroad: false
      }
    ],
    spring_synopsis: 'Pressão alta = menos desgaste. Câmbio correto = desgaste uniforme.',
    pitstop_summary: 'Aumentar todas as pressões; verificar câmbio e caster; dirigir mais suave nas entradas'
  },

  'no-rotation': {
    title: 'Sem Rotação / Dificuldade de Girar',
    type: 'other',
    description: 'O carro não gira bem no meio da curva, dificultando carregar velocidade e fazer linha desejada.',
    physics: 'Falta de rotação geralmente indica setup muito tight (understeer crônico) ou falta de câmbio/caster adequado.',
    adjustments: [
      {
        priority: 1,
        component: 'Caster Split',
        direction: 'Increase RF Caster',
        reason: 'Mais caster no RF aumenta a cambagem dinâmica na curva, melhorando a rotação significativamente.',
        values: { mild: '+0.3° RF', moderate: '+0.5° RF', aggressive: '+0.8° RF', extreme: '+1.0° RF' },
        current_typical: 'RF: 6.0°',
        pitroad: false
      },
      {
        priority: 2,
        component: 'RF Camber',
        direction: 'More negative',
        reason: 'Mais câmbio negativo no RF gera mais força lateral na curva, aumentando a rotação.',
        values: { mild: '-0.3°', moderate: '-0.5°', aggressive: '-0.8°', extreme: '-1.0°' },
        current_typical: '-4.5°',
        pitroad: false
      },
      {
        priority: 3,
        component: 'Cross Weight (Wedge)',
        direction: 'Decrease',
        reason: 'Menos wedge libera o dianteiro, permitindo mais rotação no ápice.',
        values: { mild: '-0.25%', moderate: '-0.5%', aggressive: '-0.75%', extreme: '-1.0%' },
        current_typical: '50.0%',
        pitroad: false
      },
      {
        priority: 4,
        component: 'RF Spring Rate',
        direction: 'Softer',
        reason: 'RF mais macio permite mais compressão na curva, gerando mais força lateral e rotação.',
        values: { mild: '-25 lbs', moderate: '-50 lbs', aggressive: '-75 lbs', extreme: '-100 lbs' },
        current_typical: '600 lbs',
        pitroad: false
      }
    ],
    spring_synopsis: 'RF mais macio = mais rotação. Caster RF+ = mais rotação dinâmica.',
    pitstop_summary: 'Reduzir cross weight; checar câmbio e caster no próximo pit; RF PSI levemente menor'
  },

  'high-line': {
    title: 'Dificuldade na Linha Alta',
    type: 'other',
    description: 'O carro não mantém velocidade ou estabilidade na linha alta (groove externo).',
    physics: 'A linha alta requer que o carro funcione bem com mais ângulo de ataque nas curvas. Normalmente requer mais grip no LF e estabilidade lateral.',
    adjustments: [
      {
        priority: 1,
        component: 'LF Spring Rate',
        direction: 'Softer',
        reason: 'LF mais macio permite melhor absorção no LF quando o carro sobe na line alta (mais carga lateral), melhorando o grip.',
        values: { mild: '-25 lbs', moderate: '-50 lbs', aggressive: '-75 lbs', extreme: '-100 lbs' },
        current_typical: '550 lbs',
        pitroad: false
      },
      {
        priority: 2,
        component: 'LF PSI',
        direction: 'Lower',
        reason: 'Menos pressão LF dá mais grip no LF para a linha alta onde a carga lateral é maior.',
        values: { mild: '-0.5 PSI', moderate: '-1.0 PSI', aggressive: '-1.5 PSI', extreme: '-2.0 PSI' },
        current_typical: '28 PSI',
        pitroad: true
      },
      {
        priority: 3,
        component: 'Front ARB',
        direction: 'Softer',
        reason: 'ARB dianteiro mais macio permite mais rolagem lateral, distribuindo melhor a carga na linha alta.',
        values: { mild: '-1 position', moderate: '-2 positions', aggressive: 'Smaller bar', extreme: '1.375" P1' },
        current_typical: 'P3',
        pitroad: false
      }
    ],
    spring_synopsis: 'LF macio = melhor linha alta. ARB macio = mais rolagem = melhor carga LF.',
    pitstop_summary: 'LF PSI -1; setup mais macio no dianteiro esquerdo para linha alta'
  },

  'thermal-fade': {
    title: 'Tight Após Stints (Fadiga Térmica)',
    type: 'other',
    description: 'O carro começa equilibrado mas fica progressivamente tight à medida que os pneus desgastam ao longo de um stint.',
    physics: 'Com o desgaste, o pneu RR perde borracha e grip, criando understeer. O carro precisa de setup ligeiramente loose para compensar a degradação.',
    adjustments: [
      {
        priority: 1,
        component: 'Setup Inicial',
        direction: 'Slightly loose base',
        reason: 'Configure o setup um pouco mais loose que o ideal nos primeiros 5 voltas. Com o desgaste, o carro vai chegando ao ponto de equilíbrio naturalmente.',
        values: { mild: 'LF-0.5 PSI inicial', moderate: 'ARB soften + LF PSI-', aggressive: 'Spring soften front', extreme: 'Full quali-vs-race split' },
        current_typical: 'Balanceado',
        pitroad: false
      },
      {
        priority: 2,
        component: 'RR Camber',
        direction: 'More negative (dentro do limite)',
        reason: 'Mais câmbio negativo no RR prolonga a vida útil do pneu distribuindo desgaste mais uniformemente no perfil.',
        values: { mild: '-0.2° RR', moderate: '-0.4° RR', aggressive: '-0.6° RR', extreme: '-0.8° RR' },
        current_typical: '-3.0°',
        pitroad: false
      },
      {
        priority: 3,
        component: 'Pit Stop Adjustment',
        direction: 'Spring Perch na parada',
        reason: 'Ajuste progressivo dos spring perches ao longo da corrida. Quando o carro ficar tight com desgaste, corrija no pit.',
        values: { mild: 'LR -0.031 no pit', moderate: 'LR -0.031, RR -0.031', aggressive: 'Cross weight reduction', extreme: 'Full setup change in pit' },
        current_typical: '0.000',
        pitroad: true
      }
    ],
    spring_synopsis: 'Carro tight com desgaste = setup precisa de bias ligeiramente loose para corrida longa.',
    pitstop_summary: 'Monitor balance evolution; plan perch adjustments each pit stop; slightly looser initial setup'
  }
};

// ─── NATURAL LANGUAGE KEYWORDS ─────────────────────────────────
window.NL_KEYWORDS = {
  loose: ['solta', 'solto', 'loose', 'oversteer', 'sobreviragem', 'cauda', 'traseira sai', 'escorrega', 'spin'],
  tight: ['tight', 'empurra', 'push', 'understeer', 'subviragem', 'frente vai longe', 'não gira', 'não vira', 'empurrando'],
  entry: ['entrada', 'entry', 'entrar', 'ao entrar', 'frenagem', 'freio', 'braking', 'chegando na curva'],
  center: ['centro', 'center', 'meio', 'ápice', 'apice', 'middle', 'no meio', 'vértice'],
  exit: ['saída', 'saida', 'exit', 'sair', 'aceleração', 'acelerando', 'saindo'],
  tire: ['pneu', 'pneus', 'tire', 'borracha', 'desgaste', 'wear', 'temperatura'],
  rotation: ['rotação', 'rotacao', 'girar', 'gira', 'rotate', 'rotation', 'não gira', 'dificuldade de girar'],
  thermal: ['voltas', 'stint', 'aquece', 'degradação', 'degrada', 'piora', 'após', 'depois', 'long run']
};

// ─── SPRING SYNOPSIS ───────────────────────────────────────────
window.SPRING_SYNOPSIS = {
  LF: {
    stiffer: 'Mais loose (libera o dianteiro)',
    softer: 'Mais tight (aumenta carga no LF)'
  },
  RF: {
    stiffer: 'Mais tight (aumenta carga no RF)',
    softer: 'Mais loose (libera para rotação)'
  },
  LR: {
    stiffer: 'Mais tight (aumenta carga LR)',
    softer: 'Mais loose (alivia LR na curva)'
  },
  RR: {
    stiffer: 'Mais loose (transfere carga do RR)',
    softer: 'Mais tight (mantém RR aderente)'
  }
};

// ─── SHOCK SYNOPSIS ────────────────────────────────────────────
window.SHOCK_SYNOPSIS = {
  LF_bump: { higher: 'Tight Entry', lower: 'Loose Entry', note: 'Controla compressão LF na frenagem' },
  LF_rebound: { higher: 'Tight Exit', lower: 'Loose Exit', note: 'Controla extensão LF na saída' },
  RF_bump: { higher: 'Tight Entry', lower: 'Loose Entry', note: 'Controla compressão RF na entrada' },
  RF_rebound: { higher: 'Tight Exit', lower: 'Loose Exit', note: 'Controla extensão RF na saída' },
  LR_bump: { higher: 'Loose Exit', lower: 'Tight Exit', note: 'Compressão LR afeta saída' },
  LR_rebound: { higher: 'Loose Entry', lower: 'Tight Entry', note: 'Extensão LR afeta entrada' },
  RR_bump: { higher: 'Loose Exit', lower: 'Tight Exit', note: 'Compressão RR afeta saída' },
  RR_rebound: { higher: 'Loose Entry', lower: 'Tight Entry', note: 'Extensão RR afeta entrada' }
};

// ─── QUICK REFERENCE DATA ──────────────────────────────────────
window.QUICK_REFS = {
  springs: `**SINOPSE DAS MOLAS – NASCAR Next Gen**

🔴 **Deixa LOOSE:**
• LF mais rígida → Loose (libera dianteiro)
• RF mais macia → Loose (reduz grip RF)
• LR mais macia → Loose (alivia LR na curva)
• RR mais rígida → Loose (transfere carga do RR)
• Molas traseiras mais rígidas → Loose

🔵 **Deixa TIGHT:**
• LF mais macia → Tight (mais carga no LF)
• RF mais rígida → Tight (aumenta grip RF)
• LR mais rígida → Tight (mais carga LR)
• RR mais macia → Tight (mantém RR aderente)
• Molas dianteiras mais rígidas → Tight

**Regra geral:** Dianteiras+ = Tight | Traseiras+ = Loose`,

  shocks: `**SINOPSE DOS AMORTECEDORES – NASCAR Next Gen**

📥 **BUMP (Compressão):**
• LF Bump+  → Tight Entry (resiste compressão na frenagem)
• RF Bump+  → Tight Entry
• LR Bump+  → Loose Exit (resiste compressão na aceleração)
• RR Bump+  → Loose Exit

📤 **REBOUND (Extensão):**
• LF Rebound+ → Tight Exit
• RF Rebound+ → Tight Exit
• LR Rebound+ → Loose Entry (extensão rápida solta a traseira)
• RR Rebound+ → Loose Entry

⚡ **LS vs HS:**
• LS (Low Speed): Controla movimentos lentos do chassis (driver inputs)
• HS (High Speed): Controla impactos rápidos (bumps, curbs)`,

  tires: `**GUIA DE PRESSÕES – NASCAR Next Gen**

📊 **Efeito por pneu:**
• RF maior PSI → Loose
• RR maior PSI → Loose
• LR maior PSI → Tight
• LF maior PSI → Tight

🌡️ **Temperatura:**
• PSI alto = temperatura menor = melhor em altas cargas
• PSI baixo = temperatura maior = melhor em baixas cargas

🎯 **Diagnóstico por temperatura:**
• Borda externa quente = câmbio insuficiente
• Borda interna quente = câmbio excessivo
• Centro quente = pressão muito baixa
• Centro frio = pressão muito alta

⚖️ **Pressão de trabalho ideal:** RF deve ter maior pressão de trabalho num oval balanceado`,

  arb: `**ANTI-ROLL BAR – NASCAR Next Gen**

🔧 **Diâmetros disponíveis:**
• 2.00" = Barra RÍGIDA (mais roll stiffness)
• 1.375" = Barra MACIA (menos roll stiffness)

📐 **Arms (P1 a P5):**
• P1 = Mais macio | P5 = Mais rígido

🔴 **ARB Dianteiro mais rígido →**
• Menos body roll
• Mais grip RF no ápice
• Risco de understeer/tight
• Menos rotação

🔵 **ARB Dianteiro mais macio →**
• Mais body roll
• Mais grip dianteiro dinâmico
• Mais rotação
• Possível loose no apex

**ARB Traseiro:** Similar mas com efeito invertido no equilíbrio`,

  geometry: `**GEOMETRIA – NASCAR Next Gen**

📐 **CÂMBIO (Camber):**
• LF: Positivo (ex: +3.5°) – oval setup
• RF: Negativo (ex: -4.5°) – gera força lateral
• Mais negativo RF = mais rotação = mais loose
• LR/RR: verificar distribuição de desgaste

🔄 **CASTER:**
• RF Caster maior = mais câmbio dinâmico na curva
• Caster split (RF > LF) = mais rotação no giro
• RF Caster+ = mais loose (carro gira mais)

↔️ **TOE:**
• Toe-in (convergente): mais estabilidade
• Toe-out (divergente): mais rotação, menos estável
• LF Toe-in standard em oval
• RR slight toe-in: ajuda straighten on throttle

🎯 **RIDE HEIGHT:**
• RR ride height crítico para o Next Gen (difusor)
• Muito baixo RR = difusor toca = instabilidade`,

  pitstop: `**AJUSTES DE PIT ROAD – NASCAR Next Gen**

⚡ **ORDEM DE PRIORIDADE dos ajustes:**
1. Brake Bias (in-car, instantâneo)
2. Tire PSI (via pressão do pneu novo)
3. Spring Perch Number (mudança de altura)

🔴 **LOOSE ENTRY:** BB +1.0%, LF-1, LR0, RF0, RR-1, LR Spring +0.031, RR +0.031
🔴 **LOOSE CENTER:** BB +1.0%, LF-1, LR0, RF+1, RR-1, LR -0.031, RR +0.031
🔴 **LOOSE EXIT:** Dir+, LF0, LR+1, RF+1, RR-1, LR +0.031, RR +0.031

🔵 **TIGHT ENTRY:** BB -1.0%, LF0, LR-1, RF-1, RR+1, LR -0.031, RR -0.031
🔵 **TIGHT CENTER:** BB -1.0%, LF0, LR-1, RF-1, RR+1, LR +0.031, RR -0.031
🔵 **TIGHT EXIT:** BB -1.0%, LF0, LR-1, RF-1, RR+1, LR 0.000, RR -0.031

⚠️ **NOTA Next Gen:** O Cup Car faz a maior parte do downforce do underbody (difusor). Mudanças de ride height afetam DIRETAMENTE o equilíbrio aerodinâmico. Sempre considere o clearance do difusor.`
};

// ─── AI ENGINEER RESPONSES ─────────────────────────────────────
window.ENGINEER_RESPONSES = {
  greeting: `Olá! Sou seu engenheiro virtual especializado em NASCAR Next Gen para iRacing Class A.

Posso ajudar com:
• 🔧 **Análise e ajuste de setup** – cole seu setup e analisarei cada parâmetro
• 🎯 **Diagnóstico de handling** – descreva o problema e sugiro correções
• 🏟️ **Setup por pista** – recomendações específicas para cada oval
• 📚 **Engenharia aplicada** – explico a física por trás de cada ajuste
• 🔄 **Ajustes de pit stop** – o que mudar e quando durante a corrida

**Como posso ajudar você hoje?** Descreva o comportamento do carro ou selecione uma pista para começar!`,

  unknown: [
    'Interessante questão. Pode detalhar mais sobre o comportamento do carro? Por exemplo: em qual fase da curva ocorre o problema (entrada, centro, saída)?',
    'Entendo. Para dar uma resposta precisa, preciso saber: o problema ocorre em qual tipo de pista? E com que intensidade – nas primeiras voltas ou piora com o tempo?',
    'Vamos analisar isso sistematicamente. Pode me dizer o setup atual que está usando? Assim posso correlacionar com o comportamento descrito.'
  ]
};
