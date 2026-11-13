/**
 * FSI · IC Jardim São Judas — Backend (Google Sheets + Apps Script)
 * ---------------------------------------------------------------
 * - Cada aba = uma tabela (mesmos nomes do futuro schema.sql/Supabase).
 * - Nenhuma credencial neste código: segredos ficam nas Propriedades do Script,
 *   criadas automaticamente pelo menu "FSI > 1. Configurar sistema".
 * - Documentos ficam numa pasta privada do Google Drive do dono da planilha.
 * Versão: 1.0.0
 */

var VERSAO = '1.0.7';

/* =========================================================
 * 1. ESTRUTURA DAS TABELAS (espelha o schema.sql)
 * ========================================================= */
var TABELAS = {
  config: ['chave', 'valor', 'updated_at'],
  usuarios: ['id', 'nome', 'email', 'cpf', 'telefone', 'papel', 'familia_id', 'voluntario_id', 'senha_hash', 'senha_salt',
    'ativo', 'tentativas', 'bloqueado_ate', 'trocar_senha', 'ultimo_login', 'created_at', 'updated_at'],
  sessoes: ['id', 'usuario_id', 'token_hash', 'expira_em', 'created_at'],
  familias: ['id', 'codigo', 'status', 'responsavel_nome', 'responsavel_cpf', 'responsavel_nascimento', 'responsavel_telefone',
    'responsavel_email', 'responsavel_estado_civil', 'responsavel_escolaridade', 'endereco_cep', 'endereco_rua', 'endereco_numero',
    'endereco_complemento', 'endereco_bairro', 'endereco_cidade', 'ponto_referencia', 'qtd_pessoas', 'renda_familiar',
    'recebe_beneficio', 'beneficios', 'atendida_cras', 'como_conheceu', 'indicado_por', 'motivo_inscricao',
    'termo_versao', 'termo_aceito_em', 'lgpd_aceito_em', 'imagem_autorizada', 'imagem_atualizado_em',
    'grupo', 'data_entrada', 'data_prevista_saida', 'data_saida', 'motivo_saida', 'created_at', 'updated_at', 'deleted_at'],
  membros: ['id', 'familia_id', 'nome', 'nascimento', 'parentesco', 'escolaridade', 'cpf', 'imagem_autorizada', 'observacoes',
    'created_at', 'updated_at'],
  triagens: ['id', 'familia_id', 'entrevistador_id', 'data_entrevista', 'local_nascimento', 'situacao_trabalho', 'desempregado_desde',
    'renda_origens', 'renda_total', 'renda_per_capita', 'custo_familiar', 'programas_sociais', 'cadunico', 'nis',
    'saude', 'medicacao', 'convivencia', 'rede_socioassistencial', 'cras_atendida', 'cras_nome', 'cras_contato', 'cras_observacoes',
    'habitacao_tipo', 'comodos', 'interesse_cursos', 'encaminhamentos', 'docs_checklist', 'observacoes', 'parecer',
    'decisao', 'decidido_por', 'decidido_em', 'created_at', 'updated_at'],
  visitas: ['id', 'familia_id', 'data', 'hora', 'responsaveis', 'status', 'condicoes_moradia', 'observacoes', 'realizada_em',
    'registrado_por', 'created_at', 'updated_at'],
  documentos: ['id', 'familia_id', 'tipo', 'nome_arquivo', 'drive_file_id', 'mime', 'tamanho', 'enviado_por', 'created_at', 'deleted_at'],
  historico: ['id', 'familia_id', 'evento', 'detalhe', 'usuario_id', 'created_at'],
  encontros: ['id', 'data', 'hora_inicio', 'tipo', 'titulo', 'tema_cidadania', 'tema_espiritualidade', 'tema_criancas',
    'tema_adolescentes', 'oficina', 'local', 'grupo', 'status', 'observacoes', 'created_at', 'updated_at'],
  presencas: ['id', 'encontro_id', 'familia_id', 'presente', 'justificada', 'justificativa', 'adultos', 'criancas', 'adolescentes',
    'cesta_entregue', 'registrado_por', 'created_at', 'updated_at'],
  voluntarios: ['id', 'nome', 'email', 'telefone', 'cpf', 'nascimento', 'frente', 'gdc', 'lider_gdc', 'profissao', 'habilidades',
    'disponibilidade', 'trabalha_criancas', 'emergencia_nome', 'emergencia_telefone', 'status', 'integracao_data',
    'termo_versao', 'termo_aceito_em', 'lgpd_aceito_em', 'imagem_autorizada', 'observacoes', 'created_at', 'updated_at'],
  presencas_voluntarios: ['id', 'encontro_id', 'voluntario_id', 'funcao', 'registrado_por', 'created_at'],
  produtos: ['id', 'nome', 'unidade', 'categoria', 'peso_kg', 'ativo', 'created_at', 'updated_at'],
  modelo_cesta: ['id', 'produto_id', 'quantidade', 'updated_at'],
  doadores: ['id', 'tipo', 'nome', 'contato', 'telefone', 'email', 'gdc', 'observacoes', 'created_at', 'updated_at'],
  compromissos: ['id', 'doador_id', 'produto_id', 'quantidade', 'periodicidade', 'prazo', 'observacoes', 'created_at', 'updated_at'],
  movimentos: ['id', 'tipo', 'produto_id', 'quantidade', 'validade', 'doador_id', 'compromisso_id', 'montagem_id', 'motivo',
    'usuario_id', 'data', 'created_at'],
  montagens: ['id', 'data', 'quantidade_cestas', 'usuario_id', 'observacoes', 'created_at'],
  conferencias: ['id', 'data', 'usuario_id', 'itens', 'observacoes', 'created_at'],
  auditoria: ['id', 'usuario_id', 'acao', 'entidade', 'entidade_id', 'detalhe', 'created_at']
};

var PAPEIS = ['admin', 'triagem', 'arrecadacao', 'estoque', 'treinamento', 'familia'];
var STATUS_FAMILIA = ['inscrita', 'em_triagem', 'lista_espera', 'nao_aprovada', 'ativa', 'concluida', 'desligada'];

/* =========================================================
 * 2. MENU E CONFIGURAÇÃO INICIAL (rodado pelo dono da planilha)
 * ========================================================= */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('FSI')
    .addItem('1. Configurar sistema', 'configurarSistema')
    .addItem('2. Criar administrador', 'criarAdministrador')
    .addSeparator()
    .addItem('Ver versão', 'mostrarVersao')
    .addToUi();
}

function mostrarVersao() {
  SpreadsheetApp.getUi().alert('FSI São Judas · backend versão ' + VERSAO);
}

function configurarSistema() {
  configurarBase_();
  SpreadsheetApp.getUi().alert('Sistema configurado. Agora use o menu FSI > 2. Criar administrador.');
}

/**
 * INSTALAÇÃO PELO EDITOR (não precisa do menu FSI).
 * Selecione "instalarPeloEditor" no topo do editor e clique em Executar.
 * Cria as abas, a pasta sigilosa e um administrador com o e-mail da conta Google
 * que está executando. A senha provisória aparece no "Registro de execução".
 */
function instalarPeloEditor() {
  configurarBase_();
  var email = String(Session.getEffectiveUser().getEmail() || '').toLowerCase();
  if (!email) throw new Error('Não foi possível ler o e-mail da conta. Use o menu FSI > 2. Criar administrador.');
  var senha = senhaTemporaria_(), sal = Utilities.getUuid();
  var existente = db_('usuarios').find(function (u) { return u.email === email; });
  var campos = { nome: existente ? existente.nome : 'Administrador', email: email, papel: 'admin', ativo: 'sim', senha_salt: sal,
    senha_hash: hashSenha_(senha, sal), tentativas: '0', bloqueado_ate: '', trocar_senha: 'sim' };
  if (existente) atualizar_('usuarios', existente.id, campos); else inserir_('usuarios', campos);
  console.log('PRONTO! Login: ' + email + '  |  Senha provisória: ' + senha + '  (troque no primeiro acesso)');
}

function configurarBase_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(TABELAS).forEach(function (nome) {
    var sh = ss.getSheetByName(nome);
    if (!sh) sh = ss.insertSheet(nome);
    var cols = TABELAS[nome];
    // tudo como texto: evita o Sheets converter datas, CPFs e zeros à esquerda
    if (sh.getMaxRows() < 1000) sh.insertRowsAfter(sh.getMaxRows(), 1000 - sh.getMaxRows());
    if (sh.getMaxColumns() < cols.length) sh.insertColumnsAfter(sh.getMaxColumns(), cols.length - sh.getMaxColumns());
    sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns()).setNumberFormat('@');
    var atual = sh.getLastColumn() > 0 ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0] : [];
    cols.forEach(function (c) {
      if (atual.indexOf(c) === -1) { atual.push(c); }
    });
    sh.getRange(1, 1, 1, atual.length).setValues([atual]).setFontWeight('bold');
    sh.setFrozenRows(1);
  });
  var padrao = ss.getSheetByName('Página1') || ss.getSheetByName('Sheet1');
  if (padrao && ss.getSheets().length > 1) ss.deleteSheet(padrao);

  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('PEPPER')) props.setProperty('PEPPER', Utilities.getUuid() + Utilities.getUuid());
  if (!props.getProperty('DRIVE_FOLDER_ID')) {
    var pasta = DriveApp.createFolder('FSI São Judas · Documentos (SIGILOSO)');
    props.setProperty('DRIVE_FOLDER_ID', pasta.getId());
  }
  semearDados_();
}

function criarAdministrador() {
  var ui = SpreadsheetApp.getUi();
  var r1 = ui.prompt('Criar administrador', 'Nome completo:', ui.ButtonSet.OK_CANCEL);
  if (r1.getSelectedButton() !== ui.Button.OK) return;
  var r2 = ui.prompt('Criar administrador', 'E-mail (será o login):', ui.ButtonSet.OK_CANCEL);
  if (r2.getSelectedButton() !== ui.Button.OK) return;
  var r3 = ui.prompt('Criar administrador', 'Senha (mínimo 8 caracteres):', ui.ButtonSet.OK_CANCEL);
  if (r3.getSelectedButton() !== ui.Button.OK) return;
  var nome = r1.getResponseText().trim(), email = r2.getResponseText().trim().toLowerCase(), senha = r3.getResponseText();
  if (!nome || email.indexOf('@') < 1 || senha.length < 8) { ui.alert('Dados inválidos. Tente de novo.'); return; }
  var existente = db_('usuarios').find(function (u) { return u.email === email; });
  var sal = Utilities.getUuid();
  if (existente) {
    atualizar_('usuarios', existente.id, { nome: nome, papel: 'admin', ativo: 'sim', senha_salt: sal, senha_hash: hashSenha_(senha, sal), tentativas: '0', bloqueado_ate: '', trocar_senha: 'nao' });
  } else {
    inserir_('usuarios', { nome: nome, email: email, papel: 'admin', ativo: 'sim', senha_salt: sal, senha_hash: hashSenha_(senha, sal), tentativas: '0', trocar_senha: 'nao' });
  }
  ui.alert('Administrador pronto: ' + email);
}

function semearDados_() {
  var cfg = {
    unidade_nome: 'Igreja da Cidade · Jardim São Judas',
    cidade: 'São José dos Campos',
    duracao_meses: '12',
    limite_faltas: '2',
    meta_cestas: '',
    termo_versao: '2026.1',
    termo_participacao: TERMO_PARTICIPACAO,
    termo_lgpd: TERMO_LGPD,
    termo_imagem: TERMO_IMAGEM,
    termo_voluntario: TERMO_VOLUNTARIO,
    inscricoes_familias_abertas: 'sim',
    inscricoes_voluntarios_abertas: 'sim'
  };
  var atuais = {};
  db_('config').forEach(function (c) { atuais[c.chave] = true; });
  Object.keys(cfg).forEach(function (k) { if (!atuais[k]) inserirSemId_('config', { chave: k, valor: cfg[k], updated_at: agora_() }); });

  if (db_('produtos').length === 0) {
    // Cesta Membro (modelo oficial da rede: 14 itens)
    var cesta = [
      ['Arroz', 'pacote 5 kg', 'Mercearia', 5, 1], ['Feijão', 'pacote 1 kg', 'Mercearia', 1, 2],
      ['Óleo de soja', 'garrafa 900 ml', 'Mercearia', 0.9, 2], ['Açúcar', 'pacote 1 kg', 'Mercearia', 1, 2],
      ['Café', 'pacote 500 g', 'Mercearia', 0.5, 1], ['Macarrão', 'pacote 500 g', 'Mercearia', 0.5, 2],
      ['Farinha de mandioca', 'pacote 500 g', 'Mercearia', 0.5, 1], ['Fubá', 'pacote 1 kg', 'Mercearia', 1, 1],
      ['Molho de tomate', 'sachê 340 g', 'Mercearia', 0.34, 2], ['Sardinha', 'lata 125 g', 'Mercearia', 0.125, 1],
      ['Leite em pó', 'pacote 400 g', 'Mercearia', 0.4, 1], ['Sal', 'pacote 1 kg', 'Mercearia', 1, 1],
      ['Biscoito', 'pacote', 'Mercearia', 0.4, 2], ['Achocolatado', 'pote 400 g', 'Mercearia', 0.4, 1]
    ];
    cesta.forEach(function (c) {
      var p = inserir_('produtos', { nome: c[0], unidade: c[1], categoria: c[2], peso_kg: String(c[3]), ativo: 'sim' });
      inserir_('modelo_cesta', { produto_id: p.id, quantidade: String(c[4]) });
    });
  }
}

/* =========================================================
 * 3. TERMOS (texto padrão — o admin pode editar no sistema)
 * ========================================================= */
var TERMO_PARTICIPACAO = [
  'TERMO DE PARTICIPAÇÃO · PROGRAMA FAMÍLIA SAUDÁVEL INTEGRAL (FSI)',
  'Cidade Social · Igreja da Cidade Jardim São Judas',
  '',
  '1. O programa FSI acompanha a família durante 12 meses, com o objetivo de apoiar sua autonomia (emancipação).',
  '2. A inscrição não garante a entrada. A família passa por triagem: entrevista, conferência de documentos, consulta à rede de assistência (CRAS) e visita domiciliar.',
  '3. Documentos exigidos: do responsável, RG ou CNH, CPF e comprovante de endereço atualizado; dos demais moradores, RG ou certidão de nascimento e CPF (quando houver).',
  '4. Uma vez aprovada, a família se compromete a participar do encontro mensal (café, treinamento/palestra e entrega de alimentos) nas datas do calendário.',
  '5. A presença nos treinamentos mensais é obrigatória para o responsável. Faltas devem ser justificadas. Faltas sem justificativa acima do limite definido pela coordenação levam à reavaliação da participação.',
  '6. Os alimentos recebidos são para uso exclusivo da família e não podem ser vendidos ou trocados.',
  '7. As crianças participam de atividades próprias para a idade. Somente o adulto que deixou a criança pode buscá-la, assinando a lista.',
  '8. O momento devocional é aberto e facultativo; o atendimento não depende da participação religiosa.',
  '9. A família deve manter seus dados atualizados e avisar sobre mudança de endereço, telefone ou composição familiar.',
  '10. A família pode deixar o programa quando quiser, avisando a coordenação. O desligamento também pode ocorrer por descumprimento deste termo, mudança de cidade ou conclusão do ciclo.',
  '11. O tratamento respeitoso entre famílias, voluntários e equipe é condição para a participação.'
].join('\n');

var TERMO_LGPD = [
  'CONSENTIMENTO PARA USO DE DADOS PESSOAIS (LGPD · Lei 13.709/2018)',
  'Autorizo a Cidade Social (Associação Socioeducativa Cidade Social) a coletar e guardar os dados informados nesta inscrição e na triagem, inclusive dados sensíveis (saúde, renda, benefícios), com a única finalidade de avaliar, acompanhar e registrar a participação da minha família no programa FSI e de prestar contas de forma agregada (sem identificação).',
  'Os dados ficam em ambiente restrito, acessados apenas pela equipe autorizada, e não são compartilhados com terceiros sem minha autorização, salvo obrigação legal.',
  'Posso pedir a qualquer momento acesso, correção ou exclusão dos meus dados, e revogar este consentimento, falando com a coordenação.'
].join('\n');

var TERMO_IMAGEM = [
  'AUTORIZAÇÃO DE USO DE IMAGEM (OPCIONAL)',
  'Autorizo, de forma gratuita, o uso da minha imagem e da imagem dos membros menores de idade da minha família, captadas nas atividades do programa, em materiais institucionais da Cidade Social (redes sociais, site, relatórios e apresentações).',
  'As imagens não serão usadas de forma constrangedora ou assistencialista. Posso revogar esta autorização a qualquer momento, sem prejuízo da participação no programa.'
].join('\n');

var TERMO_VOLUNTARIO = [
  'TERMO DE ADESÃO AO SERVIÇO VOLUNTÁRIO (Lei 9.608/1998)',
  '1. O serviço voluntário é atividade não remunerada e não gera vínculo empregatício, nem obrigação trabalhista, previdenciária ou afim.',
  '2. As despesas que eu tiver no serviço voluntário não serão ressarcidas.',
  '3. Comprometo-me a seguir as orientações da coordenação, a cuidar com respeito e sigilo das famílias atendidas e a não usar celular pessoal para fotografar famílias ou documentos.',
  '4. Os alimentos e doações são exclusivos para as famílias atendidas e não podem ser usados por voluntários.',
  '5. Este termo vale até 31 de dezembro do ano corrente e pode ser renovado. Posso me desligar a qualquer momento, avisando a coordenação.'
].join('\n');

/* =========================================================
 * 4. ACESSO À PLANILHA (camada de dados)
 * ========================================================= */
var _cache = {};

function aba_(nome) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nome);
  if (!sh) throw erro_('Tabela ' + nome + ' não existe. Rode FSI > 1. Configurar sistema.');
  return sh;
}

function db_(nome) {
  if (_cache[nome]) return _cache[nome];
  var sh = aba_(nome);
  var vals = sh.getDataRange().getValues();
  var cab = vals.shift() || [];
  var linhas = vals.map(function (r, i) {
    var o = { _row: i + 2 };
    cab.forEach(function (c, j) { if (c) o[c] = valorTexto_(r[j]); });
    return o;
  });
  _cache[nome] = linhas;
  return linhas;
}

function valorTexto_(v) {
  if (v === null || v === undefined) return '';
  if (Object.prototype.toString.call(v) === '[object Date]') {
    var iso = Utilities.formatDate(v, 'America/Sao_Paulo', "yyyy-MM-dd'T'HH:mm:ss");
    return iso.substring(11) === '00:00:00' ? iso.substring(0, 10) : v.toISOString();
  }
  return String(v);
}

var _cabs = {};
function cabecalho_(nome) {
  if (_cabs[nome]) return _cabs[nome];
  var sh = aba_(nome);
  _cabs[nome] = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  return _cabs[nome];
}

function gravarLinhaNova_(nome, linha) {
  var sh = aba_(nome);
  var r = sh.getLastRow() + 1;
  if (r > sh.getMaxRows()) sh.insertRowsAfter(sh.getMaxRows(), 500);
  sh.getRange(r, 1, 1, linha.length).setNumberFormat('@').setValues([linha]);
  return r;
}

function limpa_(o) {
  var r = {};
  Object.keys(o).forEach(function (k) { if (k !== '_row' && k !== 'senha_hash' && k !== 'senha_salt') r[k] = o[k]; });
  return r;
}

function inserir_(nome, obj) {
  obj = Object.assign({}, obj);
  if (!obj.id) obj.id = Utilities.getUuid();
  var cab = cabecalho_(nome);
  if (cab.indexOf('created_at') > -1 && !obj.created_at) obj.created_at = agora_();
  if (cab.indexOf('updated_at') > -1) obj.updated_at = agora_();
  var linha = cab.map(function (c) { return obj[c] === undefined || obj[c] === null ? '' : String(obj[c]); });
  var row = gravarLinhaNova_(nome, linha);
  if (_cache[nome]) { var o = { _row: row }; cab.forEach(function (c, i) { o[c] = linha[i]; }); _cache[nome].push(o); }
  return obj;
}

function inserirSemId_(nome, obj) {
  var cab = cabecalho_(nome);
  gravarLinhaNova_(nome, cab.map(function (c) { return obj[c] === undefined ? '' : String(obj[c]); }));
  delete _cache[nome];
}

function obter_(nome, id) {
  var r = db_(nome).find(function (x) { return x.id === id; });
  return r || null;
}

function atualizar_(nome, id, campos) {
  var atual = obter_(nome, id);
  if (!atual) throw erro_('Registro não encontrado.');
  var cab = cabecalho_(nome);
  if (cab.indexOf('updated_at') > -1) campos.updated_at = agora_();
  var linha = cab.map(function (c) {
    var v = campos.hasOwnProperty(c) ? campos[c] : atual[c];
    return v === undefined || v === null ? '' : String(v);
  });
  aba_(nome).getRange(atual._row, 1, 1, cab.length).setNumberFormat('@').setValues([linha]);
  var novo = {}; cab.forEach(function (c, i) { novo[c] = linha[i]; atual[c] = linha[i]; });
  return novo;
}

function excluirLinha_(nome, id) {
  var atual = obter_(nome, id);
  if (!atual) return;
  aba_(nome).deleteRow(atual._row);
  delete _cache[nome];
}

/* =========================================================
 * 5. UTILITÁRIOS
 * ========================================================= */
function agora_() { return new Date().toISOString(); }
function br_(iso) { var s = String(iso || '').substring(0, 10).split('-'); return s.length === 3 ? s[2] + '/' + s[1] + '/' + s[0] : ''; }
function hoje_() { return Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd'); }
function erro_(msg, cod) { var e = new Error(msg); e.publico = true; e.codigo = cod || 400; return e; }
function txt_(v, max) { v = v === undefined || v === null ? '' : String(v).trim(); return v.substring(0, max || 500); }
function num_(v) {
  var s = String(v === undefined || v === null ? '' : v);
  if (s.indexOf(',') > -1) s = s.replace(/[^\d,\-]/g, '').replace(',', '.'); else s = s.replace(/[^\d.\-]/g, '');
  var n = parseFloat(s); return isNaN(n) ? 0 : n;
}
function soDigitos_(v) { return String(v || '').replace(/\D/g, '').substring(0, 14); }
function json_(v) { try { return v ? JSON.parse(v) : null; } catch (e) { return null; } }
function hex_(bytes) { return bytes.map(function (b) { var h = (b & 0xff).toString(16); return h.length === 1 ? '0' + h : h; }).join(''); }
function sha_(s) { return hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8)); }
function pepper_() {
  var p = PropertiesService.getScriptProperties().getProperty('PEPPER');
  if (!p) throw erro_('Sistema não configurado. Rode FSI > 1. Configurar sistema.', 500);
  return p;
}
function hashSenha_(senha, sal) {
  var h = sha_(sal + ':' + senha + ':' + pepper_());
  for (var i = 0; i < 300; i++) h = sha_(h + sal);
  return h;
}
function cpfValido_(cpf) {
  cpf = soDigitos_(cpf);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  for (var t = 9; t < 11; t++) {
    var s = 0;
    for (var i = 0; i < t; i++) s += parseInt(cpf.charAt(i), 10) * (t + 1 - i);
    var d = ((10 * s) % 11) % 10;
    if (d !== parseInt(cpf.charAt(t), 10)) return false;
  }
  return true;
}
function idade_(nasc) {
  if (!nasc) return null;
  var d = new Date(nasc + 'T12:00:00');
  if (isNaN(d)) return null;
  var h = new Date(), a = h.getFullYear() - d.getFullYear();
  if (h.getMonth() < d.getMonth() || (h.getMonth() === d.getMonth() && h.getDate() < d.getDate())) a--;
  return a;
}
function addMeses_(isoData, m) {
  var d = new Date(isoData + 'T12:00:00'); d.setMonth(d.getMonth() + m);
  return Utilities.formatDate(d, 'America/Sao_Paulo', 'yyyy-MM-dd');
}
function config_() {
  var c = {}; db_('config').forEach(function (r) { c[r.chave] = r.valor; }); return c;
}
function historico_(familiaId, evento, detalhe, usuarioId) {
  inserir_('historico', { familia_id: familiaId, evento: evento, detalhe: txt_(detalhe, 1000), usuario_id: usuarioId || '' });
}
function auditar_(usuario, acao, entidade, id, detalhe) {
  try { inserir_('auditoria', { usuario_id: usuario ? usuario.id : '', acao: acao, entidade: entidade || '', entidade_id: id || '', detalhe: txt_(detalhe, 500) }); } catch (e) { }
}
function proximoCodigo_() {
  var max = 0;
  db_('familias').forEach(function (f) { var n = parseInt(String(f.codigo).replace(/\D/g, ''), 10); if (n > max) max = n; });
  return 'F' + ('000' + (max + 1)).slice(-4);
}

/* =========================================================
 * 6. ENTRADA HTTP
 * ========================================================= */
function doGet() {
  return saida_({ ok: true, sistema: 'FSI São Judas', versao: VERSAO });
}

function doPost(e) {
  var req;
  try { req = JSON.parse(e.postData.contents); } catch (x) { return saida_({ ok: false, erro: 'Requisição inválida.' }); }
  var acao = String(req.action || '');
  var rota = ROTAS[acao];
  if (!rota) return saida_({ ok: false, erro: 'Ação desconhecida.' });
  var lock = null;
  try {
    var usuario = null;
    if (rota.papeis) {
      usuario = autenticar_(req.token);
      if (rota.papeis.indexOf('*') === -1 && rota.papeis.indexOf(usuario.papel) === -1 && usuario.papel !== 'admin') {
        throw erro_('Você não tem permissão para esta área.', 403);
      }
    }
    if (rota.escrita) { lock = LockService.getScriptLock(); lock.waitLock(25000); }
    var dados = rota.fn(req.data || {}, usuario);
    return saida_({ ok: true, dados: dados });
  } catch (err) {
    if (!err.publico) console.error(acao, err && err.stack);
    return saida_({ ok: false, erro: err.publico ? err.message : 'Erro interno. Tente novamente.', codigo: err.codigo || 500 });
  } finally {
    if (lock) try { lock.releaseLock(); } catch (x) { }
  }
}

function saida_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* =========================================================
 * 7. AUTENTICAÇÃO
 * ========================================================= */
function autenticar_(token) {
  if (!token) throw erro_('Faça login novamente.', 401);
  var th = sha_(String(token) + pepper_());
  var s = db_('sessoes').find(function (x) { return x.token_hash === th; });
  if (!s || s.expira_em < agora_()) throw erro_('Sua sessão expirou. Faça login novamente.', 401);
  var u = obter_('usuarios', s.usuario_id);
  if (!u || u.ativo !== 'sim') throw erro_('Usuário inativo.', 401);
  u._sessao = s.id;
  return u;
}

function login_(d) {
  var login = String(d.login || '').trim().toLowerCase();
  var senha = String(d.senha || '');
  if (!login || !senha) throw erro_('Informe login e senha.');
  var cpf = soDigitos_(login);
  var u = db_('usuarios').find(function (x) {
    return (x.email && x.email === login) || (cpf.length === 11 && x.cpf === cpf);
  });
  var falha = erro_('Login ou senha incorretos.', 401);
  if (!u || u.ativo !== 'sim') throw falha;
  if (u.bloqueado_ate && u.bloqueado_ate > agora_()) throw erro_('Muitas tentativas. Tente de novo em 15 minutos.', 429);
  if (hashSenha_(senha, u.senha_salt) !== u.senha_hash) {
    var t = (parseInt(u.tentativas || '0', 10) || 0) + 1;
    var campos = { tentativas: String(t) };
    if (t >= 5) { campos.bloqueado_ate = new Date(Date.now() + 15 * 60000).toISOString(); campos.tentativas = '0'; }
    atualizar_('usuarios', u.id, campos);
    throw falha;
  }
  var token = Utilities.getUuid() + Utilities.getUuid();
  var horas = u.papel === 'familia' ? 24 * 7 : 12;
  inserir_('sessoes', { usuario_id: u.id, token_hash: sha_(token + pepper_()), expira_em: new Date(Date.now() + horas * 3600000).toISOString() });
  atualizar_('usuarios', u.id, { tentativas: '0', bloqueado_ate: '', ultimo_login: agora_() });
  // limpa sessões vencidas
  var vencidas = db_('sessoes').filter(function (x) { return x.expira_em < agora_(); });
  vencidas.slice(0, 20).reverse().forEach(function (x) { excluirLinha_('sessoes', x.id); });
  auditar_(u, 'login', 'usuarios', u.id, '');
  return { token: token, usuario: perfil_(u) };
}

function perfil_(u) {
  return { id: u.id, nome: u.nome, email: u.email, papel: u.papel, familia_id: u.familia_id, trocar_senha: u.trocar_senha === 'sim' };
}

function logout_(d, u) { excluirLinha_('sessoes', u._sessao); return true; }

function trocarSenha_(d, u) {
  if (hashSenha_(String(d.atual || ''), u.senha_salt) !== u.senha_hash) throw erro_('Senha atual incorreta.');
  if (String(d.nova || '').length < 8) throw erro_('A nova senha precisa ter pelo menos 8 caracteres.');
  var sal = Utilities.getUuid();
  atualizar_('usuarios', u.id, { senha_salt: sal, senha_hash: hashSenha_(d.nova, sal), trocar_senha: 'nao' });
  auditar_(u, 'trocar_senha', 'usuarios', u.id, '');
  return true;
}

/* =========================================================
 * 8. ROTAS PÚBLICAS
 * ========================================================= */
function configPublica_() {
  var c = config_();
  return {
    unidade_nome: c.unidade_nome, cidade: c.cidade, duracao_meses: c.duracao_meses, limite_faltas: c.limite_faltas,
    termo_versao: c.termo_versao, termo_participacao: c.termo_participacao, termo_lgpd: c.termo_lgpd,
    termo_imagem: c.termo_imagem, termo_voluntario: c.termo_voluntario,
    inscricoes_familias_abertas: c.inscricoes_familias_abertas !== 'nao',
    inscricoes_voluntarios_abertas: c.inscricoes_voluntarios_abertas !== 'nao'
  };
}

function inscreverFamilia_(d) {
  var c = config_();
  if (c.inscricoes_familias_abertas === 'nao') throw erro_('As inscrições estão fechadas no momento.');
  var r = d.responsavel || {};
  var cpf = soDigitos_(r.cpf);
  if (!txt_(r.nome) || txt_(r.nome).split(' ').length < 2) throw erro_('Informe o nome completo do responsável.');
  if (!cpfValido_(cpf)) throw erro_('CPF do responsável inválido.');
  if (soDigitos_(r.telefone).length < 10) throw erro_('Informe um telefone com DDD.');
  if (!d.aceite_participacao || !d.aceite_lgpd) throw erro_('É preciso aceitar o termo de participação e o uso de dados.');
  if (String(d.senha || '').length < 8) throw erro_('Crie uma senha com pelo menos 8 caracteres.');
  var dup = db_('familias').find(function (f) { return f.responsavel_cpf === cpf && !f.deleted_at && ['nao_aprovada', 'concluida', 'desligada'].indexOf(f.status) === -1; });
  if (dup) throw erro_('Já existe uma inscrição ativa para este CPF. Entre com seu CPF e senha para acompanhar.');
  if (db_('usuarios').find(function (u) { return u.cpf === cpf; })) throw erro_('Este CPF já tem acesso ao sistema. Use "Entrar".');
  var e = d.endereco || {};
  var membros = (d.membros || []).slice(0, 20);
  var f = inserir_('familias', {
    codigo: proximoCodigo_(), status: 'inscrita',
    responsavel_nome: txt_(r.nome, 150), responsavel_cpf: cpf, responsavel_nascimento: txt_(r.nascimento, 10),
    responsavel_telefone: soDigitos_(r.telefone), responsavel_email: txt_(r.email, 150).toLowerCase(),
    responsavel_estado_civil: txt_(r.estado_civil, 40), responsavel_escolaridade: txt_(r.escolaridade, 60),
    endereco_cep: soDigitos_(e.cep), endereco_rua: txt_(e.rua, 150), endereco_numero: txt_(e.numero, 20),
    endereco_complemento: txt_(e.complemento, 80), endereco_bairro: txt_(e.bairro, 80), endereco_cidade: txt_(e.cidade, 80),
    ponto_referencia: txt_(e.referencia, 150), qtd_pessoas: String(membros.length + 1),
    renda_familiar: String(num_(d.renda_familiar)), recebe_beneficio: d.recebe_beneficio ? 'sim' : 'nao',
    beneficios: txt_(d.beneficios, 200), atendida_cras: txt_(d.atendida_cras, 20), como_conheceu: txt_(d.como_conheceu, 100),
    indicado_por: txt_(d.indicado_por, 100), motivo_inscricao: txt_(d.motivo, 1000),
    termo_versao: c.termo_versao, termo_aceito_em: agora_(), lgpd_aceito_em: agora_(),
    imagem_autorizada: d.aceite_imagem ? 'sim' : 'nao', imagem_atualizado_em: agora_()
  });
  membros.forEach(function (m) {
    if (!txt_(m.nome)) return;
    inserir_('membros', { familia_id: f.id, nome: txt_(m.nome, 150), nascimento: txt_(m.nascimento, 10), parentesco: txt_(m.parentesco, 40),
      escolaridade: txt_(m.escolaridade, 60), cpf: soDigitos_(m.cpf), imagem_autorizada: d.aceite_imagem ? 'sim' : 'nao' });
  });
  var sal = Utilities.getUuid();
  inserir_('usuarios', { nome: f.responsavel_nome, cpf: cpf, email: f.responsavel_email, telefone: f.responsavel_telefone, papel: 'familia',
    familia_id: f.id, senha_salt: sal, senha_hash: hashSenha_(d.senha, sal), ativo: 'sim', tentativas: '0', trocar_senha: 'nao' });
  historico_(f.id, 'Inscrição recebida', 'Termo ' + c.termo_versao + ' aceito. Imagem: ' + (d.aceite_imagem ? 'autorizada' : 'não autorizada') + '.', '');
  return { codigo: f.codigo };
}

function inscreverVoluntario_(d) {
  var c = config_();
  if (c.inscricoes_voluntarios_abertas === 'nao') throw erro_('As inscrições de voluntários estão fechadas no momento.');
  if (!txt_(d.nome) || txt_(d.nome).split(' ').length < 2) throw erro_('Informe seu nome completo.');
  if (soDigitos_(d.telefone).length < 10) throw erro_('Informe um telefone com DDD.');
  if (d.cpf && !cpfValido_(d.cpf)) throw erro_('CPF inválido.');
  if (['arrecadacao', 'triagem', 'entrega', 'qualquer'].indexOf(d.frente) === -1) throw erro_('Escolha uma frente.');
  if (!d.aceite_termo || !d.aceite_lgpd) throw erro_('É preciso aceitar o termo de voluntariado e o uso de dados.');
  var tel = soDigitos_(d.telefone);
  if (db_('voluntarios').find(function (v) { return v.telefone === tel && v.status !== 'inativo'; })) throw erro_('Já existe uma inscrição com este telefone. A coordenação entrará em contato.');
  var v = inserir_('voluntarios', {
    nome: txt_(d.nome, 150), email: txt_(d.email, 150).toLowerCase(), telefone: tel, cpf: soDigitos_(d.cpf),
    nascimento: txt_(d.nascimento, 10), frente: d.frente, gdc: txt_(d.gdc, 100), lider_gdc: txt_(d.lider_gdc, 100),
    profissao: txt_(d.profissao, 100), habilidades: txt_(d.habilidades, 500), disponibilidade: JSON.stringify(d.disponibilidade || []),
    trabalha_criancas: d.trabalha_criancas ? 'sim' : 'nao', emergencia_nome: txt_(d.emergencia_nome, 100),
    emergencia_telefone: soDigitos_(d.emergencia_telefone), status: 'inscrito', termo_versao: c.termo_versao,
    termo_aceito_em: agora_(), lgpd_aceito_em: agora_(), imagem_autorizada: d.aceite_imagem ? 'sim' : 'nao', observacoes: ''
  });
  return { id: v.id };
}

/* =========================================================
 * 9. PORTAL DA FAMÍLIA
 * ========================================================= */
function etapas_(f) {
  var t = db_('triagens').find(function (x) { return x.familia_id === f.id; }) || {};
  var docs = json_(t.docs_checklist) || {};
  var docsOk = ['rg_responsavel', 'cpf_responsavel', 'comprovante_endereco', 'docs_moradores'].every(function (k) { return docs[k]; });
  var visita = db_('visitas').filter(function (v) { return v.familia_id === f.id; });
  var visitaFeita = visita.some(function (v) { return v.status === 'realizada'; });
  var visitaAg = visita.find(function (v) { return v.status === 'agendada'; });
  var dec = f.status === 'ativa' || f.status === 'concluida' ? 'aprovada' : (f.status === 'lista_espera' ? 'espera' : (f.status === 'nao_aprovada' ? 'nao' : ''));
  return [
    { chave: 'inscricao', titulo: 'Inscrição', feito: true, detalhe: 'Recebida em ' + br_(f.created_at) },
    { chave: 'entrevista', titulo: 'Entrevista', feito: !!t.data_entrevista, detalhe: t.data_entrevista ? 'Realizada em ' + br_(t.data_entrevista) : 'A equipe vai entrar em contato' },
    { chave: 'documentos', titulo: 'Documentos', feito: docsOk, detalhe: docsOk ? 'Conferidos' : 'Pendentes de conferência' },
    { chave: 'cras', titulo: 'Rede de assistência (CRAS)', feito: !!t.cras_atendida, detalhe: t.cras_atendida ? 'Consultado' : 'Pendente' },
    { chave: 'visita', titulo: 'Visita domiciliar', feito: visitaFeita, detalhe: visitaFeita ? 'Realizada' : (visitaAg ? 'Agendada para ' + br_(visitaAg.data) + (visitaAg.hora ? ' às ' + visitaAg.hora : '') : 'A agendar') },
    { chave: 'parecer', titulo: 'Resultado da triagem', feito: !!dec, detalhe: dec === 'aprovada' ? 'Aprovada' : dec === 'espera' ? 'Lista de espera' : dec === 'nao' ? 'Não aprovada neste ciclo' : 'Em análise' },
    { chave: 'programa', titulo: 'Programa (12 meses)', feito: f.status === 'concluida', detalhe: f.data_entrada ? 'De ' + br_(f.data_entrada) + ' a ' + br_(f.data_prevista_saida) : 'Começa após a aprovação' }
  ];
}

function resumoPresencas_(familiaId) {
  var enc = {}; db_('encontros').forEach(function (e) { enc[e.id] = e; });
  var lista = db_('presencas').filter(function (p) { return p.familia_id === familiaId && enc[p.encontro_id]; }).map(function (p) {
    var e = enc[p.encontro_id];
    return { encontro_id: e.id, data: e.data, titulo: e.titulo, tipo: e.tipo, tema_cidadania: e.tema_cidadania, presente: p.presente === 'sim',
      justificada: p.justificada === 'sim', cesta_entregue: p.cesta_entregue === 'sim' };
  }).sort(function (a, b) { return a.data < b.data ? -1 : 1; });
  return {
    lista: lista,
    presencas: lista.filter(function (x) { return x.presente; }).length,
    faltas: lista.filter(function (x) { return !x.presente; }).length,
    faltas_sem_justificativa: lista.filter(function (x) { return !x.presente && !x.justificada; }).length,
    cestas: lista.filter(function (x) { return x.cesta_entregue; }).length
  };
}

function portalMinha_(d, u) {
  var f = obter_('familias', u.familia_id);
  if (!f) throw erro_('Família não encontrada.');
  var c = config_();
  var membros = db_('membros').filter(function (m) { return m.familia_id === f.id; }).map(function (m) { return { id: m.id, nome: m.nome, parentesco: m.parentesco, idade: idade_(m.nascimento) }; });
  var proximos = db_('encontros').filter(function (e) { return e.data >= hoje_() && e.status !== 'cancelado' && (!e.grupo || !f.grupo || e.grupo === f.grupo); })
    .sort(function (a, b) { return a.data < b.data ? -1 : 1; }).slice(0, 4)
    .map(function (e) { return { data: e.data, hora_inicio: e.hora_inicio, titulo: e.titulo, tipo: e.tipo, local: e.local }; });
  var docs = db_('documentos').filter(function (x) { return x.familia_id === f.id && !x.deleted_at; }).map(function (x) { return { id: x.id, tipo: x.tipo, nome_arquivo: x.nome_arquivo, created_at: x.created_at }; });
  var hist = db_('historico').filter(function (h) { return h.familia_id === f.id; }).map(function (h) { return { evento: h.evento, created_at: h.created_at }; }).reverse().slice(0, 30);
  return {
    familia: { codigo: f.codigo, status: f.status, responsavel_nome: f.responsavel_nome, grupo: f.grupo, data_entrada: f.data_entrada,
      data_prevista_saida: f.data_prevista_saida, imagem_autorizada: f.imagem_autorizada === 'sim', termo_versao: f.termo_versao, termo_aceito_em: f.termo_aceito_em },
    membros: membros, etapas: etapas_(f), presencas: resumoPresencas_(f.id), proximos: proximos, documentos: docs, historico: hist,
    limite_faltas: num_(c.limite_faltas)
  };
}

function portalImagem_(d, u) {
  atualizar_('familias', u.familia_id, { imagem_autorizada: d.autorizada ? 'sim' : 'nao', imagem_atualizado_em: agora_() });
  db_('membros').filter(function (m) { return m.familia_id === u.familia_id; }).forEach(function (m) { atualizar_('membros', m.id, { imagem_autorizada: d.autorizada ? 'sim' : 'nao' }); });
  historico_(u.familia_id, d.autorizada ? 'Autorizou uso de imagem' : 'Revogou autorização de imagem', '', u.id);
  return true;
}

/* =========================================================
 * 10. TRIAGEM (equipe de triagem / assistente social)
 * ========================================================= */
function familiasListar_(d, u) {
  var pres = {};
  db_('presencas').forEach(function (p) {
    var k = p.familia_id; pres[k] = pres[k] || { p: 0, f: 0, fsj: 0 };
    if (p.presente === 'sim') pres[k].p++; else { pres[k].f++; if (p.justificada !== 'sim') pres[k].fsj++; }
  });
  var visitas = {}; db_('visitas').forEach(function (v) { if (v.status === 'agendada') visitas[v.familia_id] = v.data; });
  var sens = u.papel === 'admin' || u.papel === 'triagem';
  return db_('familias').filter(function (f) { return !f.deleted_at; }).map(function (f) {
    var o = { id: f.id, codigo: f.codigo, status: f.status, responsavel_nome: f.responsavel_nome, qtd_pessoas: f.qtd_pessoas,
      grupo: f.grupo, data_entrada: f.data_entrada, created_at: f.created_at, bairro: f.endereco_bairro,
      presencas: (pres[f.id] || {}).p || 0, faltas: (pres[f.id] || {}).f || 0, faltas_sem_justificativa: (pres[f.id] || {}).fsj || 0 };
    if (sens) { o.telefone = f.responsavel_telefone; o.renda_familiar = f.renda_familiar; o.atendida_cras = f.atendida_cras; o.visita_agendada = visitas[f.id] || ''; }
    return o;
  }).sort(function (a, b) { return a.created_at < b.created_at ? 1 : -1; });
}

function familiaObter_(d, u) {
  var f = obter_('familias', d.id);
  if (!f) throw erro_('Família não encontrada.');
  auditar_(u, 'ver_ficha', 'familias', f.id, '');
  var t = db_('triagens').find(function (x) { return x.familia_id === f.id; });
  if (t) { t = Object.assign({}, t); ['renda_origens', 'programas_sociais', 'saude', 'convivencia', 'rede_socioassistencial', 'docs_checklist'].forEach(function (k) { t[k] = json_(t[k]); }); }
  var nomes = {}; db_('usuarios').forEach(function (x) { nomes[x.id] = x.nome; });
  return {
    familia: limpa_(f),
    membros: db_('membros').filter(function (m) { return m.familia_id === f.id; }).map(function (m) { var o = limpa_(m); o.idade = idade_(m.nascimento); return o; }),
    triagem: t ? limpa_(t) : null,
    visitas: db_('visitas').filter(function (v) { return v.familia_id === f.id; }).map(limpa_),
    documentos: db_('documentos').filter(function (x) { return x.familia_id === f.id && !x.deleted_at; }).map(function (x) { var o = limpa_(x); o.enviado_por_nome = nomes[x.enviado_por] || 'Família'; return o; }),
    historico: db_('historico').filter(function (h) { return h.familia_id === f.id; }).map(function (h) { var o = limpa_(h); o.usuario_nome = nomes[h.usuario_id] || ''; return o; }).reverse(),
    presencas: resumoPresencas_(f.id),
    etapas: etapas_(f)
  };
}

function familiaAtualizar_(d, u) {
  var f = obter_('familias', d.id);
  if (!f) throw erro_('Família não encontrada.');
  var permitidos = ['responsavel_nome', 'responsavel_nascimento', 'responsavel_telefone', 'responsavel_email', 'responsavel_estado_civil',
    'responsavel_escolaridade', 'endereco_cep', 'endereco_rua', 'endereco_numero', 'endereco_complemento', 'endereco_bairro',
    'endereco_cidade', 'ponto_referencia', 'renda_familiar', 'recebe_beneficio', 'beneficios', 'atendida_cras', 'grupo'];
  var campos = {};
  permitidos.forEach(function (k) { if (d.campos && d.campos.hasOwnProperty(k)) campos[k] = txt_(d.campos[k], 300); });
  ['responsavel_telefone', 'endereco_cep'].forEach(function (k) { if (campos.hasOwnProperty(k)) campos[k] = soDigitos_(campos[k]); });
  atualizar_('familias', f.id, campos);
  if (d.membros) {
    var atuais = db_('membros').filter(function (m) { return m.familia_id === f.id; });
    var manter = {};
    d.membros.slice(0, 20).forEach(function (m) {
      if (!txt_(m.nome)) return;
      var dados = { nome: txt_(m.nome, 150), nascimento: txt_(m.nascimento, 10), parentesco: txt_(m.parentesco, 40), escolaridade: txt_(m.escolaridade, 60), cpf: soDigitos_(m.cpf), observacoes: txt_(m.observacoes, 300) };
      if (m.id && obter_('membros', m.id)) { atualizar_('membros', m.id, dados); manter[m.id] = 1; }
      else { dados.familia_id = f.id; dados.imagem_autorizada = f.imagem_autorizada; var n = inserir_('membros', dados); manter[n.id] = 1; }
    });
    atuais.forEach(function (m) { if (!manter[m.id]) excluirLinha_('membros', m.id); });
    atualizar_('familias', f.id, { qtd_pessoas: String(db_('membros').filter(function (m) { return m.familia_id === f.id; }).length + 1) });
  }
  auditar_(u, 'editar_ficha', 'familias', f.id, Object.keys(campos).join(','));
  return true;
}

function triagemSalvar_(d, u) {
  var f = obter_('familias', d.familia_id);
  if (!f) throw erro_('Família não encontrada.');
  var t = db_('triagens').find(function (x) { return x.familia_id === f.id; });
  var j = ['renda_origens', 'programas_sociais', 'saude', 'convivencia', 'rede_socioassistencial', 'docs_checklist'];
  var simples = ['data_entrevista', 'local_nascimento', 'situacao_trabalho', 'desempregado_desde', 'renda_total', 'custo_familiar', 'cadunico', 'nis',
    'medicacao', 'cras_atendida', 'cras_nome', 'cras_contato', 'cras_observacoes', 'habitacao_tipo', 'comodos', 'interesse_cursos', 'encaminhamentos', 'observacoes', 'parecer'];
  var campos = {};
  simples.forEach(function (k) { if (d.hasOwnProperty(k)) campos[k] = txt_(d[k], 2000); });
  if (campos.hasOwnProperty('nis')) campos.nis = soDigitos_(campos.nis).substring(0, 11);
  j.forEach(function (k) { if (d.hasOwnProperty(k)) campos[k] = JSON.stringify(d[k] || null); });
  var pessoas = num_(f.qtd_pessoas) || 1;
  if (campos.renda_total !== undefined) campos.renda_per_capita = (num_(campos.renda_total) / pessoas).toFixed(2);
  var primeiraEntrevista = campos.data_entrevista && (!t || !t.data_entrevista);
  if (t) atualizar_('triagens', t.id, campos);
  else { campos.familia_id = f.id; campos.entrevistador_id = u.id; t = inserir_('triagens', campos); }
  if (f.status === 'inscrita') atualizar_('familias', f.id, { status: 'em_triagem' });
  if (campos.cras_atendida) atualizar_('familias', f.id, { atendida_cras: campos.cras_atendida });
  if (primeiraEntrevista) historico_(f.id, 'Entrevista de triagem realizada', 'Data: ' + campos.data_entrevista, u.id);
  else historico_(f.id, 'Ficha de triagem atualizada', '', u.id);
  auditar_(u, 'salvar_triagem', 'familias', f.id, '');
  return true;
}

function triagemDecidir_(d, u) {
  var f = obter_('familias', d.familia_id);
  if (!f) throw erro_('Família não encontrada.');
  var dec = d.decisao;
  if (['aprovada', 'lista_espera', 'nao_aprovada'].indexOf(dec) === -1) throw erro_('Decisão inválida.');
  var c = config_();
  var campos = {};
  if (dec === 'aprovada') {
    var entrada = txt_(d.data_entrada, 10) || hoje_();
    campos = { status: 'ativa', data_entrada: entrada, data_prevista_saida: addMeses_(entrada, num_(c.duracao_meses) || 12), grupo: txt_(d.grupo, 40) || f.grupo };
  } else campos = { status: dec };
  atualizar_('familias', f.id, campos);
  var t = db_('triagens').find(function (x) { return x.familia_id === f.id; });
  var tc = { decisao: dec, decidido_por: u.id, decidido_em: agora_(), parecer: txt_(d.parecer, 2000) };
  if (t) atualizar_('triagens', t.id, tc); else { tc.familia_id = f.id; tc.entrevistador_id = u.id; inserir_('triagens', tc); }
  var rot = { aprovada: 'Família aprovada no programa', lista_espera: 'Família em lista de espera', nao_aprovada: 'Família não aprovada neste ciclo' };
  historico_(f.id, rot[dec], dec === 'aprovada' ? 'Entrada: ' + br_(campos.data_entrada) : '', u.id);
  auditar_(u, 'decisao_triagem', 'familias', f.id, dec);
  return true;
}

function familiaEncerrar_(d, u) {
  var f = obter_('familias', d.familia_id);
  if (!f) throw erro_('Família não encontrada.');
  var st = d.tipo === 'concluida' ? 'concluida' : 'desligada';
  var motivos = ['a_pedido', 'emprego', 'mudanca', 'falecimento', 'faltas', 'descumprimento', 'conclusao', 'outro'];
  if (motivos.indexOf(d.motivo) === -1) throw erro_('Informe o motivo.');
  atualizar_('familias', f.id, { status: st, data_saida: txt_(d.data, 10) || hoje_(), motivo_saida: d.motivo + (d.detalhe ? ' · ' + txt_(d.detalhe, 300) : '') });
  historico_(f.id, st === 'concluida' ? 'Ciclo concluído' : 'Família desligada', 'Motivo: ' + d.motivo, u.id);
  auditar_(u, 'encerrar_familia', 'familias', f.id, d.motivo);
  return true;
}

function visitaSalvar_(d, u) {
  if (!obter_('familias', d.familia_id)) throw erro_('Família não encontrada.');
  var campos = { familia_id: d.familia_id, data: txt_(d.data, 10), hora: txt_(d.hora, 5), responsaveis: txt_(d.responsaveis, 300),
    status: ['agendada', 'realizada', 'cancelada'].indexOf(d.status) > -1 ? d.status : 'agendada',
    condicoes_moradia: txt_(d.condicoes_moradia, 2000), observacoes: txt_(d.observacoes, 2000), registrado_por: u.id };
  if (!campos.data) throw erro_('Informe a data da visita.');
  if (campos.status === 'realizada') campos.realizada_em = agora_();
  var v;
  if (d.id) { var ant = obter_('visitas', d.id); v = atualizar_('visitas', d.id, campos); if (ant && ant.status !== campos.status) historico_(d.familia_id, 'Visita domiciliar ' + campos.status, campos.data, u.id); }
  else { v = inserir_('visitas', campos); historico_(d.familia_id, 'Visita domiciliar ' + campos.status, campos.data + (campos.hora ? ' ' + campos.hora : ''), u.id); }
  var f = obter_('familias', d.familia_id);
  if (f.status === 'inscrita') atualizar_('familias', f.id, { status: 'em_triagem' });
  return { id: v.id };
}

/* ---------- Documentos (pasta privada no Drive) ---------- */
var TIPOS_DOC = ['rg_cnh', 'cpf', 'comprovante_endereco', 'certidao', 'comprovante_renda', 'beneficio', 'termo_assinado', 'outro'];
var MIMES_OK = ['application/pdf', 'image/jpeg', 'image/png'];

function pastaFamilia_(f) {
  var raiz = DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID'));
  var nome = f.codigo;
  var it = raiz.getFoldersByName(nome);
  return it.hasNext() ? it.next() : raiz.createFolder(nome);
}

function documentoEnviar_(d, u) {
  var familiaId = u.papel === 'familia' ? u.familia_id : d.familia_id;
  var f = obter_('familias', familiaId);
  if (!f) throw erro_('Família não encontrada.');
  if (MIMES_OK.indexOf(d.mime) === -1) throw erro_('Envie PDF, JPG ou PNG.');
  if (TIPOS_DOC.indexOf(d.tipo) === -1) throw erro_('Tipo de documento inválido.');
  var bytes = Utilities.base64Decode(String(d.base64 || ''));
  if (bytes.length > 5 * 1024 * 1024) throw erro_('Arquivo maior que 5 MB.');
  if (bytes.length === 0) throw erro_('Arquivo vazio.');
  var nome = f.codigo + '_' + d.tipo + '_' + hoje_() + '.' + (d.mime === 'application/pdf' ? 'pdf' : d.mime === 'image/png' ? 'png' : 'jpg');
  var arq = pastaFamilia_(f).createFile(Utilities.newBlob(bytes, d.mime, nome));
  var doc = inserir_('documentos', { familia_id: f.id, tipo: d.tipo, nome_arquivo: nome, drive_file_id: arq.getId(), mime: d.mime, tamanho: String(bytes.length), enviado_por: u.id });
  historico_(f.id, 'Documento enviado', d.tipo, u.id);
  auditar_(u, 'enviar_documento', 'documentos', doc.id, d.tipo);
  return { id: doc.id };
}

function documentoBaixar_(d, u) {
  var doc = obter_('documentos', d.id);
  if (!doc || doc.deleted_at) throw erro_('Documento não encontrado.');
  if (u.papel === 'familia' && doc.familia_id !== u.familia_id) throw erro_('Sem permissão.', 403);
  var blob = DriveApp.getFileById(doc.drive_file_id).getBlob();
  auditar_(u, 'baixar_documento', 'documentos', doc.id, '');
  return { nome: doc.nome_arquivo, mime: doc.mime, base64: Utilities.base64Encode(blob.getBytes()) };
}

function documentoExcluir_(d, u) {
  var doc = obter_('documentos', d.id);
  if (!doc) throw erro_('Documento não encontrado.');
  try { DriveApp.getFileById(doc.drive_file_id).setTrashed(true); } catch (e) { }
  atualizar_('documentos', doc.id, { deleted_at: agora_() });
  historico_(doc.familia_id, 'Documento removido', doc.tipo, u.id);
  auditar_(u, 'excluir_documento', 'documentos', doc.id, '');
  return true;
}

/* =========================================================
 * 11. ENCONTROS, PRESENÇA E ENTREGA (treinamento)
 * ========================================================= */
function encontrosListar_(d, u) {
  var cont = {};
  db_('presencas').forEach(function (p) {
    var c = cont[p.encontro_id] = cont[p.encontro_id] || { presentes: 0, cestas: 0 };
    if (p.presente === 'sim') c.presentes++;
    if (p.cesta_entregue === 'sim') c.cestas++;
  });
  var vol = {}; db_('presencas_voluntarios').forEach(function (p) { vol[p.encontro_id] = (vol[p.encontro_id] || 0) + 1; });
  return db_('encontros').map(function (e) {
    var o = limpa_(e); o.presentes = (cont[e.id] || {}).presentes || 0; o.cestas = (cont[e.id] || {}).cestas || 0; o.voluntarios = vol[e.id] || 0; return o;
  }).sort(function (a, b) { return a.data < b.data ? -1 : 1; });
}

function encontroSalvar_(d, u) {
  var campos = { data: txt_(d.data, 10), hora_inicio: txt_(d.hora_inicio, 5), tipo: txt_(d.tipo, 30) || 'treinamento_entrega', titulo: txt_(d.titulo, 150),
    tema_cidadania: txt_(d.tema_cidadania, 150), tema_espiritualidade: txt_(d.tema_espiritualidade, 150), tema_criancas: txt_(d.tema_criancas, 150),
    tema_adolescentes: txt_(d.tema_adolescentes, 150), oficina: txt_(d.oficina, 150), local: txt_(d.local, 150), grupo: txt_(d.grupo, 40),
    status: ['planejado', 'realizado', 'cancelado'].indexOf(d.status) > -1 ? d.status : 'planejado', observacoes: txt_(d.observacoes, 2000) };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(campos.data)) throw erro_('Informe a data.');
  if (!campos.titulo) campos.titulo = 'Encontro mensal';
  var e = d.id ? atualizar_('encontros', d.id, campos) : inserir_('encontros', campos);
  auditar_(u, 'salvar_encontro', 'encontros', e.id, campos.data);
  return { id: e.id };
}

function encontroExcluir_(d, u) {
  if (db_('presencas').some(function (p) { return p.encontro_id === d.id; })) throw erro_('Este encontro já tem presenças. Marque como cancelado em vez de excluir.');
  excluirLinha_('encontros', d.id);
  auditar_(u, 'excluir_encontro', 'encontros', d.id, '');
  return true;
}

function presencasListar_(d, u) {
  var e = obter_('encontros', d.encontro_id);
  if (!e) throw erro_('Encontro não encontrado.');
  var pres = {}; db_('presencas').filter(function (p) { return p.encontro_id === e.id; }).forEach(function (p) { pres[p.familia_id] = p; });
  var membros = {}; db_('membros').forEach(function (m) {
    var k = membros[m.familia_id] = membros[m.familia_id] || { adultos: 1, criancas: 0, adolescentes: 0 };
    var i = idade_(m.nascimento);
    if (i === null || i >= 18) k.adultos++; else if (i <= 10) k.criancas++; else k.adolescentes++;
  });
  var familias = db_('familias').filter(function (f) { return !f.deleted_at && (f.status === 'ativa' || pres[f.id]) && (!e.grupo || !f.grupo || f.grupo === e.grupo); })
    .map(function (f) {
      var p = pres[f.id], m = membros[f.id] || { adultos: 1, criancas: 0, adolescentes: 0 };
      return { familia_id: f.id, codigo: f.codigo, responsavel_nome: f.responsavel_nome, grupo: f.grupo,
        presente: p ? p.presente === 'sim' : null, justificada: p ? p.justificada === 'sim' : false, justificativa: p ? p.justificativa : '',
        adultos: p ? num_(p.adultos) : m.adultos, criancas: p ? num_(p.criancas) : m.criancas, adolescentes: p ? num_(p.adolescentes) : m.adolescentes,
        cesta_entregue: p ? p.cesta_entregue === 'sim' : false };
    }).sort(function (a, b) { return a.responsavel_nome < b.responsavel_nome ? -1 : 1; });
  var vols = {}; db_('presencas_voluntarios').filter(function (p) { return p.encontro_id === e.id; }).forEach(function (p) { vols[p.voluntario_id] = p.funcao || ''; });
  var voluntarios = db_('voluntarios').filter(function (v) { return v.status === 'ativo' || vols.hasOwnProperty(v.id); })
    .map(function (v) { return { voluntario_id: v.id, nome: v.nome, frente: v.frente, presente: vols.hasOwnProperty(v.id), funcao: vols[v.id] || '' }; })
    .sort(function (a, b) { return a.nome < b.nome ? -1 : 1; });
  return { encontro: limpa_(e), familias: familias, voluntarios: voluntarios, cestas_disponiveis: saldoCestas_() };
}

function presencasSalvar_(d, u) {
  var e = obter_('encontros', d.encontro_id);
  if (!e) throw erro_('Encontro não encontrado.');
  var existentes = {}; db_('presencas').filter(function (p) { return p.encontro_id === e.id; }).forEach(function (p) { existentes[p.familia_id] = p; });
  var novasCestas = 0;
  (d.familias || []).forEach(function (x) {
    if (x.presente === null || x.presente === undefined) return;
    var ant = existentes[x.familia_id];
    var cesta = x.presente && x.cesta_entregue ? 'sim' : 'nao';
    if (cesta === 'sim' && (!ant || ant.cesta_entregue !== 'sim')) novasCestas++;
    if (cesta === 'nao' && ant && ant.cesta_entregue === 'sim') novasCestas--;
  });
  if (novasCestas > 0 && novasCestas > saldoCestas_()) throw erro_('Há só ' + saldoCestas_() + ' cesta(s) montada(s) em estoque. Registre a montagem antes.');
  (d.familias || []).forEach(function (x) {
    if (x.presente === null || x.presente === undefined) return;
    var campos = { encontro_id: e.id, familia_id: x.familia_id, presente: x.presente ? 'sim' : 'nao', justificada: !x.presente && x.justificada ? 'sim' : 'nao',
      justificativa: txt_(x.justificativa, 300), adultos: String(x.presente ? num_(x.adultos) : 0), criancas: String(x.presente ? num_(x.criancas) : 0),
      adolescentes: String(x.presente ? num_(x.adolescentes) : 0), cesta_entregue: x.presente && x.cesta_entregue ? 'sim' : 'nao', registrado_por: u.id };
    var ant = existentes[x.familia_id];
    if (ant) {
      atualizar_('presencas', ant.id, campos);
      if (ant.presente !== campos.presente || ant.cesta_entregue !== campos.cesta_entregue) historico_(x.familia_id, presencaEvento_(campos), br_(e.data) + ' · ' + e.titulo, u.id);
    } else { inserir_('presencas', campos); historico_(x.familia_id, presencaEvento_(campos), br_(e.data) + ' · ' + e.titulo, u.id); }
  });
  if (d.voluntarios) {
    var atuais = db_('presencas_voluntarios').filter(function (p) { return p.encontro_id === e.id; });
    var mapa = {}; atuais.forEach(function (p) { mapa[p.voluntario_id] = p; });
    d.voluntarios.forEach(function (v) {
      if (v.presente && !mapa[v.voluntario_id]) inserir_('presencas_voluntarios', { encontro_id: e.id, voluntario_id: v.voluntario_id, funcao: txt_(v.funcao, 80), registrado_por: u.id });
      if (!v.presente && mapa[v.voluntario_id]) excluirLinha_('presencas_voluntarios', mapa[v.voluntario_id].id);
    });
  }
  if (d.finalizar) atualizar_('encontros', e.id, { status: 'realizado' });
  auditar_(u, 'salvar_presencas', 'encontros', e.id, '');
  return true;
}

function presencaEvento_(c) {
  if (c.presente === 'sim') return c.cesta_entregue === 'sim' ? 'Presente no encontro · cesta entregue' : 'Presente no encontro';
  return c.justificada === 'sim' ? 'Falta justificada' : 'Falta';
}

/* ---------- Voluntários ---------- */
function voluntariosListar_(d, u) {
  var pres = {}; db_('presencas_voluntarios').forEach(function (p) { pres[p.voluntario_id] = (pres[p.voluntario_id] || 0) + 1; });
  var acessos = {}; db_('usuarios').forEach(function (x) { if (x.voluntario_id) acessos[x.voluntario_id] = x; });
  var porEmail = {}; db_('usuarios').forEach(function (x) { if (x.email && x.papel !== 'familia') porEmail[x.email] = x; });
  return db_('voluntarios').map(function (v) {
    var o = limpa_(v); o.disponibilidade = json_(v.disponibilidade) || []; o.presencas = pres[v.id] || 0;
    var ac = acessos[v.id] || (v.email && porEmail[v.email]);
    o.acesso = ac ? { usuario_id: ac.id, papel: ac.papel, ativo: ac.ativo === 'sim', email: ac.email } : null;
    return o; })
    .sort(function (a, b) { return a.created_at < b.created_at ? 1 : -1; });
}

function voluntarioAtualizar_(d, u) {
  var v = obter_('voluntarios', d.id);
  if (!v) throw erro_('Voluntário não encontrado.');
  var campos = {};
  ['frente', 'gdc', 'lider_gdc', 'profissao', 'habilidades', 'observacoes', 'integracao_data', 'telefone', 'email'].forEach(function (k) { if (d.hasOwnProperty(k)) campos[k] = txt_(d[k], 500); });
  if (campos.hasOwnProperty('telefone')) campos.telefone = soDigitos_(campos.telefone);
  if (d.status && ['inscrito', 'integracao', 'ativo', 'inativo'].indexOf(d.status) > -1) campos.status = d.status;
  if (campos.status === 'ativo' && !v.integracao_data && !campos.integracao_data) campos.integracao_data = hoje_();
  atualizar_('voluntarios', v.id, campos);
  auditar_(u, 'editar_voluntario', 'voluntarios', v.id, campos.status || '');
  return true;
}

/* =========================================================
 * 12. ARRECADAÇÃO, ESTOQUE E MONTAGEM
 * ========================================================= */
function produtosListar_() {
  return db_('produtos').map(limpa_).sort(function (a, b) { return a.nome < b.nome ? -1 : 1; });
}

function produtoSalvar_(d, u) {
  var campos = { nome: txt_(d.nome, 100), unidade: txt_(d.unidade, 60), categoria: txt_(d.categoria, 60) || 'Mercearia', peso_kg: String(num_(d.peso_kg)), ativo: d.ativo === false ? 'nao' : 'sim' };
  if (!campos.nome) throw erro_('Informe o nome do produto.');
  var p = d.id ? atualizar_('produtos', d.id, campos) : inserir_('produtos', campos);
  auditar_(u, 'salvar_produto', 'produtos', p.id, campos.nome);
  return { id: p.id };
}

function cestaModelo_() {
  var prod = {}; db_('produtos').forEach(function (p) { prod[p.id] = p; });
  return db_('modelo_cesta').filter(function (m) { return prod[m.produto_id]; }).map(function (m) {
    var p = prod[m.produto_id]; return { produto_id: p.id, nome: p.nome, unidade: p.unidade, quantidade: num_(m.quantidade), peso_kg: num_(p.peso_kg) };
  }).sort(function (a, b) { return a.nome < b.nome ? -1 : 1; });
}

function cestaModeloSalvar_(d, u) {
  if (db_('montagens').length > 0 && !d.confirmar) throw erro_('Já existem cestas montadas com o modelo atual. Confirme para alterar.', 409);
  var atuais = db_('modelo_cesta').slice();
  atuais.reverse().forEach(function (m) { excluirLinha_('modelo_cesta', m.id); });
  (d.itens || []).forEach(function (i) { if (num_(i.quantidade) > 0 && obter_('produtos', i.produto_id)) inserir_('modelo_cesta', { produto_id: i.produto_id, quantidade: String(num_(i.quantidade)) }); });
  auditar_(u, 'salvar_modelo_cesta', 'modelo_cesta', '', '');
  return true;
}

function saldos_() {
  var s = {};
  db_('movimentos').forEach(function (m) {
    var q = num_(m.quantidade);
    s[m.produto_id] = (s[m.produto_id] || 0) + (m.tipo === 'entrada' ? q : m.tipo === 'ajuste' ? q : -q);
  });
  return s;
}

function saldoCestas_() {
  var montadas = db_('montagens').reduce(function (a, m) { return a + num_(m.quantidade_cestas); }, 0);
  var entregues = db_('presencas').filter(function (p) { return p.cesta_entregue === 'sim'; }).length;
  return montadas - entregues;
}

function estoquePainel_(d, u) {
  var c = config_();
  var saldo = saldos_();
  var modelo = cestaModelo_();
  var ativas = db_('familias').filter(function (f) { return f.status === 'ativa' && !f.deleted_at; }).length;
  var meta = num_(c.meta_cestas) || ativas;
  var montadasTotal = db_('montagens').reduce(function (a, m) { return a + num_(m.quantidade_cestas); }, 0);
  var cestasProntas = saldoCestas_();
  var aMontar = Math.max(0, meta - cestasProntas);
  var possiveis = modelo.length ? Math.min.apply(null, modelo.map(function (i) { return Math.floor(Math.max(0, saldo[i.produto_id] || 0) / i.quantidade); })) : 0;
  var itens = modelo.map(function (i) {
    var tem = saldo[i.produto_id] || 0, precisa = i.quantidade * aMontar;
    return { produto_id: i.produto_id, nome: i.nome, unidade: i.unidade, por_cesta: i.quantidade, saldo: tem, necessario: precisa, falta: Math.max(0, precisa - tem) };
  });
  var prod = {}; db_('produtos').forEach(function (p) { prod[p.id] = p; });
  var lim = new Date(Date.now() + 45 * 86400000).toISOString().substring(0, 10);
  var vencendo = db_('movimentos').filter(function (m) { return m.tipo === 'entrada' && m.validade && m.validade <= lim; })
    .map(function (m) { return { produto: (prod[m.produto_id] || {}).nome, quantidade: num_(m.quantidade), validade: m.validade }; })
    .sort(function (a, b) { return a.validade < b.validade ? -1 : 1; }).slice(0, 30);
  var kg = db_('movimentos').filter(function (m) { return m.tipo === 'entrada'; }).reduce(function (a, m) { return a + num_(m.quantidade) * num_((prod[m.produto_id] || {}).peso_kg); }, 0);
  var outros = Object.keys(saldo).filter(function (k) { return !modelo.some(function (i) { return i.produto_id === k; }) && prod[k]; })
    .map(function (k) { return { produto_id: k, nome: prod[k].nome, unidade: prod[k].unidade, saldo: saldo[k] }; });
  return { meta: meta, familias_ativas: ativas, montadas_total: montadasTotal, cestas_prontas: cestasProntas, a_montar: aMontar,
    possiveis_com_estoque: possiveis, itens: itens, outros_itens: outros, vencendo: vencendo, kg_arrecadados: Math.round(kg * 10) / 10,
    meta_configurada: !!num_(c.meta_cestas) };
}

function estoqueEntrada_(d, u) {
  var itens = d.itens || [];
  if (!itens.length) throw erro_('Inclua pelo menos um item.');
  var data = txt_(d.data, 10) || hoje_();
  itens.forEach(function (i) {
    if (!obter_('produtos', i.produto_id) || num_(i.quantidade) <= 0) throw erro_('Item ou quantidade inválida.');
  });
  itens.forEach(function (i) {
    inserir_('movimentos', { tipo: 'entrada', produto_id: i.produto_id, quantidade: String(num_(i.quantidade)), validade: txt_(i.validade, 10),
      doador_id: txt_(d.doador_id, 40), compromisso_id: txt_(i.compromisso_id, 40), motivo: txt_(d.observacoes, 300), usuario_id: u.id, data: data });
  });
  auditar_(u, 'entrada_estoque', 'movimentos', '', itens.length + ' itens');
  return true;
}

function estoqueSaida_(d, u) {
  var p = obter_('produtos', d.produto_id);
  if (!p || num_(d.quantidade) <= 0) throw erro_('Item ou quantidade inválida.');
  if (!txt_(d.motivo)) throw erro_('Informe o motivo (ex.: vencido, avariado, cesta emergencial).');
  inserir_('movimentos', { tipo: 'saida', produto_id: p.id, quantidade: String(num_(d.quantidade)), motivo: txt_(d.motivo, 300), usuario_id: u.id, data: txt_(d.data, 10) || hoje_() });
  auditar_(u, 'saida_estoque', 'movimentos', p.id, d.motivo);
  return true;
}

function estoqueMontar_(d, u) {
  var qtd = Math.floor(num_(d.quantidade));
  if (qtd <= 0) throw erro_('Informe quantas cestas foram montadas.');
  var modelo = cestaModelo_();
  if (!modelo.length) throw erro_('Defina o modelo da cesta primeiro.');
  var saldo = saldos_();
  var falta = modelo.filter(function (i) { return (saldo[i.produto_id] || 0) < i.quantidade * qtd; });
  if (falta.length) throw erro_('Estoque insuficiente: ' + falta.map(function (i) { return i.nome; }).join(', ') + '.');
  var m = inserir_('montagens', { data: txt_(d.data, 10) || hoje_(), quantidade_cestas: String(qtd), usuario_id: u.id, observacoes: txt_(d.observacoes, 300) });
  modelo.forEach(function (i) {
    inserir_('movimentos', { tipo: 'montagem', produto_id: i.produto_id, quantidade: String(i.quantidade * qtd), montagem_id: m.id, motivo: qtd + ' cesta(s)', usuario_id: u.id, data: m.data });
  });
  auditar_(u, 'montar_cestas', 'montagens', m.id, String(qtd));
  return { id: m.id, cestas_prontas: saldoCestas_() };
}

function estoqueConferir_(d, u) {
  var saldo = saldos_();
  var difs = [];
  (d.itens || []).forEach(function (i) {
    if (i.contado === '' || i.contado === null || i.contado === undefined) return;
    var dif = num_(i.contado) - (saldo[i.produto_id] || 0);
    difs.push({ produto_id: i.produto_id, sistema: saldo[i.produto_id] || 0, contado: num_(i.contado), diferenca: dif });
    if (dif !== 0) inserir_('movimentos', { tipo: 'ajuste', produto_id: i.produto_id, quantidade: String(dif), motivo: 'Conferência de inventário', usuario_id: u.id, data: hoje_() });
  });
  inserir_('conferencias', { data: hoje_(), usuario_id: u.id, itens: JSON.stringify(difs), observacoes: txt_(d.observacoes, 500) });
  auditar_(u, 'conferencia', 'conferencias', '', difs.length + ' itens');
  return { itens: difs };
}

function movimentosListar_(d, u) {
  var prod = {}; db_('produtos').forEach(function (p) { prod[p.id] = p; });
  var doad = {}; db_('doadores').forEach(function (p) { doad[p.id] = p; });
  var nomes = {}; db_('usuarios').forEach(function (x) { nomes[x.id] = x.nome; });
  return db_('movimentos').map(function (m) {
    var o = limpa_(m); o.produto = (prod[m.produto_id] || {}).nome || '?'; o.doador = (doad[m.doador_id] || {}).nome || ''; o.usuario = nomes[m.usuario_id] || ''; return o;
  }).reverse().slice(0, num_(d.limite) || 300);
}

function montagensListar_() {
  var nomes = {}; db_('usuarios').forEach(function (x) { nomes[x.id] = x.nome; });
  return db_('montagens').map(function (m) { var o = limpa_(m); o.usuario = nomes[m.usuario_id] || ''; return o; }).reverse();
}

/* ---------- Doadores e compromissos ---------- */
function doadoresListar_() {
  var recebido = {};
  db_('movimentos').forEach(function (m) { if (m.tipo === 'entrada' && m.compromisso_id) recebido[m.compromisso_id] = (recebido[m.compromisso_id] || 0) + num_(m.quantidade); });
  var prod = {}; db_('produtos').forEach(function (p) { prod[p.id] = p; });
  var comp = {};
  db_('compromissos').forEach(function (c) {
    var r = recebido[c.id] || 0, q = num_(c.quantidade);
    (comp[c.doador_id] = comp[c.doador_id] || []).push({ id: c.id, produto_id: c.produto_id, produto: (prod[c.produto_id] || {}).nome || '?', unidade: (prod[c.produto_id] || {}).unidade || '',
      quantidade: q, recebido: r, periodicidade: c.periodicidade, prazo: c.prazo, observacoes: c.observacoes,
      status: r >= q ? 'cumprido' : r > 0 ? 'parcial' : 'pendente' });
  });
  return db_('doadores').map(function (dd) { var o = limpa_(dd); o.compromissos = comp[dd.id] || []; return o; }).sort(function (a, b) { return a.nome < b.nome ? -1 : 1; });
}

function doadorSalvar_(d, u) {
  var campos = { tipo: ['pessoa', 'empresa', 'gdc', 'igreja', 'outro'].indexOf(d.tipo) > -1 ? d.tipo : 'pessoa', nome: txt_(d.nome, 150), contato: txt_(d.contato, 100),
    telefone: soDigitos_(d.telefone), email: txt_(d.email, 150), gdc: txt_(d.gdc, 100), observacoes: txt_(d.observacoes, 1000) };
  if (!campos.nome) throw erro_('Informe o nome.');
  var r = d.id ? atualizar_('doadores', d.id, campos) : inserir_('doadores', campos);
  auditar_(u, 'salvar_doador', 'doadores', r.id, campos.nome);
  return { id: r.id };
}

function compromissoSalvar_(d, u) {
  if (!obter_('doadores', d.doador_id) || !obter_('produtos', d.produto_id)) throw erro_('Escolha o doador e o produto.');
  var campos = { doador_id: d.doador_id, produto_id: d.produto_id, quantidade: String(num_(d.quantidade)), periodicidade: d.periodicidade === 'mensal' ? 'mensal' : 'unica',
    prazo: txt_(d.prazo, 10), observacoes: txt_(d.observacoes, 500) };
  if (num_(d.quantidade) <= 0) throw erro_('Informe a quantidade.');
  var r = d.id ? atualizar_('compromissos', d.id, campos) : inserir_('compromissos', campos);
  auditar_(u, 'salvar_compromisso', 'compromissos', r.id, '');
  return { id: r.id };
}

function compromissoExcluir_(d, u) {
  if (db_('movimentos').some(function (m) { return m.compromisso_id === d.id; })) throw erro_('Este compromisso já tem entregas registradas.');
  excluirLinha_('compromissos', d.id); auditar_(u, 'excluir_compromisso', 'compromissos', d.id, ''); return true;
}

/* =========================================================
 * 13. ADMIN: usuários, painel, relatório, configurações
 * ========================================================= */
function usuariosListar_() {
  return db_('usuarios').filter(function (x) { return x.papel !== 'familia'; }).map(function (x) {
    return { id: x.id, nome: x.nome, email: x.email, telefone: x.telefone, papel: x.papel, ativo: x.ativo === 'sim', ultimo_login: x.ultimo_login, voluntario_id: x.voluntario_id, trocar_senha: x.trocar_senha === 'sim' };
  }).sort(function (a, b) { return a.nome < b.nome ? -1 : 1; });
}

function usuarioSalvar_(d, u) {
  var email = txt_(d.email, 150).toLowerCase();
  if (!txt_(d.nome) || email.indexOf('@') < 1) throw erro_('Informe nome e e-mail.');
  if (['admin', 'triagem', 'arrecadacao', 'estoque', 'treinamento'].indexOf(d.papel) === -1) throw erro_('Escolha o perfil de acesso.');
  var outro = db_('usuarios').find(function (x) { return x.email === email && x.id !== d.id; });
  if (outro) throw erro_('Já existe um usuário com este e-mail.');
  var campos = { nome: txt_(d.nome, 150), email: email, telefone: soDigitos_(d.telefone), papel: d.papel, ativo: d.ativo === false ? 'nao' : 'sim' };
  if (d.voluntario_id) {
    var vol = obter_('voluntarios', d.voluntario_id);
    if (!vol) throw erro_('Voluntário não encontrado.');
    if (db_('usuarios').some(function (x) { return x.voluntario_id === vol.id && x.id !== d.id; })) throw erro_('Este voluntário já tem acesso.');
    campos.voluntario_id = vol.id;
    var cv = { email: email };
    if (vol.status === 'inscrito' || vol.status === 'integracao') { cv.status = 'ativo'; if (!vol.integracao_data) cv.integracao_data = hoje_(); }
    atualizar_('voluntarios', vol.id, cv);
  }
  var senhaTemp = null;
  if (!d.id) {
    senhaTemp = senhaTemporaria_();
    var sal = Utilities.getUuid();
    campos.senha_salt = sal; campos.senha_hash = hashSenha_(senhaTemp, sal); campos.trocar_senha = 'sim'; campos.tentativas = '0';
    var n = inserir_('usuarios', campos);
    auditar_(u, 'criar_usuario', 'usuarios', n.id, d.papel);
    return { id: n.id, senha_temporaria: senhaTemp };
  }
  if (d.id === u.id && campos.papel !== 'admin') throw erro_('Você não pode tirar seu próprio acesso de admin.');
  atualizar_('usuarios', d.id, campos);
  auditar_(u, 'editar_usuario', 'usuarios', d.id, d.papel);
  return { id: d.id };
}

function senhaTemporaria_() {
  var c = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789', s = '';
  var r = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
  for (var i = 0; i < 10; i++) s += c.charAt(parseInt(r.substr(i * 2, 2), 16) % c.length);
  return s;
}

function usuarioResetar_(d, u) {
  var alvo = obter_('usuarios', d.id);
  if (!alvo) throw erro_('Usuário não encontrado.');
  var senha = senhaTemporaria_(), sal = Utilities.getUuid();
  atualizar_('usuarios', alvo.id, { senha_salt: sal, senha_hash: hashSenha_(senha, sal), trocar_senha: 'sim', tentativas: '0', bloqueado_ate: '' });
  db_('sessoes').filter(function (s) { return s.usuario_id === alvo.id; }).reverse().forEach(function (s) { excluirLinha_('sessoes', s.id); });
  auditar_(u, 'resetar_senha', 'usuarios', alvo.id, '');
  return { senha_temporaria: senha };
}

function familiaResetarSenha_(d, u) {
  var alvo = db_('usuarios').find(function (x) { return x.familia_id === d.familia_id; });
  if (!alvo) throw erro_('Esta família não tem acesso criado.');
  return usuarioResetar_({ id: alvo.id }, u);
}

function painel_(d, u) {
  var fam = db_('familias').filter(function (f) { return !f.deleted_at; });
  var porStatus = {}; STATUS_FAMILIA.forEach(function (s) { porStatus[s] = 0; });
  fam.forEach(function (f) { porStatus[f.status] = (porStatus[f.status] || 0) + 1; });
  var vol = db_('voluntarios'); var vs = { inscrito: 0, integracao: 0, ativo: 0, inativo: 0 }, frentes = { arrecadacao: 0, triagem: 0, entrega: 0, qualquer: 0 };
  vol.forEach(function (v) { vs[v.status] = (vs[v.status] || 0) + 1; if (v.status !== 'inativo') frentes[v.frente] = (frentes[v.frente] || 0) + 1; });
  var prox = db_('encontros').filter(function (e) { return e.data >= hoje_() && e.status !== 'cancelado'; }).sort(function (a, b) { return a.data < b.data ? -1 : 1; })[0] || null;
  var visitasAg = db_('visitas').filter(function (v) { return v.status === 'agendada' && v.data >= hoje_(); }).length;
  var est = estoquePainel_({}, u);
  var c = config_();
  var alertaFaltas = familiasListar_({}, { papel: 'triagem' }).filter(function (f) { return f.status === 'ativa' && f.faltas_sem_justificativa >= num_(c.limite_faltas); }).length;
  return {
    familias: porStatus, total_familias: fam.length, voluntarios: vs, frentes: frentes, proximo_encontro: prox ? limpa_(prox) : null,
    visitas_agendadas: visitasAg, estoque: { meta: est.meta, cestas_prontas: est.cestas_prontas, a_montar: est.a_montar, possiveis: est.possiveis_com_estoque, kg: est.kg_arrecadados,
      itens_em_falta: est.itens.filter(function (i) { return i.falta > 0; }).length },
    doadores: db_('doadores').length, alerta_faltas: alertaFaltas, papel: u.papel
  };
}

function relatorioMensal_(d, u) {
  var mes = txt_(d.mes, 7) || hoje_().substring(0, 7);
  if (!/^\d{4}-\d{2}$/.test(mes)) throw erro_('Mês inválido.');
  var enc = db_('encontros').filter(function (e) { return e.data.substring(0, 7) === mes; });
  var ids = {}; enc.forEach(function (e) { ids[e.id] = 1; });
  var pres = db_('presencas').filter(function (p) { return ids[p.encontro_id] && p.presente === 'sim'; });
  var famDistintas = {}; pres.forEach(function (p) { famDistintas[p.familia_id] = 1; });
  var soma = function (k) { return pres.reduce(function (a, p) { return a + num_(p[k]); }, 0); };
  var prod = {}; db_('produtos').forEach(function (p) { prod[p.id] = p; });
  var kg = db_('movimentos').filter(function (m) { return m.tipo === 'entrada' && String(m.data).substring(0, 7) === mes; })
    .reduce(function (a, m) { return a + num_(m.quantidade) * num_((prod[m.produto_id] || {}).peso_kg); }, 0);
  var visitas = db_('visitas').filter(function (v) { return v.status === 'realizada' && String(v.data).substring(0, 7) === mes; }).length;
  var triagens = db_('triagens').filter(function (t) { return String(t.data_entrevista).substring(0, 7) === mes; }).length;
  var volPres = db_('presencas_voluntarios').filter(function (p) { return ids[p.encontro_id]; }).length;
  var integrados = db_('voluntarios').filter(function (v) { return String(v.integracao_data).substring(0, 7) === mes; }).length;
  var fimMes = mes + '-31';
  var cadastradas = db_('familias').filter(function (f) { return !f.deleted_at && f.status === 'ativa' && (!f.data_entrada || f.data_entrada <= fimMes); }).length;
  var inscritos = db_('voluntarios').filter(function (v) { return v.status === 'ativo'; }).length;
  var empregos = db_('familias').filter(function (f) { return String(f.data_saida).substring(0, 7) === mes && String(f.motivo_saida).indexOf('emprego') === 0; }).length;
  var cestas = pres.filter(function (p) { return p.cesta_entregue === 'sim'; }).length;
  var linhas = [
    ['Famílias cadastradas (ativas)', cadastradas], ['Voluntários inscritos (ativos)', inscritos],
    ['Famílias atendidas', Object.keys(famDistintas).length], ['Voluntários presentes', volPres],
    ['Crianças (0 a 10 anos)', soma('criancas')], ['Adolescentes (11 anos ou mais)', soma('adolescentes')],
    ['Famílias atendidas no plantão social', 0], ['Pessoas em palestras, oficinas e atividades coletivas', soma('adultos') + soma('criancas') + soma('adolescentes')],
    ['Atendimento emergencial via membros/GDC', 0], ['Atendimentos emergenciais', 0],
    ['Doações de alimentos (kg)', Math.round(kg * 10) / 10], ['Outras doações', 0],
    ['Visitas domiciliares ou triagens', visitas + triagens], ['Treinamento de novos voluntários', integrados],
    ['Inserção no mercado de trabalho', empregos], ['Cestas entregues', cestas], ['Encontros realizados', enc.filter(function (e) { return e.status === 'realizado'; }).length]
  ];
  return { mes: mes, unidade: config_().unidade_nome, linhas: linhas };
}

function configAdmin_() {
  var c = config_(); return c;
}

function configSalvar_(d, u) {
  var permitidas = ['unidade_nome', 'cidade', 'duracao_meses', 'limite_faltas', 'meta_cestas', 'termo_versao', 'termo_participacao', 'termo_lgpd',
    'termo_imagem', 'termo_voluntario', 'inscricoes_familias_abertas', 'inscricoes_voluntarios_abertas'];
  var linhas = db_('config');
  Object.keys(d).forEach(function (k) {
    if (permitidas.indexOf(k) === -1) return;
    var v = txt_(d[k], 20000);
    var r = linhas.find(function (x) { return x.chave === k; });
    if (r) aba_('config').getRange(r._row, 1, 1, 3).setValues([[k, v, agora_()]]);
    else inserirSemId_('config', { chave: k, valor: v, updated_at: agora_() });
  });
  delete _cache.config;
  auditar_(u, 'salvar_config', 'config', '', Object.keys(d).join(','));
  return true;
}

function metaSalvar_(d, u) {
  return configSalvar_({ meta_cestas: String(Math.max(0, Math.floor(num_(d.meta)))) || '' }, u);
}

function auditoriaListar_(d) {
  var nomes = {}; db_('usuarios').forEach(function (x) { nomes[x.id] = x.nome; });
  return db_('auditoria').slice(-500).reverse().map(function (a) { var o = limpa_(a); o.usuario = nomes[a.usuario_id] || ''; return o; });
}

/* =========================================================
 * 13b. EXCLUSÕES (somente admin)
 * ========================================================= */
function excluirOnde_(nome, filtro) {
  var linhas = db_(nome).filter(filtro).map(function (x) { return x._row; }).sort(function (a, b) { return b - a; });
  var sh = aba_(nome);
  linhas.forEach(function (r) { sh.deleteRow(r); });
  delete _cache[nome];
  return linhas.length;
}

function familiaExcluir_(d, u) {
  var f = obter_('familias', d.id);
  if (!f) throw erro_('Família não encontrada.');
  if (String(d.confirmacao || '').trim().toUpperCase() !== f.codigo) throw erro_('Digite o código ' + f.codigo + ' para confirmar.');
  db_('documentos').filter(function (x) { return x.familia_id === f.id; }).forEach(function (x) {
    try { DriveApp.getFileById(x.drive_file_id).setTrashed(true); } catch (e) { }
  });
  try {
    var raiz = DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID'));
    var it = raiz.getFoldersByName(f.codigo); while (it.hasNext()) it.next().setTrashed(true);
  } catch (e) { }
  var usuarios = db_('usuarios').filter(function (x) { return x.familia_id === f.id; }).map(function (x) { return x.id; });
  excluirOnde_('sessoes', function (s) { return usuarios.indexOf(s.usuario_id) > -1; });
  excluirOnde_('usuarios', function (x) { return x.familia_id === f.id; });
  ['membros', 'triagens', 'visitas', 'documentos', 'historico', 'presencas'].forEach(function (tb) {
    excluirOnde_(tb, function (x) { return x.familia_id === f.id; });
  });
  excluirOnde_('familias', function (x) { return x.id === f.id; });
  auditar_(u, 'excluir_familia', 'familias', f.id, f.codigo + ' (todos os dados e documentos removidos)');
  return true;
}

function usuarioExcluir_(d, u) {
  var alvo = obter_('usuarios', d.id);
  if (!alvo) throw erro_('Usuário não encontrado.');
  if (alvo.id === u.id) throw erro_('Você não pode excluir o seu próprio acesso.');
  if (alvo.papel === 'familia') throw erro_('Para remover uma família, exclua a inscrição dela na Triagem.');
  if (alvo.papel === 'admin' && db_('usuarios').filter(function (x) { return x.papel === 'admin' && x.ativo === 'sim'; }).length <= 1) throw erro_('Precisa existir pelo menos um administrador.');
  excluirOnde_('sessoes', function (s) { return s.usuario_id === alvo.id; });
  excluirOnde_('usuarios', function (x) { return x.id === alvo.id; });
  auditar_(u, 'excluir_usuario', 'usuarios', alvo.id, alvo.papel);
  return true;
}

function voluntarioExcluir_(d, u) {
  var v = obter_('voluntarios', d.id);
  if (!v) throw erro_('Voluntário não encontrado.');
  excluirOnde_('presencas_voluntarios', function (x) { return x.voluntario_id === v.id; });
  var acessos = db_('usuarios').filter(function (x) { return x.voluntario_id === v.id; });
  if (d.excluir_acesso) {
    acessos.forEach(function (a) { if (a.id !== u.id) { excluirOnde_('sessoes', function (s) { return s.usuario_id === a.id; }); excluirOnde_('usuarios', function (x) { return x.id === a.id; }); } });
  } else {
    acessos.forEach(function (a) { atualizar_('usuarios', a.id, { voluntario_id: '' }); });
  }
  excluirOnde_('voluntarios', function (x) { return x.id === v.id; });
  auditar_(u, 'excluir_voluntario', 'voluntarios', v.id, d.excluir_acesso ? 'com acesso' : '');
  return true;
}

function doadorExcluir_(d, u) {
  var x = obter_('doadores', d.id);
  if (!x) throw erro_('Doador não encontrado.');
  var comps = db_('compromissos').filter(function (c) { return c.doador_id === x.id; }).map(function (c) { return c.id; });
  db_('movimentos').filter(function (m) { return m.doador_id === x.id || comps.indexOf(m.compromisso_id) > -1; }).forEach(function (m) {
    atualizar_('movimentos', m.id, { doador_id: '', compromisso_id: '' });
  });
  excluirOnde_('compromissos', function (c) { return c.doador_id === x.id; });
  excluirOnde_('doadores', function (c) { return c.id === x.id; });
  auditar_(u, 'excluir_doador', 'doadores', x.id, 'entradas de estoque mantidas sem doador');
  return true;
}

/* =========================================================
 * 14. TABELA DE ROTAS E PERMISSÕES
 * ========================================================= */
var T = 'triagem', A = 'arrecadacao', E = 'estoque', TR = 'treinamento', F = 'familia';
var ROTAS = {
  'ping': { fn: function () { return { versao: VERSAO }; } },
  'config.publica': { fn: configPublica_ },
  'familia.inscrever': { fn: inscreverFamilia_, escrita: true },
  'voluntario.inscrever': { fn: inscreverVoluntario_, escrita: true },
  'auth.login': { fn: login_, escrita: true },
  'auth.me': { fn: function (d, u) { return perfil_(u); }, papeis: ['*'] },
  'auth.logout': { fn: logout_, papeis: ['*'], escrita: true },
  'auth.trocarSenha': { fn: trocarSenha_, papeis: ['*'], escrita: true },

  'portal.minha': { fn: portalMinha_, papeis: [F] },
  'portal.imagem': { fn: portalImagem_, papeis: [F], escrita: true },

  'painel': { fn: painel_, papeis: [T, A, E, TR] },
  'familias.listar': { fn: familiasListar_, papeis: [T, TR] },
  'familias.obter': { fn: familiaObter_, papeis: [T] },
  'familias.atualizar': { fn: familiaAtualizar_, papeis: [T], escrita: true },
  'familias.encerrar': { fn: familiaEncerrar_, papeis: [T], escrita: true },
  'familias.resetarSenha': { fn: familiaResetarSenha_, papeis: [T], escrita: true },
  'triagem.salvar': { fn: triagemSalvar_, papeis: [T], escrita: true },
  'triagem.decidir': { fn: triagemDecidir_, papeis: [T], escrita: true },
  'visitas.salvar': { fn: visitaSalvar_, papeis: [T], escrita: true },
  'documentos.enviar': { fn: documentoEnviar_, papeis: [T, F], escrita: true },
  'documentos.baixar': { fn: documentoBaixar_, papeis: [T, F] },
  'documentos.excluir': { fn: documentoExcluir_, papeis: [T], escrita: true },

  'encontros.listar': { fn: encontrosListar_, papeis: [TR, T] },
  'encontros.salvar': { fn: encontroSalvar_, papeis: [TR], escrita: true },
  'encontros.excluir': { fn: encontroExcluir_, papeis: [TR], escrita: true },
  'presencas.listar': { fn: presencasListar_, papeis: [TR] },
  'presencas.salvar': { fn: presencasSalvar_, papeis: [TR], escrita: true },
  'voluntarios.listar': { fn: voluntariosListar_, papeis: [TR] }, // admin também acessa (regra geral)
  'voluntarios.atualizar': { fn: voluntarioAtualizar_, papeis: [TR], escrita: true },

  'produtos.listar': { fn: produtosListar_, papeis: [A, E] },
  'produtos.salvar': { fn: produtoSalvar_, papeis: [A], escrita: true },
  'cesta.modelo': { fn: cestaModelo_, papeis: [A, E] },
  'cesta.modeloSalvar': { fn: cestaModeloSalvar_, papeis: [A], escrita: true },
  'estoque.painel': { fn: estoquePainel_, papeis: [A, E, TR] },
  'estoque.entrada': { fn: estoqueEntrada_, papeis: [A], escrita: true },
  'estoque.saida': { fn: estoqueSaida_, papeis: [A], escrita: true },
  'estoque.montar': { fn: estoqueMontar_, papeis: [A, E], escrita: true },
  'estoque.conferir': { fn: estoqueConferir_, papeis: [A, E], escrita: true },
  'estoque.movimentos': { fn: movimentosListar_, papeis: [A, E] },
  'estoque.montagens': { fn: montagensListar_, papeis: [A, E] },
  'estoque.meta': { fn: metaSalvar_, papeis: [A], escrita: true },
  'doadores.listar': { fn: doadoresListar_, papeis: [A] },
  'doadores.salvar': { fn: doadorSalvar_, papeis: [A], escrita: true },
  'compromissos.salvar': { fn: compromissoSalvar_, papeis: [A], escrita: true },
  'compromissos.excluir': { fn: compromissoExcluir_, papeis: [A], escrita: true },

  'usuarios.listar': { fn: usuariosListar_, papeis: ['admin'] },
  'usuarios.salvar': { fn: usuarioSalvar_, papeis: ['admin'], escrita: true },
  'usuarios.resetarSenha': { fn: usuarioResetar_, papeis: ['admin'], escrita: true },
  'relatorio.mensal': { fn: relatorioMensal_, papeis: ['admin'] },
  'config.obter': { fn: configAdmin_, papeis: ['admin'] },
  'config.salvar': { fn: configSalvar_, papeis: ['admin'], escrita: true },
  'auditoria.listar': { fn: auditoriaListar_, papeis: ['admin'] },
  'familias.excluir': { fn: familiaExcluir_, papeis: ['admin'], escrita: true },
  'usuarios.excluir': { fn: usuarioExcluir_, papeis: ['admin'], escrita: true },
  'voluntarios.excluir': { fn: voluntarioExcluir_, papeis: ['admin'], escrita: true },
  'doadores.excluir': { fn: doadorExcluir_, papeis: ['admin'], escrita: true }
};
