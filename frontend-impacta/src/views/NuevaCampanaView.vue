<template>
  <MainLayout>
    <div class="campana-page">

      <div class="page-header">
        <div>
          <span class="eyebrow">GESTIÓN DE CAMPAÑAS</span>
          <h1>{{ editando ? 'Editar campaña' : 'Nueva campaña' }}</h1>
          <p>
            {{
              editando
                ? 'Actualiza los datos de la campaña.'
                : 'Completa los datos para registrar una nueva campaña.'
            }}
          </p>
        </div>
      </div>

      <form class="form-card" @submit.prevent="guardarCampana">
        <div v-if="cargandoCampana" class="mensaje" role="status">
          Cargando información de la campaña...
        </div>

        <div class="form-grid">

          <div class="form-group full-width">
            <label>Nombre de la campaña</label>
            <input
              v-model="formulario.nombre"
              type="text"
              maxlength="200"
              required
              placeholder="Ej. Alimentando Esperanzas"
            />
          </div>

          <div class="form-group full-width">
            <label>Objetivo</label>
            <textarea
              v-model="formulario.objetivo"
              required
              placeholder="Describe el objetivo de la campaña..."
              rows="4"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Fecha de inicio</label>
            <input
              v-model="formulario.fecha_inicio"
              type="date"
              required
            />
          </div>

          <div class="form-group">
            <label>Fecha de finalización <span>(opcional)</span></label>
            <input
              v-model="formulario.fecha_fin"
              type="date"
            />
          </div>

          <div class="form-group">
            <label>Meta económica <span>(opcional)</span></label>
            <input
              v-model.number="formulario.meta_economica"
              type="number"
              min="0"
              step="0.01"
              placeholder="Ej. 25000"
            />
          </div>

          <div class="form-group">
            <label>Meta de productos <span>(opcional)</span></label>
            <input
              v-model.number="formulario.meta_productos"
              type="number"
              min="0"
              step="1"
              placeholder="Ej. 500"
            />
          </div>

        </div>

        <div v-if="mensaje" :class="['mensaje', tipoMensaje]">
          {{ mensaje }}
        </div>

        <div class="form-actions">
          <button
            type="button"
            class="btn-secondary"
            @click="volver"
          >
            Cancelar
          </button>

          <button
            type="submit"
            class="btn-primary"
            :disabled="guardando || cargandoCampana"
          >
            {{
              guardando
                ? 'Guardando...'
                : editando
                  ? 'Guardar cambios'
                  : 'Guardar campaña'
            }}
          </button>
        </div>
      </form>

    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import { apiFetch } from '../services/api'

const router = useRouter()
const route = useRoute()
const campanaId = typeof route.params.id === 'string' ? route.params.id : ''
const editando = Boolean(campanaId)

const formulario = ref({
  nombre: '',
  objetivo: '',
  fecha_inicio: '',
  fecha_fin: '',
  meta_economica: null as number | null,
  meta_productos: null as number | null
})

const guardando = ref(false)
const cargandoCampana = ref(false)
const mensaje = ref('')
const tipoMensaje = ref<'success' | 'error'>('error')

function volver() {
  router.push('/campanas')
}

async function cargarCampana() {
  try {
    cargandoCampana.value = true
    mensaje.value = ''
    const response = await apiFetch(
      `/campanas/${encodeURIComponent(campanaId)}`
    )
    const data = await response.json()
    if (!response.ok) {
      throw new Error(
        Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'No fue posible cargar la campaña.'
      )
    }

    formulario.value = {
      nombre: data.nombre,
      objetivo: data.objetivo,
      fecha_inicio: String(data.fecha_inicio).slice(0, 10),
      fecha_fin: data.fecha_fin ? String(data.fecha_fin).slice(0, 10) : '',
      meta_economica:
        data.meta_economica == null ? null : Number(data.meta_economica),
      meta_productos:
        data.meta_productos == null ? null : Number(data.meta_productos),
    }
  } catch (error) {
    console.error(error)
    tipoMensaje.value = 'error'
    mensaje.value =
      error instanceof Error
        ? error.message
        : 'No fue posible cargar la campaña.'
  } finally {
    cargandoCampana.value = false
  }
}

async function guardarCampana() {
  mensaje.value = ''

  if (!formulario.value.nombre.trim()) {
    mensaje.value = 'El nombre de la campaña es obligatorio.'
    tipoMensaje.value = 'error'
    return
  }

  if (!formulario.value.objetivo.trim()) {
    mensaje.value = 'El objetivo de la campaña es obligatorio.'
    tipoMensaje.value = 'error'
    return
  }

  if (!formulario.value.fecha_inicio) {
    mensaje.value = 'La fecha de inicio es obligatoria.'
    tipoMensaje.value = 'error'
    return
  }

  if (
    formulario.value.fecha_fin &&
    formulario.value.fecha_fin < formulario.value.fecha_inicio
  ) {
    mensaje.value =
      'La fecha de finalización no puede ser anterior a la fecha de inicio.'
    tipoMensaje.value = 'error'
    return
  }

  try {
    guardando.value = true

    const response = await apiFetch(
      editando
        ? `/campanas/${encodeURIComponent(campanaId)}`
        : '/campanas',
      {
        method: editando ? 'PATCH' : 'POST',
        body: JSON.stringify({
          nombre: formulario.value.nombre.trim(),
          objetivo: formulario.value.objetivo.trim(),
          fecha_inicio: formulario.value.fecha_inicio,
          fecha_fin: formulario.value.fecha_fin || (editando ? null : undefined),
          meta_economica:
            formulario.value.meta_economica ?? (editando ? 0 : undefined),
          meta_productos:
            formulario.value.meta_productos ?? (editando ? 0 : undefined),
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message ||
            `No fue posible ${editando ? 'actualizar' : 'registrar'} la campaña.`
      )
    }

    tipoMensaje.value = 'success'
    mensaje.value = editando
      ? 'Campaña actualizada correctamente.'
      : 'Campaña registrada correctamente.'

    setTimeout(() => {
      volver()
    }, 800)

  } catch (error) {
    console.error(error)

    tipoMensaje.value = 'error'
    mensaje.value =
      error instanceof Error
        ? error.message
        : 'No fue posible registrar la campaña.'
  } finally {
    guardando.value = false
  }
}

onMounted(() => {
  if (editando) {
    cargarCampana()
  }
})
</script>

<style scoped>
.campana-page {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 40px 48px 60px;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 34px;
}

.eyebrow {
  display: block;
  margin-bottom: 10px;
  color: #6fbf9c;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
}

.page-header h1 {
  margin: 0 0 10px;
  font-size: 42px;
  color: #18202b;
}

.page-header p {
  margin: 0;
  color: #8a939c;
  font-size: 16px;
}

.form-card {
  background: #ffffff;
  border: 1px solid #e8ece9;
  border-radius: 24px;
  padding: 36px;
  box-shadow: 0 10px 30px rgba(20, 50, 40, 0.05);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.full-width {
  grid-column: 1 / -1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.form-group label {
  color: #29323a;
  font-size: 14px;
  font-weight: 600;
}

.form-group label span {
  color: #9ba2a8;
  font-weight: 400;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #dfe4e1;
  border-radius: 12px;
  background: #ffffff;
  color: #29323a;
  font-family: inherit;
  font-size: 15px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #75c6a2;
  box-shadow: 0 0 0 3px rgba(117, 198, 162, 0.12);
}

.form-group textarea {
  resize: vertical;
  min-height: 110px;
}

.mensaje {
  margin-top: 24px;
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 14px;
  text-align: center;
}

.mensaje.success {
  background: #edf9f3;
  color: #3d8b68;
  border: 1px solid #cfeedd;
}

.mensaje.error {
  background: #fff0f0;
  color: #a53b3b;
  border: 1px solid #f0cccc;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #edf0ee;
}

.form-actions button {
  border: none;
  border-radius: 12px;
  padding: 13px 22px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary {
  background: #f1f3f2;
  color: #59636b;
}

.btn-primary {
  background: #73c59f;
  color: white;
}

.btn-primary:hover {
  background: #63b88f;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 700px) {
  .campana-page {
    padding: 30px 24px 50px;
  }

  .form-card {
    padding: 24px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .full-width {
    grid-column: auto;
  }

  .page-header h1 {
    font-size: 32px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>
