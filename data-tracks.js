// =============================================
//  NASCAR Next Gen – iRacing Oval Track Database
//  data-tracks.js
// =============================================

window.TRACKS_DB = [
  // ─── SUPERSPEEDWAYS ───────────────────────────────────────────
  {
    id: 'daytona',
    name: 'Daytona International Speedway',
    short: 'Daytona',
    location: 'Daytona Beach, FL',
    type: 'superspeedway',
    length: 2.5,
    banking_turns: 31,
    banking_straight: 18,
    surface: 'Asphalt',
    lines: 2,
    abrasiveness: 'medium',
    tire_wear: 'low',
    icon: '🏎️',
    description: 'Superspeedway de 2,5 milhas com alto banking (31°) nas curvas. O drafting é essencial – sozinho não existe velocidade competitiva. A aerodinâmica domina tudo. Corridas caóticas com Big Ones frequentes.',
    characteristics: [
      '⚡ Drafting é obrigatório para competir',
      '🌬️ Aerodinâmica domina sobre mecânica',
      '⚠️ High risk of Big One incidents',
      '🛞 Desgaste de pneus baixo pelo asfalto suave',
      '📏 Duas linhas competitivas: alta e baixa',
      '🔧 Setup de restrictor plate – foco em aero'
    ],
    setup_recommendations: {
      tire_psi: { LF: 26, RF: 26, LR: 24, RR: 24, note: 'Pressões baixas para grip em curvas rápidas' },
      springs: { LF: 600, RF: 600, LR: 200, RR: 225, note: 'Molas traseiras macias para tração em draft' },
      nose_weight: 52.5,
      cross_weight: 50.2,
      brake_bias: 54.0,
      arb_front: 'P3 – 1.375" Macio',
      arb_rear: 'P2 – Soft',
      rf_camber: -4.5,
      lf_camber: 3.8,
      notes: [
        'Prioritize aero balance over mechanical balance',
        'Small spring changes have big effects at this speed',
        'Brake bias less critical – braking zones are minimal',
        'Diffuser clearance CRITICAL – monitor right rear ride height'
      ]
    },
    strategy: 'Ande em pack, economize pneus, pit durante caution. Evite ser último da fila. Posição na reta principal é mais importante que a curva.',
    key_challenges: [
      'Manter posição no draft',
      'Sobreviver ao Big One',
      'Gerenciar temperatura do motor no draft',
      'Balancear frenagem mínima'
    ]
  },
  {
    id: 'talladega',
    name: 'Talladega Superspeedway',
    short: 'Talladega',
    location: 'Talladega, AL',
    type: 'superspeedway',
    length: 2.66,
    banking_turns: 33,
    banking_straight: 18,
    surface: 'Asphalt',
    lines: 2,
    abrasiveness: 'low',
    tire_wear: 'very_low',
    icon: '🏎️',
    description: 'A maior pista do calendário NASCAR (2,66 mi). Banking de 33° nas curvas. Velocidades acima de 200mph em pack. Ainda mais importante o draft do que Daytona.',
    characteristics: [
      '⚡ Velocidade máxima da temporada',
      '🌬️ Draft ainda mais crítico que Daytona',
      '⚠️ Biggest Big One potential on calendar',
      '🛞 Asfalto muito suave – desgaste mínimo',
      '🔧 Setup quase idêntico ao Daytona',
      '📏 3 ou mais linhas possíveis em corrida'
    ],
    setup_recommendations: {
      tire_psi: { LF: 25, RF: 25, LR: 23, RR: 23, note: 'Pressões levemente mais baixas que Daytona' },
      springs: { LF: 550, RF: 600, LR: 200, RR: 200, note: 'Traseiro muito macio para velocidade máxima' },
      nose_weight: 52.0,
      cross_weight: 50.0,
      brake_bias: 53.5,
      arb_front: 'P2 – 1.375" Soft',
      arb_rear: 'P1 – Softest',
      rf_camber: -4.0,
      lf_camber: 3.5,
      notes: [
        'Maximum aerodynamic efficiency is the goal',
        'Very soft rear for low drag and stability',
        'Draft management is race strategy'
      ]
    },
    strategy: 'Fique em pack. Não faça movimentos individuais. Pite apenas em caution. Seja paciente e espere pelo momento certo no final.',
    key_challenges: ['Draft management', 'Sobreviver ao pack', 'Timing da movimentação final']
  },

  // ─── INTERMEDIATES ────────────────────────────────────────────
  {
    id: 'charlotte',
    name: 'Charlotte Motor Speedway',
    short: 'Charlotte',
    location: 'Concord, NC',
    type: 'intermediate',
    length: 1.5,
    banking_turns: 24,
    banking_straight: 5,
    surface: 'Asphalt',
    lines: 2,
    abrasiveness: 'medium-high',
    tire_wear: 'medium-high',
    icon: '🏁',
    description: 'Intermediate clássico de 1,5 milhas com 24° de banking. Muito abrasivo, desgaste significativo no pneu traseiro direito. Duas linhas fortes – alta e baixa.',
    characteristics: [
      '🛞 Alto desgaste RR – gerenciamento crítico',
      '📏 Duas linhas bem definidas',
      '🌬️ Aero importante mas mecânica também',
      '⚖️ Cross weight muito sensível aqui',
      '🔧 Setup de compromisso velocidade/desgaste',
      '📊 Tendência a ficar tight com desgaste'
    ],
    setup_recommendations: {
      tire_psi: { LF: 28, RF: 30, LR: 22, RR: 26, note: 'RF e RR mais altos para controlar calor nas curvas' },
      springs: { LF: 550, RF: 650, LR: 175, RR: 250, note: 'RF mais rígido para estabilidade. LR macio para tração' },
      nose_weight: 52.2,
      cross_weight: 50.5,
      brake_bias: 54.5,
      arb_front: 'P3 – 1.375"',
      arb_rear: 'P3',
      rf_camber: -5.0,
      lf_camber: 4.0,
      notes: [
        'Monitor right rear tire temperature throughout run',
        'RR camber critical – too negative wears outside edge',
        'Spring Perch adjustments effective on pit road',
        'Consider slight tight bias for long run balance'
      ]
    },
    strategy: 'Primeiras 10 voltas setup fraco. Carro fica melhor com borracha na pista. Ajuste para corrida longa – é melhor estar neutro no fim do stints.',
    key_challenges: ['RR tire management', 'Encontrar linha consistente', 'Setup de corrida vs qualificação']
  },
  {
    id: 'las-vegas',
    name: 'Las Vegas Motor Speedway',
    short: 'Las Vegas',
    location: 'Las Vegas, NV',
    type: 'intermediate',
    length: 1.5,
    banking_turns: 20,
    banking_straight: 9,
    surface: 'Asphalt',
    lines: 2,
    abrasiveness: 'medium',
    tire_wear: 'medium',
    icon: '🎰',
    description: 'Intermediate de 1,5 milhas com banking ligeiramente menor (20°). Menos desgaste que Charlotte. Duas linhas competitivas mas a linha baixa dominante.',
    characteristics: [
      '📏 Baixo groove mais dominante',
      '🛞 Desgaste moderado',
      '🌬️ Aero mais crítico que Charlotte',
      '⚖️ Mais tolerante a ajustes',
      '🔧 Mais fácil de encontrar bom setup'
    ],
    setup_recommendations: {
      tire_psi: { LF: 27, RF: 29, LR: 22, RR: 25, note: 'Ligeiramente mais baixo que Charlotte' },
      springs: { LF: 575, RF: 625, LR: 175, RR: 225, note: 'Equilíbrio para duas linhas' },
      nose_weight: 52.0,
      cross_weight: 50.3,
      brake_bias: 54.0,
      arb_front: 'P3 – 1.375"',
      arb_rear: 'P2',
      rf_camber: -4.8,
      lf_camber: 3.8,
      notes: [
        'Slightly lower tire pressures than Charlotte',
        'More forgiving track for setup',
        'Two solid lines – setup for both'
      ]
    },
    strategy: 'Track position importante. Duas linhas fortes permitem ultrapassagens. Foco em consistência.',
    key_challenges: ['Consistência em todas as linhas', 'Não superar desgaste de pneus']
  },
  {
    id: 'michigan',
    name: 'Michigan International Speedway',
    short: 'Michigan',
    location: 'Brooklyn, MI',
    type: 'intermediate',
    length: 2.0,
    banking_turns: 18,
    banking_straight: 12,
    surface: 'Asphalt',
    lines: 2,
    abrasiveness: 'low',
    tire_wear: 'low',
    icon: '🏭',
    description: 'Pista de 2 milhas com curvas largas e banking baixo (18°). Velocidades muito altas – próximo ao nível de superspeedway. Aerodinâmica extremamente importante.',
    characteristics: [
      '⚡ Velocidades muito altas',
      '🌬️ Aerodinâmica dominante',
      '🛞 Baixo desgaste pelo asfalto suave',
      '📏 Linha alta muito competitiva',
      '🔧 Setup similar a superspeedway mas com frenos',
      '⚖️ Pequenas mudanças de pressão têm grande efeito'
    ],
    setup_recommendations: {
      tire_psi: { LF: 27, RF: 28, LR: 22, RR: 24, note: 'Baixas pressões para grip a altas velocidades' },
      springs: { LF: 525, RF: 575, LR: 175, RR: 200, note: 'Molas macias para aero stability' },
      nose_weight: 52.8,
      cross_weight: 50.1,
      brake_bias: 53.5,
      arb_front: 'P2 – 1.375"',
      arb_rear: 'P2',
      rf_camber: -4.2,
      lf_camber: 3.5,
      notes: [
        'Aero balance is critical at Michigan speeds',
        'Diffuser rake angle affects corner speed significantly',
        'Stiffer springs for aero platform stability'
      ]
    },
    strategy: 'Alta velocidade = margem pequena de erro. Seja suave com os controles. Corrida de fôlego.',
    key_challenges: ['Estabilidade aerodinâmica', 'Frenagem precisa nas poucas frenadas', 'Linha alta muito rápida']
  },
  {
    id: 'atlanta',
    name: 'Atlanta Motor Speedway',
    short: 'Atlanta',
    location: 'Hampton, GA',
    type: 'intermediate',
    length: 1.54,
    banking_turns: 24,
    banking_straight: 5,
    surface: 'Asphalt (rough)',
    lines: 3,
    abrasiveness: 'high',
    tire_wear: 'high',
    icon: '🍑',
    description: 'Após reforma, Atlanta se tornou um superspeedway de fato – corridas em pack como Daytona/Talladega mas em 1,54 milhas com asfalto rugoso. Múltiplas linhas.',
    characteristics: [
      '⚡ Novas corridas em pack – drafting crítico',
      '🌬️ Alta velocidade + draft como superspeedway',
      '🛞 Asfalto rugoso – alto desgaste',
      '📏 3 linhas competitivas',
      '⚠️ Bumps em locais específicos',
      '🔧 Setup híbrido entre superspeedway e intermediate'
    ],
    setup_recommendations: {
      tire_psi: { LF: 27, RF: 28, LR: 22, RR: 25, note: 'Equilíbrio entre velocidade e desgaste' },
      springs: { LF: 575, RF: 625, LR: 200, RR: 225, note: 'Molas médias para absorver bumps' },
      nose_weight: 52.3,
      cross_weight: 50.4,
      brake_bias: 54.0,
      arb_front: 'P3 – 1.375"',
      arb_rear: 'P3',
      rf_camber: -4.8,
      lf_camber: 4.0,
      notes: [
        'Draft management like superspeedway',
        'But tire wear is much higher – manage carefully',
        'Stiffer shocks for bumpy surface'
      ]
    },
    strategy: 'Fique no pack como Daytona mas gerencie pneus como Charlotte. Corrida muito imprevisível.',
    key_challenges: ['Draft + tire wear combination', 'Bumps em curvas', 'Múltiplas linhas simultâneas']
  },
  {
    id: 'kansas',
    name: 'Kansas Speedway',
    short: 'Kansas',
    location: 'Kansas City, KS',
    type: 'intermediate',
    length: 1.5,
    banking_turns: 17,
    banking_straight: 9,
    surface: 'Asphalt',
    lines: 2,
    abrasiveness: 'medium',
    tire_wear: 'medium',
    icon: '🌾',
    description: 'Intermediate de 1,5 milhas com banking baixo (17°). Conhecido por ser muito técnico e exigir boa mecânica.',
    characteristics: [
      '🔧 Muito técnico e sensível ao setup',
      '📏 Duas linhas mas compromisso difícil',
      '⚖️ Cross weight muito importante aqui',
      '🛞 Desgaste moderado nas traseiras'
    ],
    setup_recommendations: {
      tire_psi: { LF: 28, RF: 30, LR: 22, RR: 26, note: 'Padrão intermediate' },
      springs: { LF: 575, RF: 650, LR: 175, RR: 250, note: 'RF e RR firmes para estabilidade' },
      nose_weight: 52.4,
      cross_weight: 50.6,
      brake_bias: 54.5,
      arb_front: 'P4 – 1.375"',
      arb_rear: 'P3',
      rf_camber: -5.0,
      lf_camber: 4.0,
      notes: ['Technical track – setup sensitivity is high', 'Cross weight adjustments very effective']
    },
    strategy: 'Qualificação é importante – track position decisivo. Corrida técnica, não de agressividade.',
    key_challenges: ['Setup técnico preciso', 'Cross weight balance', 'Tire management']
  },
  {
    id: 'homestead',
    name: 'Homestead-Miami Speedway',
    short: 'Homestead',
    location: 'Homestead, FL',
    type: 'intermediate',
    length: 1.5,
    banking_turns: 20,
    banking_straight: 5,
    surface: 'Asphalt',
    lines: 2,
    abrasiveness: 'medium-high',
    tire_wear: 'high',
    icon: '🌴',
    description: 'Intermediate de 1,5 milhas com curvas de raio variável (mais tight no entry, mais aberto no exit). Muito abrasivo, especialmente para o pneu traseiro direito.',
    characteristics: [
      '🛞 Alto desgaste RR – gestão é crítica',
      '🔄 Curvas de raio variável – difícil de acertar',
      '🌡️ Calor da Flórida aumenta desgaste',
      '📏 Linha baixa dominante mas alta possível',
      '⚠️ Tight na entrada, melhor na saída'
    ],
    setup_recommendations: {
      tire_psi: { LF: 29, RF: 32, LR: 22, RR: 28, note: 'RR mais alto para controlar desgaste e temperatura' },
      springs: { LF: 600, RF: 700, LR: 200, RR: 275, note: 'Molas mais firmes para controlar rolagem e desgaste' },
      nose_weight: 52.5,
      cross_weight: 50.8,
      brake_bias: 55.0,
      arb_front: 'P4 – 1.375"',
      arb_rear: 'P4',
      rf_camber: -5.5,
      lf_camber: 4.2,
      notes: [
        'RR tire management is THE priority at Homestead',
        'Slightly tight setup protects RR tire',
        'Monitor RR temperature – back off if overheating'
      ]
    },
    strategy: 'Corrida de pneus. Pace não é tudo – sobreviver 30+ voltas com pneus é o objetivo. Setup levemente tight para preservar RR.',
    key_challenges: ['RR tire survival', 'Curvas de raio variável', 'Heat management']
  },
  {
    id: 'texas',
    name: 'Texas Motor Speedway',
    short: 'Texas',
    location: 'Fort Worth, TX',
    type: 'intermediate',
    length: 1.5,
    banking_turns: 20,
    banking_straight: 5,
    surface: 'Asphalt',
    lines: 2,
    abrasiveness: 'medium',
    tire_wear: 'medium-high',
    icon: '🤠',
    description: 'Intermediate de 1,5 milhas similar a Charlotte. Conhecido pelos bumps na curva 1 e pelo asfalto que cria muita borracha no groove.',
    characteristics: [
      '⚠️ Bumps pronunciados na curva 1',
      '🛞 Borracha acumula rápido no groove',
      '📏 Linha baixa muito mais rápida',
      '🔧 Shocks de alta velocidade críticos nos bumps'
    ],
    setup_recommendations: {
      tire_psi: { LF: 28, RF: 30, LR: 22, RR: 26, note: 'Similar a Charlotte' },
      springs: { LF: 575, RF: 650, LR: 200, RR: 250, note: 'Firme para controlar bumps' },
      nose_weight: 52.2,
      cross_weight: 50.4,
      brake_bias: 54.5,
      arb_front: 'P3 – 1.375"',
      arb_rear: 'P3',
      rf_camber: -5.0,
      lf_camber: 4.0,
      notes: ['HS shock settings critical for bumps on T1', 'Rubber build-up changes balance during race']
    },
    strategy: 'Track position com borracha no groove. Carro fica melhor ao longo da corrida com borracha acumulando.',
    key_challenges: ['Bumps na curva 1', 'Rubber build-up', 'Consistência de setup']
  },

  // ─── SHORT TRACKS ─────────────────────────────────────────────
  {
    id: 'bristol',
    name: 'Bristol Motor Speedway',
    short: 'Bristol',
    location: 'Bristol, TN',
    type: 'short',
    length: 0.533,
    banking_turns: 28,
    banking_straight: 6,
    surface: 'Concrete',
    lines: 2,
    abrasiveness: 'high',
    tire_wear: 'very_high',
    icon: '🥊',
    description: 'Short track de 0,533 milhas com 28° de banking em concreto. Corridas de contato, muito abrasivas, desgaste extremo de pneus. Altíssimo nível de ação.',
    characteristics: [
      '🥊 Contato é parte da corrida em Bristol',
      '🛞 Desgaste extremo de pneus – estratégia crucial',
      '🔄 Rotação rápida do carro necessária',
      '⚡ Muito pouco tempo para reações',
      '📏 Linha alta e baixa ambas competitivas',
      '🔧 Setup de grip mecânico máximo'
    ],
    setup_recommendations: {
      tire_psi: { LF: 30, RF: 35, LR: 24, RR: 30, note: 'RR muito alto para aguentar o concreto abrasivo' },
      springs: { LF: 800, RF: 900, LR: 250, RR: 350, note: 'Molas muito firmes para curvas de alta rotação' },
      nose_weight: 51.5,
      cross_weight: 51.0,
      brake_bias: 56.0,
      arb_front: 'P5 – 2.00" Stiff',
      arb_rear: 'P4',
      rf_camber: -6.0,
      lf_camber: 4.5,
      notes: [
        'Maximum front brake bias for short track corner entry',
        'Stiff ARB for quick rotation',
        'Harder springs for concrete surface impacts',
        'RR tire temperature control is critical'
      ]
    },
    strategy: 'Gerenciar pneus ENQUANTO mantém posição. Pit strategy é quase tudo. Defenda sua posição mas economize pneus.',
    key_challenges: ['Extreme tire wear', 'Contact racing', 'Pit strategy', 'Quick rotation']
  },
  {
    id: 'martinsville',
    name: 'Martinsville Speedway',
    short: 'Martinsville',
    location: 'Ridgeway, VA',
    type: 'short',
    length: 0.526,
    banking_turns: 12,
    banking_straight: 0,
    surface: 'Asphalt',
    lines: 1,
    abrasiveness: 'medium',
    tire_wear: 'high',
    icon: '📎',
    description: 'A mais antiga pista do calendário (0,526 mi). Banking baixíssimo (12°) nas curvas e retas planas. Definida pelas frenagens brutais com uso intenso dos freios.',
    characteristics: [
      '🛑 Frenagens extremas – freios sob grande stress',
      '📏 Apenas uma linha competitiva (interna)',
      '🔧 Grip mecânico domina completamente',
      '⚖️ Cross weight e wedge muito sensíveis',
      '🌡️ Temperatura de freios é crítica',
      '🥊 Contato inevitável – bumping na entrada'
    ],
    setup_recommendations: {
      tire_psi: { LF: 32, RF: 38, LR: 24, RR: 32, note: 'Altas pressões para freios e curvas lentas' },
      springs: { LF: 1000, RF: 1100, LR: 300, RR: 400, note: 'Molas muito rígidas para as frenagens bruscas' },
      nose_weight: 51.0,
      cross_weight: 51.5,
      brake_bias: 58.0,
      arb_front: 'P5 – 2.00"',
      arb_rear: 'P5',
      rf_camber: -6.5,
      lf_camber: 5.0,
      notes: [
        'MAXIMUM brake bias forward for hard braking zones',
        'Very stiff springs for aggressive corner entry',
        'Brake cooling is a concern – monitor brake temps',
        'One groove track – track position is everything'
      ]
    },
    strategy: 'Posição na pista é tudo. Boas pit stops são a diferença entre ganhar e perder. Seja agressivo nas frenadas.',
    key_challenges: ['Brake management', 'Track position', 'Contact racing', 'One-groove difficulty']
  },
  {
    id: 'richmond',
    name: 'Richmond Raceway',
    short: 'Richmond',
    location: 'Richmond, VA',
    type: 'short',
    length: 0.75,
    banking_turns: 14,
    banking_straight: 8,
    surface: 'Asphalt',
    lines: 2,
    abrasiveness: 'medium-high',
    tire_wear: 'high',
    icon: '🎸',
    description: 'Short track de 0,75 milhas com formato oval-D. Banking baixo (14°) mas duas linhas possíveis. Mix entre grip mecânico e alguma aerodinâmica.',
    characteristics: [
      '📏 Duas linhas competitivas',
      '🛞 Alto desgaste – stint curto',
      '🔧 Equilíbrio entre mecânica e aero',
      '⚖️ Caster muito sensível aqui'
    ],
    setup_recommendations: {
      tire_psi: { LF: 31, RF: 36, LR: 23, RR: 30, note: 'Pressões médias-altas' },
      springs: { LF: 700, RF: 800, LR: 225, RR: 300, note: 'Firme mas não extremo' },
      nose_weight: 51.8,
      cross_weight: 50.8,
      brake_bias: 56.5,
      arb_front: 'P4 – 1.375"',
      arb_rear: 'P4',
      rf_camber: -5.8,
      lf_camber: 4.5,
      notes: ['Two lines available – setup for versatility', 'Caster split important for turn-in']
    },
    strategy: 'Corrida de estratégia com múltiplos stints. Duas linhas permitem ultrapassagens.',
    key_challenges: ['Tire management', 'Multi-line racing', 'Pit strategy']
  },

  // ─── FLAT / MISC ──────────────────────────────────────────────
  {
    id: 'pocono',
    name: 'Pocono Raceway',
    short: 'Pocono',
    location: 'Long Pond, PA',
    type: 'flat',
    length: 2.5,
    banking_turns: '14°/8°/6°',
    banking_straight: 0,
    surface: 'Asphalt',
    lines: 1,
    abrasiveness: 'medium',
    tire_wear: 'medium',
    icon: '🔺',
    description: 'Pista triangular única de 2,5 milhas com TRÊS curvas diferentes. A Curva 1 (Turn 1 – Pocono Turn) tem 14°, Curva 2 tem 8°, Curva 3 (Short Shot) tem 6°. Exige compromisso radical no setup.',
    characteristics: [
      '🔺 Três curvas completamente diferentes',
      '🔧 Setup é um COMPROMISSO entre três curvas',
      '⚖️ Sem configuração perfeita – apenas trade-offs',
      '📏 Uma linha por curva – sem alternativas',
      '🌬️ Aero mais importante nas retas longas',
      '⚡ Turno 1 é o mais importante – priorize-o'
    ],
    setup_recommendations: {
      tire_psi: { LF: 27, RF: 29, LR: 21, RR: 24, note: 'Balanceado para 3 curvas diferentes' },
      springs: { LF: 550, RF: 600, LR: 180, RR: 225, note: 'Compromisso para todas as curvas' },
      nose_weight: 52.0,
      cross_weight: 50.2,
      brake_bias: 54.2,
      arb_front: 'P3 – 1.375"',
      arb_rear: 'P2',
      rf_camber: -4.5,
      lf_camber: 3.8,
      notes: [
        'Turn 1 is highest speed – prioritize for setup',
        'Turn 2 (flat) needs maximum mechanical grip',
        'Turn 3 (short shot) – quick rotation needed',
        'No perfect setup – it\'s all about compromise'
      ]
    },
    strategy: 'Foco em Turn 1 para velocidade. Seja suave em Turn 2 (flat) para não perder controle. Turn 3 é onde se faz a ultrapassagem.',
    key_challenges: ['Setup compromise para 3 curvas', 'Turn 2 com baixo banking', 'Gerenciar os trade-offs']
  },
  {
    id: 'iowa',
    name: 'Iowa Speedway',
    short: 'Iowa',
    location: "Newton, IA",
    type: 'flat',
    length: 0.875,
    banking_turns: 14,
    banking_straight: 4,
    surface: 'Asphalt',
    lines: 2,
    abrasiveness: 'medium',
    tire_wear: 'medium-high',
    icon: '🌽',
    description: 'Short oval de 0,875 milhas com banking baixo (14°). Muito técnico, precisa de rotação rápida do carro. Duas linhas possíveis.',
    characteristics: [
      '🔧 Muito técnico e preciso',
      '🔄 Rotação rápida necessária',
      '📏 Duas linhas mas low groove preferencial',
      '⚖️ Brake bias muito sensitivo'
    ],
    setup_recommendations: {
      tire_psi: { LF: 30, RF: 35, LR: 23, RR: 28, note: 'Pressões médias-altas para grip' },
      springs: { LF: 750, RF: 850, LR: 225, RR: 300, note: 'Firme para rotação rápida' },
      nose_weight: 51.5,
      cross_weight: 51.0,
      brake_bias: 57.0,
      arb_front: 'P4 – 1.375"',
      arb_rear: 'P4',
      rf_camber: -6.0,
      lf_camber: 4.5,
      notes: ['High brake bias needed for short turn radius', 'Quick rotation essential at Iowa']
    },
    strategy: 'Posição na pista crítica. Rotação do carro é a chave para ganhar posições.',
    key_challenges: ['Rotação rápida', 'Track position', 'Low banking com curvas rápidas']
  },
  {
    id: 'new-hampshire',
    name: 'New Hampshire Motor Speedway',
    short: 'New Hampshire',
    location: 'Loudon, NH',
    type: 'flat',
    length: 1.058,
    banking_turns: 12,
    banking_straight: 2,
    surface: 'Asphalt',
    lines: 1,
    abrasiveness: 'medium',
    tire_wear: 'high',
    icon: '🗺️',
    description: 'Oval de 1 milha com banking muito baixo (12°). Apelido "The Magic Mile". Exige muito da mecânica do carro.',
    characteristics: [
      '📏 Uma linha – track position everything',
      '🔧 Grip mecânico domina',
      '⚖️ Caster e camber muito importantes',
      '🛞 Alto desgaste apesar do tamanho'
    ],
    setup_recommendations: {
      tire_psi: { LF: 31, RF: 37, LR: 23, RR: 31, note: 'Altas pressões para curvas técnicas' },
      springs: { LF: 800, RF: 900, LR: 250, RR: 325, note: 'Firme para low banking' },
      nose_weight: 51.5,
      cross_weight: 51.2,
      brake_bias: 56.5,
      arb_front: 'P5 – 2.00"',
      arb_rear: 'P4',
      rf_camber: -6.5,
      lf_camber: 5.0,
      notes: ['Stiff ARB for roll control on flat track', 'Maximum mechanical grip setup']
    },
    strategy: 'One-groove racing – posição é tudo. Qualificação decisiva para resultado final.',
    key_challenges: ['One groove', 'Grip mecânico máximo', 'Tire wear']
  },
  {
    id: 'phoenix',
    name: 'Phoenix Raceway',
    short: 'Phoenix',
    location: 'Avondale, AZ',
    type: 'flat',
    length: 1.0,
    banking_turns: '11°/9°',
    banking_straight: 3,
    surface: 'Asphalt',
    lines: 2,
    abrasiveness: 'medium-high',
    tire_wear: 'high',
    icon: '🌵',
    description: 'Oval "D-shape" de 1 milha com banking variável. Turn 1 e 2 têm 11° e Turns 3 e 4 têm 9°. Muito técnico, setup é crítico. Sede da final do Campeonato NASCAR.',
    characteristics: [
      '🏆 Sede do Title Decider final',
      '🔄 D-shape assimétrico – compromisso complexo',
      '🔧 Setup técnico de precisão',
      '⚖️ Cross weight altamente sensitivo',
      '📏 Duas linhas principalmente nas saídas'
    ],
    setup_recommendations: {
      tire_psi: { LF: 31, RF: 36, LR: 23, RR: 30, note: 'Altas pressões para curvas técnicas' },
      springs: { LF: 750, RF: 850, LR: 225, RR: 300, note: 'Firme para controle em banking baixo' },
      nose_weight: 51.8,
      cross_weight: 51.0,
      brake_bias: 56.0,
      arb_front: 'P4 – 2.00"',
      arb_rear: 'P4',
      rf_camber: -6.2,
      lf_camber: 4.8,
      notes: ['D-shape requires different setup for each end', 'Cross weight critical at Phoenix', 'Two tire compounds sometimes used']
    },
    strategy: 'Qualificação e posição de pit são cruciais. Setup de corrida de longa distância com muitas estratégias possíveis.',
    key_challenges: ['D-shape assymetry', 'Long race management', 'Complex pit strategy']
  }
];

// Track filter function
window.getTracksByType = function(type) {
  if (type === 'all') return window.TRACKS_DB;
  return window.TRACKS_DB.filter(t => t.type === type);
};

window.getTrackById = function(id) {
  return window.TRACKS_DB.find(t => t.id === id);
};
