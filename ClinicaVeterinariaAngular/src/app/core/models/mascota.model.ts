import { Propietario } from './propietario.model';

export type Especie = 'Perro' | 'Gato' | 'Ave' | 'Conejo' | 'Otro';
export type SexoMascota = 'Macho' | 'Hembra' | 'No especificado';

export interface MascotaDatos {
  id: string;
  propietarioId: string;
  nombre: string;
  especie: Especie;
  raza: string;
  fechaNacimiento: string;
  sexo: SexoMascota;
  observaciones: string;
}

/** Entidad de dominio: representa a una mascota y encapsula su identidad. */
export class Mascota implements MascotaDatos {
  constructor(
    public readonly id: string,
    public propietarioId: string,
    public nombre: string,
    public especie: Especie,
    public raza: string,
    public fechaNacimiento: string,
    public sexo: SexoMascota,
    public observaciones: string
  ) {}

  get nombreCompleto(): string {
    return `${this.nombre} (${this.especie})`;
  }
}

export interface MascotaConPropietario extends MascotaDatos {
  propietario?: Propietario;
}
