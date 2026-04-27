import { useState, useEffect, useCallback } from 'react';
import { WeeklyAnalysis, SemaforoStatus } from '../types';
import { db } from '../firebase';
import { collection, onSnapshot, query, setDoc, doc, deleteDoc } from 'firebase/firestore';

/**
 * Calcula el estado semáforo basado en el porcentaje de vacantes.
 */
export const calcularSemaforo = (porcentaje: number): SemaforoStatus => {
    if (porcentaje < 5) return 'verde';
    if (porcentaje <= 7) return 'amarillo';
    return 'rojo';
};

/**
 * Crea un objeto de análisis vacío con valores iniciales.
 */
export const createEmptyAnalysis = (semana: number, año: number, autor: string = ''): WeeklyAnalysis => ({
    id: '',
    semana,
    año,
    fechaCierre: new Date().toISOString(),
    autor,
    creadoEn: new Date().toISOString(),
    actualizadoEn: new Date().toISOString(),
    estadoFuerza: { elementosActivos: 0, metaEsperada: 0, diferencia: 0, descripcion: '' },
    termometro: {
        altasNacionales: { valorReal: 0, meta: 0, porcentaje: 0, comentario: '' },
        bajasNacionales: { valorReal: 0, meta: 0, porcentaje: 0, comentario: '' },
        vacantesOperativas: { valorReal: 0, meta: 0, porcentaje: 0, comentario: '' }
    },
    vacantesCriticas: { valorReal: 0, limite: 0, diferencia: 0, comentario: '' },
    semaforoVacantes: { porcentajeActual: 0, meta: 0, status: 'verde' },
    analisisEjecutivo: '',
    alertas: [],
    recomendaciones: []
});

/**
 * Hook para gestión CRUD de análisis semanales en FIRESTORE (Namespace: vac_).
 * NOTA: El ordenamiento se hace LOCAL (versión de blindaje v9.2.5) para evitar fallos por falta de índices.
 */
export const useWeeklyAnalysis = () => {
    const [analyses, setAnalyses] = useState<WeeklyAnalysis[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        // Query simple sin orderBy para evitar errores de índices (Blindaje v9.2.5)
        const q = collection(db, 'vac_weekly_analysis');
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as WeeklyAnalysis[];
            
            // Ordenamiento local (Año descendente, Semana descendente)
            const sortedData = [...data].sort((a, b) => {
                if (a.año !== b.año) return b.año - a.año;
                return b.semana - a.semana;
            });

            setAnalyses(sortedData);
            setIsLoading(false);
        }, (error) => {
            console.error("[IPS-VACANTES] Error al cargar análisis:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const addAnalysis = useCallback(async (analysis: WeeklyAnalysis): Promise<{ success: boolean; errors: string[] }> => {
        const docId = analysis.id || `INF-${Date.now()}`;
        const finalAnalysis = {
            ...analysis,
            id: docId,
            actualizadoEn: new Date().toISOString()
        };

        try {
            await setDoc(doc(db, 'vac_weekly_analysis', docId), finalAnalysis);
            return { success: true, errors: [] };
        } catch (e: any) {
            console.error('[IPS-VACANTES] Error al guardar análisis:', e);
            return { success: false, errors: [e.message] };
        }
    }, []);

    const updateAnalysis = useCallback(async (analysis: WeeklyAnalysis): Promise<{ success: boolean; errors: string[] }> => {
        try {
            await setDoc(doc(db, 'vac_weekly_analysis', analysis.id), {
                ...analysis,
                actualizadoEn: new Date().toISOString()
            }, { merge: true });
            return { success: true, errors: [] };
        } catch (e: any) {
            console.error('[IPS-VACANTES] Error al actualizar análisis:', e);
            return { success: false, errors: [e.message] };
        }
    }, []);

    const deleteAnalysis = useCallback(async (id: string) => {
        try {
            await deleteDoc(doc(db, 'vac_weekly_analysis', id));
            return { success: true };
        } catch (error) {
            console.error("[IPS-VACANTES] Error al eliminar análisis:", error);
            return { success: false, error };
        }
    }, []);

    return {
        analyses,
        isLoading,
        addAnalysis,
        updateAnalysis,
        deleteAnalysis,
    };
};
