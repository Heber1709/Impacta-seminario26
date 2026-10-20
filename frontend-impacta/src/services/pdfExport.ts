import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// Colores institucionales de IMPACTA
const PRIMARY_COLOR: [number, number, number] = [18, 63, 54] // #123f36
const SECONDARY_COLOR: [number, number, number] = [45, 106, 79] // #2d6a4f
const ACCENT_COLOR: [number, number, number] = [116, 198, 157] // #74c69d
const TEXT_MUTED: [number, number, number] = [120, 140, 135]

function addHeader(
  doc: jsPDF,
  title: string,
  subtitle = 'Sistema de Asistencia Social y Gestión de Donaciones'
) {
  const pageWidth = doc.internal.pageSize.getWidth()

  // Banda superior
  doc.setFillColor(...PRIMARY_COLOR)
  doc.rect(0, 0, pageWidth, 28, 'F')

  // Acento de color
  doc.setFillColor(...ACCENT_COLOR)
  doc.rect(0, 28, pageWidth, 2, 'F')

  // Título e isotipo en blanco
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('IMPACTA', 14, 14)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.text(subtitle, 14, 21)

  // Fecha y hora a la derecha
  const fecha = new Date().toLocaleString('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  doc.setFontSize(8)
  doc.text(`Emisión: ${fecha}`, pageWidth - 14, 14, { align: 'right' })
  doc.text('Documento Oficial Verificado', pageWidth - 14, 21, {
    align: 'right',
  })

  // Título del reporte abajo de la barra
  doc.setTextColor(...PRIMARY_COLOR)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(title.toUpperCase(), 14, 38)

  doc.setDrawColor(...ACCENT_COLOR)
  doc.setLineWidth(0.5)
  doc.line(14, 41, pageWidth - 14, 41)
}

function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setDrawColor(220, 225, 222)
    doc.setLineWidth(0.5)
    doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...TEXT_MUTED)
    doc.text(
      'IMPACTA - Plataforma de Asistencia Social | Documento para control administrativo y auditoría',
      14,
      pageHeight - 9
    )
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, pageHeight - 9, {
      align: 'right',
    })
  }
}

// 1. REPORTE: LISTADO DE DONACIONES
export function exportarDonacionesPDF(donaciones: any[]) {
  const doc = new jsPDF('landscape')
  const title = 'Listado Oficial de Donaciones Registradas'
  addHeader(doc, title)

  // Resumen
  const total = donaciones.length
  const monetarias = donaciones.filter((d) => d.tipo === 'MONETARIA')
  const totalMonetario = monetarias.reduce(
    (acc, d) => acc + Number(d.monto || 0),
    0
  )
  const especie = donaciones.filter((d) => d.tipo === 'ESPECIE').length

  doc.setFontSize(9)
  doc.setTextColor(...SECONDARY_COLOR)
  doc.text(
    `Total registros: ${total}   |   Donaciones Monetarias: ${monetarias.length} (Q${totalMonetario.toLocaleString('es-GT', { minimumFractionDigits: 2 })})   |   Donaciones en Especie: ${especie}`,
    14,
    47
  )

  const rows = donaciones.map((d, index) => [
    index + 1,
    d.codigo_unico || `DON-${d.id}`,
    d.fecha_ingreso || 'N/D',
    d.donante?.nombre || 'Anónimo',
    d.tipo || 'N/D',
    d.categoria || 'N/D',
    d.monto
      ? `Q ${Number(d.monto).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`
      : 'En Especie',
  ])

  autoTable(doc, {
    startY: 52,
    head: [
      [
        '#',
        'Código Único',
        'Fecha Ingreso',
        'Donante',
        'Tipo',
        'Categoría',
        'Monto / Modalidad',
      ],
    ],
    body: rows,
    theme: 'striped',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: [246, 250, 248],
    },
  })

  addFooter(doc)
  doc.save(`impacta_listado_donaciones_${Date.now()}.pdf`)
}

// 2. REPORTE: LISTADO DE ENTREGAS
export function exportarEntregasPDF(entregas: any[], voluntariosList: any[] = []) {
  const doc = new jsPDF('landscape')
  const title = 'Listado Oficial de Entregas de Ayuda Humanitaria'
  addHeader(doc, title)

  const total = entregas.length
  doc.setFontSize(9)
  doc.setTextColor(...SECONDARY_COLOR)
  doc.text(
    `Total de Entregas Realizadas: ${total}   |   Comprobadas con acta institucional`,
    14,
    47
  )

  const rows = entregas.map((e, index) => {
    const volIds = (e.voluntarios || []).map((v: any) =>
      typeof v === 'string' ? v : v.id
    )
    const volNombres = volIds
      .map(
        (id: string) =>
          voluntariosList.find((item) => item.id === id)?.nombre_completo
      )
      .filter(Boolean)
      .join(', ')

    return [
      index + 1,
      `#${e.numero_entrega ?? e.id}`,
      e.fecha || 'N/D',
      e.beneficiario?.nombre_completo || 'Sin beneficiario asignado',
      e.campana?.nombre || 'General / Sin Campaña',
      volNombres || 'Equipo de Asistencia',
      e.evidencia_url ? 'Fotografía/Acta' : 'Registrada',
    ]
  })

  autoTable(doc, {
    startY: 52,
    head: [
      [
        '#',
        'No. Entrega',
        'Fecha',
        'Beneficiario',
        'Campaña',
        'Voluntarios Asignados',
        'Evidencia',
      ],
    ],
    body: rows,
    theme: 'striped',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: [246, 250, 248],
    },
  })

  addFooter(doc)
  doc.save(`impacta_listado_entregas_${Date.now()}.pdf`)
}

// 3. REPORTE: LISTADO DE MOVIMIENTOS DE INVENTARIO (KARDEX)
export function exportarKardexPDF(movimientos: any[], tipos: any[] = []) {
  const doc = new jsPDF('landscape')
  const title = 'Kardex Oficial de Movimientos de Inventario'
  addHeader(doc, title)

  const totalEntradas = movimientos
    .filter((m) => {
      const t = tipos.find((tipo) => tipo.codigo === m.tipo_movimiento)
      return t?.signo === '+'
    })
    .reduce((acc, m) => acc + Number(m.cantidad || 0), 0)

  const totalSalidas = movimientos
    .filter((m) => {
      const t = tipos.find((tipo) => tipo.codigo === m.tipo_movimiento)
      return t?.signo === '-'
    })
    .reduce((acc, m) => acc + Number(m.cantidad || 0), 0)

  const saldo = totalEntradas - totalSalidas

  doc.setFontSize(9)
  doc.setTextColor(...SECONDARY_COLOR)
  doc.text(
    `Total Entradas (+): ${totalEntradas} unidades   |   Total Salidas (-): ${totalSalidas} unidades   |   Existencia Neta: ${saldo} unidades`,
    14,
    47
  )

  const rows = movimientos.map((m, index) => {
    const t = tipos.find((tipo) => tipo.codigo === m.tipo_movimiento)
    const signo = t?.signo ?? (m.tipo_movimiento?.startsWith('ENT') ? '+' : '-')
    const descripcionTipo = t?.descripcion ?? m.tipo_movimiento
    const referencia = m.entrega
      ? `Entrega #${m.entrega.numero_entrega}`
      : m.donacion
        ? `Donación ${m.donacion.codigo_unico || m.donacion.id}`
        : 'Ajuste interno'

    return [
      index + 1,
      m.id || `MOV-${index + 1}`,
      m.fecha_movimiento || 'N/D',
      `${signo} ${descripcionTipo}`,
      signo === '+' ? m.cantidad : `-${m.cantidad}`,
      m.donacion?.categoria || 'General',
      referencia,
      m.observaciones || 'Sin observaciones',
    ]
  })

  autoTable(doc, {
    startY: 52,
    head: [
      [
        '#',
        'Folio Mov.',
        'Fecha',
        'Tipo de Movimiento',
        'Cantidad',
        'Categoría',
        'Referencia / Asignación',
        'Observaciones',
      ],
    ],
    body: rows,
    theme: 'striped',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: [246, 250, 248],
    },
  })

  addFooter(doc)
  doc.save(`impacta_kardex_inventario_${Date.now()}.pdf`)
}

// 4. CONSTANCIA DE ENTREGA
export function exportarConstanciaEntregaPDF(
  entrega: any,
  beneficiario: any = null,
  campana: any = null,
  voluntariosList: any[] = []
) {
  const doc = new jsPDF('portrait')
  const pageWidth = doc.internal.pageSize.getWidth()

  // Encabezado institucional
  addHeader(
    doc,
    'Constancia Oficial de Entrega de Ayuda Humanitaria',
    'Programa de Asistencia Social e Inclusión Social'
  )

  let y = 48

  // Cuadro con Folio y Fecha
  doc.setFillColor(244, 248, 246)
  doc.roundedRect(14, y, pageWidth - 28, 16, 2, 2, 'F')
  doc.setDrawColor(...ACCENT_COLOR)
  doc.roundedRect(14, y, pageWidth - 28, 16, 2, 2, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...PRIMARY_COLOR)
  doc.text(`ACTA / CONSTANCIA NO: #${entrega.numero_entrega ?? entrega.id}`, 20, y + 10)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(
    `FECHA DE ENTREGA: ${entrega.fecha || new Date().toISOString().split('T')[0]}`,
    pageWidth - 20,
    y + 10,
    { align: 'right' }
  )

  y += 24

  // Datos del Beneficiario
  doc.setFillColor(...PRIMARY_COLOR)
  doc.rect(14, y, pageWidth - 28, 7, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('I. DATOS DEL BENEFICIARIO RECEPTOR', 18, y + 5)

  y += 10
  const benNombre = beneficiario?.nombre_completo ?? entrega.beneficiario?.nombre_completo ?? 'N/D'
  const benDpi = beneficiario?.dpi ?? 'N/D'
  const benDir = beneficiario?.direccion ?? 'N/D'
  const benIntegrantes = beneficiario?.integrantes_hogar ?? 'N/D'

  doc.setFontSize(8.5)
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'bold')
  doc.text('Nombre Completo:', 16, y)
  doc.setFont('helvetica', 'normal')
  doc.text(`${benNombre}`, 50, y)

  y += 6
  doc.setFont('helvetica', 'bold')
  doc.text('DPI / Identificación:', 16, y)
  doc.setFont('helvetica', 'normal')
  doc.text(`${benDpi}`, 50, y)

  y += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Dirección Domiciliar:', 16, y)
  doc.setFont('helvetica', 'normal')
  doc.text(`${benDir}`, 50, y)

  y += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Integrantes Hogar:', 16, y)
  doc.setFont('helvetica', 'normal')
  doc.text(`${benIntegrantes} personas`, 50, y)

  y += 12

  // Datos de la Campaña y Entrega
  doc.setFillColor(...PRIMARY_COLOR)
  doc.rect(14, y, pageWidth - 28, 7, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('II. PROGRAMA Y DETALLE DE LA AYUDA ENTREGADA', 18, y + 5)

  y += 10
  const campNombre = campana?.nombre ?? entrega.campana?.nombre ?? 'Asistencia Social Directa'
  const campObjetivo = campana?.objetivo ?? 'Apoyo humanitario y entrega de insumos de primera necesidad.'

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(40, 40, 40)
  doc.text('Campaña / Programa:', 16, y)
  doc.setFont('helvetica', 'normal')
  doc.text(`${campNombre}`, 52, y)

  y += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Objetivo Social:', 16, y)
  doc.setFont('helvetica', 'normal')
  const lineasObj = doc.splitTextToSize(campObjetivo, pageWidth - 70)
  doc.text(lineasObj, 52, y)
  y += lineasObj.length * 5 + 4

  // Voluntarios asignados
  const volIds = (entrega.voluntarios || []).map((v: any) =>
    typeof v === 'string' ? v : v.id
  )
  const volNombres = volIds
    .map(
      (id: string) =>
        voluntariosList.find((item) => item.id === id)?.nombre_completo
    )
    .filter(Boolean)
    .join(', ') || 'Equipo de Asistencia Social Impacta'

  doc.setFont('helvetica', 'bold')
  doc.text('Voluntarios Responsables:', 16, y)
  doc.setFont('helvetica', 'normal')
  doc.text(`${volNombres}`, 58, y)

  y += 14

  // Declaración formal de conformidad
  doc.setFillColor(250, 252, 251)
  doc.roundedRect(14, y, pageWidth - 28, 28, 2, 2, 'F')
  doc.setDrawColor(210, 220, 215)
  doc.roundedRect(14, y, pageWidth - 28, 28, 2, 2, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...PRIMARY_COLOR)
  doc.text('DECLARACIÓN DE RECEPCIÓN CONFORME Y AUDITORÍA SOCIAL:', 18, y + 7)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(70, 70, 70)
  const textoDeclaracion =
    'Por este medio se hace constar que los bienes e insumos detallados han sido entregados y recibidos a entera satisfacción del beneficiario, bajo los principios de gratuidad, transparencia y no discriminación del programa IMPACTA. Los recursos provienen de donaciones canalizadas exclusivamente con fines sociales y comunitarios.'
  const lineasDeclaracion = doc.splitTextToSize(textoDeclaracion, pageWidth - 36)
  doc.text(lineasDeclaracion, 18, y + 13)

  y += 42

  // Firmas
  const col1 = 30
  const col2 = pageWidth / 2 + 15
  const anchoLinea = 55

  doc.setDrawColor(120, 120, 120)
  doc.setLineWidth(0.5)

  doc.line(col1, y, col1 + anchoLinea, y)
  doc.line(col2, y, col2 + anchoLinea, y)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...PRIMARY_COLOR)
  doc.text('Firma del Beneficiario(a)', col1 + anchoLinea / 2, y + 5, { align: 'center' })
  doc.text('Firma / Sello Responsable Entrega', col2 + anchoLinea / 2, y + 5, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...TEXT_MUTED)
  doc.text(`DPI: ${benDpi}`, col1 + anchoLinea / 2, y + 9, { align: 'center' })
  doc.text('IMPACTA Asistencia Social', col2 + anchoLinea / 2, y + 9, { align: 'center' })

  addFooter(doc)
  doc.save(`impacta_constancia_entrega_${entrega.numero_entrega ?? entrega.id}.pdf`)
}

// 5. CONSTANCIA DE DONACIÓN
export function exportarConstanciaDonacionPDF(donacion: any, donante: any = null) {
  const doc = new jsPDF('portrait')
  const pageWidth = doc.internal.pageSize.getWidth()

  addHeader(
    doc,
    'Constancia Oficial de Recepción de Donación',
    'Gestión Transparente de Fondos y Recursos Sociales'
  )

  let y = 48

  // Cuadro con Código y Fecha
  doc.setFillColor(244, 248, 246)
  doc.roundedRect(14, y, pageWidth - 28, 16, 2, 2, 'F')
  doc.setDrawColor(...ACCENT_COLOR)
  doc.roundedRect(14, y, pageWidth - 28, 16, 2, 2, 'S')

  const codigo = donacion.codigo_unico || `DON-${donacion.id}`
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...PRIMARY_COLOR)
  doc.text(`RECIBO / CONSTANCIA NO: ${codigo}`, 20, y + 10)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(
    `FECHA DE INGRESO: ${donacion.fecha_ingreso || new Date().toISOString().split('T')[0]}`,
    pageWidth - 20,
    y + 10,
    { align: 'right' }
  )

  y += 24

  // Datos del Donante
  doc.setFillColor(...PRIMARY_COLOR)
  doc.rect(14, y, pageWidth - 28, 7, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('I. INFORMACIÓN DEL DONANTE', 18, y + 5)

  y += 10
  const donNombre = donante?.nombre ?? donacion.donante?.nombre ?? 'Donante Anónimo / Benefactor'
  const donTipo = donante?.tipo ?? donacion.donante?.tipo ?? 'INDIVIDUAL'
  const donEmail = donante?.email ?? 'No registrado'
  const donTel = donante?.telefono ?? 'No registrado'

  doc.setFontSize(8.5)
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'bold')
  doc.text('Nombre / Razón Social:', 16, y)
  doc.setFont('helvetica', 'normal')
  doc.text(`${donNombre}`, 58, y)

  y += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Tipo de Donante:', 16, y)
  doc.setFont('helvetica', 'normal')
  doc.text(`${donTipo}`, 58, y)

  y += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Correo Electrónico:', 16, y)
  doc.setFont('helvetica', 'normal')
  doc.text(`${donEmail}`, 58, y)

  y += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Teléfono de Contacto:', 16, y)
  doc.setFont('helvetica', 'normal')
  doc.text(`${donTel}`, 58, y)

  y += 12

  // Detalle de la donación
  doc.setFillColor(...PRIMARY_COLOR)
  doc.rect(14, y, pageWidth - 28, 7, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('II. ESPECIFICACIÓN DE LA DONACIÓN RECIBIDA', 18, y + 5)

  y += 10
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(40, 40, 40)
  doc.text('Modalidad:', 16, y)
  doc.setFont('helvetica', 'normal')
  doc.text(`${donacion.tipo || 'N/D'}`, 58, y)

  y += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Categoría Asignada:', 16, y)
  doc.setFont('helvetica', 'normal')
  doc.text(`${donacion.categoria || 'FONDO GENERAL'}`, 58, y)

  y += 6
  if (donacion.tipo === 'MONETARIA' || donacion.monto) {
    const valorMonetario = Number(donacion.monto || 0).toLocaleString('es-GT', {
      minimumFractionDigits: 2,
    })
    doc.setFont('helvetica', 'bold')
    doc.text('Monto Monetario:', 16, y)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...SECONDARY_COLOR)
    doc.text(`Q ${valorMonetario}`, 58, y)
    y += 6
  }

  // Cuadro con certificación y agradecimiento
  y += 6
  doc.setFillColor(250, 252, 251)
  doc.roundedRect(14, y, pageWidth - 28, 30, 2, 2, 'F')
  doc.setDrawColor(210, 220, 215)
  doc.roundedRect(14, y, pageWidth - 28, 30, 2, 2, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...PRIMARY_COLOR)
  doc.text('CERTIFICACIÓN INSTITUCIONAL DE RECEPCIÓN:', 18, y + 7)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(70, 70, 70)
  const textoCert =
    'La plataforma IMPACTA certifica por este medio haber recibido a entera satisfacción los recursos descritos, los cuales serán aplicados con estricta transparencia y diligencia a las causas sociales y programas comunitarios autorizados. Agradecemos profundamente su valioso compromiso solidario.'
  const lineasCert = doc.splitTextToSize(textoCert, pageWidth - 36)
  doc.text(lineasCert, 18, y + 13)

  y += 45

  // Firmas
  const col1 = 30
  const col2 = pageWidth / 2 + 15
  const anchoLinea = 55

  doc.setDrawColor(120, 120, 120)
  doc.setLineWidth(0.5)

  doc.line(col1, y, col1 + anchoLinea, y)
  doc.line(col2, y, col2 + anchoLinea, y)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...PRIMARY_COLOR)
  doc.text('Tesorería / Administración', col1 + anchoLinea / 2, y + 5, {
    align: 'center',
  })
  doc.text('Sello y Visto Bueno Institucional', col2 + anchoLinea / 2, y + 5, {
    align: 'center',
  })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...TEXT_MUTED)
  doc.text('IMPACTA Plataforma Social', col1 + anchoLinea / 2, y + 9, {
    align: 'center',
  })
  doc.text('Control y Auditoría de Donaciones', col2 + anchoLinea / 2, y + 9, {
    align: 'center',
  })

  addFooter(doc)
  doc.save(`impacta_constancia_donacion_${codigo}.pdf`)
}
