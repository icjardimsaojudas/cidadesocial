<template>
  <div>
    <div class="row between mb">
      <h1 style="margin:0">Triagem das famílias</h1>
      <a class="btn sec peq" :href="base + '#/inscricao'" target="_blank">Abrir ficha de inscrição ↗</a>
    </div>
    <div class="abas">
      <button v-for="(t, k) in FILTROS" :key="k" :class="{ ativa: filtro === k }" @click="filtro = k">{{ t }} ({{ contar(k) }})</button>
    </div>
    <div class="row mb"><input v-model="busca" type="text" placeholder="Buscar por nome, código ou bairro" style="max-width:360px" /></div>
    <div v-if="!lista" class="carregando">Carregando…</div>
    <div v-else-if="!filtradas.length" class="vazio card">Nenhuma família aqui.</div>
    <div v-else class="card tabela-wrap">
      <table>
        <thead><tr><th>Código</th><th>Responsável</th><th>Status</th><th>Pessoas</th><th v-if="pode('triagem')">Renda</th><th v-if="pode('triagem')">CRAS</th><th>Presenças</th><th>Inscrição</th></tr></thead>
        <tbody>
          <tr v-for="f in filtradas" :key="f.id" class="clicavel" @click="pode('triagem') && navigateTo('/triagem/' + f.id)">
            <td><b>{{ f.codigo }}</b></td>
            <td>{{ f.responsavel_nome }}<div class="tiny muted">{{ f.bairro }}{{ f.visita_agendada ? ' · visita ' + dataBR(f.visita_agendada) : '' }}</div></td>
            <td><Selo :valor="f.status" /></td>
            <td class="num">{{ f.qtd_pessoas }}</td>
            <td v-if="pode('triagem')" class="num">{{ f.renda_familiar ? moeda(f.renda_familiar) : '—' }}</td>
            <td v-if="pode('triagem')">{{ { sim: 'Sim', nao: 'Não', nao_sei: 'Não sabe' }[f.atendida_cras as string] || '—' }}</td>
            <td><span :class="{ 'selo vermelho': f.faltas_sem_justificativa >= limite }">{{ f.presencas }} / {{ f.presencas + f.faltas }}</span></td>
            <td class="small">{{ dataBR(f.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'painel', papeis: ['triagem'] })
const { pode } = useAuth()
const toast = useToast()
const base = useRuntimeConfig().app.baseURL
const FILTROS: Record<string, string> = { novas: 'Novas', em_triagem: 'Em triagem', ativa: 'Ativas', lista_espera: 'Espera', encerradas: 'Encerradas', todas: 'Todas' }
const filtro = ref('novas'), busca = ref(''), lista = ref<any[] | null>(null), limite = ref(2)
const passa = (f: any, k: string) => k === 'todas' || (k === 'novas' ? f.status === 'inscrita' : k === 'encerradas' ? ['nao_aprovada', 'concluida', 'desligada'].includes(f.status) : f.status === k)
const contar = (k: string) => (lista.value || []).filter(f => passa(f, k)).length
const filtradas = computed(() => {
  const b = busca.value.toLowerCase()
  return (lista.value || []).filter(f => passa(f, filtro.value) && (!b || (f.responsavel_nome + ' ' + f.codigo + ' ' + f.bairro).toLowerCase().includes(b)))
})
onMounted(async () => {
  try {
    const [l, c] = await Promise.all([api('familias.listar'), api('config.publica')])
    lista.value = l; limite.value = +c.limite_faltas || 2
    if (!contar('novas')) filtro.value = contar('em_triagem') ? 'em_triagem' : 'todas'
  } catch (e: any) { toast.erro(e.message) }
})
</script>
