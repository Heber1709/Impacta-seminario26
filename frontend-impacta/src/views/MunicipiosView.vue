<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import { apiFetch } from '../services/api'

interface Departamento {
  codigo_departamento: string
  descripcion: string
}

interface Municipio {
  codigo_municipio: string
  descripcion: string
  codigo_departamento: string
}

const departamentos = ref<Departamento[]>([])
const municipios = ref<Municipio[]>([])
const busqueda = ref('')
const cargando = ref(true)
const guardando = ref(false)
const eliminando = ref<string | null>(null)
const errorMessage = ref('')
const formError = ref('')
const modalAbierto = ref(false)
const municipioEditando = ref<Municipio | null>(null)
const formulario = ref<Municipio>({
  codigo_municipio: '',
  descripcion: '',
  codigo_departamento: '',
})

const municipiosFiltrados = computed(() => {
  const texto = busqueda.value.toLowerCase().trim()
  return municipios.value.filter((municipio) => {
    const departamento = departamentos.value.find(
      (item) => item.codigo_departamento === municipio.codigo_departamento
    )
    return (
      !texto ||
      municipio.codigo_municipio.toLowerCase().includes(texto) ||
      municipio.descripcion.toLowerCase().includes(texto) ||
      departamento?.descripcion.toLowerCase().includes(texto)
    )
  })
})

function nombreDepartamento(codigo: string) {
  return (
    departamentos.value.find(
      (departamento) => departamento.codigo_departamento === codigo
    )?.descripcion ?? codigo
  )
}

async function cargarDatos() {
  try {
    cargando.value = true
    errorMessage.value = ''
    const [departamentosResponse, municipiosResponse] = await Promise.all([
      apiFetch('/catalogos/departamentos'),
      apiFetch('/catalogos/municipios'),
    ])
    const [departamentosData, municipiosData] = await Promise.all([
      departamentosResponse.json(),
      municipiosResponse.json(),
    ])
    if (!departamentosResponse.ok) {
      throw new Error(
        typeof departamentosData.message === 'string'
          ? departamentosData.message
          : 'No fue posible cargar los departamentos.'
      )
    }
    if (!municipiosResponse.ok) {
      throw new Error(
        typeof municipiosData.message === 'string'
          ? municipiosData.message
          : 'No fue posible cargar los municipios.'
      )
    }
    departamentos.value = departamentosData as Departamento[]
    municipios.value = municipiosData as Municipio[]
  } catch (error) {
    console.error(error)
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'No fue posible cargar los catálogos.'
  } finally {
    cargando.value = false
  }
}

function abrirCrear() {
  municipioEditando.value = null
  formulario.value = {
    codigo_municipio: '',
    descripcion: '',
    codigo_departamento: '',
  }
  formError.value = ''
  modalAbierto.value = true
}

function abrirEdicion(municipio: Municipio) {
  municipioEditando.value = municipio
  formulario.value = { ...municipio }
  formError.value = ''
  modalAbierto.value = true
}

async function guardarMunicipio() {
  try {
    guardando.value = true
    formError.value = ''
    const editando = municipioEditando.value
    const response = await apiFetch(
      editando
        ? `/catalogos/municipios/${encodeURIComponent(editando.codigo_municipio)}`
        : '/catalogos/municipios',
      {
        method: editando ? 'PATCH' : 'POST',
        body: JSON.stringify(
          editando
            ? { descripcion: formulario.value.descripcion }
            : formulario.value
        ),
      }
    )
    const data = await response.json()
    if (!response.ok) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'No fue posible guardar el municipio.'
      )
    }
    modalAbierto.value = false
    await cargarDatos()
  } catch (error) {
    console.error(error)
    formError.value =
      error instanceof Error
        ? error.message
        : 'No fue posible guardar el municipio.'
  } finally {
    guardando.value = false
  }
}

async function eliminarMunicipio(municipio: Municipio) {
  if (!window.confirm(`¿Deseas eliminar el municipio ${municipio.descripcion}?`)) {
    return
  }
  try {
    eliminando.value = municipio.codigo_municipio
    errorMessage.value = ''
    const response = await apiFetch(
      `/catalogos/municipios/${encodeURIComponent(municipio.codigo_municipio)}`,
      { method: 'DELETE' }
    )
    const data = await response.json()
    if (!response.ok) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'No fue posible eliminar el municipio.'
      )
    }
    await cargarDatos()
  } catch (error) {
    console.error(error)
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'No fue posible eliminar el municipio.'
  } finally {
    eliminando.value = null
  }
}

onMounted(cargarDatos)
</script>

<template>
  <MainLayout>
    <div class="catalog-page">
      <header class="page-header">
        <div>
          <span class="section-label">Catálogos</span>
          <h1>Municipios</h1>
          <p>Administra los municipios y el departamento al que pertenecen.</p>
        </div>
        <button
          class="primary-button"
          type="button"
          :disabled="departamentos.length === 0"
          @click="abrirCrear"
        >
          <span>+</span>
          Nuevo municipio
        </button>
      </header>

      <section class="content-card">
        <div class="card-toolbar">
          <div>
            <h2>Listado de municipios</h2>
            <p>{{ municipios.length }} municipios registrados</p>
          </div>
          <label class="search-box">
            <span aria-hidden="true">⌕</span>
            <input
              v-model="busqueda"
              type="search"
              aria-label="Buscar municipios"
              placeholder="Buscar municipio..."
            />
          </label>
        </div>

        <div v-if="cargando" class="empty-state">Cargando municipios...</div>
        <div v-else-if="errorMessage" class="empty-state error-state" role="alert">
          <p>{{ errorMessage }}</p>
          <button class="secondary-button" type="button" @click="cargarDatos">
            Intentar de nuevo
          </button>
        </div>
        <div
          v-else-if="departamentos.length === 0"
          class="empty-state"
        >
          Primero registra al menos un departamento para agregar municipios.
        </div>
        <div v-else-if="municipiosFiltrados.length === 0" class="empty-state">
          No hay municipios para mostrar.
        </div>
        <div v-else class="table-container">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th>Departamento</th>
                <th class="actions-heading">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="municipio in municipiosFiltrados"
                :key="municipio.codigo_municipio"
              >
                <td>{{ municipio.codigo_municipio }}</td>
                <td class="name-cell">{{ municipio.descripcion }}</td>
                <td>{{ nombreDepartamento(municipio.codigo_departamento) }}</td>
                <td>
                  <div class="row-actions">
                    <button
                      class="text-button"
                      type="button"
                      @click="abrirEdicion(municipio)"
                    >
                      Editar
                    </button>
                    <button
                      class="text-button danger-button"
                      type="button"
                      :disabled="eliminando === municipio.codigo_municipio"
                      @click="eliminarMunicipio(municipio)"
                    >
                      {{ eliminando === municipio.codigo_municipio ? 'Eliminando...' : 'Eliminar' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div v-if="modalAbierto" class="modal-backdrop" @click.self="modalAbierto = false">
        <section class="catalog-modal" role="dialog" aria-modal="true">
          <header class="modal-header">
            <h2>{{ municipioEditando ? 'Editar municipio' : 'Nuevo municipio' }}</h2>
            <button type="button" class="close-button" aria-label="Cerrar" @click="modalAbierto = false">×</button>
          </header>
          <form class="catalog-form" @submit.prevent="guardarMunicipio">
            <label>
              Código de municipio
              <input
                v-model.trim="formulario.codigo_municipio"
                type="text"
                maxlength="20"
                required
                :disabled="Boolean(municipioEditando)"
              />
            </label>
            <label>
              Descripción
              <input v-model.trim="formulario.descripcion" type="text" maxlength="100" required />
            </label>
            <label>
              Departamento
              <select
                v-model="formulario.codigo_departamento"
                required
                :disabled="Boolean(municipioEditando)"
              >
                <option value="" disabled>Selecciona un departamento</option>
                <option
                  v-for="departamento in departamentos"
                  :key="departamento.codigo_departamento"
                  :value="departamento.codigo_departamento"
                >
                  {{ departamento.codigo_departamento }} — {{ departamento.descripcion }}
                </option>
              </select>
            </label>
            <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
            <footer class="modal-actions">
              <button class="secondary-button" type="button" :disabled="guardando" @click="modalAbierto = false">
                Cancelar
              </button>
              <button class="primary-button" type="submit" :disabled="guardando">
                {{ guardando ? 'Guardando...' : 'Guardar' }}
              </button>
            </footer>
          </form>
        </section>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.catalog-page {
  width: 100%;
}

.page-header,
.card-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.page-header {
  margin-bottom: 28px;
}

.section-label {
  display: block;
  margin-bottom: 7px;
  color: #65a889;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: #1f2937;
  font-size: 30px;
}

.page-header p,
.card-toolbar p {
  margin: 8px 0 0;
  color: #71807b;
  font-size: 14px;
}

.primary-button,
.secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 10px;
  padding: 12px 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.primary-button {
  background: #6fb98f;
  color: white;
}

.primary-button span {
  font-size: 20px;
  line-height: 1;
}

.secondary-button {
  border: 1px solid #d7e2dd;
  background: white;
  color: #42544b;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.content-card {
  overflow: hidden;
  border: 1px solid #e3ebe8;
  border-radius: 18px;
  padding: 28px;
  background: white;
}

.card-toolbar {
  margin-bottom: 26px;
}

.card-toolbar h2 {
  margin: 0;
  color: #30433c;
  font-size: 20px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  width: min(100%, 280px);
  border: 1px solid #dce6e1;
  border-radius: 10px;
  padding: 0 12px;
  color: #82918a;
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  padding: 11px 0;
  color: #30433c;
  font: inherit;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th {
  border-bottom: 1px solid #e7eeea;
  padding: 0 14px 13px;
  color: #82918a;
  font-size: 11px;
  letter-spacing: 0.7px;
  text-transform: uppercase;
}

td {
  border-bottom: 1px solid #edf1ef;
  padding: 16px 14px;
  color: #53645c;
  font-size: 14px;
}

.name-cell {
  color: #30433c;
  font-weight: 600;
}

.actions-heading {
  text-align: right;
}

.row-actions {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  white-space: nowrap;
}

.text-button {
  border: 0;
  padding: 4px 0;
  background: none;
  color: #4c9870;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.danger-button,
.error-state {
  color: #bf5c5c;
}

.empty-state {
  padding: 48px 20px;
  color: #71807b;
  text-align: center;
}

.empty-state p {
  margin: 0 0 16px;
}

.modal-backdrop {
  position: fixed;
  z-index: 20;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(26, 40, 33, 0.42);
}

.catalog-modal {
  width: min(100%, 460px);
  border: 1px solid #e3ebe8;
  border-radius: 18px;
  padding: 26px;
  background: white;
  box-shadow: 0 24px 70px rgba(25, 45, 34, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 22px;
}

.modal-header h2 {
  margin: 0;
  color: #30433c;
  font-size: 22px;
}

.close-button {
  border: 0;
  background: none;
  color: #82918a;
  font-size: 28px;
  cursor: pointer;
}

.catalog-form {
  display: grid;
  gap: 16px;
}

.catalog-form label {
  display: grid;
  gap: 7px;
  color: #52645b;
  font-size: 13px;
  font-weight: 600;
}

.catalog-form input,
.catalog-form select {
  box-sizing: border-box;
  width: 100%;
  border: 1px solid #dce6e1;
  border-radius: 9px;
  padding: 11px 12px;
  background: white;
  color: #30433c;
  font: inherit;
}

.form-error {
  margin: 0;
  color: #b54747;
  font-size: 13px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 6px;
}

@media (max-width: 700px) {
  .page-header,
  .card-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .page-header .primary-button {
    align-self: flex-start;
  }

  .content-card {
    padding: 20px 16px;
  }

  .search-box {
    width: auto;
  }
}
</style>
