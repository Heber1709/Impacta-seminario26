<template>
  <MainLayout>
    <div class="types-page">
      <header class="page-header">
        <div>
          <span class="eyebrow">CONFIGURACIÓN DE INVENTARIO</span>
          <h1>Tipos de movimiento</h1>
          <p>Define los movimientos y cómo afectan las existencias.</p>
        </div>
        <button
          v-if="can('tipos_movimiento', 'agregar')"
          class="primary-button"
          type="button"
          @click="iniciarNuevo"
        >
          + Nuevo tipo
        </button>
      </header>

      <section class="content-card">
        <div class="card-header">
          <div>
            <h2>Tipos registrados</h2>
            <p>El signo + suma y el signo − resta existencias.</p>
          </div>
          <input
            v-model="busqueda"
            class="search-input"
            type="search"
            placeholder="Buscar tipo..."
            aria-label="Buscar tipos de movimiento"
          />
        </div>

        <p v-if="cargando" class="state-message" role="status">
          Cargando tipos de movimiento...
        </p>
        <p v-else-if="error" class="state-message error-state" role="alert">
          {{ error }}
        </p>
        <div v-else-if="tiposFiltrados.length" class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th>Operación</th>
                <th v-if="can('tipos_movimiento', 'editar') || isAdministrator()">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tipo in tiposFiltrados" :key="tipo.codigo">
                <td>{{ tipo.codigo }}</td>
                <td>{{ tipo.descripcion }}</td>
                <td>
                  <span :class="tipo.signo === '+' ? 'sign-add' : 'sign-subtract'">
                    {{ tipo.signo }} {{ tipo.signo === '+' ? 'Suma' : 'Resta' }}
                  </span>
                </td>
                <td v-if="can('tipos_movimiento', 'editar') || isAdministrator()">
                  <button
                    v-if="can('tipos_movimiento', 'editar')"
                    class="text-button"
                    type="button"
                    @click="iniciarEdicion(tipo)"
                  >
                    Editar
                  </button>
                  <button
                    v-if="isAdministrator() && tipo.codigo !== 'ENTRADA' && tipo.codigo !== 'SALIDA'"
                    class="text-button danger-button"
                    type="button"
                    :disabled="desactivando === tipo.codigo"
                    @click="desactivar(tipo)"
                  >
                    {{ desactivando === tipo.codigo ? 'Desactivando...' : 'Desactivar' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty-state">
          <h3>{{ busqueda ? 'No se encontraron tipos' : 'No hay tipos registrados' }}</h3>
          <p>
            {{
              busqueda
                ? 'Prueba con otro código o descripción.'
                : 'Los tipos registrados aparecerán aquí.'
            }}
          </p>
        </div>
      </section>

      <div v-if="formularioAbierto" class="modal-backdrop" @click.self="cerrarFormulario">
        <section class="form-card" role="dialog" aria-modal="true" aria-labelledby="form-title">
          <h2 id="form-title">{{ tipoEditando ? 'Editar tipo' : 'Nuevo tipo' }}</h2>
          <form @submit.prevent="guardar">
            <label class="form-group">
              <span>Código</span>
              <input
                v-model.trim="formulario.codigo"
                required
                maxlength="30"
                pattern="[A-Z0-9_-]+"
                :disabled="Boolean(tipoEditando)"
                placeholder="Ej. ENTRADA"
              />
              <small>Usa letras mayúsculas, números, guion o guion bajo.</small>
            </label>
            <label class="form-group">
              <span>Descripción</span>
              <input
                v-model.trim="formulario.descripcion"
                required
                maxlength="100"
                placeholder="Ej. Entrada"
              />
            </label>
            <label class="form-group">
              <span>Operación sobre existencias</span>
              <select v-model="formulario.signo" required>
                <option value="+">+ Suma existencias</option>
                <option value="-">− Resta existencias</option>
              </select>
            </label>
            <p v-if="errorFormulario" class="error-message" role="alert">
              {{ errorFormulario }}
            </p>
            <div class="form-actions">
              <button class="secondary-button" type="button" @click="cerrarFormulario">
                Cancelar
              </button>
              <button class="primary-button" type="submit" :disabled="guardando">
                {{ guardando ? 'Guardando...' : 'Guardar tipo' }}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import { apiFetch } from '../services/api'
import { hasPermission as can, isAdministrator } from '../services/permissions'

interface TipoMovimiento {
  codigo: string
  descripcion: string
  signo: '+' | '-'
}

const tipos = ref<TipoMovimiento[]>([])
const busqueda = ref('')
const cargando = ref(true)
const error = ref('')
const errorFormulario = ref('')
const formularioAbierto = ref(false)
const guardando = ref(false)
const desactivando = ref('')
const tipoEditando = ref('')
const formulario = ref({ codigo: '', descripcion: '', signo: '+' as '+' | '-' })

const tiposFiltrados = computed(() => {
  const texto = busqueda.value.trim().toLocaleLowerCase()
  if (!texto) return tipos.value
  return tipos.value.filter((tipo) =>
    `${tipo.codigo} ${tipo.descripcion}`.toLocaleLowerCase().includes(texto)
  )
})

async function cargarTipos() {
  try {
    cargando.value = true
    error.value = ''
    const response = await apiFetch('/tipos-movimiento')
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'No fue posible cargar los tipos de movimiento.')
    }
    tipos.value = data as TipoMovimiento[]
  } catch (cause) {
    console.error('Error al cargar los tipos de movimiento:', cause)
    error.value =
      cause instanceof Error
        ? cause.message
        : 'No fue posible cargar los tipos de movimiento.'
  } finally {
    cargando.value = false
  }
}

function iniciarNuevo() {
  tipoEditando.value = ''
  formulario.value = { codigo: '', descripcion: '', signo: '+' }
  errorFormulario.value = ''
  formularioAbierto.value = true
}

function iniciarEdicion(tipo: TipoMovimiento) {
  tipoEditando.value = tipo.codigo
  formulario.value = { ...tipo }
  errorFormulario.value = ''
  formularioAbierto.value = true
}

function cerrarFormulario() {
  if (guardando.value) return
  formularioAbierto.value = false
}

async function guardar() {
  try {
    guardando.value = true
    errorFormulario.value = ''
    const actualizando = Boolean(tipoEditando.value)
    const response = await apiFetch(
      actualizando
        ? `/tipos-movimiento/${encodeURIComponent(tipoEditando.value)}`
        : '/tipos-movimiento',
      {
        method: actualizando ? 'PATCH' : 'POST',
        body: JSON.stringify({
          codigo: formulario.value.codigo.toLocaleUpperCase(),
          descripcion: formulario.value.descripcion,
          signo: formulario.value.signo,
        }),
      }
    )
    const data = await response.json()
    if (!response.ok) {
      throw new Error(
        Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'No fue posible guardar el tipo de movimiento.'
      )
    }
    formularioAbierto.value = false
    await cargarTipos()
  } catch (cause) {
    console.error('Error al guardar el tipo de movimiento:', cause)
    errorFormulario.value =
      cause instanceof Error
        ? cause.message
        : 'No fue posible guardar el tipo de movimiento.'
  } finally {
    guardando.value = false
  }
}

async function desactivar(tipo: TipoMovimiento) {
  if (!window.confirm(`¿Deseas desactivar el tipo ${tipo.descripcion}?`)) return

  try {
    desactivando.value = tipo.codigo
    error.value = ''
    const response = await apiFetch(
      `/tipos-movimiento/${encodeURIComponent(tipo.codigo)}`,
      { method: 'DELETE' }
    )
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'No fue posible desactivar el tipo.')
    }
    await cargarTipos()
  } catch (cause) {
    console.error('Error al desactivar el tipo de movimiento:', cause)
    error.value =
      cause instanceof Error ? cause.message : 'No fue posible desactivar el tipo.'
  } finally {
    desactivando.value = ''
  }
}

onMounted(cargarTipos)
</script>

<style scoped>
.types-page {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
}

.page-header,
.card-header,
.form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.page-header {
  margin-bottom: 28px;
}

.eyebrow {
  color: #5f9b7c;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
}

.page-header h1 {
  margin: 8px 0;
  color: #193b35;
}

.page-header p,
.card-header p {
  margin: 0;
  color: #697773;
}

.content-card,
.form-card {
  padding: 28px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 8px 24px rgb(21 53 45 / 7%);
}

.card-header {
  margin-bottom: 20px;
}

.search-input,
.form-group input,
.form-group select {
  width: 100%;
  box-sizing: border-box;
  padding: 11px 13px;
  border: 1px solid #dce5e1;
  border-radius: 8px;
  font: inherit;
}

.search-input {
  max-width: 280px;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th,
td {
  padding: 14px 12px;
  border-bottom: 1px solid #edf1ef;
}

th {
  color: #687771;
  font-size: 13px;
}

.sign-add {
  color: #23764f;
  font-weight: 700;
}

.sign-subtract {
  color: #a84646;
  font-weight: 700;
}

.text-button {
  margin-right: 12px;
  border: 0;
  background: transparent;
  color: #26734d;
  cursor: pointer;
  font: inherit;
  font-weight: 600;
}

.danger-button {
  color: #a84646;
}

.primary-button,
.secondary-button {
  border: 0;
  border-radius: 9px;
  padding: 12px 18px;
  color: white;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}

.primary-button {
  background: #6fbf9b;
}

.secondary-button {
  background: #718078;
}

.primary-button:disabled,
.danger-button:disabled {
  cursor: wait;
  opacity: 0.6;
}

.modal-backdrop {
  position: fixed;
  z-index: 10;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgb(12 35 30 / 45%);
}

.form-card {
  width: min(100%, 520px);
}

.form-card h2 {
  margin-top: 0;
  color: #193b35;
}

.form-card form {
  display: grid;
  gap: 18px;
}

.form-group {
  display: grid;
  gap: 7px;
  color: #34433d;
  font-weight: 600;
}

.form-group small {
  color: #697773;
  font-weight: 400;
}

.form-actions {
  justify-content: flex-end;
  margin-top: 4px;
}

.error-message,
.error-state {
  color: #a84646;
}

.empty-state {
  padding: 42px 16px;
  text-align: center;
  color: #697773;
}

@media (max-width: 700px) {
  .page-header,
  .card-header {
    align-items: stretch;
    flex-direction: column;
  }

  .search-input {
    max-width: none;
  }
}
</style>
