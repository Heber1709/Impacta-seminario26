<template>
  <MainLayout>
    <div class="entregas-page">
      <header class="page-header">
        <div>
          <span class="section-label">GESTIÓN</span>
          <h1>Entregas</h1>
          <p>Consulta y administra las entregas realizadas a beneficiarios.</p>
        </div>
        <button
          v-if="can('beneficiarios', 'agregar')"
          class="primary-button"
          type="button"
          @click="router.push('/nueva-entrega')"
        >
          <span>+</span>
          Nueva entrega
        </button>
      </header>

      <section class="content-card">
        <div class="card-toolbar">
          <div>
            <h2>Entregas registradas</h2>
            <p>Incluye el beneficiario, la campaña y los voluntarios asignados.</p>
          </div>
          <div class="search-box">
            <input
              v-model="busqueda"
              type="search"
              placeholder="Buscar entrega..."
              aria-label="Buscar entregas"
            />
          </div>
        </div>

        <div v-if="cargando" class="state-message" role="status">
          Cargando entregas...
        </div>
        <div v-else-if="error" class="state-message error-state" role="alert">
          {{ error }}
        </div>
        <div v-else-if="entregasFiltradas.length === 0" class="empty-state">
          <div class="empty-icon">↗</div>
          <h3>{{ busqueda ? 'No se encontraron entregas' : 'No hay entregas registradas' }}</h3>
          <p>
            {{
              busqueda
                ? 'Prueba con otro nombre, campaña o voluntario.'
                : 'Las entregas registradas aparecerán aquí.'
            }}
          </p>
        </div>
        <div v-else class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Fecha</th>
                <th>Beneficiario</th>
                <th>Campaña</th>
                <th>Voluntarios</th>
                <th>Evidencia</th>
                <th v-if="can('beneficiarios', 'editar') || isAdministrator()">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entrega in entregasFiltradas" :key="entrega.id">
                <td>#{{ entrega.numero_entrega }}</td>
                <td>{{ formatearFecha(entrega.fecha) }}</td>
                <td class="primary-cell">
                  {{ entrega.beneficiario?.nombre_completo || '—' }}
                </td>
                <td>{{ entrega.campana?.nombre || 'Sin campaña' }}</td>
                <td>
                  <template v-if="nombresVoluntarios(entrega).length">
                    {{ nombresVoluntarios(entrega).join(', ') }}
                  </template>
                  <template v-else-if="idsVoluntarios(entrega).length">
                    {{ idsVoluntarios(entrega).length }} asignado(s)
                  </template>
                  <template v-else>Sin asignar</template>
                </td>
                <td>
                  <a
                    v-if="entrega.evidencia_url"
                    :href="entrega.evidencia_url"
                    target="_blank"
                    rel="noopener noreferrer"
                  >Ver evidencia</a>
                  <span v-else>—</span>
                </td>
                <td v-if="can('beneficiarios', 'editar') || isAdministrator()" class="actions">
                  <button
                    v-if="can('beneficiarios', 'editar')"
                    class="text-button"
                    type="button"
                    @click="router.push(`/editar-entrega/${encodeURIComponent(entrega.id)}`)"
                  >
                    Editar
                  </button>
                  <button
                    v-if="isAdministrator()"
                    class="text-button danger-button"
                    type="button"
                    :disabled="desactivandoId === entrega.id"
                    @click="desactivarEntrega(entrega)"
                  >
                    {{ desactivandoId === entrega.id ? 'Desactivando...' : 'Desactivar' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import { apiFetch } from '../services/api'
import {
  hasPermission as can,
  isAdministrator,
} from '../services/permissions'

interface Entrega {
  id: string
  numero_entrega: number
  fecha: string
  evidencia_url?: string | null
  beneficiario?: { id: string; nombre_completo: string } | null
  campana?: { id: string; nombre: string } | null
  voluntarios?: string[] | { id: string }[]
}

interface Voluntario {
  id: string
  nombre_completo: string
}

const router = useRouter()
const entregas = ref<Entrega[]>([])
const voluntarios = ref<Voluntario[]>([])
const busqueda = ref('')
const cargando = ref(true)
const error = ref('')
const desactivandoId = ref('')
const puedeConsultarVoluntarios = can('voluntarios', 'consultar')

function idsVoluntarios(entrega: Entrega): string[] {
  return (entrega.voluntarios ?? []).map((item) =>
    typeof item === 'string' ? item : item.id
  )
}

function nombresVoluntarios(entrega: Entrega): string[] {
  const ids = idsVoluntarios(entrega)
  return ids
    .map((id) => voluntarios.value.find((item) => item.id === id)?.nombre_completo)
    .filter((nombre): nombre is string => Boolean(nombre))
}

const entregasFiltradas = computed(() => {
  const texto = busqueda.value.trim().toLocaleLowerCase()
  if (!texto) return entregas.value

  return entregas.value.filter((entrega) => {
    const valores = [
      String(entrega.numero_entrega),
      entrega.beneficiario?.nombre_completo,
      entrega.campana?.nombre,
      ...nombresVoluntarios(entrega),
      formatearFecha(entrega.fecha),
    ]
    return valores.some((valor) => valor?.toLocaleLowerCase().includes(texto))
  })
})

function formatearFecha(fecha: string): string {
  const valor = new Date(fecha)
  return Number.isNaN(valor.getTime()) ? '—' : valor.toLocaleDateString('es-GT')
}

async function cargarEntregas() {
  try {
    cargando.value = true
    error.value = ''
    const [respuestaEntregas, respuestaVoluntarios] = await Promise.all([
      apiFetch('/entregas'),
      puedeConsultarVoluntarios ? apiFetch('/voluntarios') : Promise.resolve(null),
    ])
    const [datosEntregas, datosVoluntarios] = await Promise.all([
      respuestaEntregas.json(),
      respuestaVoluntarios?.json() ?? Promise.resolve(null),
    ])
    if (!respuestaEntregas.ok) {
      throw new Error(datosEntregas.message || 'No fue posible cargar las entregas.')
    }
    entregas.value = datosEntregas as Entrega[]

    if (puedeConsultarVoluntarios) {
      if (!respuestaVoluntarios?.ok) {
        throw new Error(
          datosVoluntarios.message || 'No fue posible cargar los voluntarios.'
        )
      }
      voluntarios.value = datosVoluntarios as Voluntario[]
    }
  } catch (cause) {
    console.error('Error al cargar las entregas:', cause)
    error.value =
      cause instanceof Error
        ? cause.message
        : 'No fue posible cargar las entregas.'
  } finally {
    cargando.value = false
  }
}

async function desactivarEntrega(entrega: Entrega) {
  if (!window.confirm('¿Deseas desactivar esta entrega?')) return

  try {
    desactivandoId.value = entrega.id
    error.value = ''
    const response = await apiFetch(`/entregas/${encodeURIComponent(entrega.id)}`, {
      method: 'DELETE',
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'No fue posible desactivar la entrega.')
    }
    entregas.value = entregas.value.filter((item) => item.id !== entrega.id)
  } catch (cause) {
    console.error('Error al desactivar la entrega:', cause)
    error.value =
      cause instanceof Error
        ? cause.message
        : 'No fue posible desactivar la entrega.'
  } finally {
    desactivandoId.value = ''
  }
}

onMounted(cargarEntregas)
</script>

<style scoped>
.entregas-page {
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
}

.primary-button {
  border: 0;
  border-radius: 10px;
  padding: 14px 20px;
  background: #70be91;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.primary-button span {
  margin-right: 7px;
  font-size: 18px;
}

.content-card {
  padding: 28px 32px;
  border: 1px solid #e3e8e5;
  border-radius: 20px;
  background: #fff;
}

.card-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  margin-bottom: 22px;
}

.card-toolbar h2 {
  margin: 0;
  color: #30433c;
  font-size: 21px;
}

.card-toolbar p {
  margin: 7px 0 0;
  color: #8a939c;
  font-size: 14px;
}

.search-box input {
  width: 240px;
  height: 44px;
  padding: 0 14px;
  border: 1px solid #d9dfdc;
  border-radius: 10px;
  font: inherit;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 820px;
  border-collapse: collapse;
}

th,
td {
  padding: 15px 12px;
  border-bottom: 1px solid #edf0ee;
  text-align: left;
  font-size: 14px;
}

th {
  color: #7a8490;
  font-size: 12px;
  text-transform: uppercase;
}

td {
  color: #4d5660;
}

.primary-cell {
  color: #20252b;
  font-weight: 650;
}

.actions {
  white-space: nowrap;
}

.text-button {
  margin-right: 12px;
  padding: 4px 0;
  border: 0;
  background: none;
  color: #4c9870;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.text-button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.danger-button {
  color: #b42318;
}

.state-message,
.empty-state {
  padding: 64px 20px;
  text-align: center;
  color: #8a939c;
}

.error-state {
  color: #b42318;
}

.empty-icon {
  margin-bottom: 12px;
  color: #74c69d;
  font-size: 28px;
}

.empty-state h3 {
  margin: 0;
  color: #303841;
  font-size: 20px;
}

.empty-state p {
  margin: 10px auto 0;
  font-size: 14px;
}

@media (max-width: 700px) {
  .page-header,
  .card-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .primary-button,
  .search-box input {
    width: 100%;
  }

  .content-card {
    padding: 20px 16px;
  }
}
</style>
