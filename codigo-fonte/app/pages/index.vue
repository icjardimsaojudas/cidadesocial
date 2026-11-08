<template>
  <div class="narrow">
    <section class="hero card">
      <img :src="base + 'logo.png'" alt="Cidade Social" class="hero-logo" />
      <h1>Família Saudável <span style="font-weight:400">Integral</span></h1>
      <p class="muted">Igreja da Cidade · Jardim São Judas · São José dos Campos</p>
      <p>Um ano de caminhada com a sua família: alimento, treinamentos, cuidado com as crianças e apoio para conquistar autonomia.</p>
    </section>
    <div class="grid g2 mt">
      <NuxtLink to="/inscricao" class="opcao card">
        <span class="ic">🏠</span><b>Inscrever minha família</b><span class="small muted">Preencha a ficha e aceite os termos do programa.</span>
      </NuxtLink>
      <NuxtLink to="/voluntario" class="opcao card">
        <span class="ic">🤝</span><b>Quero ser voluntário</b><span class="small muted">Escolha a sua frente e faça parte do movimento.</span>
      </NuxtLink>
      <NuxtLink to="/entrar" class="opcao card">
        <span class="ic">👨‍👩‍👧</span><b>Acompanhar minha inscrição</b><span class="small muted">Entre com o CPF e a senha que você criou.</span>
      </NuxtLink>
      <NuxtLink to="/entrar" class="opcao card">
        <span class="ic">🔐</span><b>Área da equipe</b><span class="small muted">Triagem, arrecadação, entrega e administração.</span>
      </NuxtLink>
    </div>
  </div>
</template>
<script setup lang="ts">
const base = useRuntimeConfig().app.baseURL
</script>
<style scoped>
.hero { text-align: center; padding: 30px 22px; }
.hero-logo { width: 220px; max-width: 70%; margin-bottom: 10px; }
.opcao { display: flex; flex-direction: column; gap: 6px; text-decoration: none; color: var(--tinta); border: 2px solid transparent; transition: border-color .2s, transform .2s; }
.opcao:hover { border-color: var(--laranja); transform: translateY(-3px); }
.opcao .ic { font-size: 2rem; }
.opcao b { font-size: 1.1rem; }
</style>
