// Única porta de saída para o backend. Para migrar ao Supabase, troca-se só o endereço em config.json.
let apiUrl = ''
const TOKEN = 'fsi_token'
const USER = 'fsi_usuario'

async function carregarConfig() {
  if (apiUrl) return apiUrl
  const base = useRuntimeConfig().app.baseURL || '/'
  const r = await fetch(base + 'config.json', { cache: 'no-store' })
  const j = await r.json()
  apiUrl = j.apiUrl
  if (!apiUrl || !apiUrl.startsWith('http')) throw new Error('O endereço do sistema ainda não foi configurado (config.json).')
  return apiUrl
}

export function lerToken() { try { return localStorage.getItem(TOKEN) || '' } catch { return '' } }
export function salvarSessao(token: string, usuario: any) {
  try { localStorage.setItem(TOKEN, token); localStorage.setItem(USER, JSON.stringify(usuario)) } catch {}
}
export function limparSessao() { try { localStorage.removeItem(TOKEN); localStorage.removeItem(USER) } catch {} }
export function lerUsuario() { try { return JSON.parse(localStorage.getItem(USER) || 'null') } catch { return null } }

export async function api<T = any>(action: string, data: any = {}): Promise<T> {
  const url = await carregarConfig()
  let r: Response
  try {
    r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, data, token: lerToken() })
    })
  } catch {
    throw new Error('Sem conexão com o sistema. Verifique a internet e tente de novo.')
  }
  const j = await r.json().catch(() => ({ ok: false, erro: 'Resposta inválida do sistema.' }))
  if (!j.ok) {
    if (j.codigo === 401 && action !== 'auth.login') {
      limparSessao()
      useState('usuario').value = null
      navigateTo('/entrar')
    }
    throw new Error(j.erro || 'Erro inesperado.')
  }
  return j.dados as T
}
