<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import { apiFetch } from '../services/api'
import { hasPermission as can } from '../services/permissions'

const router = useRouter()

interface Donacion {
  id: string
  codigo_unico: string
  tipo: string
  categoria: string
  monto?: number | null
  fotografia_url?: string
  fecha_ingreso: string
  donante?: {
    id: string
    nombre: string
  }
}

const donaciones = ref<Donacion[]>([])
const busqueda = ref('')
const cargando = ref(true)
const errorMessage = ref('')

function nuevaDonacion() {
  router.push('/nueva-donacion')
}

function editarDonacion(donacion: Donacion) {
  router.push(`/editar-donacion/${encodeURIComponent(donacion.id)}`)
}

async function cargarDonaciones() {
  try {
    cargando.value = true
    errorMessage.value = ''

    const response = await apiFetch('/donaciones')
    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data.message || 'No fue posible cargar las donaciones.'
      )
    }

    donaciones.value = data
  } catch (error) {
    console.error(error)

    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'No fue posible cargar las donaciones.'
  } finally {
    cargando.value = false
  }
}

const donacionesFiltradas = computed(() => {
  const texto = busqueda.value.toLowerCase().trim()

  if (!texto) {
    return donaciones.value
  }

  return donaciones.value.filter((donacion) =>
    donacion.codigo_unico.toLowerCase().includes(texto) ||
    donacion.tipo.toLowerCase().includes(texto) ||
    donacion.categoria.toLowerCase().includes(texto) ||
    donacion.donante?.nombre.toLowerCase().includes(texto)
  )
})

function formatearFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-GT')
}

function formatearMonto(monto?: number | null) {
  if (monto === undefined || monto === null) {
    return '—'
  }

  return `Q ${Number(monto).toFixed(2)}`
}

onMounted(() => {
  cargarDonaciones()
})
</script>

<template>
  <MainLayout>
    <div class="donaciones-page">

      <div class="page-header">
        <div>
          <span class="section-label">GESTIÓN</span>

          <h1>Donaciones</h1>

          <p>
            Registra y consulta las donaciones que generan impacto en la comunidad.
          </p>
        </div>

        <button
          v-if="can('donaciones', 'agregar')"
          class="primary-button"
          type="button"
          @click="nuevaDonacion"
        >
          <span>+</span>
          Nueva donación
        </button>
      </div>

      <div class="content-card">

        <div class="card-toolbar">
          <div>
            <h2>Listado de donaciones</h2>

            <p>
              Donaciones registradas en el sistema
            </p>
          </div>

          <div class="search-box">
            <span>⌕</span>

            <input
              v-model="busqueda"
              type="text"
              placeholder="Buscar donación..."
            />
          </div>
        </div>

        <div
          v-if="cargando"
          class="empty-state"
        >
          <div class="empty-icon">...</div>

          <h3>Cargando donaciones</h3>

          <p>
            Consultando la información registrada.
          </p>
        </div>

        <div
          v-else-if="errorMessage"
          class="empty-state"
        >
          <div class="empty-icon">!</div>

          <h3>No fue posible cargar las donaciones</h3>

          <p>
            {{ errorMessage }}
          </p>
        </div>

        <div
          v-else-if="donacionesFiltradas.length === 0"
          class="empty-state"
        >
          <div class="empty-icon">○</div>

          <h3>No hay donaciones para mostrar</h3>

          <p>
            Las donaciones registradas aparecerán aquí.
          </p>
        </div>

        <div
          v-else
          class="table-container"
        >
          <table class="donaciones-table">

            <thead>
              <tr>
                <th>Código</th>
                <th>Donante</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Monto</th>
                <th>Fecha</th>
                <th v-if="can('donaciones', 'editar')">Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="donacion in donacionesFiltradas"
                :key="donacion.id"
              >
                <td v-if="can('donaciones', 'editar')">
                  {{ donacion.codigo_unico }}
                </td>

                <td>
                  {{ donacion.donante?.nombre || '—' }}
                </td>

                <td>
                  {{ donacion.tipo }}
                </td>

                <td>
                  {{ donacion.categoria }}
                </td>

                <td>
                  {{ formatearMonto(donacion.monto) }}
                </td>

                <td>
                  {{ formatearFecha(donacion.fecha_ingreso) }}
                </td>

                <td>
                  <button
                    class="edit-button"
                    type="button"
                    @click="editarDonacion(donacion)"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            </tbody>

          </table>
        </div>

      </div>

    </div>
  </MainLayout>
</template>

<style scoped>
.donaciones-page {
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  margin-bottom: 28px;
}

.section-label {
  display: block;
  margin-bottom: 7px;
  color: #65a889;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

h1 {
  margin: 0;
  color: #202733;
  font-size: 32px;
}

.page-header p {
  margin: 8px 0 0;
  color: #78828c;
  font-size: 15px;
}

.primary-button {
  border: none;
  border-radius: 10px;
  padding: 14px 20px;
  background: #70be91;
  color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(63, 110, 84, 0.15);
}

.primary-button span {
  margin-right: 7px;
  font-size: 18px;
}

.content-card {
  background: white;
  border: 1px solid #e3e8e5;
  border-radius: 20px;
  padding: 28px 32px;
}

.card-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  margin-bottom: 26px;
}

.card-toolbar h2 {
  margin: 0;
  color: #30433c;
  font-size: 20px;
}

.card-toolbar p {
  margin: 7px 0 0;
  color: #89938f;
  font-size: 14px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 300px;
  border: 1px solid #dce4df;
  border-radius: 12px;
  padding: 12px 14px;
  background: #fbfcfc;
}

.search-box span {
  color: #7d8783;
}

.search-box input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: #34423d;
  font-size: 14px;
}

.table-container {
  overflow-x: auto;
}

.donaciones-table {
  width: 100%;
  border-collapse: collapse;
}

.donaciones-table th {
  padding: 14px 12px;
  border-top: 1px solid #e7ece9;
  border-bottom: 1px solid #e7ece9;
  color: #34423d;
  font-size: 14px;
  text-align: left;
}

.donaciones-table td {
  padding: 17px 12px;
  border-bottom: 1px solid #edf0ee;
  color: #59645f;
  font-size: 14px;
}

.donaciones-table tbody tr:hover {
  background: #f8fbf9;
}

.edit-button {
  border: 0;
  padding: 4px 0;
  background: none;
  color: #4c9870;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.empty-state {
  padding: 50px 20px;
  text-align: center;
  color: #7d8783;
}

.empty-icon {
  margin-bottom: 10px;
  color: #70be91;
  font-size: 28px;
  font-weight: 700;
}

.empty-state h3 {
  margin: 0 0 8px;
  color: #34423d;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

@media (max-width: 800px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: 0;
  }
}
</style>
