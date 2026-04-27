# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo de versionado. 
El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

## [11.1.0] - 2026-04-27
### Added
- **Final Closure & Shielding**: Cierre técnico definitivo con blindaje de hosting (`target: ipsvac`).
- **Build Guard v3.2**: Refuerzo del script de verificación para evitar despliegues globales accidentales.
- **UI Format Match**: Ajuste del Header para coincidir con la estética de versiones anteriores (dash separator).

## [11.0.2] - 2026-03-18
### Added
- **Nuclear Isolation Architecture (v11)**: Implementación de aislamiento absoluto mediante el namespace `vac_`. Este "Air Gap" lógico garantiza que los datos de Vacantes nunca se mezclen con otras aplicaciones del mismo proyecto Firebase (como Activador).
- **Security Audit System**: Nuevos scripts de auditoría interna (`security_audit.js`) para verificar la integridad del blindaje multi-tenant antes de cada despliegue.
- **Robust Local Sorting**: Restauración del ordenamiento local en el hook `useWeeklyAnalysis` para cumplir con las reglas de blindaje v9.2.5 y evitar la "desaparición" de informes por falta de índices en Firestore.

### Changed
- **Purga de Namespaces Legacy**: Eliminación completa de referencias a colecciones `stx_` y `weekly_analysis` (sin prefijo) dentro de la aplicación de Vacantes, reforzando la independencia total del sistema.
- **Versión Distintiva**: Identificador de versión actualizado a `v11.0.2-SHIELD-UP`.

### Fixed
- **Visibilidad de Informes**: Corregido el error de consulta que impedía mostrar informes previos debido a una configuración de `orderBy` incompatible con las nuevas reglas de seguridad sin índices.
- **Aislamiento de Usuarios**: El flujo de login ahora valida estrictamente la existencia del usuario en la colección `vac_users`, bloqueando cualquier intento de acceso cruzado desde otras "burbujas" organizacionales.

## [9.2.6] - 2026-03-08
### Added
- **National Bridge Architecture**: Implementación de captura y edición directa para el dato nacional ("Total c/ Apoyos") bajo el ID reservado `NATIONAL_DATA`.
- **Functional Shield Guard (v3.2)**: Nuevo nivel de protección en `check-config.js` que audita la integridad de flujos críticos de datos antes del despliegue.
- **Role-Based Prop Enforcement**: Blindaje de los componentes `NationalSummary` y `DataEntryModal` mediante inyección obligatoria de `userRole` para asegurar permisos operativos.

### Changed
- **Direct Dashboard Editing**: Los roles ADM y EDITOR ahora pueden editar el Total Nacional directamente desde el dashboard mediante un prompt táctil integrado.
- **Visual Feedback**: Indicador dinámico de "Captura Pendiente" en el resumen nacional cuando no existen datos para la semana actual.

### Fixed
- **Desactivación de Totales**: Corregido el error que ocultaba la opción de captura nacional para administradores y editores.
- **Rollback Protection**: Prevención de regresiones funcionales mediante validación estricta de componentes en el pipeline de build.

## [9.2.5] - 2026-03-01
### Added
- **Executive Intelligence Pulse**: Nuevo indicador visual (blue pulse dot) que notifica la disponibilidad de un informe estratégico para la semana seleccionada.
- **Platinum Shield Branding**: Integración de marca "Análisis Ejecutivo por León Prior" en el acceso a inteligencia estratégica.
- **Metadatos Optimizados**: Configuración de Open Graph y metatags para una presentación limpia en WhatsApp y redes sociales (evitando duplicidad de información).

### Changed
- **Acceso Directo Estratégico**: Rediseño del botón de acceso a informes, ahora prominente y con jerarquía visual superior ("IPS: Análisis Estratégico de Vacantes").
- **Robust ID System**: Los informes semanales ahora utilizan un identificador determinista (`ANALYSIS_YYYY_WX`) para prevenir colisiones y asegurar la persistencia tras despliegues.
- **Privacidad Elevada**: La visualización de la versión de la app ahora es exclusiva para el rol Administrador.

### Fixed
- **Desaparición de Informes**: Optimizada la lógica de consulta en Firestore eliminando `orderBy` del servidor y realizando ordenamiento local, garantizando que los informes se recuperen siempre de forma consistente.
- **UX Touch Targets**: Incrementado el área táctil del botón de cierre en el modal de informes (44px) siguiendo la regla UX001.

## [8.1.7] - 2026-02-21
### Added
- **Multi-tenant Shield Guard (v3.1)**: Nuevo sistema de escaneo automático (`scripts/check-config.js`) sobre transacciones en base de datos. Si detecta colecciones locales de React fuera de la burbuja (espacio de nombres) de `stx_`, cancelará los pipelines de compilación e impedirá contaminación cruzada con el "Activador" y "Prior IA".
- **Documentation Docs (`generate-docs` workflow)**: Implementación de la documentación formal automatizada, JSDocs y diagramado. 

### Changed
- **Modo Presentación Minimalista (Anti-Clutter)**: El botón "Presentation" limpia completamente el menú superior, ocultando credenciales, roles, alertas, importadores y acceso de configuración de administrador, enfocando 100% de la UI en los dashboards analíticos.
- **Configuración estricta de Roles**: La UI respeta visualizaciones de componentes con colores condicionales (Admin / Editor / Viewer / Director) para una diferenciación ejecutiva.
- Sincronización a nivel del proyecto de versión a la `v8.1.7-FULLY-SHIELDED`.

### Fixed
- **User Delete Error (Firestore)**: Solución crítica para el borrado de usuarios (`handleDeleteUser`). Al listar usuarios, el identificador (`d.id`) se encadena ahora estrictamente al renderizado de datos. Anteriormente, generaba "Error de Permisos" por enviar al manejador un parámetro `undefined`.
- **Race Condition de Carga de Usuarios**: La interfaz bloquea correctamente el acceso hasta confirmar roles directos de `stx_users`, reparando el falso login visual para directivos mostrados como "viewers".
