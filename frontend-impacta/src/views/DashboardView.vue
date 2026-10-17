<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import { apiFetch } from '../services/api'
import { hasPermission as can } from '../services/permissions'

const router = useRouter()

const nombreUsuario = computed(() => {
  const usuarioGuardado = localStorage.getItem('usuario')

  if (!usuarioGuardado) {
    return 'Usuario'
  }

  try {
    const usuario = JSON.parse(usuarioGuardado)
    return usuario.nombre || 'Usuario'
  } catch {
    return 'Usuario'
  }
})
const fechaActual = computed(() => {
  const fecha = new Date()

  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(fecha)
})

const totalBeneficiarios = ref(0)
const totalDonantes = ref(0)
const totalDonaciones = ref(0)
const totalEntregas = ref(0)
const impactoGenerado = computed(() => totalBeneficiarios.value)
const campanaActiva = ref<any>(null)
const totalMontoMonetario = ref(0)


function nuevoBeneficiario() {
  router.push('/nuevo-beneficiario')
}

function registrarDonacion() {
  router.push('/nueva-donacion')
}

function nuevaEntrega() {
  router.push('/nueva-entrega')
}

function nuevaCampana() {
  router.push('/nueva-campana')
}

async function cargarTotalBeneficiarios() {
  try {
    const response = await apiFetch('/beneficiarios')

    if (!response.ok) {
      throw new Error('No fue posible cargar los beneficiarios.')
    }

    const data = await response.json()

    totalBeneficiarios.value = data.length
  } catch (error) {
    console.error('Error al cargar beneficiarios:', error)
  }
}


async function cargarTotalDonantes() {
  try {
    const response = await apiFetch('/donantes')

    if (!response.ok) {
      throw new Error('No fue posible cargar los donantes.')
    }

    const data = await response.json()

    totalDonantes.value = data.length
  } catch (error) {
    console.error('Error al cargar donantes:', error)
  }
}

async function cargarTotalDonaciones() {
  try {
    const response = await apiFetch('/donaciones')

    if (!response.ok) {
      throw new Error('No fue posible cargar las donaciones.')
    }

    const data = await response.json()

    totalDonaciones.value = data.length
    totalMontoMonetario.value = data
    .filter((donacion: any) => donacion.tipo === 'MONETARIA')
    .reduce((total: number, donacion: any) => total + Number(donacion.monto || 0), 0)
    } catch (error) {
    console.error('Error al cargar donaciones:', error)
  }
}

async function cargarTotalEntregas() {
  try {
    const response = await apiFetch('/entregas')

    if (!response.ok) {
      throw new Error('No fue posible cargar las entregas.')
    }

    const data = await response.json()

    totalEntregas.value = data.length
  } catch (error) {
    console.error('Error al cargar entregas:', error)
  }
}

async function cargarCampanaActiva() {
  try {
    const response = await apiFetch('/campanas')

    if (!response.ok) {
      throw new Error('No fue posible cargar las campañas.')
    }

    const data = await response.json()

    if (data.length > 0) {
      campanaActiva.value = data[0]
    }
  } catch (error) {
    console.error('Error al cargar campaña:', error)
  }
}

onMounted(() => {
  if (can('beneficiarios', 'consultar')) {
    cargarTotalBeneficiarios()
    cargarTotalEntregas()
  }
  if (can('donantes', 'consultar')) {
    cargarTotalDonantes()
  }
  if (can('donaciones', 'consultar')) {
    cargarTotalDonaciones()
  }
  if (can('campanas', 'consultar')) {
    cargarCampanaActiva()
  }
})

const saludo = computed(() => {
  const hora = new Date().getHours()

  if (hora >= 5 && hora < 12) {
    return 'Buenos días'
  }

  if (hora >= 12 && hora < 19) {
    return 'Buenas tardes'
  }

  return 'Buenas noches'
})

</script>

<template>
  <MainLayout>
    <div class="dashboard">

      <!-- Encabezado -->
      <div class="welcome-section">
        <div>
          <span class="section-label">Panel principal</span>

         <h1>
  {{ saludo }}, <span>{{ nombreUsuario }}</span>
</h1>
          <p>
            Aquí tienes un resumen del impacto y la actividad de hoy.
          </p>
        </div>

        <div class="date-info">
          <span>Hoy</span>
         <strong>{{ fechaActual }}</strong>
        </div>
      </div>


      <!-- Indicadores -->
      <div class="stats-grid">

        <div v-if="can('beneficiarios', 'consultar')" class="stat-card">
          <div class="stat-icon">♙</div>
          <div>
            <span>Beneficiarios</span>
            <strong>{{ totalBeneficiarios }}</strong>
            <small>Personas atendidas</small>
          </div>
        </div>

        <div v-if="can('donantes', 'consultar')" class="stat-card">
          <div class="stat-icon">♧</div>
          <div>
            <span>Donantes</span>
            <strong>{{ totalDonantes }}</strong>
            <small>Donantes registrados</small>
          </div>
        </div>

        <div v-if="can('donaciones', 'consultar')" class="stat-card">
          <div class="stat-icon">◇</div>
          <div>
            <span>Donaciones</span>
            <strong>{{ totalDonaciones }}</strong>
            <small>Donaciones registradas</small>
          </div>
        </div>

        <div v-if="can('beneficiarios', 'consultar')" class="stat-card">
          <div class="stat-icon">✓</div>
          <div>
            <span>Entregas</span>
            <strong>{{ totalEntregas }}</strong>
            <small>Entregas realizadas</small>
          </div>
        </div>

      </div>

      <!-- Resumen -->
      <div class="summary-grid">

       <div v-if="can('beneficiarios', 'consultar')" class="summary-card">
  <div class="card-header">
    <div>
      <h2>Impacto generado</h2>
      <p>Resumen de la actividad de Impacta</p>
    </div>
  </div>

  <div class="impact-number">{{ impactoGenerado }}</div>
  <div class="impact-label">personas beneficiadas</div>

  <div class="progress">
  <div class="progress-bar" style="width: 75%"></div>
</div>


  <div class="progress-info">
    <span>Meta mensual alcanzada</span>
   <strong>75%</strong>
  </div>
</div>
	<div v-if="can('campanas', 'consultar') && can('donaciones', 'consultar')" class="summary-card">
  <div class="card-header">
    <div>
      <h2>Campaña activa</h2>
      <p>{{ campanaActiva?.nombre || 'Sin campaña activa' }}</p>
    </div>
  </div>

  <div class="campaign-amount">
  Q{{ totalMontoMonetario.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
  <span>de Q{{ Number(campanaActiva?.meta_economica || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
</div>

  <div class="progress">
    <div class="progress-bar" style="width: 75%"></div>
  </div>

<div class="progress-info">
  <span>
    {{ campanaActiva?.meta_economica
      ? Math.round((totalMontoMonetario / Number(campanaActiva.meta_economica)) * 100)
      : 0 }}% alcanzado
  </span>
  <strong>Meta económica</strong>
</div>

<div class="campaign-remaining">
  Faltan
  <strong>
    Q{{ Math.max(
      Number(campanaActiva?.meta_economica || 0) - totalMontoMonetario,
      0
    ).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) }}
  </strong>
  para alcanzar la meta
</div>
</div>
</div>

      <!-- Actividad reciente -->
     
<!-- Acciones rápidas -->
<div class="quick-actions">
  <div class="card-header">
    <div>
      <h2>Acciones rápidas</h2>
      <p>Accede rápidamente a las funciones principales</p>
    </div>
  </div>

  <div class="quick-actions-grid">
   <button
  class="quick-action"
  type="button"
  v-if="can('beneficiarios', 'agregar')"
  @click="nuevoBeneficiario"
>
  <span class="quick-action-icon">+</span>
  <span>Nuevo beneficiario</span>
</button>

    <button
      v-if="can('donaciones', 'agregar')"
      class="quick-action"
      type="button"
      @click="registrarDonacion"
    >
      <span class="quick-action-icon">+</span>
      <span>Registrar donación</span>
    </button>

    <button
      v-if="can('beneficiarios', 'agregar')"
      class="quick-action"
      type="button"
      @click="nuevaEntrega"
    >
      <span class="quick-action-icon">+</span>
      <span>Nueva entrega</span>
    </button>

    <button
      v-if="can('campanas', 'agregar')"
      class="quick-action"
      type="button"
      @click="nuevaCampana"
    >
      <span class="quick-action-icon">+</span>
      <span>Nueva campaña</span>
    </button>
  </div>
</div>
       <div class="activity-card">

        <div class="card-header">
          <div>
            <h2>Actividad reciente</h2>
            <p>Últimos movimientos registrados</p>
          </div>
        </div>

        <div class="activity-item">
          <div class="activity-icon">✓</div>

          <div class="activity-content">
            <strong>Entrega registrada</strong>
            <span>Se realizó una nueva entrega a un beneficiario.</span>
          </div>

          <small>Hoy</small>
        </div>

        <div class="activity-item">
          <div class="activity-icon">◇</div>

          <div class="activity-content">
            <strong>Nueva donación</strong>
            <span>Se registró una nueva donación.</span>
          </div>

          <small>Ayer</small>
        </div>

        <div class="activity-item">
          <div class="activity-icon">♙</div>

          <div class="activity-content">
            <strong>Beneficiario registrado</strong>
            <span>Se agregó un nuevo beneficiario.</span>
          </div>

          <small>Hace 2 días</small>
        </div>

      </div>

        </div>
  </MainLayout>
</template>

<style scoped>

.dashboard {
  padding: 36px 40px;
}

/* ENCABEZADO */

.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 35px;
}

.section-label {
  display: block;
  color: #70b996;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
}

.welcome-section h1 {
  margin: 0;
  font-size: 34px;
  color: #193b35;
  font-weight: 700;
}

.welcome-section h1 span {
  color: #70b996;
}

.welcome-section p {
  margin: 9px 0 0;
  color: #87938f;
  font-size: 16px;
}

.date-info {
  text-align: right;
  color: #87938f;
  font-size: 13px;
}

.date-info span {
  display: block;
  margin-bottom: 5px;
}

.date-info strong {
  color: #3c514c;
  font-size: 14px;
}

/* INDICADORES */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border: 1px solid #e5ebe8;
  border-radius: 16px;
  padding: 22px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 22px rgba(40, 70, 60, 0.08);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: #e8f3ee;
  color: #4f9273;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.stat-card span {
  display: block;
  color: #7e8985;
  font-size: 13px;
  margin-bottom: 5px;
}

.stat-card strong {
  display: block;
  color: #193b35;
  font-size: 27px;
  line-height: 1;
  margin-bottom: 5px;
}

.stat-card small {
  color: #a1aaa6;
  font-size: 11px;
}

/* RESUMEN */

.summary-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.quick-actions {
  background: #ffffff;
  border: 1px solid #e3ebe8;
  border-radius: 18px;
  padding: 24px 28px;
  margin-bottom: 28px;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-top: 20px;
}

.quick-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 16px;
  border: 1px solid #dce8e3;
  border-radius: 12px;
  background: #f8fbfa;
  color: #23463f;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-action:hover {
  background: #edf6f2;
  border-color: #8fc8ad;
}

.quick-action-icon {
  font-size: 20px;
  font-weight: 400;
  color: #65b88f;
}

.summary-card,
.activity-card {
  background: white;
  border: 1px solid #e5ebe8;
  border-radius: 16px;
  padding: 28px;
}

.card-header h2 {
  margin: 0;
  color: #29453f;
  font-size: 19px;
}

.card-header p {
  margin: 7px 0 0;
  color: #98a29f;
  font-size: 13px;
}

.impact-number {
  margin-top: 28px;
  color: #193b35;
  font-size: 42px;
  font-weight: 700;
  text-align: center;
}

.impact-label {
  text-align: center;
  color: #7f8c87;
  margin-bottom: 24px;
}

.campaign-amount {
  margin-top: 28px;
  color: #193b35;
  font-size: 34px;
  font-weight: 700;
}

.campaign-amount span {
  font-size: 15px;
  font-weight: 400;
  color: #899590;
}

.progress {
  height: 9px;
  background: #e8eeeb;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 20px;
}

.progress-bar {
  height: 100%;
  background: #70b996;
  border-radius: 10px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-top: 9px;
  color: #8c9793;
  font-size: 12px;
}
.campaign-remaining {
  margin-top: 14px;
  text-align: center;
  font-size: 14px;
  color: #7b8783;
}

.campaign-remaining strong {
  color: #23463f;
  font-weight: 700;
}

.progress-info strong {
  color: #668178;
}

/* ACTIVIDAD */

.activity-card {
  margin-bottom: 30px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
  border-bottom: 1px solid #edf1ef;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #e8f3ee;
  color: #4f9273;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-content {
  flex: 1;
}

.activity-content strong {
  display: block;
  color: #263d38;
  margin-bottom: 5px;
}

.activity-content span {
  color: #9aa39f;
  font-size: 12px;
}

.activity-item > small {
  color: #9aa39f;
}

/* RESPONSIVE */

@media (max-width: 900px) {

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .welcome-section {
    align-items: flex-start;
    flex-direction: column;
    gap: 15px;
  }

  .date-info {
    text-align: left;
  }
}

@media (max-width: 600px) {

  .dashboard {
    padding: 25px 18px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .welcome-section h1 {
    font-size: 28px;
  }
}

</style>
