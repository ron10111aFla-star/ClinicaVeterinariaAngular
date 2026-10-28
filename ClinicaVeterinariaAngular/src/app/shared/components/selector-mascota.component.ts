import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Mascota } from '../../core/models/mascota.model';

/** Selector reutilizable: recibe mascotas y comunica la selección al componente padre. */
@Component({
  selector: 'cv-selector-mascota',
  standalone: true,
  template: `
    <label [for]="idControl" class="form-label">Mascota <span class="required-mark">*</span></label>
    <select [id]="idControl" class="form-select" [value]="selectedId" (change)="notificarSeleccion($event)">
      <option value="">Selecciona una mascota</option>
      @for (mascota of mascotas; track mascota.id) {
        <option [value]="mascota.id">{{ mascota.nombre }} · {{ mascota.especie }}</option>
      }
    </select>
  `
})
export class SelectorMascotaComponent {
  @Input({ required: true }) mascotas: Mascota[] = [];
  @Input() selectedId = '';
  @Input() idControl = 'mascotaSelector';
  @Output() selectedIdChange = new EventEmitter<string>();

  notificarSeleccion(evento: Event): void {
    const select = evento.target as HTMLSelectElement;
    this.selectedIdChange.emit(select.value);
  }
}
