<template>
  <div class="pub">
    <header class="pub-top">
      <div class="container row between">
        <NuxtLink to="/"><img :src="base + 'logo.png'" alt="Cidade Social" class="pub-logo" /></NuxtLink>
        <nav class="row topo-acoes">
          <NuxtLink to="/voluntario" class="topo-link"><Icone nome="maos" :tam="18" /><span>Seja voluntário</span></NuxtLink>
          <NuxtLink v-if="usuario" :to="inicio()" class="btn peq"><Icone nome="usuario" :tam="16" />Meu painel</NuxtLink>
          <NuxtLink v-else to="/entrar?equipe=1" class="btn peq escuro"><Icone nome="cadeado" :tam="16" />Área da equipe</NuxtLink>
        </nav>
      </div>
    </header>
    <main class="pub-main"><slot /></main>
    <footer class="pub-rodape">
      <div class="container small">Programa Família Saudável Integral · Cidade Social · Igreja da Cidade Jardim São Judas<br>
        <span class="muted"><Icone nome="escudo" :tam="14" /> Seus dados são protegidos e usados só para o programa (LGPD).</span></div>
    </footer>
  </div>
</template>
<script setup lang="ts">
const { usuario, inicio } = useAuth()
const base = useRuntimeConfig().app.baseURL
</script>
<style scoped>
.pub { min-height: 100vh; display: flex; flex-direction: column; }
.pub-top { background: #fff; box-shadow: 0 2px 12px rgba(120,50,0,.06); padding: 10px 0; position: sticky; top: 0; z-index: 10; }
.pub-logo { height: 46px; display: block; }
.topo-acoes { gap: 14px; }
.topo-link { display: inline-flex; align-items: center; gap: 6px; font-weight: 800; color: var(--tinta); text-decoration: none; font-size: .92rem; }
.topo-link:hover { color: var(--laranja); }
.pub-main { flex: 1; padding: 0 0 50px; }
.pub-rodape { background: var(--tinta); color: #fff; padding: 22px 0; text-align: center; }
.pub-rodape .muted { color: #cbb9ab; }
@media (max-width: 560px) { .pub-logo { height: 36px; } .topo-link span { display: none; } .topo-link { background: var(--creme); border-radius: 50%; width: 38px; height: 38px; justify-content: center; } }
</style>
