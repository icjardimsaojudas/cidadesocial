<template>
  <div class="pn">
    <header class="pn-top">
      <div class="container row">
        <NuxtLink :to="inicio()"><img :src="base + 'logo-branco.png'" alt="Cidade Social" class="pn-logo" /></NuxtLink>
        <div class="spacer" />
        <div class="pn-user" v-if="usuario">
          <b>{{ usuario.nome?.split(' ')[0] }}</b>
          <span>{{ PAPEIS[usuario.papel] }}</span>
        </div>
        <button class="btn peq escuro" @click="sair"><Icone nome="sair" :tam="16" />Sair</button>
      </div>
      <nav class="container pn-menu" v-if="itens.length > 1">
        <NuxtLink v-for="i in itens" :key="i.to" :to="i.to" :class="{ ativo: ativo(i.to) }"><Icone :nome="i.i" :tam="16" />{{ i.t }}</NuxtLink>
      </nav>
    </header>
    <main class="container pn-main"><slot /></main>
  </div>
</template>
<script setup lang="ts">
const { usuario, sair, pode, inicio } = useAuth()
const base = useRuntimeConfig().app.baseURL
const route = useRoute()
const itens = computed(() => {
  const u = usuario.value; if (!u) return []
  const m: { to: string; t: string; i: string }[] = []
  if (u.papel === 'familia') return [{ to: '/familia', t: 'Minha família', i: 'familia' }, { to: '/trocar-senha', t: 'Senha', i: 'chave' }]
  if (u.papel !== 'estoque') m.push({ to: '/painel', t: 'Painel', i: 'grafico' })
  if (pode('triagem')) m.push({ to: '/triagem', t: 'Triagem', i: 'prancheta' })
  if (pode('treinamento')) m.push({ to: '/encontros', t: 'Encontros e entregas', i: 'calendario' }, { to: '/voluntarios', t: 'Voluntários', i: 'maos' })
  if (pode('arrecadacao')) m.push({ to: '/arrecadacao', t: 'Arrecadação', i: 'cesta' }, { to: '/arrecadacao/doadores', t: 'Doadores', i: 'coracao' })
  if (pode('arrecadacao', 'estoque')) m.push({ to: '/estoque', t: 'Estoque e montagem', i: 'caixa' })
  if (pode('arrecadacao')) m.push({ to: '/arrecadacao/produtos', t: 'Produtos e cesta', i: 'livro' })
  if (u.papel === 'admin') m.push({ to: '/admin/usuarios', t: 'Equipe e acessos', i: 'equipe' }, { to: '/admin/relatorio', t: 'Relatório mensal', i: 'doc' }, { to: '/admin/config', t: 'Configurações', i: 'engrenagem' }, { to: '/admin/auditoria', t: 'Auditoria', i: 'escudo' })
  m.push({ to: '/trocar-senha', t: 'Senha', i: 'chave' })
  return m
})
const ativo = (to: string) => route.path === to || (to !== '/painel' && to !== '/arrecadacao' && route.path.startsWith(to + '/'))
</script>
<style scoped>
.pn-top { background: var(--laranja); color: #fff; position: sticky; top: 0; z-index: 20; box-shadow: 0 4px 18px rgba(150,60,0,.25); }
.pn-top > .container { padding-top: 10px; padding-bottom: 10px; }
.pn-logo { height: 40px; display: block; }
.pn-user { text-align: right; line-height: 1.15; font-size: .85rem; }
.pn-user b { display: block; font-size: .95rem; }
.pn-menu { display: flex; flex-wrap: wrap; gap: 4px 6px; padding-bottom: 10px !important; }
.pn-menu a { display: inline-flex; align-items: center; gap: 6px; color: #fff; text-decoration: none; font-weight: 800; font-size: .9rem; padding: 7px 13px; border-radius: 999px; white-space: nowrap; opacity: .9; }
.pn-menu a:hover { background: rgba(255,255,255,.15); opacity: 1; }
.pn-menu a.ativo { background: #fff; color: var(--laranja); opacity: 1; }
.pn-main { padding-top: 22px; padding-bottom: 60px; }
@media (max-width: 560px) { .pn-user { display: none; } }
@media (max-width: 760px) { .pn-top { position: static; } }
</style>
