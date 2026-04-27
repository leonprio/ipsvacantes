
/**
 * IPS SUPER BLINDAJE v3.0 - MULTI-TENANT ISOLATION SYSTEM
 * Este archivo contiene la configuración inmutable para validar el entorno
 * y prevenir contaminación de datos entre aplicaciones del mismo proyecto Firebase.
 * Si estos valores no coinciden con los de firebaseConfig, el sistema se bloquea.
 */

/**
 * Configuración maestra e inmutable para el blindaje del sistema.
 * @constant
 * @property {string} PROJECT_ID - ID del proyecto de Firebase (prior-01).
 * @property {string} APP_ID - ID único de la aplicación de Vacantes IPS.
 * @property {string} CORE_NAMESPACE - Prefijo mandatorio para colecciones de Firestore.
 * @property {string[]} ALLOWED_COLLECTIONS - Lista explícita de colecciones permitidas.
 * @property {string} VERSION - Versión del sistema de blindaje.
 */
export const SHIELD_CONFIG = {
    PROJECT_ID: "prior-01",
    APP_ID: "1:568084253557:web:daf5bb4ca5666b81d5213c", // IPS Vacantes App ID
    CORE_NAMESPACE: "vac_",
    ALLOWED_COLLECTIONS: [
        "vac_users",
        "vac_weekly_data",
        "vac_config",
        "vac_unes",
        "vac_dashboard_cache",
        "vac_weekly_analysis",
    ] as const,
    VERSION: "v9.0.0-NUCLEAR-ISOLATION-VAC"
};

/**
 * Resultado de la validación de integridad.
 * @interface
 */
export interface IntegrityResult {
    isValid: boolean;
    error?: string;
}

/**
 * Verifica que la configuración de Firebase coincida con los parámetros de blindaje de IPS.
 * @param {Object} config - Configuración actual cargada en la app.
 * @returns {IntegrityResult} Objeto con estado de validación y mensaje de error si aplica.
 */
export const verifyAppIntegrity = (config: any): IntegrityResult => {
    if (config.projectId !== SHIELD_CONFIG.PROJECT_ID) {
        return {
            isValid: false,
            error: `CRITICAL SEC_ERR: Project ID Mismatch. Expected ${SHIELD_CONFIG.PROJECT_ID}, got ${config.projectId}`
        };
    }

    if (config.appId !== SHIELD_CONFIG.APP_ID) {
        return {
            isValid: false,
            error: `CRITICAL SEC_ERR: App ID Mismatch. Este código está blindado para IPS Vacantes.`
        };
    }

    return { isValid: true };
};

/**
 * Valida que un nombre de colección pertenezca al namespace IPS.
 * Previene accidentalmente leer/escribir a colecciones de otras apps.
 * 
 * @example
 * // Uso típico antes de cualquier operación de Firestore:
 * validateCollectionName("ips_users"); // { isValid: true }
 * validateCollectionName("users");     // { isValid: false, error: "..." }
 * validateCollectionName("sigma_data"); // { isValid: false, error: "..." }
 *
 * @param {string} collectionName - Nombre de la colección a validar.
 * @returns {IntegrityResult} Resultado de la validación.
 */
export const validateCollectionName = (collectionName: string): IntegrityResult => {
    if (!collectionName.startsWith(SHIELD_CONFIG.CORE_NAMESPACE)) {
        return {
            isValid: false,
            error: `NAMESPACE VIOLATION: La colección "${collectionName}" no pertenece al namespace IPS ("${SHIELD_CONFIG.CORE_NAMESPACE}"). Acceso denegado.`
        };
    }

    const isExplicitlyAllowed = SHIELD_CONFIG.ALLOWED_COLLECTIONS.some(
        (allowed) => collectionName === allowed || collectionName.startsWith(allowed + "/")
    );

    if (!isExplicitlyAllowed) {
        return {
            isValid: false,
            error: `COLLECTION NOT WHITELISTED: "${collectionName}" tiene prefijo ips_ pero no está en la lista de colecciones permitidas.`
        };
    }

    return { isValid: true };
};

/**
 * Wrapper seguro que valida el namespace antes de ejecutar una operación de Firestore.
 * Lanza un error si la colección no pertenece al namespace IPS.
 * 
 * @example
 * // En vez de: doc(db, 'ips_config', 'global')
 * // Usar: assertIpsNamespace('ips_config') antes de la operación
 *
 * @param {string} collectionName - Nombre de la colección a verificar.
 * @throws {Error} Si la colección no es válida.
 */
export const assertIpsNamespace = (collectionName: string): void => {
    const result = validateCollectionName(collectionName);
    if (!result.isValid) {
        console.error(`🛡️ SHIELD BLOCK: ${result.error}`);
        throw new Error(result.error);
    }
};
