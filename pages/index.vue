<template>
  <div>
    <section class="hero">
      <div class="container hero-in">
        <div class="hero-txt">
          <span class="kicker">Família Saudável Integral</span>
          <h1>Um ano de caminhada com a <span class="destaque">sua família</span>.</h1>
          <p>Alimento todo mês, treinamentos, atividades para as crianças e apoio para a família conquistar autonomia. Igreja da Cidade · Jardim São Judas · São José dos Campos.</p>
          <div class="hero-acoes">
            <NuxtLink to="/inscricao" class="btn grande"><Icone nome="familia" />Inscrever minha família</NuxtLink>
            <NuxtLink to="/entrar" class="btn grande sec"><Icone nome="busca" />Acompanhar minha inscrição</NuxtLink>
          </div>
          <p class="small muted">Para acompanhar, entre com o CPF do responsável e a senha criada na inscrição.</p>
        </div>
        <svg class="hero-sim" viewBox="0 0 464 354" aria-hidden="true"><path :d="SIMBOLO" /></svg>
      </div>
    </section>

    <section class="container">
      <h2 class="sec-tit">Como funciona</h2>
      <div class="grid g4 passos">
        <div v-for="(p, i) in PASSOS" :key="p.t" class="card passo">
          <div class="ic"><Icone :nome="p.i" :tam="26" /></div>
          <span class="n">{{ i + 1 }}</span>
          <b>{{ p.t }}</b><p class="small muted">{{ p.d }}</p>
        </div>
      </div>

      <div class="grid g3 mt2">
        <div v-for="b in BENEFICIOS" :key="b.t" class="beneficio">
          <span class="ic2"><Icone :nome="b.i" :tam="22" /></span>
          <div><b>{{ b.t }}</b><p class="small muted">{{ b.d }}</p></div>
        </div>
      </div>

      <div class="vol-cta mt2">
        <div class="row" style="gap:16px;flex-wrap:nowrap"><span class="ic3"><Icone nome="maos" :tam="28" /></span>
          <div><b>Quer servir como voluntário?</b><p class="small" style="margin:0">Arrecadação e montagem das cestas, triagem das famílias ou dia da entrega.</p></div></div>
        <NuxtLink to="/voluntario" class="btn escuro">Quero ser voluntário <Icone nome="seta" :tam="18" /></NuxtLink>
      </div>

      <div class="card mt2 docs">
        <Icone nome="doc" :tam="28" class="laranja" />
        <div><b>Documentos para a triagem</b>
          <p class="small muted">Do responsável: RG ou CNH, CPF e comprovante de endereço atualizado. Dos demais moradores: RG ou certidão de nascimento e CPF (quando houver).</p></div>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
const PASSOS = [
  { i: 'prancheta', t: 'Inscrição', d: 'Preencha a ficha online e aceite os termos do programa.' },
  { i: 'busca', t: 'Triagem', d: 'Entrevista, conferência de documentos, CRAS e visita à casa.' },
  { i: 'calendario', t: '12 meses', d: 'Um encontro por mês com café, treinamento e entrega de alimentos.' },
  { i: 'coracao', t: 'Autonomia', d: 'A família segue caminhando com as próprias pernas.' }
]
const BENEFICIOS = [
  { i: 'cesta', t: 'Alimentação', d: 'Cesta básica no encontro mensal.' },
  { i: 'livro', t: 'Treinamentos', d: 'Palestras de cidadania, trabalho e renda.' },
  { i: 'familia', t: 'Crianças e adolescentes', d: 'Atividades próprias para cada idade.' }
]
const SIMBOLO = 'M242.3,334.9 C242.5,334.6 242.7,328.1 242.7,315.2 C242.9,296.4 242.9,295.8 243.6,294.0 C245.8,288.2 246.9,286.9 258.6,275.3 C263.8,270.1 279.0,255.0 292.3,241.8 C306.3,227.9 316.7,217.9 317.0,218.0 C317.7,218.1 383.5,284.3 385.3,286.6 C386.1,287.7 386.8,288.8 387.0,289.2 C387.2,289.5 387.5,290.1 387.6,290.3 C388.4,291.7 388.8,292.5 389.4,294.4 C390.1,296.4 390.1,297.3 390.3,315.7 L390.5,334.8L411.0,334.8 L431.5,334.8L431.6,317.8 C431.7,295.0 431.1,288.2 428.0,280.0 C427.6,279.0 427.1,277.7 427.0,277.2 C425.9,273.5 420.4,264.3 416.6,259.7 C413.3,255.9 415.6,258.2 381.0,223.5 C363.6,206.1 349.2,191.3 348.9,190.7 C348.2,189.4 348.1,187.7 348.7,186.3 C348.9,185.6 354.8,179.5 364.7,169.5 C383.3,150.7 386.2,147.1 391.5,136.2 C393.5,132.0 393.8,131.3 395.5,126.8 C398.6,118.1 400.2,107.2 399.9,95.5 C399.7,86.0 399.1,81.2 397.1,73.8 C395.8,68.9 395.3,67.5 394.5,65.5 C394.3,65.0 393.7,63.7 393.3,62.7 C392.5,60.6 390.1,55.7 389.0,54.0 C388.7,53.4 388.2,52.6 388.1,52.3 C387.5,51.0 382.6,44.2 380.4,41.5 C376.3,36.7 372.4,33.0 366.7,28.6 C361.7,24.7 353.1,19.9 346.8,17.5 C343.8,16.4 342.8,16.1 341.2,15.6 C328.1,11.6 314.6,10.9 301.2,13.5 C297.8,14.2 293.7,15.3 289.7,16.7 C286.4,17.8 280.6,20.5 277.2,22.5 C276.1,23.1 274.9,23.8 274.7,23.9 C270.9,25.7 261.7,33.4 256.4,39.2 C238.0,59.2 230.2,88.2 235.7,116.1 C236.9,122.3 237.8,125.2 240.7,132.3 C241.5,134.4 243.9,139.3 245.0,141.0 C245.3,141.6 245.8,142.4 245.9,142.7 C246.5,144.0 251.2,150.6 253.4,153.2 C254.7,154.8 262.8,163.2 271.3,171.8 C279.9,180.4 286.9,187.6 286.9,187.9 C287.0,188.5 223.6,252.3 222.2,253.1 C221.7,253.4 216.7,248.6 190.9,222.6 C174.1,205.7 160.0,191.3 159.7,190.6 C158.7,188.8 158.8,187.1 160.0,185.3 C160.5,184.5 167.0,177.8 174.3,170.5 C193.0,151.9 195.9,148.6 201.1,138.5 C207.7,126.0 210.7,113.3 210.7,97.4 C210.6,86.2 209.0,75.1 206.5,69.1 C206.2,68.5 206.0,67.8 206.0,67.5 C206.0,67.2 205.8,66.5 205.5,65.8 C205.2,65.1 204.7,64.0 204.5,63.5 C203.7,61.6 199.6,53.5 199.0,52.5 C198.6,51.9 198.2,51.3 198.1,51.0 C198.0,50.8 197.4,49.9 196.9,49.0 C191.5,41.1 184.6,33.9 176.8,28.1 C173.8,25.9 173.9,26.0 170.0,23.7 C168.4,22.7 166.9,21.8 166.7,21.7 C165.2,20.8 159.1,18.0 158.6,18.0 C158.3,18.0 158.0,17.8 157.8,17.6 C157.6,17.4 156.9,17.2 156.3,17.0 C155.7,16.8 154.0,16.3 152.7,15.9 C133.3,9.5 111.5,11.0 92.5,20.1 C79.6,26.2 67.3,37.1 59.1,49.5 C54.9,56.0 51.2,63.7 49.0,70.7 C45.9,80.8 45.0,86.9 45.0,98.3 C45.0,107.9 45.7,114.4 47.5,120.8 C49.0,125.9 49.0,126.0 50.5,130.1 C51.4,132.5 54.7,139.4 55.8,141.2 C62.1,151.6 62.6,152.2 89.4,179.0 C94.1,183.7 98.0,187.8 98.0,188.0 C98.0,188.2 82.2,204.2 63.0,223.5 C43.7,242.7 27.1,259.6 26.0,261.0 C20.4,268.4 17.0,275.1 14.5,283.8 C12.2,291.9 12.0,294.4 12.0,316.0 L12.0,335.0L32.5,335.0 L53.0,335.0L53.1,316.6 C53.2,297.5 53.3,296.9 54.7,293.2 C56.5,288.4 58.1,286.5 68.5,276.2 C87.2,257.5 127.4,217.8 127.6,217.7 C128.0,217.6 195.7,286.0 196.9,287.7 C197.4,288.5 198.3,290.1 198.8,291.1 C200.8,295.4 200.8,294.8 200.9,315.5 C201.0,325.9 201.1,334.7 201.2,334.9 C201.4,335.5 241.8,335.5 242.3,334.9 Z  M143.6,314.6 L143.5,296.2L125.2,296.2 L106.8,296.2L106.7,314.2 C106.7,324.1 106.7,332.4 106.8,332.6 C106.9,332.9 111.0,333.0 125.3,333.0 L143.7,333.0L143.6,314.6 Z  M332.8,314.5 L332.8,296.2L314.5,296.1 C303.7,296.0 296.1,296.1 296.0,296.3 C295.9,296.5 295.9,304.8 295.9,314.8 L296.0,333.0L314.4,332.9 L332.8,332.8L332.8,314.5 Z  M125.4,156.1 C124.0,155.5 98.4,129.9 95.4,126.2 C93.4,123.8 90.0,118.3 90.0,117.7 C90.0,117.5 89.8,117.0 89.5,116.4 C85.8,108.9 84.9,95.2 87.6,85.2 C90.5,74.1 97.5,64.7 107.2,58.8 C108.3,58.1 112.7,56.0 113.0,56.0 C113.2,56.0 113.8,55.8 114.4,55.5 C120.9,52.8 131.3,52.5 139.2,54.8 C150.4,58.1 159.7,65.7 164.8,76.0 C165.5,77.4 166.2,78.8 166.4,79.1 C166.7,79.8 167.8,83.2 168.5,85.8 C170.3,93.0 169.7,106.6 167.3,113.2 C166.5,115.4 164.9,119.2 164.5,119.7 C164.3,119.9 163.9,120.7 163.5,121.3 C163.2,122.0 162.1,123.6 161.0,125.0 C158.6,128.3 131.2,155.6 129.7,156.2 C128.3,156.8 126.8,156.8 125.4,156.1 Z  M314.5,156.0 C313.1,155.4 288.3,130.7 284.8,126.5 C281.2,122.2 278.5,116.9 276.8,111.0 C274.6,103.5 275.1,87.1 277.6,82.4 C277.8,82.0 278.0,81.5 278.0,81.2 C278.0,80.7 280.8,74.7 281.8,73.2 C284.1,69.4 288.9,64.1 292.3,61.5 C307.7,49.8 329.3,50.5 344.0,63.3 C351.8,70.1 356.6,78.5 358.2,88.6 C359.1,94.2 358.6,108.3 357.4,110.1 C357.3,110.3 357.1,111.0 357.0,111.6 C356.3,115.1 353.5,120.6 350.4,124.8 C348.3,127.6 320.8,155.2 319.3,156.0 C317.7,156.8 316.2,156.8 314.5,156.0 Z'
</script>
<style scoped>
.hero { background: linear-gradient(135deg, var(--laranja) 0%, #F98A2C 100%); color: #fff; padding: 46px 0 54px; overflow: hidden; }
.hero-in { display: grid; grid-template-columns: 1.4fr 1fr; align-items: center; gap: 20px; }
.kicker { font-weight: 900; letter-spacing: .16em; text-transform: uppercase; font-size: .8rem; opacity: .9; }
.hero h1 { font-size: 2.6rem; margin: 10px 0 14px; }
.destaque { color: var(--tinta); }
.hero p { font-size: 1.08rem; max-width: 560px; }
.hero .muted { color: #FFE2CC; }
.hero-acoes { display: flex; gap: 12px; flex-wrap: wrap; margin: 22px 0 12px; }
.hero .btn:not(.sec) { background: var(--tinta); box-shadow: 0 10px 26px rgba(60,20,0,.35); }
.hero .btn.sec { background: #fff; color: var(--laranja); box-shadow: none; }
.hero-sim { width: 100%; max-width: 360px; justify-self: center; }
.hero-sim { animation: flutua 6s ease-in-out infinite, aparece 1.2s ease both; }
.hero-sim path { fill: none; stroke: rgba(255,255,255,.8); stroke-width: 2.4; }
@keyframes flutua { 50% { transform: translateY(-10px); } }
@keyframes aparece { from { opacity: 0; transform: scale(.92); } }
.sec-tit { margin-top: 34px; }
.passo { position: relative; }
.passo .ic { width: 52px; height: 52px; border-radius: 16px; background: #FFF0E3; color: var(--laranja); display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
.passo .n { position: absolute; right: 16px; top: 8px; font-size: 2.6rem; font-weight: 900; color: #F6E4D6; }
.passo b { font-size: 1.08rem; }
.beneficio { display: flex; gap: 12px; align-items: flex-start; }
.ic2 { width: 42px; height: 42px; border-radius: 50%; background: var(--laranja); color: #fff; display: flex; align-items: center; justify-content: center; flex: none; }
.docs { display: flex; gap: 14px; align-items: flex-start; border-left: 6px solid var(--ambar); }
.laranja { color: var(--laranja); }
.vol-cta { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; background: #FFE9D6; border: 2px dashed var(--laranja); border-radius: var(--raio); padding: 18px 20px; }
.vol-cta b { font-size: 1.1rem; }
.ic3 { width: 54px; height: 54px; border-radius: 16px; background: var(--laranja); color: #fff; display: flex; align-items: center; justify-content: center; flex: none; }
@media (max-width: 560px) { .vol-cta .btn { width: 100%; } }
@media (max-width: 760px) { .hero-in { grid-template-columns: 1fr; } .hero-sim { display: none; } .hero h1 { font-size: 2rem; } .hero-acoes .btn { width: 100%; } }
</style>
