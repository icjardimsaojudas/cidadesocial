<template>
  <div>
    <div class="row between mb">
      <h1 style="margin:0">Arrecadação · o que falta</h1>
      <div class="row"><button class="btn sec peq" @click="copiarLista" :disabled="!d">Copiar lista para WhatsApp</button><button class="btn peq" @click="entrada = true">+ Registrar doação</button></div>
    </div>
    <div v-if="!d" class="carregando">Carregando…</div>
    <template v-else>
      <div class="grid g4 mb">
        <div class="kpi"><div class="n">{{ d.meta }}</div><div class="l">Meta de cestas <button class="link-btn tiny" @click="editarMeta">editar</button></div></div>
        <div class="kpi"><div class="n">{{ d.cestas_prontas }}</div><div class="l">Cestas montadas (prontas)</div></div>
        <div class="kpi"><div class="n">{{ d.possiveis_com_estoque }}</div><div class="l">Ainda dá para montar</div></div>
        <div class="kpi"><div class="n">{{ d.kg_arrecadados.toLocaleString('pt-BR') }}</div><div class="l">kg arrecadados no total</div></div>
      </div>
      <p class="small muted" v-if="!d.meta_configurada">A meta está igual ao número de famílias ativas ({{ d.familias_ativas }}). Edite se quiser outra meta (ex.: incluir cestas emergenciais).</p>
      <div class="card">
        <div class="row between"><h2>Itens da cesta para a meta</h2><span class="small muted">Faltam montar {{ d.a_montar }} cesta(s)</span></div>
        <div class="tabela-wrap"><table>
          <thead><tr><th>Produto</th><th class="num">Por cesta</th><th class="num">Precisa</th><th class="num">Em estoque</th><th class="num">Falta</th><th style="width:30%">Progresso</th></tr></thead>
          <tbody>
            <tr v-for="i in d.itens" :key="i.produto_id">
              <td><b>{{ i.nome }}</b><div class="tiny muted">{{ i.unidade }}</div></td>
              <td class="num">{{ i.por_cesta }}</td><td class="num">{{ i.necessario }}</td><td class="num">{{ i.saldo }}</td>
              <td class="num"><span :class="i.falta ? 'selo vermelho' : 'selo verde'">{{ i.falta || 'ok' }}</span></td>
              <td><div class="barra"><i :style="{ width: (i.necessario ? Math.min(100, i.saldo / i.necessario * 100) : 100) + '%' }" /></div></td>
            </tr>
          </tbody>
        </table></div>
      </div>
      <div class="grid g2 mt">
        <div class="card">
          <h2>Validade próxima (45 dias)</h2>
          <div v-if="!d.vencendo.length" class="muted small">Nada vencendo.</div>
          <div v-for="(v, k) in d.vencendo" :key="k" class="small row between"><span>{{ v.produto }} · {{ v.quantidade }}</span><span :class="v.validade < hoje ? 'selo vermelho' : 'selo ambar'">{{ dataBR(v.validade) }}</span></div>
        </div>
        <div class="card">
          <h2>Outros itens em estoque</h2>
          <div v-if="!d.outros_itens.length" class="muted small">Só itens da cesta.</div>
          <div v-for="o in d.outros_itens" :key="o.produto_id" class="small row between"><span>{{ o.nome }}</span><b>{{ o.saldo }}</b></div>
        </div>
      </div>
    </template>
    <EntradaDoacao :aberto="entrada" :produtos="produtos" :doadores="doadores" @fechar="entrada = false" @salvo="entrada = false; carregar()" />
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'painel', papeis: ['arrecadacao'] })
const toast = useToast()
const hoje = hojeISO()
const d = ref<any>(null), entrada = ref(false), produtos = ref<any[]>([]), doadores = ref<any[]>([])
async function carregar() {
  try { [d.value, produtos.value, doadores.value] = await Promise.all([api('estoque.painel'), api('produtos.listar'), api('doadores.listar')]) } catch (e: any) { toast.erro(e.message) }
}
onMounted(carregar)
async function editarMeta() {
  const v = prompt('Meta de cestas (deixe vazio para usar o número de famílias ativas):', d.value.meta_configurada ? String(d.value.meta) : '')
  if (v === null) return
  try { await api('estoque.meta', { meta: v }); carregar() } catch (e: any) { toast.erro(e.message) }
}
async function copiarLista() {
  const faltas = d.value.itens.filter((i: any) => i.falta > 0)
  const txt = faltas.length
    ? '🧺 *FSI São Judas · o que falta para as cestas*\n\n' + faltas.map((i: any) => `• ${i.nome} (${i.unidade}): ${i.falta}`).join('\n') + '\n\nEntregue no ponto de coleta da igreja. Obrigado! 🧡'
    : '🧺 FSI São Judas: estoque completo para a meta! Obrigado a todos! 🧡'
  try { await navigator.clipboard.writeText(txt); toast.ok('Lista copiada. Cole no WhatsApp.') } catch { prompt('Copie a lista:', txt) }
}
</script>
