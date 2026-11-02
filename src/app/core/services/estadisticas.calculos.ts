import { CATEGORIAS, Categoria } from '../models/categoria.model';
import { FechaLocal, Gasto } from '../models/gasto.model';
import {
    desplazarDias,
    desplazarMeses,
    desplazarSemanas,
    finMes,
    finSemana,
    inicioMes,
    inicioSemana,
} from '../utils/fechas';
import { filtrarGastos } from '../utils/filtros';

/*
 * Cálculos de estadísticas. Funciones puras: los totales se calculan siempre
 * a partir de los gastos existentes y nunca se almacenan (RN-07).
 */

export type TipoPeriodo = 'dia' | 'semana' | 'mes';

export interface RangoPeriodo {
    readonly tipo: TipoPeriodo;
    readonly desde: FechaLocal;
    readonly hasta: FechaLocal;
}

export interface TotalCategoria {
    readonly categoria: Categoria;
    readonly total: number;
    readonly cantidad: number;
    /** Parte del total del período, de 0 a 100. */
    readonly porcentaje: number;
}

export interface ResumenPeriodo {
    readonly rango: RangoPeriodo;
    readonly total: number;
    readonly cantidad: number;
    /** Solo categorías con gastos, de mayor a menor total. */
    readonly porCategoria: readonly TotalCategoria[];
}

export interface Comparacion {
    readonly actual: number;
    readonly anterior: number;
    readonly diferencia: number;
    /** Variación respecto al anterior, en %. Es null si el anterior es 0: no hay base para comparar. */
    readonly porcentaje: number | null;
}

export interface ComparacionPeriodos {
    readonly actual: ResumenPeriodo;
    readonly anterior: ResumenPeriodo;
    readonly comparacion: Comparacion;
}

/** Día, semana (lunes a domingo) o mes al que pertenece la fecha de referencia. */
export function rangoPeriodo(tipo: TipoPeriodo, referencia: FechaLocal): RangoPeriodo {
    switch (tipo) {
        case 'dia':
            return { tipo, desde: referencia, hasta: referencia };
        case 'semana':
            return { tipo, desde: inicioSemana(referencia), hasta: finSemana(referencia) };
        case 'mes':
            return { tipo, desde: inicioMes(referencia), hasta: finMes(referencia) };
    }
}

/** Mueve el período N unidades: -1 es el anterior, 1 el siguiente. */
export function desplazarPeriodo(rango: RangoPeriodo, cantidad: number): RangoPeriodo {
    switch (rango.tipo) {
        case 'dia':
            return rangoPeriodo('dia', desplazarDias(rango.desde, cantidad));
        case 'semana':
            return rangoPeriodo('semana', desplazarSemanas(rango.desde, cantidad));
        case 'mes':
            return rangoPeriodo('mes', desplazarMeses(rango.desde, cantidad));
    }
}

export function sumar(gastos: readonly Gasto[]): number {
    return gastos.reduce((suma, gasto) => suma + gasto.monto, 0);
}

export function totalesPorCategoria(gastos: readonly Gasto[]): TotalCategoria[] {
    const acumulado = new Map<Categoria, { total: number; cantidad: number }>();
    for (const gasto of gastos) {
        const previo = acumulado.get(gasto.categoria) ?? { total: 0, cantidad: 0 };
        acumulado.set(gasto.categoria, { total: previo.total + gasto.monto, cantidad: previo.cantidad + 1 });
    }

    const totalGeneral = sumar(gastos);
    return [...acumulado]
        .map(([categoria, { total, cantidad }]) => ({
            categoria,
            total,
            cantidad,
            porcentaje: totalGeneral === 0 ? 0 : (total / totalGeneral) * 100,
        }))
        .sort(
            (a, b) => b.total - a.total || CATEGORIAS.indexOf(a.categoria) - CATEGORIAS.indexOf(b.categoria),
        );
}

export function resumirPeriodo(gastos: readonly Gasto[], rango: RangoPeriodo): ResumenPeriodo {
    const delPeriodo = filtrarGastos(gastos, { categoria: null, desde: rango.desde, hasta: rango.hasta });
    return {
        rango,
        total: sumar(delPeriodo),
        cantidad: delPeriodo.length,
        porCategoria: totalesPorCategoria(delPeriodo),
    };
}

export function comparar(actual: number, anterior: number): Comparacion {
    const diferencia = actual - anterior;
    return {
        actual,
        anterior,
        diferencia,
        porcentaje: anterior === 0 ? null : (diferencia / anterior) * 100,
    };
}

export function compararPeriodos(gastos: readonly Gasto[], rango: RangoPeriodo): ComparacionPeriodos {
    const actual = resumirPeriodo(gastos, rango);
    const anterior = resumirPeriodo(gastos, desplazarPeriodo(rango, -1));
    return { actual, anterior, comparacion: comparar(actual.total, anterior.total) };
}