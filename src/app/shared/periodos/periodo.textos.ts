import { FechaLocal } from '../../core/models/gasto.model';
import { Comparacion, RangoPeriodo, TipoPeriodo } from '../../core/services/estadisticas.calculos';
import {
    MESES_CORTOS,
    desplazarDias,
    desplazarSemanas,
    formatearFechaCorta,
    parsearFecha,
} from '../../core/utils/fechas';
import { formatearPesos } from '../../core/utils/moneda';

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'] as const;
const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
] as const;

const PERIODO_ANTERIOR: Readonly<Record<TipoPeriodo, string>> = {
    dia: 'el día anterior',
    semana: 'la semana anterior',
    mes: 'el mes anterior',
};

export interface EtiquetaPeriodo {
    readonly titulo: string;
    readonly subtitulo: string | null;
}

/** sube: se gastó más que antes. baja: menos. sin-base: el período anterior no tuvo gastos. */
export type Tendencia = 'sube' | 'baja' | 'igual' | 'sin-base';

export interface DescripcionComparacion {
    readonly texto: string;
    readonly tendencia: Tendencia;
}

export function contieneFecha(rango: RangoPeriodo, fecha: FechaLocal): boolean {
    return rango.desde <= fecha && fecha <= rango.hasta;
}

function capitalizar(texto: string): string {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** Por ejemplo 'lunes, 2 nov 2026'. */
function formatearDia(fecha: FechaLocal): string {
    return `${DIAS[parsearFecha(fecha).getDay()]}, ${formatearFechaCorta(fecha)}`;
}

export function etiquetaPeriodo(rango: RangoPeriodo, hoy: FechaLocal): EtiquetaPeriodo {
    switch (rango.tipo) {
        case 'dia':
            if (rango.desde === hoy) {
                return { titulo: 'Hoy', subtitulo: formatearDia(rango.desde) };
            }
            if (rango.desde === desplazarDias(hoy, -1)) {
                return { titulo: 'Ayer', subtitulo: formatearDia(rango.desde) };
            }
            return { titulo: capitalizar(formatearDia(rango.desde)), subtitulo: null };

        case 'semana': {
            const fechas = `${formatearFechaCorta(rango.desde)} – ${formatearFechaCorta(rango.hasta)}`;
            if (contieneFecha(rango, hoy)) {
                return { titulo: 'Esta semana', subtitulo: fechas };
            }
            if (contieneFecha(rango, desplazarSemanas(hoy, -1))) {
                return { titulo: 'Semana pasada', subtitulo: fechas };
            }
            return { titulo: fechas, subtitulo: null };
        }

        case 'mes': {
            const inicio = parsearFecha(rango.desde);
            const nombre = `${MESES[inicio.getMonth()]} ${inicio.getFullYear()}`;
            return contieneFecha(rango, hoy)
                ? { titulo: 'Este mes', subtitulo: nombre }
                : { titulo: nombre, subtitulo: null };
        }
    }
}

/** Porcentaje redondeado sin decimales. Un valor pequeño pero no nulo se muestra como '<1 %'. */
export function formatearPorcentaje(valor: number): string {
    const redondeado = Math.round(valor);
    return valor > 0 && redondeado === 0 ? '<1 %' : `${redondeado} %`;
}

/** Comparación en palabras. Devuelve null si ninguno de los dos períodos tuvo gastos. */
export function describirComparacion(
    comparacion: Comparacion,
    tipo: TipoPeriodo,
): DescripcionComparacion | null {
    const anterior = PERIODO_ANTERIOR[tipo];

    if (comparacion.actual === 0 && comparacion.anterior === 0) {
        return null;
    }
    if (comparacion.porcentaje === null) {
        return { texto: `Sin gastos ${anterior}`, tendencia: 'sin-base' };
    }
    if (comparacion.diferencia === 0) {
        return { texto: `Igual que ${anterior}`, tendencia: 'igual' };
    }

    const porcentaje = formatearPorcentaje(Math.abs(comparacion.porcentaje));
    return comparacion.diferencia > 0
        ? {
            texto: `${formatearPesos(comparacion.diferencia)} más que ${anterior} (+${porcentaje})`,
            tendencia: 'sube',
        }
        : {
            texto: `${formatearPesos(-comparacion.diferencia)} menos que ${anterior} (−${porcentaje})`,
            tendencia: 'baja',
        };
}

/** Etiqueta breve para gráficas: 'oct' para meses, '26 oct' para semanas y días. */
export function etiquetaCorta(rango: RangoPeriodo): string {
    const inicio = parsearFecha(rango.desde);
    const mes = MESES_CORTOS[inicio.getMonth()];
    return rango.tipo === 'mes' ? mes : `${inicio.getDate()} ${mes}`;
}