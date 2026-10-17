ç<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import { apiFetch } from '../services/api'

const router = useRouter()
const route = useRoute()
const beneficiarioId =
  typeof route.params.id === 'string' ? route.params.id : ''
const editando = Boolean(beneficiarioId)

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
const cargandoUbicaciones = ref(true)
const errorUbicaciones = ref('')
const errorBeneficiario = ref('')
const avisoUbicacion = ref('')
const cargandoBeneficiario = ref(false)
const guardando = ref(false)

const formulario = reactive({
  dpi: '',
  nombre_completo: '',
  direccion: '',
  codigo_municipio: '',
  codigo_departamento: '',
  integrantes_hogar: 1
})

const municipiosDelDepartamento = () =>
  municipios.value.filter(
    (municipio) =>
      municipio.codigo_departamento === formulario.codigo_departamento
  )

async function cargarUbicaciones() {
  try {
    cargandoUbicaciones.value = true
    errorUbicaciones.value = ''

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
        departamentosData.message || 'No fue posible cargar los departamentos.'
      )
    }
    if (!municipiosResponse.ok) {
      throw new Error(
        municipiosData.message || 'No fue posible cargar los municipios.'
      )
    }

    departamentos.value = departamentosData as Departamento[]
    municipios.value = municipiosData as Municipio[]
  } catch (error) {
    console.error(error)
    errorUbicaciones.value =
      error instanceof Error
        ? error.message
        : 'No fue posible cargar los catálogos de ubicación.'
  } finally {
    cargandoUbicaciones.value = false
  }
}

function cambiarDepartamento() {
  formulario.codigo_municipio = ''
}

function volver() {
  router.push('/beneficiarios')
}

async function cargarBeneficiario() {
  try {
    cargandoBeneficiario.value = true
    errorBeneficiario.value = ''
    const response = await apiFetch(
      `/beneficiarios/${encodeURIComponent(beneficiarioId)}`
    )
    const data = await response.json()
    if (!response.ok) {
      throw new Error(
        data.message || 'No fue posible cargar el beneficiario.'
      )
    }

    const departamento =
      departamentos.value.find(
        (item) => item.codigo_departamento === data.codigo_departamento
      )
    const municipio =
      municipios.value.find(
        (item) =>
          item.codigo_municipio === data.codigo_municipio &&
          item.codigo_departamento === departamento?.codigo_departamento
      )

    formulario.dpi = data.dpi
    formulario.nombre_completo = data.nombre_completo
    formulario.direccion = data.direccion
    formulario.integrantes_hogar = data.integrantes_hogar
    formulario.codigo_departamento = departamento?.codigo_departamento ?? ''
    formulario.codigo_municipio = municipio?.codigo_municipio ?? ''
    avisoUbicacion.value =
      !departamento || !municipio
        ? 'Este registro todavía no tiene una ubicación asociada a los catálogos. Selecciona un departamento y municipio antes de guardar.'
        : ''
  } catch (error) {
    console.error(error)
    errorBeneficiario.value =
      error instanceof Error
        ? error.message
        : 'No fue posible cargar el beneficiario.'
  } finally {
    cargandoBeneficiario.value = false
  }
}

async function guardarBeneficiario() {
  try {
    guardando.value = true
    errorBeneficiario.value = ''
    const departamento = departamentos.value.find(
      (item) => item.codigo_departamento === formulario.codigo_departamento
    )
    const municipio = municipiosDelDepartamento().find(
      (item) => item.codigo_municipio === formulario.codigo_municipio
    )
    if (!departamento || !municipio) {
      throw new Error('Selecciona un departamento y un municipio válidos.')
    }

    const response = await apiFetch(
      editando
        ? `/beneficiarios/${encodeURIComponent(beneficiarioId)}`
        : '/beneficiarios',
      {
        method: editando ? 'PATCH' : 'POST',
        body: JSON.stringify(formulario)
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'No fue posible guardar el beneficiario.')
    }

    alert(
      editando
        ? 'Beneficiario actualizado correctamente.'
        : 'Beneficiario guardado correctamente.'
    )
    router.push('/beneficiarios')

  } catch (error) {
    console.error(error)

    errorBeneficiario.value =
      error instanceof Error
        ? error.message
        : 'No fue posible guardar el beneficiario.'
  } finally {
    guardando.value = false
  }
}    

onMounted(async () => {
  await cargarUbicaciones()
  if (editando && !errorUbicaciones.value) {
    await cargarBeneficiario()
  }
})

</script>

<template>
  <MainLayout>
    <div class="beneficiario-page">

      <!-- ENCABEZADO -->
      <div class="page-header">
        <div>
          <span class="section-label">GESTIÓN</span>
          <h1>{{ editando ? 'Editar beneficiario' : 'Nuevo beneficiario' }}</h1>
          <p>
            {{
              editando
                ? 'Actualiza la información del beneficiario.'
                : 'Registra la información de una persona beneficiada por Impacta.'
            }}
          </p>
        </div>

        <div class="header-actions">
          <button class="btn-secondary" type="button" @click="volver">
            Cancelar
          </button>

          <button
            class="btn-primary"
            type="button"
            :disabled="guardando || cargandoUbicaciones || cargandoBeneficiario"
            @click="guardarBeneficiario"
          >
            {{
              guardando
                ? 'Guardando...'
                : editando
                  ? 'Guardar cambios'
                  : 'Guardar beneficiario'
            }}
          </button>
        </div>
      </div>

      <!-- FORMULARIO -->
      <form class="form-container" @submit.prevent="guardarBeneficiario">
        <div v-if="errorBeneficiario" class="location-error" role="alert">
          {{ errorBeneficiario }}
        </div>
        <div v-if="avisoUbicacion" class="location-hint" role="status">
          {{ avisoUbicacion }}
        </div>
        <div v-if="cargandoBeneficiario" class="location-hint" role="status">
          Cargando información del beneficiario...
        </div>

        <!-- INFORMACIÓN PERSONAL -->
        <section class="form-card">
          <div class="card-title">
            <h2>Información personal</h2>
            <p>Ingresa los datos principales del beneficiario.</p>
          </div>

          <div class="form-grid">

            <div class="form-group">
              <label for="dpi">DPI</label>
              <input
                id="dpi"
                v-model="formulario.dpi"
                type="text"
                maxlength="13"
                placeholder="Ej. 1234567890101"
              />
              <span class="input-help">
                Máximo 13 caracteres.
              </span>
            </div>

            <div class="form-group">
              <label for="nombre">Nombre completo</label>
              <input
                id="nombre"
                v-model="formulario.nombre_completo"
                type="text"
                maxlength="200"
                placeholder="Nombre completo del beneficiario"
              />
            </div>

          </div>
        </section>

        <!-- UBICACIÓN -->
        <section class="form-card">
          <div class="card-title">
            <h2>Ubicación</h2>
            <p>Información del lugar donde reside el beneficiario.</p>
          </div>

          <div class="form-grid">

            <div class="form-group full-width">
              <label for="direccion">Dirección</label>
              <input
                id="direccion"
                v-model="formulario.direccion"
                type="text"
                maxlength="255"
                placeholder="Dirección de residencia"
              />
            </div>

            <div class="form-group">
              <label for="municipio">Municipio</label>
              <select
                id="municipio"
                v-model="formulario.codigo_municipio"
                :disabled="cargandoUbicaciones || !formulario.codigo_departamento"
                required
              >
                <option value="" disabled>
                  {{
                    cargandoUbicaciones
                      ? 'Cargando municipios...'
                      : 'Selecciona un municipio'
                  }}
                </option>
                <option
                  v-for="municipio in municipiosDelDepartamento()"
                  :key="municipio.codigo_municipio"
                  :value="municipio.codigo_municipio"
                >
                  {{ municipio.descripcion }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="departamento">Departamento</label>
              <select
                id="departamento"
                v-model="formulario.codigo_departamento"
                :disabled="cargandoUbicaciones"
                required
                @change="cambiarDepartamento"
              >
                <option value="" disabled>
                  {{
                    cargandoUbicaciones
                      ? 'Cargando departamentos...'
                      : 'Selecciona un departamento'
                  }}
                </option>
                <option
                  v-for="departamento in departamentos"
                  :key="departamento.codigo_departamento"
                  :value="departamento.codigo_departamento"
                >
                  {{ departamento.descripcion }}
                </option>
              </select>
            </div>

          </div>
          <p v-if="errorUbicaciones" class="location-error" role="alert">
            {{ errorUbicaciones }}
            <button type="button" class="retry-button" @click="cargarUbicaciones">
              Intentar de nuevo
            </button>
          </p>
          <p
            v-else-if="!cargandoUbicaciones && departamentos.length === 0"
            class="location-hint"
          >
            Registra primero un
            <RouterLink to="/departamentos">departamento</RouterLink>
            y sus municipios.
          </p>
          <p
            v-else-if="
              formulario.codigo_departamento &&
              municipiosDelDepartamento().length === 0
            "
            class="location-hint"
          >
            Este departamento todavía no tiene municipios.
            <RouterLink to="/municipios">Agregar municipios</RouterLink>
          </p>
        </section>

        <!-- INFORMACIÓN DEL HOGAR -->
        <section class="form-card">
          <div class="card-title">
            <h2>Información del hogar</h2>
            <p>Indica cuántas personas integran el hogar.</p>
          </div>

          <div class="form-grid">

            <div class="form-group">
              <label for="integrantes">
                Integrantes del hogar
              </label>

              <input
                id="integrantes"
                v-model.number="formulario.integrantes_hogar"
                type="number"
                min="1"
                placeholder="Ej. 4"
              />

              <span class="input-help">
                Debe ser como mínimo 1 persona.
              </span>
            </div>

          </div>
        </section>

      </form>

    </div>
  </MainLayout>
</template>

<style scoped>
.beneficiario-page {
  width: 100%;
}

/* ENCABEZADO */

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  margin-bottom: 28px;
}

.section-label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: #6f7f72;
  margin-bottom: 8px;
}

.page-header h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #26362d;
}

.page-header p {
  margin: 8px 0 0;
  color: #748078;
  font-size: 15px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* BOTONES */

button {
  border: none;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 9px;
  padding: 12px 18px;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #456b52;
  color: white;
}

.btn-primary:hover {
  background: #385a44;
}

.btn-secondary {
  background: white;
  color: #526158;
  border: 1px solid #d8dfda;
}

.btn-secondary:hover {
  background: #f5f7f5;
}

/* FORMULARIO */

.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-card {
  background: white;
  border: 1px solid #e4e9e5;
  border-radius: 14px;
  padding: 26px 28px;
  box-shadow: 0 3px 12px rgba(39, 55, 45, 0.04);
}

.card-title {
  margin-bottom: 24px;
}

.card-title h2 {
  margin: 0;
  font-size: 18px;
  color: #2d3d33;
}

.card-title p {
  margin: 6px 0 0;
  font-size: 14px;
  color: #7b857e;
}

/* CAMPOS */

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #445149;
  margin-bottom: 8px;
}

.form-group input,
.form-group select {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border: 1px solid #d8dfda;
  border-radius: 8px;
  background: #fcfdfc;
  color: #2e3932;
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #71927b;
  box-shadow: 0 0 0 3px rgba(69, 107, 82, 0.08);
  background: white;
}

.form-group input::placeholder {
  color: #a4aca6;
}

.location-error {
  margin: 18px 0 0;
  color: #b54747;
  font-size: 13px;
}

.location-hint {
  margin: 18px 0 0;
  color: #71807b;
  font-size: 13px;
}

.location-hint a {
  color: #456b52;
  font-weight: 600;
}

.retry-button {
  margin-left: 8px;
  padding: 0;
  background: none;
  color: #456b52;
  text-decoration: underline;
}

.input-help {
  margin-top: 6px;
  font-size: 11px;
  color: #89928c;
}

/* RESPONSIVE */

@media (max-width: 800px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .full-width {
    grid-column: auto;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions button {
    flex: 1;
  }
}
</style>
