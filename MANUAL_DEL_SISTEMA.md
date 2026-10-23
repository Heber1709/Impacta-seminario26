# Manual del Sistema — Plataforma IMPACTA

**Sistema Integral de Gestión de Donaciones, y Asistencia Social**
*Documento Oficial de Operación, Arquitectura Funcional y Guía de Usuario*

---

## 1. Introducción y Propósito del Sistema

**IMPACTA** es una plataforma tecnológica diseñada para optimizar, centralizar y transparentar los procesos de captación de donaciones, administración de inventarios de ayuda humanitaria y entrega de suministros a familias e individuos en situación de vulnerabilidad.

El sistema garantiza una cadena de custodia clara y auditable: desde el momento en que un donante entrega un recurso (monetario o en especie), su ingreso y clasificación en el inventario (Kardex), hasta su asignación y entrega física a un beneficiario dentro de una campaña comunitaria con respaldo documental en PDF.

---

## 2. Mapa de Actores del Sistema

El sistema contempla **6 actores clave**, cada uno con responsabilidades y niveles de acceso específicos:

| Actor                              | Tipo de Acceso               | Descripción y Responsabilidad Principal                                                                                                                                                                       |
| :--------------------------------- | :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Administrador General** | Interno (Acceso Total)       | Máxima autoridad del sistema. Gestiona cuentas de usuarios, asigna y restringe permisos por módulo, parametriza catálogos geográficos y tipos de movimiento, y supervisa la auditoría global.             |
| **2. Coordinador**           | Interno (Gestión Operativa) | Planifica y lidera campañas sociales. Supervisa donaciones, coordina el inventario de almacén, organiza a los equipos de voluntarios y aprueba las rutas y cronogramas de entrega.                           |
| **3. Voluntario**            | Interno (Campo y Operación) | Personal operativo en territorio. Registra entregas directas a beneficiarios, recaba firmas de recepción conforme, carga evidencias y apoya en la logística de distribución.                                |
| **4. Donante**               | Externo (Benefactor)         | Personas individuales o entidades jurídicas (empresas, fundaciones) que aportan recursos monetarios o insumos en especie. Recibe constancias oficiales emitidas por el sistema.                               |
| **5. Beneficiario**          | Externo (Receptor de Ayuda)  | Ciudadano, familia o comunidad receptora de la ayuda social. Está plenamente identificado con DPI, dirección y número de integrantes del hogar para evitar duplicidades.                                    |
| **6. Auditor**               | Interno / Fiscalizador       | Rol enfocado en la transparencia, rendición de cuentas y control interno. Monitorea los movimientos del Kardex, consulta reportes consolidados y valida la correspondencia entre lo ingresado y lo entregado. |

---

## 3. Matriz de Permisos y Control de Acceso (RBAC)

El acceso a cada sección del sistema se rige bajo el principio de menor privilegio, con tres acciones disponibles por módulo: **Consultar**, **Agregar** y **Editar**:

| Módulo                              |        Administrador        |         Coordinador         |         Voluntario         |         Auditor         |
| :----------------------------------- | :--------------------------: | :--------------------------: | :------------------------: | :----------------------: |
| **Usuarios y Roles**           | Consultar / Agregar / Editar |         Solo Lectura         |         Sin Acceso         |       Solo Lectura       |
| **Matriz de Permisos**         |        Gestión Total        |          Sin Acceso          |         Sin Acceso         |       Solo Lectura       |
| **Departamentos y Municipios** | Consultar / Agregar / Editar |          Consultar          |         Consultar         |        Consultar        |
| **Donantes**                   | Consultar / Agregar / Editar | Consultar / Agregar / Editar |         Consultar         |        Consultar        |
| **Donaciones**                 | Consultar / Agregar / Editar | Consultar / Agregar / Editar |         Consultar         |        Consultar        |
| **Inventario (Kardex)**        | Consultar / Agregar / Editar | Consultar / Agregar / Editar |         Consultar         |        Consultar        |
| **Tipos de Movimiento**        | Consultar / Agregar / Editar |          Consultar          |         Sin Acceso         |        Consultar        |
| **Campañas Sociales**         | Consultar / Agregar / Editar | Consultar / Agregar / Editar |         Consultar         |        Consultar        |
| **Beneficiarios**              | Consultar / Agregar / Editar | Consultar / Agregar / Editar |    Consultar / Agregar    |        Consultar        |
| **Voluntarios**                | Consultar / Agregar / Editar | Consultar / Agregar / Editar |         Consultar         |        Consultar        |
| **Entregas de Ayuda**          | Consultar / Agregar / Editar | Consultar / Agregar / Editar |    Consultar / Agregar    |        Consultar        |
| **Reportes y Constancias PDF** |      Generación Total      |      Generación Total      | Generación de Constancias | Generación y Auditoría |

---

## 4. Flujo Operativo Integral del Sistema

El flujo de trabajo de IMPACTA está interconectado de manera lógica y secuencial a través de 5 fases operativas:

```
[FASE 1: Gobernanza]        [FASE 2: Territorio]
Usuario ➔ Permisos          Departamentos ➔ Municipios
        │                               │
        ▼                               ▼
[FASE 3: Captación]         [FASE 4: Almacén y Kardex]
Donante ➔ Donaciones ────➔  Inventario (Tipos Movimiento + / -)
                                        │
                                        ▼
                            [FASE 5: Ejecución Humanitaria]
                            Entrega ➔ Beneficiario ➔ Campaña ➔ Voluntarios
                                        │
                                        ▼
                            [FASE 6: Transparencia]
                            Constancias Oficiales y Reportes PDF
```

---

### Fase 1: Gobernanza y Seguridad (`Usuario ➔ Permisos`)

1. **Acceso al Sistema:** El inicio de sesión se realiza mediante Google OAuth 2.0. Solo los correos autorizados por el Administrador pueden acceder a la plataforma.
2. **Asignación de Roles:** Se clasifica al usuario en Administrador, Coordinador o Voluntario.
3. **Parametrización de Permisos:** El Administrador activa o desactiva de forma granular los permisos de consultar, agregar o editar para cada sección.

### Fase 2: Configuración Territorial (`Departamentos ➔ Municipios`)

1. **Catálogo de Departamentos:** Se registran los departamentos geográficos (ej. Guatemala, Sacatepéquez, Quetzaltenango).
2. **Catálogo de Municipios:** Cada municipio está estrictamente enlazado a su respectivo departamento mediante llave foránea (`codigo_departamento`).
3. **Uso transversal:** Este catálogo normaliza las direcciones de beneficiarios y voluntarios, garantizando datos limpios para estadísticas y geolocalización.

### Fase 3: Captación de Recursos (`Donante ➔ Donaciones`)

1. **Registro del Donante:** Se ingresa a la persona individual o empresa benefactora (Nombre, Tipo, Correo, Teléfono).
2. **Recepción de la Donación:**
   - **Donación Monetaria:** Se registra el monto exacto en Quetzales (Q), categoría (ej. Fondo General, Educación, Salud) y fecha de ingreso.
   - **Donación en Especie:** Se registra la categoría de bienes (ej. Alimentos, Medicinas, Ropa), descripción y fotografía/respaldo digital.
3. **Generación de Código Único:** El sistema genera un identificador oficial e irrepetible (ej. `DON-2026-001`).

### Fase 4: Almacén y Trazabilidad (`Inventario ➔ Tipos de Movimiento ➔ Donaciones`)

1. **Definición de Tipos de Movimiento:** Cada movimiento tiene un signo matemático:
   - Signo `+` (Entrada): Por donación recibida (`ENT-DON`), por ajuste de inventario (`ENT-AJU`).
   - Signo `−` (Salida): Por entrega a beneficiario (`SAL-ENT`), por merma o vencimiento (`SAL-MER`).
2. **Registro de Movimiento en Kardex:**
   - Al recibir una donación en especie, se genera automáticamente o manualmente un movimiento de entrada ligado al código de la donación.
   - El inventario registra cantidad, fecha de ingreso, fecha de vencimiento y observaciones.
3. **Balance de Existencias:** En todo momento, el Kardex calcula:
   $$
   \text{Existencia Neta} = \sum(\text{Entradas}) - \sum(\text{Salidas})
   $$

### Fase 5: Ejecución de Ayuda Humanitaria (`Entrega ➔ Beneficiario ➔ Campaña ➔ Voluntarios`)

1. **Padrón de Beneficiarios:** Registro del beneficiario receptor con su Documento Personal de Identificación (DPI de 13 dígitos), dirección, integrantes del núcleo familiar y ubicación geográfica (Departamento/Municipio).
2. **Definición de la Campaña:** Se crea la campaña social con sus objetivos, fechas de vigencia y metas programadas (económicas o de unidades de producto).
3. **Asignación de Voluntarios:** Se selecciona al personal voluntario responsable de la logística y entrega en campo.
4. **Registro de la Entrega:** Se genera el folio de entrega vinculando formalmente:
   - Número correlativo de entrega.
   - Beneficiario receptor.
   - Campaña social patrocinadora.
   - Voluntarios acreditados.
   - Descarga de inventario asociada (movimiento de salida en Kardex).

---

## 5. Módulo de Reportes Oficiales y Exportación a PDF

El sistema cuenta con un centro de documentación y control administrativo (`/reportes`) que permite previsualizar, imprimir y descargar en formato PDF 5 documentos oficiales:

### 1. Listado Consolidado de Donaciones

- **Contenido:** Tabla completa con código único, fecha de ingreso, nombre del donante, modalidad (Monetaria / Especie), categoría y montos.
- **Métricas:** Conteo total de donaciones, sumatoria total de fondos monetarios en Quetzales y total de aportes en especie.
- **Filtros:** Por tipo de donación y búsqueda por donante o código.

### 2. Listado Oficial de Entregas

- **Contenido:** Historial de entregas con número correlativo, fecha de ejecución, beneficiario acreditado, campaña correspondiente y voluntarios asignados.
- **Métricas:** Total de entregas realizadas y conteo de campañas activas impactadas.

### 3. Kardex de Movimientos de Inventario

- **Contenido:** Folio del movimiento, fecha, tipo de movimiento con su signo (+/−), cantidad de unidades, categoría, referencia a la donación o entrega asociada y observaciones.
- **Métricas:** Total de unidades ingresadas (+), total de unidades egresadas (−) y saldo neto de existencias en almacén.

### 4. Constancia Oficial de Entrega de Ayuda Humanitaria

- **Propósito:** Documento individual legal y formal para respaldo del beneficiario y auditoría social.
- **Elementos del documento:**
  - Membrete institucional oficial de IMPACTA con folio único y fecha.
  - **Sección I:** Datos completos del beneficiario (Nombre, DPI, Dirección, Integrantes del hogar).
  - **Sección II:** Programa y campaña comunitaria de procedencia de los fondos/insumos.
  - **Sección III:** Voluntarios responsables acreditados.
  - **Declaración Institucional:** Cláusula de recepción conforme bajo principios de gratuidad y transparencia.
  - **Firmas:** Espacio para firma del beneficiario (con DPI) y firma/sello del responsable voluntario de entrega.

### 5. Constancia Oficial de Recepción de Donación

- **Propósito:** Comprobante institucional extendido al donante como constancia formal de su aporte solidario.
- **Elementos del documento:**
  - Membrete institucional oficial de IMPACTA con número de recibo oficial y fecha.
  - **Sección I:** Datos del donante (Nombre / Razón Social, Tipo Individual o Empresa, Contacto).
  - **Sección II:** Especificación del aporte (Modalidad Monetaria con monto en Q o en Especie con categoría).
  - **Certificación de Probidad:** Declaración de compromiso de uso transparente para fines sociales comunitarios.
  - **Firmas:** Firma autorizada de Tesorería/Administración y Sello Oficial de Recepción.

---

## 6. Políticas de Seguridad, Integridad y Auditoría

1. **Autenticación Fuerte:** Todos los accesos se autentican a través de Google OAuth 2.0 y se emite un JWT firmado (`HS256`) con expiración temporal.
2. **Cero Auto-Registro:** Ninguna persona ajena puede ingresar al sistema aunque posea una cuenta de Google si su correo electrónico no ha sido previamente autorizado en la base de datos por el Administrador.
3. **Trazabilidad Inmutable:** Cada entrega de ayuda humanitaria y cada salida de inventario genera un identificador único que impide alteraciones retrospectivas sin dejar rastro de auditoría.
4. **Protección de Datos Personales:** Los datos sensibles de beneficiarios (DPI, composición familiar, dirección) son resguardados bajo control de acceso estricto y solo accesibles por personal operativo autorizado.
