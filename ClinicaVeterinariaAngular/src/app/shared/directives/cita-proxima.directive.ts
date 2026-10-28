import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges, inject } from '@angular/core';

@Directive({ selector: '[citaProxima]', standalone: true })
export class CitaProximaDirective implements OnChanges {
  @Input({ required: true }) citaProxima = '';
  private readonly elemento = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);

  ngOnChanges(_changes: SimpleChanges): void {
    const fechaCita = new Date(this.citaProxima).getTime();
    const ahora = Date.now();
    const dentroDeDosDias = fechaCita >= ahora && fechaCita <= ahora + 48 * 60 * 60 * 1000;
    this.renderer.removeClass(this.elemento.nativeElement, 'cita-proxima');
    if (dentroDeDosDias) {
      this.renderer.addClass(this.elemento.nativeElement, 'cita-proxima');
      this.renderer.setAttribute(this.elemento.nativeElement, 'aria-label', 'Cita próxima dentro de las siguientes 48 horas');
    } else {
      this.renderer.removeAttribute(this.elemento.nativeElement, 'aria-label');
    }
  }
}
