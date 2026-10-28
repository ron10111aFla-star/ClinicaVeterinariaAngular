import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Atencion } from '../../core/models/atencion.model';
import { Mascota } from '../../core/models/mascota.model';
import { Propietario } from '../../core/models/propietario.model';
import { ClinicaService } from '../../core/services/clinica.service';

@Component({
  selector: 'cv-historial',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './historial.component.html',
  styleUrl: './historial.component.css'
})
export class HistorialComponent implements OnInit {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly clinica = inject(ClinicaService);

  mascotas: Mascota[] = [];
  propietarios: Propietario[] = [];
  termino = '';
  mascotaSeleccionada: Mascota | null = null;
  atenciones: Atencion[] = [];
  mensaje = '';
  tipoMensaje: 'success' | 'danger' = 'success';
  mostrarFormularioAtencion = false;
  readonly hoy = this.fechaLocal(new Date());

  readonly formularioAtencion = this.fb.group({
    fecha: [this.hoy, Validators.required],
    motivo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(250)]],
    diagnostico: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(500)]],
    tratamiento: ['', [Validators.maxLength(500)]],
    observaciones: ['', [Validators.maxLength(500)]]
  });

  ngOnInit(): void {
    this.mascotas = this.clinica.obtenerMascotas();
    this.propietarios = this.clinica.obtenerPropietarios();
  }

  private fechaLocal(fecha: Date): string {
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
  }

  get mascotasFiltradas(): Mascota[] {
    const busqueda = this.termino.trim().toLocaleLowerCase();
    if (!busqueda) return this.mascotas;
    return this.mascotas.filter(mascota => {
      const propietario = this.obtenerPropietario(mascota.propietarioId);
      return [mascota.id, mascota.nombre, mascota.especie, mascota.raza,
        propietario?.nombres, propietario?.apellidos].some(valor => valor?.toLocaleLowerCase().includes(busqueda));
    });
  }

  obtenerPropietario(id: string): Propietario | undefined {
    return this.propietarios.find(propietario => propietario.id === id);
  }

  seleccionarMascota(mascota: Mascota): void {
    this.mascotaSeleccionada = mascota;
    this.atenciones = this.clinica.obtenerAtencionesPorMascota(mascota.id);
    this.mensaje = '';
    this.mostrarFormularioAtencion = false;
  }

  guardarAtencion(): void {
    if (!this.mascotaSeleccionada) return;
    if (this.formularioAtencion.invalid) {
      this.formularioAtencion.markAllAsTouched();
      this.tipoMensaje = 'danger';
      this.mensaje = 'Completa la fecha, el motivo y el diagnóstico; revisa los formatos indicados.';
      return;
    }
    const datos = this.formularioAtencion.getRawValue();
    this.clinica.registrarAtencion({
      mascotaId: this.mascotaSeleccionada.id,
      fecha: datos.fecha,
      motivo: datos.motivo.trim(),
      diagnostico: datos.diagnostico.trim(),
      tratamiento: datos.tratamiento.trim(),
      observaciones: datos.observaciones.trim()
    });
    this.atenciones = this.clinica.obtenerAtencionesPorMascota(this.mascotaSeleccionada.id);
    this.formularioAtencion.reset({ fecha: this.hoy, motivo: '', diagnostico: '', tratamiento: '', observaciones: '' });
    this.mostrarFormularioAtencion = false;
    this.tipoMensaje = 'success';
    this.mensaje = 'La atención se guardó y quedó asociada al historial de la mascota.';
  }
}
