import { describe, expect, it } from 'vitest';
import { EstadoCitaPipe } from './estado-cita.pipe';

describe('EstadoCitaPipe', () => {
  const pipe = new EstadoCitaPipe();

  it('muestra el estado programado', () => {
    expect(pipe.transform('Programada')).toBe('Programada');
  });

  it('muestra el estado atendido', () => {
    expect(pipe.transform('Atendida')).toBe('Atendida');
  });

  it('muestra el estado cancelado', () => {
    expect(pipe.transform('Cancelada')).toBe('Cancelada');
  });
});
