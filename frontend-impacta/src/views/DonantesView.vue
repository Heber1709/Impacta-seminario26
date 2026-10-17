<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import { apiFetch } from '../services/api'
import { hasPermission as can } from '../services/permissions'

const router = useRouter()

interface Donante {
  id: string
  nombre: string
  tipo: string
  email?: string
  telefono?: string
}

const donantes = ref<Donante[]>([])
const busqueda = ref('')
const cargando = ref(true)
const errorMessage = ref('')

function nuevoDonante() {
  router.push('/nuevo-donante')
}

function editarDonante(donante: Donante) {
  router.push(`/editar-donante/${encodeURIComponent(donante.id)}`)
}

async function cargarDonantes() {
  try {
    cargando.value = true
    errorMessage.value = ''

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
    cargando.value = false
  }
}

const donantesFiltrados = computed(() => {
  const texto = busqueda.value.toLowerCase().trim()

  if (!texto) {
    return donantes.value
  }

  return donantes.value.filter((donante) =>
    donante.nombre.toLowerCase().includes(texto) ||
    donante.tipo.toLowerCase().includes(texto) ||
    donante.email?.toLowerCase().includes(texto)
  )
})

onMounted(() => {
  cargarDonantes()
})
</script>

<template>
  <MainLayout>
    <div class="donantes-page">

      <div class="page-header">
        <div>
          <span class="section-label">GESTIÓN</span>
          <h1>Donantes</h1>
          <p>Administra y consulta las personas y organizaciones que apoyan a Impacta.</p>
        </div>

        <button
          v-if="can('donantes', 'agregar')"
          class="primary-button"
          type="button"
          @click="nuevoDonante"
        >
          <span>+</span>
          Nuevo donante
        </button>
      </div>

      <div class="content-card">

        <div class="card-toolbar">
          <div>
            <h2>Listado de donantes</h2>
            <p>Personas y organizaciones registradas en el sistema</p>
          </div>

          <div class="search-box">
            <span>⌕</span>
            <input
              v-model="busqueda"
              type="text"
              placeholder="Buscar donante..."
            />
          </div>
        </div>

        <div v-if="cargando" class="empty-state">
          <div class="empty-icon">...</div>
          <h3>Cargando donantes</h3>
          <p>Consultando la información registrada.</p>
        </div>

        <div v-else-if="errorMessage" class="empty-state">
          <div class="empty-icon">!</div>
          <h3>No fue posible cargar los donantes</h3>
          <p>{{ errorMessage }}</p>
        </div>

        <div
          v-else-if="donantesFiltrados.length === 0"
          class="empty-state"
        >
          <div class="empty-icon">○</div>
          <h3>No hay donantes para mostrar</h3>
          <p>
            Los donantes registrados aparecerán aquí.
          </p>
        </div>

        <div v-else class="table-container">
          <table class="donantes-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th v-if="can('donantes', 'editar')">Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="donante in donantesFiltrados"
                :key="donante.id"
              >
                <td>{{ donante.nombre }}</td>
                <td>{{ donante.tipo }}</td>
                <td>{{ donante.email || '—' }}</td>
                <td>{{ donante.telefono || '—' }}</td>
                <td v-if="can('donantes', 'editar')">
                  <button
                    class="edit-button"
                    type="button"
                    @click="editarDonante(donante)"
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
.donantes-page {
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

.donantes-table {
  width: 100%;
  border-collapse: collapse;
}

.donantes-table th {
  padding: 14px 12px;
  border-top: 1px solid #e7ece9;
  border-bottom: 1px solid #e7ece9;
  color: #34423d;
  font-size: 14px;
  text-align: left;
}

.donantes-table td {
  padding: 17px 12px;
  border-bottom: 1px solid #edf0ee;
  color: #59645f;
  font-size: 14px;
}

.donantes-table tbody tr:hover {
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
</style>
