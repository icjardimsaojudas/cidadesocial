<template>
  <div class="pub">
    <header class="pub-top">
      <div class="container row between">
        <NuxtLink to="/"><img :src="base + 'logo.png'" alt="Cidade Social" class="pub-logo" /></NuxtLink>
        <NuxtLink v-if="usuario" :to="inicio()" class="btn sec peq">Meu painel</NuxtLink>
        <NuxtLink v-else to="/entrar" class="btn sec peq">Entrar</NuxtLink>
      </div>
    </header>
    <main class="pub-main"><slot /></main>
    <footer class="pub-rodape">
      <div class="container small">Programa Família Saudável Integral · Cidade Social · Igreja da Cidade Jardim São Judas<br>
        <span class="muted">Seus dados são protegidos e usados só para o programa (LGPD).</span></div>
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
.pub-main { flex: 1; padding: 26px 0 50px; }
.pub-rodape { background: var(--tinta); color: #fff; padding: 22px 0; text-align: center; }
.pub-rodape .muted { color: #cbb9ab; }
</style>
