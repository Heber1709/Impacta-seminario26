<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import { apiFetch } from '../services/api'

interface Voluntario {
  id: string
  dpi: string
  nombre_completo: string
  direccion: string
  codigo_municipio: string | null
  codigo_departamento: string | null
}

interface VoluntarioForm {
  dpi: string
  nombre_completo: string
  direccion: string
  codigo_municipio: string
  codigo_departamento: string
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

const voluntarios = ref<Voluntario[]>([])
const departamentos = ref<Departamento[]>([])
const municipios = ref<Municipio[]>([])
const busqueda = ref('')
const cargando = ref(true)
const cargandoCatalogos = ref(true)
const guardando = ref(false)
const errorMessage = ref('')
const errorCatalogos = ref('')
const formError = ref('')
const modalAbierto = ref(false)
const voluntarioEditando = ref<Voluntario | null>(null)
const voluntarioDesactivando = ref<string | null>(null)
const form = ref<VoluntarioForm>(nuevoFormulario())

function nuevoFormulario(): VoluntarioForm {
  return {
    dpi: '',
    nombre_completo: '',
    direccion: '',
    codigo_municipio: '',
    codigo_departamento: '',
  }
}

const municipiosDelDepartamento = computed(() =>
  municipios.value.filter(
    (municipio) =>
      municipio.codigo_departamento === form.value.codigo_departamento
  )
)

function nombreDepartamento(voluntario: Voluntario) {
  return (
    departamentos.value.find(
      (departamento) =>
        departamento.codigo_departamento === voluntario.codigo_departamento
    )?.descripcion ?? 'Sin asignar'
  )
}

function nombreMunicipio(voluntario: Voluntario) {
  return (
    municipios.value.find(
      (municipio) => municipio.codigo_municipio === voluntario.codigo_municipio
    )?.descripcion ?? 'Sin asignar'
  )
}

const voluntariosFiltrados = computed(() => {
  const texto = busqueda.value.toLowerCase().trim()

  if (!texto) {
    return voluntarios.value
  }

  return voluntarios.value.filter((voluntario) =>
    [
      voluntario.dpi,
      voluntario.nombre_completo,
      voluntario.direccion,
      nombreMunicipio(voluntario),
      nombreDepartamento(voluntario),
    ].some((valor) => valor.toLowerCase().includes(texto))
  )
})

async function cargarVoluntarios() {
  try {
    cargando.value = true
    errorMessage.value = ''

    const response = await apiFetch('/voluntarios')
    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'No fue posible cargar los voluntarios.'
      )
    }

    voluntarios.value = data as Voluntario[]
  } catch (error) {
    console.error(error)
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'No fue posible cargar los voluntarios.'
  } finally {
    cargando.value = false
  }
}

async function cargarCatalogos() {
  try {
    cargandoCatalogos.value = true
    errorCatalogos.value = ''
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
    errorCatalogos.value =
      error instanceof Error
        ? error.message
        : 'No fue posible cargar los catálogos de ubicación.'
  } finally {
    cargandoCatalogos.value = false
  }
}

function abrirCrear() {
  voluntarioEditando.value = null
  form.value = nuevoFormulario()
  formError.value = ''
  modalAbierto.value = true
}

function abrirEdicion(voluntario: Voluntario) {
  voluntarioEditando.value = voluntario
  const departamentoCatalogo = departamentos.value.find(
      (departamento) =>
        departamento.codigo_departamento === voluntario.codigo_departamento
    )
  const municipioCatalogo = municipios.value.find(
      (municipio) => municipio.codigo_municipio === voluntario.codigo_municipio
    )
  form.value = {
    dpi: voluntario.dpi,
    nombre_completo: voluntario.nombre_completo,
    direccion: voluntario.direccion,
    codigo_municipio: municipioCatalogo?.codigo_municipio ?? '',
    codigo_departamento: departamentoCatalogo?.codigo_departamento ?? '',
  }
  formError.value = ''
  modalAbierto.value = true
}

function cerrarModal() {
  if (!guardando.value) {
    modalAbierto.value = false
  }
}

async function guardarVoluntario() {
  try {
    guardando.value = true
    formError.value = ''

    const departamento = departamentos.value.find(
      (item) => item.codigo_departamento === form.value.codigo_departamento
    )
    const municipio = municipiosDelDepartamento.value.find(
      (item) => item.codigo_municipio === form.value.codigo_municipio
    )
    if (!departamento || !municipio) {
      throw new Error('Selecciona un departamento y un municipio válidos.')
    }

    const editando = voluntarioEditando.value
    const response = await apiFetch(
      editando
        ? `/voluntarios/${encodeURIComponent(editando.id)}`
        : '/voluntarios',
      {
        method: editando ? 'PATCH' : 'POST',
        body: JSON.stringify(form.value),
      }
    )
    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'No fue posible guardar el voluntario.'
      )
    }

    modalAbierto.value = false
    await cargarVoluntarios()
  } catch (error) {
    console.error(error)
    formError.value =
      error instanceof Error
        ? error.message
        : 'No fue posible guardar el voluntario.'
  } finally {
    guardando.value = false
  }
}

async function desactivarVoluntario(voluntario: Voluntario) {
  if (
    !window.confirm(
      `¿Deseas desactivar a ${voluntario.nombre_completo}?`
    )
  ) {
    return
  }

  try {
    voluntarioDesactivando.value = voluntario.id
    errorMessage.value = ''

    const response = await apiFetch(
      `/voluntarios/${encodeURIComponent(voluntario.id)}`,
      { method: 'DELETE' }
    )
    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'No fue posible desactivar el voluntario.'
      )
    }

    await cargarVoluntarios()
  } catch (error) {
    console.error(error)
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'No fue posible desactivar el voluntario.'
  } finally {
    voluntarioDesactivando.value = null
  }
}

onMounted(() => {
  cargarVoluntarios()
  cargarCatalogos()
})
</script>

<template>
  <MainLayout>
    <div class="voluntarios-page">
      <div class="page-header">
        <div>
          <span class="section-label">Gestión</span>
          <h1>Voluntarios</h1>
          <p>Administra la información de las personas voluntarias de Impacta.</p>
        </div>

        <button
          class="primary-button"
          type="button"
          :disabled="cargandoCatalogos"
          @click="abrirCrear"
        >
          <span>+</span>
          Nuevo voluntario
        </button>
      </div>

      <div class="content-card">
        <div class="card-toolbar">
          <div>
            <h2>Listado de voluntarios</h2>
            <p>Personas voluntarias activas registradas en el sistema</p>
          </div>

          <label class="search-box">
            <span aria-hidden="true">⌕</span>
            <input
              v-model="busqueda"
              type="search"
              placeholder="Buscar voluntario..."
              aria-label="Buscar voluntarios"
            />
          </label>
        </div>

        <div v-if="cargando" class="empty-state">
          <div class="empty-icon">...</div>
          <h3>Cargando voluntarios</h3>
          <p>Consultando la información registrada.</p>
        </div>

        <div v-else-if="errorMessage" class="empty-state">
          <div class="empty-icon">!</div>
          <h3>No fue posible cargar los voluntarios</h3>
          <p>{{ errorMessage }}</p>
          <button
            class="secondary-button"
            type="button"
            @click="cargarVoluntarios"
          >
            Intentar de nuevo
          </button>
        </div>

        <div v-else-if="voluntariosFiltrados.length === 0" class="empty-state">
          <div class="empty-icon">♟</div>
          <h3>No hay voluntarios para mostrar</h3>
          <p>
            {{
              busqueda
                ? 'No se encontraron voluntarios con esa búsqueda.'
                : 'Los voluntarios activos aparecerán aquí.'
            }}
          </p>
        </div>

        <div v-else class="table-container">
          <table class="voluntarios-table">
            <thead>
              <tr>
                <th>DPI</th>
                <th>Nombre completo</th>
                <th>Dirección</th>
                <th>Municipio</th>
                <th>Departamento</th>
                <th class="actions-heading">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="voluntario in voluntariosFiltrados"
                :key="voluntario.id"
              >
                <td>{{ voluntario.dpi }}</td>
                <td class="name-cell">{{ voluntario.nombre_completo }}</td>
                <td>{{ voluntario.direccion }}</td>
                <td>{{ nombreMunicipio(voluntario) }}</td>
                <td>{{ nombreDepartamento(voluntario) }}</td>
                <td>
                  <div class="row-actions">
                    <button
                      class="text-button"
                      type="button"
                      @click="abrirEdicion(voluntario)"
                    >
                      Editar
                    </button>
                    <button
                      class="text-button danger-button"
                      type="button"
                      :disabled="voluntarioDesactivando === voluntario.id"
                      @click="desactivarVoluntario(voluntario)"
                    >
                      {{
                        voluntarioDesactivando === voluntario.id
                          ? 'Desactivando...'
                          : 'Desactivar'
                      }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div
        v-if="modalAbierto"
        class="modal-backdrop"
        @click.self="cerrarModal"
      >
        <section
          class="volunteer-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="volunteer-modal-title"
        >
          <div class="modal-header">
            <div>
              <span class="section-label">Gestión de voluntarios</span>
              <h2 id="volunteer-modal-title">
                {{ voluntarioEditando ? 'Editar voluntario' : 'Nuevo voluntario' }}
              </h2>
            </div>
            <button
              class="close-button"
              type="button"
              aria-label="Cerrar"
              :disabled="guardando"
              @click="cerrarModal"
            >
              ×
            </button>
          </div>

          <form class="volunteer-form" @submit.prevent="guardarVoluntario">
            <label>
              DPI
              <input
                v-model.trim="form.dpi"
                type="text"
                maxlength="13"
                autocomplete="off"
                required
              />
            </label>

            <label>
              Nombre completo
              <input
                v-model.trim="form.nombre_completo"
                type="text"
                maxlength="200"
                autocomplete="name"
                required
              />
            </label>

            <label>
              Dirección
              <input
                v-model.trim="form.direccion"
                type="text"
                maxlength="255"
                autocomplete="street-address"
                required
              />
            </label>

            <label>
              Departamento
              <select
                v-model="form.codigo_departamento"
                required
                :disabled="
                  cargandoCatalogos ||
                  errorCatalogos !== '' ||
                  departamentos.length === 0
                "
                @change="form.codigo_municipio = ''"
              >
                <option value="" disabled>Selecciona un departamento</option>
                <option
                  v-for="departamento in departamentos"
                  :key="departamento.codigo_departamento"
                  :value="departamento.codigo_departamento"
                >
                  {{ departamento.descripcion }}
                </option>
              </select>
            </label>

            <label>
              Municipio
              <select
                v-model="form.codigo_municipio"
                required
                :disabled="
                  !form.codigo_departamento ||
                  municipiosDelDepartamento.length === 0
                "
              >
                <option value="" disabled>Selecciona un municipio</option>
                <option
                  v-for="municipio in municipiosDelDepartamento"
                  :key="municipio.codigo_municipio"
                  :value="municipio.codigo_municipio"
                >
                  {{ municipio.descripcion }}
                </option>
              </select>
            </label>

            <p v-if="errorCatalogos" class="form-error" role="alert">
              {{ errorCatalogos }}
              <button class="retry-button" type="button" @click="cargarCatalogos">
                Intentar de nuevo
              </button>
            </p>
            <p
              v-else-if="departamentos.length === 0"
              class="location-hint"
            >
              Registra primero un
              <RouterLink to="/departamentos">departamento</RouterLink>
              y sus municipios.
            </p>
            <p
              v-else-if="
                form.codigo_departamento &&
                municipiosDelDepartamento.length === 0
              "
              class="location-hint"
            >
              Este departamento todavía no tiene municipios.
              <RouterLink to="/municipios">Agregar municipios</RouterLink>
            </p>

            <p v-if="formError" class="form-error" role="alert">
              {{ formError }}
            </p>

            <div class="modal-actions">
              <button
                class="secondary-button"
                type="button"
                :disabled="guardando"
                @click="cerrarModal"
              >
                Cancelar
              </button>
              <button class="primary-button" type="submit" :disabled="guardando">
                {{ guardando ? 'Guardando...' : 'Guardar voluntario' }}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.voluntarios-page {
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
  gap: 9px;
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
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.primary-button span {
  font-size: 20px;
  line-height: 1;
}

.primary-button:disabled,
.secondary-button:disabled,
.text-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.secondary-button {
  border: 1px solid #d7e2dd;
  background: white;
  color: #42544b;
}

.content-card {
  overflow: hidden;
  border: 1px solid #e3ebe8;
  border-radius: 18px;
  padding: 28px;
  background: white;
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

.empty-state {
  padding: 48px 20px;
  text-align: center;
}

.empty-icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  margin: 0 auto 14px;
  border-radius: 15px;
  background: #edf6f1;
  color: #65a889;
  font-size: 21px;
  font-weight: 700;
}

.empty-state h3 {
  margin: 0;
  color: #30433c;
  font-size: 17px;
}

.empty-state p {
  margin: 8px 0 0;
  color: #82918a;
  font-size: 14px;
}

.empty-state .secondary-button {
  margin-top: 18px;
}

.table-container {
  overflow-x: auto;
}

.voluntarios-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.voluntarios-table th {
  border-bottom: 1px solid #e7eeea;
  padding: 0 14px 13px;
  color: #82918a;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.7px;
}

.voluntarios-table td {
  border-bottom: 1px solid #edf1ef;
  padding: 16px 14px;
  color: #53645c;
  font-size: 14px;
}

.voluntarios-table tbody tr:last-child td {
  border-bottom: 0;
}

.voluntarios-table .name-cell {
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

.danger-button {
  color: #bf5c5c;
}

.modal-backdrop {
  position: fixed;
  z-index: 20;
  inset: 0;
  display: grid;
  place-items: center;
  overflow-y: auto;
  padding: 20px;
  background: rgba(26, 40, 33, 0.42);
}

.volunteer-modal {
  width: min(100%, 480px);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  border: 1px solid #e3ebe8;
  border-radius: 18px;
  padding: 26px;
  background: white;
  box-shadow: 0 24px 70px rgba(25, 45, 34, 0.2);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
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
  line-height: 1;
  cursor: pointer;
}

.volunteer-form {
  display: grid;
  gap: 16px;
}

.volunteer-form label {
  display: grid;
  gap: 7px;
  color: #52645b;
  font-size: 13px;
  font-weight: 600;
}

.volunteer-form input,
.volunteer-form select {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #dce6e1;
  border-radius: 9px;
  padding: 11px 12px;
  background: white;
  color: #30433c;
  font: inherit;
}

.volunteer-form input:focus,
.volunteer-form select:focus {
  border-color: #6fb98f;
  outline: 2px solid rgba(111, 185, 143, 0.18);
}

.form-error {
  margin: 0;
  color: #b54747;
  font-size: 13px;
}

.location-hint {
  margin: 0;
  color: #71807b;
  font-size: 13px;
}

.location-hint a {
  color: #456b52;
  font-weight: 600;
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
