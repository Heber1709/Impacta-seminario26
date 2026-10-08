ç<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import { apiFetch } from '../services/api'

const router = useRouter()

const formulario = reactive({
  dpi: '',
  nombre_completo: '',
  direccion: '',
  municipio: '',
  departamento: '',
  integrantes_hogar: 1
})

function volver() {
  router.push('/beneficiarios')
}

async function guardarBeneficiario() {
  try {
    const response = await apiFetch('/beneficiarios', {
      method: 'POST',
      body: JSON.stringify(formulario)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'No fue posible guardar el beneficiario.')
    }

    alert('Beneficiario guardado correctamente.')
    router.push('/beneficiarios')

  } catch (error) {
    console.error(error)

    alert(
      error instanceof Error
        ? error.message
        : 'No fue posible guardar el beneficiario.'
    )
  }
}    


</script>

<template>
  <MainLayout>
    <div class="beneficiario-page">

      <!-- ENCABEZADO -->
      <div class="page-header">
        <div>
          <span class="section-label">GESTIÓN</span>
          <h1>Nuevo beneficiario</h1>
          <p>
            Registra la información de una persona beneficiada por Impacta.
          </p>
        </div>

        <div class="header-actions">
          <button class="btn-secondary" type="button" @click="volver">
            Cancelar
          </button>

          <button class="btn-primary" type="button" @click="guardarBeneficiario">
            Guardar beneficiario
          </button>
        </div>
      </div>

      <!-- FORMULARIO -->
      <form class="form-container">

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
              <input
                id="municipio"
                v-model="formulario.municipio"
                type="text"
                maxlength="100"
                placeholder="Municipio"
              />
            </div>

            <div class="form-group">
              <label for="departamento">Departamento</label>
              <input
                id="departamento"
                v-model="formulario.departamento"
                type="text"
                maxlength="100"
                placeholder="Departamento"
              />
            </div>

          </div>
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

.form-group input {
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

.form-group input:focus {
  border-color: #71927b;
  box-shadow: 0 0 0 3px rgba(69, 107, 82, 0.08);
  background: white;
}

.form-group input::placeholder {
  color: #a4aca6;
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

