<template>
  <MainLayout>
    <div class="donante-page">
      <div class="page-header">
        <div>
          <span class="eyebrow">GESTIÓN</span>
          <h1>{{ editando ? 'Editar donante' : 'Nuevo donante' }}</h1>
          <p>
            {{
              editando
                ? 'Actualiza la información de la persona u organización donante.'
                : 'Registra una persona u organización que apoya a Impacta.'
            }}
          </p>
        </div>

      </div>

      <form class="form-card" @submit.prevent="guardarDonante">
        <p v-if="cargandoDonante" class="form-message" role="status">
          Cargando información del donante...
        </p>
        <p v-if="mensaje" class="form-message error-message" role="alert">
          {{ mensaje }}
        </p>
        <div class="form-section">
          <h2>Información del donante</h2>
          <p>Completa los datos necesarios para registrar al donante.</p>
        </div>

        <div class="form-grid">
          <div class="form-group full">
            <label>Nombre completo o razón social</label>
            <input
              v-model="formulario.nombre"
              type="text"
              maxlength="200"
              required
              placeholder="Ej. Empresa o persona donante"
            />
          </div>

          <div class="form-group">
            <label>Tipo de donante</label>
            <select v-model="formulario.tipo" required>
              <option value="">Selecciona una opción</option>
              <option value="INDIVIDUAL">Individual</option>
              <option value="EMPRESA">Empresa</option>
              <option value="FUNDACION">Fundación</option>
              <option value="INTERNACIONAL">Internacional</option>
            </select>
          </div>

          <div class="form-group">
            <label>Correo electrónico</label>
            <input
              v-model="formulario.email"
              type="email"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div class="form-group">
            <label>Teléfono</label>
            <input
              v-model="formulario.telefono"
              type="text"
              maxlength="20"
              placeholder="Ej. 5555-5555"
            />
          </div>
        </div>
        <div class="form-actions">
          <button class="btn-secondary" type="button" @click="volver">
            Cancelar
          </button>
          <button
            class="btn-primary"
            type="submit"
            :disabled="guardando || cargandoDonante"
          >
            {{
              guardando
                ? 'Guardando...'
                : editando
                  ? 'Guardar cambios'
                  : 'Guardar donante'
            }}
          </button>
        </div>
      </form>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import { apiFetch } from '../services/api'

const router = useRouter()
const route = useRoute()
const donanteId = typeof route.params.id === 'string' ? route.params.id : ''
const editando = Boolean(donanteId)
const guardando = ref(false)
const cargandoDonante = ref(false)
const mensaje = ref('')

const formulario = reactive({
  nombre: '',
  tipo: '',
  email: '',
  telefono: ''
})

function volver() {
  router.push('/donantes')
}

async function cargarDonante() {
  try {
    cargandoDonante.value = true
    mensaje.value = ''
    const response = await apiFetch(
      `/donantes/${encodeURIComponent(donanteId)}`
    )
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'No fue posible cargar el donante.')
    }

    formulario.nombre = data.nombre
    formulario.tipo = data.tipo
    formulario.email = data.email ?? ''
    formulario.telefono = data.telefono ?? ''
  } catch (error) {
    console.error(error)
    mensaje.value =
      error instanceof Error
        ? error.message
        : 'No fue posible cargar el donante.'
  } finally {
    cargandoDonante.value = false
  }
}

async function guardarDonante() {
  try {
    guardando.value = true
    mensaje.value = ''
    const response = await apiFetch(
      editando
        ? `/donantes/${encodeURIComponent(donanteId)}`
        : '/donantes',
      {
        method: editando ? 'PATCH' : 'POST',
        body: JSON.stringify({
          nombre: formulario.nombre.trim(),
          tipo: formulario.tipo,
          email: formulario.email.trim() || null,
          telefono: formulario.telefono.trim() || null,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'No fue posible guardar el donante.')
    }

    alert(
      editando
        ? 'Donante actualizado correctamente.'
        : 'Donante guardado correctamente.'
    )
    router.push('/donantes')
  } catch (error) {
    console.error(error)

    mensaje.value =
      error instanceof Error
        ? error.message
        : 'Ocurrió un error al guardar el donante.'
  } finally {
    guardando.value = false
  }
}

onMounted(() => {
  if (editando) {
    cargarDonante()
  }
})
</script>

<style scoped>
.donante-page {
  padding: 42px 46px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 30px;
  margin-bottom: 30px;
}

.eyebrow {
  color: #70bd98;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
}

h1 {
  margin: 8px 0;
  color: #17252d;
  font-size: 34px;
}

.page-header p {
  margin: 0;
  color: #7b8588;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

button {
  border: none;
  border-radius: 10px;
  padding: 13px 22px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary {
  background: #70bd98;
  color: white;
}

.btn-secondary {
  background: white;
  color: #40504d;
  border: 1px solid #d9e2df;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
}

.form-message {
  margin: 0 0 20px;
  color: #59645f;
}

.error-message {
  color: #a53b3b;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-card {
  background: white;
  border: 1px solid #e1e7e5;
  border-radius: 18px;
  padding: 30px;
  max-width: 900px;
}

.form-section {
  margin-bottom: 28px;
}

.form-section h2 {
  margin: 0 0 6px;
  color: #29413b;
  font-size: 21px;
}

.form-section p {
  margin: 0;
  color: #899391;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full {
  grid-column: 1 / -1;
}

label {
  color: #34433f;
  font-size: 14px;
  font-weight: 700;
}

input,
select {
  width: 100%;
  box-sizing: border-box;
  padding: 13px 14px;
  border: 1px solid #d9e2df;
  border-radius: 10px;
  background: #fbfcfc;
  color: #273532;
  font-size: 14px;
  outline: none;
}

input:focus,
select:focus {
  border-color: #70bd98;
}

@media (max-width: 800px) {
  .donante-page {
    padding: 25px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-group.full {
    grid-column: auto;
  }
}
</style>
