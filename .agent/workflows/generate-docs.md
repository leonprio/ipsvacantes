---
description: Generates comprehensive documentation for the project
---

# Generate Documentation

This workflow ensures the project documentation is up-to-date, including `README.md`, JSDoc comments, `CHANGELOG.md`, and any necessary API docs.

## Steps

1.  **Analyze Current State**: Review `App.tsx`, `types.ts`, and `firestore.rules` to understand the latest changes (e.g., "Platinum Shield" architecture, `stx_` collections).
2.  **Update `README.md`**:
    *   Ensure the title matches the project ("IPS Análisis Estratégico de Vacantes").
    *   Update the "Technical Stack" section.
    *   Document the "Shield Architecture" (stx_ prefix rationale).
    *   Include a simplified Mermaid diagram of the data flow.
    *   Add setup and deployment instructions.
3.  **Enhance Code Documentation (JSDoc)**:
    *   Add or update JSDoc comments for key interfaces in `types.ts` (`User`, `WeeklyData`, `NationalMetrics`, etc.).
    *   Document core functions in `App.tsx` (like data sync logic, role checks).
4.  **Update `CHANGELOG.md`**:
    *   Add a new entry for the current version (e.g., v7.8.0).
    *   List major features (Shielding, Mobile Optimization, Data Recovery).
    *   List bug fixes.
5.  **Generate API/Data Docs**:
    *   Create a simple markdown file describing the Firestore schema structure (`docs/firestore-schema.md`).

// turbo
6.  **Verify**: Ensure all markdown files are formatted correctly.
