export type TipoDocumento = 'DNI' | 'CE' | 'Pasaporte' | 'Otro';

export interface Propietario {
  id: string;
  tipoDocumento: TipoDocumento | '';
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  correo: string;
}
