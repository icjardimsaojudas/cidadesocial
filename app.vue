<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <div class="toasts">
    <div v-for="t in toasts" :key="t.id" class="toast" :class="t.tipo">{{ t.msg }}</div>
  </div>
</template>
<script setup lang="ts">
const { toasts } = useToast()
</script>
