
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import { apiFetch } from '../services/api'
import { hasPermission as can } from '../services/permissions'

const router = useRouter()

interface Beneficiario {
  id: string
  dpi: string
  nombre_completo: string
  direccion: string
  codigo_municipio: string | null
  codigo_departamento: string | null
  integrantes_hogar: number
  estado: boolean
}

interface Departamento {
  codigo_departamento: string
  descripcion: string
}

interface Municipio {
  codigo_municipio: string
  descripcion: string
  codigo_departamento: string
}

const beneficiarios = ref<Beneficiario[]>([])
const departamentos = ref<Departamento[]>([])
const municipios = ref<Municipio[]>([])
const busqueda = ref('')
const cargando = ref(true)
const errorMessage = ref('')

function nombreDepartamento(beneficiario: Beneficiario) {
  return (
    departamentos.value.find(
      (departamento) =>
        departamento.codigo_departamento === beneficiario.codigo_departamento
    )?.descripcion ?? 'Sin asignar'
  )
}

function nombreMunicipio(beneficiario: Beneficiario) {
  return (
    municipios.value.find(
      (municipio) => municipio.codigo_municipio === beneficiario.codigo_municipio
    )?.descripcion ?? 'Sin asignar'
  )
}

function nuevoBeneficiario() {
  router.push('/nuevo-beneficiario')
}

function editarBeneficiario(beneficiario: Beneficiario) {
  router.push(`/editar-beneficiario/${encodeURIComponent(beneficiario.id)}`)
}

async function cargarBeneficiarios() {
  try {
    cargando.value = true
    errorMessage.value = ''

    const response = await apiFetch('/beneficiarios')

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'No fue posible cargar los beneficiarios.')
    }

    beneficiarios.value = data
  } catch (error) {
    console.error(error)

    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'No fue posible cargar los beneficiarios.'
  } finally {
    cargando.value = false
  }
}

const beneficiariosFiltrados = computed(() => {
  const texto = busqueda.value.toLowerCase().trim()

  if (!texto) {
    return beneficiarios.value
  }

  return beneficiarios.value.filter((beneficiario) =>
    beneficiario.nombre_completo.toLowerCase().includes(texto) ||
    beneficiario.dpi.includes(texto) ||
    nombreMunicipio(beneficiario).toLowerCase().includes(texto) ||
    nombreDepartamento(beneficiario).toLowerCase().includes(texto)
  )
})

onMounted(() => {
  cargarBeneficiarios()
  cargarCatalogos()
})

async function cargarCatalogos() {
  try {
    const [departamentosResponse, municipiosResponse] = await Promise.all([
      apiFetch('/catalogos/departamentos'),
      apiFetch('/catalogos/municipios'),
    ])
    const [departamentosData, municipiosData] = await Promise.all([
      departamentosResponse.json(),
      municipiosResponse.json(),
    ])
    if (!departamentosResponse.ok || !municipiosResponse.ok) {
      throw new Error('No fue posible cargar los catálogos de ubicación.')
    }
    departamentos.value = departamentosData as Departamento[]
    municipios.value = municipiosData as Municipio[]
  } catch (error) {
    console.error(error)
  }
}
</script>
<template>
  <MainLayout>
    <div class="beneficiarios-page">

      <div class="page-header">
        <div>
          <span class="section-label">Gestión</span>
          <h1>Beneficiarios</h1>
          <p>Administra y consulta las personas beneficiadas por Impacta.</p>
        </div>

        <button
          v-if="can('beneficiarios', 'agregar')"
          class="primary-button"
          type="button"
          @click="nuevoBeneficiario"
        >
          <span>+</span>
          Nuevo beneficiario
        </button>
      </div>

      <div class="content-card">

        <div class="card-toolbar">
          <div>
            <h2>Listado de beneficiarios</h2>
            <p>Personas registradas en el sistema</p>
          </div>

          <div class="search-box">
            <span>⌕</span>
            <input
              v-model="busqueda"
              type="text"
              placeholder="Buscar beneficiario..."
            />
          </div>
        </div>

       <div v-if="cargando" class="empty-state">
  <div class="empty-icon">...</div>
  <h3>Cargando beneficiarios</h3>
  <p>Consultando la información registrada.</p>
</div>

<div v-else-if="errorMessage" class="empty-state">
  <div class="empty-icon">!</div>
  <h3>No fue posible cargar los beneficiarios</h3>
  <p>{{ errorMessage }}</p>
</div>

<div v-else-if="beneficiariosFiltrados.length === 0" class="empty-state">
  <div class="empty-icon">♙</div>
  <h3>No hay beneficiarios para mostrar</h3>
  <p>
    Los beneficiarios registrados aparecerán aquí.
  </p>
</div>

<div v-else class="table-container">
  <table class="beneficiarios-table">
    <thead>
      <tr>
        <th>DPI</th>
        <th>Nombre completo</th>
        <th>Municipio</th>
        <th>Departamento</th>
        <th>Integrantes</th>
        <th v-if="can('beneficiarios', 'editar')">Acciones</th>
      </tr>
    </thead>

    <tbody>
      <tr
        v-for="beneficiario in beneficiariosFiltrados"
        :key="beneficiario.id"
      >
        <td>{{ beneficiario.dpi }}</td>
        <td>{{ beneficiario.nombre_completo }}</td>
        <td>{{ nombreMunicipio(beneficiario) }}</td>
        <td>{{ nombreDepartamento(beneficiario) }}</td>
        <td>{{ beneficiario.integrantes_hogar }}</td>
        <td v-if="can('beneficiarios', 'editar')">
          <button
            class="edit-button"
            type="button"
            @click="editarBeneficiario(beneficiario)"
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

.beneficiarios-page {
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

.page-header h1 {
  margin: 0;
  color: #1f2937;
  font-size: 30px;
  font-weight: 700;
}

.page-header p {
  margin: 8px 0 0;
  color: #71807b;
  font-size: 14px;
}

.primary-button {
  display: flex;
  align-items: center;
  gap: 9px;
  border: none;
  border-radius: 10px;
  padding: 12px 18px;
  background: #6fb98f;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.10);
}

.primary-button span {
  font-size: 20px;
  line-height: 1;
}

.content-card {
  background: white;
  border: 1px solid #e3ebe8;
  border-radius: 18px;
  padding: 28px;
}

.card-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding-bottom: 22px;
  border-bottom: 1px solid #edf1ef;
}

.card-toolbar h2 {
  margin: 0;
  color: #23463f;
  font-size: 18px;
}

.card-toolbar p {
  margin: 6px 0 0;
  color: #7b8783;
  font-size: 13px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 260px;
  padding: 10px 13px;
  border: 1px solid #dce8e3;
  border-radius: 10px;
  background: #f8fbfa;
}

.search-box span {
  color: #7b8783;
  font-size: 18px;
}

.search-box input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: #33443f;
  font-size: 13px;
}

.table-container {
  width: 100%;
  overflow-x: auto;
}

.beneficiarios-table {
  width: 100%;
  border-collapse: collapse;
}

.beneficiarios-table th {
  padding: 12px 14px;
  color: #687772;
  font-size: 12px;
  font-weight: 600;
  text-align: left;
}

.beneficiarios-table td {
  padding: 14px;
  color: #344740;
  font-size: 14px;
  font-weight: 400;
  border-top: 1px solid #edf1ef;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: left;
  min-height: 260px;
  text-align: center;
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  margin-bottom: 16px;
  border-radius: 16px;
  background: #edf6f2;
  color: #65a889;
  font-size: 25px;
}

.empty-state h3 {
  margin: 0;
  color: #344740;
  font-size: 17px;
}

.empty-state p {
  margin: 7px 0 0;
  color: #8a9591;
  font-size: 13px;
}

@media (max-width: 700px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .card-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .search-box {
    width: auto;
  }
}

</style>
