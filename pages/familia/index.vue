<template>
  <div>
    <div v-if="!d" class="carregando">Carregando…</div>
    <template v-else>
      <div class="row between mb">
        <div><h1>Olá, {{ d.familia.responsavel_nome.split(' ')[0] }}!</h1>
          <span class="muted">Inscrição {{ d.familia.codigo }}</span> · <Selo :valor="d.familia.status" /></div>
      </div>

      <div v-if="d.familia.status === 'ativa' && d.presencas.faltas_sem_justificativa >= d.limite_faltas" class="alerta vermelho mb">
        Você tem {{ d.presencas.faltas_sem_justificativa }} falta(s) sem justificativa. Procure a coordenação.
      </div>

      <div class="grid g4 mb">
        <div class="kpi"><div class="n">{{ d.presencas.presencas }}</div><div class="l">Presenças</div></div>
        <div class="kpi"><div class="n">{{ d.presencas.faltas }}</div><div class="l">Faltas</div></div>
        <div class="kpi"><div class="n">{{ d.presencas.cestas }}</div><div class="l">Cestas recebidas</div></div>
        <div class="kpi"><div class="n">{{ d.membros.length + 1 }}</div><div class="l">Pessoas na família</div></div>
      </div>

      <div class="grid g2">
        <div class="card"><h2>Seu processo</h2><Etapas :etapas="d.etapas" /></div>
        <div class="stack">
          <div class="card">
            <h2>Próximos encontros</h2>
            <div v-if="!d.proximos.length" class="muted">Ainda não há encontros marcados.</div>
            <div v-for="e in d.proximos" :key="e.data" class="enc">
              <div class="dia"><b>{{ dataBR(e.data).substring(0, 5) }}</b><span>{{ diaSemana(e.data).split('-')[0] }}</span></div>
              <div><b>{{ e.titulo }}</b><div class="small muted">{{ e.hora_inicio ? 'às ' + e.hora_inicio : '' }} {{ e.local }}</div></div>
            </div>
          </div>
          <div class="card">
            <h2>Treinamentos e presenças</h2>
            <div v-if="!d.presencas.lista.length" class="muted">Nenhum encontro registrado ainda.</div>
            <table v-else><tbody>
              <tr v-for="p in d.presencas.lista" :key="p.encontro_id">
                <td>{{ dataBR(p.data) }}</td><td>{{ p.titulo }}<div class="tiny muted">{{ p.tema_cidadania }}</div></td>
                <td><span class="selo" :class="p.presente ? 'verde' : (p.justificada ? 'ambar' : 'vermelho')">{{ p.presente ? 'Presente' : (p.justificada ? 'Falta justificada' : 'Falta') }}</span></td>
              </tr>
            </tbody></table>
          </div>
        </div>
      </div>

      <div class="grid g2 mt">
        <div class="card">
          <h2>Enviar documentos</h2>
          <p class="small muted">PDF ou foto (até 5 MB). Os arquivos ficam em pasta sigilosa, vistos só pela equipe de triagem.</p>
          <div class="grid g2">
            <div class="campo"><label>Tipo</label><select v-model="tipoDoc"><option v-for="(t, k) in TIPOS_DOC" :key="k" :value="k">{{ t }}</option></select></div>
            <div class="campo"><label>Arquivo</label><input type="file" accept="application/pdf,image/jpeg,image/png" @change="enviarDoc" :disabled="enviando" /></div>
          </div>
          <div v-for="x in d.documentos" :key="x.id" class="small">📄 {{ TIPOS_DOC[x.tipo] || x.tipo }} · {{ dataBR(x.created_at) }}</div>
        </div>
        <div class="card">
          <h2>Termos e privacidade</h2>
          <p class="small">Termo de participação versão {{ d.familia.termo_versao }}, aceito em {{ dataHoraBR(d.familia.termo_aceito_em) }}.</p>
          <label class="check"><input type="checkbox" :checked="d.familia.imagem_autorizada" @change="mudarImagem(($event.target as any).checked)" />Autorizo o uso de imagem da minha família.</label>
          <p class="tiny muted">Você pode mudar esta escolha quando quiser. Para corrigir ou excluir dados, fale com a coordenação.</p>
          <h3 class="mt">Família</h3>
          <div class="chip-lista"><span class="selo cinza" v-for="m in d.membros" :key="m.id">{{ m.nome.split(' ')[0] }} · {{ m.parentesco }}{{ m.idade !== null ? ', ' + m.idade + ' anos' : '' }}</span></div>
        </div>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'painel', papeis: ['familia'] })
const toast = useToast()
const d = ref<any>(null), tipoDoc = ref('rg_cnh'), enviando = ref(false)
const carregar = async () => { try { d.value = await api('portal.minha') } catch (e: any) { toast.erro(e.message) } }
onMounted(carregar)
async function enviarDoc(ev: any) {
  const arq: File = ev.target.files[0]; if (!arq) return
  if (arq.size > 5 * 1024 * 1024) { ev.target.value = ''; return toast.erro('Arquivo maior que 5 MB.') }
  enviando.value = true
  try { await api('documentos.enviar', { tipo: tipoDoc.value, mime: arq.type, base64: await lerArquivoBase64(arq) }); toast.ok('Documento enviado.'); carregar() }
  catch (e: any) { toast.erro(e.message) } finally { enviando.value = false; ev.target.value = '' }
}
async function mudarImagem(v: boolean) {
  try { await api('portal.imagem', { autorizada: v }); toast.ok('Preferência salva.'); carregar() } catch (e: any) { toast.erro(e.message) }
}
</script>
<style scoped>
.enc { display: flex; gap: 14px; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--linha); }
.enc:last-child { border: none; }
.dia { background: var(--laranja); color: #fff; border-radius: 12px; padding: 6px 10px; text-align: center; min-width: 64px; line-height: 1.1; }
.dia b { font-size: 1.1rem; display: block; } .dia span { font-size: .7rem; text-transform: uppercase; }
</style>
