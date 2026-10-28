import { Injectable } from '@angular/core';
import { Atencion } from '../models/atencion.model';
import { Cita, EstadoCita } from '../models/cita.model';
import { Mascota, MascotaDatos } from '../models/mascota.model';
import { Propietario } from '../models/propietario.model';

@Injectable({ providedIn: 'root' })
export class ClinicaService {
  private readonly claves = {
    propietarios: 'vetcare_propietarios',
    mascotas: 'vetcare_mascotas',
    citas: 'vetcare_citas',
    atenciones: 'vetcare_atenciones'
  } as const;

  private leer<T>(clave: string): T[] {
    try {
      const contenido = localStorage.getItem(clave);
      return contenido ? JSON.parse(contenido) as T[] : [];
    } catch {
      return [];
    }
  }

  private guardar<T>(clave: string, datos: T[]): void {
    localStorage.setItem(clave, JSON.stringify(datos));
  }

  private nuevoId(prefijo: string): string {
    return `${prefijo}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }

  obtenerPropietarios(): Propietario[] {
    return this.leer<Propietario>(this.claves.propietarios);
  }

  obtenerMascotas(): Mascota[] {
    return this.leer<MascotaDatos>(this.claves.mascotas).map(
      dato => new Mascota(dato.id, dato.propietarioId, dato.nombre, dato.especie, dato.raza,
        dato.fechaNacimiento, dato.sexo, dato.observaciones)
    );
  }

  registrarMascota(datosPropietario: Omit<Propietario, 'id'>, datosMascota: Omit<MascotaDatos, 'id' | 'propietarioId'>): Mascota {
    const propietarios = this.obtenerPropietarios();
    const propietario: Propietario = { ...datosPropietario, id: this.nuevoId('PROP') };
    propietarios.push(propietario);
    this.guardar(this.claves.propietarios, propietarios);

    const mascota = new Mascota(this.nuevoId('MAS'), propietario.id, datosMascota.nombre,
      datosMascota.especie, datosMascota.raza, datosMascota.fechaNacimiento,
      datosMascota.sexo, datosMascota.observaciones);
    this.guardar(this.claves.mascotas, [...this.obtenerMascotas(), mascota]);
    return mascota;
  }

  obtenerCitas(): Cita[] {
    return this.leer<Cita>(this.claves.citas);
  }

  horarioDisponible(fecha: string, hora: string, excluirCitaId?: string): boolean {
    return !this.obtenerCitas().some(cita =>
      cita.id !== excluirCitaId && cita.fecha === fecha && cita.hora === hora && cita.estado !== 'Cancelada'
    );
  }

  registrarCita(datos: Omit<Cita, 'id' | 'estado'>): Cita {
    if (!this.horarioDisponible(datos.fecha, datos.hora)) {
      throw new Error('Ese horario acaba de ocuparse. Selecciona otro horario disponible.');
    }
    const cita: Cita = { ...datos, id: this.nuevoId('CITA'), estado: 'Programada' };
    this.guardar(this.claves.citas, [...this.obtenerCitas(), cita]);
    return cita;
  }

  cambiarEstadoCita(id: string, estado: EstadoCita): void {
    const citas = this.obtenerCitas().map(cita => cita.id === id ? { ...cita, estado } : cita);
    this.guardar(this.claves.citas, citas);
  }

  obtenerAtencionesPorMascota(mascotaId: string): Atencion[] {
    return this.leer<Atencion>(this.claves.atenciones)
      .filter(atencion => atencion.mascotaId === mascotaId)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  registrarAtencion(datos: Omit<Atencion, 'id'>): Atencion {
    const atencion: Atencion = { ...datos, id: this.nuevoId('AT') };
    this.guardar(this.claves.atenciones, [...this.leer<Atencion>(this.claves.atenciones), atencion]);
    return atencion;
  }
}
