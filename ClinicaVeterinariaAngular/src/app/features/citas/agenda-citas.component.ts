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

  readonly formulario = this.fb.group({
    fecha: [this.hoy, Validators.required],
    hora: ['', Validators.required],
    mascotaId: ['', Validators.required],
    motivo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(250)]]
  });

  ngOnInit(): void { this.recargar(); }

  private fechaLocal(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  recargar(): void {
    this.mascotas = this.clinica.obtenerMascotas();
    this.citas = this.clinica.obtenerCitas().sort((a, b) => `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`));
  }

  get fechaSeleccionada(): string { return this.formulario.controls.fecha.value ?? this.hoy; }
  get citasDelDia(): Cita[] { return this.citas.filter(cita => cita.fecha === this.fechaSeleccionada); }

  estaDisponible(hora: string): boolean {
    if (!this.clinica.horarioDisponible(this.fechaSeleccionada, hora)) return false;
    if (this.fechaSeleccionada < this.hoy) return false;
    if (this.fechaSeleccionada === this.hoy) {
      const [horas, minutos] = hora.split(':').map(Number);
      const horaCita = new Date();
      horaCita.setHours(horas, minutos, 0, 0);
      if (horaCita.getTime() <= Date.now()) return false;
    }
    return true;
  }

  seleccionarHora(hora: string): void {
    if (this.estaDisponible(hora)) this.formulario.controls.hora.setValue(hora);
  }

  agendar(): void {
    this.mensaje = '';
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.tipoMensaje = 'danger';
      this.mensaje = 'Completa la fecha, el horario, la mascota y un motivo de consulta (mínimo 5 caracteres).';
      return;
    }
    const datos = this.formulario.getRawValue();
    if (!this.estaDisponible(datos.hora)) {
      this.tipoMensaje = 'danger';
      this.mensaje = 'Ese horario no está disponible. Selecciona otro espacio libre.';
      this.recargar();
      return;
    }
    try {
      const cita = this.clinica.registrarCita({
        fecha: datos.fecha,
        hora: datos.hora,
        mascotaId: datos.mascotaId,
        motivo: datos.motivo.trim()
      });
      this.tipoMensaje = 'success';
      this.mensaje = `Cita registrada para el ${cita.fecha} a las ${cita.hora}. Estado: ${cita.estado}.`;
      this.formulario.controls.hora.setValue('');
      this.formulario.controls.motivo.setValue('');
      this.recargar();
    } catch (error: unknown) {
      this.tipoMensaje = 'danger';
      this.mensaje = error instanceof Error ? error.message : 'No se pudo registrar la cita.';
      this.recargar();
    }
  }

  nombreMascota(id: string): string {
    return this.mascotas.find(mascota => mascota.id === id)?.nombre ?? 'Mascota no encontrada';
  }

  cambiarEstado(cita: Cita, estado: 'Atendida' | 'Cancelada'): void {
    this.clinica.cambiarEstadoCita(cita.id, estado);
    this.tipoMensaje = 'success';
    this.mensaje = `La cita se actualizó a estado ${estado.toLowerCase()}.`;
    this.recargar();
  }

  estaMarcadaComoProxima(cita: Cita): string {
    return `${cita.fecha}T${cita.hora}:00`;
  }
}
