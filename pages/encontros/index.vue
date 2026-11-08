<template>
  <div>
    <div class="row between mb">
      <h1 style="margin:0">Cronograma de encontros e entregas</h1>
      <div class="row"><button class="btn sec peq" @click="gerarAno">Gerar calendário mensal</button><button class="btn peq" @click="abrir()">+ Novo encontro</button></div>
    </div>
    <p class="muted small">Um encontro por mês por grupo (sábado), com café, treinamento e entrega de cesta. Evite feriados e emendas.</p>
    <div v-if="!lista" class="carregando">Carregando…</div>
    <div v-else-if="!lista.length" class="vazio card">Nenhum encontro cadastrado ainda.</div>
    <div v-else class="grid g2">
      <div v-for="e in lista" :key="e.id" class="card pad-s enc" :class="{ passado: e.data < hoje }">
        <div class="dia"><b>{{ dataBR(e.data).substring(0, 5) }}</b><span>{{ dataBR(e.data).substring(6) }}</span></div>
        <div style="flex:1">
          <div class="row between"><b>{{ e.titulo }}</b><span class="selo" :class="{ planejado: 'azul', realizado: 'verde', cancelado: 'cinza' }[e.status as string]">{{ e.status }}</span></div>
          <div class="small muted">{{ diaSemana(e.data) }} {{ e.hora_inicio }} · {{ TIPOS_ENCONTRO[e.tipo] || e.tipo }}{{ e.grupo ? ' · grupo ' + e.grupo : '' }}</div>
          <div class="small" v-if="e.tema_cidadania">Cidadania: {{ e.tema_cidadania }}</div>
          <div class="small">✔ {{ e.presentes }} famílias · 🧺 {{ e.cestas }} cestas · 🙋 {{ e.voluntarios }} voluntários</div>
          <div class="row mt" style="gap:8px">
            <NuxtLink :to="'/encontros/' + e.id" class="btn peq">Presença e entrega</NuxtLink>
            <button class="btn sec peq" @click="abrir(e)">Editar</button>
          </div>
        </div>
      </div>
    </div>

    <Modal :aberto="!!form" :titulo="form?.id ? 'Editar encontro' : 'Novo encontro'" largo @fechar="form = null">
      <template v-if="form">
        <div class="grid g3">
          <div class="campo"><label class="obrig">Data</label><input v-model="form.data" type="date" /></div>
          <div class="campo"><label>Hora de início</label><input v-model="form.hora_inicio" type="time" /></div>
          <div class="campo"><label>Tipo</label><select v-model="form.tipo"><option v-for="(t, k) in TIPOS_ENCONTRO" :key="k" :value="k">{{ t }}</option></select></div>
          <div class="campo"><label>Título</label><input v-model="form.titulo" type="text" /></div>
          <div class="campo"><label>Local</label><input v-model="form.local" type="text" /></div>
          <div class="campo"><label>Grupo (vazio = todos)</label><input v-model="form.grupo" type="text" /></div>
        </div>
        <h3>Conteúdo do dia</h3>
        <div class="grid g2">
          <div class="campo"><label>Palestra de cidadania (adultos)</label><select v-model="form.tema_cidadania"><option value="">—</option><option v-for="o in CIDADANIA" :key="o">{{ o }}</option></select></div>
          <div class="campo"><label>Devocional (facultativo)</label><select v-model="form.tema_espiritualidade"><option value="">—</option><option v-for="o in ESPIRITUALIDADE" :key="o">{{ o }}</option></select></div>
          <div class="campo"><label>Crianças 3 a 10 anos</label><select v-model="form.tema_criancas"><option value="">—</option><option v-for="o in CRIANCAS" :key="o">{{ o }}</option></select></div>
          <div class="campo"><label>Adolescentes (Oficina de Restauração)</label><select v-model="form.tema_adolescentes"><option value="">—</option><option v-for="o in ADOLESCENTES" :key="o">{{ o }}</option></select></div>
          <div class="campo"><label>Oficina / treinamento extra</label><select v-model="form.oficina"><option value="">—</option><option v-for="o in OFICINAS" :key="o">{{ o }}</option></select></div>
          <div class="campo"><label>Status</label><select v-model="form.status"><option value="planejado">Planejado</option><option value="realizado">Realizado</option><option value="cancelado">Cancelado</option></select></div>
        </div>
        <div class="campo"><label>Observações</label><textarea v-model="form.observacoes" /></div>
        <div class="row"><button class="btn" :disabled="salvando" @click="salvar">Salvar</button><div class="spacer" />
          <button v-if="form.id" class="link-btn" style="color:var(--vermelho)" @click="excluir">Excluir</button></div>
      </template>
    </Modal>

    <Modal :aberto="!!lote" titulo="Gerar calendário mensal" @fechar="lote = null">
      <template v-if="lote">
        <p class="small muted">Cria um encontro por mês no sábado escolhido. Depois você pode editar cada um.</p>
        <div class="grid g3">
          <div class="campo"><label>Primeiro mês</label><input v-model="lote.inicio" type="month" /></div>
          <div class="campo"><label>Último mês</label><input v-model="lote.fim" type="month" /></div>
          <div class="campo"><label>Qual sábado</label><select v-model.number="lote.semana"><option :value="1">1º sábado</option><option :value="2">2º sábado</option><option :value="3">3º sábado</option><option :value="4">4º sábado</option><option :value="-1">Último sábado</option></select></div>
          <div class="campo"><label>Hora</label><input v-model="lote.hora" type="time" /></div>
          <div class="campo"><label>Grupo</label><input v-model="lote.grupo" type="text" /></div>
        </div>
        <p class="small"><b>Datas:</b> {{ datasLote.map(dataBR).join(' · ') || '—' }}</p>
        <button class="btn" :disabled="salvando || !datasLote.length" @click="criarLote">Criar {{ datasLote.length }} encontro(s)</button>
      </template>
    </Modal>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'painel', papeis: ['treinamento'] })
const toast = useToast()
const hoje = hojeISO()
const lista = ref<any[] | null>(null), form = ref<any>(null), salvando = ref(false), lote = ref<any>(null)
const carregar = async () => { try { lista.value = await api('encontros.listar') } catch (e: any) { toast.erro(e.message) } }
onMounted(carregar)
function abrir(e?: any) {
  form.value = e ? { ...e } : { data: '', hora_inicio: '08:30', tipo: 'treinamento_entrega', titulo: 'Encontro mensal', local: 'IC Jardim São Judas', grupo: '', tema_cidadania: '', tema_espiritualidade: '', tema_criancas: '', tema_adolescentes: '', oficina: '', status: 'planejado', observacoes: '' }
}
async function salvar() {
  salvando.value = true
  try { await api('encontros.salvar', form.value); toast.ok('Encontro salvo.'); form.value = null; carregar() } catch (e: any) { toast.erro(e.message) } finally { salvando.value = false }
}
async function excluir() {
  if (!confirm('Excluir este encontro?')) return
  try { await api('encontros.excluir', { id: form.value.id }); form.value = null; carregar() } catch (e: any) { toast.erro(e.message) }
}
function gerarAno() { const a = hoje.substring(0, 4); lote.value = { inicio: hoje.substring(0, 7), fim: a + '-12', semana: 3, hora: '08:30', grupo: '' } }
const datasLote = computed(() => {
  if (!lote.value?.inicio || !lote.value?.fim) return []
  const out: string[] = []
  let [a, m] = lote.value.inicio.split('-').map(Number)
  const [af, mf] = lote.value.fim.split('-').map(Number)
  while (a < af || (a === af && m <= mf)) {
    const sabs: number[] = []
    const ult = new Date(a, m, 0).getDate()
    for (let d = 1; d <= ult; d++) if (new Date(a, m - 1, d).getDay() === 6) sabs.push(d)
    const dia = lote.value.semana === -1 ? sabs[sabs.length - 1] : sabs[lote.value.semana - 1]
    if (dia) out.push(`${a}-${String(m).padStart(2, '0')}-${String(dia).padStart(2, '0')}`)
    m++; if (m > 12) { m = 1; a++ }
    if (out.length > 24) break
  }
  return out
})
async function criarLote() {
  salvando.value = true
  try {
    let i = 0
    for (const data of datasLote.value) {
      i++
      await api('encontros.salvar', { data, hora_inicio: lote.value.hora, tipo: 'treinamento_entrega', titulo: 'Encontro mensal', local: 'IC Jardim São Judas', grupo: lote.value.grupo, status: 'planejado',
        tema_cidadania: CIDADANIA[(i - 1) % 9], tema_criancas: CRIANCAS[(i - 1) % 9], tema_adolescentes: ADOLESCENTES[(i - 1) % 9] })
    }
    toast.ok('Calendário criado.'); lote.value = null; carregar()
  } catch (e: any) { toast.erro(e.message) } finally { salvando.value = false }
}
</script>
<style scoped>
.enc { display: flex; gap: 14px; }
.enc.passado { opacity: .8; }
.dia { background: var(--laranja); color: #fff; border-radius: 14px; padding: 8px 10px; text-align: center; min-width: 70px; height: fit-content; line-height: 1.1; }
.dia b { font-size: 1.3rem; display: block; } .dia span { font-size: .75rem; }
</style>
