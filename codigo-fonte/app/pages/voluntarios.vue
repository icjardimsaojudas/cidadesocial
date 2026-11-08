<template>
  <div>
    <div class="row between mb">
      <h1 style="margin:0">Voluntários · onboarding</h1>
      <div class="row"><a class="btn sec peq" :href="base + '#/voluntario'" target="_blank">Link de inscrição ↗</a>
        <button class="btn sec peq" @click="exportar" :disabled="!lista">Exportar CSV</button></div>
    </div>
    <p class="small muted">Fluxo: inscrito → integração (treinamento de novos voluntários) → ativo. O termo de voluntariado é aceito na inscrição e vale até 31/12.</p>
    <div class="abas">
      <button v-for="(t, k) in ABAS" :key="k" :class="{ ativa: filtro === k }" @click="filtro = k">{{ t }} ({{ (lista || []).filter(v => k === 'todos' || v.status === k).length }})</button>
    </div>
    <div class="row mb">
      <select v-model="frente" style="max-width:260px"><option value="">Todas as frentes</option><option v-for="(t, k) in FRENTES" :key="k" :value="k">{{ t }}</option></select>
      <input v-model="busca" type="text" placeholder="Buscar nome, GDC, habilidade" style="max-width:300px" />
    </div>
    <div v-if="!lista" class="carregando">Carregando…</div>
    <div v-else-if="!filtrados.length" class="vazio card">Nenhum voluntário aqui.</div>
    <div v-else class="card tabela-wrap">
      <table>
        <thead><tr><th>Nome</th><th>Frente</th><th>GDC</th><th>Habilidades</th><th>Status</th><th>Integração</th><th>Presenças</th><th /></tr></thead>
        <tbody>
          <tr v-for="v in filtrados" :key="v.id">
            <td><b>{{ v.nome }}</b><div class="tiny muted">{{ mascaraTel(v.telefone) }}{{ v.trabalha_criancas === 'sim' ? ' · crianças' : '' }}</div></td>
            <td class="small">{{ FRENTES[v.frente] }}</td>
            <td class="small">{{ v.gdc || '—' }}</td>
            <td class="small">{{ [v.profissao, v.habilidades].filter(Boolean).join(' · ') || '—' }}</td>
            <td><Selo :valor="v.status" tipo="voluntario" /></td>
            <td class="small">{{ dataBR(v.integracao_data) || '—' }}</td>
            <td class="num">{{ v.presencas }}</td>
            <td><button class="btn sec peq" @click="editar(v)">Abrir</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal :aberto="!!form" :titulo="form?.nome || ''" @fechar="form = null">
      <template v-if="form">
        <p class="small muted">Inscrito em {{ dataBR(form.created_at) }} · Termo {{ form.termo_versao }} aceito · Imagem: {{ form.imagem_autorizada === 'sim' ? 'autorizada' : 'não' }}<br>
          Disponibilidade: {{ (form.disponibilidade || []).join(', ') || '—' }} · Emergência: {{ form.emergencia_nome || '—' }} {{ mascaraTel(form.emergencia_telefone) }}</p>
        <div class="grid g2">
          <div class="campo"><label>Status</label><select v-model="form.status"><option v-for="(s, k) in STATUS_VOLUNTARIO" :key="k" :value="k">{{ s.rotulo }}</option></select></div>
          <div class="campo"><label>Data da integração</label><input v-model="form.integracao_data" type="date" /></div>
          <div class="campo"><label>Frente</label><select v-model="form.frente"><option v-for="(t, k) in FRENTES" :key="k" :value="k">{{ t }}</option></select></div>
          <div class="campo"><label>GDC</label><input v-model="form.gdc" type="text" /></div>
          <div class="campo"><label>Telefone</label><input v-model="form.telefone" type="tel" /></div>
          <div class="campo"><label>E-mail</label><input v-model="form.email" type="email" /></div>
        </div>
        <div class="campo"><label>Observações</label><textarea v-model="form.observacoes" /></div>
        <div class="row"><button class="btn" :disabled="salvando" @click="salvar">Salvar</button>
          <a class="btn sec" :href="'https://wa.me/55' + soDigitos(form.telefone)" target="_blank" rel="noopener">WhatsApp</a></div>
      </template>
    </Modal>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'painel', papeis: ['treinamento'] })
const toast = useToast()
const base = useRuntimeConfig().app.baseURL
const ABAS: Record<string, string> = { inscrito: 'Novos', integracao: 'Em integração', ativo: 'Ativos', inativo: 'Inativos', todos: 'Todos' }
const lista = ref<any[] | null>(null), filtro = ref('inscrito'), frente = ref(''), busca = ref(''), form = ref<any>(null), salvando = ref(false)
const carregar = async () => { try { lista.value = await api('voluntarios.listar') } catch (e: any) { toast.erro(e.message) } }
onMounted(async () => { await carregar(); if (lista.value && !lista.value.some(v => v.status === 'inscrito')) filtro.value = 'todos' })
const filtrados = computed(() => (lista.value || []).filter(v => (filtro.value === 'todos' || v.status === filtro.value) && (!frente.value || v.frente === frente.value)
  && (!busca.value || [v.nome, v.gdc, v.habilidades, v.profissao].join(' ').toLowerCase().includes(busca.value.toLowerCase()))))
function editar(v: any) { form.value = { ...v } }
async function salvar() {
  salvando.value = true
  try { await api('voluntarios.atualizar', form.value); toast.ok('Voluntário atualizado.'); form.value = null; carregar() } catch (e: any) { toast.erro(e.message) } finally { salvando.value = false }
}
function exportar() {
  baixarCSV('voluntarios.csv', [['Nome', 'Telefone', 'E-mail', 'Frente', 'GDC', 'Profissão', 'Habilidades', 'Status', 'Integração', 'Presenças'],
    ...(lista.value || []).map(v => [v.nome, mascaraTel(v.telefone), v.email, FRENTES[v.frente], v.gdc, v.profissao, v.habilidades, STATUS_VOLUNTARIO[v.status]?.rotulo, dataBR(v.integracao_data), v.presencas])])
}
</script>
