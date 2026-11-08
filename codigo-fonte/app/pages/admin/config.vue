<template>
  <div>
    <h1>Configurações</h1>
    <div v-if="!c" class="carregando">Carregando…</div>
    <template v-else>
      <div class="card mb">
        <h2>Programa</h2>
        <div class="grid g3">
          <div class="campo"><label>Nome da unidade</label><input v-model="c.unidade_nome" type="text" /></div>
          <div class="campo"><label>Cidade</label><input v-model="c.cidade" type="text" /></div>
          <div class="campo"><label>Duração do ciclo (meses)</label><input v-model="c.duracao_meses" type="number" min="1" /></div>
          <div class="campo"><label>Limite de faltas sem justificativa</label><input v-model="c.limite_faltas" type="number" min="0" /><div class="ajuda">Acima disso a família entra em alerta para reavaliação.</div></div>
          <div class="campo"><label>Meta de cestas</label><input v-model="c.meta_cestas" type="number" min="0" /><div class="ajuda">Vazio = nº de famílias ativas.</div></div>
          <div class="campo"><label>Versão dos termos</label><input v-model="c.termo_versao" type="text" /><div class="ajuda">Mude ao alterar os textos (ex.: 2027.1).</div></div>
        </div>
        <label class="check"><input type="checkbox" :checked="c.inscricoes_familias_abertas !== 'nao'" @change="c.inscricoes_familias_abertas = ($event.target as any).checked ? 'sim' : 'nao'" />Inscrições de famílias abertas</label>
        <label class="check"><input type="checkbox" :checked="c.inscricoes_voluntarios_abertas !== 'nao'" @change="c.inscricoes_voluntarios_abertas = ($event.target as any).checked ? 'sim' : 'nao'" />Inscrições de voluntários abertas</label>
      </div>
      <div class="card mb">
        <h2>Termos</h2>
        <p class="small muted">Rascunhos baseados nos modelos da Cidade Social, já ajustados à LGPD (consentimento revogável). Recomenda-se revisão jurídica.</p>
        <div class="campo"><label>Termo de participação da família</label><textarea v-model="c.termo_participacao" style="min-height:260px" /></div>
        <div class="campo"><label>Consentimento LGPD</label><textarea v-model="c.termo_lgpd" style="min-height:140px" /></div>
        <div class="campo"><label>Autorização de imagem</label><textarea v-model="c.termo_imagem" style="min-height:120px" /></div>
        <div class="campo"><label>Termo de voluntariado</label><textarea v-model="c.termo_voluntario" style="min-height:160px" /></div>
      </div>
      <button class="btn grande" :disabled="salvando" @click="salvar">Salvar configurações</button>
    </template>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'painel', papeis: ['admin'] })
const toast = useToast()
const c = ref<any>(null), salvando = ref(false)
onMounted(async () => { try { c.value = await api('config.obter') } catch (e: any) { toast.erro(e.message) } })
async function salvar() { salvando.value = true; try { await api('config.salvar', c.value); toast.ok('Configurações salvas.') } catch (e: any) { toast.erro(e.message) } finally { salvando.value = false } }
</script>
