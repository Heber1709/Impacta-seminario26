<template>
  <MainLayout>
    <div class="donacion-page">

      <div class="page-header">
        <div>
          <span class="eyebrow">GESTIÓN</span>
          <h1>Nueva donación</h1>
          <p>Registra una nueva donación recibida por Impacta.</p>
        </div>

        <div class="header-actions">
          <button class="btn-secondary" type="button" @click="volver">
            Cancelar
          </button>

          <button class="btn-primary" type="button" @click="guardarDonacion">
           Guardar donación
          </button>
        </div>
      </div>

      <div class="form-card">

        <div class="form-section">
          <h2>Información de la donación</h2>
          <p>Completa los datos necesarios para registrar la donación.</p>
        </div>

        <div class="form-grid">

          <div class="form-group">
            <label>Código único</label>
            <input
              v-model="formulario.codigo_unico"
              type="text"
              maxlength="50"
              placeholder="Ej. DON-001"
            />
          </div>

          <div class="form-group">
            <label>Tipo de donación</label>
            <select v-model="formulario.tipo">
              <option value="">Selecciona una opción</option>
              <option value="MONETARIA">Monetaria</option>
              <option value="FISICA">Física</option>
            </select>
          </div>

          <div class="form-group">
            <label>Categoría</label>
            <select v-model="formulario.categoria">
              <option value="">Selecciona una categoría</option>
              <option value="ALIMENTOS">Alimentos</option>
              <option value="MEDICAMENTOS">Medicamentos</option>
              <option value="ROPA">Ropa</option>
              <option value="MOBILIARIO">Mobiliario</option>
              <option value="EQUIPO_TECNOLOGICO">Equipo tecnológico</option>
              <option value="MATERIAL_EDUCATIVO">Material educativo</option>
              <option value="FINANCIERA">Financiera</option>
            </select>
          </div>

          <div class="form-group">
            <label>Monto</label>
            <input
              v-model="formulario.monto"
              type="number"
              min="0"
              step="0.01"
              placeholder="Ej. 500.00"
            />
          </div>

          <div class="form-group full">
            <label>Donante</label>

            <select v-model="formulario.donante_id">
              <option value="">
                {{
                  cargandoDonantes
                    ? 'Cargando donantes...'
                    : 'Selecciona un donante'
                }}
              </option>

              <option
                v-for="donante in donantes"
                :key="donante.id"
                :value="donante.id"
              >
                {{ donante.nombre }}
              </option>
            </select>
          </div>

          <div class="form-group full">
            <label>Fotografía URL</label>

            <input
              v-model="formulario.fotografia_url"
              type="text"
              maxlength="255"
              placeholder="https://ejemplo.com/fotografia.jpg"
            />
          </div>

        </div>

        <p v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </p>

      </div>
    </div>
  </MainLayout>
</template>


<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import { apiFetch } from '../services/api'

const router = useRouter()

const formulario = reactive({
  codigo_unico: '',
  tipo: '',
  categoria: '',
  monto: '',
  fotografia_url: '',
  donante_id: ''
})

interface Donante {
  id: string
  nombre: string
  tipo: string
}

const donantes = ref<Donante[]>([])
const cargandoDonantes = ref(true)
const errorMessage = ref('')

function volver() {
  router.push('/donaciones')
}
async function guardarDonacion() {
  try {
    errorMessage.value = ''

    const response = await apiFetch('/donaciones', {
      method: 'POST',
      body: JSON.stringify({
        codigo_unico: formulario.codigo_unico,
        tipo: formulario.tipo,
        categoria: formulario.categoria,
        monto: formulario.monto ? Number(formulario.monto) : undefined,
        fotografia: formulario.fotografia_url || undefined,
        donante_id: formulario.donante_id
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'No fue posible guardar la donación.'
      )
    }

    alert('Donación guardada correctamente.')
    router.push('/donaciones')
  } catch (error) {
    console.error(error)

    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'No fue posible guardar la donación.'
  }
}

async function cargarDonantes() {
  try {
    const response = await apiFetch('/donantes')
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'No fue posible cargar los donantes.')
    }

    donantes.value = data
  } catch (error) {
    console.error(error)

    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'No fue posible cargar los donantes.'
  } finally {
    cargandoDonantes.value = false
  }
}

onMounted(() => {
  cargarDonantes()
})
</script>

<style scoped>


.donacion-page {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 40px 48px 60px;
  box-sizing: border-box;
}

/* Encabezado */

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 30px;
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

/* Botones */

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.btn-primary,
.btn-secondary {
  border: none;
  border-radius: 10px;
  padding: 13px 22px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn-primary {
  background: #74c69d;
  color: white;
  box-shadow: 0 8px 20px rgba(116, 198, 157, 0.22);
}

.btn-primary:hover {
  background: #62b98d;
  transform: translateY(-1px);
}

.btn-secondary {
  background: white;
  color: #45505c;
  border: 1px solid #dce2df;
}

.btn-secondary:hover {
  background: #f7f9f8;
}

/* Tarjeta */

.form-card {
  background: white;
  border: 1px solid #e3e8e5;
  border-radius: 20px;
  padding: 34px;
  box-shadow: 0 8px 28px rgba(25, 55, 45, 0.05);
}

.form-section {
  padding-bottom: 26px;
  margin-bottom: 28px;
  border-bottom: 1px solid #edf0ee;
}

.form-section h2 {
  margin: 0;
  color: #20252b;
  font-size: 22px;
  font-weight: 650;
}

.form-section p {
  margin: 8px 0 0;
  color: #8a939c;
  font-size: 14px;
}

/* Formulario */

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.form-group.full {
  grid-column: 1 / -1;
}

.form-group label {
  margin-bottom: 8px;
  color: #38414a;
  font-size: 14px;
  font-weight: 600;
}

.form-group input,
.form-group select {
  width: 100%;
  height: 48px;
  padding: 0 14px;
  box-sizing: border-box;
  border: 1px solid #d9dfdc;
  border-radius: 10px;
  background: #ffffff;
  color: #303841;
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: 0.2s ease;
}

.form-group input::placeholder {
  color: #aab1b7;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #74c69d;
  box-shadow: 0 0 0 3px rgba(116, 198, 157, 0.12);
}

.form-group select {
  cursor: pointer;
}

/* Mensaje de error */

.error-message {
  margin: 24px 0 0;
  padding: 13px 16px;
  border-radius: 10px;
  background: #fff1f1;
  border: 1px solid #f1cccc;
  color: #b42318;
  font-size: 14px;
}

/* Adaptación para pantallas pequeñas */

@media (max-width: 800px) {
  .donacion-page {
    padding: 30px 24px 50px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .btn-primary,
  .btn-secondary {
    flex: 1;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-group.full {
    grid-column: auto;
  }
}

@media (max-width: 520px) {
  .donacion-page {
    padding: 24px 16px 40px;
  }

  .page-header h1 {
    font-size: 32px;
  }

  .form-card {
    padding: 22px;
    border-radius: 16px;
  }

  .header-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
