<template>
  <MainLayout>
    <div class="inventario-page">

      <div class="page-header">
        <div>
          <span class="eyebrow">CONTROL DE EXISTENCIAS</span>
          <h1>Inventario</h1>
          <p>Administra las entradas y salidas de las donaciones.</p>
        </div>

        <div class="header-actions">
          <button
            class="btn-primary"
            type="button"
            @click="nuevoMovimiento"
          >
            + Nuevo movimiento
          </button>
        </div>
      </div>

      <!-- RESUMEN -->
      <div class="summary-grid">

        <div class="summary-card">
          <span class="summary-label">Existencias actuales</span>
          <strong>{{ existenciasActuales }}</strong>
          <small>Unidades disponibles</small>
        </div>

        <div class="summary-card">
          <span class="summary-label">Entradas</span>
          <strong>{{ totalEntradas }}</strong>
          <small>Unidades registradas</small>
        </div>

        <div class="summary-card">
          <span class="summary-label">Salidas</span>
          <strong>{{ totalSalidas }}</strong>
          <small>Unidades registradas</small>
        </div>

      </div>

      <!-- MOVIMIENTOS -->
      <div class="content-card">

        <div class="card-header">
          <div>
            <h2>Movimientos de inventario</h2>
            <p>Consulta el historial de entradas y salidas.</p>
          </div>

          <div class="search-box">
            <input
              v-model="busqueda"
              type="text"
              placeholder="Buscar movimiento..."
            />
          </div>
        </div>

        <!-- CARGANDO -->
        <div v-if="loading" class="state-message">
          <p>Cargando movimientos...</p>
        </div>

        <!-- ERROR -->
        <div v-else-if="errorMessage" class="state-message error-state">
          <p>{{ errorMessage }}</p>
        </div>

        <!-- TABLA -->
        <div v-else-if="movimientosFiltrados.length > 0" class="table-wrapper">

          <table>
            <thead>
              <tr>
                <th>Movimiento</th>
                <th>Donación</th>
                <th>Categoría</th>
                <th>Cantidad</th>
                <th>Vencimiento</th>
                <th>Fecha</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="movimiento in movimientosFiltrados"
                :key="movimiento.id"
              >
                <td>
                  <span
                    class="movement-badge"
                    :class="movimiento.tipo_movimiento.toLowerCase()"
                  >
                    {{ movimiento.tipo_movimiento }}
                  </span>
                </td>

                <td>
                  {{ movimiento.donacion?.codigo_unico || 'Sin código' }}
                </td>

                <td>
                  {{ movimiento.donacion?.categoria || 'Sin categoría' }}
                </td>

                <td class="quantity">
                  {{ movimiento.cantidad }}
                </td>

                <td>
                  {{ formatearFecha(movimiento.fecha_vencimiento) }}
                </td>

                <td>
                  {{ formatearFecha(movimiento.fecha_movimiento) }}
                </td>
              </tr>
            </tbody>
          </table>

        </div>

        <!-- SIN DATOS -->
        <div v-else class="empty-state">

          <div class="empty-icon">▣</div>

          <h3>
            {{
              busqueda
                ? 'No se encontraron movimientos'
                : 'No hay movimientos registrados'
            }}
          </h3>

          <p>
            {{
              busqueda
                ? 'Intenta realizar otra búsqueda.'
                : 'Cuando registres una entrada o salida, aparecerá aquí el historial del inventario.'
            }}
          </p>

          <button
            v-if="!busqueda"
            class="btn-primary"
            type="button"
            @click="nuevoMovimiento"
          >
            Registrar primer movimiento
          </button>

        </div>

      </div>

    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import { apiFetch } from '../services/api'

const router = useRouter()

interface Donacion {
  id: string
  codigo_unico: string
  categoria: string
}

interface Movimiento {
  id: string
  tipo_movimiento: 'ENTRADA' | 'SALIDA'
  cantidad: number
  fecha_vencimiento?: string | null
  fecha_movimiento: string
  observaciones?: string | null
  donacion?: Donacion | null
}

const movimientos = ref<Movimiento[]>([])
const busqueda = ref('')
const loading = ref(true)
const errorMessage = ref('')

const totalEntradas = computed(() => {
  return movimientos.value
    .filter(movimiento => movimiento.tipo_movimiento === 'ENTRADA')
    .reduce((total, movimiento) => total + movimiento.cantidad, 0)
})

const totalSalidas = computed(() => {
  return movimientos.value
    .filter(movimiento => movimiento.tipo_movimiento === 'SALIDA')
    .reduce((total, movimiento) => total + movimiento.cantidad, 0)
})

const existenciasActuales = computed(() => {
  return movimientos.value.reduce((total, movimiento) => {
    if (movimiento.tipo_movimiento === 'ENTRADA') {
      return total + movimiento.cantidad
    }

    return total - movimiento.cantidad
  }, 0)
})

const movimientosFiltrados = computed(() => {
  const texto = busqueda.value.toLowerCase().trim()

  if (!texto) {
    return movimientos.value
  }

  return movimientos.value.filter(movimiento => {
    const codigo = movimiento.donacion?.codigo_unico || ''
    const categoria = movimiento.donacion?.categoria || ''
    const tipo = movimiento.tipo_movimiento || ''

    return (
      codigo.toLowerCase().includes(texto) ||
      categoria.toLowerCase().includes(texto) ||
      tipo.toLowerCase().includes(texto)
    )
  })
})

async function cargarMovimientos() {
  try {
    loading.value = true
    errorMessage.value = ''

    const response = await apiFetch('/inventario')

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'No fue posible cargar el inventario.'
      )
    }

    movimientos.value = data
  } catch (error) {
    console.error(error)

    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'No fue posible cargar el inventario.'
  } finally {
    loading.value = false
  }
}

function nuevoMovimiento() {
  router.push('/nuevo-inventario')
}

function formatearFecha(fecha?: string | null) {
  if (!fecha) {
    return '—'
  }

  const fechaLocal = new Date(fecha)

  if (Number.isNaN(fechaLocal.getTime())) {
    return '—'
  }

  return fechaLocal.toLocaleDateString('es-GT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

onMounted(() => {
  cargarMovimientos()
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

.btn-primary {
  border: none;
  border-radius: 10px;
  padding: 13px 22px;
  background: #74c69d;
  color: white;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(116, 198, 157, 0.22);
  transition: 0.2s ease;
}

.btn-primary:hover {
  background: #62b98d;
  transform: translateY(-1px);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 28px;
}

.summary-card {
  background: white;
  border: 1px solid #e3e8e5;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 28px rgba(25, 55, 45, 0.05);
}

.summary-label {
  display: block;
  margin-bottom: 12px;
  color: #7a8490;
  font-size: 13px;
  font-weight: 600;
}

.summary-card strong {
  display: block;
  color: #20252b;
  font-size: 30px;
  font-weight: 700;
}

.summary-card small {
  display: block;
  margin-top: 6px;
  color: #9aa2aa;
  font-size: 13px;
}

.content-card {
  background: white;
  border: 1px solid #e3e8e5;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 28px rgba(25, 55, 45, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding-bottom: 24px;
  border-bottom: 1px solid #edf0ee;
}

.card-header h2 {
  margin: 0;
  color: #20252b;
  font-size: 21px;
  font-weight: 650;
}

.card-header p {
  margin: 7px 0 0;
  color: #8a939c;
  font-size: 14px;
}

.search-box input {
  width: 240px;
  height: 44px;
  padding: 0 14px;
  box-sizing: border-box;
  border: 1px solid #d9dfdc;
  border-radius: 10px;
  outline: none;
  color: #303841;
  font-family: inherit;
  font-size: 14px;
}

.search-box input:focus {
  border-color: #74c69d;
  box-shadow: 0 0 0 3px rgba(116, 198, 157, 0.12);
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
  margin-top: 10px;
}

th {
  padding: 16px 14px;
  text-align: left;
  color: #7a8490;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #edf0ee;
}

td {
  padding: 18px 14px;
  color: #4d5660;
  font-size: 14px;
  border-bottom: 1px solid #f0f2f1;
}

tbody tr:hover {
  background: #fafcfb;
}

.quantity {
  font-weight: 700;
  color: #20252b;
}

.movement-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.4px;
}

.movement-badge.entrada {
  background: #eaf8f0;
  color: #3d956b;
}

.movement-badge.salida {
  background: #fff1f1;
  color: #b42318;
}

.state-message {
  padding: 70px 20px;
  text-align: center;
  color: #8a939c;
  font-size: 14px;
}

.error-state {
  color: #b42318;
}

.empty-state {
  text-align: center;
  padding: 70px 20px 60px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: #edf8f2;
  color: #74c69d;
  font-size: 27px;
}

.empty-state h3 {
  margin: 0;
  color: #303841;
  font-size: 20px;
  font-weight: 650;
}

.empty-state p {
  max-width: 480px;
  margin: 10px auto 24px;
  color: #8a939c;
  font-size: 14px;
  line-height: 1.6;
}

@media (max-width: 900px) {
  .inventario-page {
    padding: 30px 24px 50px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-box {
    width: 100%;
  }

  .search-box input {
    width: 100%;
  }
}

@media (max-width: 520px) {
  .inventario-page {
    padding: 24px 16px 40px;
  }

  .page-header h1 {
    font-size: 32px;
  }

  .content-card {
    padding: 22px;
  }
}
</style>
