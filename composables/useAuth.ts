export const PAPEIS: Record<string, string> = {
  admin: 'Administração',
  triagem: 'Triagem',
  arrecadacao: 'Arrecadação e montagem',
  estoque: 'Inventário (voluntário)',
  treinamento: 'Entrega e treinamento',
  familia: 'Família'
}

export function useAuth() {
  const usuario = useState<any>('usuario', () => lerUsuario())
  const entrar = async (login: string, senha: string) => {
    const r = await api('auth.login', { login, senha })
    salvarSessao(r.token, r.usuario)
    usuario.value = r.usuario
    return r.usuario
  }
  const sair = async () => {
    try { await api('auth.logout') } catch {}
    limparSessao()
    usuario.value = null
    navigateTo('/entrar')
  }
  const pode = (...papeis: string[]) => !!usuario.value && (usuario.value.papel === 'admin' || papeis.includes(usuario.value.papel))
  const inicio = (u = usuario.value) => {
    if (!u) return '/entrar'
    if (u.trocar_senha) return '/trocar-senha'
    if (u.papel === 'familia') return '/familia'
    if (u.papel === 'estoque') return '/estoque'
    return '/painel'
  }
  return { usuario, entrar, sair, pode, inicio }
}
