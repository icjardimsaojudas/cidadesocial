<template>
  <Modal :aberto="aberto" titulo="Registrar doação recebida" largo @fechar="$emit('fechar')">
    <div class="grid g3">
      <div class="campo"><label>Doador</label>
        <select v-model="f.doador_id"><option value="">Anônimo / não identificado</option><option v-for="x in doadores" :key="x.id" :value="x.id">{{ x.nome }}</option></select></div>
      <div class="campo"><label>Data</label><input v-model="f.data" type="date" /></div>
      <div class="campo"><label>Observação</label><input v-model="f.observacoes" type="text" placeholder="Ex.: culto de domingo" /></div>
    </div>
    <div class="tabela-wrap"><table>
      <thead><tr><th>Produto</th><th>Quantidade</th><th>Validade</th><th v-if="compromissos.length">Compromisso</th><th /></tr></thead>
      <tbody>
        <tr v-for="(i, k) in f.itens" :key="k">
          <td><select v-model="i.produto_id"><option value="">—</option><option v-for="p in produtos" :key="p.id" :value="p.id">{{ p.nome }} ({{ p.unidade }})</option></select></td>
          <td><input v-model.number="i.quantidade" type="number" min="0" style="width:100px" /></td>
          <td><input v-model="i.validade" type="date" /></td>
          <td v-if="compromissos.length"><select v-model="i.compromisso_id"><option value="">—</option><option v-for="c in compromissos.filter(c => !i.produto_id || c.produto_id === i.produto_id)" :key="c.id" :value="c.id">{{ c.produto }} · {{ c.recebido }}/{{ c.quantidade }}</option></select></td>
          <td><button class="link-btn" @click="f.itens.splice(k, 1)">✕</button></td>
        </tr>
      </tbody>
    </table></div>
    <div class="row mt"><button class="btn sec peq" @click="novaLinha">+ Item</button><div class="spacer" />
      <button class="btn" :disabled="salvando" @click="salvar">Registrar entrada</button></div>
  </Modal>
</template>
<script setup lang="ts">
const p = defineProps<{ aberto: boolean; produtos: any[]; doadores: any[] }>()
const emit = defineEmits(['fechar', 'salvo'])
const toast = useToast()
const salvando = ref(false)
const vazio = () => ({ doador_id: '', data: hojeISO(), observacoes: '', itens: [{ produto_id: '', quantidade: 1, validade: '', compromisso_id: '' }] })
const f = reactive<any>(vazio())
watch(() => p.aberto, v => { if (v) Object.assign(f, vazio()) })
const compromissos = computed(() => (p.doadores.find(d => d.id === f.doador_id)?.compromissos || []))
const novaLinha = () => f.itens.push({ produto_id: '', quantidade: 1, validade: '', compromisso_id: '' })
async function salvar() {
  const itens = f.itens.filter((i: any) => i.produto_id && i.quantidade > 0)
  if (!itens.length) return toast.erro('Inclua pelo menos um item com quantidade.')
  salvando.value = true
  try { await api('estoque.entrada', { ...f, itens }); toast.ok('Doação registrada no estoque.'); emit('salvo') } catch (e: any) { toast.erro(e.message) } finally { salvando.value = false }
}
</script>
