<template>
  <div>
    <h1>Estoque e montagem das cestas</h1>
    <div v-if="!d" class="carregando">Carregando…</div>
    <template v-else>
      <div class="grid g4 mb">
        <div class="kpi"><div class="n">{{ d.cestas_prontas }}</div><div class="l">Cestas prontas</div></div>
        <div class="kpi"><div class="n">{{ d.possiveis_com_estoque }}</div><div class="l">Dá para montar agora</div></div>
        <div class="kpi"><div class="n">{{ d.a_montar }}</div><div class="l">Faltam para a meta ({{ d.meta }})</div></div>
        <div class="kpi"><div class="n">{{ d.montadas_total }}</div><div class="l">Montadas no total</div></div>
      </div>
      <div class="abas">
        <button v-for="(t, k) in abas" :key="k" :class="{ ativa: aba === k }" @click="aba = k">{{ t }}</button>
      </div>

      <div v-if="aba === 'montar'" class="grid g2">
        <div class="card">
          <h2>Registrar cestas montadas</h2>
          <p class="small muted">Ao registrar, o sistema dá baixa dos itens no estoque conforme o modelo da cesta.</p>
          <div class="grid g2">
            <div class="campo"><label>Quantas cestas?</label><input v-model.number="montar.quantidade" type="number" min="1" :max="d.possiveis_com_estoque" /></div>
            <div class="campo"><label>Data</label><input v-model="montar.data" type="date" /></div>
          </div>
          <div class="campo"><label>Observação</label><input v-model="montar.observacoes" type="text" /></div>
          <button class="btn" :disabled="salvando || !montar.quantidade" @click="registrarMontagem">Registrar montagem</button>
          <p v-if="montar.quantidade > d.possiveis_com_estoque" class="alerta vermelho mt small">O estoque dá para {{ d.possiveis_com_estoque }} cesta(s).</p>
        </div>
        <div class="card">
          <h2>Lista de montagem (1 cesta)</h2>
          <table><tbody><tr v-for="i in d.itens" :key="i.produto_id"><td>{{ i.nome }} <span class="tiny muted">{{ i.unidade }}</span></td><td class="num"><b>{{ i.por_cesta }}</b></td><td class="num small muted">estoque {{ i.saldo }}</td></tr></tbody></table>
          <button class="btn sec peq mt nao-imprimir" @click="imprimir">Imprimir lista</button>
        </div>
      </div>

      <div v-if="aba === 'saldo'" class="card tabela-wrap">
        <table>
          <thead><tr><th>Produto</th><th class="num">Em estoque</th><th class="num">Por cesta</th><th class="num">Falta para a meta</th></tr></thead>
          <tbody>
            <tr v-for="i in d.itens" :key="i.produto_id"><td>{{ i.nome }} <span class="tiny muted">{{ i.unidade }}</span></td><td class="num"><b>{{ i.saldo }}</b></td><td class="num">{{ i.por_cesta }}</td><td class="num">{{ i.falta || '—' }}</td></tr>
            <tr v-for="o in d.outros_itens" :key="o.produto_id"><td>{{ o.nome }} <span class="tiny muted">(fora da cesta)</span></td><td class="num"><b>{{ o.saldo }}</b></td><td /><td /></tr>
          </tbody>
        </table>
      </div>

      <div v-if="aba === 'conferir'" class="card">
        <h2>Conferência de inventário</h2>
        <p class="small muted">Conte fisicamente cada item e digite a quantidade. Deixe em branco o que não contou. Diferenças viram ajuste no estoque.</p>
        <table><tbody>
          <tr v-for="p in produtosConf" :key="p.produto_id">
            <td>{{ p.nome }} <span class="tiny muted">sistema: {{ p.saldo }}</span></td>
            <td style="width:120px"><input v-model="contagem[p.produto_id]" type="number" min="0" /></td>
            <td class="num small" style="width:90px"><span v-if="contagem[p.produto_id] !== '' && contagem[p.produto_id] !== undefined" :class="(+contagem[p.produto_id] - p.saldo) ? 'selo ambar' : 'selo verde'">{{ (+contagem[p.produto_id] - p.saldo) > 0 ? '+' : '' }}{{ +contagem[p.produto_id] - p.saldo }}</span></td>
          </tr>
        </tbody></table>
        <div class="campo mt"><label>Observações</label><input v-model="obsConf" type="text" /></div>
        <button class="btn" :disabled="salvando" @click="conferir">Salvar conferência</button>
      </div>

      <div v-if="aba === 'saida'" class="card">
        <h2>Saída avulsa</h2>
        <p class="small muted">Para itens vencidos, avariados ou cesta emergencial. Exige motivo.</p>
        <div class="grid g3">
          <div class="campo"><label>Produto</label><select v-model="saida.produto_id"><option value="">—</option><option v-for="p in produtosConf" :key="p.produto_id" :value="p.produto_id">{{ p.nome }}</option></select></div>
          <div class="campo"><label>Quantidade</label><input v-model.number="saida.quantidade" type="number" min="1" /></div>
          <div class="campo"><label>Motivo</label><input v-model="saida.motivo" type="text" /></div>
        </div>
        <button class="btn" :disabled="salvando" @click="registrarSaida">Registrar saída</button>
      </div>

      <div v-if="aba === 'historico'" class="card tabela-wrap">
        <table>
          <thead><tr><th>Data</th><th>Tipo</th><th>Produto</th><th class="num">Qtd</th><th>Doador / motivo</th><th>Por</th></tr></thead>
          <tbody><tr v-for="m in movs" :key="m.id">
            <td class="small">{{ dataBR(m.data) }}</td><td><span class="selo" :class="{ entrada: 'verde', saida: 'vermelho', montagem: 'laranja', ajuste: 'ambar' }[m.tipo as string]">{{ m.tipo }}</span></td>
            <td>{{ m.produto }}</td><td class="num">{{ m.quantidade }}</td><td class="small">{{ m.doador || m.motivo }}</td><td class="small muted">{{ m.usuario }}</td>
          </tr></tbody>
        </table>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'painel', papeis: ['arrecadacao', 'estoque'] })
const { pode } = useAuth()
const toast = useToast()
const d = ref<any>(null), movs = ref<any[]>([]), aba = ref('montar'), salvando = ref(false)
const abas = computed(() => { const a: Record<string, string> = { montar: 'Montar cestas', saldo: 'Saldo', conferir: 'Conferência' }; if (pode('arrecadacao')) a.saida = 'Saída avulsa'; a.historico = 'Movimentações'; return a })
const montar = reactive<any>({ quantidade: 1, data: hojeISO(), observacoes: '' })
const saida = reactive<any>({ produto_id: '', quantidade: 1, motivo: '' })
const contagem = reactive<Record<string, any>>({}), obsConf = ref('')
const produtosConf = computed(() => d.value ? [...d.value.itens.map((i: any) => ({ produto_id: i.produto_id, nome: i.nome, saldo: i.saldo })), ...d.value.outros_itens] : [])
async function carregar() { try { [d.value, movs.value] = await Promise.all([api('estoque.painel'), api('estoque.movimentos', { limite: 300 })]) } catch (e: any) { toast.erro(e.message) } }
onMounted(carregar)
async function rodar(fn: () => Promise<any>, msg: string) { salvando.value = true; try { await fn(); toast.ok(msg); await carregar() } catch (e: any) { toast.erro(e.message) } finally { salvando.value = false } }
const registrarMontagem = () => rodar(() => api('estoque.montar', montar), 'Montagem registrada.')
const registrarSaida = () => rodar(async () => { await api('estoque.saida', saida); Object.assign(saida, { produto_id: '', quantidade: 1, motivo: '' }) }, 'Saída registrada.')
const conferir = () => rodar(async () => {
  await api('estoque.conferir', { itens: Object.entries(contagem).map(([produto_id, contado]) => ({ produto_id, contado })), observacoes: obsConf.value })
  Object.keys(contagem).forEach(k => delete contagem[k]); obsConf.value = ''
}, 'Conferência salva.')
const imprimir = () => window.print()
</script>
