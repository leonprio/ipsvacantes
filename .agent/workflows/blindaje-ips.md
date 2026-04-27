---
description: Blindaje de Restauración y Seguridad IPS
---
# Workflow de Blindaje IPS v3.0 (MULTI-TENANT ISOLATION)

Este proyecto está PROTEGIDO TÉCNICAMENTE contra contaminación multi-tenant.

## Capas de Protección

1. **Hard Lock** (`utils/shield.ts`): Valida `PROJECT_ID`, `APP_ID` y namespace `ips_` en runtime. Si se cambian, la UI se bloquea ("SHIELD VIOLATION").
2. **Namespace Validator**: `validateCollectionName()` y `assertIpsNamespace()` rechazan cualquier colección que no esté en la whitelist: `ips_users`, `ips_weekly_data`, `ips_config`, `ips_unes`, `ips_dashboard_cache`.
3. **Build Guard** (`scripts/check-config.js`): `npm run build` fallará si:
   - El App ID no es el de IPS Vacantes
   - El Project ID no es prior-01
   - Se detectan referencias a colecciones de otras apps (sigma_, tablero_)
   - Hay colecciones en App.tsx sin prefijo ips_
4. **Firestore Rules** (`firestore.rules`): Regla catch-all `allow: false` + whitelist explícita de 5 colecciones. Cada función helper verifica existencia en `ips_users`.
5. **Deploy Target**: Usa siempre `npm run firebase-deploy`. Está configurado para apuntar solo al target `ipsvac`.
6. **CI/CD**: GitHub Actions ejecuta Build Guard + Tests + Build en cada push a main.

## Colecciones Permitidas

| Colección | Lectura | Escritura |
|-----------|---------|-----------|
| `ips_config` | Viewer+ | Admin |
| `ips_users` | Viewer+ | Admin (create/delete), Self (update sin cambio de rol) |
| `ips_weekly_data` | Viewer+ | Editor+ |
| `ips_unes` | Viewer+ | Editor+ |
| `ips_dashboard_cache` | Viewer+ | Admin |

## Verificación Rápida

// turbo
```powershell
npm run test -- --run && npm run prebuild
```
