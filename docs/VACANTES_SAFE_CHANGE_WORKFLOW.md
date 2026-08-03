# PROTOCOLO Y FLUJO DE CAMBIO SEGURO (VACANTES IPS)

Este documento detalla el procedimiento obligatorio paso a paso para realizar cualquier cambio o mantenimiento en la aplicación **IPS Análisis Estratégico de Vacantes** garantizando cero regresiones.

---

## Flujo Paso a Paso

1. **Partir de `main` Limpio y Sincronizado**:
   ```bash
   git checkout main
   git fetch --all --prune
   git reset --hard origin/main
   git status --porcelain # Debe estar 100% limpio
   ```

2. **Crear una Rama Específica por Mejora/Corrección**:
   ```bash
   git checkout -b fix/mi-correccion-especifica
   ```

3. **Aplicar el Cambio Mínimo Funcional**:
   - Modificar únicamente los fragmentos de código estrictamente necesarios.
   - Respetar los contratos e invariantes de `docs/VACANTES_RELEASE_CONTRACT_V11.1.2.md`.

4. **Crear Commit Funcional**:
   ```bash
   git add .
   git commit -m "fix: descripcion clara de la mejora"
   ```

5. **Evidencia Visual (si aplica a Superficies Protegidas)**:
   - Si se modificó algún archivo en la lista protegida (`App.tsx`, `NationalSummary.tsx`, `DashboardTable.tsx`, `calculations.ts`, `types.ts`, `AnalisisListView.tsx`, `useWeeklyAnalysis.ts`, `utils.test.ts`):
   - Crear una copia de `docs/validation/VACANTES_VISUAL_VALIDATION_TEMPLATE.md` en `docs/validation/EVIDENCIA_<NOMBRE>.md`.
   - Registrar la rama, el `HEAD` del commit actual y verificar todos los puntos `PASS`.

6. **Ejecutar el Guard de Liberación**:
   ```bash
   # Si no se tocaron superficies protegidas:
   npm run guard:release

   # Si se tocaron superficies protegidas:
   npm run guard:release -- --evidence docs/validation/EVIDENCIA_<NOMBRE>.md
   ```

7. **Integración a `main`**:
   ```bash
   git checkout main
   git merge --no-ff fix/mi-correccion-especifica -m "merge: integracion de mejora"
   ```

8. **Re-Verificación en `main`**:
   ```bash
   # Ejecutar nuevamente el guard sobre el HEAD resultante de main
   npm run guard:release -- --evidence docs/validation/EVIDENCIA_<NOMBRE>.md
   ```

9. **Push y Despliegue Exclusivo**:
   ```bash
   git push origin main
   npx firebase-tools deploy --only hosting:ipsvac --project prior-01
   ```

10. **Smoke Test en Producción**:
    - Verificar la versión activa y comportamiento en `https://vacips.iapriori.com`.
