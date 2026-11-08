<template>
  <div>
    <div class="row between mb"><h1 style="margin:0">Relatório mensal da rede</h1>
      <div class="row"><input v-model="mes" type="month" style="max-width:180px" @change="carregar" /><button class="btn sec peq" :disabled="!d" @click="exportar">Exportar CSV</button><button class="btn sec peq nao-imprimir" @click="imprimir">Imprimir</button></div></div>
    <p class="small muted">Indicadores do modelo "Relatório de Acompanhamento dos Atendimentos" (2026) da Cidade Social. Prazo de envio: último dia do mês.
      Linhas com 0 que não são registradas no sistema (plantão social, emergenciais, outras doações) devem ser preenchidas à mão se houver.</p>
    <div v-if="!d" class="carregando">Carregando…</div>
    <div v-else class="card">
      <h2>{{ d.unidade }} · {{ mesExtenso }}</h2>
      <table><tbody><tr v-for="[rot, val] in d.linhas" :key="rot"><td>{{ rot }}</td><td class="num"><b>{{ val }}</b></td></tr></tbody></table>
    </div>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'painel', papeis: ['admin'] })
const toast = useToast()
const mes = ref(hojeISO().substring(0, 7)), d = ref<any>(null)
const mesExtenso = computed(() => new Date(mes.value + '-15T12:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }))
async function carregar() { d.value = null; try { d.value = await api('relatorio.mensal', { mes: mes.value }) } catch (e: any) { toast.erro(e.message) } }
onMounted(carregar)
const exportar = () => baixarCSV(`relatorio-fsi-${mes.value}.csv`, [['Indicador', mesExtenso.value], ...d.value.linhas])
const imprimir = () => window.print()
</script>
