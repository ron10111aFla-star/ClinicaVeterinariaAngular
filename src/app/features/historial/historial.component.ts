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
  
  // NUEVAS PROPIEDADES AÑADIDAS
  modoEdicion = false;

  readonly hoy = this.fechaLocal(new Date());

  readonly formularioAtencion = this.fb.group({
    fecha: [this.hoy, Validators.required],
    motivo: ['', [Validators.required, Validators.minLength(5)]],
    diagnostico: ['', [Validators.required, Validators.minLength(3)]],
    tratamiento: [''],
    observaciones: ['']
  });

  // NUEVO FORMULARIO AÑADIDO PARA LA EDICIÓN
  readonly formularioEdicion = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    raza: [''],
    peso: [0, [Validators.required, Validators.min(0.1)]],
    propietarioNombres: ['', [Validators.required]],
    propietarioTelefono: ['', [Validators.required]],
    observaciones: ['']
  });

  ngOnInit(): void {
    this.recargarDatos();
  }

  // MÉTODO ACTUALIZADO PARA RECARGAR DATOS DE FORMA SEGURA
  private recargarDatos(): void {
    this.mascotas = this.clinica.obtenerMascotas();
    this.propietarios = this.clinica.obtenerPropietarios();
    if (this.mascotaSeleccionada) {
      const encontrada = this.mascotas.find(m => m.id === this.mascotaSeleccionada?.id);
      this.mascotaSeleccionada = encontrada || null;
    }
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
        propietario?.nombres, propietario?.apellidos, propietario?.numeroDocumento].some(valor => valor?.toLocaleLowerCase().includes(busqueda));
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
    this.modoEdicion = false;
  }

  // NUEVOS MÉTODOS AÑADIDOS PARA EDICIÓN Y ELIMINACIÓN
  toggleEditar(): void {
    this.modoEdicion = !this.modoEdicion;
    if (this.modoEdicion && this.mascotaSeleccionada) {
      const prop = this.obtenerPropietario(this.mascotaSeleccionada.propietarioId);
      this.formularioEdicion.patchValue({
        nombre: this.mascotaSeleccionada.nombre,
        raza: this.mascotaSeleccionada.raza,
        peso: this.mascotaSeleccionada.peso || 0,
        propietarioNombres: prop?.nombres || '',
        propietarioTelefono: prop?.telefono || '',
        observaciones: this.mascotaSeleccionada.observaciones
      });
    }
  }

  guardarEdicion(): void {
    if (!this.mascotaSeleccionada || this.formularioEdicion.invalid) return;
    const val = this.formularioEdicion.getRawValue();

    this.clinica.actualizarMascota(
      this.mascotaSeleccionada.id,
      {
        nombre: val.nombre.trim(),
        raza: val.raza.trim(),
        peso: Number(val.peso),
        observaciones: val.observaciones.trim()
      },
      {
        nombres: val.propietarioNombres.trim(),
        telefono: val.propietarioTelefono.trim()
      }
    );

    this.recargarDatos();
    this.modoEdicion = false;
    this.tipoMensaje = 'success';
    this.mensaje = 'Ficha actualizada correctamente.';
  }

  eliminarMascota(): void {
    if (!this.mascotaSeleccionada) return;
    if (confirm(`¿Estás seguro de eliminar el registro de ${this.mascotaSeleccionada.nombreCompleto}?`)) {
      this.clinica.eliminarMascota(this.mascotaSeleccionada.id);
      this.mascotaSeleccionada = null;
      this.recargarDatos();
      this.tipoMensaje = 'success';
      this.mensaje = 'Mascota eliminada del sistema.';
    }
  }

  guardarAtencion(): void {
    if (!this.mascotaSeleccionada) return;
    if (this.formularioAtencion.invalid) {
      this.formularioAtencion.markAllAsTouched();
      this.tipoMensaje = 'danger';
      this.mensaje = 'Completa los campos obligatorios.';
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
    this.mensaje = 'Atención guardada correctamente.';
  }
}