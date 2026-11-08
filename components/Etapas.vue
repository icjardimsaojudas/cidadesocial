<template>
  <ol class="etapas">
    <li v-for="(e, i) in etapas" :key="e.chave" :class="{ feito: e.feito }">
      <span class="bola">{{ e.feito ? '✓' : i + 1 }}</span>
      <div><b>{{ e.titulo }}</b><span class="small muted">{{ e.detalhe }}</span></div>
    </li>
  </ol>
</template>
<script setup lang="ts">
defineProps<{ etapas: any[] }>()
</script>
