# Firestore Schema: IPS Análisis Estratégico (v11)

Este documento describe la estructura de las colecciones bajo la arquitectura **Nuclear Isolation** (namespace `vac_`).

## 🛡️ Aislamiento Multi-Tenant (Shield v11)

Todas las colecciones en el proyecto `prior-01` pertenecientes a esta app deben iniciar con el prefijo `vac_`. Cualquier intento de acceso fuera de este namespace está bloqueado por las políticas de compilación (`check-config.js`) y las reglas de seguridad de Firestore.

---

## 📂 Colecciones Activas

### `vac_users`
Gestión de identidad y roles de acceso.
-   **ID**: Firebase Auth UID.
-   **Campos**:
    -   `email` (string): Correo único.
    -   `role` (enum): `admin`, `editor`, `viewer`, `director`.
    -   `canViewReports` (boolean): Flag de acceso a inteligencia ejecutiva.

### `vac_weekly_data`
Datos operativos técnicos (Estado de fuerza, vacantes).
-   **ID**: `[Year]_[Week]_[UneId]` (ej. `2026_10_VAC01`).
-   **Nacional**: El ID `[Year]_[Week]_NATIONAL_DATA` reserva el dato consolidado.
-   **Campos**:
    -   `uneId`, `week`, `year` (identifiers).
    -   `edoFza`, `altas`, `bajas`, `vacantesIniciales`, `vacantesRealesFS`.

### `vac_weekly_analysis`
Informes estratégicos cualitativos y semáforos ejecutivos.
-   **ID**: `ANALYSIS_[Year]_W[Week]` (ej. `ANALYSIS_2026_W10`).
-   **Campos**:
    -   `analisisEjecutivo` (string): Markdown del informe.
    -   `semaforoVacantes` (object): { status, meta, porcentajeActual }.
    -   `termometro` (object): Items con valorReal, meta y porcentaje.

### `vac_config`
Configuración maestra del sistema.
-   **Documento: global** -> Títulos y parámetros de UI.
-   **Documento: metrics** -> Metas nacionales y periodos de sincronización (`globalPeriod`).
-   **Documento: regions** -> Lista de supervisores y editores regionales.

### `vac_unes`
Catálogo de Unidades Estratégicas y Clientes vinculados.

---

## 🔒 Políticas de Seguridad (v11.0.2)
Las `firestore.rules` imponen:
1.  **Aislamiento**: Lectura y escritura solo permitida si el usuario existe en `vac_users`.
2.  **Hard-Lock**: Acceso denegado a colecciones legacy (`stx_`, `weekly_analysis`, `dashboards`).
3.  **Privacidad**: Solo el `admin` puede modificar `vac_users` y `vac_config`.

---
*Documentación generada bajo el protocolo de Blindaje Nuclear IPS.*
