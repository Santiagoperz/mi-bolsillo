import { Component, input } from '@angular/core';
import { DescripcionComparacion } from '../../periodos/periodo.textos';

/** Píldora con la comparación frente al período anterior. Rojo si se gastó más, verde si menos. */
@Component({
  selector: 'app-comparacion-periodo',
  styleUrl: './comparacion-periodo.scss',
  template: `<p class="comparacion" [attr.data-tendencia]="descripcion().tendencia">{{ descripcion().texto }}</p>`,
})
export class ComparacionPeriodo {
  readonly descripcion = input.required<DescripcionComparacion>();
}