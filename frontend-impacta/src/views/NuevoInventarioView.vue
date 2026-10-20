<template>
  <MainLayout>
    <div class="inventario-page">

      <div class="page-header">
        <div>
          <span class="eyebrow">CONTROL DE EXISTENCIAS</span>
          <h1>{{ viendoDetalle ? 'Detalle del movimiento' : 'Nuevo movimiento' }}</h1>
          <p>
            {{
              viendoDetalle
                ? 'Consulta todos los datos del movimiento de inventario.'
                : 'Registra una entrada o salida del inventario.'
            }}
          </p>
        </div>

        <div class="header-actions">
          <button class="btn-secondary" type="button" @click="volver">
            {{ viendoDetalle ? 'Volver al inventario' : 'Cancelar' }}
          </button>
        </div>
      </div>

      <div class="form-card">

        <div class="form-section">
          <h2>Información del movimiento</h2>
          <p>
            {{
              viendoDetalle
                ? 'Datos registrados para este movimiento.'
                : 'Completa los datos necesarios para registrar el movimiento.'
            }}
          </p>
        </div>

        <div class="form-grid">

          <div class="form-group">
            <label for="tipo_movimiento">Tipo de movimiento</label>

            <select
              id="tipo_movimiento"
              v-model="formulario.tipo_movimiento"
              :disabled="viendoDetalle"
            >
              <option value="">Selecciona una opción</option>
              <option
                v-for="tipo in tiposMovimiento"
                :key="tipo.codigo"
                :value="tipo.codigo"
              >
                {{ tipo.descripcion }} ({{ tipo.signo }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="cantidad">Cantidad</label>

            <input
              id="cantidad"
              v-model.number="formulario.cantidad"
              type="number"
              min="1"
              placeholder="Ej. 10"
              :disabled="viendoDetalle"
            />
          </div>

          <div v-if="viendoDetalle" class="form-group">
            <label for="numero_entrega">Número de entrega</label>
            <input
              id="numero_entrega"
              :value="movimientoDetalle?.entrega?.numero_entrega ?? 'Sin entrega asociada'"
              type="text"
              disabled
            />
          </div>

          <div v-if="!viendoDetalle" class="form-group">
            <label for="numero_entrega">Número de entrega</label>

            <input
              id="numero_entrega"
              v-model.number="formulario.numero_entrega"
              type="number"
              min="1"
              step="1"
              required
              placeholder="Ej. 1"
            />
          </div>

          <div class="form-group">
            <label for="donacion_id">Donación relacionada</label>

            <input
              v-if="viendoDetalle"
              id="donacion_id"
              :value="etiquetaDonacion"
              type="text"
              disabled
            />
            <select
              v-else
              id="donacion_id"
              v-model="formulario.donacion_id"
            >
              <option value="">Selecciona una donación</option>

              <option
                v-for="donacion in donaciones"
                :key="donacion.id"
                :value="donacion.id"
              >
                {{ donacion.codigo_unico }} -
                {{ donacion.categoria }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="fecha_vencimiento">
              Fecha de vencimiento
              <span>(opcional)</span>
            </label>

            <input
              id="fecha_vencimiento"
              v-model="formulario.fecha_vencimiento"
              type="date"
              :disabled="viendoDetalle"
            />
          </div>

          <div v-if="viendoDetalle" class="form-group">
            <label for="fecha_movimiento">Fecha del movimiento</label>
            <input
              id="fecha_movimiento"
              :value="formatearFecha(movimientoDetalle?.fecha_movimiento)"
              type="text"
              disabled
            />
          </div>

          <div class="form-group full">
            <label for="observaciones">
              Observaciones
              <span>(opcional)</span>
            </label>

            <textarea
              id="observaciones"
              v-model="formulario.observaciones"
              rows="5"
              placeholder="Agrega alguna observación sobre este movimiento..."
              :disabled="viendoDetalle"
            ></textarea>
          </div>

        </div>

        <p v-if="viendoDetalle && movimientoDetalle" class="form-message">
          Identificador del movimiento: {{ movimientoDetalle.id }}
          <span v-if="movimientoDetalle.donacion">
            · Donación: {{ movimientoDetalle.donacion.id }}
          </span>
          <span v-if="movimientoDetalle.entrega">
            · Entrega: {{ movimientoDetalle.entrega.id }}
          </span>
          · Estado: {{ movimientoDetalle.estado ? 'Activo' : 'Inactivo' }}
        </p>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div v-if="!viendoDetalle" class="form-actions">
          <button
            class="btn-secondary"
            type="button"
            @click="volver"
          >
            Cancelar
          </button>

          <button
            class="btn-primary"
            type="button"
            @click="guardarMovimiento"
          >
            Guardar movimiento
          </button>
        </div>

      </div>

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
const movimientoId =
  typeof route.params.id === 'string' ? route.params.id : ''
const viendoDetalle = Boolean(movimientoId)

interface Donacion {
  id: string
  codigo_unico: string
  categoria: string
}

interface CatalogoTipoMovimiento {
  codigo: string
  descripcion: string
  signo: '+' | '-'
}

interface MovimientoDetalle {
  id: string
  tipo_movimiento: string
  cantidad: number
  numero_entrega?: number | null
  fecha_vencimiento?: string | null
  fecha_movimiento: string
  estado: boolean
  observaciones?: string | null
  entrega?: { id: string; numero_entrega: number } | null
  donacion?: {
    id: string
    codigo_unico: string
    categoria: string
  } | null
}

const donaciones = ref<Donacion[]>([])
const tiposMovimiento = ref<CatalogoTipoMovimiento[]>([])
const movimientoDetalle = ref<MovimientoDetalle | null>(null)
const etiquetaDonacion = ref('')

const formulario = ref({
  tipo_movimiento: '',
  cantidad: null as number | null,
  numero_entrega: null as number | null,
  fecha_vencimiento: '',
  observaciones: '',
  donacion_id: ''
})

const errorMessage = ref('')

async function cargarDetalle() {
  try {
    const [response, tiposResponse] = await Promise.all([
      apiFetch(`/inventario/${encodeURIComponent(movimientoId)}`),
      apiFetch('/tipos-movimiento'),
    ])
    const [data, tiposData] = await Promise.all([
      response.json(),
      tiposResponse.json(),
    ])

    if (!response.ok || !tiposResponse.ok) {
      throw new Error(
        data.message ||
          tiposData.message ||
          'No fue posible cargar los datos del movimiento.'
      )
    }

    tiposMovimiento.value = tiposData as CatalogoTipoMovimiento[]
    movimientoDetalle.value = data as MovimientoDetalle
    formulario.value.tipo_movimiento = data.tipo_movimiento
    formulario.value.cantidad = data.cantidad
    formulario.value.numero_entrega = data.entrega?.numero_entrega ?? null
    formulario.value.fecha_vencimiento = data.fecha_vencimiento ?? ''
    formulario.value.observaciones = data.observaciones ?? ''
    etiquetaDonacion.value = data.donacion
      ? `${data.donacion.codigo_unico} - ${data.donacion.categoria}`
      : 'Sin donación asociada'
  } catch (error) {
    console.error('Error al cargar el detalle del movimiento:', error)
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'No fue posible cargar el movimiento.'
  }
}

async function cargarDonaciones() {
  try {
    const [response, tiposResponse] = await Promise.all([
      apiFetch('/donaciones'),
      apiFetch('/tipos-movimiento'),
    ])
    const [data, tiposData] = await Promise.all([
      response.json(),
      tiposResponse.json(),
    ])

    if (!response.ok || !tiposResponse.ok) {
      throw new Error(
        data.message ||
          tiposData.message ||
          'No fue posible cargar las donaciones y tipos de movimiento.'
      )
    }

    donaciones.value = data
    tiposMovimiento.value = tiposData as CatalogoTipoMovimiento[]
  } catch (error) {
    console.error(error)

    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'No fue posible cargar las donaciones.'
  }
}

async function guardarMovimiento() {
  try {
    errorMessage.value = ''

    if (!formulario.value.tipo_movimiento) {
      errorMessage.value = 'Selecciona el tipo de movimiento.'
      return
    }

    if (!formulario.value.cantidad || formulario.value.cantidad < 1) {
      errorMessage.value = 'La cantidad debe ser mayor o igual a 1.'
      return
    }

    if (!formulario.value.donacion_id) {
      errorMessage.value = 'Selecciona la donación relacionada.'
      return
    }

    if (
      !Number.isInteger(formulario.value.numero_entrega) ||
      formulario.value.numero_entrega === null ||
      formulario.value.numero_entrega < 1
    ) {
      errorMessage.value = 'Ingresa un número de entrega válido.'
      return
    }

    const response = await apiFetch('/inventario', {
      method: 'POST',
      body: JSON.stringify({
        tipo_movimiento: formulario.value.tipo_movimiento,
        cantidad: formulario.value.cantidad,
        numero_entrega: formulario.value.numero_entrega,
        fecha_vencimiento:
          formulario.value.fecha_vencimiento || undefined,
        observaciones:
          formulario.value.observaciones || undefined,
        donacion_id: formulario.value.donacion_id
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'No fue posible guardar el movimiento.'
      )
    }

    alert('Movimiento de inventario guardado correctamente.')

    router.push('/inventario')
  } catch (error) {
    console.error(error)

    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'No fue posible guardar el movimiento.'
  }
}

function volver() {
  router.push('/inventario')
}

function formatearFecha(fecha?: string | null) {
  if (!fecha) return '—'

  const fechaLocal = new Date(fecha)
  if (Number.isNaN(fechaLocal.getTime())) return '—'

  return fechaLocal.toLocaleDateString('es-GT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

onMounted(() => {
  if (viendoDetalle) {
    cargarDetalle()
  } else {
    cargarDonaciones()
  }
})
</script>

<style scoped>
.inventario-page {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 40px 48px 60px;
  box-sizing: border-box;
}

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

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-card {
  background: white;
  border: 1px solid #e3e8e5;
  border-radius: 20px;
  padding: 34px;
  box-shadow: 0 8px 28px rgba(25, 55, 45, 0.05);
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

.form-group label span {
  color: #9aa2aa;
  font-weight: 400;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #d9dfdc;
  border-radius: 10px;
  background: #fff;
  color: #303841;
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: 0.2s ease;
}

.form-group input,
.form-group select {
  height: 48px;
  padding: 0 14px;
}

.form-group textarea {
  padding: 14px;
  resize: vertical;
  min-height: 120px;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #aab1b7;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #74c69d;
  box-shadow: 0 0 0 3px rgba(116, 198, 157, 0.12);
}

.form-group select {
  cursor: pointer;
}

.error-message {
  margin-top: 24px;
  padding: 13px 16px;
  border-radius: 10px;
  background: #fff1f1;
  border: 1px solid #f1cccc;
  color: #b42318;
  font-size: 14px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 26px;
  border-top: 1px solid #edf0ee;
}

.btn-primary,
.btn-secondary {
  border-radius: 10px;
  padding: 13px 22px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn-primary {
  border: none;
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

@media (max-width: 800px) {
  .inventario-page {
    padding: 30px 24px 50px;
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

@media (max-width: 520px) {
  .inventario-page {
    padding: 24px 16px 40px;
  }

  .page-header h1 {
    font-size: 32px;
  }

  .form-card {
    padding: 22px;
    border-radius: 16px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
