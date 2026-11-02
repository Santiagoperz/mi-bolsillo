import { Pipe, PipeTransform } from '@angular/core';
import { formatearPesos } from '../../core/utils/moneda';

/** Formatea un monto en pesos colombianos: {{ 18000 | pesos }} → $18.000 */
@Pipe({ name: 'pesos' })
export class PesosPipe implements PipeTransform {
    transform(monto: number): string {
        return formatearPesos(monto);
    }
}