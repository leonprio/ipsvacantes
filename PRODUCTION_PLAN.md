# IPS - Análisis Estratégico de Vacantes: Memoria Técnica y Plan de Producción

## 1. Descripción del Sistema
El "Sistema Tablero Prior" (IPS - Análisis Estratégico de Vacantes) es una plataforma corporativa diseñada para el monitoreo en tiempo real de la fuerza laboral y la gestión estratégica de vacantes. Permite a los administradores y editores visualizar indicadores clave de desempeño (KPIs) a nivel nacional y regional.

## 2. Versión Actual
**Versión:** 6.9.0 (Blindada)
**TSP+ OK:** Integración completa con la región TSP+.

## 3. Arquitectura Técnica
- **Frontend:** React 19.0.0, TypeScript.
- **Bundler:** Vite 6.0.5.
- **Visualización:** Recharts 2.15.0.
- **Iconografía:** Lucide-React.
- **Estilos:** Vanilla CSS / Tailwind (configurado en App.tsx).
- **Despliegue:** Firebase Hosting.

## 4. Estrategia de Blindaje (Data Shielding)
El sistema implementa un "Error Shield" y mecanismos de persistencia local (localStorage) con claves versionadas:
- `ips_v6_data_shielded`: Almacena los registros semanales.
- `ips_v6_metrics_shielded`: Almacena las metas y umbrales.
- `ips_v6_users_shielded`: Control de acceso y roles.
- `ips_v6_title_shielded`: Título personalizado del reporte.

### Mecanismos de Integridad:
- **ErrorShield:** Componente de alto nivel que detecta brechas en el localStorage y ofrece una opción de restauración forzada.
- **Confirmación de Eliminación:** Doble factor de confirmación para borrado de usuarios o datos críticos.

## 5. Gestión de Usuarios y Roles
1. **ADMINISTRADOR:** Control total de usuarios, configuración de metas regionales y edición de títulos.
2. **EDITOR:** Captura de datos semanales y comentarios tácticos.
3. **VISUALIZADOR:** Acceso de solo lectura a tableros y gráficas.

## 6. Próximos Pasos (Hoja de Ruta)
- Consolidación de la vista nacional en filas estrechas para mayor densidad.
- Implementación de etiquetas semafóricas (CRÍTICO, EN ATENCIÓN, SALUDABLE) de lectura rápida.
- Optimización de carga CSV para mapeo dinámico de UNES.

---
© 2026 IAPRIORI CONSULTING • Versión 6.9.0
