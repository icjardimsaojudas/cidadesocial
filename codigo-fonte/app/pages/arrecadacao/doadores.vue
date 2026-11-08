<template>
  <div>
    <div class="row between mb">
      <h1 style="margin:0">Doadores e patrocinadores</h1>
      <div class="row"><button class="btn sec peq" @click="entrada = true">+ Registrar doação</button><button class="btn peq" @click="abrirDoador()">+ Novo doador</button></div>
    </div>
    <p class="small muted">Cadastre quem se comprometeu a doar (membros, GDCs, empresas) e o que prometeu. As entradas ligadas ao compromisso atualizam o status sozinhas.</p>
    <div class="row mb"><input v-model="busca" type="text" placeholder="Buscar doador ou GDC" style="max-width:320px" />
      <select v-model="filtroStatus" style="max-width:220px"><option value="">Todos</option><option value="pendente">Com compromisso pendente</option><option value="cumprido">Tudo cumprido</option></select></div>
    <div v-if="!lista" class="carregando">Carregando…</div>
    <div v-else-if="!filtrados.length" class="vazio card">Nenhum doador.</div>
    <div v-for="x in filtrados" :key="x.id" class="card mb">
      <div class="row between">
        <div><b style="font-size:1.1rem">{{ x.nome }}</b> <span class="selo cinza">{{ TIPOS[x.tipo] }}</span>
          <div class="small muted">{{ [x.contato, mascaraTel(x.telefone), x.email, x.gdc && 'GDC ' + x.gdc].filter(Boolean).join(' · ') }}</div></div>
        <div class="row"><button class="btn sec peq" @click="abrirComp(x)">+ Compromisso</button><button class="link-btn small" @click="abrirDoador(x)">Editar</button></div>
      </div>
      <table v-if="x.compromissos.length" class="mt"><tbody>
        <tr v-for="c in x.compromissos" :key="c.id">
          <td>{{ c.produto }} <span class="tiny muted">{{ c.unidade }}</span></td>
          <td class="num">{{ c.recebido }} / {{ c.quantidade }}</td>
          <td class="small">{{ c.periodicidade === 'mensal' ? 'Mensal' : 'Única' }}{{ c.prazo ? ' · até ' + dataBR(c.prazo) : '' }}</td>
          <td><span class="selo" :class="{ cumprido: 'verde', parcial: 'ambar', pendente: 'vermelho' }[c.status as string]">{{ c.status }}</span></td>
          <td><button class="link-btn small" @click="abrirComp(x, c)">Editar</button></td>
        </tr>
      </tbody></table>
    </div>

    <Modal :aberto="!!doador" :titulo="doador?.id ? 'Editar doador' : 'Novo doador'" @fechar="doador = null">
      <template v-if="doador">
        <div class="grid g2">
          <div class="campo"><label class="obrig">Nome</label><input v-model="doador.nome" type="text" /></div>
          <div class="campo"><label>Tipo</label><select v-model="doador.tipo"><option v-for="(t, k) in TIPOS" :key="k" :value="k">{{ t }}</option></select></div>
          <div class="campo"><label>Pessoa de contato</label><input v-model="doador.contato" type="text" /></div>
          <div class="campo"><label>Telefone</label><input v-model="doador.telefone" type="tel" /></div>
          <div class="campo"><label>E-mail</label><input v-model="doador.email" type="email" /></div>
          <div class="campo"><label>GDC</label><input v-model="doador.gdc" type="text" /></div>
        </div>
        <div class="campo"><label>Observações</label><textarea v-model="doador.observacoes" /></div>
        <button class="btn" :disabled="salvando" @click="salvarDoador">Salvar</button>
      </template>
    </Modal>

    <Modal :aberto="!!comp" titulo="Compromisso de doação" @fechar="comp = null">
      <template v-if="comp">
        <div class="grid g2">
          <div class="campo"><label>Produto</label><select v-model="comp.produto_id"><option value="">—</option><option v-for="p in produtos" :key="p.id" :value="p.id">{{ p.nome }} ({{ p.unidade }})</option></select></div>
          <div class="campo"><label>Quantidade</label><input v-model.number="comp.quantidade" type="number" min="1" /></div>
          <div class="campo"><label>Periodicidade</label><select v-model="comp.periodicidade"><option value="unica">Doação única</option><option value="mensal">Mensal</option></select></div>
          <div class="campo"><label>Prazo</label><input v-model="comp.prazo" type="date" /></div>
        </div>
        <div class="campo"><label>Observações</label><input v-model="comp.observacoes" type="text" /></div>
        <div class="row"><button class="btn" :disabled="salvando" @click="salvarComp">Salvar</button><div class="spacer" />
          <button v-if="comp.id" class="link-btn" style="color:var(--vermelho)" @click="excluirComp">Excluir</button></div>
      </template>
    </Modal>
    <EntradaDoacao :aberto="entrada" :produtos="produtos" :doadores="lista || []" @fechar="entrada = false" @salvo="entrada = false; carregar()" />
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'painel', papeis: ['arrecadacao'] })
const toast = useToast()
const TIPOS: Record<string, string> = { pessoa: 'Pessoa', gdc: 'GDC', empresa: 'Empresa / patrocinador', igreja: 'Igreja', outro: 'Outro' }
const lista = ref<any[] | null>(null), produtos = ref<any[]>([]), busca = ref(''), filtroStatus = ref(''), doador = ref<any>(null), comp = ref<any>(null), salvando = ref(false), entrada = ref(false)
const carregar = async () => { try { [lista.value, produtos.value] = await Promise.all([api('doadores.listar'), api('produtos.listar')]) } catch (e: any) { toast.erro(e.message) } }
onMounted(carregar)
const filtrados = computed(() => (lista.value || []).filter(x => (!busca.value || (x.nome + ' ' + x.gdc).toLowerCase().includes(busca.value.toLowerCase()))
  && (!filtroStatus.value || (filtroStatus.value === 'pendente' ? x.compromissos.some((c: any) => c.status !== 'cumprido') : x.compromissos.length && x.compromissos.every((c: any) => c.status === 'cumprido')))))
const abrirDoador = (x?: any) => { doador.value = x ? { ...x } : { nome: '', tipo: 'pessoa', contato: '', telefone: '', email: '', gdc: '', observacoes: '' } }
const abrirComp = (x: any, c?: any) => { comp.value = c ? { ...c, doador_id: x.id } : { doador_id: x.id, produto_id: '', quantidade: 1, periodicidade: 'unica', prazo: '', observacoes: '' } }
async function salvarDoador() { salvando.value = true; try { await api('doadores.salvar', doador.value); toast.ok('Doador salvo.'); doador.value = null; carregar() } catch (e: any) { toast.erro(e.message) } finally { salvando.value = false } }
async function salvarComp() { salvando.value = true; try { await api('compromissos.salvar', comp.value); toast.ok('Compromisso salvo.'); comp.value = null; carregar() } catch (e: any) { toast.erro(e.message) } finally { salvando.value = false } }
async function excluirComp() { if (!confirm('Excluir este compromisso?')) return; try { await api('compromissos.excluir', { id: comp.value.id }); comp.value = null; carregar() } catch (e: any) { toast.erro(e.message) } }
</script>
