<template>
  <MainLayout>
    <div class="reportes-page">
      <!-- Encabezado de la página -->
      <header class="page-header no-print">
        <div>
          <span class="eyebrow">CENTRO DE DOCUMENTOS Y CONTROL OFICIAL</span>
          <h1>Reportes y Listados</h1>
          <p>
            Genera, consulta e imprime reportes consolidados y constancias oficiales en formato PDF.
          </p>
        </div>
        <a
          href="/MANUAL_DEL_SISTEMA.docx"
          download="MANUAL_DEL_SISTEMA_IMPACTA.docx"
          class="btn-manual-download"
        >
          <span>📘</span> Descargar Manual (.docx)
        </a>
      </header>

      <!-- Selector de Reportes (Tabs) -->
      <nav class="report-tabs no-print" aria-label="Selección de reporte">
        <button
          type="button"
          :class="['tab-btn', { active: reporteActivo === 'donaciones' }]"
          @click="seleccionarReporte('donaciones')"
        >
          <span class="tab-icon">♢</span>
          <span class="tab-label">1. Listado de Donaciones</span>
        </button>

        <button
          type="button"
          :class="['tab-btn', { active: reporteActivo === 'entregas' }]"
          @click="seleccionarReporte('entregas')"
        >
          <span class="tab-icon">↗</span>
          <span class="tab-label">2. Listado de Entregas</span>
        </button>

        <button
          type="button"
          :class="['tab-btn', { active: reporteActivo === 'kardex' }]"
          @click="seleccionarReporte('kardex')"
        >
          <span class="tab-icon">▣</span>
          <span class="tab-label">3. Kardex de Inventario</span>
        </button>

        <button
          type="button"
          :class="['tab-btn', { active: reporteActivo === 'constancia_entrega' }]"
          @click="seleccionarReporte('constancia_entrega')"
        >
          <span class="tab-icon">📜</span>
          <span class="tab-label">4. Constancia de Entrega</span>
        </button>

        <button
          type="button"
          :class="['tab-btn', { active: reporteActivo === 'constancia_donacion' }]"
          @click="seleccionarReporte('constancia_donacion')"
        >
          <span class="tab-icon">📑</span>
          <span class="tab-label">5. Constancia de Donación</span>
        </button>
      </nav>

      <!-- Estado de carga general -->
      <div v-if="cargando" class="state-card loading">
        <p>Cargando información oficial del sistema...</p>
      </div>

      <div v-else-if="error" class="state-card error">
        <p>{{ error }}</p>
        <button type="button" class="btn-retry" @click="cargarDatos">Reintentar</button>
      </div>

      <!-- CONTENIDO DEL REPORTE SELECCIONADO -->
      <div v-else class="report-content">

        <!-- ========================================== -->
        <!-- REPORTE 1: LISTADO DE DONACIONES           -->
        <!-- ========================================== -->
        <section v-if="reporteActivo === 'donaciones'" class="report-section">
          <div class="panel-header no-print">
            <div class="panel-title">
              <h2>Listado Consolidado de Donaciones</h2>
              <p>Historial completo de donaciones monetarias y en especie recibidas.</p>
            </div>
            <div class="actions">
              <button
                type="button"
                class="btn-primary"
                @click="generarPdfDonaciones"
              >
                <span>📥</span> Descargar PDF
              </button>
              <button
                type="button"
                class="btn-secondary"
                @click="imprimirDocumento"
              >
                <span>🖨</span> Imprimir
              </button>
            </div>
          </div>

          <!-- Filtros -->
          <div class="filters-bar no-print">
            <div class="filter-group">
              <label for="filtro-tipo-donacion">Tipo de Donación:</label>
              <select id="filtro-tipo-donacion" v-model="filtroTipoDonacion" class="form-select">
                <option value="TODOS">Todos los tipos</option>
                <option value="MONETARIA">Monetaria</option>
                <option value="ESPECIE">En Especie</option>
              </select>
            </div>

            <div class="filter-group search">
              <label for="buscar-donacion">Búsqueda rápida:</label>
              <input
                id="buscar-donacion"
                v-model="busquedaDonacion"
                type="search"
                placeholder="Buscar por código, donante o categoría..."
                class="form-input"
              />
            </div>
          </div>

          <!-- Tarjetas KPI -->
          <div class="kpi-grid no-print">
            <div class="kpi-card">
              <span class="kpi-num">{{ donacionesFiltradas.length }}</span>
              <span class="kpi-label">Donaciones Registradas</span>
            </div>
            <div class="kpi-card highlight">
              <span class="kpi-num">Q {{ totalMontoDonaciones.toLocaleString('es-GT', { minimumFractionDigits: 2 }) }}</span>
              <span class="kpi-label">Fondo Monetario Total</span>
            </div>
            <div class="kpi-card">
              <span class="kpi-num">{{ totalDonacionesEspecie }}</span>
              <span class="kpi-label">Aportes en Especie</span>
            </div>
          </div>

          <!-- Vista Previa de Tabla para Impresión y Pantalla -->
          <div class="table-container printable-area">
            <div class="print-doc-header print-only">
              <h2>IMPACTA - LISTADO OFICIAL DE DONACIONES</h2>
              <p>Fecha de emisión: {{ fechaActual }} | Documento oficial de control administrativo</p>
            </div>

            <table class="report-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Código</th>
                  <th>Fecha</th>
                  <th>Donante</th>
                  <th>Tipo</th>
                  <th>Categoría</th>
                  <th class="text-right">Monto / Modalidad</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="donacionesFiltradas.length === 0">
                  <td colspan="7" class="text-center empty">No se encontraron donaciones con los filtros seleccionados.</td>
                </tr>
                <tr v-for="(donacion, i) in donacionesFiltradas" :key="donacion.id">
                  <td>{{ i + 1 }}</td>
                  <td class="font-mono font-bold">{{ donacion.codigo_unico || donacion.id }}</td>
                  <td>{{ donacion.fecha_ingreso || 'N/D' }}</td>
                  <td>{{ donacion.donante?.nombre || 'Anónimo' }}</td>
                  <td>
                    <span :class="['badge', donacion.tipo === 'MONETARIA' ? 'badge-blue' : 'badge-green']">
                      {{ donacion.tipo }}
                    </span>
                  </td>
                  <td>{{ donacion.categoria }}</td>
                  <td class="text-right font-bold">
                    {{ donacion.monto ? `Q ${Number(donacion.monto).toLocaleString('es-GT', { minimumFractionDigits: 2 })}` : 'En Especie' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- ========================================== -->
        <!-- REPORTE 2: LISTADO DE ENTREGAS             -->
        <!-- ========================================== -->
        <section v-if="reporteActivo === 'entregas'" class="report-section">
          <div class="panel-header no-print">
            <div class="panel-title">
              <h2>Listado Oficial de Entregas Realizadas</h2>
              <p>Registro de entregas de ayuda humanitaria canalizadas a las familias beneficiarias.</p>
            </div>
            <div class="actions">
              <button
                type="button"
                class="btn-primary"
                @click="generarPdfEntregas"
              >
                <span>📥</span> Descargar PDF
              </button>
              <button
                type="button"
                class="btn-secondary"
                @click="imprimirDocumento"
              >
                <span>🖨</span> Imprimir
              </button>
            </div>
          </div>

          <div class="filters-bar no-print">
            <div class="filter-group search">
              <label for="buscar-entrega">Filtrar por beneficiario o campaña:</label>
              <input
                id="buscar-entrega"
                v-model="busquedaEntrega"
                type="search"
                placeholder="Buscar por nombre, folio o campaña..."
                class="form-input"
              />
            </div>
          </div>

          <div class="kpi-grid no-print">
            <div class="kpi-card highlight">
              <span class="kpi-num">{{ entregasFiltradas.length }}</span>
              <span class="kpi-label">Entregas Realizadas</span>
            </div>
            <div class="kpi-card">
              <span class="kpi-num">{{ campanasUnicas }}</span>
              <span class="kpi-label">Campañas Asociadas</span>
            </div>
          </div>

          <div class="table-container printable-area">
            <div class="print-doc-header print-only">
              <h2>IMPACTA - LISTADO OFICIAL DE ENTREGAS</h2>
              <p>Fecha de emisión: {{ fechaActual }} | Registro auditado de asistencia social</p>
            </div>

            <table class="report-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>No. Entrega</th>
                  <th>Fecha</th>
                  <th>Beneficiario</th>
                  <th>Campaña</th>
                  <th>Voluntarios Asignados</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="entregasFiltradas.length === 0">
                  <td colspan="6" class="text-center empty">No se encontraron entregas registradas.</td>
                </tr>
                <tr v-for="(entrega, i) in entregasFiltradas" :key="entrega.id">
                  <td>{{ i + 1 }}</td>
                  <td class="font-bold">#{{ entrega.numero_entrega ?? entrega.id }}</td>
                  <td>{{ entrega.fecha || 'N/D' }}</td>
                  <td class="font-bold">{{ entrega.beneficiario?.nombre_completo || 'Sin asignar' }}</td>
                  <td>{{ entrega.campana?.nombre || 'General' }}</td>
                  <td>{{ obtenerNombresVoluntarios(entrega) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- ========================================== -->
        <!-- REPORTE 3: KARDEX DE INVENTARIO            -->
        <!-- ========================================== -->
        <section v-if="reporteActivo === 'kardex'" class="report-section">
          <div class="panel-header no-print">
            <div class="panel-title">
              <h2>Kardex de Movimientos de Inventario</h2>
              <p>Auditoría de ingresos (+) y egresos (-) en el almacén de asistencia social.</p>
            </div>
            <div class="actions">
              <button
                type="button"
                class="btn-primary"
                @click="generarPdfKardex"
              >
                <span>📥</span> Descargar PDF
              </button>
              <button
                type="button"
                class="btn-secondary"
                @click="imprimirDocumento"
              >
                <span>🖨</span> Imprimir
              </button>
            </div>
          </div>

          <div class="kpi-grid no-print">
            <div class="kpi-card highlight-green">
              <span class="kpi-num">+{{ totalKardexEntradas }}</span>
              <span class="kpi-label">Total Entradas (+)</span>
            </div>
            <div class="kpi-card highlight-red">
              <span class="kpi-num">-{{ totalKardexSalidas }}</span>
              <span class="kpi-label">Total Salidas (-)</span>
            </div>
            <div class="kpi-card highlight">
              <span class="kpi-num">{{ totalKardexEntradas - totalKardexSalidas }}</span>
              <span class="kpi-label">Existencia Neta (Saldo)</span>
            </div>
          </div>

          <div class="table-container printable-area">
            <div class="print-doc-header print-only">
              <h2>IMPACTA - KARDEX OFICIAL DE INVENTARIO</h2>
              <p>Fecha de emisión: {{ fechaActual }} | Control de almacén de donaciones</p>
            </div>

            <table class="report-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Folio Mov.</th>
                  <th>Fecha</th>
                  <th>Tipo de Movimiento</th>
                  <th class="text-right">Cantidad</th>
                  <th>Categoría</th>
                  <th>Referencia</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="movimientos.length === 0">
                  <td colspan="8" class="text-center empty">No hay movimientos registrados en el inventario.</td>
                </tr>
                <tr v-for="(mov, i) in movimientos" :key="mov.id">
                  <td>{{ i + 1 }}</td>
                  <td class="font-mono">{{ mov.id }}</td>
                  <td>{{ mov.fecha_movimiento || 'N/D' }}</td>
                  <td>
                    <span :class="['badge', esEntrada(mov.tipo_movimiento) ? 'badge-green' : 'badge-red']">
                      {{ esEntrada(mov.tipo_movimiento) ? '+' : '-' }} {{ nombreTipoMovimiento(mov.tipo_movimiento) }}
                    </span>
                  </td>
                  <td :class="['text-right', 'font-bold', esEntrada(mov.tipo_movimiento) ? 'text-green' : 'text-red']">
                    {{ esEntrada(mov.tipo_movimiento) ? `+${mov.cantidad}` : `-${mov.cantidad}` }}
                  </td>
                  <td>{{ mov.donacion?.categoria || 'General' }}</td>
                  <td>
                    {{ mov.entrega ? `Entrega #${mov.entrega.numero_entrega}` : mov.donacion ? `Donación ${mov.donacion.codigo_unico || mov.donacion.id}` : 'Ajuste Interno' }}
                  </td>
                  <td>{{ mov.observaciones || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- ========================================== -->
        <!-- REPORTE 4: CONSTANCIA DE ENTREGA           -->
        <!-- ========================================== -->
        <section v-if="reporteActivo === 'constancia_entrega'" class="report-section">
          <div class="panel-header no-print">
            <div class="panel-title">
              <h2>Constancia Oficial de Entrega</h2>
              <p>Emite la constancia institucional individual firmada para entrega a un beneficiario.</p>
            </div>
            <div class="actions">
              <button
                type="button"
                class="btn-primary"
                :disabled="!entregaSeleccionada"
                @click="generarPdfConstanciaEntrega"
              >
                <span>📥</span> Descargar Constancia PDF
              </button>
              <button
                type="button"
                class="btn-secondary"
                :disabled="!entregaSeleccionada"
                @click="imprimirDocumento"
              >
                <span>🖨</span> Imprimir Constancia
              </button>
            </div>
          </div>

          <!-- Selector de Entrega -->
          <div class="selector-card no-print">
            <label for="select-entrega">Selecciona la entrega a emitir:</label>
            <select
              id="select-entrega"
              v-model="idEntregaSeleccionada"
              class="form-select full-width"
            >
              <option value="" disabled>-- Elige una entrega registrada --</option>
              <option
                v-for="e in entregas"
                :key="e.id"
                :value="e.id"
              >
                Entrega #{{ e.numero_entrega ?? e.id }} — {{ e.beneficiario?.nombre_completo || 'Beneficiario' }} ({{ e.fecha }})
              </option>
            </select>
          </div>

          <!-- Vista Previa de la Constancia (Documento Formal) -->
          <div v-if="entregaSeleccionada" class="certificate-paper printable-area">
            <div class="cert-header">
              <div class="cert-logo-box">
                <span class="cert-logo-icon">✦</span>
                <div>
                  <h1 class="cert-org-title">IMPACTA</h1>
                  <span class="cert-org-sub">Plataforma de Asistencia Social y Donaciones</span>
                </div>
              </div>
              <div class="cert-header-meta">
                <span class="cert-folio">FOLIO NO: #{{ entregaSeleccionada.numero_entrega ?? entregaSeleccionada.id }}</span>
                <span class="cert-date">Fecha: {{ entregaSeleccionada.fecha || fechaActual }}</span>
              </div>
            </div>

            <div class="cert-divider"></div>

            <h2 class="cert-main-title">CONSTANCIA OFICIAL DE ENTREGA DE AYUDA SOCIAL</h2>

            <div class="cert-block">
              <h3 class="cert-block-title">I. DATOS DEL BENEFICIARIO RECEPTOR</h3>
              <div class="cert-grid">
                <div class="cert-row">
                  <span class="cert-field-title">Nombre Completo:</span>
                  <span class="cert-field-val">{{ datosBeneficiarioEntrega?.nombre_completo || entregaSeleccionada.beneficiario?.nombre_completo || 'N/D' }}</span>
                </div>
                <div class="cert-row">
                  <span class="cert-field-title">DPI / Cédula:</span>
                  <span class="cert-field-val font-mono">{{ datosBeneficiarioEntrega?.dpi || 'N/D' }}</span>
                </div>
                <div class="cert-row">
                  <span class="cert-field-title">Dirección:</span>
                  <span class="cert-field-val">{{ datosBeneficiarioEntrega?.direccion || 'N/D' }}</span>
                </div>
                <div class="cert-row">
                  <span class="cert-field-title">Integrantes del Hogar:</span>
                  <span class="cert-field-val">{{ datosBeneficiarioEntrega?.integrantes_hogar || 'N/D' }} integrantes</span>
                </div>
              </div>
            </div>

            <div class="cert-block">
              <h3 class="cert-block-title">II. PROGRAMA Y CANALIZACIÓN DE LA AYUDA</h3>
              <div class="cert-grid">
                <div class="cert-row">
                  <span class="cert-field-title">Campaña / Programa:</span>
                  <span class="cert-field-val">{{ entregaSeleccionada.campana?.nombre || 'Asistencia Social Directa' }}</span>
                </div>
                <div class="cert-row">
                  <span class="cert-field-title">Voluntarios Responsables:</span>
                  <span class="cert-field-val">{{ obtenerNombresVoluntarios(entregaSeleccionada) }}</span>
                </div>
              </div>
            </div>

            <div class="cert-statement">
              <p>
                <strong>CERTIFICACIÓN INSTITUCIONAL:</strong> Por medio de la presente, la organización <strong>IMPACTA</strong> certifica que los bienes y suministros de asistencia humanitaria fueron entregados al beneficiario arriba identificado en cumplimiento estricto con los protocolos de gratuidad, transparencia y ayuda comunitaria.
              </p>
            </div>

            <!-- Firmas -->
            <div class="cert-signatures">
              <div class="sig-box">
                <div class="sig-line"></div>
                <span class="sig-name">{{ datosBeneficiarioEntrega?.nombre_completo || 'Firma del Beneficiario(a)' }}</span>
                <span class="sig-role">Beneficiario Receptor</span>
                <span class="sig-meta">DPI: {{ datosBeneficiarioEntrega?.dpi || 'Identificación' }}</span>
              </div>

              <div class="sig-box">
                <div class="sig-line"></div>
                <span class="sig-name">Responsable de Entrega</span>
                <span class="sig-role">Equipo de Voluntariado Impacta</span>
                <span class="sig-meta">Sello Oficial de Verificación</span>
              </div>
            </div>

            <div class="cert-footer">
              <p>IMPACTA - Plataforma de Asistencia Social | Código de Verificación: IMP-ENT-{{ entregaSeleccionada.id }}</p>
            </div>
          </div>

          <div v-else class="empty-selection no-print">
            <span class="icon">🔍</span>
            <p>Selecciona una entrega en el menú superior para visualizar y descargar su constancia oficial.</p>
          </div>
        </section>

        <!-- ========================================== -->
        <!-- REPORTE 5: CONSTANCIA DE DONACIÓN          -->
        <!-- ========================================== -->
        <section v-if="reporteActivo === 'constancia_donacion'" class="report-section">
          <div class="panel-header no-print">
            <div class="panel-title">
              <h2>Constancia Oficial de Donación</h2>
              <p>Emite el recibo / constancia institucional oficial para el donante.</p>
            </div>
            <div class="actions">
              <button
                type="button"
                class="btn-primary"
                :disabled="!donacionSeleccionada"
                @click="generarPdfConstanciaDonacion"
              >
                <span>📥</span> Descargar Recibo PDF
              </button>
              <button
                type="button"
                class="btn-secondary"
                :disabled="!donacionSeleccionada"
                @click="imprimirDocumento"
              >
                <span>🖨</span> Imprimir Recibo
              </button>
            </div>
          </div>

          <!-- Selector de Donación -->
          <div class="selector-card no-print">
            <label for="select-donacion">Selecciona la donación para emitir constancia:</label>
            <select
              id="select-donacion"
              v-model="idDonacionSeleccionada"
              class="form-select full-width"
            >
              <option value="" disabled>-- Elige una donación registrada --</option>
              <option
                v-for="d in donaciones"
                :key="d.id"
                :value="d.id"
              >
                {{ d.codigo_unico || d.id }} — {{ d.donante?.nombre || 'Donante' }} ({{ d.tipo }} - {{ d.monto ? `Q${d.monto}` : d.categoria }})
              </option>
            </select>
          </div>

          <!-- Vista Previa de la Constancia de Donación -->
          <div v-if="donacionSeleccionada" class="certificate-paper printable-area">
            <div class="cert-header">
              <div class="cert-logo-box">
                <span class="cert-logo-icon">✦</span>
                <div>
                  <h1 class="cert-org-title">IMPACTA</h1>
                  <span class="cert-org-sub">Plataforma de Asistencia Social y Donaciones</span>
                </div>
              </div>
              <div class="cert-header-meta">
                <span class="cert-folio">RECIBO NO: {{ donacionSeleccionada.codigo_unico || donacionSeleccionada.id }}</span>
                <span class="cert-date">Fecha: {{ donacionSeleccionada.fecha_ingreso || fechaActual }}</span>
              </div>
            </div>

            <div class="cert-divider"></div>

            <h2 class="cert-main-title">CONSTANCIA OFICIAL DE RECEPCIÓN DE DONACIÓN</h2>

            <div class="cert-block">
              <h3 class="cert-block-title">I. DATOS DEL DONANTE</h3>
              <div class="cert-grid">
                <div class="cert-row">
                  <span class="cert-field-title">Donante / Razón Social:</span>
                  <span class="cert-field-val">{{ datosDonanteSeleccionado?.nombre || donacionSeleccionada.donante?.nombre || 'Anónimo' }}</span>
                </div>
                <div class="cert-row">
                  <span class="cert-field-title">Tipo de Donante:</span>
                  <span class="cert-field-val">{{ datosDonanteSeleccionado?.tipo || 'INDIVIDUAL' }}</span>
                </div>
                <div class="cert-row">
                  <span class="cert-field-title">Correo Electrónico:</span>
                  <span class="cert-field-val">{{ datosDonanteSeleccionado?.email || 'No registrado' }}</span>
                </div>
                <div class="cert-row">
                  <span class="cert-field-title">Teléfono:</span>
                  <span class="cert-field-val">{{ datosDonanteSeleccionado?.telefono || 'No registrado' }}</span>
                </div>
              </div>
            </div>

            <div class="cert-block">
              <h3 class="cert-block-title">II. DETALLE DEL APORTE SOLIDARIO</h3>
              <div class="cert-grid">
                <div class="cert-row">
                  <span class="cert-field-title">Modalidad:</span>
                  <span class="cert-field-val font-bold">{{ donacionSeleccionada.tipo }}</span>
                </div>
                <div class="cert-row">
                  <span class="cert-field-title">Categoría Asignada:</span>
                  <span class="cert-field-val">{{ donacionSeleccionada.categoria }}</span>
                </div>
                <div v-if="donacionSeleccionada.monto" class="cert-row highlight-amount">
                  <span class="cert-field-title">Monto Donado:</span>
                  <span class="cert-field-val font-bold text-green">
                    Q {{ Number(donacionSeleccionada.monto).toLocaleString('es-GT', { minimumFractionDigits: 2 }) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="cert-statement">
              <p>
                <strong>AGRADECIMIENTO INSTITUCIONAL:</strong> En nombre de la comunidad y del equipo de <strong>IMPACTA</strong>, agradecemos profundamente su generoso apoyo solidario. Los recursos donados se destinan con total probidad y transparencia a mejorar las condiciones de vida de las poblaciones vulnerables de Guatemala.
              </p>
            </div>

            <!-- Firmas -->
            <div class="cert-signatures">
              <div class="sig-box">
                <div class="sig-line"></div>
                <span class="sig-name">Tesorería y Finanzas</span>
                <span class="sig-role">Administración General Impacta</span>
                <span class="sig-meta">Firma Autorizada</span>
              </div>

              <div class="sig-box">
                <div class="sig-line"></div>
                <span class="sig-name">Dirección Ejecutiva</span>
                <span class="sig-role">IMPACTA Asistencia Social</span>
                <span class="sig-meta">Sello Oficial de Recepción</span>
              </div>
            </div>

            <div class="cert-footer">
              <p>IMPACTA - Plataforma de Asistencia Social | Código de Verificación: IMP-DON-{{ donacionSeleccionada.id }}</p>
            </div>
          </div>

          <div v-else class="empty-selection no-print">
            <span class="icon">🔍</span>
            <p>Selecciona una donación en el menú superior para previsualizar y descargar su constancia oficial.</p>
          </div>
        </section>

      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import { apiFetch } from '../services/api'
import {
  exportarDonacionesPDF,
  exportarEntregasPDF,
  exportarKardexPDF,
  exportarConstanciaEntregaPDF,
  exportarConstanciaDonacionPDF,
} from '../services/pdfExport'

type TipoReporte =
  | 'donaciones'
  | 'entregas'
  | 'kardex'
  | 'constancia_entrega'
  | 'constancia_donacion'

const reporteActivo = ref<TipoReporte>('donaciones')
const cargando = ref(true)
const error = ref('')

// Datasets
const donaciones = ref<any[]>([])
const entregas = ref<any[]>([])
const movimientos = ref<any[]>([])
const tiposMovimiento = ref<any[]>([])
const beneficiarios = ref<any[]>([])
const donantes = ref<any[]>([])
const campanas = ref<any[]>([])
const voluntarios = ref<any[]>([])

// Filtros y búsquedas
const filtroTipoDonacion = ref('TODOS')
const busquedaDonacion = ref('')
const busquedaEntrega = ref('')

// Selecciones para constancias
const idEntregaSeleccionada = ref('')
const idDonacionSeleccionada = ref('')

const fechaActual = computed(() => {
  return new Date().toLocaleDateString('es-GT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
})

function seleccionarReporte(tipo: TipoReporte) {
  reporteActivo.value = tipo
}

async function cargarDatos() {
  cargando.value = true
  error.value = ''

  try {
    const [
      resDonaciones,
      resEntregas,
      resInventario,
      resTipos,
      resBeneficiarios,
      resDonantes,
      resCampanas,
      resVoluntarios,
    ] = await Promise.all([
      apiFetch('/donaciones').catch(() => null),
      apiFetch('/entregas').catch(() => null),
      apiFetch('/inventario').catch(() => null),
      apiFetch('/tipos-movimiento').catch(() => null),
      apiFetch('/beneficiarios').catch(() => null),
      apiFetch('/donantes').catch(() => null),
      apiFetch('/campanas').catch(() => null),
      apiFetch('/voluntarios').catch(() => null),
    ])

    if (resDonaciones?.ok) donaciones.value = await resDonaciones.json()
    if (resEntregas?.ok) entregas.value = await resEntregas.json()
    if (resInventario?.ok) movimientos.value = await resInventario.json()
    if (resTipos?.ok) tiposMovimiento.value = await resTipos.json()
    if (resBeneficiarios?.ok) beneficiarios.value = await resBeneficiarios.json()
    if (resDonantes?.ok) donantes.value = await resDonantes.json()
    if (resCampanas?.ok) campanas.value = await resCampanas.json()
    if (resVoluntarios?.ok) voluntarios.value = await resVoluntarios.json()

    // Seleccionar por defecto la primera entrega y donación si existen
    if (entregas.value.length > 0 && !idEntregaSeleccionada.value) {
      idEntregaSeleccionada.value = entregas.value[0].id
    }
    if (donaciones.value.length > 0 && !idDonacionSeleccionada.value) {
      idDonacionSeleccionada.value = donaciones.value[0].id
    }
  } catch (err) {
    console.error('Error cargando información para reportes:', err)
    error.value = 'No fue posible cargar los datos requeridos para los reportes.'
  } finally {
    cargando.value = false
  }
}

// 1. Donaciones
const donacionesFiltradas = computed(() => {
  return donaciones.value.filter((d) => {
    const matchTipo =
      filtroTipoDonacion.value === 'TODOS' || d.tipo === filtroTipoDonacion.value
    const texto = busquedaDonacion.value.toLowerCase().trim()
    const matchTexto =
      !texto ||
      (d.codigo_unico && d.codigo_unico.toLowerCase().includes(texto)) ||
      (d.donante?.nombre && d.donante.nombre.toLowerCase().includes(texto)) ||
      (d.categoria && d.categoria.toLowerCase().includes(texto))
    return matchTipo && matchTexto
  })
})

const totalMontoDonaciones = computed(() => {
  return donacionesFiltradas.value
    .filter((d) => d.tipo === 'MONETARIA')
    .reduce((acc, d) => acc + Number(d.monto || 0), 0)
})

const totalDonacionesEspecie = computed(() => {
  return donacionesFiltradas.value.filter((d) => d.tipo === 'ESPECIE').length
})

// 2. Entregas
const entregasFiltradas = computed(() => {
  const texto = busquedaEntrega.value.toLowerCase().trim()
  if (!texto) return entregas.value
  return entregas.value.filter((e) => {
    const ben = e.beneficiario?.nombre_completo || ''
    const camp = e.campana?.nombre || ''
    const num = String(e.numero_entrega ?? '')
    return (
      ben.toLowerCase().includes(texto) ||
      camp.toLowerCase().includes(texto) ||
      num.includes(texto)
    )
  })
})

const campanasUnicas = computed(() => {
  const campIds = new Set(
    entregas.value.map((e) => e.campana?.id || e.campana?.nombre).filter(Boolean)
  )
  return campIds.size
})

function obtenerNombresVoluntarios(entrega: any): string {
  const ids = (entrega.voluntarios || []).map((v: any) =>
    typeof v === 'string' ? v : v.id
  )
  const nombres = ids
    .map(
      (id: string) =>
        voluntarios.value.find((item) => item.id === id)?.nombre_completo
    )
    .filter(Boolean)
  return nombres.length > 0 ? nombres.join(', ') : 'Equipo Impacta'
}

// 3. Kardex
function esEntrada(tipoCodigo: string): boolean {
  const t = tiposMovimiento.value.find((tipo) => tipo.codigo === tipoCodigo)
  return t ? t.signo === '+' : tipoCodigo.startsWith('ENT')
}

function nombreTipoMovimiento(tipoCodigo: string): string {
  const t = tiposMovimiento.value.find((tipo) => tipo.codigo === tipoCodigo)
  return t ? t.descripcion : tipoCodigo
}

const totalKardexEntradas = computed(() => {
  return movimientos.value
    .filter((m) => esEntrada(m.tipo_movimiento))
    .reduce((acc, m) => acc + Number(m.cantidad || 0), 0)
})

const totalKardexSalidas = computed(() => {
  return movimientos.value
    .filter((m) => !esEntrada(m.tipo_movimiento))
    .reduce((acc, m) => acc + Number(m.cantidad || 0), 0)
})

// 4. Constancia de Entrega
const entregaSeleccionada = computed(() => {
  return entregas.value.find((e) => e.id === idEntregaSeleccionada.value) || null
})

const datosBeneficiarioEntrega = computed(() => {
  if (!entregaSeleccionada.value) return null
  const bId = entregaSeleccionada.value.beneficiario?.id
  return (
    beneficiarios.value.find((b) => b.id === bId) ||
    entregaSeleccionada.value.beneficiario
  )
})

const datosCampanaEntrega = computed(() => {
  if (!entregaSeleccionada.value) return null
  const cId = entregaSeleccionada.value.campana?.id
  return (
    campanas.value.find((c) => c.id === cId) ||
    entregaSeleccionada.value.campana
  )
})

// 5. Constancia de Donación
const donacionSeleccionada = computed(() => {
  return donaciones.value.find((d) => d.id === idDonacionSeleccionada.value) || null
})

const datosDonanteSeleccionado = computed(() => {
  if (!donacionSeleccionada.value) return null
  const dId = donacionSeleccionada.value.donante?.id
  return (
    donantes.value.find((d) => d.id === dId) ||
    donacionSeleccionada.value.donante
  )
})

// Acciones de descarga PDF
function generarPdfDonaciones() {
  exportarDonacionesPDF(donacionesFiltradas.value)
}

function generarPdfEntregas() {
  exportarEntregasPDF(entregasFiltradas.value, voluntarios.value)
}

function generarPdfKardex() {
  exportarKardexPDF(movimientos.value, tiposMovimiento.value)
}

function generarPdfConstanciaEntrega() {
  if (!entregaSeleccionada.value) return
  exportarConstanciaEntregaPDF(
    entregaSeleccionada.value,
    datosBeneficiarioEntrega.value,
    datosCampanaEntrega.value,
    voluntarios.value
  )
}

function generarPdfConstanciaDonacion() {
  if (!donacionSeleccionada.value) return
  exportarConstanciaDonacionPDF(
    donacionSeleccionada.value,
    datosDonanteSeleccionado.value
  )
}

function imprimirDocumento() {
  window.print()
}

onMounted(() => {
  cargarDatos()
})
</script>

<style scoped>
.reportes-page {
  padding: 32px 40px;
  max-width: 1300px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.btn-manual-download {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #123f36;
  color: white;
  text-decoration: none;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(18, 63, 54, 0.2);
  transition: all 0.2s ease;
}

.btn-manual-download:hover {
  background: #2d6a4f;
  transform: translateY(-1px);
}

.eyebrow {
  font-size: 11px;
  letter-spacing: 1.5px;
  font-weight: 700;
  color: #2d6a4f;
  text-transform: uppercase;
}

h1 {
  font-size: 28px;
  font-weight: 800;
  color: #123f36;
  margin: 4px 0 6px;
}

.page-header p {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

/* Tabs de navegación */
.report-tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 28px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 12px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #cbd5e1;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13.5px;
  font-weight: 600;
  color: #475569;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: #f8fafc;
  border-color: #94a3b8;
  color: #0f172a;
}

.tab-btn.active {
  background: #123f36;
  border-color: #123f36;
  color: white;
  box-shadow: 0 4px 12px rgba(18, 63, 54, 0.2);
}

.tab-icon {
  font-size: 15px;
}

/* Estados */
.state-card {
  padding: 40px;
  text-align: center;
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.state-card.error {
  color: #b91c1c;
}

.btn-retry {
  margin-top: 12px;
  padding: 8px 16px;
  background: #123f36;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

/* Paneles de reportes */
.report-section {
  background: white;
  border-radius: 16px;
  padding: 28px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 20px;
  flex-wrap: wrap;
}

.panel-title h2 {
  font-size: 20px;
  font-weight: 700;
  color: #123f36;
  margin: 0 0 4px;
}

.panel-title p {
  font-size: 13.5px;
  color: #64748b;
  margin: 0;
}

.actions {
  display: flex;
  gap: 10px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #2d6a4f;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #1b4332;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Barra de filtros */
.filters-bar {
  display: flex;
  gap: 16px;
  background: #f8fafc;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group.search {
  flex: 1;
  min-width: 260px;
}

.filter-group label {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

.form-select,
.form-input {
  padding: 9px 14px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 13.5px;
  background: white;
  color: #1e293b;
  outline: none;
}

.form-select.full-width {
  width: 100%;
}

.form-select:focus,
.form-input:focus {
  border-color: #2d6a4f;
  box-shadow: 0 0 0 2px rgba(45, 106, 79, 0.15);
}

/* Tarjetas KPI */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.kpi-card {
  background: #f8fafc;
  padding: 18px 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.kpi-card.highlight {
  background: #e8f5e9;
  border-color: #c8e6c9;
}

.kpi-card.highlight-green {
  background: #edf7ed;
  border-color: #b7e4c7;
}

.kpi-card.highlight-red {
  background: #fef2f2;
  border-color: #fecaca;
}

.kpi-num {
  font-size: 22px;
  font-weight: 800;
  color: #123f36;
}

.kpi-card.highlight .kpi-num {
  color: #2d6a4f;
}

.kpi-card.highlight-red .kpi-num {
  color: #b91c1c;
}

.kpi-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
}

/* Selector Card */
.selector-card {
  background: #f1f8f4;
  border: 1px solid #b7e4c7;
  padding: 18px 22px;
  border-radius: 12px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selector-card label {
  font-size: 13.5px;
  font-weight: 700;
  color: #123f36;
}

/* Tablas */
.table-container {
  overflow-x: auto;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  text-align: left;
}

.report-table th {
  background: #123f36;
  color: white;
  padding: 12px 14px;
  font-weight: 600;
  white-space: nowrap;
}

.report-table td {
  padding: 12px 14px;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
}

.report-table tbody tr:nth-child(even) {
  background: #f8fafc;
}

.report-table tbody tr:hover {
  background: #f1f5f9;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.font-bold {
  font-weight: 700;
}

.font-mono {
  font-family: monospace;
}

.text-green {
  color: #15803d;
}

.text-red {
  color: #b91c1c;
}

.empty {
  padding: 32px !important;
  color: #64748b;
  font-style: italic;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.badge-blue {
  background: #e0f2fe;
  color: #0369a1;
}

.badge-green {
  background: #dcfce7;
  color: #15803d;
}

.badge-red {
  background: #fee2e2;
  color: #b91c1c;
}

/* ========================================== */
/* ESTILOS DE CONSTANCIA OFICIAL (DOCUMENTO)  */
/* ========================================== */
.certificate-paper {
  background: white;
  border: 2px solid #b7e4c7;
  border-radius: 14px;
  padding: 40px 48px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  margin-top: 10px;
}

.cert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.cert-logo-box {
  display: flex;
  align-items: center;
  gap: 14px;
}

.cert-logo-icon {
  width: 44px;
  height: 44px;
  background: #123f36;
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.cert-org-title {
  font-size: 24px;
  font-weight: 800;
  color: #123f36;
  margin: 0;
  line-height: 1.1;
}

.cert-org-sub {
  font-size: 11px;
  color: #2d6a4f;
  font-weight: 600;
}

.cert-header-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.cert-folio {
  font-family: monospace;
  font-weight: 800;
  font-size: 14px;
  background: #f1f8f4;
  color: #123f36;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid #b7e4c7;
}

.cert-date {
  font-size: 12px;
  color: #64748b;
}

.cert-divider {
  height: 3px;
  background: linear-gradient(90deg, #123f36, #74c69d);
  margin: 20px 0 24px;
  border-radius: 2px;
}

.cert-main-title {
  text-align: center;
  font-size: 18px;
  font-weight: 800;
  color: #123f36;
  letter-spacing: 0.5px;
  margin-bottom: 28px;
  text-transform: uppercase;
}

.cert-block {
  margin-bottom: 24px;
}

.cert-block-title {
  background: #123f36;
  color: white;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 6px 14px;
  border-radius: 6px;
  margin: 0 0 12px;
}

.cert-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px 20px;
  padding: 4px 8px;
}

.cert-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cert-row.highlight-amount {
  background: #f1f8f4;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #b7e4c7;
}

.cert-field-title {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.cert-field-val {
  font-size: 14px;
  color: #0f172a;
}

.cert-statement {
  background: #f8fafc;
  border-left: 4px solid #2d6a4f;
  padding: 16px 20px;
  border-radius: 0 8px 8px 0;
  margin: 28px 0 40px;
}

.cert-statement p {
  font-size: 12.5px;
  line-height: 1.6;
  color: #334155;
  margin: 0;
}

/* Firmas */
.cert-signatures {
  display: flex;
  justify-content: space-around;
  margin: 40px 0 24px;
  gap: 30px;
  flex-wrap: wrap;
}

.sig-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 220px;
}

.sig-line {
  width: 200px;
  height: 1px;
  background: #64748b;
  margin-bottom: 8px;
}

.sig-name {
  font-size: 12px;
  font-weight: 700;
  color: #123f36;
}

.sig-role {
  font-size: 11px;
  color: #475569;
}

.sig-meta {
  font-size: 10px;
  color: #94a3b8;
}

.cert-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px dashed #cbd5e1;
  font-size: 11px;
  color: #94a3b8;
}

.empty-selection {
  text-align: center;
  padding: 48px;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 14px;
  color: #64748b;
}

.empty-selection .icon {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}

/* Impresión */
.print-only {
  display: none;
}

@media print {
  .no-print {
    display: none !important;
  }

  .print-only {
    display: block !important;
  }

  .reportes-page {
    padding: 0;
    max-width: 100%;
  }

  .report-section {
    border: none;
    box-shadow: none;
    padding: 0;
  }

  .certificate-paper {
    border: none;
    box-shadow: none;
    padding: 0;
  }

  .print-doc-header {
    margin-bottom: 20px;
    border-bottom: 2px solid #123f36;
    padding-bottom: 10px;
  }

  .print-doc-header h2 {
    margin: 0;
    font-size: 18px;
    color: #123f36;
  }

  .print-doc-header p {
    margin: 4px 0 0;
    font-size: 11px;
    color: #64748b;
  }

  /* Evitar cortes indeseados */
  .certificate-paper,
  .report-table {
    page-break-inside: avoid;
  }
}
</style>
