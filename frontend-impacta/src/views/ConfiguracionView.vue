<template>
  <MainLayout>
    <div class="config-page">

      <div class="page-header">
        <div>
          <span class="eyebrow">CONFIGURACIÓN</span>
          <h1>Mi cuenta</h1>
          <p>Consulta y actualiza la información de tu usuario.</p>
        </div>
      </div>

      <div class="config-card">

        <div class="profile-header">
          <div class="profile-icon">
            {{ inicial }}
          </div>

          <div>
            <h2>{{ usuario.nombre }}</h2>
            <p>{{ usuario.rol }}</p>
          </div>
        </div>

        <div class="form-grid">

          <div class="form-group full-width">
            <label>Nombre completo</label>
            <input
              v-model="formulario.nombre"
              type="text"
              maxlength="150"
              placeholder="Ingresa tu nombre"
            />
          </div>

          <div class="form-group">
            <label>Correo electrónico</label>
            <input
              :value="usuario.email"
              type="email"
              disabled
            />
            <small>El correo está asociado a tu cuenta de Google.</small>
          </div>

          <div class="form-group">
            <label>Rol</label>
            <input
              :value="usuario.rol"
              type="text"
              disabled
            />
            <small>El rol es administrado por el sistema.</small>
          </div>

        </div>

        <div v-if="mensaje" :class="['mensaje', tipoMensaje]">
          {{ mensaje }}
        </div>

        <div class="form-actions">
          <button
            type="button"
            class="btn-secondary"
            @click="cargarDatos"
          >
            Cancelar
          </button>

          <button
            type="button"
            class="btn-primary"
            :disabled="guardando"
            @click="guardarCambios"
          >
            {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>

      </div>

    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import { apiFetch } from '../services/api'

interface Usuario {
  id: string
  nombre: string
  email: string
  rol: string
}

const usuario = ref<Usuario>({
  id: '',
  nombre: '',
  email: '',
  rol: ''
})

const formulario = ref({
  nombre: ''
})

const guardando = ref(false)
const mensaje = ref('')
const tipoMensaje = ref<'success' | 'error'>('error')

const inicial = computed(() => {
  return usuario.value.nombre
    ? usuario.value.nombre.charAt(0).toUpperCase()
    : '?'
})

function cargarDatos() {
  const usuarioGuardado = localStorage.getItem('usuario')

  if (!usuarioGuardado) {
    mensaje.value = 'No se encontró la información del usuario.'
    tipoMensaje.value = 'error'
    return
  }

  try {
    const datos = JSON.parse(usuarioGuardado)

    usuario.value = {
      id: datos.id,
      nombre: datos.nombre,
      email: datos.email,
      rol: datos.rol
    }

    formulario.value.nombre = datos.nombre
    mensaje.value = ''
  } catch (error) {
    console.error(error)

    mensaje.value = 'No fue posible cargar la información del usuario.'
    tipoMensaje.value = 'error'
  }
}

async function guardarCambios() {
  mensaje.value = ''

  if (!formulario.value.nombre.trim()) {
    mensaje.value = 'El nombre es obligatorio.'
    tipoMensaje.value = 'error'
    return
  }

  try {
    guardando.value = true

    const response = await apiFetch(`/usuarios/${usuario.value.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        nombre: formulario.value.nombre.trim()
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'No fue posible actualizar el usuario.'
      )
    }

    usuario.value = {
      id: data.id,
      nombre: data.nombre,
      email: data.email,
      rol: data.rol
    }

    formulario.value.nombre = data.nombre

    localStorage.setItem('usuario', JSON.stringify(usuario.value))

    tipoMensaje.value = 'success'
    mensaje.value = 'Información actualizada correctamente.'
  } catch (error) {
    console.error(error)

    tipoMensaje.value = 'error'
    mensaje.value =
      error instanceof Error
        ? error.message
        : 'No fue posible actualizar la información.'
  } finally {
    guardando.value = false
  }
}

cargarDatos()
</script>

<style scoped>
.config-page {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 48px 60px;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 34px;
}

.eyebrow {
  display: block;
  margin-bottom: 10px;
  color: #6fbf9c;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
}

.page-header h1 {
  margin: 0 0 10px;
  font-size: 42px;
  color: #18202b;
}

.page-header p {
  margin: 0;
  color: #8a939c;
  font-size: 16px;
}

.config-card {
  background: #ffffff;
  border: 1px solid #e8ece9;
  border-radius: 24px;
  padding: 36px;
  box-shadow: 0 10px 30px rgba(20, 50, 40, 0.05);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 18px;
  padding-bottom: 30px;
  margin-bottom: 30px;
  border-bottom: 1px solid #edf0ee;
}

.profile-icon {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: #73c59f;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 25px;
  font-weight: 700;
}

.profile-header h2 {
  margin: 0 0 5px;
  color: #18202b;
  font-size: 22px;
}

.profile-header p {
  margin: 0;
  color: #7f898f;
  font-size: 14px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.full-width {
  grid-column: 1 / -1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.form-group label {
  color: #29323a;
  font-size: 14px;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #dfe4e1;
  border-radius: 12px;
  background: #ffffff;
  color: #29323a;
  font-family: inherit;
  font-size: 15px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
  border-color: #75c6a2;
  box-shadow: 0 0 0 3px rgba(117, 198, 162, 0.12);
}

.form-group input:disabled {
  background: #f5f7f6;
  color: #7f898f;
  cursor: not-allowed;
}

.form-group small {
  color: #9ba2a8;
  font-size: 12px;
}

.mensaje {
  margin-top: 24px;
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 14px;
  text-align: center;
}

.mensaje.success {
  background: #edf9f3;
  color: #3d8b68;
  border: 1px solid #cfeedd;
}

.mensaje.error {
  background: #fff0f0;
  color: #a53b3b;
  border: 1px solid #f0cccc;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #edf0ee;
}

.form-actions button {
  border: none;
  border-radius: 12px;
  padding: 13px 22px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary {
  background: #f1f3f2;
  color: #59636b;
}

.btn-primary {
  background: #73c59f;
  color: white;
}

.btn-primary:hover {
  background: #63b88f;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 700px) {
  .config-page {
    padding: 30px 24px 50px;
  }

  .config-card {
    padding: 24px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .full-width {
    grid-column: auto;
  }

  .page-header h1 {
    font-size: 32px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>
