<template><span class="selo" :class="info.cor">{{ info.rotulo }}</span></template>
<script setup lang="ts">
const p = defineProps<{ valor: string; tipo?: 'familia' | 'voluntario' }>()
const info = computed(() => (p.tipo === 'voluntario' ? STATUS_VOLUNTARIO : STATUS_FAMILIA)[p.valor] || { rotulo: p.valor || '—', cor: 'cinza' })
</script>
