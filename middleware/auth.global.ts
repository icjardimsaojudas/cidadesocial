export default defineNuxtRouteMiddleware((to) => {
  const papeis = to.meta.papeis as string[] | undefined
  if (!papeis) return
  const { usuario, inicio } = useAuth()
  if (!usuario.value || !lerToken()) return navigateTo('/entrar?volta=' + encodeURIComponent(to.fullPath))
  if (usuario.value.trocar_senha && to.path !== '/trocar-senha') return navigateTo('/trocar-senha')
  if (papeis[0] === '*') return
  if (usuario.value.papel !== 'admin' && !papeis.includes(usuario.value.papel)) return navigateTo(inicio())
})
