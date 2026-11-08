<template>
  <div>
    <h1>Painel</h1>
    <div v-if="!d" class="carregando">Carregando…</div>
    <template v-else>
      <div v-if="d.alerta_faltas && pode('triagem', 'treinamento')" class="alerta vermelho mb">{{ d.alerta_faltas }} família(s) ativa(s) atingiram o limite de faltas sem justificativa.</div>

      <h2 class="mt">Famílias</h2>
      <div class="grid g4">
        <div class="kpi"><div class="n">{{ d.familias.inscrita }}</div><div class="l">Inscrições novas</div></div>
        <div class="kpi"><div class="n">{{ d.familias.em_triagem }}</div><div class="l">Em triagem</div></div>
        <div class="kpi"><div class="n">{{ d.familias.ativa }}</div><div class="l">Ativas no programa</div></div>
        <div class="kpi"><div class="n">{{ d.visitas_agendadas }}</div><div class="l">Visitas agendadas</div></div>
      </div>
      <p class="small muted mt">Lista de espera: {{ d.familias.lista_espera }} · Não aprovadas: {{ d.familias.nao_aprovada }} · Concluíram: {{ d.familias.concluida }} · Desligadas: {{ d.familias.desligada }}</p>

      <h2 class="mt2">Alimentos e cestas</h2>
      <div class="grid g4">
        <div class="kpi"><div class="n">{{ d.estoque.meta }}</div><div class="l">Meta de cestas</div></div>
        <div class="kpi"><div class="n">{{ d.estoque.cestas_prontas }}</div><div class="l">Cestas prontas</div></div>
        <div class="kpi"><div class="n">{{ d.estoque.possiveis }}</div><div class="l">Dá para montar com o estoque</div></div>
        <div class="kpi"><div class="n">{{ d.estoque.kg.toLocaleString('pt-BR') }}</div><div class="l">kg arrecadados</div></div>
      </div>
      <p v-if="d.estoque.itens_em_falta" class="alerta mt">{{ d.estoque.itens_em_falta }} item(ns) ainda faltam para atingir a meta. <NuxtLink v-if="pode('arrecadacao')" to="/arrecadacao">Ver o que falta</NuxtLink></p>

      <h2 class="mt2">Voluntários</h2>
      <div class="grid g4">
        <div class="kpi"><div class="n">{{ d.voluntarios.inscrito }}</div><div class="l">Inscritos aguardando</div></div>
        <div class="kpi"><div class="n">{{ d.voluntarios.integracao }}</div><div class="l">Em integração</div></div>
        <div class="kpi"><div class="n">{{ d.voluntarios.ativo }}</div><div class="l">Ativos</div></div>
        <div class="kpi"><div class="n">{{ d.doadores }}</div><div class="l">Doadores cadastrados</div></div>
      </div>
      <div class="card mt">
        <h3>Voluntários por frente</h3>
        <div v-for="(t, k) in FRENTES" :key="k" class="mb">
          <div class="row between small"><b>{{ t }}</b><span>{{ d.frentes[k] || 0 }}</span></div>
          <div class="barra"><i :style="{ width: pct(d.frentes[k]) + '%' }" /></div>
        </div>
      </div>

      <div class="card mt" v-if="d.proximo_encontro">
        <h3>Próximo encontro</h3>
        <p><b>{{ dataBR(d.proximo_encontro.data) }}</b> ({{ diaSemana(d.proximo_encontro.data) }}) {{ d.proximo_encontro.hora_inicio }} · {{ d.proximo_encontro.titulo }}</p>
        <NuxtLink v-if="pode('treinamento')" :to="'/encontros/' + d.proximo_encontro.id" class="btn peq">Abrir lista de presença</NuxtLink>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'painel', papeis: ['triagem', 'arrecadacao', 'treinamento'] })
const { pode } = useAuth()
const toast = useToast()
const d = ref<any>(null)
const pct = (v: number) => { const t = Object.values(d.value.frentes).reduce((a: number, b: any) => a + (b || 0), 0) as number; return t ? Math.round((v || 0) / t * 100) : 0 }
onMounted(async () => { try { d.value = await api('painel') } catch (e: any) { toast.erro(e.message) } })
</script>
