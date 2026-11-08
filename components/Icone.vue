<template>
  <svg class="icone" :width="tam" :height="tam" viewBox="0 0 24 24" fill="none" stroke="currentColor" :stroke-width="espessura" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" v-html="ICONES[nome] || ''" />
</template>
<script setup lang="ts">
withDefaults(defineProps<{ nome: string; tam?: number | string; espessura?: number | string }>(), { tam: 22, espessura: 2 })
// Ícones de traço (estilo da identidade: traço arredondado, como o símbolo da Cidade Social)
const ICONES: Record<string, string> = {
  casa: '<path d="M3.5 11 12 3.5l8.5 7.5"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5h4v5"/>',
  familia: '<circle cx="8" cy="7" r="3"/><circle cx="17" cy="9" r="2.3"/><path d="M2.5 20a5.5 5.5 0 0 1 11 0"/><path d="M13.5 20a3.6 3.6 0 0 1 7.2 0"/>',
  maos: '<path d="M12 20s-7-4.2-7-9.6A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.4C19 15.8 12 20 12 20z"/>',
  equipe: '<circle cx="9" cy="8" r="3.4"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17.5" cy="8.5" r="2.4"/><path d="M16.5 14.4a5 5 0 0 1 5 5.6"/>',
  cadeado: '<rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><path d="M12 15v2"/>',
  calendario: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8 14h2M12 14h2M8 17h2"/>',
  cesta: '<path d="M4 10h16l-1.6 8.6A2 2 0 0 1 16.4 20H7.6a2 2 0 0 1-2-1.4z"/><path d="M8 10l4-6 4 6"/><path d="M9.5 13.5v3M12 13.5v3M14.5 13.5v3"/>',
  prancheta: '<rect x="5.5" y="4" width="13" height="17" rx="2"/><path d="M9 4h6v3H9z"/><path d="M9 11.5h6M9 15.5h4"/>',
  cafe: '<path d="M4 9h12v4.5A5.5 5.5 0 0 1 10.5 19h-1A5.5 5.5 0 0 1 4 13.5z"/><path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 3.5c0 1.4 1 1.4 1 3M12 3.5c0 1.4 1 1.4 1 3"/>',
  caixa: '<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/>',
  grafico: '<path d="M4 20V4M4 20h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/>',
  engrenagem: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  escudo: '<path d="M12 3 4.5 6v6c0 4.5 3.2 7.6 7.5 9 4.3-1.4 7.5-4.5 7.5-9V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.8 2.8L16.5 9.5"/>',
  busca: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
  seta: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  sair: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 17l-5-5 5-5M5 12h11"/>',
  chave: '<circle cx="8" cy="15" r="4"/><path d="M11 12 20 3M16.5 6.5l2.5 2.5M14 9l2 2"/>',
  usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  livro: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/>',
  pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/>',
  mais: '<path d="M12 5v14M5 12h14"/>',
  coracao: '<path d="M12 20s-8-4.6-8-10.4A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.6C20 15.4 12 20 12 20z"/>'
}
</script>
<style scoped>
.icone { flex: none; display: inline-block; vertical-align: middle; }
</style>
