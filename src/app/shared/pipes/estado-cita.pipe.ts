import { Pipe, PipeTransform } from '@angular/core';
import { EstadoCita } from '../../core/models/cita.model';

@Pipe({ name: 'estadoCita', standalone: true })
export class EstadoCitaPipe implements PipeTransform {
  transform(estado: EstadoCita): string {
    const etiquetas: Record<EstadoCita, string> = {
      Programada: 'Programada',
      Atendida: 'Atendida',
      Cancelada: 'Cancelada'
    };
    return etiquetas[estado] ?? 'Sin estado';
  }
}
