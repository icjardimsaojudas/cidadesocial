<template>
  <div>
    <div class="row between mb">
      <h1 style="margin:0">Equipe e acessos</h1>
      <button class="btn peq" @click="abrir()"><Icone nome="mais" :tam="16" />Novo usuário</button>
    </div>
    <div class="abas">
      <button :class="{ ativa: aba === 'equipe' }" @click="aba = 'equipe'"><Icone nome="equipe" :tam="16" /> Usuários da equipe ({{ usuarios?.length || 0 }})</button>
      <button :class="{ ativa: aba === 'vol' }" @click="aba = 'vol'"><Icone nome="maos" :tam="16" /> Voluntários inscritos ({{ voluntarios?.length || 0 }})<span v-if="semAcesso" class="selo laranja" style="margin-left:6px">{{ semAcesso }} sem acesso</span></button>
      <button :class="{ ativa: aba === 'perfis' }" @click="aba = 'perfis'"><Icone nome="escudo" :tam="16" /> Perfis</button>
    </div>

    <!-- EQUIPE -->
    <template v-if="aba === 'equipe'">
      <div class="row mb"><input v-model="busca" type="text" placeholder="Buscar nome ou e-mail" style="max-width:300px" />
        <select v-model="filtroPapel" style="max-width:240px"><option value="">Todos os perfis</option><option v-for="(t, k) in PERFIS" :key="k" :value="k">{{ t }}</option></select></div>
      <div v-if="!usuarios" class="carregando">Carregando…</div>
      <div v-else class="card tabela-wrap"><table>
        <thead><tr><th>Nome</th><th>E-mail (login)</th><th>Perfil</th><th>Situação</th><th>Último acesso</th><th /></tr></thead>
        <tbody><tr v-for="u in usuariosFiltrados" :key="u.id">
          <td><b>{{ u.nome }}</b><div class="tiny muted" v-if="u.voluntario_id">voluntário</div></td><td>{{ u.email }}</td>
          <td><span class="selo" :class="u.papel === 'admin' ? 'laranja' : 'cinza'">{{ PAPEIS[u.papel] }}</span></td>
          <td><span class="selo" :class="!u.ativo ? 'cinza' : u.trocar_senha ? 'ambar' : 'verde'">{{ !u.ativo ? 'inativo' : u.trocar_senha ? 'aguardando 1º acesso' : 'ativo' }}</span></td>
          <td class="small">{{ dataHoraBR(u.ultimo_login) || '—' }}</td>
          <td class="row" style="gap:8px;flex-wrap:nowrap"><button class="btn sec peq" @click="abrir(u)">Editar</button><button class="btn sec peq" @click="resetar(u)"><Icone nome="chave" :tam="15" />Senha</button></td>
        </tr></tbody>
      </table></div>
    </template>

    <!-- VOLUNTÁRIOS -->
    <template v-if="aba === 'vol'">
      <p class="small muted">Inscritos pelo link "Seja voluntário". Dê acesso ao sistema só a quem vai usar (líderes de frente, triagem, inventário, entrega). Os demais não precisam de login.</p>
      <div class="row mb"><input v-model="buscaVol" type="text" placeholder="Buscar nome, GDC, habilidade" style="max-width:300px" />
        <select v-model="filtroAcesso" style="max-width:220px"><option value="">Todos</option><option value="sem">Sem acesso</option><option value="com">Com acesso</option></select></div>
      <div v-if="!voluntarios" class="carregando">Carregando…</div>
      <div v-else-if="!voluntariosFiltrados.length" class="vazio card">Nenhum voluntário.</div>
      <div v-else class="card tabela-wrap"><table>
        <thead><tr><th>Voluntário</th><th>Frente escolhida</th><th>Habilidades</th><th>Status</th><th>Acesso ao sistema</th><th /></tr></thead>
        <tbody><tr v-for="v in voluntariosFiltrados" :key="v.id">
          <td><b>{{ v.nome }}</b><div class="tiny muted">{{ mascaraTel(v.telefone) }}{{ v.email ? ' · ' + v.email : '' }}{{ v.gdc ? ' · GDC ' + v.gdc : '' }}</div></td>
          <td class="small">{{ FRENTES[v.frente] }}</td>
          <td class="small">{{ [v.profissao, v.habilidades].filter(Boolean).join(' · ') || '—' }}</td>
          <td><Selo :valor="v.status" tipo="voluntario" /></td>
          <td><span v-if="v.acesso" class="selo" :class="v.acesso.ativo ? 'verde' : 'cinza'">{{ PAPEIS[v.acesso.papel] }}</span><span v-else class="small muted">sem acesso</span></td>
          <td><button v-if="!v.acesso" class="btn peq" @click="darAcesso(v)"><Icone nome="chave" :tam="15" />Dar acesso</button>
            <button v-else class="btn sec peq" @click="abrir(usuarios?.find(u => u.id === v.acesso.usuario_id))">Editar acesso</button></td>
        </tr></tbody>
      </table></div>
    </template>

    <!-- PERFIS -->
    <div v-if="aba === 'perfis'" class="grid g2">
      <div v-for="p in DESCRICAO" :key="p.k" class="card pad-s perfil">
        <div class="row"><span class="ic"><Icone :nome="p.i" /></span><b>{{ PAPEIS[p.k] }}</b></div>
        <p class="small muted" style="margin-top:8px">{{ p.d }}</p>
      </div>
    </div>

    <Modal :aberto="!!form" :titulo="form?.id ? 'Editar acesso' : form?.voluntario_id ? 'Dar acesso ao voluntário' : 'Novo usuário'" @fechar="form = null">
      <template v-if="form">
        <div class="grid g2">
          <div class="campo"><label class="obrig">Nome</label><input v-model="form.nome" type="text" /></div>
          <div class="campo"><label class="obrig">E-mail (será o login)</label><input v-model="form.email" type="email" /></div>
          <div class="campo"><label>Telefone</label><input v-model="form.telefone" v-mascara="'tel'" type="tel" /></div>
          <div class="campo"><label>Perfil de acesso</label><select v-model="form.papel"><option v-for="(t, k) in PERFIS" :key="k" :value="k">{{ t }}</option></select></div>
        </div>
        <p class="small muted">{{ DESCRICAO.find(d => d.k === form.papel)?.d }}</p>
        <label class="check"><input type="checkbox" v-model="form.ativo" />Acesso ativo</label>
        <button class="btn" :disabled="salvando" @click="salvar">{{ form.id ? 'Salvar' : 'Criar acesso e gerar senha' }}</button>
      </template>
    </Modal>
    <Modal :aberto="!!senha" titulo="Credenciais de acesso" @fechar="senha = null">
      <template v-if="senha">
        <div class="cred">
          <div><span class="small muted">Endereço</span><b>{{ siteUrl }}</b></div>
          <div><span class="small muted">Login</span><b>{{ senha.email }}</b></div>
          <div><span class="small muted">Senha provisória</span><b class="grande">{{ senha.senha }}</b></div>
        </div>
        <p class="small muted mt">Passe pessoalmente ou em conversa individual (nunca em grupo). No primeiro acesso, o sistema pede para criar uma senha pessoal.</p>
        <button class="btn sec" @click="copiar">Copiar mensagem</button>
      </template>
    </Modal>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'painel', papeis: ['admin'] })
const toast = useToast()
const PERFIS = Object.fromEntries(Object.entries(PAPEIS).filter(([k]) => k !== 'familia'))
const DESCRICAO = [
  { k: 'admin', i: 'escudo', d: 'Gestor do projeto e pastor. Vê e faz tudo: equipe, relatórios, configurações, termos e auditoria.' },
  { k: 'triagem', i: 'prancheta', d: 'Assistente social e equipe de triagem. Fichas das famílias, entrevistas, CRAS, visitas, documentos e decisão.' },
  { k: 'arrecadacao', i: 'cesta', d: 'Líder da arrecadação e montagem. Doadores, compromissos, doações recebidas, estoque, meta e modelo da cesta.' },
  { k: 'estoque', i: 'caixa', d: 'Voluntários do inventário. Só conferência do estoque e registro das cestas montadas.' },
  { k: 'treinamento', i: 'calendario', d: 'Líder da entrega e treinamento. Cronograma, presença das famílias, entrega das cestas e onboarding dos voluntários.' }
]
const SUGESTAO: Record<string, string> = { arrecadacao: 'estoque', triagem: 'triagem', entrega: 'treinamento', qualquer: 'estoque' }
const aba = ref('equipe'), usuarios = ref<any[] | null>(null), voluntarios = ref<any[] | null>(null)
const busca = ref(''), filtroPapel = ref(''), buscaVol = ref(''), filtroAcesso = ref('')
const form = ref<any>(null), senha = ref<any>(null), salvando = ref(false)
const siteUrl = computed(() => location.origin + location.pathname)
async function carregar() {
  try { [usuarios.value, voluntarios.value] = await Promise.all([api('usuarios.listar'), api('voluntarios.listar')]) } catch (e: any) { toast.erro(e.message) }
}
onMounted(carregar)
const usuariosFiltrados = computed(() => (usuarios.value || []).filter(u => (!filtroPapel.value || u.papel === filtroPapel.value) && (!busca.value || (u.nome + u.email).toLowerCase().includes(busca.value.toLowerCase()))))
const voluntariosFiltrados = computed(() => (voluntarios.value || []).filter(v => (!filtroAcesso.value || (filtroAcesso.value === 'com' ? v.acesso : !v.acesso))
  && (!buscaVol.value || [v.nome, v.gdc, v.habilidades, v.profissao].join(' ').toLowerCase().includes(buscaVol.value.toLowerCase()))))
const semAcesso = computed(() => (voluntarios.value || []).filter(v => !v.acesso && v.status !== 'inativo').length)
const abrir = (u?: any) => { if (u === undefined) form.value = { nome: '', email: '', telefone: '', papel: 'triagem', ativo: true }; else if (u) form.value = { ...u } }
const darAcesso = (v: any) => { form.value = { nome: v.nome, email: v.email, telefone: v.telefone, papel: SUGESTAO[v.frente] || 'estoque', ativo: true, voluntario_id: v.id } }
async function salvar() {
  salvando.value = true
  try {
    const r = await api('usuarios.salvar', { ...form.value, telefone: soDigitos(form.value.telefone) })
    if (r.senha_temporaria) senha.value = { email: form.value.email.toLowerCase(), senha: r.senha_temporaria }
    form.value = null; toast.ok('Acesso salvo.'); carregar()
  } catch (e: any) { toast.erro(e.message) } finally { salvando.value = false }
}
async function resetar(u: any) {
  if (!confirm('Gerar nova senha provisória para ' + u.nome + '?')) return
  try { senha.value = { email: u.email, senha: (await api('usuarios.resetarSenha', { id: u.id })).senha_temporaria }; carregar() } catch (e: any) { toast.erro(e.message) }
}
async function copiar() {
  const txt = `Olá! Seu acesso ao sistema do FSI São Judas:\nEndereço: ${siteUrl.value}\nLogin: ${senha.value.email}\nSenha provisória: ${senha.value.senha}\nNo primeiro acesso, crie sua senha pessoal.`
  try { await navigator.clipboard.writeText(txt); toast.ok('Mensagem copiada.') } catch { prompt('Copie:', txt) }
}
</script>
<style scoped>
.abas button { display: inline-flex; align-items: center; gap: 6px; }
.cred { display: grid; gap: 10px; background: var(--creme); border-radius: 14px; padding: 16px; }
.cred div { display: flex; flex-direction: column; }
.cred b { font-size: 1.05rem; word-break: break-all; }
.cred b.grande { font-size: 1.6rem; letter-spacing: .05em; color: var(--laranja); }
.perfil .ic { width: 40px; height: 40px; border-radius: 12px; background: #FFF0E3; color: var(--laranja); display: flex; align-items: center; justify-content: center; }
</style>
