import { Injectable, inject } from '@angular/core';
import { FechaLocal } from '../models/gasto.model';
import {
    ComparacionPeriodos,
    ResumenPeriodo,
    TipoPeriodo,
    compararPeriodos,
    rangoPeriodo,
    resumirPeriodo,
    serieEvolucion,
} from './estadisticas.calculos';
import { GastoService } from './gasto.service';

/**
 * Estadísticas sobre los gastos actuales.
 * Lee el signal de GastoService: usado dentro de un computed, se recalcula solo
 * al registrar, editar o eliminar (RN-09).
 */
@Injectable({ providedIn: 'root' })
export class EstadisticasService {
    private readonly gastos = inject(GastoService);

    resumen(tipo: TipoPeriodo, referencia: FechaLocal): ResumenPeriodo {
        return resumirPeriodo(this.gastos.gastos(), rangoPeriodo(tipo, referencia));
    }

    comparacion(tipo: TipoPeriodo, referencia: FechaLocal): ComparacionPeriodos {
        return compararPeriodos(this.gastos.gastos(), rangoPeriodo(tipo, referencia));
    }
    evolucion(tipo: TipoPeriodo, referencia: FechaLocal, cantidad: number): ResumenPeriodo[] {
        return serieEvolucion(this.gastos.gastos(), tipo, referencia, cantidad);
    }
}