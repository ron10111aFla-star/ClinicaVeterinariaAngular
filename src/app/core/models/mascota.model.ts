import { Propietario } from './propietario.model';

export type Especie = 'Perro' | 'Gato' | 'Ave' | 'Conejo' | 'Otro';
export type SexoMascota = 'Macho' | 'Hembra' | 'No especificado';

export interface MascotaDatos {
  id: string;
  propietarioId: string;
  nombre: string;
  especie: Especie;
  otraEspecie?: string;
  raza: string;
  fechaNacimiento: string;
  sexo: SexoMascota;
  peso?: number;
  observaciones: string;
}

export class Mascota implements MascotaDatos {
  constructor(
    public readonly id: string,
    public propietarioId: string,
    public nombre: string,
    public especie: Especie,
    public raza: string,
    public fechaNacimiento: string,
    public sexo: SexoMascota,
    public observaciones: string,
    public otraEspecie?: string,
    public peso?: number
  ) {}

  get nombreCompleto(): string {
    const esp = (this.especie === 'Otro' && this.otraEspecie) ? this.otraEspecie : this.especie;
    return `${this.nombre} (${esp})`;
  }
}

export interface MascotaConPropietario extends MascotaDatos {
  propietario?: Propietario;
}
