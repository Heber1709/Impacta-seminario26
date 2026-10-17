<template>
  <MainLayout>
    <div class="entrega-page">
      <div class="page-header">
        <div>
          <span class="eyebrow">GESTIÓN DE ENTREGAS</span>
          <h1>Nueva entrega</h1>
          <p>Registra la entrega de apoyo a un beneficiario.</p>
        </div>
      </div>

      <form class="form-card" @submit.prevent="guardarEntrega">
        <p v-if="cargando" class="form-message" role="status">
          Cargando beneficiarios...
        </p>

        <div class="form-grid">
          <div class="form-group full">
            <label for="beneficiario">Beneficiario</label>
            <select
              id="beneficiario"
              v-model="formulario.beneficiario_id"
              required
              :disabled="cargando || beneficiarios.length === 0"
            >
              <option value="" disabled>
                {{
                  cargando
                    ? 'Cargando beneficiarios...'
                    : 'Selecciona un beneficiario'
                }}
              </option>
              <option
                v-for="beneficiario in beneficiarios"
                :key="beneficiario.id"
                :value="beneficiario.id"
              >
                {{ beneficiario.nombre_completo }}
              </option>
            </select>
          </div>

          <div v-if="puedeConsultarCampanas" class="form-group full">
            <label for="campana">Campaña <span>(opcional)</span></label>
            <select id="campana" v-model="formulario.campana_id">
              <option value="">Sin campaña asociada</option>
              <option
                v-for="campana in campanas"
                :key="campana.id"
                :value="campana.id"
              >
                {{ campana.nombre }}
              </option>
            </select>
          </div>

          <div class="form-group full">
            <label for="evidencia">URL de evidencia <span>(opcional)</span></label>
            <input
              id="evidencia"
              v-model="formulario.evidencia_url"
              type="url"
              maxlength="255"
              placeholder="https://ejemplo.com/evidencia"
            />
          </div>
        </div>

        <p v-if="error" class="form-message error-message" role="alert">
          {{ error }}
        </p>
        <p v-if="mensaje" class="form-message success-message" role="status">
          {{ mensaje }}
        </p>

        <div class="form-actions">
          <button class="btn-secondary" type="button" @click="volver">
            Cancelar
          </button>
          <button
            class="btn-primary"
            type="submit"
            :disabled="
              guardando || cargando || beneficiarios.length === 0 || Boolean(mensaje)
            "
          >
            {{ guardando ? 'Guardando...' : 'Registrar entrega' }}
          </button>
        </div>
      </form>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import { apiFetch } from '../services/api'
import { currentUser, hasPermission } from '../services/permissions'

interface Beneficiario {
  id: string
  nombre_completo: string
}

interface Campana {
  id: string
  nombre: string
}

const router = useRouter()
const beneficiarios = ref<Beneficiario[]>([])
const campanas = ref<Campana[]>([])
const cargando = ref(true)
const guardando = ref(false)
const error = ref('')
const mensaje = ref('')
const usuarioId = currentUser()?.id ?? ''
const puedeConsultarCampanas = hasPermission('campanas', 'consultar')

const formulario = reactive({
  beneficiario_id: '',
  campana_id: '',
  evidencia_url: '',
})

function volver() {
  router.push('/dashboard')
}

async function cargarOpciones() {
  try {
    error.value = ''
    const opciones = await Promise.all([
      apiFetch('/beneficiarios'),
      ...(puedeConsultarCampanas ? [apiFetch('/campanas')] : []),
    ])
    const respuestas = await Promise.all(opciones.map((response) => response.json()))

    if (!opciones[0].ok) {
      throw new Error(
        respuestas[0].message || 'No fue posible cargar los beneficiarios.'
      )
    }
    beneficiarios.value = respuestas[0] as Beneficiario[]

    if (puedeConsultarCampanas) {
      const respuestaCampanas = opciones[1]
      const datosCampanas = respuestas[1]
      if (!respuestaCampanas.ok) {
        throw new Error(
          datosCampanas.message || 'No fue posible cargar las campañas.'
        )
      }
      campanas.value = datosCampanas as Campana[]
    }

    if (beneficiarios.value.length === 0) {
      error.value = 'No hay beneficiarios disponibles para registrar una entrega.'
    }
    if (!usuarioId) {
      throw new Error('No fue posible identificar al usuario de la sesión.')
    }
  } catch (cause) {
    console.error('Error al cargar las opciones de la entrega:', cause)
    error.value =
      cause instanceof Error
        ? cause.message
        : 'No fue posible cargar los datos para registrar la entrega.'
  } finally {
    cargando.value = false
  }
}

async function guardarEntrega() {
  try {
    guardando.value = true
    error.value = ''
    mensaje.value = ''

    if (!usuarioId) {
      throw new Error('No fue posible identificar al usuario de la sesión.')
    }

    const response = await apiFetch('/entregas', {
      method: 'POST',
      body: JSON.stringify({
        beneficiario_id: formulario.beneficiario_id,
        usuario_id: usuarioId,
        campana_id: formulario.campana_id || undefined,
        evidencia_url: formulario.evidencia_url.trim() || undefined,
      }),
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(
        Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'No fue posible registrar la entrega.'
      )
    }

    mensaje.value = 'Entrega registrada correctamente.'
    window.setTimeout(volver, 800)
  } catch (cause) {
    console.error('Error al registrar la entrega:', cause)
    error.value =
      cause instanceof Error
        ? cause.message
        : 'No fue posible registrar la entrega.'
  } finally {
    guardando.value = false
  }
}

onMounted(cargarOpciones)
</script>

<style scoped>
.entrega-page {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 48px 60px;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 24px;
}

.eyebrow {
  color: #5f9b7c;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
}

.page-header h1 {
  margin: 8px 0;
  color: #193b35;
}

.page-header p {
  margin: 0;
  color: #76837e;
}

.form-card {
  padding: 28px;
  background: #fff;
  border: 1px solid #e3ebe8;
  border-radius: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full {
  grid-column: 1 / -1;
}

.form-group label {
  color: #29453f;
  font-size: 14px;
  font-weight: 600;
}

.form-group label span {
  color: #87938e;
  font-weight: 400;
}

.form-group input,
.form-group select {
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  border: 1px solid #dce8e3;
  border-radius: 8px;
  background: #fff;
  color: #263b35;
  font: inherit;
  box-sizing: border-box;
}

.form-message {
  margin: 0 0 18px;
  font-size: 14px;
}

.error-message {
  color: #a63232;
}

.success-message {
  color: #28784e;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.form-actions button {
  min-height: 42px;
  padding: 10px 18px;
  border-radius: 8px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary {
  border: 1px solid #d3dfda;
  background: #fff;
  color: #36564c;
}

.btn-primary {
  border: 1px solid #438a68;
  background: #438a68;
  color: #fff;
}

.btn-primary:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

@media (max-width: 700px) {
  .entrega-page {
    padding: 24px 16px 40px;
  }

  .form-card {
    padding: 20px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
