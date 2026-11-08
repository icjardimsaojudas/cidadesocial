<template>
  <div>
    <h1>Auditoria</h1>
    <p class="small muted">Últimas 500 ações: quem viu fichas, baixou documentos, alterou dados ou fez login.</p>
    <input v-model="busca" type="text" placeholder="Filtrar por pessoa ou ação" style="max-width:320px" class="mb" />
    <div v-if="!lista" class="carregando">Carregando…</div>
    <div v-else class="card tabela-wrap"><table>
      <thead><tr><th>Quando</th><th>Quem</th><th>Ação</th><th>Detalhe</th></tr></thead>
      <tbody><tr v-for="a in filtrada" :key="a.id"><td class="small">{{ dataHoraBR(a.created_at) }}</td><td>{{ a.usuario || '—' }}</td><td><b>{{ a.acao }}</b></td><td class="small muted">{{ a.entidade }} {{ a.detalhe }}</td></tr></tbody>
    </table></div>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'painel', papeis: ['admin'] })
const toast = useToast()
const lista = ref<any[] | null>(null), busca = ref('')
onMounted(async () => { try { lista.value = await api('auditoria.listar') } catch (e: any) { toast.erro(e.message) } })
const filtrada = computed(() => (lista.value || []).filter(a => !busca.value || (a.usuario + ' ' + a.acao).toLowerCase().includes(busca.value.toLowerCase())))
</script>
