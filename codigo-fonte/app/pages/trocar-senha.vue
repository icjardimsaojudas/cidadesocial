<template>
  <div class="narrow" style="max-width:460px">
    <form class="card" @submit.prevent="enviar">
      <h1>Trocar senha</h1>
      <p v-if="usuario?.trocar_senha" class="alerta">Por segurança, crie uma senha pessoal antes de continuar.</p>
      <div class="campo"><label>Senha atual</label><input v-model="atual" type="password" autocomplete="current-password" required /></div>
      <div class="campo"><label>Nova senha</label><input v-model="nova" type="password" autocomplete="new-password" minlength="8" required /><div class="ajuda">Mínimo de 8 caracteres.</div></div>
      <div class="campo"><label>Repita a nova senha</label><input v-model="nova2" type="password" autocomplete="new-password" required /></div>
      <button class="btn bloco" :disabled="carregando">Salvar nova senha</button>
    </form>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'painel', papeis: ['*'] })
const { usuario, inicio } = useAuth()
const toast = useToast()
const atual = ref(''), nova = ref(''), nova2 = ref(''), carregando = ref(false)
async function enviar() {
  if (nova.value !== nova2.value) return toast.erro('As senhas novas não são iguais.')
  carregando.value = true
  try {
    await api('auth.trocarSenha', { atual: atual.value, nova: nova.value })
    usuario.value = { ...usuario.value, trocar_senha: false }
    salvarSessao(lerToken(), usuario.value)
    toast.ok('Senha alterada.')
    navigateTo(inicio())
  } catch (e: any) { toast.erro(e.message) } finally { carregando.value = false }
}
</script>
