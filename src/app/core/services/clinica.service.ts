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

  buscarPropietarioPorDoc(numDoc: string): Propietario | undefined {
    if (!numDoc) return undefined;
    return this.obtenerPropietarios().find(p => p.numeroDocumento === numDoc);
  }

  obtenerMascotas(): Mascota[] {
    return this.leer<MascotaDatos>(this.claves.mascotas).map(
      dato => new Mascota(dato.id, dato.propietarioId, dato.nombre, dato.especie, dato.raza,
        dato.fechaNacimiento, dato.sexo, dato.observaciones, dato.otraEspecie, dato.peso)
    );
  }

  obtenerRecetaSugerida(peso: number): string {
    if (!peso || peso <= 0) return '';
    if (peso < 5) return 'Dosis sugerida: Jarabe analgésico / antiparasitario dosis baja (0.5 ml c/12 hrs).';
    if (peso <= 15) return 'Dosis sugerida: Comprimido antiparasitario / antibiótico estándar (1 tableta c/24 hrs).';
    return 'Dosis sugerida: Dosis para peso elevado (2 tabletas c/24 hrs o según evaluación médica).';
  }

  registrarMascota(datosPropietario: Omit<Propietario, 'id'>, datosMascota: Omit<MascotaDatos, 'id' | 'propietarioId'>): Mascota {
    const propietarios = this.obtenerPropietarios();
    let propietario = propietarios.find(p => p.numeroDocumento && p.numeroDocumento === datosPropietario.numeroDocumento);
    
    if (!propietario) {
      propietario = { ...datosPropietario, id: this.nuevoId('PROP') };
      propietarios.push(propietario);
      this.guardar(this.claves.propietarios, propietarios);
    }

    const mascota = new Mascota(this.nuevoId('MAS'), propietario.id, datosMascota.nombre,
      datosMascota.especie, datosMascota.raza, datosMascota.fechaNacimiento,
      datosMascota.sexo, datosMascota.observaciones, datosMascota.otraEspecie, datosMascota.peso);
    
    this.guardar(this.claves.mascotas, [...this.obtenerMascotas(), mascota]);
    return mascota;
  }

  actualizarMascota(mascotaId: string, datosMascota: Partial<MascotaDatos>, datosPropietario: Partial<Propietario>): void {
    const mascotas = this.obtenerMascotas();
    const mascota = mascotas.find(m => m.id === mascotaId);
    if (!mascota) return;

    Object.assign(mascota, datosMascota);
    this.guardar(this.claves.mascotas, mascotas);

    const propietarios = this.obtenerPropietarios();
    const propietario = propietarios.find(p => p.id === mascota.propietarioId);
    if (propietario) {
      Object.assign(propietario, datosPropietario);
      this.guardar(this.claves.propietarios, propietarios);
    }
  }

  eliminarMascota(mascotaId: string): void {
    const mascotas = this.obtenerMascotas().filter(m => m.id !== mascotaId);
    this.guardar(this.claves.mascotas, mascotas);

    const citas = this.obtenerCitas().filter(c => c.mascotaId !== mascotaId);
    this.guardar(this.claves.citas, citas);
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