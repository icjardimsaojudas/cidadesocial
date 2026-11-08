<template>
  <div>
    <NuxtLink to="/encontros" class="small">← Cronograma</NuxtLink>
    <div v-if="!d" class="carregando">Carregando…</div>
    <template v-else>
      <div class="row between mt mb">
        <div><h1 style="margin:0">{{ d.encontro.titulo }}</h1>
          <span class="muted">{{ dataBR(d.encontro.data) }} ({{ diaSemana(d.encontro.data) }}) {{ d.encontro.hora_inicio }} · {{ TIPOS_ENCONTRO[d.encontro.tipo] }}</span></div>
        <span class="selo" :class="d.encontro.status === 'realizado' ? 'verde' : 'azul'">{{ d.encontro.status }}</span>
      </div>

      <div class="grid g4 mb">
        <div class="kpi"><div class="n">{{ presentes }}</div><div class="l">Famílias presentes de {{ d.familias.length }}</div></div>
        <div class="kpi"><div class="n">{{ cestasMarcadas }}</div><div class="l">Cestas a entregar</div></div>
        <div class="kpi"><div class="n">{{ d.cestas_disponiveis + cestasJaSalvas }}</div><div class="l">Cestas montadas disponíveis</div></div>
        <div class="kpi"><div class="n">{{ volPresentes }}</div><div class="l">Voluntários presentes</div></div>
      </div>
      <div v-if="cestasMarcadas > d.cestas_disponiveis + cestasJaSalvas" class="alerta vermelho mb">Há mais cestas marcadas do que cestas montadas. Peça à equipe de montagem para registrar as cestas no estoque.</div>

      <div class="card mb small" v-if="d.encontro.tema_cidadania || d.encontro.tema_criancas">
        <b>Conteúdo:</b> Cidadania {{ d.encontro.tema_cidadania || '—' }} · Crianças {{ d.encontro.tema_criancas || '—' }} · Adolescentes {{ d.encontro.tema_adolescentes || '—' }} {{ d.encontro.oficina ? '· Oficina ' + d.encontro.oficina : '' }}
      </div>

      <div class="abas"><button :class="{ ativa: aba === 'f' }" @click="aba = 'f'">Famílias</button><button :class="{ ativa: aba === 'v' }" @click="aba = 'v'">Voluntários</button></div>

      <div v-if="aba === 'f'">
        <div class="row mb"><input v-model="busca" type="text" placeholder="Buscar família" style="max-width:300px" />
          <button class="btn sec peq" @click="marcarTodas">Marcar todas presentes + cesta</button></div>
        <div v-if="!d.familias.length" class="vazio card">Nenhuma família ativa. Aprove famílias na triagem primeiro.</div>
        <div v-for="f in familiasFiltradas" :key="f.familia_id" class="card pad-s fam" :class="{ ok: f.presente === true, falta: f.presente === false }">
          <div class="row between">
            <div><b>{{ f.responsavel_nome }}</b> <span class="tiny muted">{{ f.codigo }}{{ f.grupo ? ' · grupo ' + f.grupo : '' }}</span></div>
            <div class="row" style="gap:6px">
              <button class="btn peq" :class="f.presente === true ? 'verde' : 'sec'" @click="f.presente = true; f.cesta_entregue = true">Presente</button>
              <button class="btn peq" :class="f.presente === false ? 'perigo' : 'sec'" @click="f.presente = false; f.cesta_entregue = false">Faltou</button>
            </div>
          </div>
          <div v-if="f.presente === true" class="row mt small" style="gap:14px">
            <label class="check" style="margin:0"><input type="checkbox" v-model="f.cesta_entregue" />Cesta entregue</label>
            <span>Adultos <input v-model.number="f.adultos" type="number" min="0" class="mini" /></span>
            <span>Crianças (0–10) <input v-model.number="f.criancas" type="number" min="0" class="mini" /></span>
            <span>Adolescentes (11+) <input v-model.number="f.adolescentes" type="number" min="0" class="mini" /></span>
          </div>
          <div v-if="f.presente === false" class="row mt small" style="gap:14px">
            <label class="check" style="margin:0"><input type="checkbox" v-model="f.justificada" />Falta justificada</label>
            <input v-if="f.justificada" v-model="f.justificativa" type="text" placeholder="Motivo" style="max-width:320px" />
          </div>
        </div>
      </div>

      <div v-if="aba === 'v'" class="card">
        <div v-if="!d.voluntarios.length" class="muted">Nenhum voluntário ativo. Ative voluntários na tela Voluntários.</div>
        <div v-for="v in d.voluntarios" :key="v.voluntario_id" class="row between vol">
          <label class="check" style="margin:0"><input type="checkbox" v-model="v.presente" />{{ v.nome }} <span class="tiny muted">· {{ FRENTES[v.frente] }}</span></label>
          <input v-if="v.presente" v-model="v.funcao" type="text" placeholder="Função no dia" style="max-width:220px" />
        </div>
      </div>

      <div class="barra-acao row">
        <button class="btn sec" :disabled="salvando" @click="salvar(false)">Salvar</button>
        <button class="btn" :disabled="salvando" @click="salvar(true)">Salvar e finalizar encontro</button>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'painel', papeis: ['treinamento'] })
const toast = useToast()
const id = String(useRoute().params.id)
const d = ref<any>(null), aba = ref('f'), busca = ref(''), salvando = ref(false), cestasJaSalvas = ref(0)
const carregar = async () => {
  try { d.value = await api('presencas.listar', { encontro_id: id }); cestasJaSalvas.value = d.value.familias.filter((f: any) => f.cesta_entregue).length }
  catch (e: any) { toast.erro(e.message) }
}
onMounted(carregar)
const presentes = computed(() => d.value.familias.filter((f: any) => f.presente === true).length)
const cestasMarcadas = computed(() => d.value.familias.filter((f: any) => f.presente === true && f.cesta_entregue).length)
const volPresentes = computed(() => d.value.voluntarios.filter((v: any) => v.presente).length)
const familiasFiltradas = computed(() => d.value.familias.filter((f: any) => !busca.value || f.responsavel_nome.toLowerCase().includes(busca.value.toLowerCase())))
function marcarTodas() { d.value.familias.forEach((f: any) => { if (f.presente === null) { f.presente = true; f.cesta_entregue = true } }) }
async function salvar(finalizar: boolean) {
  if (finalizar && d.value.familias.some((f: any) => f.presente === null) && !confirm('Há famílias sem marcação. Elas ficarão sem registro. Finalizar mesmo assim?')) return
  salvando.value = true
  try {
    await api('presencas.salvar', { encontro_id: id, familias: d.value.familias, voluntarios: d.value.voluntarios, finalizar })
    toast.ok(finalizar ? 'Encontro finalizado.' : 'Presenças salvas.')
    await carregar()
  } catch (e: any) { toast.erro(e.message) } finally { salvando.value = false }
}
</script>
<style scoped>
.fam { margin-bottom: 8px; border-left: 6px solid var(--linha); }
.fam.ok { border-left-color: var(--verde); }
.fam.falta { border-left-color: var(--vermelho); }
.mini { width: 64px !important; padding: 6px 8px !important; display: inline-block; }
.vol { padding: 8px 0; border-bottom: 1px solid var(--linha); }
.barra-acao { position: sticky; bottom: 0; background: var(--creme); padding: 12px 0; justify-content: flex-end; border-top: 2px solid var(--linha); margin-top: 16px; }
</style>
