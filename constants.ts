
import { Region, UNE } from './types';

export const REGIONS: Region[] = [
  { id: 'R1', name: 'CENTRO', editor: 'JAIME PAZMIÑO' },
  { id: 'R2', name: 'CENTRO NORTE', editor: 'JAVIER GRIFALDO' },
  { id: 'R3', name: 'SUR', editor: 'ISRAEL GUIDO' },
  { id: 'R4', name: 'FRONTERA NORTE', editor: 'GERARDO GUTIERREZ' },
  { id: 'R5', name: 'TSP+', editor: 'COORDINACIÓN TSP+' },
];

export const UNES: UNE[] = [
  // Region 1
  { id: 'U1', name: 'METRO CENTRO', regionId: 'R1' },
  { id: 'U2', name: 'METRO SUR', regionId: 'R1' },
  { id: 'U3', name: 'METRO NORTE', regionId: 'R1' },
  { id: 'U4', name: 'TOLUCA', regionId: 'R1' },
  // Region 2
  { id: 'U5', name: 'GTMI', regionId: 'R2' },
  { id: 'U6', name: 'OCCIDENTE', regionId: 'R2' },
  { id: 'U7', name: 'BAJIO', regionId: 'R2' },
  { id: 'U8', name: 'SLP', regionId: 'R2' },
  // Region 3
  { id: 'U9', name: 'SUR', regionId: 'R3' },
  { id: 'U10', name: 'GOLFO', regionId: 'R3' },
  { id: 'U11', name: 'PENINSULA', regionId: 'R3' },
  // Region 4
  { id: 'U12', name: 'PACIFICO', regionId: 'R4' },
  { id: 'U13', name: 'NOROESTE', regionId: 'R4' },
  { id: 'U14', name: 'NORESTE', regionId: 'R4' },
  // Region 5
  { id: 'U15', name: 'TSP+', regionId: 'R5' },
];

export const STATUS_THRESHOLDS = {
  GREEN: 7.9,
  YELLOW: 8.9,
};
