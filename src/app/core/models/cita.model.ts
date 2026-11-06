export type EstadoCita = 'Programada' | 'Atendida' | 'Cancelada';

export interface Cita {
  id: string;
  mascotaId: string;
  fecha: string;
  hora: string;
  medico: string;
  servicio: string;
  costo: number;
  motivo: string;
  estado: EstadoCita;
}
