export type EstadoCita = 'Programada' | 'Atendida' | 'Cancelada';

export interface Cita {
  id: string;
  mascotaId: string;
  fecha: string;
  hora: string;
  motivo: string;
  estado: EstadoCita;
}
