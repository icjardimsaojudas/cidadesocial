<template>
  <div class="narrow">
    <div v-if="feito" class="card" style="text-align:center">
      <div style="font-size:3rem">🎉</div>
      <h1>Inscrição recebida!</h1>
      <p>Número da inscrição: <b class="selo laranja" style="font-size:1rem">{{ feito }}</b></p>
      <p>A equipe de triagem vai entrar em contato pelo telefone informado para agendar a entrevista e a visita.</p>
      <p class="muted small">Leve na entrevista: RG ou CNH, CPF e comprovante de endereço do responsável, e RG/certidão e CPF dos demais moradores.</p>
      <NuxtLink to="/entrar" class="btn mt">Acompanhar minha inscrição</NuxtLink>
    </div>

    <template v-else>
      <h1>Inscrição da família</h1>
      <p class="muted">Programa Família Saudável Integral · leva cerca de 5 minutos.</p>
      <div v-if="cfg && !cfg.inscricoes_familias_abertas" class="alerta vermelho">As inscrições estão fechadas no momento.</div>

      <div class="passos">
        <span v-for="(p, i) in PASSOS" :key="p" :class="{ ativo: i === passo, feito: i < passo }">{{ i + 1 }}. {{ p }}</span>
      </div>

      <form class="card" @submit.prevent="avancar" novalidate>
        <input v-model="f.site" class="oculto" tabindex="-1" autocomplete="off" aria-hidden="true" />

        <!-- 1 Responsável -->
        <div v-show="passo === 0">
          <h2>Responsável pela família</h2>
          <div class="campo"><label class="obrig">Nome completo</label><input v-model="f.responsavel.nome" type="text" autocomplete="name" /></div>
          <div class="grid g2">
            <div class="campo"><label class="obrig">CPF</label><input :value="f.responsavel.cpf" @input="f.responsavel.cpf = mascaraCpf(($event.target as any).value)" type="tel" inputmode="numeric" /></div>
            <div class="campo"><label>Data de nascimento</label><input v-model="f.responsavel.nascimento" type="date" /></div>
            <div class="campo"><label class="obrig">Telefone / WhatsApp</label><input :value="f.responsavel.telefone" @input="f.responsavel.telefone = mascaraTel(($event.target as any).value)" type="tel" inputmode="tel" /></div>
            <div class="campo"><label>E-mail</label><input v-model="f.responsavel.email" type="email" /></div>
            <div class="campo"><label>Estado civil</label>
              <select v-model="f.responsavel.estado_civil"><option value="">—</option><option v-for="o in ESTADO_CIVIL" :key="o">{{ o }}</option></select></div>
            <div class="campo"><label>Escolaridade</label>
              <select v-model="f.responsavel.escolaridade"><option value="">—</option><option v-for="o in ESCOLARIDADE" :key="o">{{ o }}</option></select></div>
          </div>
        </div>

        <!-- 2 Endereço -->
        <div v-show="passo === 1">
          <h2>Endereço</h2>
          <div class="grid g2">
            <div class="campo"><label>CEP</label><input :value="f.endereco.cep" @input="f.endereco.cep = mascaraCep(($event.target as any).value)" @blur="buscarCep" type="tel" inputmode="numeric" /><div class="ajuda">Preenche a rua automaticamente.</div></div>
            <div class="campo"><label class="obrig">Bairro</label><input v-model="f.endereco.bairro" type="text" /></div>
          </div>
          <div class="campo"><label class="obrig">Rua</label><input v-model="f.endereco.rua" type="text" /></div>
          <div class="grid g3">
            <div class="campo"><label class="obrig">Número</label><input v-model="f.endereco.numero" type="text" /></div>
            <div class="campo"><label>Complemento</label><input v-model="f.endereco.complemento" type="text" /></div>
            <div class="campo"><label>Cidade</label><input v-model="f.endereco.cidade" type="text" /></div>
          </div>
          <div class="campo"><label>Ponto de referência</label><input v-model="f.endereco.referencia" type="text" /></div>
        </div>

        <!-- 3 Família -->
        <div v-show="passo === 2">
          <h2>Quem mora com você</h2>
          <p class="muted small">Inclua todas as pessoas da casa, menos você. Se mora sozinho(a), pule esta etapa.</p>
          <div v-for="(m, i) in f.membros" :key="i" class="membro">
            <div class="row between"><b>Pessoa {{ i + 2 }}</b><button type="button" class="link-btn" @click="f.membros.splice(i, 1)">Remover</button></div>
            <div class="grid g2">
              <div class="campo"><label>Nome</label><input v-model="m.nome" type="text" /></div>
              <div class="campo"><label>Data de nascimento</label><input v-model="m.nascimento" type="date" /></div>
              <div class="campo"><label>Parentesco</label><select v-model="m.parentesco"><option value="">—</option><option v-for="o in PARENTESCO" :key="o">{{ o }}</option></select></div>
              <div class="campo"><label>Escolaridade</label><select v-model="m.escolaridade"><option value="">—</option><option v-for="o in ESCOLARIDADE" :key="o">{{ o }}</option></select></div>
            </div>
          </div>
          <button type="button" class="btn sec" @click="f.membros.push({ nome: '', nascimento: '', parentesco: '', escolaridade: '' })">+ Adicionar pessoa</button>
        </div>

        <!-- 4 Situação -->
        <div v-show="passo === 3">
          <h2>Situação da família</h2>
          <div class="grid g2">
            <div class="campo"><label>Renda mensal da casa (R$)</label><input v-model="f.renda_familiar" type="number" min="0" step="1" inputmode="numeric" /><div class="ajuda">Somando todas as pessoas. Pode ser aproximado.</div></div>
            <div class="campo"><label>Já é atendida por algum CRAS?</label>
              <select v-model="f.atendida_cras"><option value="">—</option><option value="sim">Sim</option><option value="nao">Não</option><option value="nao_sei">Não sei</option></select></div>
          </div>
          <label>Recebe algum benefício?</label>
          <div class="checks mb">
            <label v-for="b in BENEFICIOS" :key="b" class="check"><input type="checkbox" :value="b" v-model="f.beneficiosLista" />{{ b }}</label>
          </div>
          <div class="grid g2">
            <div class="campo"><label>Como conheceu o programa?</label>
              <select v-model="f.como_conheceu"><option value="">—</option><option v-for="o in COMO" :key="o">{{ o }}</option></select></div>
            <div class="campo"><label>Indicado por (se houver)</label><input v-model="f.indicado_por" type="text" /></div>
          </div>
          <div class="campo"><label>Conte por que a família quer participar</label><textarea v-model="f.motivo" maxlength="1000" /></div>
        </div>

        <!-- 5 Termos -->
        <div v-show="passo === 4">
          <h2>Termos do programa</h2>
          <template v-if="cfg">
            <div class="termo">{{ cfg.termo_participacao }}</div>
            <label class="check"><input type="checkbox" v-model="f.aceite_participacao" />Li e aceito o termo de participação, incluindo a duração de {{ cfg.duracao_meses }} meses e a presença obrigatória nos treinamentos mensais.</label>
            <div class="termo">{{ cfg.termo_lgpd }}</div>
            <label class="check"><input type="checkbox" v-model="f.aceite_lgpd" />Autorizo o uso dos meus dados e dos dados da minha família para o programa.</label>
            <div class="termo">{{ cfg.termo_imagem }}</div>
            <label class="check"><input type="checkbox" v-model="f.aceite_imagem" />Autorizo o uso de imagem (opcional — não interfere na participação).</label>
          </template>
          <div v-else class="carregando">Carregando termos…</div>
          <hr />
          <h3>Crie uma senha para acompanhar sua inscrição</h3>
          <p class="small muted">Você vai entrar com o CPF do responsável e esta senha.</p>
          <div class="grid g2">
            <div class="campo"><label class="obrig">Senha</label><input v-model="f.senha" type="password" autocomplete="new-password" /><div class="ajuda">Mínimo de 8 caracteres.</div></div>
            <div class="campo"><label class="obrig">Repita a senha</label><input v-model="senha2" type="password" autocomplete="new-password" /></div>
          </div>
        </div>

        <div class="row between mt">
          <button v-if="passo > 0" type="button" class="btn sec" @click="passo--">Voltar</button><span v-else />
          <button class="btn grande" :disabled="enviando || (cfg && !cfg.inscricoes_familias_abertas)">{{ passo < 4 ? 'Continuar' : (enviando ? 'Enviando…' : 'Enviar inscrição') }}</button>
        </div>
      </form>
    </template>
  </div>
</template>

<script setup lang="ts">
const toast = useToast()
const PASSOS = ['Responsável', 'Endereço', 'Família', 'Situação', 'Termos']
const ESTADO_CIVIL = ['Solteiro(a)', 'Casado(a)', 'União estável', 'Separado(a)/Divorciado(a)', 'Viúvo(a)']
const ESCOLARIDADE = ['Não alfabetizado', 'Fundamental incompleto', 'Fundamental completo', 'Médio incompleto', 'Médio completo', 'Superior incompleto', 'Superior completo', 'Creche/Pré-escola', 'Cursando fundamental', 'Cursando médio']
const PARENTESCO = ['Cônjuge/Companheiro(a)', 'Filho(a)', 'Enteado(a)', 'Neto(a)', 'Pai/Mãe', 'Irmão(ã)', 'Avô/Avó', 'Sobrinho(a)', 'Outro']
const BENEFICIOS = ['Bolsa Família', 'BPC/LOAS', 'Aposentadoria/Pensão', 'Auxílio municipal', 'Outro']
const COMO = ['Igreja / GDC', 'CRAS', 'Indicação de amigo ou vizinho', 'Redes sociais', 'Outro']
const cfg = ref<any>(null)
const passo = ref(0), enviando = ref(false), feito = ref(''), senha2 = ref('')
const f = reactive<any>({
  site: '', responsavel: { nome: '', cpf: '', nascimento: '', telefone: '', email: '', estado_civil: '', escolaridade: '' },
  endereco: { cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: 'São José dos Campos', referencia: '' },
  membros: [], renda_familiar: '', atendida_cras: '', beneficiosLista: [], como_conheceu: '', indicado_por: '', motivo: '',
  aceite_participacao: false, aceite_lgpd: false, aceite_imagem: false, senha: ''
})
onMounted(async () => { try { cfg.value = await api('config.publica') } catch (e: any) { toast.erro(e.message) } })

async function buscarCep() {
  const c = soDigitos(f.endereco.cep)
  if (c.length !== 8) return
  try {
    const r = await (await fetch(`https://viacep.com.br/ws/${c}/json/`)).json()
    if (!r.erro) { f.endereco.rua = r.logradouro || f.endereco.rua; f.endereco.bairro = r.bairro || f.endereco.bairro; f.endereco.cidade = r.localidade || f.endereco.cidade }
  } catch {}
}

function validar(): string {
  const r = f.responsavel
  if (passo.value === 0) {
    if (r.nome.trim().split(/\s+/).length < 2) return 'Informe o nome completo do responsável.'
    if (!cpfValido(r.cpf)) return 'CPF inválido. Confira os números.'
    if (soDigitos(r.telefone).length < 10) return 'Informe o telefone com DDD.'
  }
  if (passo.value === 1) {
    if (!f.endereco.rua || !f.endereco.numero || !f.endereco.bairro) return 'Preencha rua, número e bairro.'
  }
  if (passo.value === 2) {
    if (f.membros.some((m: any) => !m.nome.trim())) return 'Preencha o nome de todas as pessoas ou remova as linhas vazias.'
  }
  if (passo.value === 4) {
    if (!f.aceite_participacao || !f.aceite_lgpd) return 'Para continuar, aceite o termo de participação e o uso de dados.'
    if (f.senha.length < 8) return 'A senha precisa ter pelo menos 8 caracteres.'
    if (f.senha !== senha2.value) return 'As senhas não são iguais.'
  }
  return ''
}

async function avancar() {
  const msg = validar()
  if (msg) return toast.erro(msg)
  if (passo.value < 4) { passo.value++; window.scrollTo({ top: 0, behavior: 'smooth' }); return }
  enviando.value = true
  try {
    const r = await api('familia.inscrever', { ...f, recebe_beneficio: f.beneficiosLista.length > 0, beneficios: f.beneficiosLista.join(', ') })
    feito.value = r.codigo
    window.scrollTo({ top: 0 })
  } catch (e: any) { toast.erro(e.message) } finally { enviando.value = false }
}
</script>

<style scoped>
.passos { display: flex; gap: 6px; flex-wrap: wrap; margin: 14px 0; }
.passos span { font-size: .8rem; font-weight: 800; padding: 6px 12px; border-radius: 999px; background: #fff; color: var(--cinza); }
.passos span.ativo { background: var(--laranja); color: #fff; }
.passos span.feito { background: #FFE2CC; color: var(--brasa); }
.membro { border: 2px solid var(--linha); border-radius: 14px; padding: 12px 14px 2px; margin-bottom: 12px; }
</style>
