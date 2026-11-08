<template>
  <Teleport to="body">
    <div v-if="aberto" class="modal-fundo" @mousedown.self="$emit('fechar')">
      <div class="modal" :class="{ largo }">
        <div class="row between mb"><h2 style="margin:0">{{ titulo }}</h2><button class="link-btn" @click="$emit('fechar')" aria-label="Fechar">✕</button></div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>
<script setup lang="ts">
defineProps<{ aberto: boolean; titulo: string; largo?: boolean }>()
defineEmits(['fechar'])
</script>
