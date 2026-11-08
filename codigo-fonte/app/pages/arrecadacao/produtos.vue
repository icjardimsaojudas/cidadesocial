<template>
  <div>
    <h1>Produtos e modelo da cesta</h1>
    <div class="grid g2">
      <div class="card">
        <div class="row between"><h2>Modelo da cesta</h2><button class="btn peq" :disabled="salvando" @click="salvarModelo(false)">Salvar modelo</button></div>
        <p class="small muted">Começa com a "Cesta Membro" oficial da rede (14 itens). Quantidade 0 tira o item da cesta.</p>
        <table><tbody>
          <tr v-for="p in produtos.filter(p => p.ativo === 'sim')" :key="p.id">
            <td>{{ p.nome }} <span class="tiny muted">{{ p.unidade }}</span></td>
            <td style="width:110px"><input v-model.number="modelo[p.id]" type="number" min="0" /></td>
          </tr>
        </tbody></table>
        <p class="small mt"><b>{{ itensCesta }}</b> itens · <b>{{ pesoCesta.toFixed(1) }} kg</b> por cesta</p>
      </div>
      <div class="card">
        <div class="row between"><h2>Produtos</h2><button class="btn sec peq" @click="editar()">+ Produto</button></div>
        <table><tbody>
          <tr v-for="p in produtos" :key="p.id" :style="{ opacity: p.ativo === 'sim' ? 1 : .5 }">
            <td><b>{{ p.nome }}</b><div class="tiny muted">{{ p.unidade }} · {{ p.categoria }} · {{ p.peso_kg }} kg</div></td>
            <td><button class="link-btn small" @click="editar(p)">Editar</button></td>
          </tr>
        </tbody></table>
      </div>
    </div>
    <Modal :aberto="!!form" :titulo="form?.id ? 'Editar produto' : 'Novo produto'" @fechar="form = null">
      <template v-if="form">
        <div class="grid g2">
          <div class="campo"><label class="obrig">Nome</label><input v-model="form.nome" type="text" /></div>
          <div class="campo"><label>Unidade</label><input v-model="form.unidade" type="text" placeholder="pacote 1 kg" /></div>
          <div class="campo"><label>Categoria</label><select v-model="form.categoria"><option>Mercearia</option><option>Higiene</option><option>Limpeza</option><option>Hortifruti</option><option>Outro</option></select></div>
          <div class="campo"><label>Peso (kg) por unidade</label><input v-model="form.peso_kg" type="number" step="0.01" min="0" /><div class="ajuda">Usado no relatório de kg.</div></div>
        </div>
        <label class="check"><input type="checkbox" v-model="form.ativoBool" />Produto ativo</label>
        <button class="btn" :disabled="salvando" @click="salvarProduto">Salvar</button>
      </template>
    </Modal>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'painel', papeis: ['arrecadacao'] })
const toast = useToast()
const produtos = ref<any[]>([]), modelo = reactive<Record<string, number>>({}), form = ref<any>(null), salvando = ref(false)
async function carregar() {
  try {
    const [p, m] = await Promise.all([api('produtos.listar'), api('cesta.modelo')])
    produtos.value = p
    Object.keys(modelo).forEach(k => delete modelo[k])
    p.forEach((x: any) => { modelo[x.id] = 0 })
    m.forEach((i: any) => { modelo[i.produto_id] = i.quantidade })
  } catch (e: any) { toast.erro(e.message) }
}
onMounted(carregar)
const itensCesta = computed(() => Object.values(modelo).reduce((a, b) => a + (+b || 0), 0))
const pesoCesta = computed(() => produtos.value.reduce((a, p) => a + (+modelo[p.id] || 0) * (+p.peso_kg || 0), 0))
async function salvarModelo(confirmar = false) {
  salvando.value = true
  try {
    await api('cesta.modeloSalvar', { itens: Object.entries(modelo).map(([produto_id, quantidade]) => ({ produto_id, quantidade })), confirmar })
    toast.ok('Modelo da cesta salvo.'); carregar()
  } catch (e: any) {
    if (e.message.includes('Confirme') && confirm(e.message + ' Alterar mesmo assim? As próximas montagens usarão o novo modelo.')) { salvando.value = false; return salvarModelo(true) }
    toast.erro(e.message)
  } finally { salvando.value = false }
}
const editar = (p?: any) => { form.value = p ? { ...p, ativoBool: p.ativo === 'sim' } : { nome: '', unidade: '', categoria: 'Mercearia', peso_kg: '', ativoBool: true } }
async function salvarProduto() {
  salvando.value = true
  try { await api('produtos.salvar', { ...form.value, ativo: form.value.ativoBool }); toast.ok('Produto salvo.'); form.value = null; carregar() } catch (e: any) { toast.erro(e.message) } finally { salvando.value = false }
}
</script>
