import { NOMBRES_CATEGORIA } from '../models/categoria.model';
import { Gasto } from '../models/gasto.model';
import { creadoEnLocal, hoy } from '../utils/fechas';

/** Versión del formato de la copia JSON. Se sube si cambia su estructura (la restauración la usa). */
export const VERSION_EXPORTACION = 1;

export interface CopiaSeguridad {
    readonly app: 'mi-bolsillo';
    readonly esquema: number;
    readonly exportadoEn: string;
    readonly gastos: readonly Gasto[];
}

export interface ArchivoExportado {
    readonly nombre: string;
    readonly tipo: string;
    readonly contenido: string;
}

const ENCABEZADO_CSV = ['Fecha', 'Descripción', 'Categoría', 'Monto (COP)', 'Registrado'];

function ordenarPorFecha(gastos: readonly Gasto[]): Gasto[] {
    return [...gastos].sort((a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : a.id - b.id));
}

export function crearCopiaSeguridad(gastos: readonly Gasto[], ahora: Date): CopiaSeguridad {
    return {
        app: 'mi-bolsillo',
        esquema: VERSION_EXPORTACION,
        exportadoEn: creadoEnLocal(ahora),
        gastos: ordenarPorFecha(gastos),
    };
}

/** Excel interpreta como fórmula un campo que empieza por =, +, -, @ o un tabulador: se antepone un apóstrofo. */
function protegerFormula(texto: string): string {
    return /^[=+\-@\t\r]/.test(texto) ? `'${texto}` : texto;
}

function celda(valor: string): string {
    const texto = protegerFormula(valor);
    return /[;"\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

/** CSV para Excel en es-CO: UTF-8 con BOM, separador ';' y saltos de línea \r\n. */
export function generarCsv(gastos: readonly Gasto[]): string {
    const filas = ordenarPorFecha(gastos).map((gasto) =>
        [gasto.fecha, gasto.descripcion, NOMBRES_CATEGORIA[gasto.categoria], String(gasto.monto), gasto.creadoEn]
            .map(celda)
            .join(';'),
    );
    return `\uFEFF${[ENCABEZADO_CSV.join(';'), ...filas].join('\r\n')}\r\n`;
}

export function archivoJson(gastos: readonly Gasto[], ahora: Date): ArchivoExportado {
    return {
        nombre: `mi-bolsillo-${hoy(ahora)}.json`,
        tipo: 'application/json',
        contenido: JSON.stringify(crearCopiaSeguridad(gastos, ahora), null, 2),
    };
}

export function archivoCsv(gastos: readonly Gasto[], ahora: Date): ArchivoExportado {
    return {
        nombre: `mi-bolsillo-${hoy(ahora)}.csv`,
        tipo: 'text/csv;charset=utf-8',
        contenido: generarCsv(gastos),
    };
}