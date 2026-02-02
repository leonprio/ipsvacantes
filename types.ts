
export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: 'admin' | 'editor' | 'viewer';
  active?: boolean;
}

export interface UNE {
  id: string;
  name: string;
  regionId: string;
}

export interface Region {
  id: string;
  name: string;
  editor: string;
}

export interface WeeklyData {
  uneId: string;
  week: number;
  year: number;
  edoFza: number;
  altas: number;
  bajas: number;
  vacantesIniciales: number;
  vacantesRealesFS: number;
  comentarios?: string;
}

export interface ComputedData extends WeeklyData {
  vacantesFinales: number;
  porcentajeVacantes: number;
  status: 'green' | 'yellow' | 'red';
}

export interface NationalMetrics {
  metas: {
    altas: number;
    bajas: number;
    vacantes: number;
    porcentaje: number;
    edoFza: number;
  };
  thresholds: {
    green: number;
    yellow: number;
  };
}
