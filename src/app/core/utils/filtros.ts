import { Categoria, esCategoria } from '../models/categoria.model';
import { FechaLocal, Gasto } from '../models/gasto.model';
import { esFechaLocal, finMes, finSemana, inicioMes, inicioSemana } from './fechas';

export type Periodo = 'todo' | 'dia' | 'semana' | 'mes' | 'rango';

/** Criterios ya resueltos. Un valor null significa "sin filtrar por esto". */
export interface FiltroGastos {
    readonly categoria: Categoria | null;
    readonly desde: FechaLocal | null;
    readonly hasta: FechaLocal | null;
}

/** Valores tal como vienen de los controles de la pantalla. */
export interface OpcionesFiltro {
    readonly categoria: string;
    readonly periodo: Periodo;
    /** Día de referencia para los períodos de día, semana y mes. */
    readonly referencia: string;
    readonly desde: string;
    readonly hasta: string;
}

/** Aplica todos los criterios a la vez y conserva el orden de la lista recibida. */
export function filtrarGastos(gastos: readonly Gasto[], filtro: FiltroGastos): Gasto[] {
    return gastos.filter(
        (gasto) =>
            (filtro.categoria === null || gasto.categoria === filtro.categoria) &&
            (filtro.desde === null || gasto.fecha >= filtro.desde) &&
            (filtro.hasta === null || gasto.fecha <= filtro.hasta),
    );
}

/** Convierte lo elegido en pantalla en un filtro. Los valores inválidos no filtran. */
export function construirFiltro(opciones: OpcionesFiltro): FiltroGastos {
    const categoria = esCategoria(opciones.categoria) ? opciones.categoria : null;
    const sinFechas: FiltroGastos = { categoria, desde: null, hasta: null };
    const { referencia } = opciones;

    switch (opciones.periodo) {
        case 'dia':
            return esFechaLocal(referencia) ? { categoria, desde: referencia, hasta: referencia } : sinFechas;
        case 'semana':
            return esFechaLocal(referencia)
                ? { categoria, desde: inicioSemana(referencia), hasta: finSemana(referencia) }
                : sinFechas;
        case 'mes':
            return esFechaLocal(referencia)
                ? { categoria, desde: inicioMes(referencia), hasta: finMes(referencia) }
                : sinFechas;
        case 'rango': {
            const desde = esFechaLocal(opciones.desde) ? opciones.desde : null;
            const hasta = esFechaLocal(opciones.hasta) ? opciones.hasta : null;
            if (desde !== null && hasta !== null && desde > hasta) {
                return { categoria, desde: hasta, hasta: desde };
            }
            return { categoria, desde, hasta };
        }
        default:
            return sinFechas;
    }
}