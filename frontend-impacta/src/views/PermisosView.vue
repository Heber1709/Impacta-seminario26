<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import { apiFetch } from '../services/api'
import {
  type PermissionAction,
  type PermissionSection,
  type UserPermissions,
} from '../services/permissions'

interface Usuario {
  id: string
  nombre: string
  email: string
  rol: string
}

interface PermissionRow {
  key: PermissionSection
  label: string
  usersReadOnly?: boolean
}

const rows: PermissionRow[] = [
  { key: 'beneficiarios', label: 'Beneficiarios' },
  { key: 'voluntarios', label: 'Voluntarios' },
  { key: 'departamentos', label: 'Departamentos' },
  { key: 'municipios', label: 'Municipios' },
  { key: 'donantes', label: 'Donantes' },
  { key: 'donaciones', label: 'Donaciones' },
  { key: 'inventario', label: 'Inventario' },
  { key: 'tipos_movimiento', label: 'Tipos de movimiento' },
  { key: 'campanas', label: 'Campañas' },
  { key: 'usuarios', label: 'Usuarios', usersReadOnly: true },
]

const actions: { key: PermissionAction; label: string }[] = [
  { key: 'consultar', label: 'Consultar' },
  { key: 'agregar', label: 'Agregar' },
  { key: 'editar', label: 'Editar' },
]

const usuarios = ref<Usuario[]>([])
const usuarioId = ref('')
const permisos = ref<UserPermissions>({})
const cargandoUsuarios = ref(true)
const cargandoPermisos = ref(false)
const guardando = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const usuarioSeleccionado = computed(
  () => usuarios.value.find((usuario) => usuario.id === usuarioId.value) ?? null
)

function permisosVacios(): UserPermissions {
  return Object.fromEntries(
    rows.map(({ key }) => [
      key,
      key === 'usuarios'
        ? { consultar: false }
        : { consultar: false, agregar: false, editar: false },
    ])
  ) as UserPermissions
}

async function cargarUsuarios() {
  try {
    cargandoUsuarios.value = true
    errorMessage.value = ''
    const response = await apiFetch('/usuarios')
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'No fue posible cargar los usuarios.')
    }
    usuarios.value = data as Usuario[]
    if (usuarios.value.length > 0 && !usuarioId.value) {
      usuarioId.value = usuarios.value[0].id
    }
  } catch (error) {
    console.error(error)
    errorMessage.value =
      error instanceof Error ? error.message : 'No fue posible cargar los usuarios.'
  } finally {
    cargandoUsuarios.value = false
  }
}

async function cargarPermisos(id: string) {
  if (!id) {
    permisos.value = permisosVacios()
    return
  }

  try {
    cargandoPermisos.value = true
    errorMessage.value = ''
    successMessage.value = ''
    const response = await apiFetch(
      `/usuarios/${encodeURIComponent(id)}/permisos`
    )
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'No fue posible cargar los permisos.')
    }
    permisos.value = { ...permisosVacios(), ...data.permisos }
  } catch (error) {
    console.error(error)
    errorMessage.value =
      error instanceof Error ? error.message : 'No fue posible cargar los permisos.'
  } finally {
    cargandoPermisos.value = false
  }
}

async function guardarPermisos() {
  if (!usuarioId.value || usuarioSeleccionado.value?.rol === 'ADMINISTRADOR') {
    return
  }

  try {
    guardando.value = true
    errorMessage.value = ''
    successMessage.value = ''
    const response = await apiFetch(
      `/usuarios/${encodeURIComponent(usuarioId.value)}/permisos`,
      {
        method: 'PATCH',
        body: JSON.stringify({ permisos: permisos.value }),
      }
    )
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'No fue posible guardar los permisos.')
    }
    successMessage.value = 'Los permisos se guardaron correctamente.'
  } catch (error) {
    console.error(error)
    errorMessage.value =
      error instanceof Error ? error.message : 'No fue posible guardar los permisos.'
  } finally {
    guardando.value = false
  }
}

function cambiarPermiso(
  section: PermissionSection,
  action: PermissionAction,
  event: Event
) {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) {
    return
  }

  const sectionPermissions = { ...(permisos.value[section] ?? {}) }
  sectionPermissions[action] = target.checked
  if (action === 'consultar' && !target.checked) {
    sectionPermissions.agregar = false
    sectionPermissions.editar = false
  } else if (action !== 'consultar' && target.checked) {
    sectionPermissions.consultar = true
  }
  permisos.value = { ...permisos.value, [section]: sectionPermissions }
}

function accionVisible(
  row: PermissionRow,
  action: PermissionAction
): boolean {
  return !row.usersReadOnly || action === 'consultar'
}

onMounted(cargarUsuarios)
watch(usuarioId, (id) => void cargarPermisos(id))
</script>

<template>
  <MainLayout>
    <div class="permissions-page">
      <header class="page-header">
        <div>
          <span class="section-label">ADMINISTRACIÓN</span>
          <h1>Permisos de acceso</h1>
          <p>Define a qué mantenimientos puede ingresar cada usuario y qué acciones puede realizar.</p>
        </div>
      </header>

      <section class="content-card">
        <label class="user-select">
          <span>Usuario</span>
          <select v-model="usuarioId" :disabled="cargandoUsuarios || guardando">
            <option value="" disabled>Selecciona un usuario</option>
            <option v-for="usuario in usuarios" :key="usuario.id" :value="usuario.id">
              {{ usuario.nombre }} — {{ usuario.email }} ({{ usuario.rol }})
            </option>
          </select>
        </label>

        <p v-if="cargandoUsuarios || cargandoPermisos" class="state-message" role="status">
          Cargando permisos...
        </p>

        <template v-else-if="usuarioSeleccionado">
          <div v-if="usuarioSeleccionado.rol === 'ADMINISTRADOR'" class="notice">
            Los administradores siempre tienen acceso completo; esta matriz no limita sus permisos.
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Mantenimiento</th>
                  <th v-for="action in actions" :key="action.key">
                    {{ action.label }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in rows" :key="row.key">
                  <th scope="row">{{ row.label }}</th>
                  <td v-for="action in actions" :key="action.key">
                    <input
                      v-if="accionVisible(row, action.key)"
                      :checked="permisos[row.key]?.[action.key] === true"
                      type="checkbox"
                      :aria-label="`${action.label} ${row.label}`"
                      :disabled="guardando || usuarioSeleccionado.rol === 'ADMINISTRADOR'"
                      @change="cambiarPermiso(row.key, action.key, $event)"
                    />
                    <span v-else class="restricted">Solo administrador</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p class="help-text">
            El permiso de eliminar no se asigna aquí: solo los administradores pueden eliminar registros.
            La administración de cuentas y de permisos también queda reservada a administradores.
          </p>

          <p v-if="successMessage" class="success-message" role="status">
            {{ successMessage }}
          </p>
          <p v-if="errorMessage" class="error-message" role="alert">
            {{ errorMessage }}
          </p>

          <div class="form-actions">
            <button
              class="primary-button"
              type="button"
              :disabled="guardando || usuarioSeleccionado.rol === 'ADMINISTRADOR'"
              @click="guardarPermisos"
            >
              {{ guardando ? 'Guardando...' : 'Guardar permisos' }}
            </button>
          </div>
        </template>

        <p v-else-if="!errorMessage" class="state-message">
          No hay usuarios activos para asignar permisos.
        </p>
        <p v-if="errorMessage && !usuarioSeleccionado" class="error-message" role="alert">
          {{ errorMessage }}
        </p>
      </section>
    </div>
  </MainLayout>
</template>

<style scoped>
.permissions-page {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 28px;
}

.section-label {
  color: #65a889;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
}

h1 {
  margin: 8px 0;
}

.content-card {
  padding: 28px;
  background: white;
  border: 1px solid #e3e8e5;
  border-radius: 18px;
}

.user-select {
  display: grid;
  gap: 8px;
  max-width: 560px;
  margin-bottom: 24px;
  font-weight: 600;
}

select {
  padding: 12px;
  border: 1px solid #d5ded9;
  border-radius: 8px;
  background: white;
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

th,
td {
  padding: 14px 12px;
  border-bottom: 1px solid #edf0ee;
}

td {
  text-align: center;
}

input[type='checkbox'] {
  width: 18px;
  height: 18px;
  accent-color: #4c9870;
}

.notice,
.help-text,
.state-message {
  margin: 0 0 18px;
  color: #69756f;
  line-height: 1.5;
}

.notice {
  padding: 12px 14px;
  background: #eff8f2;
  border-radius: 8px;
}

.restricted {
  color: #828b86;
  font-size: 12px;
}

.help-text {
  margin-top: 18px;
  font-size: 13px;
}

.success-message {
  color: #247447;
}

.error-message {
  color: #b42318;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.primary-button {
  padding: 12px 18px;
  border: 0;
  border-radius: 8px;
  background: #70be91;
  color: white;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.primary-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
