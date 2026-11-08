<template>
  <div>
    <div class="row between mb"><h1 style="margin:0">Usuários da equipe</h1><button class="btn peq" @click="abrir()">+ Novo usuário</button></div>
    <div class="card small mb">
      <b>Perfis:</b> Administração (gestor e pastor: tudo) · Triagem (fichas, entrevistas, CRAS, visitas, documentos) · Arrecadação e montagem (doadores, doações, estoque, cesta) ·
      Inventário (voluntário: só conferência e montagem) · Entrega e treinamento (encontros, presença, entrega, onboarding de voluntários). Famílias criam o próprio acesso na inscrição.
    </div>
    <div v-if="!lista" class="carregando">Carregando…</div>
    <div v-else class="card tabela-wrap"><table>
      <thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Situação</th><th>Último acesso</th><th /></tr></thead>
      <tbody><tr v-for="u in lista" :key="u.id">
        <td><b>{{ u.nome }}</b></td><td>{{ u.email }}</td><td>{{ PAPEIS[u.papel] }}</td>
        <td><span class="selo" :class="u.ativo ? 'verde' : 'cinza'">{{ u.ativo ? 'ativo' : 'inativo' }}</span></td>
        <td class="small">{{ dataHoraBR(u.ultimo_login) || '—' }}</td>
        <td class="row" style="gap:8px"><button class="btn sec peq" @click="abrir(u)">Editar</button><button class="link-btn small" @click="resetar(u)">Nova senha</button></td>
      </tr></tbody>
    </table></div>
    <Modal :aberto="!!form" :titulo="form?.id ? 'Editar usuário' : 'Novo usuário'" @fechar="form = null">
      <template v-if="form">
        <div class="grid g2">
          <div class="campo"><label class="obrig">Nome</label><input v-model="form.nome" type="text" /></div>
          <div class="campo"><label class="obrig">E-mail (login)</label><input v-model="form.email" type="email" /></div>
          <div class="campo"><label>Telefone</label><input v-model="form.telefone" type="tel" /></div>
          <div class="campo"><label>Perfil</label><select v-model="form.papel"><option v-for="(t, k) in PERFIS" :key="k" :value="k">{{ t }}</option></select></div>
        </div>
        <label class="check"><input type="checkbox" v-model="form.ativo" />Acesso ativo</label>
        <button class="btn" :disabled="salvando" @click="salvar">Salvar</button>
      </template>
    </Modal>
    <Modal :aberto="!!senha" titulo="Senha provisória" @fechar="senha = ''">
      <p>Passe esta senha pessoalmente (não por grupo de WhatsApp):</p>
      <p style="font-size:1.6rem;font-weight:900;letter-spacing:.05em">{{ senha }}</p>
      <p class="small muted">No primeiro acesso, o sistema pede para trocar.</p>
    </Modal>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'painel', papeis: ['admin'] })
const toast = useToast()
const PERFIS = Object.fromEntries(Object.entries(PAPEIS).filter(([k]) => k !== 'familia'))
const lista = ref<any[] | null>(null), form = ref<any>(null), senha = ref(''), salvando = ref(false)
const carregar = async () => { try { lista.value = await api('usuarios.listar') } catch (e: any) { toast.erro(e.message) } }
onMounted(carregar)
const abrir = (u?: any) => { form.value = u ? { ...u } : { nome: '', email: '', telefone: '', papel: 'triagem', ativo: true } }
async function salvar() {
  salvando.value = true
  try { const r = await api('usuarios.salvar', form.value); form.value = null; if (r.senha_temporaria) senha.value = r.senha_temporaria; toast.ok('Usuário salvo.'); carregar() }
  catch (e: any) { toast.erro(e.message) } finally { salvando.value = false }
}
async function resetar(u: any) {
  if (!confirm('Gerar nova senha provisória para ' + u.nome + '?')) return
  try { senha.value = (await api('usuarios.resetarSenha', { id: u.id })).senha_temporaria } catch (e: any) { toast.erro(e.message) }
}
</script>
