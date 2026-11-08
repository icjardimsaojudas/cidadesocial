const toasts = ref<{ id: number; msg: string; tipo: string }[]>([])
let n = 0
export function useToast() {
  const show = (msg: string, tipo = 'ok') => {
    const id = ++n
    toasts.value = [...toasts.value.slice(-2), { id, msg, tipo }]
    setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, tipo === 'erro' ? 6000 : 3500)
  }
  return { toasts, ok: (m: string) => show(m, 'ok'), erro: (m: string) => show(m, 'erro') }
}
