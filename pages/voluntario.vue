<template>
  <div class="narrow">
    <div v-if="feito" class="card" style="text-align:center">
      <div style="font-size:3rem">🧡</div>
      <h1>Obrigado por se inscrever!</h1>
      <p>A responsável pelo onboarding vai entrar em contato para a integração de voluntários.</p>
      <NuxtLink to="/" class="btn sec mt">Voltar ao início</NuxtLink>
    </div>
    <template v-else>
      <h1>Inscrição de voluntário</h1>
      <p class="muted">Família Saudável Integral · IC Jardim São Judas</p>
      <div v-if="cfg && !cfg.inscricoes_voluntarios_abertas" class="alerta vermelho">As inscrições de voluntários estão fechadas no momento.</div>
      <form class="card stack" @submit.prevent="enviar" novalidate>
        <input v-model="f.site" class="oculto" tabindex="-1" autocomplete="off" aria-hidden="true" />
        <div>
          <h2>Seus dados</h2>
          <div class="campo"><label class="obrig">Nome completo</label><input v-model="f.nome" type="text" autocomplete="name" /></div>
          <div class="grid g2">
            <div class="campo"><label class="obrig">Telefone / WhatsApp</label><input :value="f.telefone" @input="f.telefone = mascaraTel(($event.target as any).value)" type="tel" /></div>
            <div class="campo"><label>E-mail</label><input v-model="f.email" type="email" /></div>
            <div class="campo"><label>CPF</label><input :value="f.cpf" @input="f.cpf = mascaraCpf(($event.target as any).value)" type="tel" /><div class="ajuda">Usado no termo de voluntariado.</div></div>
            <div class="campo"><label>Data de nascimento</label><input v-model="f.nascimento" type="date" /></div>
            <div class="campo"><label>GDC que participa</label><input v-model="f.gdc" type="text" /></div>
            <div class="campo"><label>Líder do GDC</label><input v-model="f.lider_gdc" type="text" /></div>
          </div>
        </div>
        <div>
          <h2>Onde você quer servir?</h2>
          <div class="frentes">
            <label v-for="(t, k) in FRENTES" :key="k" class="frente" :class="{ sel: f.frente === k }">
              <input type="radio" v-model="f.frente" :value="k" class="oculto" />
              <b>{{ t }}</b><span class="small muted">{{ DESC[k] }}</span>
            </label>
          </div>
        </div>
        <div>
          <div class="grid g2">
            <div class="campo"><label>Profissão</label><input v-model="f.profissao" type="text" /></div>
            <div class="campo"><label>Habilidades que quer oferecer</label><input v-model="f.habilidades" type="text" placeholder="Ex.: assistência social, cozinha, música, logística" /></div>
          </div>
          <label>Disponibilidade</label>
          <div class="checks mb">
            <label v-for="(t, k) in DISP" :key="k" class="check"><input type="checkbox" :value="k" v-model="f.disponibilidade" />{{ t }}</label>
          </div>
          <label class="check"><input type="checkbox" v-model="f.trabalha_criancas" />Tenho interesse em servir com crianças e adolescentes.</label>
          <div class="grid g2 mt">
            <div class="campo"><label>Contato de emergência (nome)</label><input v-model="f.emergencia_nome" type="text" /></div>
            <div class="campo"><label>Telefone de emergência</label><input :value="f.emergencia_telefone" @input="f.emergencia_telefone = mascaraTel(($event.target as any).value)" type="tel" /></div>
          </div>
        </div>
        <div v-if="cfg">
          <h2>Termos</h2>
          <div class="termo">{{ cfg.termo_voluntario }}</div>
          <label class="check"><input type="checkbox" v-model="f.aceite_termo" />Li e aceito o termo de adesão ao serviço voluntário.</label>
          <label class="check"><input type="checkbox" v-model="f.aceite_lgpd" />Autorizo o uso dos meus dados para a organização do voluntariado.</label>
          <label class="check"><input type="checkbox" v-model="f.aceite_imagem" />Autorizo o uso da minha imagem em materiais da Cidade Social (opcional).</label>
        </div>
        <button class="btn grande bloco" :disabled="enviando || (cfg && !cfg.inscricoes_voluntarios_abertas)">{{ enviando ? 'Enviando…' : 'Enviar inscrição' }}</button>
      </form>
    </template>
  </div>
</template>
<script setup lang="ts">
const toast = useToast()
const DESC: Record<string, string> = {
  arrecadacao: 'Campanha nos GDCs, receber doações, estoque e montagem das cestas.',
  triagem: 'Receber inscrições, entrevistas, visitas e acompanhamento das famílias.',
  entrega: 'Café, treinamentos, atividades com crianças e entrega das cestas.',
  qualquer: 'Ajudo onde for mais necessário.'
}
const DISP: Record<string, string> = { sabado_manha: 'Sábado de manhã', sabado_tarde: 'Sábado à tarde', semana_dia: 'Dias de semana (dia)', semana_noite: 'Dias de semana (noite)', remoto: 'À distância' }
const cfg = ref<any>(null), enviando = ref(false), feito = ref(false)
const f = reactive<any>({ site: '', nome: '', telefone: '', email: '', cpf: '', nascimento: '', gdc: '', lider_gdc: '', frente: '', profissao: '', habilidades: '',
  disponibilidade: [], trabalha_criancas: false, emergencia_nome: '', emergencia_telefone: '', aceite_termo: false, aceite_lgpd: false, aceite_imagem: false })
onMounted(async () => { try { cfg.value = await api('config.publica') } catch (e: any) { toast.erro(e.message) } })
async function enviar() {
  if (f.nome.trim().split(/\s+/).length < 2) return toast.erro('Informe seu nome completo.')
  if (soDigitos(f.telefone).length < 10) return toast.erro('Informe o telefone com DDD.')
  if (f.cpf && !cpfValido(f.cpf)) return toast.erro('CPF inválido.')
  if (!f.frente) return toast.erro('Escolha onde você quer servir.')
  if (!f.aceite_termo || !f.aceite_lgpd) return toast.erro('Aceite o termo de voluntariado e o uso de dados.')
  enviando.value = true
  try { await api('voluntario.inscrever', f); feito.value = true; window.scrollTo({ top: 0 }) }
  catch (e: any) { toast.erro(e.message) } finally { enviando.value = false }
}
</script>
<style scoped>
.frentes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
@media (max-width: 560px) { .frentes { grid-template-columns: 1fr; } }
.frente { border: 2px solid var(--linha); border-radius: 14px; padding: 12px 14px; cursor: pointer; display: flex; flex-direction: column; gap: 3px; font-weight: 600; }
.frente.sel { border-color: var(--laranja); background: #FFF3E8; }
</style>
