<template>
  <MainLayout>
    <div class="donacion-page">

      <div class="page-header">
        <div>
          <span class="eyebrow">GESTIÓN</span>
          <h1>{{ editando ? 'Editar donación' : 'Nueva donación' }}</h1>
          <p>
            {{
              editando
                ? 'Actualiza los datos de la donación.'
                : 'Registra una nueva donación recibida por Impacta.'
            }}
          </p>
        </div>

      </div>

      <form class="form-card" @submit.prevent="guardarDonacion">
        <p v-if="cargandoDonacion" class="form-message" role="status">
          Cargando información de la donación...
        </p>

        <div class="form-section">
          <h2>Información de la donación</h2>
          <p>Completa los datos necesarios para registrar la donación.</p>
        </div>

        <div class="form-grid">

          <div class="form-group">
            <label>Código único</label>
            <input
              v-model="formulario.codigo_unico"
              type="text"
              maxlength="50"
              required
              placeholder="Ej. DON-001"
            />
          </div>

          <div class="form-group">
            <label>Tipo de donación</label>
            <select v-model="formulario.tipo" required>
              <option value="">Selecciona una opción</option>
              <option value="MONETARIA">Monetaria</option>
              <option value="FISICA">Física</option>
            </select>
          </div>

          <div class="form-group">
            <label>Categoría</label>
            <select v-model="formulario.categoria" required>
              <option value="">Selecciona una categoría</option>
              <option value="ALIMENTOS">Alimentos</option>
              <option value="MEDICAMENTOS">Medicamentos</option>
              <option value="ROPA">Ropa</option>
              <option value="MOBILIARIO">Mobiliario</option>
              <option value="EQUIPO_TECNOLOGICO">Equipo tecnológico</option>
              <option value="MATERIAL_EDUCATIVO">Material educativo</option>
              <option value="FINANCIERA">Financiera</option>
            </select>
          </div>

          <div class="form-group">
            <label>Monto</label>
            <input
              v-model="formulario.monto"
              type="number"
              min="0"
              step="0.01"
              placeholder="Ej. 500.00"
            />
          </div>

          <div class="form-group full">
            <label>Donante</label>

            <select v-model="formulario.donante_id" required>
              <option value="" disabled>
                {{
                  cargandoDonantes
                    ? 'Cargando donantes...'
                    : 'Selecciona un donante'
                }}
              </option>

              <option
                v-for="donante in donantes"
                :key="donante.id"
                :value="donante.id"
              >
                {{ donante.nombre }}
              </option>
            </select>
          </div>

          <div class="form-group full">
            <label>Fotografía URL</label>

            <input
              v-model="formulario.fotografia_url"
              type="text"
              maxlength="255"
              placeholder="https://ejemplo.com/fotografia.jpg"
            />
          </div>

        </div>

        <p v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </p>

        <div class="form-actions">
          <button class="btn-secondary" type="button" @click="volver">
            Cancelar
          </button>
          <button
            class="btn-primary"
            type="submit"
            :disabled="guardando || cargandoDonantes || cargandoDonacion"
          >
            {{
              guardando
                ? 'Guardando...'
                : editando
                  ? 'Guardar cambios'
                  : 'Guardar donación'
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
const donacionId = typeof route.params.id === 'string' ? route.params.id : ''
const editando = Boolean(donacionId)

const formulario = reactive({
  codigo_unico: '',
  tipo: '',
  categoria: '',
  monto: '',
  fotografia_url: '',
  donante_id: ''
})

interface Donante {
  id: string
  nombre: string
  tipo: string
}

const donantes = ref<Donante[]>([])
const cargandoDonantes = ref(true)
const cargandoDonacion = ref(false)
const guardando = ref(false)
const errorMessage = ref('')

function volver() {
  router.push('/donaciones')
}
async function guardarDonacion() {
  try {
    errorMessage.value = ''
    guardando.value = true

    const response = await apiFetch(
      editando
        ? `/donaciones/${encodeURIComponent(donacionId)}`
        : '/donaciones',
      {
        method: editando ? 'PATCH' : 'POST',
        body: JSON.stringify({
          codigo_unico: formulario.codigo_unico.trim(),
          tipo: formulario.tipo,
          categoria: formulario.categoria,
          monto: formulario.monto === '' ? null : Number(formulario.monto),
          fotografia_url: formulario.fotografia_url.trim() || null,
          donante_id: formulario.donante_id,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'No fue posible guardar la donación.'
      )
    }

    alert(
      editando
        ? 'Donación actualizada correctamente.'
        : 'Donación guardada correctamente.'
    )
    router.push('/donaciones')
  } catch (error) {
    console.error(error)

    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'No fue posible guardar la donación.'
  } finally {
    guardando.value = false
  }
}

async function cargarDonacion() {
  try {
    cargandoDonacion.value = true
    errorMessage.value = ''
    const response = await apiFetch(
      `/donaciones/${encodeURIComponent(donacionId)}`
    )
    const data = await response.json()
    if (!response.ok) {
      throw new Error(
      Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message || 'No fue posible cargar la donación.'
      )
    }

    formulario.codigo_unico = data.codigo_unico
    formulario.tipo = data.tipo
    formulario.categoria = data.categoria
    formulario.monto = data.monto == null ? '' : String(data.monto)
    formulario.fotografia_url = data.fotografia_url ?? ''
    formulario.donante_id = data.donante?.id ?? ''
    if (
      data.donante &&
      !donantes.value.some((donante) => donante.id === data.donante.id)
    ) {
      donantes.value.push({
        id: data.donante.id,
        nombre: data.donante.nombre,
        tipo: data.donante.tipo,
      })
    }
  } catch (error) {
    console.error(error)
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'No fue posible cargar la donación.'
  } finally {
    cargandoDonacion.value = false
  }
}

async function cargarDonantes() {
  try {
    const response = await apiFetch('/donantes')
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'No fue posible cargar los donantes.')
    }

    donantes.value = data
  } catch (error) {
    console.error(error)

    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'No fue posible cargar los donantes.'
  } finally {
    cargandoDonantes.value = false
  }
}

onMounted(() => {
  void cargarDatos()
})

async function cargarDatos() {
  await cargarDonantes()
  if (editando) {
    await cargarDonacion()
  }
}
</script>

<style scoped>


.donacion-page {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 40px 48px 60px;
  box-sizing: border-box;
}

/* Encabezado */

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 30px;
  margin-bottom: 34px;
}

.eyebrow {
  display: block;
  margin-bottom: 10px;
  color: #6fbd92;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
}

.page-header h1 {
  margin: 0;
  color: #111827;
  font-size: 42px;
  font-weight: 700;
  line-height: 1.1;
}

.page-header p {
  margin: 12px 0 0;
  color: #7a8490;
  font-size: 16px;
}

/* Botones */

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.btn-primary,
.btn-secondary {
  border: none;
  border-radius: 10px;
  padding: 13px 22px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn-primary {
  background: #74c69d;
  color: white;
  box-shadow: 0 8px 20px rgba(116, 198, 157, 0.22);
}

.btn-primary:hover {
  background: #62b98d;
  transform: translateY(-1px);
}

.btn-secondary {
  background: white;
  color: #45505c;
  border: 1px solid #dce2df;
}

.btn-secondary:hover {
  background: #f7f9f8;
}

/* Tarjeta */

.form-card {
  background: white;
  border: 1px solid #e3e8e5;
  border-radius: 20px;
  padding: 34px;
  box-shadow: 0 8px 28px rgba(25, 55, 45, 0.05);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
}

.form-message {
  color: #59645f;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-section {
  padding-bottom: 26px;
  margin-bottom: 28px;
  border-bottom: 1px solid #edf0ee;
}

.form-section h2 {
  margin: 0;
  color: #20252b;
  font-size: 22px;
  font-weight: 650;
}

.form-section p {
  margin: 8px 0 0;
  color: #8a939c;
  font-size: 14px;
}

/* Formulario */

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.form-group.full {
  grid-column: 1 / -1;
}

.form-group label {
  margin-bottom: 8px;
  color: #38414a;
  font-size: 14px;
  font-weight: 600;
}

.form-group input,
.form-group select {
  width: 100%;
  height: 48px;
  padding: 0 14px;
  box-sizing: border-box;
  border: 1px solid #d9dfdc;
  border-radius: 10px;
  background: #ffffff;
  color: #303841;
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: 0.2s ease;
}

.form-group input::placeholder {
  color: #aab1b7;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #74c69d;
  box-shadow: 0 0 0 3px rgba(116, 198, 157, 0.12);
}

.form-group select {
  cursor: pointer;
}

/* Mensaje de error */

.error-message {
  margin: 24px 0 0;
  padding: 13px 16px;
  border-radius: 10px;
  background: #fff1f1;
  border: 1px solid #f1cccc;
  color: #b42318;
  font-size: 14px;
}

/* Adaptación para pantallas pequeñas */

@media (max-width: 800px) {
  .donacion-page {
    padding: 30px 24px 50px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .btn-primary,
  .btn-secondary {
    flex: 1;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-group.full {
    grid-column: auto;
  }
}

@media (max-width: 520px) {
  .donacion-page {
    padding: 24px 16px 40px;
  }

  .page-header h1 {
    font-size: 32px;
  }

  .form-card {
    padding: 22px;
    border-radius: 16px;
  }

  .header-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
