<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import { apiFetch } from '../services/api'
import { isAdministrator } from '../services/permissions'

type RolUsuario = 'ADMINISTRADOR' | 'COORDINADOR' | 'VOLUNTARIO'

interface Usuario {
  id: string
  email: string
  nombre: string
  rol: RolUsuario
}

interface UsuarioForm {
  email: string
  nombre: string
  rol: RolUsuario
}

const usuarios = ref<Usuario[]>([])
const busqueda = ref('')
const cargando = ref(true)
const guardando = ref(false)
const errorMessage = ref('')
const formError = ref('')
const modalAbierto = ref(false)
const usuarioEditando = ref<Usuario | null>(null)
const usuarioDesactivando = ref<string | null>(null)
const form = ref<UsuarioForm>(nuevoFormulario())

function nuevoFormulario(): UsuarioForm {
  return {
    email: '',
    nombre: '',
    rol: 'VOLUNTARIO',
  }
}

const usuariosFiltrados = computed(() => {
  const texto = busqueda.value.toLowerCase().trim()

  if (!texto) {
    return usuarios.value
  }

  return usuarios.value.filter((usuario) =>
    usuario.nombre.toLowerCase().includes(texto) ||
    usuario.email.toLowerCase().includes(texto) ||
    usuario.rol.toLowerCase().includes(texto)
  )
})

async function cargarUsuarios() {
  try {
    cargando.value = true
    errorMessage.value = ''

    const response = await apiFetch('/usuarios')
    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'No fue posible cargar los usuarios.'
      )
    }

    usuarios.value = data as Usuario[]
  } catch (error) {
    console.error(error)
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'No fue posible cargar los usuarios.'
  } finally {
    cargando.value = false
  }
}

function abrirCrear() {
  usuarioEditando.value = null
  form.value = nuevoFormulario()
  formError.value = ''
  modalAbierto.value = true
}

function abrirEdicion(usuario: Usuario) {
  usuarioEditando.value = usuario
  form.value = {
    email: usuario.email,
    nombre: usuario.nombre,
    rol: usuario.rol,
  }
  formError.value = ''
  modalAbierto.value = true
}

function cerrarModal() {
  if (!guardando.value) {
    modalAbierto.value = false
  }
}

async function guardarUsuario() {
  try {
    guardando.value = true
    formError.value = ''

    const editando = usuarioEditando.value
    const response = await apiFetch(
      editando ? `/usuarios/${encodeURIComponent(editando.id)}` : '/usuarios',
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
          : 'No fue posible guardar el usuario.'
      )
    }

    modalAbierto.value = false
    await cargarUsuarios()
  } catch (error) {
    console.error(error)
    formError.value =
      error instanceof Error
        ? error.message
        : 'No fue posible guardar el usuario.'
  } finally {
    guardando.value = false
  }
}

async function desactivarUsuario(usuario: Usuario) {
  if (!window.confirm(`¿Deseas desactivar el acceso de ${usuario.nombre}?`)) {
    return
  }

  try {
    usuarioDesactivando.value = usuario.id
    errorMessage.value = ''

    const response = await apiFetch(
      `/usuarios/${encodeURIComponent(usuario.id)}`,
      { method: 'DELETE' }
    )
    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : 'No fue posible desactivar el usuario.'
      )
    }

    await cargarUsuarios()
  } catch (error) {
    console.error(error)
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'No fue posible desactivar el usuario.'
  } finally {
    usuarioDesactivando.value = null
  }
}

onMounted(cargarUsuarios)
</script>

<template>
  <MainLayout>
    <div class="usuarios-page">
      <div class="page-header">
        <div>
          <span class="section-label">Gestión</span>
          <h1>Usuarios</h1>
          <p>Administra las cuentas y los permisos de acceso a Impacta.</p>
        </div>

        <button v-if="isAdministrator()" class="primary-button" type="button" @click="abrirCrear">
          <span>+</span>
          Nuevo usuario
        </button>
      </div>

      <div class="content-card">
        <div class="card-toolbar">
          <div>
            <h2>Listado de usuarios</h2>
            <p>Usuarios activos registrados en el sistema</p>
          </div>

          <label class="search-box">
            <span aria-hidden="true">⌕</span>
            <input
              v-model="busqueda"
              type="search"
              placeholder="Buscar usuario..."
              aria-label="Buscar usuarios"
            />
          </label>
        </div>

        <div v-if="cargando" class="empty-state">
          <div class="empty-icon">...</div>
          <h3>Cargando usuarios</h3>
          <p>Consultando las cuentas registradas.</p>
        </div>

        <div v-else-if="errorMessage" class="empty-state">
          <div class="empty-icon">!</div>
          <h3>No fue posible cargar los usuarios</h3>
          <p>{{ errorMessage }}</p>
          <button class="secondary-button" type="button" @click="cargarUsuarios">
            Intentar de nuevo
          </button>
        </div>

        <div v-else-if="usuariosFiltrados.length === 0" class="empty-state">
          <div class="empty-icon">♙</div>
          <h3>No hay usuarios para mostrar</h3>
          <p>
            {{
              busqueda
                ? 'No se encontraron usuarios con esa búsqueda.'
                : 'Los usuarios activos aparecerán aquí.'
            }}
          </p>
        </div>

        <div v-else class="table-container">
          <table class="usuarios-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th v-if="isAdministrator()" class="actions-heading">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="usuario in usuariosFiltrados" :key="usuario.id">
                <td class="name-cell">{{ usuario.nombre }}</td>
                <td>{{ usuario.email }}</td>
                <td v-if="isAdministrator()">
                  <span class="role-badge" :class="`role-${usuario.rol.toLowerCase()}`">
                    {{ usuario.rol }}
                  </span>
                </td>
                <td>
                  <div class="row-actions">
                    <button
                      class="text-button"
                      type="button"
                      @click="abrirEdicion(usuario)"
                    >
                      Editar
                    </button>
                    <button
                      class="text-button danger-button"
                      type="button"
                      :disabled="usuarioDesactivando === usuario.id"
                      @click="desactivarUsuario(usuario)"
                    >
                      {{
                        usuarioDesactivando === usuario.id
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

      <div v-if="modalAbierto" class="modal-backdrop" @click.self="cerrarModal">
        <section
          class="user-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="user-modal-title"
        >
          <div class="modal-header">
            <div>
              <span class="section-label">Gestión de acceso</span>
              <h2 id="user-modal-title">
                {{ usuarioEditando ? 'Editar usuario' : 'Nuevo usuario' }}
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

          <form class="user-form" @submit.prevent="guardarUsuario">
            <label>
              Nombre
              <input
                v-model.trim="form.nombre"
                type="text"
                maxlength="150"
                autocomplete="name"
                required
              />
            </label>

            <label>
              Correo electrónico
              <input
                v-model.trim="form.email"
                type="email"
                maxlength="255"
                autocomplete="email"
                required
              />
            </label>

            <label>
              Rol
              <select v-model="form.rol" required>
                <option value="VOLUNTARIO">Voluntario</option>
                <option value="COORDINADOR">Coordinador</option>
                <option value="ADMINISTRADOR">Administrador</option>
              </select>
            </label>

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
                {{ guardando ? 'Guardando...' : 'Guardar usuario' }}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.usuarios-page {
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

.usuarios-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.usuarios-table th {
  border-bottom: 1px solid #e7eeea;
  padding: 0 14px 13px;
  color: #82918a;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.7px;
}

.usuarios-table td {
  border-bottom: 1px solid #edf1ef;
  padding: 16px 14px;
  color: #53645c;
  font-size: 14px;
}

.usuarios-table tbody tr:last-child td {
  border-bottom: 0;
}

.usuarios-table .name-cell {
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

.role-badge {
  display: inline-block;
  border-radius: 999px;
  padding: 5px 9px;
  background: #edf6f1;
  color: #4a8766;
  font-size: 11px;
  font-weight: 700;
}

.role-administrador {
  background: #f0edfa;
  color: #6957a5;
}

.role-coordinador {
  background: #fff5e7;
  color: #a57732;
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

.user-modal {
  width: min(100%, 480px);
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

.user-form {
  display: grid;
  gap: 16px;
}

.user-form label {
  display: grid;
  gap: 7px;
  color: #52645b;
  font-size: 13px;
  font-weight: 600;
}

.user-form input,
.user-form select {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #dce6e1;
  border-radius: 9px;
  padding: 11px 12px;
  background: white;
  color: #30433c;
  font: inherit;
}

.user-form input:focus,
.user-form select:focus {
  border-color: #6fb98f;
  outline: 2px solid rgba(111, 185, 143, 0.18);
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