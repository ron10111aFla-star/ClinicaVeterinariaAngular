import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Cita } from '../../core/models/cita.model';
import { Mascota } from '../../core/models/mascota.model';
import { ClinicaService } from '../../core/services/clinica.service';
import { CitaProximaDirective } from '../../shared/directives/cita-proxima.directive';
import { EstadoCitaPipe } from '../../shared/pipes/estado-cita.pipe';
import { SelectorMascotaComponent } from '../../shared/components/selector-mascota.component';

@Component({
  selector: 'cv-agenda-citas',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, EstadoCitaPipe, CitaProximaDirective, SelectorMascotaComponent],
  templateUrl: './agenda-citas.component.html',
  styleUrl: './agenda-citas.component.css'
})
export class AgendaCitasComponent implements OnInit {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly clinica = inject(ClinicaService);

  mascotas: Mascota[] = [];
  citas: Cita[] = [];
  mensaje = '';
  tipoMensaje: 'success' | 'danger' | 'info' = 'info';
  readonly horarios = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  readonly hoy = this.fechaLocal(new Date());

  readonly medicos = [
    'Dr. Ricardo Palma (Medicina General)',
    'Dra. Camila Torres (Cirugía)',
    'Dr. Mateo Benítez (Dermatología)'
  ];

  readonly formulario = this.fb.group({
    fecha: [this.hoy, Validators.required],
    hora: ['', Validators.required],
    mascotaId: ['', Validators.required],
    medico: ['', Validators.required],
    servicio: ['Consulta General', Validators.required],
    costo: [50.00, [Validators.required, Validators.min(0)]],
    motivo: ['', [Validators.required, Validators.minLength(5)]]
  });

  ngOnInit(): void { this.recargar(); }

  private fechaLocal(fecha: Date): string {
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
  }

  recargar(): void {
    this.mascotas = this.clinica.obtenerMascotas();
    this.citas = this.clinica.obtenerCitas();
  }

  get fechaSeleccionada(): string { return this.formulario.controls.fecha.value ?? this.hoy; }

  estaDisponible(hora: string): boolean {
    return this.clinica.horarioDisponible(this.fechaSeleccionada, hora);
  }

  seleccionarHora(hora: string): void {
    if (this.estaDisponible(hora)) this.formulario.controls.hora.setValue(hora);
  }

  agendar(): void {
    this.mensaje = '';
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.tipoMensaje = 'danger';
      this.mensaje = 'Completa todos los datos de la cita.';
      return;
    }
    const datos = this.formulario.getRawValue();
    try {
      const cita = this.clinica.registrarCita({
        fecha: datos.fecha,
        hora: datos.hora,
        mascotaId: datos.mascotaId,
        medico: datos.medico,
        servicio: datos.servicio,
        costo: Number(datos.costo),
        motivo: datos.motivo.trim()
      });
      this.tipoMensaje = 'success';
      this.mensaje = `Cita registrada correctamente.`;
      this.formulario.patchValue({ hora: '', motivo: '' });
      this.recargar();
    } catch (error: unknown) {
      this.tipoMensaje = 'danger';
      this.mensaje = error instanceof Error ? error.message : 'No se pudo registrar.';
    }
  }

  nombreMascota(id: string): string {
    return this.mascotas.find(mascota => mascota.id === id)?.nombreCompleto ?? 'Mascota';
  }

  cambiarEstado(cita: Cita, estado: 'Atendida' | 'Cancelada'): void {
    this.clinica.cambiarEstadoCita(cita.id, estado);
    this.recargar();
  }
}
