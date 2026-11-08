<template>
  <div class="narrow" style="max-width:440px">
    <form class="card" @submit.prevent="enviar">
      <h1>Entrar</h1>
      <p class="muted small">Famílias: use o CPF do responsável. Equipe: use seu e-mail.</p>
      <div class="campo"><label for="login">CPF ou e-mail</label><input id="login" v-model="login" type="text" autocomplete="username" required /></div>
      <div class="campo"><label for="senha">Senha</label><input id="senha" v-model="senha" type="password" autocomplete="current-password" required /></div>
      <button class="btn bloco grande" :disabled="carregando">{{ carregando ? 'Entrando…' : 'Entrar' }}</button>
      <p class="small muted mt">Esqueceu a senha? Fale com a coordenação do programa para receber uma senha provisória.</p>
    </form>
  </div>
</template>
<script setup lang="ts">
const { entrar, inicio } = useAuth()
const toast = useToast()
const route = useRoute()
const login = ref(''), senha = ref(''), carregando = ref(false)
async function enviar() {
  carregando.value = true
  try {
    const u = await entrar(login.value.trim(), senha.value)
    const volta = String(route.query.volta || '')
    navigateTo(u.trocar_senha ? '/trocar-senha' : (volta && volta.startsWith('/') ? volta : inicio(u)))
  } catch (e: any) { toast.erro(e.message) } finally { carregando.value = false }
}
</script>
