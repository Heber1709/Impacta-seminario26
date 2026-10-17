<template>
  <MainLayout>
    <div class="campanas-page">

     <div class="page-header">
  <div>
    <span class="eyebrow">GESTIÓN DE CAMPAÑAS</span>
    <h1>Campañas</h1>
    <p>Administra las campañas de donación de IMPACTA.</p>
  </div>

  <button v-if="can('campanas', 'agregar')" class="primary-button" @click="$router.push('/nueva-campana')">
    + Nueva campaña
  </button>
</div>

      <div class="content-card">

        <div class="card-header">
          <div>
            <h2>Campañas registradas</h2>
            <p>Consulta las campañas activas y registradas.</p>
          </div>

          <div class="search-box">
            <input
              v-model="busqueda"
              type="text"
              placeholder="Buscar campaña..."
            />
          </div>
        </div>

        <div v-if="loading" class="state-message">
          <p>Cargando campañas...</p>
        </div>

        <div v-else-if="errorMessage" class="state-message error-state">
          <p>{{ errorMessage }}</p>
        </div>

        <div v-else-if="campanasFiltradas.length > 0" class="table-wrapper">

          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Objetivo</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Meta económica</th>
                <th>Meta productos</th>
                <th v-if="can('campanas', 'editar')">Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="campana in campanasFiltradas"
                :key="campana.id"
              >
                <td class="nombre">
                  {{ campana.nombre }}
                </td>

                <td v-if="can('campanas', 'editar')">
                  {{ campana.objetivo }}
                </td>

                <td>
                  {{ formatearFecha(campana.fecha_inicio) }}
                </td>

                <td>
                  {{ formatearFecha(campana.fecha_fin) }}
                </td>

                <td>
            Q {{ Number(campana.meta_economica || 0).toFixed(2) }}
                </td>

                <td>
                  {{ campana.meta_productos || 0 }}
                </td>
                <td>
                  <button
                    class="edit-button"
                    type="button"
                    @click="editarCampana(campana)"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

        </div>

        <div v-else class="empty-state">

          <div class="empty-icon">◎</div>

          <h3>
            {{
              busqueda
                ? 'No se encontraron campañas'
                : 'No hay campañas registradas'
            }}
          </h3>

          <p>
            {{
              busqueda
                ? 'Intenta realizar otra búsqueda.'
                : 'Cuando registres una campaña, aparecerá aquí.'
            }}
          </p>

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
import { hasPermission as can } from '../services/permissions'

const router = useRouter()

interface Campana {
  id: string
  nombre: string
  objetivo: string
  fecha_inicio: string
  fecha_fin?: string | null
  meta_economica?: number | null
  meta_productos?: number | null
}

const campanas = ref<Campana[]>([])
const busqueda = ref('')
const loading = ref(true)
const errorMessage = ref('')

function editarCampana(campana: Campana) {
  router.push(`/editar-campana/${encodeURIComponent(campana.id)}`)
}

const campanasFiltradas = computed(() => {
  const texto = busqueda.value.toLowerCase().trim()

  if (!texto) {
    
return campanas.value
  }

  return campanas.value.filter(campana =>
    campana.nombre.toLowerCase().includes(texto) ||
    campana.objetivo.toLowerCase().includes(texto)
  )
})

async function cargarCampanas() {
  try {
    loading.value = true
    errorMessage.value = ''

    const response = await apiFetch('/campanas')
    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'No fue posible cargar las campañas.'
      )
    }

    campanas.value = data
  } catch (error) {
    console.error(error)

    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'No fue posible cargar las campañas.'
  } finally {
    loading.value = false
  }
}

function formatearFecha(fecha?: string | null) {
  if (!fecha) {
    return '—'
  }

  const partes = fecha.split('-')

  if (partes.length !== 3) {
    return '—'
  }

  const [anio, mes, dia] = partes

  return `${dia}/${mes}/${anio}`

}
onMounted(() => {
  cargarCampanas()
})

</script>

<style scoped>
.campanas-page {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 40px 48px 60px;
  box-sizing: border-box;
}

.primary-button {
  border: none;
  background: #6fbf9b;
  color: white;
  padding: 14px 22px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.primary-button:hover {
  background: #5eaa88;
  transform: translateY(-1px);
}
.page-header {
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
  min-width: 900px;
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

.nombre {
  color: #20252b;
  font-weight: 700;
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
  margin: 10px auto 0;
  color: #8a939c;
  font-size: 14px;
  line-height: 1.6;
}

@media (max-width: 900px) {
  .campanas-page {
    padding: 30px 24px 50px;
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
  .campanas-page {
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
