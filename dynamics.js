// =============================================
//  NASCAR Next Gen – Dynamics Visualizations
//  dynamics.js
// =============================================

window.DYNAMICS_CONTENT = {

  weight: `
<div class="dynamics-panel">
  <h3 class="dyn-card-title" style="margin-bottom:1.5rem">⚖️ Transferência de Peso Longitudinal e Lateral</h3>
  <div class="dynamics-grid">
    <div class="dyn-card">
      <div class="dyn-card-title">Transferência Longitudinal (Frenagem/Aceleração)</div>
      <div class="force-diagram">
        <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
          <!-- Car top view -->
          <rect x="60" y="40" width="200" height="100" rx="15" fill="#1a1a28" stroke="#e8a000" stroke-width="2"/>
          <!-- Front axle -->
          <line x1="60" y1="65" x2="260" y2="65" stroke="#555" stroke-width="1" stroke-dasharray="3,3"/>
          <!-- Rear axle -->
          <line x1="60" y1="115" x2="260" y2="115" stroke="#555" stroke-width="1" stroke-dasharray="3,3"/>
          <!-- Front tires -->
          <rect x="40" y="50" width="25" height="35" rx="4" fill="#444" stroke="#888" stroke-width="1.5"/>
          <rect x="255" y="50" width="25" height="35" rx="4" fill="#444" stroke="#888" stroke-width="1.5"/>
          <!-- Rear tires -->
          <rect x="40" y="100" width="25" height="35" rx="4" fill="#444" stroke="#888" stroke-width="1.5"/>
          <rect x="255" y="100" width="25" height="35" rx="4" fill="#444" stroke="#888" stroke-width="1.5"/>
          <!-- CG point -->
          <circle cx="160" cy="90" r="8" fill="#e8a000" opacity="0.8"/>
          <text x="170" y="87" fill="#e8a000" font-size="9">CG</text>
          <!-- Braking arrow -->
          <text x="100" y="175" fill="#ff4444" font-size="10" text-anchor="middle">⬅️ FRENAGEM</text>
          <text x="100" y="188" fill="#ff4444" font-size="8" text-anchor="middle">Carga vai para frente</text>
          <!-- Accel arrow -->
          <text x="220" y="175" fill="#00d26a" font-size="10" text-anchor="middle">ACELERAÇÃO ➡️</text>
          <text x="220" y="188" fill="#00d26a" font-size="8" text-anchor="middle">Carga vai para trás</text>
          <!-- Front load indicator - braking -->
          <circle cx="52" cy="67" r="5" fill="#ff4444" opacity="0.7"/>
          <circle cx="267" cy="67" r="5" fill="#ff4444" opacity="0.7"/>
          <!-- Rear load indicator - accel -->
          <circle cx="52" cy="117" r="5" fill="#00d26a" opacity="0.7"/>
          <circle cx="267" cy="117" r="5" fill="#00d26a" opacity="0.7"/>
        </svg>
      </div>
      <div style="padding:0.8rem; font-size:0.8rem; color:var(--text-secondary); line-height:1.6">
        <p>🔴 <strong style="color:var(--loose)">Frenagem:</strong> Transfere peso para <strong>frente</strong>. Dianteiros carregam mais, traseiros aliviam. Setup: mola RF mais firme para resistir à compressão.</p>
        <p style="margin-top:0.5rem">🟢 <strong style="color:var(--green)">Aceleração:</strong> Transfere peso para <strong>trás</strong>. Traseiros carregam mais. Setup: molas traseiras macias para manter contato e tração.</p>
      </div>
    </div>

    <div class="dyn-card">
      <div class="dyn-card-title">Transferência Lateral (Curvas)</div>
      <div class="force-diagram">
        <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
          <!-- Car front view -->
          <rect x="80" y="50" width="160" height="90" rx="12" fill="#1a1a28" stroke="#e8a000" stroke-width="2"/>
          <!-- Left tires -->
          <rect x="45" y="115" width="40" height="18" rx="4" fill="#444" stroke="#888" stroke-width="1.5"/>
          <!-- Right tires -->
          <rect x="235" y="115" width="40" height="18" rx="4" fill="#888" stroke="#ccc" stroke-width="2"/>
          <!-- CG height line -->
          <line x1="80" y1="70" x2="240" y2="70" stroke="#e8a000" stroke-width="1" stroke-dasharray="4,2"/>
          <!-- Roll center -->
          <circle cx="160" cy="125" r="5" fill="#3a8dff"/>
          <text x="168" y="128" fill="#3a8dff" font-size="8">RC</text>
          <!-- CG -->
          <circle cx="160" cy="70" r="7" fill="#e8a000"/>
          <text x="168" y="68" fill="#e8a000" font-size="8">CG</text>
          <!-- Lateral force arrow -->
          <path d="M160,70 L100,70" stroke="#ff4444" stroke-width="2" marker-end="url(#arrowL)"/>
          <!-- Load on RH tires indicator -->
          <text x="248" y="112" fill="#e8a000" font-size="10" text-anchor="middle">ALTA</text>
          <text x="65" y="112" fill="#555" font-size="10" text-anchor="middle">BAIXA</text>
          <!-- Labels -->
          <text x="160" y="192" fill="#3a8dff" font-size="9" text-anchor="middle">Numa curva esquerda (oval): Mais carga no LADO DIREITO</text>
        </svg>
      </div>
      <div style="padding:0.8rem; font-size:0.8rem; color:var(--text-secondary); line-height:1.6">
        <p>↪️ <strong style="color:var(--gold)">Curva esquerda (oval):</strong> Carga lateral transfere para os pneus <strong>direitos</strong>. RF e RR carregam mais.</p>
        <p style="margin-top:0.5rem">🔧 <strong style="color:var(--gold)">Por isso:</strong> RF e RR são os pneus mais críticos num oval. Pressões mais altas neles, câmbio negativo no RF para maximizar área de contato sob carga.</p>
      </div>
    </div>

    <div class="dyn-card">
      <div class="dyn-card-title">Cross Weight & Distribuição de Carga</div>
      <div style="padding:0.5rem">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-bottom:1rem">
          <div style="background:var(--bg-primary); border:1px solid var(--border); border-radius:6px; padding:0.8rem; text-align:center">
            <div style="font-size:0.68rem; color:var(--text-dim); margin-bottom:0.3rem">CROSS WEIGHT ALTO (>50%)</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.2rem">
              <div style="background:rgba(232,160,0,0.15); border:1px solid var(--gold); border-radius:3px; padding:0.4rem; font-size:0.7rem; color:var(--gold)">LF<br>ALTA</div>
              <div style="background:rgba(0,210,106,0.15); border:1px solid var(--green); border-radius:3px; padding:0.4rem; font-size:0.7rem; color:var(--green)">RF<br>ALTA</div>
              <div style="background:rgba(0,210,106,0.15); border:1px solid var(--green); border-radius:3px; padding:0.4rem; font-size:0.7rem; color:var(--green)">LR<br>ALTA</div>
              <div style="background:rgba(232,160,0,0.1); border:1px solid var(--border); border-radius:3px; padding:0.4rem; font-size:0.7rem; color:var(--text-dim)">RR<br>BAIXA</div>
            </div>
            <div style="font-size:0.7rem; color:var(--gold); margin-top:0.4rem">→ Mais Tight</div>
          </div>
          <div style="background:var(--bg-primary); border:1px solid var(--border); border-radius:6px; padding:0.8rem; text-align:center">
            <div style="font-size:0.68rem; color:var(--text-dim); margin-bottom:0.3rem">CROSS WEIGHT BAIXO (<50%)</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.2rem">
              <div style="background:rgba(255,58,58,0.1); border:1px solid var(--loose-border); border-radius:3px; padding:0.4rem; font-size:0.7rem; color:var(--loose)">LF<br>BAIXA</div>
              <div style="background:rgba(255,58,58,0.1); border:1px solid var(--loose-border); border-radius:3px; padding:0.4rem; font-size:0.7rem; color:var(--loose)">RF<br>BAIXA</div>
              <div style="background:rgba(255,58,58,0.1); border:1px solid var(--loose-border); border-radius:3px; padding:0.4rem; font-size:0.7rem; color:var(--loose)">LR<br>BAIXA</div>
              <div style="background:rgba(0,210,106,0.15); border:1px solid var(--green); border-radius:3px; padding:0.4rem; font-size:0.7rem; color:var(--green)">RR<br>ALTA</div>
            </div>
            <div style="font-size:0.7rem; color:var(--loose); margin-top:0.4rem">→ Mais Loose</div>
          </div>
        </div>
        <div style="font-size:0.78rem; color:var(--text-secondary); line-height:1.5; background:var(--bg-primary); border-radius:4px; padding:0.7rem; border-left:3px solid var(--gold)">
          <strong style="color:var(--gold)">Cross Weight</strong> = (LR + RF) / Total × 100%. Valores acima de 50% = mais carga no diagonal LR-RF = mais tight. Ajustar via Spring Collar/Perch nas rodas LR e RR no pit.
        </div>
      </div>
    </div>

    <div class="dyn-card">
      <div class="dyn-card-title">Nose Weight & Equilíbrio Dianteiro/Traseiro</div>
      <div style="padding:0.5rem">
        <div class="balance-indicator" style="margin-bottom:0.8rem">
          <div class="bi-label">Nose Weight</div>
          <div class="bi-bar-container" style="height:12px">
            <div class="bi-bar" style="width:52%; background:var(--gold)"></div>
          </div>
          <div class="bi-value" style="color:var(--gold)">52%</div>
        </div>
        <div style="font-size:0.78rem; color:var(--text-secondary); line-height:1.6">
          <div style="margin-bottom:0.6rem; padding:0.5rem 0.7rem; background:var(--bg-primary); border-radius:4px; border-left:3px solid var(--green)">
            <strong style="color:var(--green)">Nose Weight ALTO (>52%):</strong> Mais estabilidade direcional. Melhor para pistas de alta velocidade (Michigan, Daytona) onde aerodinâmica domina. O carro mantém a linha melhor.
          </div>
          <div style="margin-bottom:0.6rem; padding:0.5rem 0.7rem; background:var(--bg-primary); border-radius:4px; border-left:3px solid var(--tight)">
            <strong style="color:var(--tight)">Nose Weight BAIXO (<51%):</strong> Mais rotação. Melhor para short tracks (Bristol, Martinsville) onde girar rapidamente é necessário. Traseira pode soltar mais fácil.
          </div>
          <div style="padding:0.5rem 0.7rem; background:var(--bg-primary); border-radius:4px; border-left:3px solid var(--gold)">
            <strong style="color:var(--gold)">Intermediates:</strong> 51.5-52.5% é a faixa ideal. Equilíbrio entre rotação e estabilidade.
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`,

  springs: `
<div class="dynamics-panel">
  <h3 class="dyn-card-title" style="margin-bottom:1.5rem">🌀 Molas & Anti-Roll Bar</h3>
  <div class="dynamics-grid">
    <div class="dyn-card">
      <div class="dyn-card-title">Como as Molas Afetam o Handling</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; padding:0.5rem">
        <div style="background:var(--bg-primary); border-radius:6px; padding:0.8rem; border:1px solid var(--border)">
          <div style="font-size:0.75rem; font-weight:700; color:var(--loose); margin-bottom:0.5rem">🔴 DEIXA LOOSE</div>
          <div style="font-size:0.78rem; color:var(--text-secondary); line-height:1.7">
            LF <strong>mais rígida</strong><br>
            RF <strong>mais macia</strong><br>
            LR <strong>mais macia</strong><br>
            RR <strong>mais rígida</strong><br>
            <span style="color:var(--text-dim); font-size:0.72rem">Traseiras rígidas → Loose</span>
          </div>
        </div>
        <div style="background:var(--bg-primary); border-radius:6px; padding:0.8rem; border:1px solid var(--border)">
          <div style="font-size:0.75rem; font-weight:700; color:var(--tight); margin-bottom:0.5rem">🔵 DEIXA TIGHT</div>
          <div style="font-size:0.78rem; color:var(--text-secondary); line-height:1.7">
            LF <strong>mais macia</strong><br>
            RF <strong>mais rígida</strong><br>
            LR <strong>mais rígida</strong><br>
            RR <strong>mais macia</strong><br>
            <span style="color:var(--text-dim); font-size:0.72rem">Dianteiras rígidas → Tight</span>
          </div>
        </div>
      </div>
      <div style="padding:0.8rem; background:var(--bg-primary); margin:0.5rem; border-radius:4px; border-left:3px solid var(--gold); font-size:0.78rem; color:var(--text-secondary)">
        <strong style="color:var(--gold)">💡 Princípio:</strong> Molas mais rígidas transferem carga mais rápido. Lado com mola rígida = mais grip = equilíbrio para aquele lado. Lado com mola macia = mais flex = mais grip mas mais movimento.
      </div>
    </div>

    <div class="dyn-card">
      <div class="dyn-card-title">Anti-Roll Bar (ARB / Sway Bar)</div>
      <div style="padding:0.5rem">
        <div class="force-diagram" style="margin-bottom:0.8rem">
          <svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg">
            <!-- ARB Stiff scenario -->
            <text x="80" y="15" fill="#e8a000" font-size="10" text-anchor="middle">ARB RÍGIDO</text>
            <!-- Car outline -->
            <rect x="20" y="25" width="120" height="60" rx="8" fill="#1a1a28" stroke="#555" stroke-width="1"/>
            <!-- Stiff ARB - less roll -->
            <rect x="5" y="55" width="18" height="40" rx="3" fill="#888" stroke="#aaa" stroke-width="1.5"/>
            <rect x="137" y="45" width="18" height="40" rx="3" fill="#e8a000" stroke="#ffd700" stroke-width="2"/>
            <text x="5" y="105" fill="#888" font-size="8">LF</text>
            <text x="137" y="105" fill="#e8a000" font-size="8">RF (carga)</text>
            <text x="80" y="120" fill="#ff4444" font-size="9" text-anchor="middle">→ Menos rolagem → Tight</text>

            <!-- ARB Soft scenario -->
            <text x="240" y="15" fill="#e8a000" font-size="10" text-anchor="middle">ARB MACIO</text>
            <rect x="180" y="25" width="120" height="60" rx="8" fill="#1a1a28" stroke="#555" stroke-width="1"/>
            <!-- Soft ARB - more roll -->
            <rect x="165" y="50" width="18" height="45" rx="3" fill="#555" stroke="#888" stroke-width="1"/>
            <rect x="297" y="42" width="18" height="55" rx="3" fill="#3a8dff" stroke="#6ab" stroke-width="2"/>
            <text x="165" y="105" fill="#555" font-size="8">LF</text>
            <text x="297" y="105" fill="#3a8dff" font-size="8">RF+</text>
            <text x="240" y="120" fill="#00d26a" font-size="9" text-anchor="middle">→ Mais rolagem → Mais grip RF</text>
          </svg>
        </div>
        <div style="font-size:0.78rem; color:var(--text-secondary); line-height:1.6">
          <div style="margin-bottom:0.5rem; padding:0.4rem 0.7rem; background:var(--bg-primary); border-radius:4px; border-left:3px solid var(--loose)">
            <strong style="color:var(--loose)">ARB RÍGIDO (2.00"):</strong> Reduz body roll → menos carga no RF no ápice → tende para <strong>Tight</strong>. Melhor para pistas lisas com grip mecânico.
          </div>
          <div style="padding:0.4rem 0.7rem; background:var(--bg-primary); border-radius:4px; border-left:3px solid var(--tight)">
            <strong style="color:var(--tight)">ARB MACIO (1.375"):</strong> Permite mais body roll → mais carga no RF → tende para <strong>Loose</strong>. Arms P1-P5 permitem ajuste fino.
          </div>
        </div>
      </div>
    </div>

    <div class="dyn-card" style="grid-column: 1 / -1">
      <div class="dyn-card-title">Stagger – Diferença de Circunferência Entre Pneus</div>
      <div style="display:grid; grid-template-columns:1fr 2fr; gap:1rem; padding:0.5rem">
        <div class="force-diagram">
          <svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
            <!-- Track curve -->
            <path d="M20,130 Q100,10 180,130" stroke="#555" stroke-width="2" fill="none" stroke-dasharray="5,3"/>
            <!-- Left rear (smaller) -->
            <ellipse cx="60" cy="110" rx="15" ry="18" fill="none" stroke="#3a8dff" stroke-width="2"/>
            <text x="60" y="135" fill="#3a8dff" font-size="9" text-anchor="middle">LR menor</text>
            <!-- Right rear (bigger) -->
            <ellipse cx="140" cy="110" rx="20" ry="24" fill="none" stroke="#e8a000" stroke-width="2"/>
            <text x="140" y="140" fill="#e8a000" font-size="9" text-anchor="middle">RR maior</text>
            <!-- Stagger arrow -->
            <text x="100" y="60" fill="#00d26a" font-size="9" text-anchor="middle">Stagger ⬆️</text>
            <text x="100" y="75" fill="#888" font-size="8" text-anchor="middle">= mais rotação</text>
          </svg>
        </div>
        <div style="font-size:0.78rem; color:var(--text-secondary); line-height:1.6">
          <p><strong style="color:var(--gold)">Stagger</strong> = diferença de circunferência entre RR e LR. Em ovais, o RR é maior que o LR.</p>
          <p style="margin-top:0.5rem">📐 <strong>Mais stagger:</strong> RR girando mais rápido que LR → carro tende a girar para esquerda → <span style="color:var(--loose)">mais loose</span> na aceleração, melhor rotação no centro.</p>
          <p style="margin-top:0.5rem">📐 <strong>Menos stagger:</strong> RR e LR mais iguais → carro vai mais reto → <span style="color:var(--tight)">mais tight</span> na aceleração, mais estável.</p>
          <p style="margin-top:0.5rem">⚙️ <strong>Banking da pista:</strong> Mais banking = mais stagger necessário (fórmula: Stagger = 2π × track_width × tan(banking_angle)).</p>
        </div>
      </div>
    </div>
  </div>
</div>
`,

  shocks: `
<div class="dynamics-panel">
  <h3 class="dyn-card-title" style="margin-bottom:1.5rem">🔩 Amortecedores – Compressão e Rebound</h3>
  <div class="dynamics-grid">
    <div class="dyn-card">
      <div class="dyn-card-title">LS vs HS Compression/Rebound</div>
      <div style="padding:0.5rem">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-bottom:0.8rem">
          <div style="background:var(--bg-primary); border-radius:5px; padding:0.8rem; border:1px solid var(--border)">
            <div style="font-size:0.72rem; font-weight:700; color:var(--gold); margin-bottom:0.4rem">LS (Low Speed)</div>
            <div style="font-size:0.75rem; color:var(--text-secondary); line-height:1.5">Velocidade do eixo <strong>&lt;1.5 in/s</strong><br>Controla movimentos do <strong>chassis</strong><br>Reação a inputs do piloto<br>Roll, pitch, yaw gradual</div>
          </div>
          <div style="background:var(--bg-primary); border-radius:5px; padding:0.8rem; border:1px solid var(--border)">
            <div style="font-size:0.72rem; font-weight:700; color:var(--gold); margin-bottom:0.4rem">HS (High Speed)</div>
            <div style="font-size:0.75rem; color:var(--text-secondary); line-height:1.5">Velocidade do eixo <strong>&gt;1.5 in/s</strong><br>Controla <strong>impactos</strong><br>Bumps, curbs<br>Reações instantâneas</div>
          </div>
        </div>
        <div style="font-size:0.78rem; color:var(--text-secondary); line-height:1.5; background:var(--bg-primary); border-radius:4px; padding:0.7rem; border-left:3px solid var(--gold)">
          <strong style="color:var(--gold)">Slope (HS Comp/Reb Slope):</strong><br>
          • Alta slope = curva de amortecimento mais linear (bom para bumps)<br>
          • Baixa slope = curva digressive (bom para pistas lisas – mais conforto)
        </div>
      </div>
    </div>

    <div class="dyn-card">
      <div class="dyn-card-title">Efeito dos Amortecedores no Handling</div>
      <table style="width:100%; border-collapse:collapse; font-size:0.75rem">
        <thead>
          <tr style="background:#1a1a28; color:var(--gold)">
            <th style="padding:0.4rem; text-align:left; border-bottom:2px solid var(--border-accent)">Choque</th>
            <th style="padding:0.4rem; text-align:center; border-bottom:2px solid var(--border-accent)">Mais alto →</th>
            <th style="padding:0.4rem; text-align:center; border-bottom:2px solid var(--border-accent)">Mais baixo →</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid var(--border)">
            <td style="padding:0.4rem; color:var(--text-primary)">LF Bump</td>
            <td style="padding:0.4rem; text-align:center; color:var(--tight)">Tight Entry</td>
            <td style="padding:0.4rem; text-align:center; color:var(--loose)">Loose Entry</td>
          </tr>
          <tr style="border-bottom:1px solid var(--border)">
            <td style="padding:0.4rem; color:var(--text-primary)">RF Bump</td>
            <td style="padding:0.4rem; text-align:center; color:var(--tight)">Tight Entry</td>
            <td style="padding:0.4rem; text-align:center; color:var(--loose)">Loose Entry</td>
          </tr>
          <tr style="border-bottom:1px solid var(--border)">
            <td style="padding:0.4rem; color:var(--text-primary)">LF Rebound</td>
            <td style="padding:0.4rem; text-align:center; color:var(--tight)">Tight Exit</td>
            <td style="padding:0.4rem; text-align:center; color:var(--loose)">Loose Exit</td>
          </tr>
          <tr style="border-bottom:1px solid var(--border)">
            <td style="padding:0.4rem; color:var(--text-primary)">RF Rebound</td>
            <td style="padding:0.4rem; text-align:center; color:var(--tight)">Tight Exit</td>
            <td style="padding:0.4rem; text-align:center; color:var(--loose)">Loose Exit</td>
          </tr>
          <tr style="border-bottom:1px solid var(--border)">
            <td style="padding:0.4rem; color:var(--text-primary)">LR Bump</td>
            <td style="padding:0.4rem; text-align:center; color:var(--loose)">Loose Exit</td>
            <td style="padding:0.4rem; text-align:center; color:var(--tight)">Tight Exit</td>
          </tr>
          <tr style="border-bottom:1px solid var(--border)">
            <td style="padding:0.4rem; color:var(--text-primary)">RR Bump</td>
            <td style="padding:0.4rem; text-align:center; color:var(--loose)">Loose Exit</td>
            <td style="padding:0.4rem; text-align:center; color:var(--tight)">Tight Exit</td>
          </tr>
          <tr style="border-bottom:1px solid var(--border)">
            <td style="padding:0.4rem; color:var(--text-primary)">LR Rebound</td>
            <td style="padding:0.4rem; text-align:center; color:var(--loose)">Loose Entry</td>
            <td style="padding:0.4rem; text-align:center; color:var(--tight)">Tight Entry</td>
          </tr>
          <tr>
            <td style="padding:0.4rem; color:var(--text-primary)">RR Rebound</td>
            <td style="padding:0.4rem; text-align:center; color:var(--loose)">Loose Entry</td>
            <td style="padding:0.4rem; text-align:center; color:var(--tight)">Tight Entry</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="dyn-card" style="grid-column: 1 / -1">
      <div class="dyn-card-title">Estratégia de Setup de Amortecedores para Pistas Rugosas vs Lisas</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; padding:0.5rem">
        <div style="background:var(--bg-primary); border-radius:5px; padding:0.8rem; border:1px solid var(--border)">
          <div style="font-size:0.78rem; font-weight:700; color:var(--gold); margin-bottom:0.5rem">🏟️ Pista RUGOSA (Bristol, Texas)</div>
          <ul style="font-size:0.78rem; color:var(--text-secondary); line-height:1.7; padding-left:1rem">
            <li>HS Comp <strong>baixo</strong> – absorver impactos melhor</li>
            <li>HS Rebound <strong>médio</strong> – recuperação suave</li>
            <li>HS Slope <strong>alto</strong> – amortecimento mais linear</li>
            <li>LS pode ser mais alto para controle do chassis</li>
          </ul>
        </div>
        <div style="background:var(--bg-primary); border-radius:5px; padding:0.8rem; border:1px solid var(--border)">
          <div style="font-size:0.78rem; font-weight:700; color:var(--gold); margin-bottom:0.5rem">🏟️ Pista LISA (Daytona, Michigan)</div>
          <ul style="font-size:0.78rem; color:var(--text-secondary); line-height:1.7; padding-left:1rem">
            <li>HS Comp <strong>médio-alto</strong> – estabilidade aerodinâmica</li>
            <li>HS Rebound <strong>alto</strong> – manter atitude do chassis</li>
            <li>LS alto – maior controle para chassis estável</li>
            <li>Slope mais baixo – curva digressive para suavidade</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>
`,

  tires: `
<div class="dynamics-panel">
  <h3 class="dyn-card-title" style="margin-bottom:1.5rem">🛞 Pneus, Geometria e Pressões</h3>
  <div class="dynamics-grid">
    <div class="dyn-card">
      <div class="dyn-card-title">Pressão e Temperatura</div>
      <div style="padding:0.5rem">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-bottom:0.8rem">
          <div style="background:var(--bg-primary); border-radius:5px; padding:0.8rem; border:1px solid var(--border)">
            <div style="font-size:0.72rem; color:var(--gold); font-weight:700; margin-bottom:0.3rem">PSI ALTO</div>
            <div style="font-size:0.75rem; color:var(--text-secondary); line-height:1.5">✅ Menor calor<br>✅ Grip em alta carga<br>✅ Durabilidade maior<br>❌ Menos grip em cargas baixas<br>❌ Área de contato menor</div>
          </div>
          <div style="background:var(--bg-primary); border-radius:5px; padding:0.8rem; border:1px solid var(--border)">
            <div style="font-size:0.72rem; color:var(--gold); font-weight:700; margin-bottom:0.3rem">PSI BAIXO</div>
            <div style="font-size:0.75rem; color:var(--text-secondary); line-height:1.5">✅ Área contato maior<br>✅ Grip em cargas baixas<br>✅ Mais conformidade<br>❌ Mais calor gerado<br>❌ Degrada mais rápido</div>
          </div>
        </div>
        <div style="font-size:0.78rem; color:var(--text-secondary); line-height:1.5; background:var(--bg-primary); border-radius:4px; padding:0.7rem; border-left:3px solid var(--gold)">
          <strong style="color:var(--gold)">Diagnóstico por temperatura de pneu:</strong><br>
          • <span style="color:var(--loose)">Borda externa quente:</span> Câmbio insuficiente (less negative)<br>
          • <span style="color:var(--tight)">Borda interna quente:</span> Câmbio excessivo (too negative)<br>
          • <span style="color:var(--yellow)">Centro quente:</span> Pressão muito baixa → aumentar PSI<br>
          • <span style="color:var(--tight)">Centro frio:</span> Pressão muito alta → reduzir PSI
        </div>
      </div>
    </div>

    <div class="dyn-card">
      <div class="dyn-card-title">Câmbio (Camber) – Oval Setup</div>
      <div class="force-diagram" style="margin-bottom:0.8rem">
        <svg viewBox="0 0 300 130" xmlns="http://www.w3.org/2000/svg">
          <!-- LF tire - positive camber -->
          <line x1="50" y1="20" x2="60" y2="110" stroke="#3a8dff" stroke-width="2"/>
          <rect x="55" y="25" width="20" height="80" rx="4" fill="none" stroke="#3a8dff" stroke-width="1.5" transform="rotate(-4, 65, 65)"/>
          <text x="65" y="118" fill="#3a8dff" font-size="9" text-anchor="middle">LF +3.5°</text>
          <text x="65" y="12" fill="#3a8dff" font-size="8" text-anchor="middle">Positivo</text>

          <!-- RF tire - negative camber -->
          <line x1="250" y1="20" x2="240" y2="110" stroke="#e8a000" stroke-width="2"/>
          <rect x="225" y="25" width="20" height="80" rx="4" fill="none" stroke="#e8a000" stroke-width="2" transform="rotate(4, 235, 65)"/>
          <text x="235" y="118" fill="#e8a000" font-size="9" text-anchor="middle">RF -4.5°</text>
          <text x="235" y="12" fill="#e8a000" font-size="8" text-anchor="middle">Negativo</text>

          <!-- Road surface -->
          <line x1="20" y1="108" x2="280" y2="108" stroke="#555" stroke-width="2"/>

          <!-- Force arrows in corner -->
          <path d="M150,50 L130,80" stroke="#ff4444" stroke-width="2" marker-end="url(#arrowL)"/>
          <text x="160" y="65" fill="#ff4444" font-size="8">Força lateral</text>
          <text x="150" y="95" fill="#888" font-size="8" text-anchor="middle">Num oval, RF sob máxima carga</text>
        </svg>
      </div>
      <div style="font-size:0.78rem; color:var(--text-secondary); line-height:1.5">
        <strong style="color:var(--gold)">Num oval:</strong> RF com câmbio negativo maximiza a área de contato quando o pneu está sob carga lateral. LF com câmbio positivo faz o mesmo. Mais negativo RF = mais rotação mas mais desgaste interno.
      </div>
    </div>

    <div class="dyn-card" style="grid-column: 1 / -1">
      <div class="dyn-card-title">Caster – Efeito na Rotação e Estabilidade</div>
      <div style="display:grid; grid-template-columns:2fr 1fr; gap:1rem; padding:0.5rem">
        <div style="font-size:0.8rem; color:var(--text-secondary); line-height:1.7">
          <p><strong style="color:var(--gold)">Caster</strong> é o ângulo da esfera de suspensão em relação à vertical (vista lateral).</p>
          <p style="margin-top:0.5rem"><span style="color:var(--green)">🔼 RF Caster maior:</span> Gera mais câmbio dinâmico negativo quando volante está virado → mais grip RF na curva → mais rotação → levemente mais loose. Melhor recuperação em slides.</p>
          <p style="margin-top:0.5rem"><span style="color:var(--tight)">🔽 RF Caster menor:</span> Menos câmbio dinâmico → menos rotação → mais tight. Mais estável mas menos responsivo.</p>
          <p style="margin-top:0.5rem"><strong style="color:var(--gold)">Caster Split (RF > LF):</strong> Padrão em oval. RF mais caster que LF cria tendência natural do carro de girar para esquerda – fundamental para um oval.</p>
        </div>
        <div style="display:flex; flex-direction:column; gap:0.5rem">
          <div style="background:var(--bg-primary); border:1px solid var(--border); border-radius:5px; padding:0.8rem; text-align:center">
            <div style="font-size:0.68rem; color:var(--text-dim)">RF CASTER</div>
            <div style="font-family:'Orbitron',sans-serif; font-size:1.4rem; color:var(--gold); font-weight:700">6.0°</div>
            <div style="font-size:0.68rem; color:var(--text-dim)">Típico oval</div>
          </div>
          <div style="background:var(--bg-primary); border:1px solid var(--border); border-radius:5px; padding:0.8rem; text-align:center">
            <div style="font-size:0.68rem; color:var(--text-dim)">LF CASTER</div>
            <div style="font-family:'Orbitron',sans-serif; font-size:1.4rem; color:var(--tight); font-weight:700">4.0°</div>
            <div style="font-size:0.68rem; color:var(--text-dim)">Típico oval</div>
          </div>
          <div style="background:rgba(0,210,106,0.1); border:1px solid rgba(0,210,106,0.3); border-radius:5px; padding:0.6rem; text-align:center">
            <div style="font-size:0.68rem; color:var(--text-dim)">SPLIT</div>
            <div style="font-family:'Orbitron',sans-serif; font-size:1.2rem; color:var(--green); font-weight:700">+2.0°</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`,

  simulator: `
<div class="dynamics-panel">
  <h3 class="dyn-card-title" style="margin-bottom:1.5rem">🎮 Simulador Conceitual de Ajustes</h3>
  <p style="color:var(--text-secondary); font-size:0.85rem; margin-bottom:1.5rem">Mova os sliders para simular o efeito qualitativo de cada ajuste no comportamento do carro</p>

  <div class="dynamics-grid">
    <div class="dyn-card">
      <div class="dyn-card-title">Parâmetros de Ajuste</div>
      <div id="sim-controls" style="padding:0.5rem">

        <div class="sim-slider-group">
          <div class="ssl-header">
            <span class="ssl-label">RF Spring Rate</span>
            <span class="ssl-value" id="sim-rf-spring-val">600 lbs</span>
          </div>
          <input type="range" id="sim-rf-spring" min="400" max="900" value="600" step="25" oninput="updateSimulator()">
        </div>

        <div class="sim-slider-group">
          <div class="ssl-header">
            <span class="ssl-label">RR Spring Rate</span>
            <span class="ssl-value" id="sim-rr-spring-val">225 lbs</span>
          </div>
          <input type="range" id="sim-rr-spring" min="100" max="500" value="225" step="25" oninput="updateSimulator()">
        </div>

        <div class="sim-slider-group">
          <div class="ssl-header">
            <span class="ssl-label">Cross Weight %</span>
            <span class="ssl-value" id="sim-cross-val">50.0%</span>
          </div>
          <input type="range" id="sim-cross" min="47" max="54" value="50" step="0.25" oninput="updateSimulator()">
        </div>

        <div class="sim-slider-group">
          <div class="ssl-header">
            <span class="ssl-label">Front ARB (1=macio, 10=rígido)</span>
            <span class="ssl-value" id="sim-arb-val">P3 / 1.375"</span>
          </div>
          <input type="range" id="sim-arb" min="1" max="10" value="5" step="1" oninput="updateSimulator()">
        </div>

        <div class="sim-slider-group">
          <div class="ssl-header">
            <span class="ssl-label">RF PSI</span>
            <span class="ssl-value" id="sim-rf-psi-val">28 PSI</span>
          </div>
          <input type="range" id="sim-rf-psi" min="22" max="40" value="28" step="0.5" oninput="updateSimulator()">
        </div>

        <div class="sim-slider-group">
          <div class="ssl-header">
            <span class="ssl-label">Brake Bias %</span>
            <span class="ssl-value" id="sim-bb-val">54.0%</span>
          </div>
          <input type="range" id="sim-bb" min="48" max="62" value="54" step="0.5" oninput="updateSimulator()">
        </div>

      </div>
    </div>

    <div class="dyn-card">
      <div class="dyn-card-title">Previsão de Comportamento</div>
      <div id="sim-preview-panel" style="padding:0.5rem">

        <div style="margin-bottom:1rem">
          <div style="font-size:0.72rem; color:var(--text-dim); text-transform:uppercase; margin-bottom:0.5rem">Balance Geral</div>
          <div class="balance-indicator">
            <div class="bi-label">Loose ←</div>
            <div class="bi-bar-container" style="height:14px; position:relative">
              <div id="sim-balance-bar" class="bi-bar balanced" style="position:absolute; left:50%; width:0; height:100%;"></div>
              <div style="position:absolute; left:50%; width:2px; height:100%; background:var(--gold); top:0;"></div>
            </div>
            <div class="bi-label" style="text-align:right">→ Tight</div>
          </div>
          <div style="text-align:center; margin-top:0.4rem; font-family:'Orbitron',sans-serif; font-size:1rem; color:var(--gold)" id="sim-balance-text">NEUTRO</div>
        </div>

        <div id="sim-effects">
          <div class="sim-preview">
            <div class="sp-title">Efeito Esperado por Fase</div>
            <div class="sp-effect" id="sim-entry-effect">Entry: Aguardando ajuste...</div>
            <div class="sp-effect" id="sim-center-effect" style="margin-top:0.4rem">Center: Aguardando ajuste...</div>
            <div class="sp-effect" id="sim-exit-effect" style="margin-top:0.4rem">Exit: Aguardando ajuste...</div>
          </div>

          <div class="sim-preview" style="margin-top:0.8rem">
            <div class="sp-title">Consequências Esperadas</div>
            <div class="sp-effect" id="sim-consequences">Mova os sliders para ver previsões detalhadas...</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`
};

// Simulator update function
window.updateSimulator = function() {
  const rfSpring = parseFloat(document.getElementById('sim-rf-spring').value);
  const rrSpring = parseFloat(document.getElementById('sim-rr-spring').value);
  const cross = parseFloat(document.getElementById('sim-cross').value);
  const arb = parseFloat(document.getElementById('sim-arb').value);
  const rfPsi = parseFloat(document.getElementById('sim-rf-psi').value);
  const bb = parseFloat(document.getElementById('sim-bb').value);

  // Update display values
  document.getElementById('sim-rf-spring-val').textContent = rfSpring + ' lbs';
  document.getElementById('sim-rr-spring-val').textContent = rrSpring + ' lbs';
  document.getElementById('sim-cross-val').textContent = cross.toFixed(2) + '%';
  document.getElementById('sim-arb-val').textContent = arb <= 4 ? 'P' + arb + ' / 1.375"' : arb <= 7 ? 'P' + (arb-2) + ' / 1.375"' : '2.00" / P' + (arb-7);
  document.getElementById('sim-rf-psi-val').textContent = rfPsi.toFixed(1) + ' PSI';
  document.getElementById('sim-bb-val').textContent = bb.toFixed(1) + '%';

  // Calculate balance score (-100=loose, 0=neutral, +100=tight)
  let balance = 0;
  // RF Spring: 600 = neutral; higher = tighter
  balance += (rfSpring - 600) / 6; // max ~50pts
  // RR Spring: 225 = neutral; higher = looser (negative)
  balance -= (rrSpring - 225) / 5.5;
  // Cross weight: 50 = neutral; higher = tighter
  balance += (cross - 50) * 12;
  // ARB: 5 = neutral; higher = tighter
  balance += (arb - 5) * 4;
  // RF PSI: 28 = neutral; higher = looser
  balance -= (rfPsi - 28) * 2.5;
  // Brake Bias: 54 = neutral; higher = tighter entry
  balance += (bb - 54) * 3;

  balance = Math.max(-100, Math.min(100, balance));

  // Update balance bar
  const bar = document.getElementById('sim-balance-bar');
  const balanceText = document.getElementById('sim-balance-text');

  if (balance > 5) {
    bar.style.left = '50%';
    bar.style.width = Math.abs(balance) / 2 + '%';
    bar.className = 'bi-bar tight';
    balanceText.textContent = balance > 50 ? 'MUITO TIGHT' : balance > 20 ? 'TIGHT' : 'LEVEMENTE TIGHT';
    balanceText.style.color = 'var(--tight)';
  } else if (balance < -5) {
    bar.style.left = (50 - Math.abs(balance) / 2) + '%';
    bar.style.width = Math.abs(balance) / 2 + '%';
    bar.className = 'bi-bar loose';
    balanceText.textContent = balance < -50 ? 'MUITO LOOSE' : balance < -20 ? 'LOOSE' : 'LEVEMENTE LOOSE';
    balanceText.style.color = 'var(--loose)';
  } else {
    bar.style.left = '49%';
    bar.style.width = '2%';
    bar.className = 'bi-bar balanced';
    balanceText.textContent = 'NEUTRO / BALANCEADO';
    balanceText.style.color = 'var(--green)';
  }

  // Phase effects
  const entryBalance = balance + (bb - 54) * 5; // Brake bias heavily affects entry
  const centerBalance = balance + (cross - 50) * 10; // Cross weight heavily affects center
  const exitBalance = balance - (rrSpring - 225) / 4; // RR spring heavily affects exit

  const phaseText = (val) => {
    if (val > 30) return `<span class="neg-effect">⬤ TIGHT – carro empurra</span>`;
    if (val > 10) return `<span style="color:var(--tight)">⬤ Levemente tight</span>`;
    if (val < -30) return `<span class="pos-effect">⬤ LOOSE – traseira sai</span>`;
    if (val < -10) return `<span style="color:var(--loose)">⬤ Levemente loose</span>`;
    return `<span style="color:var(--green)">⬤ Neutro / balanceado</span>`;
  };

  document.getElementById('sim-entry-effect').innerHTML = '<strong>Entrada:</strong> ' + phaseText(entryBalance);
  document.getElementById('sim-center-effect').innerHTML = '<strong>Centro:</strong> ' + phaseText(centerBalance);
  document.getElementById('sim-exit-effect').innerHTML = '<strong>Saída:</strong> ' + phaseText(exitBalance);

  // Consequences
  let cons = [];
  if (rfSpring > 700) cons.push('<span class="neg-effect">RF Spring rígida: melhor suporte aero, risco de tight entry</span>');
  if (rfSpring < 500) cons.push('<span class="pos-effect">RF Spring macia: mais grip no apex, mais rotação</span>');
  if (rrSpring > 350) cons.push('<span class="pos-effect">RR Spring rígida: transfere carga rápido na saída, possível loose exit</span>');
  if (cross > 51.5) cons.push('<span class="neg-effect">Cross weight alto: carro mais tight, melhor na entrada longa</span>');
  if (cross < 48.5) cons.push('<span class="pos-effect">Cross weight baixo: carro mais livre, boa rotação</span>');
  if (arb > 7) cons.push('<span class="neg-effect">ARB muito rígido: menos body roll, possível tight crônico</span>');
  if (rfPsi > 33) cons.push('<span class="pos-effect">RF PSI alto: pneu mais frio, grip em alta carga, carro levemente loose</span>');
  if (rfPsi < 25) cons.push('<span class="pos-effect">RF PSI baixo: mais grip mas temperatura alta – desgaste acelerado</span>');
  if (bb > 57) cons.push('<span class="neg-effect">Brake bias muito dianteiro: possível trava do dianteiro na frenagem</span>');

  if (cons.length === 0) cons.push('<span style="color:var(--green)">✅ Setup dentro de parâmetros normais. Boa base para ajuste fino.</span>');

  document.getElementById('sim-consequences').innerHTML = cons.join('<br>');
};
