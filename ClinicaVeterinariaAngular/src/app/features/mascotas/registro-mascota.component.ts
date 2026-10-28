import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClinicaService } from '../../core/services/clinica.service';

@Component({
  selector: 'cv-registro-mascota',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './registro-mascota.component.html',
  styleUrl: './registro-mascota.component.css'
})
export class RegistroMascotaComponent {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly clinica = inject(ClinicaService);

  readonly hoy = this.fechaLocal(new Date());
  mensaje = '';
  tipoMensaje: 'success' | 'danger' = 'success';
  ultimoRegistro = '';

  readonly formulario = this.fb.group({
    propietario: this.fb.group({
      tipoDocumento: ['DNI' as 'DNI' | 'CE' | 'Pasaporte' | 'Otro', Validators.required],
      numeroDocumento: ['', [Validators.maxLength(20)]],
      nombres: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
      apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9+\s()-]{7,15}$/)]],
      correo: ['', [Validators.email, Validators.maxLength(100)]]
    }),
    mascota: this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      especie: ['Perro' as 'Perro' | 'Gato' | 'Ave' | 'Conejo' | 'Otro', Validators.required],
      raza: ['', [Validators.maxLength(60)]],
      fechaNacimiento: [''],
      sexo: ['No especificado' as 'Macho' | 'Hembra' | 'No especificado', Validators.required],
      observaciones: ['', [Validators.maxLength(500)]]
    })
  });

  private fechaLocal(fecha: Date): string {
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
  }

  guardar(): void {
    this.mensaje = '';
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.tipoMensaje = 'danger';
      this.mensaje = 'Revisa los campos marcados. Completa los datos obligatorios y corrige los formatos.';
      return;
    }

    const datos = this.formulario.getRawValue();
    try {
      const mascota = this.clinica.registrarMascota(
        {
          tipoDocumento: datos.propietario.tipoDocumento,
          numeroDocumento: datos.propietario.numeroDocumento.trim(),
          nombres: datos.propietario.nombres.trim(),
          apellidos: datos.propietario.apellidos.trim(),
          telefono: datos.propietario.telefono.trim(),
          correo: datos.propietario.correo.trim()
        },
        {
          nombre: datos.mascota.nombre.trim(),
          especie: datos.mascota.especie,
          raza: datos.mascota.raza.trim(),
          fechaNacimiento: datos.mascota.fechaNacimiento,
          sexo: datos.mascota.sexo,
          observaciones: datos.mascota.observaciones.trim()
        }
      );
      this.ultimoRegistro = mascota.nombreCompleto;
      this.tipoMensaje = 'success';
      this.mensaje = `Registro guardado correctamente. Código de mascota: ${mascota.id}.`;
      this.formulario.reset({
        propietario: { tipoDocumento: 'DNI', numeroDocumento: '', nombres: '', apellidos: '', telefono: '', correo: '' },
        mascota: { nombre: '', especie: 'Perro', raza: '', fechaNacimiento: '', sexo: 'No especificado', observaciones: '' }
      });
    } catch {
      this.tipoMensaje = 'danger';
      this.mensaje = 'No fue posible guardar el registro en este navegador. Inténtalo nuevamente.';
    }
  }

  limpiar(): void {
    this.formulario.reset({
      propietario: { tipoDocumento: 'DNI', numeroDocumento: '', nombres: '', apellidos: '', telefono: '', correo: '' },
      mascota: { nombre: '', especie: 'Perro', raza: '', fechaNacimiento: '', sexo: 'No especificado', observaciones: '' }
    });
    this.mensaje = '';
  }

  tieneError(grupo: 'propietario' | 'mascota', campo: string): boolean {
    const control = this.formulario.get(`${grupo}.${campo}`);
    return !!control && control.invalid && (control.touched || control.dirty);
  }
}
