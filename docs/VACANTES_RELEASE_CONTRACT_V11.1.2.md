# CONTRATO DE LIBERACIÓN E INVARIANTES DE VACANTES IPS

**Versión del Release:** `v11.1.2-DYNAMIC-GOALS-PRESENTATION-RESTORE`  
**MAIN_MERGE_COMMIT:** `f265503596bb009184997258e359c46d4a1a9375`  
**Producción:** `https://vacips.iapriori.com`  
**Firebase Project:** `prior-01`  
**Hosting Target:** `ipsvac`

---

## 1. Reglas e Invariantes Metodológicas de Metas Dinámicas

- **S1 a S28**: Usan metas históricas fijas configuradas explícitamente (`isPercentage = false`).
- **S29+**: Usan metodología porcentual adaptativa sobre el Estado de Fuerza de la semana inmediatamente anterior ($W-1$).
- **Fórmulas Canónicas**:
  - Altas Objetivo: $\operatorname{Math.ceil}(\text{baseWorkforce} \times 0.03)$
  - Bajas Límite: $\operatorname{Math.floor}(\text{baseWorkforce} \times 0.02)$
  - Vacantes Objetivo: $\operatorname{Math.floor}(\text{baseWorkforce} \times 0.05)$
- **Exclusión**: La entrada sintética `NATIONAL_DATA` queda estrictamente excluida de la suma de Estado de Fuerza Base de UNEs.
- **Snapshot de Inmutabilidad**: Si un informe semanal en Firestore contiene `methodologySnapshot`, dicho objeto inmutable **prevalece** y se usa para el cálculo del resumen sin recalculación provisional, aun si las capturas semanales individuales de la semana base sufren modificaciones posteriores.
- **Ejemplos Canónicos de Validación**:
  - **S29** (Base S28 = 6,384): Altas = **192**, Bajas = **127**, Vacantes = **319**.
  - **S31** (Base S30 = 6,401): Altas = **193**, Bajas = **128**, Vacantes = **320**.

---

## 2. Resumen Nacional e Indicadores KPI

- **Porcentaje y Equivalente Absoluto**:
  - Altas: `OBJ: 3% · EQUIV. A {altasTargetAbsolute}`
  - Bajas: `LIM: 2% · EQUIV. A {bajasLimitAbsolute}`
  - Vacantes Operativas: `META: 5% · EQUIV. A {vacancyTargetAbsolute}`
- **Línea de Base Metodológica**:
  - Debe mostrar `BASE: S{baseWeek} = {baseWorkforce} ({PROV|CONG})`.
- **Comparativos Semanales Dinámicos**:
  - Cada una de las 6 tarjetas KPI debe presentar su comparativo `S{prevWeek} {prevValue} {difference}`.
  - Caso S31 Total c/ apoyos: `6,790` | `S30 6,583 +207`.

---

## 3. Modos Visuales (NORMAL, MIN, PRESENT)

- **Modo NORMAL**: Mantiene la densidad operativa completa sin recorte de elementos.
- **Modo MIN**: Densidad compacta conservando el 100% de la información estratégica, base, equivalencias y comparativos.
- **Modo PRESENT**: Escala tipográfica hiper-ampliada para lectura confortable a ~4 metros de distancia en salas ejecutivas, manteniendo el 100% de los datos y ocultando únicamente controles de edición y navegación inferior.

---

## 4. Tabla Regional y Observaciones

- **Observaciones**: Despliegue completo en la celda sin scrollbar interno (`break-words whitespace-pre-wrap min-h-[44px]`).
- **Vacantes Operativas**: 3 columnas independientes (*Semana Anterior*, *Semana Actual*, *DIF*).
- **TOTAL REGIONAL**: Fila de cierre con totales acumulados exactos para las 3 columnas operativas.

---

## 5. Aislamiento Cloud y Despliegues

- Despliegue **único y exclusivo** a Firebase Hosting mediante:
  `npx firebase-tools deploy --only hosting:ipsvac --project prior-01`
- **Queda estrictamente prohibido** desplegar o alterar Firestore, Cloud Functions, reglas de seguridad, índices, Firebase Auth o sitios ajenos.
