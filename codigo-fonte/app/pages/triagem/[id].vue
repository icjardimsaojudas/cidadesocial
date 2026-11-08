<template>
  <div>
    <NuxtLink to="/triagem" class="small">← Voltar para a lista</NuxtLink>
    <div v-if="!d" class="carregando">Carregando…</div>
    <template v-else>
      <div class="row between mt mb">
        <div>
          <h1 style="margin:0">{{ d.familia.responsavel_nome }}</h1>
          <span class="muted">{{ d.familia.codigo }} · {{ d.familia.qtd_pessoas }} pessoa(s)</span> · <Selo :valor="d.familia.status" />
        </div>
        <a class="btn sec peq" :href="'https://wa.me/55' + d.familia.responsavel_telefone" target="_blank" rel="noopener">WhatsApp {{ mascaraTel(d.familia.responsavel_telefone) }}</a>
      </div>

      <div class="abas">
        <button v-for="(t, k) in ABAS" :key="k" :class="{ ativa: aba === k }" @click="aba = k">{{ t }}</button>
      </div>

      <!-- RESUMO -->
      <div v-if="aba === 'resumo'" class="grid g2">
        <div class="card"><h2>Etapas</h2><Etapas :etapas="d.etapas" /></div>
        <div class="stack">
          <div class="card">
            <h2>Inscrição</h2>
            <p class="small"><b>Endereço:</b> {{ d.familia.endereco_rua }}, {{ d.familia.endereco_numero }} {{ d.familia.endereco_complemento }} · {{ d.familia.endereco_bairro }} · {{ d.familia.endereco_cidade }}</p>
            <p class="small"><b>Renda informada:</b> {{ moeda(d.familia.renda_familiar) }} · <b>Benefícios:</b> {{ d.familia.beneficios || 'nenhum' }}</p>
            <p class="small"><b>Como conheceu:</b> {{ d.familia.como_conheceu || '—' }} {{ d.familia.indicado_por ? '· indicado por ' + d.familia.indicado_por : '' }}</p>
            <p class="small"><b>Motivo:</b> {{ d.familia.motivo_inscricao || '—' }}</p>
            <p class="small"><b>Termo:</b> versão {{ d.familia.termo_versao }} em {{ dataHoraBR(d.familia.termo_aceito_em) }} · <b>Imagem:</b> {{ d.familia.imagem_autorizada === 'sim' ? 'autorizada' : 'não autorizada' }}</p>
          </div>
          <div class="card" v-if="d.familia.status === 'ativa' || d.presencas.lista.length">
            <h2>Participação</h2>
            <p>Presenças {{ d.presencas.presencas }} · Faltas {{ d.presencas.faltas }} ({{ d.presencas.faltas_sem_justificativa }} sem justificativa) · Cestas {{ d.presencas.cestas }}</p>
            <p class="small muted" v-if="d.familia.data_entrada">Programa: {{ dataBR(d.familia.data_entrada) }} a {{ dataBR(d.familia.data_prevista_saida) }} · Grupo {{ d.familia.grupo || '—' }}</p>
          </div>
        </div>
      </div>

      <!-- CADASTRO -->
      <div v-if="aba === 'cadastro'" class="card">
        <h2>Dados do responsável e endereço</h2>
        <div class="grid g3">
          <div class="campo"><label>Nome</label><input v-model="cad.responsavel_nome" type="text" /></div>
          <div class="campo"><label>CPF</label><input :value="mascaraCpf(d.familia.responsavel_cpf)" type="text" disabled /></div>
          <div class="campo"><label>Nascimento</label><input v-model="cad.responsavel_nascimento" type="date" /></div>
          <div class="campo"><label>Telefone</label><input v-model="cad.responsavel_telefone" type="tel" /></div>
          <div class="campo"><label>E-mail</label><input v-model="cad.responsavel_email" type="email" /></div>
          <div class="campo"><label>Estado civil</label><input v-model="cad.responsavel_estado_civil" type="text" /></div>
          <div class="campo"><label>Escolaridade</label><input v-model="cad.responsavel_escolaridade" type="text" /></div>
          <div class="campo"><label>CEP</label><input v-model="cad.endereco_cep" type="text" /></div>
          <div class="campo"><label>Rua</label><input v-model="cad.endereco_rua" type="text" /></div>
          <div class="campo"><label>Número</label><input v-model="cad.endereco_numero" type="text" /></div>
          <div class="campo"><label>Complemento</label><input v-model="cad.endereco_complemento" type="text" /></div>
          <div class="campo"><label>Bairro</label><input v-model="cad.endereco_bairro" type="text" /></div>
          <div class="campo"><label>Cidade</label><input v-model="cad.endereco_cidade" type="text" /></div>
          <div class="campo"><label>Ponto de referência</label><input v-model="cad.ponto_referencia" type="text" /></div>
          <div class="campo"><label>Grupo</label><input v-model="cad.grupo" type="text" placeholder="Ex.: A" /></div>
        </div>
        <h2 class="mt">Composição familiar</h2>
        <div class="tabela-wrap"><table>
          <thead><tr><th>Nome</th><th>Nascimento</th><th>Idade</th><th>Parentesco</th><th>Escolaridade</th><th>CPF</th><th /></tr></thead>
          <tbody>
            <tr v-for="(m, i) in membros" :key="i">
              <td><input v-model="m.nome" type="text" /></td><td><input v-model="m.nascimento" type="date" /></td>
              <td class="num">{{ idade(m.nascimento) ?? '—' }}</td>
              <td><input v-model="m.parentesco" type="text" /></td><td><input v-model="m.escolaridade" type="text" /></td>
              <td><input v-model="m.cpf" type="text" /></td>
              <td><button class="link-btn" @click="membros.splice(i, 1)">Remover</button></td>
            </tr>
          </tbody>
        </table></div>
        <div class="row mt">
          <button class="btn sec" @click="membros.push({ nome: '', nascimento: '', parentesco: '', escolaridade: '', cpf: '' })">+ Pessoa</button>
          <div class="spacer" />
          <button class="btn" :disabled="salvando" @click="salvarCadastro">Salvar cadastro</button>
        </div>
      </div>

      <!-- ENTREVISTA -->
      <div v-if="aba === 'entrevista'" class="card">
        <h2>Entrevista socioeconômica</h2>
        <p class="small muted">Baseada na ficha "Perfil Socioeconômico – Atendimentos" da Cidade Social. Dados sensíveis: só a equipe de triagem e a administração veem.</p>
        <div class="grid g3">
          <div class="campo"><label>Data da entrevista</label><input v-model="t.data_entrevista" type="date" /></div>
          <div class="campo"><label>Local de nascimento</label><input v-model="t.local_nascimento" type="text" /></div>
          <div class="campo"><label>Situação de trabalho</label>
            <select v-model="t.situacao_trabalho"><option value="">—</option><option v-for="o in TRABALHO" :key="o">{{ o }}</option></select></div>
          <div class="campo" v-if="t.situacao_trabalho === 'Desempregado(a)'"><label>Desempregado desde</label><input v-model="t.desempregado_desde" type="date" /></div>
        </div>
        <h3>Renda</h3>
        <div v-for="(r, i) in t.renda_origens" :key="i" class="row mb">
          <input v-model="r.origem" type="text" placeholder="Origem (ex.: salário, bico, benefício)" style="flex:2" />
          <input v-model="r.valor" type="number" min="0" placeholder="R$" style="flex:1" />
          <button class="link-btn" @click="t.renda_origens.splice(i, 1)">✕</button>
        </div>
        <button class="btn sec peq mb" @click="t.renda_origens.push({ origem: '', valor: '' })">+ Fonte de renda</button>
        <p><b>Renda total:</b> {{ moeda(rendaTotal) }} · <b>Per capita:</b> {{ moeda(rendaTotal / (+d.familia.qtd_pessoas || 1)) }}</p>
        <div class="campo"><label>Custo familiar mensal (aluguel, contas…)</label><input v-model="t.custo_familiar" type="text" /></div>
        <h3>Programas sociais</h3>
        <div class="checks mb"><label v-for="(txt, k) in PROGRAMAS" :key="k" class="check"><input type="checkbox" v-model="t.programas_sociais[k]" />{{ txt }}</label></div>
        <div class="grid g3">
          <div class="campo"><label>Inscrita no CadÚnico?</label><select v-model="t.cadunico"><option value="">—</option><option value="sim">Sim</option><option value="nao">Não</option><option value="nao_sei">Não sabe</option></select></div>
          <div class="campo"><label>NIS</label><input v-model="t.nis" type="text" /></div>
        </div>
        <h3>Saúde na família</h3>
        <div class="checks mb"><label v-for="(txt, k) in SAUDE" :key="k" class="check"><input type="checkbox" v-model="t.saude[k]" />{{ txt }}</label></div>
        <div class="campo"><label>Medicação de uso contínuo</label><input v-model="t.medicacao" type="text" /></div>
        <h3>Convivência familiar</h3>
        <div class="checks mb"><label v-for="(txt, k) in CONVIVENCIA" :key="k" class="check"><input type="checkbox" v-model="t.convivencia[k]" />{{ txt }}</label></div>
        <h3>Moradia</h3>
        <div class="grid g3">
          <div class="campo"><label>Tipo</label><select v-model="t.habitacao_tipo"><option value="">—</option><option v-for="o in HABITACAO" :key="o">{{ o }}</option></select></div>
          <div class="campo"><label>Nº de cômodos</label><input v-model="t.comodos" type="number" min="0" /></div>
        </div>
        <div class="grid g2">
          <div class="campo"><label>Interesse em cursos / capacitação</label><textarea v-model="t.interesse_cursos" /></div>
          <div class="campo"><label>Encaminhamentos</label><textarea v-model="t.encaminhamentos" /></div>
        </div>
        <div class="campo"><label>Observações da entrevista</label><textarea v-model="t.observacoes" /></div>
        <button class="btn" :disabled="salvando" @click="salvarTriagem">Salvar entrevista</button>
      </div>

      <!-- CRAS -->
      <div v-if="aba === 'cras'" class="card">
        <h2>CRAS e rede de assistência</h2>
        <p class="small muted">CRAS = Centro de Referência de Assistência Social da prefeitura. Registre se a família já é acompanhada e por qual unidade.</p>
        <div class="grid g3">
          <div class="campo"><label>Atendida pelo CRAS?</label><select v-model="t.cras_atendida"><option value="">—</option><option value="sim">Sim</option><option value="nao">Não</option><option value="nao_sei">Não sabe</option></select></div>
          <div class="campo"><label>Qual CRAS</label><input v-model="t.cras_nome" type="text" /></div>
          <div class="campo"><label>Contato no CRAS</label><input v-model="t.cras_contato" type="text" /></div>
        </div>
        <div class="campo"><label>Observações (encaminhamento, contrarreferência…)</label><textarea v-model="t.cras_observacoes" /></div>
        <h3>Outros serviços que acompanham a família</h3>
        <div class="checks mb"><label v-for="o in REDE" :key="o" class="check"><input type="checkbox" v-model="t.rede_socioassistencial[o]" />{{ o }}</label></div>
        <button class="btn" :disabled="salvando" @click="salvarTriagem">Salvar</button>
      </div>

      <!-- DOCUMENTOS -->
      <div v-if="aba === 'documentos'" class="grid g2">
        <div class="card">
          <h2>Conferência de documentos</h2>
          <label v-for="(txt, k) in DOCS" :key="k" class="check"><input type="checkbox" v-model="t.docs_checklist[k]" />{{ txt }}</label>
          <button class="btn mt" :disabled="salvando" @click="salvarTriagem">Salvar conferência</button>
          <p class="tiny muted mt">Não fotografe documentos com celular pessoal nem envie por WhatsApp. Use o envio abaixo: o arquivo vai para a pasta sigilosa do Drive.</p>
        </div>
        <div class="card">
          <h2>Arquivos</h2>
          <div class="grid g2">
            <div class="campo"><label>Tipo</label><select v-model="tipoDoc"><option v-for="(txt, k) in TIPOS_DOC" :key="k" :value="k">{{ txt }}</option></select></div>
            <div class="campo"><label>Arquivo (PDF/JPG/PNG, até 5 MB)</label><input type="file" accept="application/pdf,image/jpeg,image/png" @change="enviarDoc" :disabled="salvando" /></div>
          </div>
          <div v-if="!d.documentos.length" class="muted small">Nenhum arquivo.</div>
          <div v-for="x in d.documentos" :key="x.id" class="row between doc">
            <span>📄 <b>{{ TIPOS_DOC[x.tipo] || x.tipo }}</b><span class="tiny muted"> · {{ dataBR(x.created_at) }} · {{ x.enviado_por_nome }}</span></span>
            <span class="row"><button class="btn sec peq" @click="baixar(x.id)">Abrir</button><button class="link-btn small" @click="excluirDoc(x.id)">Excluir</button></span>
          </div>
        </div>
      </div>

      <!-- VISITAS -->
      <div v-if="aba === 'visitas'" class="card">
        <div class="row between"><h2>Visitas domiciliares</h2><button class="btn peq" @click="abrirVisita()">+ Agendar visita</button></div>
        <div v-if="!d.visitas.length" class="muted">Nenhuma visita registrada.</div>
        <div v-for="v in d.visitas" :key="v.id" class="visita">
          <div class="row between"><b>{{ dataBR(v.data) }} {{ v.hora }}</b><span class="selo" :class="{ agendada: 'azul', realizada: 'verde', cancelada: 'cinza' }[v.status as string]">{{ v.status }}</span></div>
          <div class="small">Responsáveis: {{ v.responsaveis || '—' }}</div>
          <div class="small" v-if="v.condicoes_moradia"><b>Condições:</b> {{ v.condicoes_moradia }}</div>
          <div class="small" v-if="v.observacoes"><b>Obs.:</b> {{ v.observacoes }}</div>
          <button class="link-btn small" @click="abrirVisita(v)">Editar / registrar resultado</button>
        </div>
      </div>

      <!-- PARECER -->
      <div v-if="aba === 'parecer'" class="grid g2">
        <div class="card">
          <h2>Parecer e decisão</h2>
          <div class="campo"><label>Parecer da triagem</label><textarea v-model="dec.parecer" style="min-height:140px" /></div>
          <div class="grid g2">
            <div class="campo"><label>Data de entrada (se aprovada)</label><input v-model="dec.data_entrada" type="date" /></div>
            <div class="campo"><label>Grupo</label><input v-model="dec.grupo" type="text" placeholder="Ex.: A" /></div>
          </div>
          <div class="row">
            <button class="btn verde" :disabled="salvando" @click="decidir('aprovada')">Aprovar</button>
            <button class="btn sec" :disabled="salvando" @click="decidir('lista_espera')">Lista de espera</button>
            <button class="btn perigo" :disabled="salvando" @click="decidir('nao_aprovada')">Não aprovar</button>
          </div>
          <p v-if="d.triagem?.decisao" class="small muted mt">Última decisão: <b>{{ d.triagem.decisao }}</b> em {{ dataHoraBR(d.triagem.decidido_em) }}</p>
        </div>
        <div class="stack">
          <div class="card" v-if="['ativa', 'lista_espera', 'em_triagem', 'inscrita'].includes(d.familia.status)">
            <h2>Encerrar participação</h2>
            <div class="campo"><label>Motivo</label><select v-model="enc.motivo"><option value="">—</option><option v-for="(txt, k) in MOTIVOS_SAIDA" :key="k" :value="k">{{ txt }}</option></select></div>
            <div class="campo"><label>Detalhe</label><input v-model="enc.detalhe" type="text" /></div>
            <button class="btn escuro" :disabled="salvando" @click="encerrar">{{ enc.motivo === 'conclusao' ? 'Registrar conclusão' : 'Desligar família' }}</button>
          </div>
          <div class="card" v-else-if="d.familia.data_saida">
            <h2>Encerramento</h2><p>{{ dataBR(d.familia.data_saida) }} · {{ d.familia.motivo_saida }}</p>
          </div>
          <div class="card">
            <h2>Acesso da família</h2>
            <p class="small muted">A família entra com o CPF do responsável. Se esqueceu a senha, gere uma provisória.</p>
            <button class="btn sec" @click="resetarSenha">Gerar senha provisória</button>
            <p v-if="senhaTemp" class="alerta mt">Senha provisória: <b style="font-size:1.2rem">{{ senhaTemp }}</b><br><span class="small">Informe à família pessoalmente. Ela será pedida para trocar no primeiro acesso.</span></p>
          </div>
        </div>
      </div>

      <!-- HISTÓRICO -->
      <div v-if="aba === 'historico'" class="card">
        <h2>Histórico</h2>
        <table><tbody>
          <tr v-for="h in d.historico" :key="h.id"><td class="small" style="white-space:nowrap">{{ dataHoraBR(h.created_at) }}</td><td><b>{{ h.evento }}</b><div class="tiny muted">{{ h.detalhe }}</div></td><td class="small muted">{{ h.usuario_nome || 'Família' }}</td></tr>
        </tbody></table>
      </div>
    </template>

    <Modal :aberto="!!visita" titulo="Visita domiciliar" @fechar="visita = null">
      <template v-if="visita">
        <div class="grid g3">
          <div class="campo"><label>Data</label><input v-model="visita.data" type="date" /></div>
          <div class="campo"><label>Hora</label><input v-model="visita.hora" type="time" /></div>
          <div class="campo"><label>Status</label><select v-model="visita.status"><option value="agendada">Agendada</option><option value="realizada">Realizada</option><option value="cancelada">Cancelada</option></select></div>
        </div>
        <div class="campo"><label>Voluntários responsáveis</label><input v-model="visita.responsaveis" type="text" placeholder="Sempre em dupla" /></div>
        <div class="campo"><label>Condições da moradia</label><textarea v-model="visita.condicoes_moradia" /></div>
        <div class="campo"><label>Observações</label><textarea v-model="visita.observacoes" /></div>
        <button class="btn" :disabled="salvando" @click="salvarVisita">Salvar visita</button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'painel', papeis: ['triagem'] })
const toast = useToast()
const route = useRoute()
const id = String(route.params.id)
const ABAS: Record<string, string> = { resumo: 'Resumo', cadastro: 'Cadastro', entrevista: 'Entrevista', cras: 'CRAS e rede', documentos: 'Documentos', visitas: 'Visitas', parecer: 'Parecer', historico: 'Histórico' }
const TRABALHO = ['Empregado(a) com carteira', 'Trabalho informal / bico', 'Autônomo(a)', 'Desempregado(a)', 'Aposentado(a) / pensionista', 'Do lar', 'Estudante']
const PROGRAMAS: Record<string, string> = { bf: 'Bolsa Família', bpc: 'BPC / LOAS', rm: 'Renda Mínima (RM)', pic: 'PIC', rc: 'Renda Cidadã (RC)', ph: 'Programa habitacional (PH)', pro_trabalho: 'Pró Trabalho', outros: 'Outros' }
const SAUDE: Record<string, string> = { neurologico: 'Neurológico', psiquiatrico: 'Psiquiátrico', fonoaudiologico: 'Fonoaudiológico', psicologico: 'Psicológico', dependencia: 'Dependência química', outras: 'Outras' }
const CONVIVENCIA: Record<string, string> = { dependencia: 'Dependência química', conflito_lei: 'Recluso / em conflito com a lei', doenca_mental: 'Doença mental', infecto: 'Doença infectocontagiosa' }
const HABITACAO = ['Alugada', 'Própria', 'Cedida', 'Financiada', 'Programa habitacional', 'Área irregular']
const REDE = ['CRAS', 'CREAS', 'Conselho Tutelar', 'Vara da Infância', 'CAPS Infantil', 'CAPS AD', 'Ambulatório de Saúde Mental', 'Casulo', 'Sorri', 'Supera', 'Integra', 'Fundhas', 'Outro']
const DOCS: Record<string, string> = { rg_responsavel: 'RG ou CNH do responsável', cpf_responsavel: 'CPF do responsável', comprovante_endereco: 'Comprovante de endereço atualizado', docs_moradores: 'RG/certidão e CPF dos demais moradores', termo_assinado: 'Termo de participação assinado (opcional)' }

const aba = ref('resumo'), d = ref<any>(null), salvando = ref(false), tipoDoc = ref('rg_cnh'), senhaTemp = ref('')
const cad = reactive<any>({}), membros = ref<any[]>([])
const t = reactive<any>({})
const dec = reactive<any>({ parecer: '', data_entrada: hojeISO(), grupo: '' })
const enc = reactive<any>({ motivo: '', detalhe: '' })
const visita = ref<any>(null)
const rendaTotal = computed(() => (t.renda_origens || []).reduce((a: number, r: any) => a + (parseFloat(r.valor) || 0), 0))

async function carregar() {
  try {
    d.value = await api('familias.obter', { id })
    const f = d.value.familia
    Object.assign(cad, f)
    membros.value = d.value.membros.map((m: any) => ({ ...m }))
    const tr = d.value.triagem || {}
    Object.assign(t, {
      data_entrevista: tr.data_entrevista || '', local_nascimento: tr.local_nascimento || '', situacao_trabalho: tr.situacao_trabalho || '',
      desempregado_desde: tr.desempregado_desde || '', renda_origens: tr.renda_origens || [], custo_familiar: tr.custo_familiar || '',
      programas_sociais: tr.programas_sociais || {}, cadunico: tr.cadunico || '', nis: tr.nis || '', saude: tr.saude || {}, medicacao: tr.medicacao || '',
      convivencia: tr.convivencia || {}, rede_socioassistencial: tr.rede_socioassistencial || {}, cras_atendida: tr.cras_atendida || f.atendida_cras || '',
      cras_nome: tr.cras_nome || '', cras_contato: tr.cras_contato || '', cras_observacoes: tr.cras_observacoes || '', habitacao_tipo: tr.habitacao_tipo || '',
      comodos: tr.comodos || '', interesse_cursos: tr.interesse_cursos || '', encaminhamentos: tr.encaminhamentos || '', observacoes: tr.observacoes || '',
      docs_checklist: tr.docs_checklist || {}
    })
    dec.parecer = tr.parecer || ''; dec.grupo = f.grupo || ''
  } catch (e: any) { toast.erro(e.message) }
}
onMounted(carregar)

async function rodar(fn: () => Promise<any>, msg: string) {
  salvando.value = true
  try { await fn(); toast.ok(msg); await carregar(); return true } catch (e: any) { toast.erro(e.message); return false } finally { salvando.value = false }
}
const salvarCadastro = () => rodar(() => api('familias.atualizar', { id, campos: cad, membros: membros.value }), 'Cadastro salvo.')
const salvarTriagem = () => rodar(() => api('triagem.salvar', { familia_id: id, ...t, renda_total: String(rendaTotal.value) }), 'Ficha salva.')
function decidir(decisao: string) {
  const rot: any = { aprovada: 'aprovar esta família', lista_espera: 'colocar em lista de espera', nao_aprovada: 'não aprovar esta família' }
  if (!confirm('Confirma ' + rot[decisao] + '?')) return
  rodar(() => api('triagem.decidir', { familia_id: id, decisao, ...dec }), 'Decisão registrada.')
}
function encerrar() {
  if (!enc.motivo) return toast.erro('Escolha o motivo.')
  if (!confirm('Confirma o encerramento da participação?')) return
  rodar(() => api('familias.encerrar', { familia_id: id, motivo: enc.motivo, detalhe: enc.detalhe, tipo: enc.motivo === 'conclusao' ? 'concluida' : 'desligada' }), 'Registrado.')
}
async function resetarSenha() {
  if (!confirm('Gerar uma nova senha provisória para a família?')) return
  try { senhaTemp.value = (await api('familias.resetarSenha', { familia_id: id })).senha_temporaria } catch (e: any) { toast.erro(e.message) }
}
async function enviarDoc(ev: any) {
  const arq: File = ev.target.files[0]; if (!arq) return
  if (arq.size > 5 * 1024 * 1024) { ev.target.value = ''; return toast.erro('Arquivo maior que 5 MB.') }
  await rodar(async () => api('documentos.enviar', { familia_id: id, tipo: tipoDoc.value, mime: arq.type, base64: await lerArquivoBase64(arq) }), 'Documento enviado.')
  ev.target.value = ''
}
async function baixar(docId: string) {
  try { const r = await api('documentos.baixar', { id: docId }); baixarBase64(r.nome, r.mime, r.base64) } catch (e: any) { toast.erro(e.message) }
}
function excluirDoc(docId: string) { if (confirm('Excluir este arquivo?')) rodar(() => api('documentos.excluir', { id: docId }), 'Arquivo excluído.') }
function abrirVisita(v?: any) { visita.value = v ? { ...v } : { data: '', hora: '', status: 'agendada', responsaveis: '', condicoes_moradia: '', observacoes: '' } }
async function salvarVisita() { if (await rodar(() => api('visitas.salvar', { familia_id: id, ...visita.value }), 'Visita salva.')) visita.value = null }
</script>

<style scoped>
.doc { padding: 8px 0; border-bottom: 1px solid var(--linha); }
.visita { border: 2px solid var(--linha); border-radius: 14px; padding: 12px 14px; margin-top: 10px; }
td input { min-width: 110px; padding: 7px 8px; }
</style>
