import { Component, input } from '@angular/core';
import { NOMBRES_CATEGORIA } from '../../../core/models/categoria.model';
import { TotalCategoria } from '../../../core/services/estadisticas.calculos';
import { formatearPorcentaje } from '../../periodos/periodo.textos';
import { PesosPipe } from '../../pipes/pesos.pipe';

/** Total por categoría con una barra proporcional a su parte del período. */
@Component({
    imports: [PesosPipe],
    selector: 'app-desglose-categorias',
    styleUrl: './desglose-categorias.scss',
    templateUrl: './desglose-categorias.html',
})
export class DesgloseCategorias {
    readonly items = input.required<readonly TotalCategoria[]>();

    protected readonly nombres = NOMBRES_CATEGORIA;
    protected readonly formatearPorcentaje = formatearPorcentaje;
}