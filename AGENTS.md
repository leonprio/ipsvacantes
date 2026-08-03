# REGLAS Y PROTOCOLO DE DESARROLLO PARA AGENTES AI (IPS VACANTES)

Cualquier agente autónomo (Antigravity, Gemini, etc.) que trabaje en este repositorio DEBE cumplir estrictamente el siguiente protocolo antes de realizar modificaciones de código:

---

## 1. Obligación de Contrato y Preflight

1. **Lectura de Contrato**: El agente debe leer `docs/VACANTES_RELEASE_CONTRACT_V11.1.2.md` antes de iniciar cualquier tarea de modificación.
2. **Preflight Riguroso**:
   - Confirmar que se está trabajando en una rama de trabajo secundaria (ej. `feat/...` o `fix/...`).
   - **Prohibido** modificar o hacer commits directamente sobre la rama `main`.
   - Confirmar que el árbol de trabajo está completamente limpio (`git status --porcelain` vacío).
   - Confirmar sincronización con `origin/main`.
3. **Aislamiento**:
   - Una sola mejora o corrección por rama.
   - No mezclar código de ramas históricas o preservadas (ej. `preserve/informes-estrategicos-wip-20260729`).

---

## 2. Superficies Protegidas y Validación de Evidencia

Si el trabajo modifica cualquiera de los siguientes archivos considerados **Superficies Protegidas**:
- `App.tsx`
- `components/NationalSummary.tsx`
- `components/DashboardTable.tsx`
- `utils/calculations.ts`
- `types.ts`
- `components/weekly-analysis/AnalisisListView.tsx`
- `hooks/useWeeklyAnalysis.ts`
- `tests/utils.test.ts`

El agente **DEBE**:
1. Crear un documento de evidencia visual a partir de `docs/validation/VACANTES_VISUAL_VALIDATION_TEMPLATE.md`.
2. Registrar en dicho documento la rama, el HEAD del commit final y marcar `PASS` en las comprobaciones.
3. Ejecutar el guard pasándole la evidencia:
   ```bash
   npm run guard:release -- --evidence docs/validation/<nombre_evidencia>.md
   ```

---

## 3. Criterio de Pase y Bloqueo

- Ninguna modificación puede integrarse a `main` ni desplegarse a producción si `npm run guard:release` no ha generado una aprobación `PASS` vinculada exactamente al `HEAD` actual.
- El hook pre-push bloqueará automáticamente cualquier intento de `git push` si el `HEAD` actual no cuenta con guard aprobación vigente.
