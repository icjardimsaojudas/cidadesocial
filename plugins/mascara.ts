// v-mascara="'cpf' | 'tel' | 'cep' | 'nis'": formata e bloqueia dígitos além do padrão de cada campo.
const REGRAS: Record<string, { max: number; fmt: (d: string) => string }> = {
  cpf: { max: 11, fmt: d => d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2') },
  tel: { max: 11, fmt: d => d.length <= 10 ? d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2') : d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2') },
  cep: { max: 8, fmt: d => d.replace(/(\d{5})(\d)/, '$1-$2') },
  nis: { max: 11, fmt: d => d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{5})(\d)/, '$1.$2').replace(/(\d{2})(\d)$/, '$1-$2') },
  // dinheiro: digita centavos (1, 12, 123 → R$ 1,23)
  moeda: { max: 10, fmt: d => { d = d.replace(/^0+/, ''); if (!d) return ''; return 'R$ ' + (parseInt(d, 10) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) } }
}
const TAM: Record<string, number> = { cpf: 14, tel: 15, cep: 9, nis: 14, moeda: 17 }

function aplicar(el: HTMLInputElement, tipo: string) {
  const r = REGRAS[tipo]; if (!r) return el.value
  return r.fmt(el.value.replace(/\D/g, '').slice(0, r.max))
}

export default defineNuxtPlugin((app) => {
  app.vueApp.directive('mascara', {
    mounted(el: HTMLInputElement, b) {
      el.setAttribute('maxlength', String(TAM[b.value] || 20))
      el.setAttribute('inputmode', 'numeric')
      el.addEventListener('input', () => {
        const f = aplicar(el, b.value)
        if (f !== el.value) { el.value = f; el.dispatchEvent(new Event('input')) }
      })
      el.addEventListener('paste', () => setTimeout(() => { const f = aplicar(el, b.value); if (f !== el.value) { el.value = f; el.dispatchEvent(new Event('input')) } }))
      if (el.value) el.value = aplicar(el, b.value)
    },
    updated(el: HTMLInputElement, b) {
      if (document.activeElement !== el && el.value) el.value = aplicar(el, b.value)
    }
  })
})
