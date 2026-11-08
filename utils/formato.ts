export const soDigitos = (v: any) => String(v || '').replace(/\D/g, '')
export function cpfValido(v: string) {
  const c = soDigitos(v)
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false
  for (let t = 9; t < 11; t++) {
    let s = 0
    for (let i = 0; i < t; i++) s += +c[i] * (t + 1 - i)
    if (((10 * s) % 11) % 10 !== +c[t]) return false
  }
  return true
}
export const mascaraCpf = (v: string) => soDigitos(v).slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
export const mascaraTel = (v: string) => {
  const d = soDigitos(v).slice(0, 11)
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2')
  return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2')
}
export const mascaraCep = (v: string) => soDigitos(v).slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2')
export const dataBR = (iso: string) => {
  if (!iso) return ''
  const [a, m, d] = String(iso).substring(0, 10).split('-')
  return d ? `${d}/${m}/${a}` : iso
}
export const dataHoraBR = (iso: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(+d) ? iso : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}
export const diaSemana = (iso: string) => {
  if (!iso) return ''
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long' })
}
// "R$ 1.234,56" → 1234.56 ; "900" → 900
export const parseMoeda = (v: any) => {
  if (typeof v === 'number') return v
  const s = String(v || '')
  if (s.includes(',')) return parseFloat(s.replace(/[^\d,]/g, '').replace(',', '.')) || 0
  return parseFloat(s.replace(/[^\d.]/g, '')) || 0
}
export const moedaCampo = (v: any) => { const n = parseMoeda(v); return n ? 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '' }
export const moeda = (v: any) => parseMoeda(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const hojeISO = () => {
  const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().substring(0, 10)
}
export const idade = (nasc: string) => {
  if (!nasc) return null
  const d = new Date(nasc + 'T12:00:00'), h = new Date()
  let a = h.getFullYear() - d.getFullYear()
  if (h.getMonth() < d.getMonth() || (h.getMonth() === d.getMonth() && h.getDate() < d.getDate())) a--
  return a
}

export const STATUS_FAMILIA: Record<string, { rotulo: string; cor: string }> = {
  inscrita: { rotulo: 'Inscrita', cor: 'azul' },
  em_triagem: { rotulo: 'Em triagem', cor: 'ambar' },
  lista_espera: { rotulo: 'Lista de espera', cor: 'cinza' },
  nao_aprovada: { rotulo: 'Não aprovada', cor: 'vermelho' },
  ativa: { rotulo: 'Ativa no programa', cor: 'verde' },
  concluida: { rotulo: 'Concluiu o ciclo', cor: 'roxo' },
  desligada: { rotulo: 'Desligada', cor: 'cinza' }
}
export const STATUS_VOLUNTARIO: Record<string, { rotulo: string; cor: string }> = {
  inscrito: { rotulo: 'Inscrito', cor: 'azul' },
  integracao: { rotulo: 'Em integração', cor: 'ambar' },
  ativo: { rotulo: 'Ativo', cor: 'verde' },
  inativo: { rotulo: 'Inativo', cor: 'cinza' }
}
export const FRENTES: Record<string, string> = {
  arrecadacao: 'Arrecadação e montagem',
  triagem: 'Triagem',
  entrega: 'Dia da entrega e treinamento',
  qualquer: 'Onde precisarem'
}
export const TIPOS_DOC: Record<string, string> = {
  rg_cnh: 'RG ou CNH', cpf: 'CPF', comprovante_endereco: 'Comprovante de endereço', certidao: 'Certidão de nascimento',
  comprovante_renda: 'Comprovante de renda', beneficio: 'Comprovante de benefício', termo_assinado: 'Termo assinado', outro: 'Outro'
}
export const MOTIVOS_SAIDA: Record<string, string> = {
  conclusao: 'Concluiu os 12 meses', emprego: 'Conseguiu emprego (saída positiva)', a_pedido: 'Desligamento a pedido',
  mudanca: 'Mudança de endereço/cidade', faltas: 'Excesso de faltas', descumprimento: 'Descumprimento do termo', falecimento: 'Falecimento', outro: 'Outro'
}

export function baixarBase64(nome: string, mime: string, b64: string) {
  const bin = atob(b64); const u = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i)
  const url = URL.createObjectURL(new Blob([u], { type: mime }))
  const a = document.createElement('a'); a.href = url; a.download = nome; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
export function lerArquivoBase64(f: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(String(r.result).split(',')[1] || '')
    r.onerror = rej
    r.readAsDataURL(f)
  })
}
export function baixarCSV(nome: string, linhas: any[][]) {
  const csv = linhas.map(l => l.map(c => '"' + String(c ?? '').replace(/"/g, '""') + '"').join(';')).join('\r\n')
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a'); a.href = url; a.download = nome; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
